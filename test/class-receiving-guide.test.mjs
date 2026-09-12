import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { RECEIVING_FLOWS } from "../src/features/classes/constants/classReceivingGuide.js";

for (const flow of RECEIVING_FLOWS) {
  test(`guide ${flow.id}: steps target real diagram nodes and approval cannot be bypassed`, async () => {
    const graph = JSON.parse(await readFile(new URL(`../docs/diagrams/${flow.id}.workflow.json`, import.meta.url), "utf8"));
    const html = await readFile(new URL(`../public/diagrams/html/class-${flow.id}.html`, import.meta.url), "utf8");
    const ids = new Set(graph.nodes.map((node) => node.id));
    for (const step of flow.steps) assert.ok(ids.has(step.id), `Missing diagram node: ${step.id}`);
    for (const edge of graph.edges) {
      assert.ok(ids.has(edge.from) && ids.has(edge.to), "Dangling diagram edge");
    }
    assert.ok(html.includes('name="generator" content="archify'));
    assert.ok((await readFile(new URL(`../public/diagrams/js/class-${flow.id}-theme.js`, import.meta.url), "utf8")).includes('data-embed'), "Viewer must support embedding");
    if (flow.id !== "cancel") {
      const visits = [];
      function walk(id, path = []) {
        assert.ok(!path.includes(id), "Unexpected cycle in receiving workflow");
        const next = [...path, id];
        if (id === "completed") visits.push(next);
        for (const edge of graph.edges.filter((edge) => edge.from === id)) walk(edge.to, next);
      }
      walk(flow.id);
      assert.ok(visits.length > 0, "Missing completion path");
      for (const path of visits) {
        assert.ok(path.indexOf("review") >= 0 && path.indexOf("review") < path.indexOf("matched"));
        assert.ok(path.indexOf("confirm") > path.indexOf("matched"));
        assert.ok(path.indexOf("confirm") < path.indexOf("completed"));
      }
    } else {
      assert.ok(graph.edges.some((edge) => edge.from === "request" && edge.to === "cancelled"));
      assert.ok(graph.edges.some((edge) => edge.from === "request" && edge.to === "denied"));
      assert.ok(graph.edges.some((edge) => edge.from === "cancelled" && edge.to === "open"));
      assert.ok(graph.edges.some((edge) => edge.from === "cancelled" && edge.to === "expired"));
    }
  });
}
