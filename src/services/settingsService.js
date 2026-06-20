import axiosInstance from "@/services/axiosInstance";

const settingsService = {
  getFooter: () => axiosInstance.get("/settings/footer"),
  updateFooter: (payload) => axiosInstance.put("/settings/footer", payload),
};

export default settingsService;
