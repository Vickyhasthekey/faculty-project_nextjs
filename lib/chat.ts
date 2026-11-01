import { searchFaculty } from "./faculty.ts"
import type { FacultyHit } from "./search"

const MODEL = "gemini-3.5-flash-lite"

const SYSTEM_PROMPT =
  "You help students find faculty whose research matches their interests. " +
  "Recommend only professors in the faculty matches. " +
  "For each professor you name, mention their department and include their personal website as a markdown link. " +
  "Write ordinary sentences. Do not use asterisks, bullets, or bold markers. " +
  "If there are no matches, say you don't have a professor for that topic. " +
  "Do not invent professors or websites. " +
  "For small talk with no research question, answer briefly and do not list faculty."

const FOLLOW_UP =
  /^(which|what about|tell me more|more about|compare them|how about|and |can you)\b|\b(those|them|these|that one|the first|the second|the last)\b/i

const GREETING =
  /^(hi|hello|hey|thanks|thank you|yo|help|ok|okay|good morning|good afternoon|what can you do\??|who are you\??|can you help\??|help me|find( me)? a professor|i (need|want) a professor)[.!?]?$/i

const RESEARCH_AREA =
  /\b(work(?:s|ing)? on|stud(?:y|ies|ying)|research(?:es|ing)?|interested in|specializ(?:e|es|ing) in|compare\b.+\bprofessors?)\b/i

/** True when this message, or the topic it follows up on, names a research area. */
export function shouldShowFaculty(
  message: string,
  history: ChatTurn[] | undefined,
  priorHits: Pick<FacultyHit, "Professor">[] | undefined,
): boolean {
  const named = (priorHits ?? []).some((hit) => {
    const name = hit.Professor?.trim()
    return name && message.toLowerCase().includes(name.toLowerCase())
  })
  if (named) return true
  if (messageHasResearchArea(message)) return true
  const topic = (history ?? []).find((turn) => turn.role === "user")?.content?.trim()
  return Boolean(topic && FOLLOW_UP.test(message) && messageHasResearchArea(topic))
}

function messageHasResearchArea(message: string): boolean {
  const text = message.trim()
  if (!text || GREETING.test(text)) return false
  if (RESEARCH_AREA.test(text)) return true
  const words = text.split(/\s+/)
  return words.length <= 6 && !/[?]/.test(text) && !/^(what|how|why|who|can|could|please|tell|find|help|i)\b/i.test(text)
}

export function facultyContext(hits: FacultyHit[], waitingForTopic = false): string {
  if (waitingForTopic) {
    return "The student has not named a research area yet. Ask which subject they care about. Do not list professors."
  }
  if (hits.length === 0) return "No faculty matches."
  return hits
    .map((hit) => {
      const interests = hit.Interests?.length ? hit.Interests.join("; ") : hit.Interest
      const website = hit["Personal Website"]?.trim() || "none"
      return `${hit.Professor} — ${hit.University}, ${hit.Department}: ${interests}. Website: ${website}`
    })
    .join("\n")
}

/** Follow-ups keep the original topic. A named professor is searched directly. */
export function searchQueryForChat(
  message: string,
  history: ChatTurn[] | undefined,
  priorHits: Pick<FacultyHit, "Professor">[] | undefined,
): string {
  const named = (priorHits ?? []).find((hit) => {
    const name = hit.Professor?.trim()
    return name && message.toLowerCase().includes(name.toLowerCase())
  })
  if (named) return named.Professor
  const topic = (history ?? []).find((turn) => turn.role === "user")?.content?.trim()
  if (topic && FOLLOW_UP.test(message)) return `${topic}. ${message}`
  return message
}

type ChatTurn = { role: string; content: string }

export function geminiContents(
  message: string,
  history: ChatTurn[] | undefined,
  hits: FacultyHit[],
  waitingForTopic = false,
) {
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = []
  for (const turn of history ?? []) {
    contents.push({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    })
  }
  const context = facultyContext(hits, waitingForTopic)
  contents.push({
    role: "user",
    parts: [
      {
        text: `${message}\n\nFaculty matches:\n${context}`,
      },
    ],
  })
  return contents
}

function emitSse(buffer: string, onData: (raw: string) => void): string {
  const parts = buffer.split("\n\n")
  const rest = parts.pop() ?? ""
  for (const part of parts) {
    for (const line of part.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed.startsWith("data:")) continue
      const raw = trimmed.slice(5).trim()
      if (!raw || raw === "[DONE]") continue
      try {
        onData(raw)
      } catch {
        // ignore a malformed chunk and keep reading
      }
    }
  }
  return rest
}

function extractDelta(payload: unknown): string {
  if (!payload || typeof payload !== "object") return ""
  const candidates = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates
  const parts = candidates?.[0]?.content?.parts ?? []
  return parts.map((part) => (typeof part.text === "string" ? part.text : "")).join("")
}

export async function streamGeminiChat(
  message: string,
  history: ChatTurn[] | undefined,
  priorHits?: Pick<FacultyHit, "Professor">[],
): Promise<ReadableStream<Uint8Array>> {
  const showFaculty = shouldShowFaculty(message, history, priorHits)
  const hits = showFaculty
    ? await searchFaculty(searchQueryForChat(message, history, priorHits), { topK: 4 })
    : []
  const apiKey = process.env.GEMINI_API_KEY
  const encoder = new TextEncoder()
  const send = (controller: ReadableStreamDefaultController<Uint8Array>, payload: unknown) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
  }

  const response = apiKey
    ? await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: geminiContents(message, history, hits, !showFaculty),
          }),
        },
      )
    : null

  return new ReadableStream({
    async start(controller) {
      send(controller, { hits })
      if (!apiKey) {
        send(controller, { error: "Missing GEMINI_API_KEY" })
        controller.close()
        return
      }
      if (!response || !response.ok || !response.body) {
        const detail = response ? await response.text().catch(() => "") : ""
        send(controller, { error: detail || `Gemini HTTP ${response?.status ?? 0}` })
        controller.close()
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          buffer = emitSse(buffer, (raw) => {
            const delta = extractDelta(JSON.parse(raw))
            if (delta) send(controller, { delta })
          })
        }
        buffer += decoder.decode()
        emitSse(`${buffer}\n\n`, (raw) => {
          const delta = extractDelta(JSON.parse(raw))
          if (delta) send(controller, { delta })
        })
        send(controller, { done: true })
      } catch (error) {
        send(controller, { error: String(error) })
      } finally {
        controller.close()
      }
    },
  })
}
