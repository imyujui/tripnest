import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");
const results = [];

async function check(name, callback) {
  try {
    await callback();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, message: error.message });
  }
}

const destinations = JSON.parse(await read("data/destinations.json"));
const requiredStringFields = [
  "id", "city", "cityEn", "country", "region", "theme", "eyebrow", "tagline",
  "description", "heroImage", "imageAlt", "recommendedDays", "bestSeason", "pace", "updatedAt"
];
const themes = new Set(["文化古都", "美食漫遊", "海港慢旅", "都會探索"]);

await check("destination collection is a non-empty array", () => {
  assert.ok(Array.isArray(destinations));
  assert.ok(destinations.length >= 3);
});

await check("every destination follows the required schema", () => {
  for (const destination of destinations) {
    for (const field of requiredStringFields) {
      assert.equal(typeof destination[field], "string", `${destination.id || "unknown"}.${field} must be a string`);
      assert.ok(destination[field].trim(), `${destination.id || "unknown"}.${field} cannot be empty`);
    }
    assert.match(destination.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${destination.id}: invalid id`);
    assert.ok(themes.has(destination.theme), `${destination.id}: unsupported theme`);
    assert.match(destination.updatedAt, /^\d{4}-\d{2}-\d{2}$/, `${destination.id}: invalid updatedAt`);
    assert.match(destination.heroImage, /^(https:\/\/|assets\/images\/)/, `${destination.id}: invalid heroImage`);
    assert.equal(typeof destination.imageCredit?.name, "string", `${destination.id}: missing image credit name`);
    assert.match(destination.imageCredit?.url || "", /^https:\/\//, `${destination.id}: invalid image credit URL`);
    assert.ok(Array.isArray(destination.bestFor) && destination.bestFor.length >= 2 && destination.bestFor.length <= 4, `${destination.id}: bestFor must contain 2–4 items`);
    assert.equal(destination.highlights?.length, 3, `${destination.id}: highlights must contain exactly 3 items`);
    assert.equal(destination.foods?.length, 3, `${destination.id}: foods must contain exactly 3 items`);
    assert.equal(destination.itinerary?.length, 3, `${destination.id}: itinerary must contain exactly 3 days`);
    assert.ok(destination.tips?.length >= 3 && destination.tips.length <= 5, `${destination.id}: tips must contain 3–5 items`);
    assert.ok(destination.sources?.length >= 2, `${destination.id}: at least two sources are required`);
    for (const highlight of destination.highlights) {
      assert.ok(highlight.name && highlight.area && highlight.description, `${destination.id}: incomplete highlight`);
    }
    for (const food of destination.foods) assert.ok(food.name && food.note, `${destination.id}: incomplete food entry`);
    assert.ok(destination.transport?.arrival && destination.transport?.gettingAround && destination.transport?.tip, `${destination.id}: incomplete transport object`);
    for (const [index, day] of destination.itinerary.entries()) {
      assert.equal(day.day, index + 1, `${destination.id}: itinerary days must be 1, 2, 3`);
      assert.ok(day.title && Array.isArray(day.stops) && day.stops.length >= 2, `${destination.id}: incomplete itinerary day`);
    }
    for (const source of destination.sources) {
      assert.ok(source.label, `${destination.id}: source label is required`);
      assert.match(source.url || "", /^https:\/\//, `${destination.id}: source URL must use HTTPS`);
    }
  }
});

await check("destination identifiers and city names are unique", () => {
  assert.equal(new Set(destinations.map(({ id }) => id)).size, destinations.length, "duplicate id found");
  assert.equal(new Set(destinations.map(({ city }) => city)).size, destinations.length, "duplicate city found");
});

await check("all required project files exist", async () => {
  const files = [
    "AGENTS.md", "README.md", "index.html", "destination.html",
    "assets/css/style.css", "assets/js/shared.js", "assets/js/app.js",
    "assets/js/destination.js", "data/destinations.json"
  ];
  await Promise.all(files.map((file) => access(path.join(root, file))));
});

await check("HTML entry points use relative assets and required landmarks", async () => {
  for (const filename of ["index.html", "destination.html"]) {
    const html = await read(filename);
    assert.match(html, /<html lang="zh-Hant">/, `${filename}: missing language`);
    assert.match(html, /<meta name="viewport"/, `${filename}: missing viewport`);
    assert.match(html, /<main[\s>]/, `${filename}: missing main landmark`);
    assert.match(html, /<footer[\s>]/, `${filename}: missing footer landmark`);
    assert.doesNotMatch(html, /(?:src|href)="\//, `${filename}: root-relative asset may break project Pages`);
  }
});

await check("shared template and homepage remain data-driven", async () => {
  const [app, detail] = await Promise.all([read("assets/js/app.js"), read("assets/js/destination.js")]);
  assert.match(app, /loadDestinations\(\)/, "homepage must load JSON data");
  assert.match(app, /searchableText/, "homepage search is missing");
  assert.match(detail, /URLSearchParams/, "detail page must read the destination id query parameter");
  assert.match(detail, /find\(\(item\) => item\.id === destinationId\)/, "detail page must select a JSON destination");
  for (const city of destinations.map(({ city }) => city)) {
    assert.ok(!detail.includes(city), `detail template contains city-specific copy: ${city}`);
  }
});

for (const result of results) {
  const mark = result.ok ? "✓" : "✗";
  console.log(`${mark} ${result.name}${result.message ? `\n  ${result.message}` : ""}`);
}

const failures = results.filter(({ ok }) => !ok);
if (failures.length) {
  console.error(`\n${failures.length} validation check(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${results.length} validation checks passed for ${destinations.length} destinations.`);
