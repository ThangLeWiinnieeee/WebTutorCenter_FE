import { createAsyncThunk } from "@reduxjs/toolkit";
import authService from "@/features/auth/services/authService";
import tokenStorage from "@/utils/tokenStorage";

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đăng ký thất bại");
    }
  }
);

export const googleLoginThunk = createAsyncThunk(
  "auth/googleLogin",
  async (credential, { rejectWithValue }) => {
    try {
      const res = await authService.googleLogin({ credential });
      const { accessToken, user } = res.data.data;
      tokenStorage.set(accessToken);
      return { accessToken, user };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đăng nhập Google thất bại");
    }
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.login(data);
      const { accessToken, user } = res.data.data;
      tokenStorage.set(accessToken);
      return { accessToken, user };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đăng nhập thất bại");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      tokenStorage.remove();
    } catch (err) {
      tokenStorage.remove();
      return rejectWithValue(err.response?.data?.message || "Đăng xuất thất bại");
    }
  }
);

export const verifyOtpThunk = createAsyncThunk(
  "auth/verifyOtp",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.verifyOtp(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xác thực OTP thất bại");
    }
  }
);

export const resendOtpThunk = createAsyncThunk(
  "auth/resendOtp",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.resendOtp(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gửi lại OTP thất bại");
    }
  }
);

export const getUserInfoThunk = createAsyncThunk(
  "auth/getUserInfo",
  async (_, { rejectWithValue }) => {
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
  }
);

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.updateProfile(data);
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Cập nhật thất bại");
    }
  }
);

export const uploadAvatarThunk = createAsyncThunk(
  "auth/uploadAvatar",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await authService.uploadAvatar(formData);
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Tải ảnh lên thất bại");
    }
  }
);
