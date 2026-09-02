import { extractStyleId, fetchProduct } from "@/lib/engine";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const sid = extractStyleId(String(url ?? ""));
    if (!sid) {
      return Response.json(
        { error: "That does not look like a Myntra product link." },
        { status: 400 });
    }
    let product;
    try {
      product = await fetchProduct(sid);
    } catch {
      // one automatic retry; scraping occasionally fails transiently
      product = await fetchProduct(sid);
    }
    return Response.json(product);
  } catch (e) {
    return Response.json(
      { error: `Could not fetch this item (${e instanceof Error ? e.message : "unknown"}). Myntra sometimes blocks automated fetching; try a sample item.` },
      { status: 502 });
  }
}
