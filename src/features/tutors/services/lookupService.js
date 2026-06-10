import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const lookupService = {
  // Get all lookups grouped by type
  async getAllLookups() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.LOOKUPS.ALL);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch lookups";
    }
  },

  // Get values by type
  async getByType(type) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.LOOKUPS.BY_TYPE(type));
      return response.data.data.values;
    } catch (error) {
      throw error.response?.data?.message || `Failed to fetch ${type}`;
    }
  },

  // Get districts by province
  async getDistrictsByProvince(province) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.LOOKUPS.DISTRICTS_BY_PROVINCE(province)
      );
      return response.data.data.districts;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch districts";
    }
  },

  // Get subjects
  async getSubjects() {
    return this.getByType("subject");
  },

  // Get occupation statuses
  async getOccupationStatuses() {
    return this.getByType("occupation_status");
  },

  // Get genders
  async getGenders() {
    return this.getByType("gender");
  },

  // Get provinces
  async getProvinces() {
    return this.getByType("province");
  },
};

export default lookupService;
