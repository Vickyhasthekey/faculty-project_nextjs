import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { neon } from "@neondatabase/serverless"

import { formatVector } from "../lib/faculty/neon-store.ts"
import { loadJsonFacultyRecords } from "../lib/faculty/json-store.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function loadEnvFile(name: string) {
  const path = join(root, name)
  if (!existsSync(path)) return
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq < 1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env")

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  throw new Error("Set DATABASE_URL in .env.local (Neon connection string), then re-run npm run seed-neon.")
}

const sql = neon(databaseUrl)

await sql`CREATE EXTENSION IF NOT EXISTS vector`
await sql`
  CREATE TABLE IF NOT EXISTS faculty (
    id BIGSERIAL PRIMARY KEY,
    professor TEXT NOT NULL,
    university TEXT NOT NULL,
    department TEXT NOT NULL,
    interest TEXT NOT NULL,
    personal_website TEXT NOT NULL DEFAULT '',
    embedding vector(384) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`
await sql`CREATE INDEX IF NOT EXISTS faculty_university_idx ON faculty (university)`
await sql`CREATE INDEX IF NOT EXISTS faculty_department_idx ON faculty (department)`

const records = loadJsonFacultyRecords()
console.log(`Seeding ${records.length} faculty interest rows into Neon...`)
await sql`TRUNCATE faculty RESTART IDENTITY`

const batchSize = 80
for (let start = 0; start < records.length; start += batchSize) {
  const batch = records.slice(start, start + batchSize)
  await sql`
    INSERT INTO faculty (professor, university, department, interest, personal_website, embedding)
    SELECT
      professor,
      university,
      department,
      interest,
      personal_website,
      embedding::vector
    FROM unnest(
      ${batch.map((row) => row.Professor)}::text[],
      ${batch.map((row) => row.University)}::text[],
      ${batch.map((row) => row.Department)}::text[],
      ${batch.map((row) => row.Interest)}::text[],
      ${batch.map((row) => row["Personal Website"])}::text[],
      ${batch.map((row) => formatVector(row.vector))}::text[]
    ) AS t(professor, university, department, interest, personal_website, embedding)
  `
  console.log(`${Math.min(start + batchSize, records.length)}/${records.length}`)
}

await sql`CREATE INDEX IF NOT EXISTS faculty_embedding_hnsw ON faculty USING hnsw (embedding vector_cosine_ops)`

const count = await sql`SELECT COUNT(*)::int AS n FROM faculty`
console.log(`Neon now has ${count[0].n} live faculty rows. Search will see later inserts without redeploying.`)
