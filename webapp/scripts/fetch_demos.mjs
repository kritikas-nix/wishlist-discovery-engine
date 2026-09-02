// One-off: fetch demo products (with images) into lib/demo_items.json.
//   node scripts/fetch_demos.mjs
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(new URL("../../.env", import.meta.url), "utf8");
const KEY = env.match(/FIRECRAWL_API_KEY=(.+)/)?.[1]?.trim();
if (!KEY) throw new Error("no FIRECRAWL_API_KEY in ../.env");

const IDS = [
  "31034107", // dress (existing)
  "32651082", // dress
  "33720581", // kurta (existing)
  "36428886", // kurta
  "31266819", // jeans (existing)
  "39302054", // jeans
  "19202890", // shirt
  "34083841", // shirt
  "30462651", // tshirt
];

async function fetchProduct(styleId) {
  const resp = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url: `https://www.myntra.com/reviews/${styleId}`,
      waitFor: 3000,
      formats: [{
        type: "json",
        prompt:
          "From this product reviews page extract: 'brand', 'name' (product " +
          "name), 'price' (displayed price as shown), 'rating' (average " +
          "rating if shown, else null), 'rating_count' (number of ratings " +
          "if shown, else null), and 'reviews': every customer review on " +
          "the page as a list of {'text': full review text, 'rating': 1-5 " +
          "or null, 'size_bought': size mentioned as bought if shown else " +
          "null}. Do not invent anything; empty list if no reviews.",
      }],
    }),
  });
  if (!resp.ok) throw new Error(`firecrawl ${resp.status}`);
  const body = await resp.json();
  const data = body?.data?.json ?? {};
  const meta = body?.data?.metadata ?? {};
  const og = meta.ogImage ?? meta["og:image"] ?? null;
  const reviews = (data.reviews ?? [])
    .filter((r) => String(r?.text ?? "").trim().length >= 15)
    .slice(0, 60);
  return {
    style_id: styleId,
    brand: data.brand ?? "",
    name: data.name ?? "",
    price: String(data.price ?? ""),
    rating: data.rating ?? null,
    rating_count: data.rating_count ?? null,
    url: `https://www.myntra.com/reviews/${styleId}`,
    image: typeof og === "string" && og.startsWith("http") ? og : null,
    reviews,
  };
}

const out = [];
for (const id of IDS) {
  try {
    const p = await fetchProduct(id);
    console.log(id, "->", p.brand, "|", p.name.slice(0, 45), "| reviews:",
      p.reviews.length, "| image:", p.image ? "yes" : "NO");
    if (p.reviews.length >= 8 && p.name) out.push(p);
  } catch (e) {
    console.log(id, "-> FAILED", e.message);
  }
}
writeFileSync(new URL("../lib/demo_items.json", import.meta.url),
  JSON.stringify(out, null, 1));
console.log(`\nsaved ${out.length} demo items`);
