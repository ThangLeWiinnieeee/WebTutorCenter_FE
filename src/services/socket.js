import { io } from "socket.io-client";
import tokenStorage from "@/utils/tokenStorage";

// URL server socket: ưu tiên VITE_SOCKET_URL, nếu không có thì suy từ VITE_API_BASE_URL.
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api").replace(/\/api\/?$/, "");

let socket = null;

// Gắn log trạng thái kết nối socket, chỉ chạy ở môi trường dev.
const attachDiagnostics = (s) => {
  if (!import.meta.env.DEV) return;
  s.on("connect", () => console.info("[socket] connected:", s.id));
  s.on("disconnect", (reason) => console.warn("[socket] disconnected:", reason));
  s.on("connect_error", (err) => console.error("[socket] connect_error:", err.message));
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
