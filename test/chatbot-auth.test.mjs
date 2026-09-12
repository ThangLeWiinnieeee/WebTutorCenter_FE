import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

let server;
let Widget;
let chatReducer;
before(async () => {
  server = await createServer({
    configFile: false,
    root: fileURLToPath(new URL("..", import.meta.url)),
    appType: "custom",
    logLevel: "silent",
    plugins: [react()],
    resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true },
  });
  ({ default: Widget } = await server.ssrLoadModule("/src/features/chat/components/TutorChatWidget.jsx"));
  ({ default: chatReducer } = await server.ssrLoadModule("/src/features/chat/store/chatSlice.js"));
});
after(async () => { await server?.close(); });

function renderWidget(auth) {
  const store = configureStore({ reducer: { auth: () => auth, chat: chatReducer } });
  return renderToString(createElement(Provider, { store }, createElement(Widget)));
}

test("chat widget stays hidden for guests, incomplete sessions and admins", () => {
  for (const auth of [
    { isAuthenticated: false, user: null },
    { isAuthenticated: true, user: null },
    { isAuthenticated: false, user: { id: "old-user", role: "user" } },
    { isAuthenticated: true, user: { id: "admin-1", role: "admin" } },
  ]) assert.equal(renderWidget(auth), "");
});

test("signed-in users and tutors can open the chat widget", () => {
  for (const role of ["user", "tutor"]) {
    assert.match(renderWidget({ isAuthenticated: true, user: { id: "user-1", role } }), /<button/);
  }
});
