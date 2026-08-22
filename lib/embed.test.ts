import { strict as assert } from "node:assert"
import { test } from "node:test"

import { cosineSimilarity } from "./search.ts"
import { embedText } from "./embed.ts"

test("embedText is case-insensitive and matches the same phrase", async () => {
  const a = await embedText("Computer Vision")
  const b = await embedText("computer vision")
  assert.ok(cosineSimilarity(a, b) > 0.99)
})

test("embedText ranks computer vision above CRISPR for a vision query", async () => {
  const q = await embedText("computer vision")
  const vision = cosineSimilarity(q, await embedText("Computer Vision"))
  const crispr = cosineSimilarity(q, await embedText("CRISPR"))
  assert.ok(vision > crispr)
})

test("embedText treats computer vision as similar to image recognition", async () => {
  const query = await embedText("computer vision")
  const synonym = cosineSimilarity(query, await embedText("image recognition"))
  const unrelated = cosineSimilarity(query, await embedText("basketball"))
  assert.ok(synonym > 0.4)
  assert.ok(synonym > unrelated)
})
