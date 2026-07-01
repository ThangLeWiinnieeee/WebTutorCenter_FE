import { io } from "socket.io-client";
import tokenStorage from "@/utils/tokenStorage";

// URL server socket. Ưu tiên VITE_SOCKET_URL: khi FE gọi API qua proxy nội bộ ("/api" tương đối)
// thì KHÔNG suy ra được host socket từ VITE_API_BASE_URL nữa, nên phải trỏ thẳng BE ở đây
// (vd https://<app>.onrender.com). Fallback: suy từ VITE_API_BASE_URL bằng cách bỏ hậu tố "/api"
// (dùng cho localhost hoặc khi FE gọi API trực tiếp cùng host với socket).
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api").replace(/\/api\/?$/, "");

let socket = null;

// Log chẩn đoán (chỉ ở môi trường dev) để dễ theo dõi trạng thái realtime trong console.
const attachDiagnostics = (s) => {
  if (!import.meta.env.DEV) return;
  s.on("connect", () => console.info("[socket] connected:", s.id));
  s.on("disconnect", (reason) => console.warn("[socket] disconnected:", reason));
  s.on("connect_error", (err) => console.error("[socket] connect_error:", err.message));
};

// Kết nối (idempotent).
// `auth` truyền dạng HÀM nên socket.io đọc lại access token từ storage ở MỖI lần
// handshake — kể cả khi tự reconnect (sau khi server restart hoặc mạng chập chờn).
// Nhờ vậy reconnect luôn dùng token mới nhất, tránh việc dùng token cũ đã hết hạn
// khiến bị từ chối và mất realtime cho tới khi tải lại trang.
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
    // Ưu tiên websocket, nhưng cho phép fallback polling để kết nối bền hơn.
    transports: ["websocket", "polling"],
  });
  attachDiagnostics(socket);

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
