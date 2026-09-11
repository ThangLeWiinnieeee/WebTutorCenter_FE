const LEGACY_ACCESS_TOKEN_KEY = "accessToken";
const SESSION_CHANNEL_NAME = "webtutorcenter-auth";
const SESSION_CHANGED = "session-changed";
const SESSION_ENDED = "session-ended";

let accessToken = null;
const listeners = new Set();
const sessionChannel =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new window.BroadcastChannel(SESSION_CHANNEL_NAME)
    : null;

// Xóa token còn sót từ phiên bản cũ; từ đây access token chỉ tồn tại trong RAM.
if (typeof window !== "undefined") {
  try {
    window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  } catch {
    // Trình duyệt có thể chặn Web Storage; điều này không ảnh hưởng token trong RAM.
  }
}

const notifyListeners = (event) => listeners.forEach((listener) => listener(event));

sessionChannel?.addEventListener("message", ({ data }) => {
  if (data !== SESSION_CHANGED && data !== SESSION_ENDED) return;
  accessToken = null;
  notifyListeners(data);
});

const tokenStorage = {
  get: () => accessToken,
  set: (token) => {
    accessToken = typeof token === "string" && token ? token : null;
  },
  remove: () => {
    accessToken = null;
  },
  announceSessionChange: () => sessionChannel?.postMessage(SESSION_CHANGED),
  endSession: () => {
    accessToken = null;
    notifyListeners(SESSION_ENDED);
    sessionChannel?.postMessage(SESSION_ENDED);
  },
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export default tokenStorage;
