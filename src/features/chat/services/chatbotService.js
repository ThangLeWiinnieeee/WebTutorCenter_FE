import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

// Trợ lý ảo. Stateless: FE tự giữ lịch sử và gửi kèm mỗi lượt (history) + sessionId.
// Token (nếu đã đăng nhập) được axiosInstance tự gắn để bot trả lời câu "của tôi".
const chatbotService = {
  ask: ({ message, history = [], sessionId }) =>
    axiosInstance.post(API_ENDPOINTS.CHATBOT.ASK, { message, history, sessionId }),
};

export default chatbotService;
