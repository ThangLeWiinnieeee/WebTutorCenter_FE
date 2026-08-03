import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

// Gọi API lấy danh sách thông báo (dùng chung cho cả người dùng và admin).
const getNotifications = (params) => {
  return axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params });
};

// Gọi API đánh dấu một thông báo là đã đọc.
const markAsRead = (id) => {
  return axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
};

// Gọi API đánh dấu tất cả thông báo của một nhóm người nhận là đã đọc.
const markAllAsRead = (audience) => {
  return axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, null, {
    params: audience ? { audience } : undefined,
  });
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
