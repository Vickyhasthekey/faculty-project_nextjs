export const EMBED_DIM = 384

function tokenize(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
  const tokens = [...words]
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`)
  }
  return tokens
}

function hash32(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function embedText(text: string): number[] {
  const vector = new Array<number>(EMBED_DIM).fill(0)
  for (const token of tokenize(text)) {
    const hashed = hash32(token)
    const index = hashed % EMBED_DIM
    vector[index] += hashed & 1 ? 1 : -1
  }
  let norm = 0
  for (const value of vector) norm += value * value
  norm = Math.sqrt(norm)
  if (norm === 0) return vector
  return vector.map((value) => value / norm)
}
