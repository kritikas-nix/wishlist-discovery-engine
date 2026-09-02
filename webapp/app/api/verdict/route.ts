import { makeVerdict, type Product } from "@/lib/engine";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { product } = (await req.json()) as { product: Product };
    if (!product?.reviews) {
      return Response.json({ error: "No product supplied." }, { status: 400 });
    }
    const verdict = await makeVerdict(product);
    return Response.json(verdict);
  } catch (e) {
    return Response.json(
      { error: `Verdict failed (${e instanceof Error ? e.message : "unknown"}).` },
      { status: 500 });
  }
}
