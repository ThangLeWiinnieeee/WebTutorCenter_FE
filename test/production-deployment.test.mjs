import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("Vercel reverse-proxy /api sang Render trước SPA fallback", async () => {
  const config = JSON.parse(await readFile(new URL("vercel.json", projectRoot), "utf8"));

  assert.deepEqual(config.rewrites[0], {
    source: "/api/:path*",
    destination: "https://webtutor-api.onrender.com/api/:path*",
  });
  assert.deepEqual(config.rewrites[1], {
    source: "/(.*)",
    destination: "/index.html",
  });
});
