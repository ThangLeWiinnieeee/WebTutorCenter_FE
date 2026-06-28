import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const chatService = {
  // ── Gia sư ──
  getMyConversation: (params) => axiosInstance.get(API_ENDPOINTS.CHAT.MY_CONVERSATION, { params }),
  getMyUnreadCount: () => axiosInstance.get(API_ENDPOINTS.CHAT.MY_UNREAD_COUNT),
  sendMyMessage: (content) => axiosInstance.post(API_ENDPOINTS.CHAT.MY_SEND, { content }),
  sendMyImage: (formData) =>
    axiosInstance.post(API_ENDPOINTS.CHAT.MY_SEND_IMAGE, formData, {
      headers: { "Content-Type": undefined },
    }),
  markMyConversationRead: () => axiosInstance.post(API_ENDPOINTS.CHAT.MY_READ),

  // ── Admin ──
  getConversations: (params) => axiosInstance.get(API_ENDPOINTS.CHAT.CONVERSATIONS, { params }),
  getAdminUnreadCount: () => axiosInstance.get(API_ENDPOINTS.CHAT.ADMIN_UNREAD_COUNT),
  getConversationMessages: (id, params) =>
    axiosInstance.get(API_ENDPOINTS.CHAT.CONVERSATION_MESSAGES(id), { params }),
  sendConversationMessage: (id, content) =>
    axiosInstance.post(API_ENDPOINTS.CHAT.CONVERSATION_SEND(id), { content }),
  sendConversationImage: (id, formData) =>
    axiosInstance.post(API_ENDPOINTS.CHAT.CONVERSATION_SEND_IMAGE(id), formData, {
      headers: { "Content-Type": undefined },
    }),
  markConversationRead: (id) => axiosInstance.post(API_ENDPOINTS.CHAT.CONVERSATION_READ(id)),
  startConversation: (tutorUserId) =>
    axiosInstance.post(API_ENDPOINTS.CHAT.CONVERSATIONS, { tutorUserId }),

  // Picker chọn người dùng để admin chủ động nhắn (tái dùng danh sách user của admin).
  // Gồm cả gia sư lẫn học viên. Để trống từ khóa → trả về danh sách user (giới hạn của endpoint).
  searchUsers: (keyword) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN.USERS, {
      params: { keyword, limit: 100 },
    }),
};

export default chatService;
