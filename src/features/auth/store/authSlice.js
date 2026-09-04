import { createSlice } from "@reduxjs/toolkit";
import {
  loginThunk,
  googleLoginThunk,
  registerThunk,
  verifyOtpThunk,
  logoutThunk,
  restoreSessionThunk,
  getUserInfoThunk,
  updateProfileThunk,
  uploadAvatarThunk,
} from "./authThunks";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

const clearSessionState = (state) => {
  state.user = null;
  state.isAuthenticated = false;
  state.loading = false;
  state.error = null;
  state.initialized = true;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearCredentials: clearSessionState,
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Google Login
    builder
      .addCase(googleLoginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify OTP đăng ký đồng thời hoàn tất đăng nhập.
    builder
      .addCase(verifyOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Logout phía client luôn hoàn tất kể cả khi request thu hồi phiên bị lỗi.
    builder
      .addCase(logoutThunk.fulfilled, clearSessionState)
      .addCase(logoutThunk.rejected, clearSessionState);

    // Khôi phục phiên từ refresh-token cookie trước khi render router.
    builder
      .addCase(restoreSessionThunk.pending, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = false;
      })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(restoreSessionThunk.rejected, clearSessionState);

    // Đồng bộ lại hồ sơ trong phiên hiện tại mà không thay đổi trạng thái bootstrap.
    builder.addCase(getUserInfoThunk.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    });

    // Update profile
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Upload avatar
    builder
      .addCase(uploadAvatarThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatarThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(uploadAvatarThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
