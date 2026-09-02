import { DOUBTS, makeBrief, type Product } from "@/lib/engine";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { product, doubt } = (await req.json()) as { product: Product; doubt: string };
    if (!product?.reviews?.length) {
      return Response.json({ error: "This item has no readable reviews." }, { status: 400 });
    }
    const key = doubt in DOUBTS ? doubt : "general";
    const brief = await makeBrief(product, key);
    return Response.json(brief);
  } catch (e) {
    return Response.json(
      { error: `Could not build the brief (${e instanceof Error ? e.message : "unknown"}).` },
      { status: 500 });
  }
}
