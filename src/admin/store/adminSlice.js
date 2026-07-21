import { createSlice } from "@reduxjs/toolkit";
import {
  getDashboardStatsThunk,
  getPendingTutorsThunk,
  approveTutorThunk,
  rejectTutorThunk,
  getAdminUsersThunk,
  updateAdminUserThunk,
  updateAdminUserStatusThunk,
  softDeleteAdminUserThunk,
  getClassApplicationsThunk,
  getClassApplicationStatsThunk,
  getClassApplicationOriginCountsThunk,
  approveClassApplicationThunk,
  rejectClassApplicationThunk,
  getPromosThunk,
  createPromoThunk,
  updatePromoThunk,
  deletePromoThunk,
  getSubjectsThunk,
  createSubjectThunk,
  updateSubjectThunk,
  getAdminClassesThunk,
  deleteAdminClassThunk,
  getTrashCountsThunk,
  getTrashItemsThunk,
  restoreTrashItemThunk,
  purgeTrashItemThunk,
  getProfileChangesThunk,
  approveProfileChangeThunk,
  rejectProfileChangeThunk,
  getApplicationCancellationsThunk,
  approveCancellationThunk,
  rejectCancellationThunk,
  getReviewTutorsThunk,
  getAdminTutorReviewsThunk,
  deleteReviewThunk,
} from "./adminThunks";

// ─────────────────────────────────────────────────────────────────────────────
// Hai bảng dưới đây thay cho phần lặp lớn nhất của slice: trước đây mỗi thunk đều
// có riêng một cặp `pending`/`rejected` chỉ để bật/tắt cờ loading (và lưu lỗi).
// Giờ chỉ còn `fulfilled` phải viết tay — vì đó mới là chỗ dữ liệu thực sự đổi.
// ─────────────────────────────────────────────────────────────────────────────

// Thunk tải danh sách: [thunk, tên cờ loading, tên trường lỗi (nếu màn đó có hiển thị lỗi)]
const LIST_THUNKS = [
  [getDashboardStatsThunk, "statsLoading"],
  [getPendingTutorsThunk, "loading", "error"],
  [getAdminUsersThunk, "usersLoading", "usersError"],
  [getClassApplicationsThunk, "classApplicationsLoading", "classApplicationsError"],
  [getClassApplicationStatsThunk, "classApplicationStatsLoading"],
  [getPromosThunk, "promosLoading", "promosError"],
  [getSubjectsThunk, "subjectsLoading", "subjectsError"],
  [getAdminClassesThunk, "classesLoading", "classesError"],
  [getTrashItemsThunk, "trashLoading", "trashError"],
  [getProfileChangesThunk, "profileChangesLoading", "profileChangesError"],
  [getApplicationCancellationsThunk, "cancellationsLoading", "cancellationsError"],
  [getReviewTutorsThunk, "reviewTutorsLoading", "reviewTutorsError"],
  [getAdminTutorReviewsThunk, "tutorReviewsLoading", "tutorReviewsError"],
];

// Thunk thao tác trên một bản ghi: [thunk, tên trường actionLoading, cách lấy id từ meta.arg].
// Mỗi thunk nhận arg một kiểu (id trần, {id}, hoặc không có id với thao tác "tạo mới")
// nên id phải lấy qua hàm chứ không thể dùng chung một biểu thức.
const ACTION_THUNKS = [
  [approveTutorThunk, "actionLoading", (arg) => arg],
  [rejectTutorThunk, "actionLoading", (arg) => arg.id],
  [updateAdminUserThunk, "userActionLoading", (arg) => arg.id],
  [updateAdminUserStatusThunk, "userActionLoading", (arg) => arg.id],
  [softDeleteAdminUserThunk, "userActionLoading", (arg) => arg],
  [approveClassApplicationThunk, "classApplicationActionLoading", (arg) => arg],
  [rejectClassApplicationThunk, "classApplicationActionLoading", (arg) => arg.id],
  [createPromoThunk, "promoActionLoading", () => "create"],
  [updatePromoThunk, "promoActionLoading", (arg) => arg.id],
  [deletePromoThunk, "promoActionLoading", (arg) => arg],
  [createSubjectThunk, "subjectActionLoading", () => "create"],
  [updateSubjectThunk, "subjectActionLoading", (arg) => arg.id],
  [deleteAdminClassThunk, "classActionLoading", (arg) => arg],
  [restoreTrashItemThunk, "trashActionLoading", (arg) => arg.id],
  [purgeTrashItemThunk, "trashActionLoading", (arg) => arg.id],
  [approveProfileChangeThunk, "profileChangeActionLoading", (arg) => arg],
  [rejectProfileChangeThunk, "profileChangeActionLoading", (arg) => arg.id],
  [approveCancellationThunk, "cancellationActionLoading", (arg) => arg],
  [rejectCancellationThunk, "cancellationActionLoading", (arg) => arg.id],
  [deleteReviewThunk, "reviewActionLoading", (arg) => arg],
];

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    dashboardStats: {
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      pendingClassApplicationsCount: 0,
      pendingProfileChangesCount: 0,
      pendingCancellationsCount: 0,
    },
    statsLoading: false,
    pendingTutors: [],
    pendingTutorsPagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    },
    loading: false,
    actionLoading: null,
    error: null,
    users: [],
    usersPagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    },
    usersLoading: false,
    usersError: null,
    userActionLoading: null,
    classApplications: [],
    classApplicationsPagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    },
    classApplicationsLoading: false,
    classApplicationsError: null,
    classApplicationActionLoading: null,
    classApplicationStats: { pending: 0, selected: 0, approved: 0, rejected: 0 },
    classApplicationStatsLoading: false,
    // Số đơn chờ duyệt theo từng mục origin (badge trên 2 tab tự ứng tuyển / được mời)
    classApplicationOriginCounts: { apply: 0, invite: 0 },
    promos: [],
    promosPagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    },
    promosLoading: false,
    promosError: null,
    promoActionLoading: null,
    subjects: [],
    subjectsLoading: false,
    subjectsError: null,
    subjectActionLoading: null,
    classes: [],
    classesPagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    },
    classesLoading: false,
    classesError: null,
    classActionLoading: null,
    trashItems: [],
    trashPagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    },
    trashLoading: false,
    trashError: null,
    trashActionLoading: null,
    trashCounts: { users: 0, classes: 0, promos: 0, reviews: 0 },
    // Quản lý đánh giá gia sư (admin)
    reviewTutors: [],
    reviewTutorsPagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
    reviewTutorsLoading: false,
    reviewTutorsError: null,
    selectedReviewTutor: null,
    tutorReviews: [],
    tutorReviewsPagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
    tutorReviewsLoading: false,
    tutorReviewsError: null,
    reviewActionLoading: null,
    profileChanges: [],
    profileChangesPagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    },
    profileChangesCounts: { all: 0, pending: 0, approved: 0, rejected: 0 },
    profileChangesLoading: false,
    profileChangesError: null,
    profileChangeActionLoading: null,
    cancellations: [],
    cancellationsPagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    },
    cancellationsCounts: { all: 0, cancel_requested: 0, cancelled: 0 },
    cancellationsLoading: false,
    cancellationsError: null,
    cancellationActionLoading: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Chỉ còn `fulfilled` viết tay — đây là nơi dữ liệu thực sự thay đổi.
    // Cờ loading/lỗi do các matcher ở cuối hàm xử lý chung cho mọi thunk.

    // ──────────────────────────── Gia sư chờ duyệt ────────────────────────────
    builder
      .addCase(getDashboardStatsThunk.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })
      .addCase(getPendingTutorsThunk.fulfilled, (state, action) => {
        state.pendingTutors = action.payload.tutors || [];
        if (action.payload.pagination) state.pendingTutorsPagination = action.payload.pagination;
      })
      .addCase(approveTutorThunk.fulfilled, (state, action) => {
        state.pendingTutors = state.pendingTutors.filter((t) => t.id !== action.payload.id);
        if (state.dashboardStats) {
          if (state.dashboardStats.pendingCount > 0) state.dashboardStats.pendingCount--;
          state.dashboardStats.approvedCount = (state.dashboardStats.approvedCount || 0) + 1;
        }
      })
      .addCase(rejectTutorThunk.fulfilled, (state, action) => {
        state.pendingTutors = state.pendingTutors.filter((t) => t.id !== action.payload.id);
        if (state.dashboardStats) {
          if (state.dashboardStats.pendingCount > 0) state.dashboardStats.pendingCount--;
          state.dashboardStats.rejectedCount = (state.dashboardStats.rejectedCount || 0) + 1;
        }
      });

    // ──────────────────────────── Người dùng ────────────────────────────
    const replaceUser = (state, action) => {
      const updated = action.payload;
      state.users = state.users.map((user) => (user.id === updated.id ? updated : user));
    };

    builder
      .addCase(getAdminUsersThunk.fulfilled, (state, action) => {
        state.users = action.payload.users || [];
        state.usersPagination = action.payload.pagination || state.usersPagination;
      })
      .addCase(updateAdminUserThunk.fulfilled, replaceUser)
      .addCase(updateAdminUserStatusThunk.fulfilled, replaceUser)
      .addCase(softDeleteAdminUserThunk.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload.id);
      });

    // ──────────────────────────── Đơn nhận lớp ────────────────────────────
    // Duyệt hay từ chối đều gỡ đơn khỏi danh sách và trừ số chờ duyệt; chỉ khác ô đếm được cộng.
    const settleClassApplication = (resultKey) => (state, action) => {
      state.classApplications = state.classApplications.filter((a) => a.id !== action.payload.id);
      if (state.classApplicationStats.pending > 0) state.classApplicationStats.pending--;
      state.classApplicationStats[resultKey]++;
      if (state.dashboardStats?.pendingClassApplicationsCount > 0) {
        state.dashboardStats.pendingClassApplicationsCount--;
      }
    };

    builder
      .addCase(getClassApplicationsThunk.fulfilled, (state, action) => {
        state.classApplications = action.payload.applications || [];
        if (action.payload.pagination) state.classApplicationsPagination = action.payload.pagination;
      })
      .addCase(getClassApplicationStatsThunk.fulfilled, (state, action) => {
        state.classApplicationStats = action.payload;
      })
      .addCase(getClassApplicationOriginCountsThunk.fulfilled, (state, action) => {
        state.classApplicationOriginCounts = action.payload;
      })
      .addCase(approveClassApplicationThunk.fulfilled, settleClassApplication("approved"))
      .addCase(rejectClassApplicationThunk.fulfilled, settleClassApplication("rejected"));

    // ──────────────────────────── Mã ưu đãi ────────────────────────────
    builder
      .addCase(getPromosThunk.fulfilled, (state, action) => {
        state.promos = action.payload.promos || [];
        state.promosPagination = action.payload.pagination || state.promosPagination;
      })
      .addCase(updatePromoThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        state.promos = state.promos.map((promo) => (promo.id === updated.id ? updated : promo));
      })
      .addCase(deletePromoThunk.fulfilled, (state, action) => {
        state.promos = state.promos.filter((promo) => promo.id !== action.payload.id);
      });

    // ──────────────────────────── Môn học ────────────────────────────
    builder
      .addCase(getSubjectsThunk.fulfilled, (state, action) => {
        state.subjects = action.payload || [];
      })
      .addCase(updateSubjectThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        state.subjects = state.subjects.map((s) => (s.id === updated.id ? updated : s));
      });

    // ──────────────────────────── Bài đăng lớp ────────────────────────────
    builder
      .addCase(getAdminClassesThunk.fulfilled, (state, action) => {
        state.classes = action.payload.classes || [];
        state.classesPagination = action.payload.pagination || state.classesPagination;
      })
      .addCase(deleteAdminClassThunk.fulfilled, (state, action) => {
        state.classes = state.classes.filter((item) => item.id !== action.payload.id);
      });

    // ──────────────────────────── Thùng rác ────────────────────────────
    // Khôi phục và xóa vĩnh viễn đều gỡ mục khỏi danh sách đang hiển thị.
    const removeTrashItem = (state, action) => {
      state.trashItems = state.trashItems.filter((item) => item.id !== action.payload.id);
    };

    builder
      .addCase(getTrashCountsThunk.fulfilled, (state, action) => {
        state.trashCounts = action.payload;
      })
      .addCase(getTrashItemsThunk.fulfilled, (state, action) => {
        state.trashItems = action.payload.items || [];
        state.trashPagination = action.payload.pagination || state.trashPagination;
      })
      .addCase(restoreTrashItemThunk.fulfilled, removeTrashItem)
      .addCase(purgeTrashItemThunk.fulfilled, removeTrashItem);

    // ──────────────────────────── Yêu cầu đổi hồ sơ ────────────────────────────
    const settleProfileChange = (resultKey) => (state, action) => {
      state.profileChanges = state.profileChanges.filter((r) => r.id !== action.payload.id);
      if (state.profileChangesCounts.pending > 0) state.profileChangesCounts.pending--;
      state.profileChangesCounts[resultKey]++;
      if (state.dashboardStats?.pendingProfileChangesCount > 0) {
        state.dashboardStats.pendingProfileChangesCount--;
      }
    };

    builder
      .addCase(getProfileChangesThunk.fulfilled, (state, action) => {
        state.profileChanges = action.payload.requests || [];
        if (action.payload.pagination) state.profileChangesPagination = action.payload.pagination;
        if (action.payload.counts) state.profileChangesCounts = action.payload.counts;
      })
      .addCase(approveProfileChangeThunk.fulfilled, settleProfileChange("approved"))
      .addCase(rejectProfileChangeThunk.fulfilled, settleProfileChange("rejected"));

    // ──────────────────────────── Hủy đơn nhận lớp ────────────────────────────
    // Chỉ khi duyệt mới cộng ô "đã hủy"; từ chối thì đơn quay lại trạng thái đang dạy.
    const settleCancellation = (countCancelled) => (state, action) => {
      state.cancellations = state.cancellations.filter((c) => c.id !== action.payload.id);
      if (state.cancellationsCounts.cancel_requested > 0) {
        state.cancellationsCounts.cancel_requested--;
      }
      if (countCancelled) state.cancellationsCounts.cancelled++;
      if (state.dashboardStats?.pendingCancellationsCount > 0) {
        state.dashboardStats.pendingCancellationsCount--;
      }
    };

    builder
      .addCase(getApplicationCancellationsThunk.fulfilled, (state, action) => {
        state.cancellations = action.payload.cancellations || [];
        if (action.payload.pagination) state.cancellationsPagination = action.payload.pagination;
        if (action.payload.counts) state.cancellationsCounts = action.payload.counts;
      })
      .addCase(approveCancellationThunk.fulfilled, settleCancellation(true))
      .addCase(rejectCancellationThunk.fulfilled, settleCancellation(false));

    // ──────────────────────────── Đánh giá gia sư ────────────────────────────
    builder
      .addCase(getReviewTutorsThunk.fulfilled, (state, action) => {
        state.reviewTutors = action.payload.tutors || [];
        if (action.payload.pagination) state.reviewTutorsPagination = action.payload.pagination;
      })
      .addCase(getAdminTutorReviewsThunk.fulfilled, (state, action) => {
        state.tutorReviews = action.payload.reviews || [];
        state.selectedReviewTutor = action.payload.tutor || state.selectedReviewTutor;
        if (action.payload.pagination) state.tutorReviewsPagination = action.payload.pagination;
      })
      .addCase(deleteReviewThunk.fulfilled, (state, action) => {
        state.tutorReviews = state.tutorReviews.filter((r) => r.id !== action.payload.id);
      });

    // ──────────────────────────── Cờ loading/lỗi dùng chung ────────────────────────────
    // RTK bắt buộc mọi addMatcher phải đứng sau toàn bộ addCase.
    LIST_THUNKS.forEach(([thunk, loadingKey, errorKey]) => {
      builder
        .addMatcher(thunk.pending.match, (state) => {
          state[loadingKey] = true;
          if (errorKey) state[errorKey] = null;
        })
        .addMatcher(thunk.fulfilled.match, (state) => {
          state[loadingKey] = false;
        })
        .addMatcher(thunk.rejected.match, (state, action) => {
          state[loadingKey] = false;
          if (errorKey) state[errorKey] = action.payload;
        });
    });

    ACTION_THUNKS.forEach(([thunk, loadingKey, argId]) => {
      builder
        .addMatcher(thunk.pending.match, (state, action) => {
          state[loadingKey] = argId(action.meta.arg);
        })
        .addMatcher(thunk.settled, (state) => {
          state[loadingKey] = null;
        });
    });
  },
});

export default adminSlice.reducer;
