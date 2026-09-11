import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { configureStore } from "@reduxjs/toolkit";
import { createServer } from "vite";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceRoot = fileURLToPath(new URL("../src", import.meta.url));

const legacyStorageCalls = { get: 0, set: 0, removed: [] };
let capturedSocket = null;
let viteServer;
let tokenStorage;
let axiosInstance;
let authReducer;
let loginThunk;
let restoreSessionThunk;
let socketService;

const response = (config, data) => ({
  config,
  data,
  headers: {},
  request: {},
  status: 200,
  statusText: "OK",
});

const unauthorized = (config) => {
  const error = new Error("Unauthorized");
  error.config = config;
  error.response = {
    config,
    data: { message: "Token không hợp lệ" },
    headers: {},
    status: 401,
    statusText: "Unauthorized",
  };
  return error;
};

const getAuthorization = (config) =>
  config.headers?.Authorization || config.headers?.get?.("Authorization") || null;

before(async () => {
  globalThis.__AUTH_TEST_SOCKET_FACTORY__ = (url, options) => {
    const handlers = new Map();
    const socket = {
      connected: true,
      connect() {
        this.connected = true;
        return this;
      },
      disconnect() {
        this.connected = false;
        return this;
      },
      off(event) {
        handlers.delete(event);
        return this;
      },
      on(event, handler) {
        handlers.set(event, handler);
        return this;
      },
    };
    capturedSocket = { options, socket, url };
    return socket;
  };

  viteServer = await createServer({
    appType: "custom",
    configFile: false,
    logLevel: "silent",
    optimizeDeps: { noDiscovery: true },
    plugins: [
      {
        name: "mock-socket-client",
        enforce: "pre",
        resolveId(id) {
          return id === "socket.io-client" ? "\0mock-socket-client" : null;
        },
        load(id) {
          if (id !== "\0mock-socket-client") return null;
          return "export const io = (...args) => globalThis.__AUTH_TEST_SOCKET_FACTORY__(...args);";
        },
      },
    ],
    resolve: { alias: { "@": sourceRoot } },
    root: projectRoot,
    server: { middlewareMode: true },
    ssr: { noExternal: ["socket.io-client"] },
  });

  globalThis.window = {
    localStorage: {
      getItem() {
        legacyStorageCalls.get += 1;
        throw new Error("Access token must not be read from localStorage");
      },
      removeItem(key) {
        legacyStorageCalls.removed.push(key);
      },
      setItem() {
        legacyStorageCalls.set += 1;
        throw new Error("Access token must not be written to localStorage");
      },
    },
  };
  ({ default: tokenStorage } = await viteServer.ssrLoadModule("/src/utils/tokenStorage.js"));
  delete globalThis.window;

  ({ default: axiosInstance } = await viteServer.ssrLoadModule("/src/services/axiosInstance.js"));
  ({ default: authReducer } = await viteServer.ssrLoadModule("/src/features/auth/store/authSlice.js"));
  ({ loginThunk, restoreSessionThunk } = await viteServer.ssrLoadModule(
    "/src/features/auth/store/authThunks.js",
  ));
  socketService = await viteServer.ssrLoadModule("/src/services/socket.js");
});

after(async () => {
  socketService?.disconnectSocket();
  tokenStorage?.remove();
  await viteServer?.close();
  delete globalThis.__AUTH_TEST_SOCKET_FACTORY__;
  delete globalThis.window;
});

test("access token chỉ nằm trong RAM và token localStorage cũ bị xóa", () => {
  assert.deepEqual(legacyStorageCalls.removed, ["accessToken"]);

  tokenStorage.set("memory-only-token");
  assert.equal(tokenStorage.get(), "memory-only-token");
  tokenStorage.remove();
  assert.equal(tokenStorage.get(), null);

  assert.equal(legacyStorageCalls.get, 0);
  assert.equal(legacyStorageCalls.set, 0);
});

test("khôi phục và đăng nhập chỉ lưu token trong RAM, không đưa vào Redux", async () => {
  const previousAdapter = axiosInstance.defaults.adapter;
  const requests = [];
  const restoredUser = { id: "user-1", email: "user@example.com", role: "user" };
  const loggedInUser = { id: "user-2", email: "login@example.com", role: "tutor" };

  axiosInstance.defaults.adapter = async (config) => {
    requests.push({ authorization: getAuthorization(config), url: config.url });

    if (config.url === "/auth/refresh-token") {
      return response(config, { data: { accessToken: "bootstrap-token" } });
    }
    if (config.url === "/users/user-info") {
      return response(config, { data: { user: restoredUser } });
    }
    if (config.url === "/auth/login") {
      return response(config, {
        data: { accessToken: "login-token", user: loggedInUser },
      });
    }
    throw new Error(`Unexpected request: ${config.url}`);
  };

  try {
    tokenStorage.remove();
    const bootstrapStore = configureStore({ reducer: { auth: authReducer } });
    const restoreAction = await bootstrapStore.dispatch(restoreSessionThunk());
    const restoredState = bootstrapStore.getState().auth;

    assert.match(restoreAction.type, /fulfilled$/);
    assert.deepEqual(requests.slice(0, 2), [
      { authorization: null, url: "/auth/refresh-token" },
      { authorization: "Bearer bootstrap-token", url: "/users/user-info" },
    ]);
    assert.equal(tokenStorage.get(), "bootstrap-token");
    assert.equal(restoredState.initialized, true);
    assert.equal(restoredState.isAuthenticated, true);
    assert.deepEqual(restoredState.user, restoredUser);
    assert.equal(Object.hasOwn(restoredState, "accessToken"), false);
    assert.equal(JSON.stringify(restoredState).includes("bootstrap-token"), false);

    tokenStorage.remove();
    const loginStore = configureStore({ reducer: { auth: authReducer } });
    const loginAction = await loginStore.dispatch(
      loginThunk({ email: "login@example.com", password: "not-used-by-adapter" }),
    );
    const loginState = loginStore.getState().auth;

    assert.match(loginAction.type, /fulfilled$/);
    assert.deepEqual(loginAction.payload, { user: loggedInUser });
    assert.equal(tokenStorage.get(), "login-token");
    assert.equal(Object.hasOwn(loginState, "accessToken"), false);
    assert.equal(JSON.stringify(loginState).includes("login-token"), false);
  } finally {
    axiosInstance.defaults.adapter = previousAdapter;
    tokenStorage.remove();
  }
});

test("khách không có refresh cookie vẫn hoàn tất bootstrap mà không gọi user-info", async () => {
  const previousAdapter = axiosInstance.defaults.adapter;
  let userInfoCalls = 0;

  axiosInstance.defaults.adapter = async (config) => {
    if (config.url === "/auth/refresh-token") throw unauthorized(config);
    if (config.url === "/users/user-info") userInfoCalls += 1;
    throw new Error(`Unexpected request: ${config.url}`);
  };

  try {
    tokenStorage.remove();
    const store = configureStore({ reducer: { auth: authReducer } });
    const action = await store.dispatch(restoreSessionThunk());
    const state = store.getState().auth;

    assert.match(action.type, /rejected$/);
    assert.equal(userInfoCalls, 0);
    assert.equal(tokenStorage.get(), null);
    assert.equal(state.initialized, true);
    assert.equal(state.isAuthenticated, false);
    assert.equal(state.user, null);
  } finally {
    axiosInstance.defaults.adapter = previousAdapter;
    tokenStorage.remove();
  }
});

test("hai request 401 dùng chung một refresh và retry bằng token mới", async () => {
  const previousAdapter = axiosInstance.defaults.adapter;
  const attempts = new Map();
  const retried = [];
  let refreshCount = 0;

  axiosInstance.defaults.adapter = async (config) => {
    if (config.url === "/auth/refresh-token") {
      refreshCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return response(config, { data: { accessToken: "renewed-token" } });
    }

    const count = (attempts.get(config.url) || 0) + 1;
    attempts.set(config.url, count);
    if (getAuthorization(config) !== "Bearer renewed-token") throw unauthorized(config);

    retried.push({ authorization: getAuthorization(config), url: config.url });
    return response(config, { data: { ok: true } });
  };

  try {
    tokenStorage.set("expired-token");
    await Promise.all([axiosInstance.get("/protected-a"), axiosInstance.get("/protected-b")]);

    assert.equal(refreshCount, 1);
    assert.deepEqual(Object.fromEntries(attempts), { "/protected-a": 2, "/protected-b": 2 });
    assert.deepEqual(
      retried.sort((left, right) => left.url.localeCompare(right.url)),
      [
        { authorization: "Bearer renewed-token", url: "/protected-a" },
        { authorization: "Bearer renewed-token", url: "/protected-b" },
      ],
    );
    assert.equal(tokenStorage.get(), "renewed-token");
  } finally {
    axiosInstance.defaults.adapter = previousAdapter;
    tokenStorage.remove();
  }
});

test("Socket.IO handshake luôn lấy access token RAM mới nhất", () => {
  capturedSocket = null;
  tokenStorage.set("socket-token-old");

  try {
    const socket = socketService.connectSocket();
    assert.equal(socket, capturedSocket.socket);

    tokenStorage.set("socket-token-new");
    let handshakeAuth;
    capturedSocket.options.auth((value) => {
      handshakeAuth = value;
    });

    assert.deepEqual(handshakeAuth, { token: "socket-token-new" });
  } finally {
    socketService.disconnectSocket();
    tokenStorage.remove();
  }
});
