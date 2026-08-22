import { neon } from "@neondatabase/serverless"
import { groupByProfessor, type FacultyHit } from "../search.ts"
import type { FacultyFilters, FacultySearchOpts, FacultyStats, FacultyStore } from "./types.ts"

export function formatVector(values: number[]): string {
  return `[${values.join(",")}]`
}

type FacultySqlRow = {
  professor: string
  university: string
  department: string
  interest: string
  personal_website: string
  similarity: number | string
}

export class NeonFacultyStore implements FacultyStore {
  private readonly sql: ReturnType<typeof neon>

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl)
  }

  async searchByVector(queryVec: number[], opts: FacultySearchOpts = {}): Promise<FacultyHit[]> {
    const fetchK = opts.university || opts.department ? 500 : (opts.topK ?? 20) * 5
    const embedding = formatVector(queryVec)
    const university = opts.university?.trim() || null
    const department = opts.department?.trim() || null

    const rows = (await this.sql`
      SELECT
        professor,
        university,
        department,
        interest,
        personal_website,
        1 - (embedding <=> ${embedding}::vector) AS similarity
      FROM faculty
      WHERE (${university}::text IS NULL OR LOWER(university) = LOWER(${university}))
        AND (${department}::text IS NULL OR LOWER(department) = LOWER(${department}))
      ORDER BY embedding <=> ${embedding}::vector
      LIMIT ${fetchK}
    `) as FacultySqlRow[]

    const hits: FacultyHit[] = rows.map((row) => ({
      Professor: row.professor,
      University: row.university,
      Department: row.department,
      Interest: row.interest,
      "Personal Website": row.personal_website,
      Similarity: Number(row.similarity),
    }))
    const grouped = groupByProfessor(hits)
    return opts.topK != null ? grouped.slice(0, opts.topK) : grouped
  }

  async filters(): Promise<FacultyFilters> {
    const rows = (await this.sql`
      SELECT
        ARRAY(SELECT DISTINCT university FROM faculty ORDER BY 1) AS universities,
        ARRAY(SELECT DISTINCT department FROM faculty ORDER BY 1) AS departments
    `) as { universities: string[]; departments: string[] }[]
    return {
      universities: rows[0]?.universities ?? [],
      departments: rows[0]?.departments ?? [],
    }
  }

  async stats(): Promise<FacultyStats> {
    const rows = (await this.sql`
      SELECT
        COUNT(DISTINCT professor || '|' || university || '|' || department || '|' || personal_website)::int AS professors,
        COUNT(DISTINCT department)::int AS departments,
        COUNT(DISTINCT university)::int AS universities
      FROM faculty
    `) as FacultyStats[]
    return rows[0] ?? { professors: 0, departments: 0, universities: 0 }
  }
}
