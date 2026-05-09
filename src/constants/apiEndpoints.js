const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    VERIFY_OTP: "/auth/verify-otp",
    RESEND_OTP: "/auth/resend-otp",
    GOOGLE_LOGIN: "/auth/google",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_FORGOT_PASSWORD_OTP: "/auth/verify-forgot-password-otp",
    RESET_PASSWORD: "/auth/reset-password",
    USER_INFO: "/users/user-info",
    UPDATE_PROFILE: "/users/update-profile",
    UPLOAD_AVATAR: "/users/upload-avatar",
  },
  TUTORS: {
    REGISTER: "/tutors/register",
    GET_PROFILE: "/tutors/profile",
  },
  ADMIN: {
    DASHBOARD_STATS: "/tutors/admin/stats",
    TUTORS_PENDING: "/tutors/admin/pending",
    TUTOR_APPROVE: (id) => `/tutors/admin/${id}/approve`,
    TUTOR_REJECT: (id) => `/tutors/admin/${id}/reject`,
  },
  LOCATIONS: {
    PROVINCES: "/locations/provinces",
    DISTRICTS: (provinceCode) => `/locations/provinces/${provinceCode}/districts`,
    SCHOOLS: "/locations/schools",
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
  },
  CLASSES: {
    QUOTE: "/classes/quote",
    CREATE: "/classes",
    LIST: "/classes",
    SUBJECTS: "/classes/subjects",
    DETAIL: (id) => `/classes/${id}`,
    MINE: "/classes/mine",
  },
};

export default API_ENDPOINTS;
