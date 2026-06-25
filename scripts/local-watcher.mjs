#!/usr/bin/env node

const [targetUrl, apiBase = "http://localhost:3000"] = process.argv.slice(2);

if (!targetUrl) {
  console.error("Usage: node scripts/local-watcher.mjs <url> [apiBase]");
  process.exit(1);
}

const html = await fetch(targetUrl, { credentials: "include" }).then((response) =>
  response.text(),
);
const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
const rawTitle = titleMatch?.[1]?.replace(/\s+/g, " ").trim();
const title = rawTitle ? rawTitle.split("|")[0].trim() : "Untitled external opportunity";

const payload = {
  sourceId: "src_custom",
  platform: "custom",
  url: targetUrl,
  title,
  capturedAt: new Date().toISOString(),
};

const response = await fetch(`${apiBase}/api/external/watcher`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}

console.log(JSON.stringify(await response.json(), null, 2));
