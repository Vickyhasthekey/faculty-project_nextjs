import { strict as assert } from "node:assert"
import { test } from "node:test"

import { facultyContext } from "./chat.ts"
import { searchFaculty, filterOptions } from "./faculty.ts"

test("searchFaculty returns unique professors for computer vision", async () => {
  const hits = await searchFaculty("computer vision", { topK: 10 })
  const names = hits.map((hit) => hit.Professor)
  assert.equal(new Set(names).size, names.length)
  assert.ok(names.includes("Bolei Zhou"))
})

test("searchFaculty finds computer-vision faculty for image recognition", async () => {
  const hits = await searchFaculty("image recognition", { topK: 10 })
  const names = hits.map((hit) => hit.Professor)
  assert.ok(
    names.includes("Bolei Zhou") ||
      names.includes("Stefano Soatto") ||
      names.includes("Demetri Terzopoulos"),
  )
})

test("searchFaculty university filter only returns UCLA", async () => {
  const hits = await searchFaculty("computer vision", { university: "UCLA", topK: 10 })
  assert.ok(hits.length > 0)
  assert.ok(hits.every((hit) => hit.University === "UCLA"))
})

test("facultyContext lists professor names", async () => {
  const text = facultyContext(await searchFaculty("machine learning", { topK: 3 }))
  assert.match(text, /Bolei Zhou|Machine Learning|UCLA|CWRU/)
})

test("bundled faculty list includes UCLA and CWRU, but not NUS", async () => {
  const { universities } = await filterOptions()
  assert.ok(universities.includes("UCLA"))
  assert.ok(universities.includes("CWRU"))
  assert.ok(!universities.some((u) => /NUS|National University of Singapore/i.test(u)))
})
