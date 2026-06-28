import { io } from "socket.io-client";
import tokenStorage from "@/utils/tokenStorage";

// URL server socket = base API bỏ hậu tố "/api".
const SOCKET_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api").replace(
  /\/api\/?$/,
  ""
);

let socket = null;

// Kết nối (idempotent). Token lấy từ tokenStorage và gửi qua handshake auth.
export const connectSocket = () => {
  const token = tokenStorage.get();
  if (!token) return null;

  if (socket) {
    // Cập nhật token mới nhất cho lần reconnect kế tiếp.
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    auth: { token },
    transports: ["websocket"],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
