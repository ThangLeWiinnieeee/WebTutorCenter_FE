import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const getNotifications = () => {
  return axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
};

const markAsRead = (id) => {
  return axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
};

const markAllAsRead = () => {
  return axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
