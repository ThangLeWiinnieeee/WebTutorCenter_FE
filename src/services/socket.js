import { io } from "socket.io-client";
import tokenStorage from "@/utils/tokenStorage";
import { API_BASE_URL, refreshAccessToken } from "@/services/axiosInstance";

const PRODUCTION_SOCKET_URL = "https://webtutor-api.onrender.com";

// REST đi qua Vercel proxy, còn Socket.IO kết nối thẳng Render bằng access token RAM.
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? PRODUCTION_SOCKET_URL : API_BASE_URL.replace(/\/api\/?$/, ""));

let socket = null;

// Gắn log trạng thái kết nối socket, chỉ chạy ở môi trường dev.
const attachDiagnostics = (s) => {
  if (!import.meta.env.DEV) return;
  s.on("connect", () => console.info("[socket] connected:", s.id));
  s.on("disconnect", (reason) => console.warn("[socket] disconnected:", reason));
  s.on("connect_error", (err) => console.error("[socket] connect_error:", err.message));
};

const isAuthenticationError = (error) =>
  error?.message === "Token không hợp lệ" || error?.message === "Thiếu token xác thực";

// Socket reconnect có thể xảy ra sau khi access token hết hạn; dùng chung cơ chế
// refresh của REST rồi handshake lại với token mới nhất trong RAM.
const attachAuthRecovery = (s) => {
  let retried = false;

  s.on("connect", () => {
    retried = false;
  });

  s.on("connect_error", async (error) => {
    if (!isAuthenticationError(error) || retried) return;
    retried = true;

    try {
      await refreshAccessToken();
      if (socket === s && !s.connected) s.connect();
    } catch (refreshError) {
      if (refreshError.response?.status === 401) {
        tokenStorage.remove();
        if (window.location.pathname !== "/login") window.location.assign("/login");
      } else {
        retried = false;
      }
    }
  });
};

// Mở (hoặc tái sử dụng) kết nối Socket.IO cho phiên đăng nhập hiện tại.
// `auth` truyền dạng hàm để mỗi lần handshake/reconnect đều lấy token mới nhất.
export const connectSocket = () => {
  const token = tokenStorage.get();
  if (!token) return null;

  if (socket) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    auth: (cb) => cb({ token: tokenStorage.get() }),
    transports: ["websocket", "polling"],
  });
  attachDiagnostics(socket);
  attachAuthRecovery(socket);

  return socket;
};

// Trả về instance socket hiện tại (null nếu chưa kết nối).
export const getSocket = () => socket;

// Ngắt kết nối và xóa instance socket hiện tại.
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
