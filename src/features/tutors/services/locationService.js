import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const locationService = {
  getProvinces: () => axiosInstance.get(API_ENDPOINTS.LOCATIONS.PROVINCES),
  getDistricts: (provinceCode) =>
    axiosInstance.get(API_ENDPOINTS.LOCATIONS.DISTRICTS(provinceCode)),
};

export default locationService;
