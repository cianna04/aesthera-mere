import { answerQuestion } from "@/lib/assistant";

const buckets = new Map<string, { count: number; until: number }>();
const MAX_BODY_BYTES = 5000;
const MAX_BUCKETS = 5000;

const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Security-Policy": "default-src 'none'",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request) {
  const headers = responseHeaders;
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if ((origin && origin !== new URL(request.url).origin) || fetchSite === "cross-site") {
    return Response.json({ error: "Request not allowed." }, { status: 403, headers });
  }
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) return Response.json({ error: "Please keep questions under 600 characters." }, { status: 413, headers });
  const ip = (request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "local").split(",")[0].trim().slice(0, 64);
  const now = Date.now();
  for (const [key, value] of buckets) if (value.until < now) buckets.delete(key);
  if (buckets.size > MAX_BUCKETS) buckets.clear();
  const bucket = buckets.get(ip) ?? { count: 0, until: now + 60000 };
  if (bucket.count >= 15) return Response.json({ error: "Please wait a minute before sending another question." }, { status: 429, headers: { ...headers, "Retry-After": "60" } });
  bucket.count++; buckets.set(ip, bucket);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return Response.json({ error: "Send a text question." }, { status: 415, headers });
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return Response.json({ error: "Please keep questions under 600 characters." }, { status: 413, headers });
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Unable to read that question. Please try again." }, { status: 400, headers });
  }
  if (!body || typeof body !== "object") return Response.json({ error: "Please enter a question of 1–600 characters." }, { status: 400, headers });
  const { message, contextId } = body as Record<string, unknown>;
  if (typeof message !== "string" || !message.trim() || message.length > 600 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(message)) {
    return Response.json({ error: "Please enter a question of 1–600 characters." }, { status: 400, headers });
  }
  if (contextId !== undefined && (typeof contextId !== "string" || !/^[a-z0-9-]{1,120}$/.test(contextId))) {
    return Response.json({ error: "Invalid conversation context." }, { status: 400, headers });
  }
  try {
    return Response.json(await answerQuestion(message.trim(), contextId as string | undefined), { headers });
  } catch {
    return Response.json({ error: "The assistant is temporarily unavailable. Please try again or contact the clinic." }, { status: 503, headers });
  }
}
