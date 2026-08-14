import { NextResponse } from "next/server"
import { filterOptions } from "@/lib/faculty"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json(filterOptions())
}
