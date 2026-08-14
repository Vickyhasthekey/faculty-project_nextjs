import { strict as assert } from "node:assert"
import { test } from "node:test"

import { fetchBackend } from "./fetchBackend.ts"

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

test("retries 503 warmup responses then returns success", async () => {
  let attempts = 0
  const response = await fetchBackend(
    "/search",
    { method: "POST" },
    {
      fetch: async () => {
        attempts += 1
        if (attempts < 3) return jsonResponse(503, { detail: "Service warming up" })
        return jsonResponse(200, { results: [] })
      },
      sleep: async () => undefined,
      retries: 4,
      retryDelayMs: 1,
    },
  )

  assert.equal(attempts, 3)
  assert.equal(response.status, 200)
})

test("returns the last 503 after retries are exhausted", async () => {
  const response = await fetchBackend(
    "/chat",
    { method: "POST" },
    {
      fetch: async () => jsonResponse(503, { detail: "Service warming up" }),
      sleep: async () => undefined,
      retries: 2,
      retryDelayMs: 1,
    },
  )

  assert.equal(response.status, 503)
})
