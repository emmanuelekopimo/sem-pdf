import path from "node:path";
import type { FeatureExtractionPipeline } from "@huggingface/transformers";

/** all-MiniLM-L6-v2 (quantized, 23 MB) ships in /models, so nothing is downloaded at runtime. */
export const MODEL_ID = "Xenova/all-MiniLM-L6-v2";
export const EMBEDDING_DIMENSIONS = 384;

const globalForModel = globalThis as unknown as { sempdfExtractor?: Promise<FeatureExtractionPipeline> };

async function loadExtractor(): Promise<FeatureExtractionPipeline> {
  const { pipeline, env } = await import("@huggingface/transformers");
  env.localModelPath = path.join(process.cwd(), "models") + path.sep;
  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  return pipeline("feature-extraction", MODEL_ID, { dtype: "q8" });
}

export function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!globalForModel.sempdfExtractor) {
    globalForModel.sempdfExtractor = loadExtractor().catch((err) => {
      globalForModel.sempdfExtractor = undefined;
      throw err;
    });
  }
  return globalForModel.sempdfExtractor;
}

/** Embeds texts into unit-length 384-dimension vectors, in batches. */
export async function embedTexts(texts: string[], batchSize = 32): Promise<Float32Array[]> {
  const extractor = await getExtractor();
  const out: Float32Array[] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const tensor = await extractor(batch, { pooling: "mean", normalize: true });
    const data = tensor.data as Float32Array;
    for (let j = 0; j < batch.length; j++) {
      out.push(Float32Array.from(data.subarray(j * EMBEDDING_DIMENSIONS, (j + 1) * EMBEDDING_DIMENSIONS)));
    }
  }
  return out;
}

export async function embedText(text: string): Promise<Float32Array> {
  const [v] = await embedTexts([text]);
  return v!;
}
