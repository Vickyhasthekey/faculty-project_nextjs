import { EMBED_DIM, embedText } from "../lib/embed.ts"

const vector = await embedText("computer vision")
if (vector.length !== EMBED_DIM) {
  throw new Error(`expected ${EMBED_DIM}-d embedding, got ${vector.length}`)
}
console.log("cached MiniLM embedding model")
