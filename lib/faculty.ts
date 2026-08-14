import { embedText } from "./embed.ts"
import { FACULTY_ROWS } from "./faculty-data.ts"
import { filterFaculty, groupByProfessor, rankFaculty, type FacultyHit, type FacultyRecord } from "./search.ts"

let cached: FacultyRecord[] | null = null

export function facultyIndex(): FacultyRecord[] {
  if (!cached) {
    cached = FACULTY_ROWS.map((row) => ({
      ...row,
      vector: embedText(row.Interest),
    }))
  }
  return cached
}

export function filterOptions(): { universities: string[]; departments: string[] } {
  const universities = new Set<string>()
  const departments = new Set<string>()
  for (const row of FACULTY_ROWS) {
    universities.add(row.University)
    departments.add(row.Department)
  }
  return {
    universities: [...universities].sort(),
    departments: [...departments].sort(),
  }
}

export function searchFaculty(
  query: string,
  opts: { topK?: number; university?: string; department?: string } = {},
): FacultyHit[] {
  const fetchK = opts.university || opts.department ? undefined : (opts.topK ?? 20) * 5
  const ranked = rankFaculty(embedText(query), facultyIndex(), {
    topK: fetchK,
    university: opts.university,
    department: opts.department,
  })
  const grouped = groupByProfessor(filterFaculty(ranked, opts))
  return opts.topK != null ? grouped.slice(0, opts.topK) : grouped
}
