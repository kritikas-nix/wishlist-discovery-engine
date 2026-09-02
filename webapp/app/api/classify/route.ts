import { classify } from "@/lib/engine";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || String(text).trim().length < 5) {
      return Response.json({ error: "Paste some text first." }, { status: 400 });
    }
    const tags = await classify(String(text).slice(0, 4000));
    return Response.json(tags);
  } catch (e) {
    return Response.json(
      { error: `Classification failed: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 500 });
  }
}
