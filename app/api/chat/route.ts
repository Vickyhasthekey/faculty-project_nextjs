import { NextRequest } from "next/server"
import { streamGeminiChat } from "@/lib/chat"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const body = await request.json()
  const message = String(body.message ?? "").trim()
  if (!message) {
    return new Response(JSON.stringify({ error: "message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const priorHits = Array.isArray(body.priorHits)
    ? body.priorHits.filter(
        (hit: { Professor?: unknown }) => hit && typeof hit.Professor === "string",
      )
    : undefined
  try {
    const stream = await streamGeminiChat(message, body.history, priorHits)
    return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to search faculty" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
