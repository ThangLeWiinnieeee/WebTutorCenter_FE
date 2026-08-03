import axiosInstance from "@/services/axiosInstance";

// Service đọc/ghi cấu hình chân trang (footer) — hardcode path, không qua apiEndpoints.
const settingsService = {
  getFooter: () => axiosInstance.get("/settings/footer"),
  updateFooter: (payload) => axiosInstance.put("/settings/footer", payload),
};

export default settingsService;
