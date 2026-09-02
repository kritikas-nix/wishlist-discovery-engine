// One-off: add product images to lib/demo_items.json.
//   node scripts/fetch_images.mjs
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(new URL("../../.env", import.meta.url), "utf8");
const KEY = env.match(/FIRECRAWL_API_KEY=(.+)/)?.[1]?.trim();
const path = new URL("../lib/demo_items.json", import.meta.url);
const items = JSON.parse(readFileSync(path, "utf8"));

function upscale(u) {
  return u.replace(/f_auto,h_\d+,q_auto:best,w_\d+/, "f_auto,h_720,q_auto:best,w_540");
}

for (const item of items) {
  try {
    const resp = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `https://www.myntra.com/${item.style_id}`,
        waitFor: 3000,
        formats: [{
          type: "json",
          prompt: 'Return {"image": the absolute URL of the main product photo displayed on this page (an assets.myntassets.com URL), or null}',
        }],
      }),
    });
    const body = await resp.json();
    const img = body?.data?.json?.image;
    if (typeof img === "string" && img.startsWith("http")) {
      const big = upscale(img);
      const ok = (await fetch(big, { method: "HEAD" })).ok;
      item.image = ok ? big : img;
    }
    console.log(item.style_id, "->", item.image ? "image OK" : "no image");
  } catch (e) {
    console.log(item.style_id, "-> FAILED", e.message);
  }
}
writeFileSync(path, JSON.stringify(items, null, 1));
console.log("saved");
