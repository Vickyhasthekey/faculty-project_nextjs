import { NextResponse } from "next/server"
import { fetchBackend } from "@/lib/fetchBackend"

export async function GET() {
  try {
    const response = await fetchBackend("/filters")
    if (response.status === 503) {
      return NextResponse.json(
        { error: "Service starting", warming_up: true, universities: [], departments: [] },
        { status: 503 },
      )
    }
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Filters API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch filters", universities: [], departments: [] },
      { status: 500 },
    )
  }
}
