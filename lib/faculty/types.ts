import type { FacultyHit, FacultyRecord } from "../search.ts"

export type FacultySearchOpts = {
  topK?: number
  university?: string
  department?: string
}

export type FacultyFilters = {
  universities: string[]
  departments: string[]
}

export type FacultyStats = {
  professors: number
  departments: number
  universities: number
}

export type FacultyStore = {
  searchByVector(queryVec: number[], opts?: FacultySearchOpts): Promise<FacultyHit[]>
  filters(): Promise<FacultyFilters>
  stats(): Promise<FacultyStats>
}
