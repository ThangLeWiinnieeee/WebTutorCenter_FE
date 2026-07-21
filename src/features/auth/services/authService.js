import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";

const authService = {
  register: (data) => axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, data),

  verifyOtp: (data) => axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data),

  resendOtp: (data) => axiosInstance.post(API_ENDPOINTS.AUTH.RESEND_OTP, data),

  googleLogin: (data) => axiosInstance.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, data),

  login: (data) => axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, data),

  logout: () => axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT),

  refreshToken: () => axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN),

  forgotPassword: (data) => axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),

  verifyForgotPasswordOtp: (data) => axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_FORGOT_PASSWORD_OTP, data),

  resetPassword: (data) => axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),

  getUserInfo: () => axiosInstance.get(API_ENDPOINTS.AUTH.USER_INFO),

  updateProfile: (data) => axiosInstance.patch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data),

  uploadAvatar: (formData) =>
    axiosInstance.post(API_ENDPOINTS.AUTH.UPLOAD_AVATAR, formData, {
      headers: { "Content-Type": undefined },
    }),
};

export default authService;
