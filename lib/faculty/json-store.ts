import { FACULTY_ROWS } from "../faculty-data.ts"
import facultyVectors from "../faculty-vectors.json" with { type: "json" }
import {
  filterFaculty,
  groupByProfessor,
  rankFaculty,
  type FacultyHit,
  type FacultyRecord,
} from "../search.ts"
import type { FacultyFilters, FacultySearchOpts, FacultyStats, FacultyStore } from "./types.ts"

function professorKey(row: { Professor: string; University: string; Department: string; "Personal Website": string }) {
  return `${row.Professor}|${row.University}|${row.Department}|${row["Personal Website"]}`
}

export class JsonFacultyStore implements FacultyStore {
  private readonly records: FacultyRecord[]

  constructor(records: FacultyRecord[]) {
    this.records = records
  }

  async searchByVector(queryVec: number[], opts: FacultySearchOpts = {}): Promise<FacultyHit[]> {
    const fetchK = opts.university || opts.department ? undefined : (opts.topK ?? 20) * 5
    const ranked = rankFaculty(queryVec, this.records, {
      topK: fetchK,
      university: opts.university,
      department: opts.department,
    })
    const grouped = groupByProfessor(filterFaculty(ranked, opts))
    return opts.topK != null ? grouped.slice(0, opts.topK) : grouped
  }

  async filters(): Promise<FacultyFilters> {
    const universities = new Set<string>()
    const departments = new Set<string>()
    for (const row of this.records) {
      universities.add(row.University)
      departments.add(row.Department)
    }
    return {
      universities: [...universities].sort(),
      departments: [...departments].sort(),
    }
  }

  async stats(): Promise<FacultyStats> {
    const professors = new Set<string>()
    const departments = new Set<string>()
    const universities = new Set<string>()
    for (const row of this.records) {
      professors.add(professorKey(row))
      departments.add(row.Department)
      universities.add(row.University)
    }
    return {
      professors: professors.size,
      departments: departments.size,
      universities: universities.size,
    }
  }
}

export function loadJsonFacultyRecords(): FacultyRecord[] {
  const vectors = facultyVectors as number[][]
  if (vectors.length !== FACULTY_ROWS.length) {
    throw new Error(
      `faculty-vectors.json has ${vectors.length} rows but faculty-data.json has ${FACULTY_ROWS.length}. Re-run npm run embed-faculty.`,
    )
  }
  return FACULTY_ROWS.map((row, index) => ({
    ...row,
    vector: vectors[index],
  }))
}

export function createJsonFacultyStore(): JsonFacultyStore {
  return new JsonFacultyStore(loadJsonFacultyRecords())
}
