import axios from "axios";
import { toast } from "sonner";
import tokenStorage from "@/utils/tokenStorage";
import API_ENDPOINTS from "@/constants/apiEndpoints";

// Production luôn gọi cùng origin Vercel; vercel.json sẽ reverse-proxy /api sang Render.
// Nhờ đó refresh cookie là first-party và không phụ thuộc chính sách third-party cookie.
export const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Các endpoint chạy ngầm, không cần hiện toast thành công
const SILENT_ENDPOINTS = [
  API_ENDPOINTS.AUTH.REFRESH_TOKEN,
  API_ENDPOINTS.AUTH.USER_INFO,
  // Nhắn tin: gửi/đọc tin diễn ra liên tục → không hiện toast thành công
  "/chat/",
  // Trợ lý ảo: mỗi câu trả lời là 1 POST → không pop toast thành công
  "/chatbot",
];

const isSilentRequest = (config) => SILENT_ENDPOINTS.some((endpoint) => config?.url?.includes(endpoint));

const REFRESH_LOCK_NAME = "webtutorcenter-refresh-token";
let refreshPromise = null;

const runWithRefreshLock = (callback) => {
  const lockManager = typeof navigator !== "undefined" ? navigator.locks : null;
  return lockManager?.request ? lockManager.request(REFRESH_LOCK_NAME, callback) : callback();
};

const requestNewAccessToken = async () => {
  const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, undefined, {
    skipAuthRefresh: true,
  });
  const token = data?.data?.accessToken;
  if (!token) throw new Error("Phản hồi làm mới phiên không có access token");
  tokenStorage.set(token);
  return token;
};

// Một promise dùng chung trong tab + Web Lock dùng chung giữa các tab để refresh token
// cookie chỉ bị xoay tuần tự.
export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = runWithRefreshLock(requestNewAccessToken).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

axiosInstance.interceptors.response.use(
  (response) => {
    const { config, data } = response;
    const method = config.method?.toUpperCase();

    // Hiện toast thành công cho các action của người dùng (không phải GET và không phải endpoint ngầm)
    if (method !== "GET" && !isSilentRequest(config) && data?.message) {
      toast.success(data.message, { duration: 1500 });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // Nếu chính request refresh bị 401 → phiên hết hạn thật sự, không thử refresh tiếp
    // (tránh deadlock: refresh fail lại rơi vào hàng đợi và treo vô hạn → spinner quay mãi)
    const isRefreshCall = originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN);

    // Tự động refresh token khi nhận 401 và người dùng đang đăng nhập
    if (
      status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.skipAuthRefresh &&
      !isRefreshCall &&
      tokenStorage.get()
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        const refreshStatus = refreshError.response?.status;
        const sessionExpired = refreshStatus === 401 || refreshStatus === 403;

        // Chỉ kết thúc phiên khi server xác nhận refresh token không còn hợp lệ.
        // Lỗi mạng/5xx là tạm thời và không nên ép người dùng đăng xuất.
        if (sessionExpired) {
          tokenStorage.remove();
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.assign("/login");
          }
        }
        return Promise.reject(refreshError);
      }
    }

    // Chỉ hiển thị lỗi do người dùng thao tác sai (4xx) ra giao diện.
    // Lỗi hệ thống (5xx) đã được log ở terminal BE → KHÔNG hiện gì ra phía FE.
    if (status && status >= 400 && status < 500 && !isSilentRequest(originalRequest)) {
      toast.error(message || "Đã có lỗi xảy ra, vui lòng thử lại", { duration: 2500 });
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
