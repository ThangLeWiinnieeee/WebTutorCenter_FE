import axios from "axios";
import { toast } from "sonner";
import tokenStorage from "@/utils/tokenStorage";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

const processPendingRequests = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingRequests = [];
};

// Các endpoint chạy ngầm, không cần hiện toast thành công
const SILENT_ENDPOINTS = [
  API_ENDPOINTS.AUTH.REFRESH_TOKEN,
  API_ENDPOINTS.AUTH.USER_INFO,
  // Nhắn tin: gửi/đọc tin diễn ra liên tục → không hiện toast thành công
  "/chat/",
];

axiosInstance.interceptors.response.use(
  (response) => {
    const { config, data } = response;
    const method = config.method?.toUpperCase();
    const isSilent = SILENT_ENDPOINTS.some((ep) => config.url?.includes(ep));

    // Hiện toast thành công cho các action của người dùng (không phải GET và không phải endpoint ngầm)
    if (method !== "GET" && !isSilent && data?.message) {
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
    if (status === 401 && !originalRequest._retry && !isRefreshCall && tokenStorage.get()) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
        const newToken = data.data.accessToken;
        tokenStorage.set(newToken);
        processPendingRequests(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processPendingRequests(refreshError);
        tokenStorage.remove();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Chỉ hiển thị lỗi do người dùng thao tác sai (4xx) ra giao diện.
    // Lỗi hệ thống (5xx) đã được log ở terminal BE → KHÔNG hiện gì ra phía FE.
    if (status && status >= 400 && status < 500) {
      toast.error(message || "Đã có lỗi xảy ra, vui lòng thử lại", { duration: 2500 });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
