import { NextRequest } from "next/server"
import { streamGeminiChat } from "@/lib/chat"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const message = String(body.message ?? "").trim()
  if (!message) {
    return new Response(JSON.stringify({ error: "message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const stream = await streamGeminiChat(message, body.history)
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
