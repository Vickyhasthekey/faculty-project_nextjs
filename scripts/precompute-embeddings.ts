import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { FACULTY_ROWS } from "../lib/faculty-data.ts"
import { embedTexts } from "../lib/embed.ts"

const outPath = join(dirname(fileURLToPath(import.meta.url)), "../lib/faculty-vectors.json")

const texts = FACULTY_ROWS.map((row) => row.Interest)
console.log(`Embedding ${texts.length} interests with MiniLM...`)
const vectors: number[][] = []
const batchSize = 32
for (let start = 0; start < texts.length; start += batchSize) {
  const batch = texts.slice(start, start + batchSize)
  vectors.push(...(await embedTexts(batch, batchSize)))
  console.log(`${Math.min(start + batchSize, texts.length)}/${texts.length}`)
}
const rounded = vectors.map((vector) => vector.map((value) => Number(value.toFixed(6))))
writeFileSync(outPath, `${JSON.stringify(rounded)}\n`)
console.log(`Wrote ${rounded.length} vectors to ${outPath}`)
