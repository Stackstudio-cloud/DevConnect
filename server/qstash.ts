import { Client } from "@upstash/qstash";

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN || "",
});

export async function enqueueUrl(url: string, body?: unknown) {
  if (!process.env.QSTASH_TOKEN) {
    console.warn("[qstash] QSTASH_TOKEN not set; skipping enqueue");
    return { skipped: true };
  }
  const res = await qstash.publishJSON({ url, body });
  return res;
}


