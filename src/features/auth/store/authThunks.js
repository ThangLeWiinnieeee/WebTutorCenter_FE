import { createAsyncThunk } from "@reduxjs/toolkit";
import { createApiThunk } from "@/app/createApiThunk";
import authService from "@/features/auth/services/authService";
import tokenStorage from "@/utils/tokenStorage";
import { clearClassRequestFormDraft } from "@/features/classes/utils/classRequestFormDraftStorage";

// Đăng ký tài khoản mới, backend gửi OTP về email để xác thực.
export const registerThunk = createApiThunk(
  "auth/register",
  async (data) => {
    const res = await authService.register(data);
    return res.data.data;
  },
  "Đăng ký thất bại",
);

// Đăng nhập bằng tài khoản Google.
export const googleLoginThunk = createAsyncThunk(
  "auth/googleLogin",
  async (credential, { rejectWithValue }) => {
    if (!credential) {
      return rejectWithValue("Không nhận được mã xác thực Google");
    }

    try {
      const res = await authService.googleLogin({ credential });
      const { accessToken, user } = res.data.data;
      tokenStorage.set(accessToken);
      return { accessToken, user };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đăng nhập Google thất bại");
    }
  },
);

// Đăng nhập bằng email/mật khẩu và lưu access token.
export const loginThunk = createApiThunk(
  "auth/login",
  async (data) => {
    const res = await authService.login(data);
    const { accessToken, user } = res.data.data;
    tokenStorage.set(accessToken);
    return { accessToken, user };
  },
  "Đăng nhập thất bại",
);

// Đăng xuất: xóa token phía client và thu hồi refresh token phía server.
export const logoutThunk = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    tokenStorage.remove();
    // Đăng xuất thì xóa luôn nháp form "tìm gia sư" đang lưu trong localStorage
    clearClassRequestFormDraft();
  } catch (err) {
    tokenStorage.remove();
    clearClassRequestFormDraft();
    return rejectWithValue(err.response?.data?.message || "Đăng xuất thất bại");
  }
});

// Xác thực OTP đăng ký để tạo tài khoản thật.
export const verifyOtpThunk = createApiThunk(
  "auth/verifyOtp",
  async (data) => {
    const res = await authService.verifyOtp(data);
    return res.data.data;
  },
  "Xác thực OTP thất bại",
);

// Gửi lại mã OTP đăng ký.
export const resendOtpThunk = createApiThunk(
  "auth/resendOtp",
  async (data) => {
    const res = await authService.resendOtp(data);
    return res.data.data;
  },
  "Gửi lại OTP thất bại",
);

// Bước 1 quên mật khẩu: yêu cầu gửi OTP về email.
export const forgotPasswordThunk = createApiThunk(
  "auth/forgotPassword",
  async (data) => {
    const res = await authService.forgotPassword(data);
    return res.data.data;
  },
  "Gửi OTP khôi phục mật khẩu thất bại",
);

// Bước 2 quên mật khẩu: xác thực OTP để nhận resetToken.
export const verifyForgotPasswordOtpThunk = createApiThunk(
  "auth/verifyForgotPasswordOtp",
  async (data) => {
    const res = await authService.verifyForgotPasswordOtp(data);
    return res.data.data;
  },
  "Xác thực OTP khôi phục mật khẩu thất bại",
);

// Bước 3 quên mật khẩu: đặt lại mật khẩu bằng resetToken.
export const resetPasswordThunk = createApiThunk(
  "auth/resetPassword",
  async (data) => {
    const res = await authService.resetPassword(data);
    return res.data?.data || null;
  },
  "Đặt lại mật khẩu thất bại",
);

// Lấy thông tin người dùng hiện tại (dùng để khôi phục phiên đăng nhập).
export const getUserInfoThunk = createAsyncThunk("auth/getUserInfo", async (_, { rejectWithValue }) => {
  try {
    const res = await authService.getUserInfo();
    const user = res.data?.data?.user;
    if (!user) {
      return rejectWithValue("Không lấy được thông tin (phản hồi rỗng từ server)");
    }
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Không lấy được thông tin");
  }
});

// Cập nhật hồ sơ cá nhân.
export const updateProfileThunk = createApiThunk(
  "auth/updateProfile",
  async (data) => {
    const res = await authService.updateProfile(data);
    return res.data.data.user;
  },
  "Cập nhật thất bại",
);

// Tải ảnh đại diện mới lên Cloudinary qua backend.
export const uploadAvatarThunk = createApiThunk(
  "auth/uploadAvatar",
  async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await authService.uploadAvatar(formData);
    return res.data.data.user;
  },
  "Tải ảnh lên thất bại",
);
