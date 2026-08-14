import { strict as assert } from "node:assert"
import { test } from "node:test"

import { facultyContext } from "./chat.ts"
import { FACULTY_ROWS } from "./faculty-data.ts"
import { searchFaculty } from "./faculty.ts"

test("searchFaculty returns unique professors for computer vision", () => {
  const hits = searchFaculty("computer vision", { topK: 10 })
  const names = hits.map((hit) => hit.Professor)
  assert.equal(new Set(names).size, names.length)
  assert.ok(names.includes("Bolei Zhou"))
})

test("searchFaculty university filter only returns UCLA", () => {
  const hits = searchFaculty("computer vision", { university: "UCLA", topK: 10 })
  assert.ok(hits.length > 0)
  assert.ok(hits.every((hit) => hit.University === "UCLA"))
})

test("facultyContext lists professor names", () => {
  const text = facultyContext(searchFaculty("machine learning", { topK: 3 }))
  assert.match(text, /Bolei Zhou|Machine Learning|UCLA|CWRU/)
})

test("bundled faculty list includes UCLA and CWRU, but not NUS", () => {
  const unis = new Set(FACULTY_ROWS.map((row) => row.University))
  assert.ok(unis.has("UCLA"))
  assert.ok(unis.has("CWRU"))
  assert.ok(![...unis].some((u) => /NUS|National University of Singapore/i.test(u)))
})
