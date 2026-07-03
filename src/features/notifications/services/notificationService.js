import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const getNotifications = (params) => {
  return axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params });
};

const markAsRead = (id) => {
  return axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
};

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
