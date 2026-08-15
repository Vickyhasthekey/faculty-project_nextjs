import { strict as assert } from "node:assert"
import { test } from "node:test"

import { JsonFacultyStore } from "./faculty/json-store.ts"
import type { FacultyRecord } from "./search.ts"

const rows: FacultyRecord[] = [
  {
    Professor: "Ada Lovelace",
    University: "UCLA",
    Department: "Engineering",
    Interest: "Computer Vision",
    "Personal Website": "https://example.edu/ada",
    vector: [1, 0],
  },
  {
    Professor: "Ada Lovelace",
    University: "UCLA",
    Department: "Engineering",
    Interest: "Machine Learning",
    "Personal Website": "https://example.edu/ada",
    vector: [0.8, 0.2],
  },
  {
    Professor: "John Nash",
    University: "CWRU",
    Department: "Economics",
    Interest: "Game Theory",
    "Personal Website": "https://example.edu/nash",
    vector: [0, 1],
  },
]

test("searchByVector returns the closer professor first", async () => {
  const store = new JsonFacultyStore(rows)
  const hits = await store.searchByVector([0.99, 0.01], { topK: 2 })
  assert.equal(hits[0].Professor, "Ada Lovelace")
  assert.ok(hits[0].Similarity > hits[1].Similarity)
})

test("searchByVector groups one professor and keeps both interests", async () => {
  const store = new JsonFacultyStore(rows)
  const hits = await store.searchByVector([1, 0], { topK: 5 })
  const ada = hits.find((hit) => hit.Professor === "Ada Lovelace")
  assert.ok(ada)
  assert.deepEqual(ada?.Interests, ["Computer Vision", "Machine Learning"])
})

test("searchByVector university filter only returns UCLA", async () => {
  const store = new JsonFacultyStore(rows)
  const hits = await store.searchByVector([0.5, 0.5], { university: "UCLA", topK: 10 })
  assert.ok(hits.length > 0)
  assert.ok(hits.every((hit) => hit.University === "UCLA"))
})

test("filters and stats come from the store, not the page", async () => {
  const store = new JsonFacultyStore(rows)
  const filters = await store.filters()
  const stats = await store.stats()
  assert.deepEqual(filters.universities, ["CWRU", "UCLA"])
  assert.deepEqual(filters.departments, ["Economics", "Engineering"])
  assert.equal(stats.professors, 2)
  assert.equal(stats.departments, 2)
  assert.equal(stats.universities, 2)
})

test("createFacultyStore uses Neon when DATABASE_URL is set", async () => {
  const { createFacultyStore } = await import("./faculty/store.ts")
  const { NeonFacultyStore } = await import("./faculty/neon-store.ts")
  const store = createFacultyStore({ DATABASE_URL: "postgresql://user:pass@ep-example/neondb" })
  assert.ok(store instanceof NeonFacultyStore)
})

test("createFacultyStore uses JSON when DATABASE_URL is missing", async () => {
  const { createFacultyStore } = await import("./faculty/store.ts")
  const { JsonFacultyStore } = await import("./faculty/json-store.ts")
  const store = createFacultyStore({})
  assert.ok(store instanceof JsonFacultyStore)
})

test("formatVector serializes MiniLM embeddings for pgvector", async () => {
  const { formatVector } = await import("./faculty/neon-store.ts")
  assert.equal(formatVector([0.1, -0.25, 0]), "[0.1,-0.25,0]")
})
