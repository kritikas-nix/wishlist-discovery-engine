import { chromium } from "playwright";

const ROOT = "/Users/kritikasingh/Desktop/NextLeap Final Project";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto("file://" + encodeURI(ROOT + "/deck.html"), { waitUntil: "networkidle" });
await page.waitForTimeout(2500); // fonts + remote images

// overflow check per slide (vertical + horizontal)
const overflow = await page.evaluate(() => {
  return [...document.querySelectorAll(".slide")].map((s, i) => {
    const vs = s.scrollHeight - s.clientHeight;
    const hs = s.scrollWidth - s.clientWidth;
    return { slide: i + 1, v: vs, h: hs };
  }).filter(o => o.v > 4 || o.h > 4);
});
console.log("overflow:", overflow.length ? JSON.stringify(overflow) : "none");

// check for wrapped .btnlink buttons (height should be single-line, < 40px)
const wrapped = await page.evaluate(() => {
  return [...document.querySelectorAll(".btnlink")].map((b, i) => {
    const r = b.getBoundingClientRect();
    return { i, text: b.textContent.trim(), h: Math.round(r.height) };
  }).filter(x => x.h > 42);
});
console.log("wrapped buttons:", wrapped.length ? JSON.stringify(wrapped) : "none");

// broken images
const badImgs = await page.evaluate(() =>
  [...document.images].filter(im => !im.complete || im.naturalWidth === 0).map(im => im.src)
);
console.log("broken images:", badImgs.length ? JSON.stringify(badImgs) : "none");

await page.pdf({
  path: ROOT + "/NL Myntra.pdf",
  width: "13.333in", height: "7.5in",
  printBackground: true, pageRanges: "1-10",
});
await browser.close();
console.log("rendered");
