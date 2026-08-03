import { createApiThunk } from "@/app/createApiThunk";
import chatService from "@/features/chat/services/chatService";

// ──────────────────────────── Gia sư ────────────────────────────

// Lấy hội thoại của chính người dùng với admin.
export const fetchMyConversationThunk = createApiThunk(
  "chat/fetchMyConversation",
  async (params = {}) => {
    const res = await chatService.getMyConversation(params);
    return res.data.data; // { conversation, messages, pagination }
  },
  "Lấy cuộc trò chuyện thất bại",
);

// Lấy số tin nhắn chưa đọc của người dùng.
export const fetchMyUnreadCountThunk = createApiThunk(
  "chat/fetchMyUnreadCount",
  async () => {
    const res = await chatService.getMyUnreadCount();
    return res.data.data.unreadCount ?? 0;
  },
  "Lấy số tin chưa đọc thất bại",
);

// Người dùng gửi tin nhắn văn bản cho admin.
export const sendMyMessageThunk = createApiThunk(
  "chat/sendMyMessage",
  async (content) => {
    const res = await chatService.sendMyMessage(content);
    return res.data.data.message;
  },
  "Gửi tin nhắn thất bại",
);

// Người dùng gửi ảnh cho admin.
export const sendMyImageThunk = createApiThunk(
  "chat/sendMyImage",
  async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await chatService.sendMyImage(formData);
    return res.data.data.message;
  },
  "Gửi ảnh thất bại",
);

// Đánh dấu hội thoại của người dùng là đã đọc.
export const markMyReadThunk = createApiThunk(
  "chat/markMyRead",
  async () => {
    await chatService.markMyConversationRead();
  },
  "Đánh dấu đã đọc thất bại",
);

// ──────────────────────────── Admin ────────────────────────────

// Admin lấy danh sách hội thoại.
export const fetchConversationsThunk = createApiThunk(
  "chat/fetchConversations",
  async (params = {}) => {
    const res = await chatService.getConversations(params);
    return res.data.data; // { conversations, pagination }
  },
  "Lấy danh sách hội thoại thất bại",
);

// Admin lấy tổng số tin nhắn chưa đọc.
export const fetchAdminUnreadCountThunk = createApiThunk(
  "chat/fetchAdminUnreadCount",
  async () => {
    const res = await chatService.getAdminUnreadCount();
    return res.data.data.unreadCount ?? 0;
  },
  "Lấy số tin chưa đọc thất bại",
);

// Admin lấy tin nhắn của một hội thoại.
export const fetchConversationMessagesThunk = createApiThunk(
  "chat/fetchConversationMessages",
  async ({ id, params = {} }) => {
    const res = await chatService.getConversationMessages(id, params);
    return res.data.data; // { conversation, messages, pagination }
  },
  "Lấy tin nhắn thất bại",
);

// Admin gửi tin nhắn văn bản vào một hội thoại.
export const sendConversationMessageThunk = createApiThunk(
  "chat/sendConversationMessage",
  async ({ id, content }) => {
    const res = await chatService.sendConversationMessage(id, content);
    return { id, message: res.data.data.message };
  },
  "Gửi tin nhắn thất bại",
);

// Admin gửi ảnh vào một hội thoại.
export const sendConversationImageThunk = createApiThunk(
  "chat/sendConversationImage",
  async ({ id, file }) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await chatService.sendConversationImage(id, formData);
    return { id, message: res.data.data.message };
  },
  "Gửi ảnh thất bại",
);

// Admin gửi thẻ giới thiệu lớp/gia sư vào một hội thoại.
export const sendConversationCardThunk = createApiThunk(
  "chat/sendConversationCard",
  async ({ id, kind, refId }) => {
    const res = await chatService.sendConversationCard(id, { kind, refId });
    return { id, message: res.data.data.message };
  },
  "Gửi thông tin thất bại",
);

// Admin đánh dấu một hội thoại là đã đọc.
export const markConversationReadThunk = createApiThunk(
  "chat/markConversationRead",
  async (id) => {
    await chatService.markConversationRead(id);
    return id;
  },
  "Đánh dấu đã đọc thất bại",
);

// Admin chủ động mở hội thoại với một người dùng.
export const startConversationThunk = createApiThunk(
  "chat/startConversation",
  async (tutorUserId) => {
    const res = await chatService.startConversation(tutorUserId);
    return res.data.data.conversation;
  },
  "Mở cuộc trò chuyện thất bại",
);
