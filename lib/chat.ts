import { searchFaculty } from "./faculty.ts"
import type { FacultyHit } from "./search"

const MODEL = "gemini-2.5-flash-lite"

const SYSTEM_PROMPT =
  "You are a helpful assistant that helps users discover faculty members and their research. " +
  "When the user asks about researchers, topics, departments, or universities, ground your answer in the faculty matches provided. " +
  "Cite the professor's name, university, and relevant research interest. " +
  "For pure small talk, answer directly and ignore the faculty list."

export function facultyContext(hits: FacultyHit[]): string {
  if (hits.length === 0) return "No faculty matches."
  return hits
    .map((hit) => {
      const interests = hit.Interests?.length ? hit.Interests.join("; ") : hit.Interest
      return `${hit.Professor} — ${hit.University}, ${hit.Department}: ${interests}`
    })
    .join("\n")
}

type ChatTurn = { role: string; content: string }

export function geminiContents(message: string, history: ChatTurn[] | undefined, hits: FacultyHit[]) {
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = []
  for (const turn of history ?? []) {
    contents.push({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    })
  }
  const context = facultyContext(hits)
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

function extractDelta(payload: unknown): string {
  if (!payload || typeof payload !== "object") return ""
  const candidates = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates
  const text = candidates?.[0]?.content?.parts?.[0]?.text
  return typeof text === "string" ? text : ""
}

export async function streamGeminiChat(
  message: string,
  history: ChatTurn[] | undefined,
): Promise<ReadableStream<Uint8Array>> {
  const hits = searchFaculty(message, { topK: 8 })
  const apiKey = process.env.GEMINI_API_KEY
  const encoder = new TextEncoder()

  if (!apiKey) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Missing GEMINI_API_KEY" })}\n\n`))
        controller.close()
      },
    })
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: geminiContents(message, history, hits),
      }),
    },
  )

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "")
    return new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: detail || `Gemini HTTP ${response.status}` })}\n\n`),
        )
        controller.close()
      },
    })
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream({
    async start(controller) {
      let buffer = ""
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split("\n\n")
          buffer = parts.pop() ?? ""
          for (const part of parts) {
            const line = part.trim()
            if (!line.startsWith("data:")) continue
            const raw = line.slice(5).trim()
            if (!raw || raw === "[DONE]") continue
            try {
              const delta = extractDelta(JSON.parse(raw))
              if (delta) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`))
              }
            } catch {
              // ignore malformed SSE chunks
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })
}
