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
    builder
      .addCase(getDashboardStatsThunk.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(getDashboardStatsThunk.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStatsThunk.rejected, (state) => {
        state.statsLoading = false;
      });

    builder
      .addCase(getPendingTutorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingTutorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingTutors = action.payload.tutors || [];
        if (action.payload.pagination) state.pendingTutorsPagination = action.payload.pagination;
      })
      .addCase(getPendingTutorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(approveTutorThunk.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(approveTutorThunk.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.pendingTutors = state.pendingTutors.filter(
          (t) => t.id !== action.payload.id
        );
        if (state.dashboardStats) {
          if (state.dashboardStats.pendingCount > 0) state.dashboardStats.pendingCount--;
          state.dashboardStats.approvedCount = (state.dashboardStats.approvedCount || 0) + 1;
        }
      })
      .addCase(approveTutorThunk.rejected, (state) => {
        state.actionLoading = null;
      });

    builder
      .addCase(rejectTutorThunk.pending, (state, action) => {
        state.actionLoading = action.meta.arg.id;
      })
      .addCase(rejectTutorThunk.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.pendingTutors = state.pendingTutors.filter(
          (t) => t.id !== action.payload.id
        );
        if (state.dashboardStats) {
          if (state.dashboardStats.pendingCount > 0) state.dashboardStats.pendingCount--;
          state.dashboardStats.rejectedCount = (state.dashboardStats.rejectedCount || 0) + 1;
        }
      })
      .addCase(rejectTutorThunk.rejected, (state) => {
        state.actionLoading = null;
      });

    builder
      .addCase(getAdminUsersThunk.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(getAdminUsersThunk.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.users || [];
        state.usersPagination = action.payload.pagination || state.usersPagination;
      })
      .addCase(getAdminUsersThunk.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      });

    builder
      .addCase(updateAdminUserThunk.pending, (state, action) => {
        state.userActionLoading = action.meta.arg.id;
      })
      .addCase(updateAdminUserThunk.fulfilled, (state, action) => {
        state.userActionLoading = null;
        const updatedUser = action.payload;
        state.users = state.users.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        );
      })
      .addCase(updateAdminUserThunk.rejected, (state) => {
        state.userActionLoading = null;
      });

    builder
      .addCase(updateAdminUserStatusThunk.pending, (state, action) => {
        state.userActionLoading = action.meta.arg.id;
      })
      .addCase(updateAdminUserStatusThunk.fulfilled, (state, action) => {
        state.userActionLoading = null;
        const updatedUser = action.payload;
        state.users = state.users.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        );
      })
      .addCase(updateAdminUserStatusThunk.rejected, (state) => {
        state.userActionLoading = null;
      });

    builder
      .addCase(softDeleteAdminUserThunk.pending, (state, action) => {
        state.userActionLoading = action.meta.arg;
      })
      .addCase(softDeleteAdminUserThunk.fulfilled, (state, action) => {
        state.userActionLoading = null;
        const deletedUser = action.payload;
        state.users = state.users.filter((user) => user.id !== deletedUser.id);
      })
      .addCase(softDeleteAdminUserThunk.rejected, (state) => {
        state.userActionLoading = null;
      });

    builder
      .addCase(getClassApplicationsThunk.pending, (state) => {
        state.classApplicationsLoading = true;
        state.classApplicationsError = null;
      })
      .addCase(getClassApplicationsThunk.fulfilled, (state, action) => {
        state.classApplicationsLoading = false;
        state.classApplications = action.payload.applications || [];
        if (action.payload.pagination) state.classApplicationsPagination = action.payload.pagination;
      })
      .addCase(getClassApplicationsThunk.rejected, (state, action) => {
        state.classApplicationsLoading = false;
        state.classApplicationsError = action.payload;
      });

    builder
      .addCase(getClassApplicationStatsThunk.pending, (state) => {
        state.classApplicationStatsLoading = true;
      })
      .addCase(getClassApplicationStatsThunk.fulfilled, (state, action) => {
        state.classApplicationStatsLoading = false;
        state.classApplicationStats = action.payload;
      })
      .addCase(getClassApplicationStatsThunk.rejected, (state) => {
        state.classApplicationStatsLoading = false;
      });

    builder
      .addCase(approveClassApplicationThunk.pending, (state, action) => {
        state.classApplicationActionLoading = action.meta.arg;
      })
      .addCase(approveClassApplicationThunk.fulfilled, (state, action) => {
        state.classApplicationActionLoading = null;
        state.classApplications = state.classApplications.filter(
          (a) => a.id !== action.payload.id
        );
        if (state.classApplicationStats.pending > 0) state.classApplicationStats.pending--;
        state.classApplicationStats.approved++;
        if (state.dashboardStats?.pendingClassApplicationsCount > 0) {
          state.dashboardStats.pendingClassApplicationsCount--;
        }
      })
      .addCase(approveClassApplicationThunk.rejected, (state) => {
        state.classApplicationActionLoading = null;
      });

    builder
      .addCase(rejectClassApplicationThunk.pending, (state, action) => {
        state.classApplicationActionLoading = action.meta.arg.id;
      })
      .addCase(rejectClassApplicationThunk.fulfilled, (state, action) => {
        state.classApplicationActionLoading = null;
        state.classApplications = state.classApplications.filter(
          (a) => a.id !== action.payload.id
        );
        if (state.classApplicationStats.pending > 0) state.classApplicationStats.pending--;
        state.classApplicationStats.rejected++;
        if (state.dashboardStats?.pendingClassApplicationsCount > 0) {
          state.dashboardStats.pendingClassApplicationsCount--;
        }
      })
      .addCase(rejectClassApplicationThunk.rejected, (state) => {
        state.classApplicationActionLoading = null;
      });

    // ──────────────────────────── Promo ────────────────────────────
    builder
      .addCase(getPromosThunk.pending, (state) => {
        state.promosLoading = true;
        state.promosError = null;
      })
      .addCase(getPromosThunk.fulfilled, (state, action) => {
        state.promosLoading = false;
        state.promos = action.payload.promos || [];
        state.promosPagination = action.payload.pagination || state.promosPagination;
      })
      .addCase(getPromosThunk.rejected, (state, action) => {
        state.promosLoading = false;
        state.promosError = action.payload;
      });

    builder
      .addCase(createPromoThunk.pending, (state) => {
        state.promoActionLoading = "create";
      })
      .addCase(createPromoThunk.fulfilled, (state) => {
        state.promoActionLoading = null;
      })
      .addCase(createPromoThunk.rejected, (state) => {
        state.promoActionLoading = null;
      });

    builder
      .addCase(updatePromoThunk.pending, (state, action) => {
        state.promoActionLoading = action.meta.arg.id;
      })
      .addCase(updatePromoThunk.fulfilled, (state, action) => {
        state.promoActionLoading = null;
        const updated = action.payload;
        state.promos = state.promos.map((promo) => (promo.id === updated.id ? updated : promo));
      })
      .addCase(updatePromoThunk.rejected, (state) => {
        state.promoActionLoading = null;
      });

    builder
      .addCase(deletePromoThunk.pending, (state, action) => {
        state.promoActionLoading = action.meta.arg;
      })
      .addCase(deletePromoThunk.fulfilled, (state, action) => {
        state.promoActionLoading = null;
        state.promos = state.promos.filter((promo) => promo.id !== action.payload.id);
      })
      .addCase(deletePromoThunk.rejected, (state) => {
        state.promoActionLoading = null;
      });

    // ──────────────────────────── Subject (môn học) ────────────────────────────
    builder
      .addCase(getSubjectsThunk.pending, (state) => {
        state.subjectsLoading = true;
        state.subjectsError = null;
      })
      .addCase(getSubjectsThunk.fulfilled, (state, action) => {
        state.subjectsLoading = false;
        state.subjects = action.payload || [];
      })
      .addCase(getSubjectsThunk.rejected, (state, action) => {
        state.subjectsLoading = false;
        state.subjectsError = action.payload;
      });

    builder
      .addCase(createSubjectThunk.pending, (state) => {
        state.subjectActionLoading = "create";
      })
      .addCase(createSubjectThunk.fulfilled, (state) => {
        state.subjectActionLoading = null;
      })
      .addCase(createSubjectThunk.rejected, (state) => {
        state.subjectActionLoading = null;
      });

    builder
      .addCase(updateSubjectThunk.pending, (state, action) => {
        state.subjectActionLoading = action.meta.arg.id;
      })
      .addCase(updateSubjectThunk.fulfilled, (state, action) => {
        state.subjectActionLoading = null;
        const updated = action.payload;
        state.subjects = state.subjects.map((s) => (s.id === updated.id ? updated : s));
      })
      .addCase(updateSubjectThunk.rejected, (state) => {
        state.subjectActionLoading = null;
      });

    // ──────────────────────────── Class (bài đăng) ────────────────────────────
    builder
      .addCase(getAdminClassesThunk.pending, (state) => {
        state.classesLoading = true;
        state.classesError = null;
      })
      .addCase(getAdminClassesThunk.fulfilled, (state, action) => {
        state.classesLoading = false;
        state.classes = action.payload.classes || [];
        state.classesPagination = action.payload.pagination || state.classesPagination;
      })
      .addCase(getAdminClassesThunk.rejected, (state, action) => {
        state.classesLoading = false;
        state.classesError = action.payload;
      });

    builder
      .addCase(deleteAdminClassThunk.pending, (state, action) => {
        state.classActionLoading = action.meta.arg;
      })
      .addCase(deleteAdminClassThunk.fulfilled, (state, action) => {
        state.classActionLoading = null;
        state.classes = state.classes.filter((item) => item.id !== action.payload.id);
      })
      .addCase(deleteAdminClassThunk.rejected, (state) => {
        state.classActionLoading = null;
      });

    // ──────────────────────────── Trash (thùng rác) ────────────────────────────
    builder
      .addCase(getTrashCountsThunk.fulfilled, (state, action) => {
        state.trashCounts = action.payload;
      });

    builder
      .addCase(getTrashItemsThunk.pending, (state) => {
        state.trashLoading = true;
        state.trashError = null;
      })
      .addCase(getTrashItemsThunk.fulfilled, (state, action) => {
        state.trashLoading = false;
        state.trashItems = action.payload.items || [];
        state.trashPagination = action.payload.pagination || state.trashPagination;
      })
      .addCase(getTrashItemsThunk.rejected, (state, action) => {
        state.trashLoading = false;
        state.trashError = action.payload;
      });

    const handleTrashRemoval = (state, action) => {
      state.trashActionLoading = null;
      state.trashItems = state.trashItems.filter((item) => item.id !== action.payload.id);
    };

    builder
      .addCase(restoreTrashItemThunk.pending, (state, action) => {
        state.trashActionLoading = action.meta.arg.id;
      })
      .addCase(restoreTrashItemThunk.fulfilled, handleTrashRemoval)
      .addCase(restoreTrashItemThunk.rejected, (state) => {
        state.trashActionLoading = null;
      });

    builder
      .addCase(purgeTrashItemThunk.pending, (state, action) => {
        state.trashActionLoading = action.meta.arg.id;
      })
      .addCase(purgeTrashItemThunk.fulfilled, handleTrashRemoval)
      .addCase(purgeTrashItemThunk.rejected, (state) => {
        state.trashActionLoading = null;
      });

    // ──────────────────────────── Profile change requests (gia sư đổi hồ sơ) ────────────────────────────
    builder
      .addCase(getProfileChangesThunk.pending, (state) => {
        state.profileChangesLoading = true;
        state.profileChangesError = null;
      })
      .addCase(getProfileChangesThunk.fulfilled, (state, action) => {
        state.profileChangesLoading = false;
        state.profileChanges = action.payload.requests || [];
        if (action.payload.pagination) state.profileChangesPagination = action.payload.pagination;
        if (action.payload.counts) state.profileChangesCounts = action.payload.counts;
      })
      .addCase(getProfileChangesThunk.rejected, (state, action) => {
        state.profileChangesLoading = false;
        state.profileChangesError = action.payload;
      });

    builder
      .addCase(approveProfileChangeThunk.pending, (state, action) => {
        state.profileChangeActionLoading = action.meta.arg;
      })
      .addCase(approveProfileChangeThunk.fulfilled, (state, action) => {
        state.profileChangeActionLoading = null;
        state.profileChanges = state.profileChanges.filter((r) => r.id !== action.payload.id);
        if (state.profileChangesCounts.pending > 0) state.profileChangesCounts.pending--;
        state.profileChangesCounts.approved++;
        if (state.dashboardStats?.pendingProfileChangesCount > 0) {
          state.dashboardStats.pendingProfileChangesCount--;
        }
      })
      .addCase(approveProfileChangeThunk.rejected, (state) => {
        state.profileChangeActionLoading = null;
      });

    builder
      .addCase(rejectProfileChangeThunk.pending, (state, action) => {
        state.profileChangeActionLoading = action.meta.arg.id;
      })
      .addCase(rejectProfileChangeThunk.fulfilled, (state, action) => {
        state.profileChangeActionLoading = null;
        state.profileChanges = state.profileChanges.filter((r) => r.id !== action.payload.id);
        if (state.profileChangesCounts.pending > 0) state.profileChangesCounts.pending--;
        state.profileChangesCounts.rejected++;
        if (state.dashboardStats?.pendingProfileChangesCount > 0) {
          state.dashboardStats.pendingProfileChangesCount--;
        }
      })
      .addCase(rejectProfileChangeThunk.rejected, (state) => {
        state.profileChangeActionLoading = null;
      });

    // ──────────────────────────── Hủy đơn nhận lớp ────────────────────────────
    builder
      .addCase(getApplicationCancellationsThunk.pending, (state) => {
        state.cancellationsLoading = true;
        state.cancellationsError = null;
      })
      .addCase(getApplicationCancellationsThunk.fulfilled, (state, action) => {
        state.cancellationsLoading = false;
        state.cancellations = action.payload.cancellations || [];
        if (action.payload.pagination) state.cancellationsPagination = action.payload.pagination;
        if (action.payload.counts) state.cancellationsCounts = action.payload.counts;
      })
      .addCase(getApplicationCancellationsThunk.rejected, (state, action) => {
        state.cancellationsLoading = false;
        state.cancellationsError = action.payload;
      });

    builder
      .addCase(approveCancellationThunk.pending, (state, action) => {
        state.cancellationActionLoading = action.meta.arg;
      })
      .addCase(approveCancellationThunk.fulfilled, (state, action) => {
        state.cancellationActionLoading = null;
        state.cancellations = state.cancellations.filter((c) => c.id !== action.payload.id);
        if (state.cancellationsCounts.cancel_requested > 0) state.cancellationsCounts.cancel_requested--;
        state.cancellationsCounts.cancelled++;
        if (state.dashboardStats?.pendingCancellationsCount > 0) {
          state.dashboardStats.pendingCancellationsCount--;
        }
      })
      .addCase(approveCancellationThunk.rejected, (state) => {
        state.cancellationActionLoading = null;
      });

    builder
      .addCase(rejectCancellationThunk.pending, (state, action) => {
        state.cancellationActionLoading = action.meta.arg.id;
      })
      .addCase(rejectCancellationThunk.fulfilled, (state, action) => {
        state.cancellationActionLoading = null;
        state.cancellations = state.cancellations.filter((c) => c.id !== action.payload.id);
        if (state.cancellationsCounts.cancel_requested > 0) state.cancellationsCounts.cancel_requested--;
        if (state.dashboardStats?.pendingCancellationsCount > 0) {
          state.dashboardStats.pendingCancellationsCount--;
        }
      })
      .addCase(rejectCancellationThunk.rejected, (state) => {
        state.cancellationActionLoading = null;
      });

    // ──────────────────────────── Review (đánh giá gia sư) ────────────────────────────
    builder
      .addCase(getReviewTutorsThunk.pending, (state) => {
        state.reviewTutorsLoading = true;
        state.reviewTutorsError = null;
      })
      .addCase(getReviewTutorsThunk.fulfilled, (state, action) => {
        state.reviewTutorsLoading = false;
        state.reviewTutors = action.payload.tutors || [];
        if (action.payload.pagination) state.reviewTutorsPagination = action.payload.pagination;
      })
      .addCase(getReviewTutorsThunk.rejected, (state, action) => {
        state.reviewTutorsLoading = false;
        state.reviewTutorsError = action.payload;
      });

    builder
      .addCase(getAdminTutorReviewsThunk.pending, (state) => {
        state.tutorReviewsLoading = true;
        state.tutorReviewsError = null;
      })
      .addCase(getAdminTutorReviewsThunk.fulfilled, (state, action) => {
        state.tutorReviewsLoading = false;
        state.tutorReviews = action.payload.reviews || [];
        state.selectedReviewTutor = action.payload.tutor || state.selectedReviewTutor;
        if (action.payload.pagination) state.tutorReviewsPagination = action.payload.pagination;
      })
      .addCase(getAdminTutorReviewsThunk.rejected, (state, action) => {
        state.tutorReviewsLoading = false;
        state.tutorReviewsError = action.payload;
      });

    builder
      .addCase(deleteReviewThunk.pending, (state, action) => {
        state.reviewActionLoading = action.meta.arg;
      })
      .addCase(deleteReviewThunk.fulfilled, (state, action) => {
        state.reviewActionLoading = null;
        state.tutorReviews = state.tutorReviews.filter((r) => r.id !== action.payload.id);
      })
      .addCase(deleteReviewThunk.rejected, (state) => {
        state.reviewActionLoading = null;
      });
  },
});

export default adminSlice.reducer;
