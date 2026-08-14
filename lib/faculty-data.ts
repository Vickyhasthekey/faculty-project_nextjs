import facultyJson from "./faculty-data.json" with { type: "json" }

export type FacultyRow = {
  Professor: string
  University: string
  Department: string
  Interest: string
  "Personal Website": string
}

/** Live UCLA + CWRU dump. NUS / nus.edu rows are excluded (none were present in the source). */
export const FACULTY_ROWS: FacultyRow[] = facultyJson as FacultyRow[]
