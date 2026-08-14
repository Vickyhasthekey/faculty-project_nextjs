import { NextRequest, NextResponse } from "next/server"
import { searchFaculty } from "@/lib/faculty"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const query = String(body.query ?? "").trim()
    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 })
    }
    const results = searchFaculty(query, {
      topK: body.top_k ?? 20,
      university: body.university || undefined,
      department: body.department || undefined,
    })
    return NextResponse.json({ query, results })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 },
    )
  }
}
