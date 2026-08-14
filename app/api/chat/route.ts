import { NextRequest, NextResponse } from "next/server"
import { fetchBackend } from "@/lib/fetchBackend"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const upstream = await fetchBackend("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (upstream.status === 503) {
    return NextResponse.json(
      { error: "Service starting", warming_up: true },
      { status: 503 },
    )
  }

  if (!upstream.body) {
    return NextResponse.json({ error: "No response body" }, { status: 502 })
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
