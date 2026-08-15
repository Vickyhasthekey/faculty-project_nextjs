import { env, pipeline } from "@huggingface/transformers"

export const EMBED_DIM = 384
export const EMBED_MODEL = "onnx-community/all-MiniLM-L6-v2-ONNX"

env.allowLocalModels = false

type MiniLMExtractor = Awaited<ReturnType<typeof pipeline<"feature-extraction">>>

let extractorPromise: Promise<MiniLMExtractor> | null = null

function getExtractor(): Promise<MiniLMExtractor> {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", EMBED_MODEL)
  }
  return extractorPromise
}

function asVectors(list: number[] | number[][]): number[][] {
  if (list.length === 0) return []
  if (typeof list[0] === "number") return [list as number[]]
  return list as number[][]
}

export async function embedText(text: string): Promise<number[]> {
  const extractor = await getExtractor()
  const output = await extractor(text, { pooling: "mean", normalize: true })
  return asVectors(output.tolist() as number[] | number[][])[0]
}

export async function embedTexts(texts: string[], batchSize = 32): Promise<number[][]> {
  const extractor = await getExtractor()
  const vectors: number[][] = []
  for (let start = 0; start < texts.length; start += batchSize) {
    const batch = texts.slice(start, start + batchSize)
    const output = await extractor(batch, { pooling: "mean", normalize: true })
    vectors.push(...asVectors(output.tolist() as number[] | number[][]))
  }
  return vectors
}
