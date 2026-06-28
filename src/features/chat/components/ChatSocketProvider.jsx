import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { connectSocket, disconnectSocket, getSocket } from "@/services/socket";
import {
  clearChat,
  socketMessageReceived,
  socketReadReceived,
  socketConversationUpserted,
} from "@/features/chat/store/chatSlice";
import { markConversationReadThunk } from "@/features/chat/store/chatThunks";

// Quản lý vòng đời 1 kết nối socket theo phiên đăng nhập và đẩy sự kiện realtime
// vào Redux. Render trong suốt (trả về children).
const ChatSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const userId = useSelector((s) => s.auth.user?.id);
  const activeId = useSelector((s) => s.chat.admin.activeId);

  // Giữ activeId mới nhất để dùng trong listener mà không cần gắn lại socket.
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      disconnectSocket();
      return undefined;
    }

    // Bắt đầu phiên chat mới cho tài khoản hiện tại.
    dispatch(clearChat());
    const socket = connectSocket();
    if (!socket) return undefined;

    const onMessage = (payload) => {
      dispatch(socketMessageReceived(payload));
      // Admin đang mở đúng hội thoại + tab hiển thị → đánh dấu đã đọc ngay.
      if (
        payload.conversation &&
        activeIdRef.current === payload.conversation.id &&
        document.visibilityState === "visible"
      ) {
        dispatch(markConversationReadThunk(payload.conversation.id));
      }
    };
    const onRead = (payload) => dispatch(socketReadReceived(payload));
    const onConversation = (payload) => dispatch(socketConversationUpserted(payload));

    socket.on("chat:message", onMessage);
    socket.on("chat:read", onRead);
    socket.on("chat:conversation", onConversation);

    return () => {
      const s = getSocket();
      if (s) {
        s.off("chat:message", onMessage);
        s.off("chat:read", onRead);
        s.off("chat:conversation", onConversation);
      }
      disconnectSocket();
    };
  }, [dispatch, isAuthenticated, userId]);

  return children;
};

export default ChatSocketProvider;
