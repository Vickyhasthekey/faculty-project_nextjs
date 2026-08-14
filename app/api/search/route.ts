import { NextRequest, NextResponse } from "next/server"
import { fetchBackend } from "@/lib/fetchBackend"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await fetchBackend("/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (response.status === 503) {
      return NextResponse.json(
        { error: "Service starting", warming_up: true },
        { status: 503 },
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 },
    )
  }
}
