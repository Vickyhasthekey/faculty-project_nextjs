import { strict as assert } from "node:assert"
import { test } from "node:test"

import {
  cosineSimilarity,
  filterFaculty,
  groupByProfessor,
  rankFaculty,
} from "./search.ts"

test("cosineSimilarity is 1 for the same L2-normalized vector", () => {
  const a = [0.6, 0.8]
  assert.equal(cosineSimilarity(a, a), 1)
})

test("rankFaculty returns the closer interest first", () => {
  const rows = [
    {
      Professor: "Ada Lovelace",
      University: "UCLA",
      Department: "Engineering",
      Interest: "Computer Vision",
      "Personal Website": "https://example.edu/ada",
      vector: [1, 0],
    },
    {
      Professor: "John Nash",
      University: "Princeton",
      Department: "Economics",
      Interest: "Game Theory",
      "Personal Website": "https://example.edu/nash",
      vector: [0, 1],
    },
  ]
  const ranked = rankFaculty([0.9, 0.1], rows, { topK: 2 })
  assert.equal(ranked[0].Professor, "Ada Lovelace")
  assert.ok(ranked[0].Similarity > ranked[1].Similarity)
})

test("groupByProfessor keeps one row and collects interests", () => {
  const grouped = groupByProfessor([
    {
      Professor: "Ada Lovelace",
      University: "UCLA",
      Department: "Engineering",
      Interest: "Computer Vision",
      Similarity: 0.91,
      "Personal Website": "https://example.edu/ada",
    },
    {
      Professor: "Ada Lovelace",
      University: "UCLA",
      Department: "Engineering",
      Interest: "Machine Learning",
      Similarity: 0.74,
      "Personal Website": "https://example.edu/ada",
    },
  ])
  assert.equal(grouped.length, 1)
  assert.equal(grouped[0].Similarity, 0.91)
  assert.deepEqual(grouped[0].Interests, ["Computer Vision", "Machine Learning"])
})

test("filterFaculty is case-insensitive on university and department", () => {
  const rows = [
    {
      Professor: "Ada Lovelace",
      University: "UCLA",
      Department: "Engineering",
      Interest: "Computer Vision",
      Similarity: 0.9,
      "Personal Website": "https://example.edu/ada",
    },
    {
      Professor: "John Nash",
      University: "Princeton",
      Department: "Economics",
      Interest: "Game Theory",
      Similarity: 0.8,
      "Personal Website": "https://example.edu/nash",
    },
  ]
  const filtered = filterFaculty(rows, { university: "ucla", department: "engineering" })
  assert.deepEqual(filtered.map((r) => r.Professor), ["Ada Lovelace"])
})
