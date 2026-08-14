export type FacultyHit = {
  Professor: string
  University: string
  Department: string
  Interest: string
  Similarity: number
  "Personal Website": string
  Interests?: string[]
}

export type FacultyRecord = {
  Professor: string
  University: string
  Department: string
  Interest: string
  "Personal Website": string
  vector: number[]
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let na = 0
  let nb = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb)
  if (denom === 0) return 0
  return dot / denom
}

export function filterFaculty<T extends { University: string; Department: string }>(
  rows: T[],
  opts: { university?: string; department?: string } = {},
): T[] {
  const university = opts.university?.trim().toLowerCase()
  const department = opts.department?.trim().toLowerCase()
  return rows.filter((row) => {
    if (university && row.University.toLowerCase() !== university) return false
    if (department && row.Department.toLowerCase() !== department) return false
    return true
  })
}

export function rankFaculty(
  queryVec: number[],
  rows: FacultyRecord[],
  opts: { topK?: number; university?: string; department?: string } = {},
): FacultyHit[] {
  const filtered = filterFaculty(rows, opts)
  const ranked = filtered
    .map((row) => ({
      Professor: row.Professor,
      University: row.University,
      Department: row.Department,
      Interest: row.Interest,
      "Personal Website": row["Personal Website"],
      Similarity: cosineSimilarity(queryVec, row.vector),
    }))
    .sort((a, b) => b.Similarity - a.Similarity)
  return opts.topK != null ? ranked.slice(0, opts.topK) : ranked
}

export function groupByProfessor(rows: FacultyHit[]): FacultyHit[] {
  const order: string[] = []
  const groups = new Map<string, FacultyHit>()
  for (const row of [...rows].sort((a, b) => b.Similarity - a.Similarity)) {
    const key = `${row.Professor}|${row.University}|${row.Department}|${row["Personal Website"]}`
    const existing = groups.get(key)
    if (!existing) {
      groups.set(key, { ...row, Interests: [row.Interest] })
      order.push(key)
    } else if (!existing.Interests!.includes(row.Interest)) {
      existing.Interests!.push(row.Interest)
    }
  }
  return order.map((key) => groups.get(key)!)
}
