import axiosInstance from "@/services/axiosInstance";

let footerRequest;

// Dùng chung một request cho Footer và các khối hotline cùng xuất hiện trong một trang.
const getFooter = () => {
  if (!footerRequest) {
    footerRequest = axiosInstance.get("/settings/footer").catch((error) => {
      footerRequest = undefined;
      throw error;
    });
  }
  return footerRequest;
};

const updateFooter = async (payload) => {
  const response = await axiosInstance.put("/settings/footer", payload);
  footerRequest = Promise.resolve(response);
  return response;
};

const settingsService = {
  getFooter,
  updateFooter,
};

export default settingsService;
