import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { preview } from "vite";
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


test("local production preview proxies settings reads and admin updates to the configured API", async (t) => {
  let settings = { phone: "0900000001" };
  const api = createServer(async (req, res) => {
    if (req.url !== "/api/settings/footer") {
      res.writeHead(404).end();
      return;
    }
    if (req.method === "PUT") {
      let body = "";
      for await (const chunk of req) body += chunk;
      settings = JSON.parse(body);
    }
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({ success: true, data: settings }));
  });
  await new Promise((resolve) => api.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => api.close(resolve)));

  const previousBaseUrl = process.env.VITE_API_BASE_URL;
  process.env.VITE_API_BASE_URL = `http://127.0.0.1:${api.address().port}/api`;
  t.after(() => {
    if (previousBaseUrl === undefined) delete process.env.VITE_API_BASE_URL;
    else process.env.VITE_API_BASE_URL = previousBaseUrl;
  });
  const outDir = await mkdtemp(join(tmpdir(), "webtutor-preview-test-"));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  await writeFile(join(outDir, "index.html"), "SPA fallback");
  const server = await preview({
    root: fileURLToPath(projectRoot),
    build: { outDir },
    preview: { host: "127.0.0.1", port: 0, open: false },
    logLevel: "silent",
  });
  t.after(() => new Promise((resolve) => server.httpServer.close(resolve)));
  const url = `http://127.0.0.1:${server.httpServer.address().port}/api/settings/footer`;
  const first = await fetch(url);
  assert.equal(first.headers.get("cache-control"), "no-store");
  assert.deepEqual((await first.json()).data, settings);
  const updated = { phone: "0900000002", phone2: "0900000003" };
  const saved = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });
  assert.deepEqual((await saved.json()).data, updated);
  assert.deepEqual((await (await fetch(url)).json()).data, updated);
});
