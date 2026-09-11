import axiosInstance from "@/services/axiosInstance";

let footerRequest;

// Share only in-flight requests so later reads fetch the latest settings.
const getFooter = () => {
  if (!footerRequest) {
    footerRequest = axiosInstance.get("/settings/footer").finally(() => {
      footerRequest = undefined;
    });
  }
  return footerRequest;
};

const updateFooter = (payload) => axiosInstance.put("/settings/footer", payload);

const settingsService = {
  getFooter,
  updateFooter,
};

export default settingsService;
