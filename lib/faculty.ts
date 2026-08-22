import { embedText } from "./embed.ts"
import { getFacultyStore } from "./faculty/store.ts"

export type { FacultyHit } from "./search.ts"
export type { FacultyFilters, FacultySearchOpts, FacultyStats, FacultyStore } from "./faculty/types.ts"
export { getFacultyStore } from "./faculty/store.ts"

export async function filterOptions() {
  return getFacultyStore().filters()
}

export async function facultyStats() {
  return getFacultyStore().stats()
}

export async function searchFaculty(
  query: string,
  opts: { topK?: number; university?: string; department?: string } = {},
) {
  return getFacultyStore().searchByVector(await embedText(query), opts)
}
