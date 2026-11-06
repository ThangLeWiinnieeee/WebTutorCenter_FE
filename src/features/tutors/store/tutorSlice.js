import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { logoutThunk } from "@/features/auth/store/authThunks";
import { clearCredentials } from "@/features/auth/store/authSlice";
import {
  registerTutorThunk,
  getTutorProfileThunk,
  getTopTutorsThunk,
  getTopTutorsThisMonthThunk,
  getNewTutorsThunk,
  searchTutorsThunk,
  fetchMyProfileChangeRequestThunk,
  requestProfileChangeThunk,
  verifyCccdThunk,
} from "./tutorThunks";

const initialState = {
  // Profile
  profile: null,
  profileChangeRequest: null, // yêu cầu đổi hồ sơ đang chờ duyệt (null nếu không có)
  submittingProfileChange: false,

  // Danh sách
  topTutors: [],
  topTutorsThisMonth: [],
  newTutors: [],
  searchResults: [],
  totalResults: 0,
  currentPage: 1,
  searchRequestId: null, // chỉ nhận kết quả của lần tìm mới nhất

  // Filter & state
  filters: {},
  loading: false,
  error: null,
  registered: false,
  verifyingCccd: false,
  cccdVerification: null,
};

const tutorSlice = createSlice({
  name: "tutors",
  initialState,
  reducers: {
    clearTutorState: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.registered = false;
      state.verifyingCccd = false;
      state.cccdVerification = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    clearCccdVerification: (state) => {
      state.cccdVerification = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerTutorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerTutorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.registered = true;
      })
      .addCase(registerTutorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(verifyCccdThunk.pending, (state) => {
        state.verifyingCccd = true;
        state.cccdVerification = null;
      })
      .addCase(verifyCccdThunk.fulfilled, (state, action) => {
        state.verifyingCccd = false;
        state.cccdVerification = action.payload;
      })
      .addCase(verifyCccdThunk.rejected, (state) => {
        state.verifyingCccd = false;
      });

    // Get Profile
    builder
      .addCase(getTutorProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTutorProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getTutorProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Top Tutors
    builder
      .addCase(getTopTutorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopTutorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.topTutors = action.payload;
      })
      .addCase(getTopTutorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Top Tutors This Month
    builder
      .addCase(getTopTutorsThisMonthThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopTutorsThisMonthThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.topTutorsThisMonth = action.payload;
      })
      .addCase(getTopTutorsThisMonthThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get New Tutors
    builder
      .addCase(getNewTutorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNewTutorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.newTutors = action.payload;
      })
      .addCase(getNewTutorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Profile change request (gia sư đổi hồ sơ)
    builder
      .addCase(fetchMyProfileChangeRequestThunk.fulfilled, (state, action) => {
        state.profileChangeRequest = action.payload;
      })
      .addCase(requestProfileChangeThunk.pending, (state) => {
        state.submittingProfileChange = true;
        state.error = null;
      })
      .addCase(requestProfileChangeThunk.fulfilled, (state, action) => {
        state.submittingProfileChange = false;
        state.profileChangeRequest = action.payload;
      })
      .addCase(requestProfileChangeThunk.rejected, (state, action) => {
        state.submittingProfileChange = false;
        state.error = action.payload;
      });

    // Search Tutors
    builder
      .addCase(searchTutorsThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.searchRequestId = action.meta.requestId;
      })
      .addCase(searchTutorsThunk.fulfilled, (state, action) => {
        // Bỏ kết quả về muộn của lần tìm cũ (vd: của tài khoản trước khi đổi tài khoản)
        if (action.meta.requestId !== state.searchRequestId) return;
        state.loading = false;
        state.searchResults = action.payload.tutors || [];
        state.totalResults = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(searchTutorsThunk.rejected, (state, action) => {
        if (action.meta.requestId !== state.searchRequestId) return;
        state.loading = false;
        state.error = action.payload;
      });

    // Thứ tự /tutors cá nhân hóa theo tài khoản → hết phiên thì xóa để người sau không thấy
    builder.addMatcher(isAnyOf(logoutThunk.fulfilled, logoutThunk.rejected, clearCredentials), (state) => {
      state.searchResults = [];
      state.totalResults = 0;
      state.searchRequestId = null;
    });
  },
});

export const { clearTutorState, setFilters, clearFilters, clearCccdVerification } = tutorSlice.actions;
export default tutorSlice.reducer;
