import { strict as assert } from "node:assert"
import { test } from "node:test"

import { cosineSimilarity } from "./search.ts"
import { embedText } from "./embed.ts"

test("embedText is case-insensitive and matches the same phrase", () => {
  const a = embedText("Computer Vision")
  const b = embedText("computer vision")
  assert.ok(cosineSimilarity(a, b) > 0.99)
})

test("embedText ranks computer vision above CRISPR for a vision query", () => {
  const q = embedText("computer vision")
  const vision = cosineSimilarity(q, embedText("Computer Vision"))
  const crispr = cosineSimilarity(q, embedText("CRISPR"))
  assert.ok(vision > crispr)
})
