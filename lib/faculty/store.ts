import { createJsonFacultyStore } from "./json-store.ts"
import { NeonFacultyStore } from "./neon-store.ts"
import type { FacultyStore } from "./types.ts"

let store: FacultyStore | null = null

export function createFacultyStore(
  env: { DATABASE_URL?: string } = { DATABASE_URL: process.env.DATABASE_URL },
): FacultyStore {
  const databaseUrl = env.DATABASE_URL?.trim()
  if (databaseUrl) return new NeonFacultyStore(databaseUrl)
  return createJsonFacultyStore()
}

/** Neon when DATABASE_URL is set (live rows). JSON bundle otherwise. */
export function getFacultyStore(): FacultyStore {
  if (!store) store = createFacultyStore()
  return store
}

export function setFacultyStore(next: FacultyStore | null) {
  store = next
}
