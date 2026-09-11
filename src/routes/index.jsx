// File cấu hình route: khai báo component lazy cạnh export `router` nên tắt luật Fast Refresh.
/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// Layout & guard giữ eager: chúng là khung dùng chung cho mọi route và cần có sẵn ngay.
import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/admin/layouts/AdminLayout";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import GuestRoute from "@/components/shared/GuestRoute";
import PageLoader from "@/components/shared/PageLoader";

// Các trang tải theo nhu cầu (React.lazy) để mỗi route thành một chunk riêng.
const HomePage = lazy(() => import("@/pages/HomePage"));
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));
const CompleteProfilePage = lazy(() => import("@/features/profile/pages/CompleteProfilePage"));
const RegisterTutorPage = lazy(() => import("@/features/tutors/pages/RegisterTutorPage"));
const TutorListingPage = lazy(() => import("@/features/tutors/pages/TutorListingPage"));
const TutorDetailPage = lazy(() => import("@/features/tutors/pages/TutorDetailPage"));
const FindTutorRequestPage = lazy(() => import("@/features/classes/pages/FindTutorRequestPage"));
const NewClassesPage = lazy(() => import("@/features/classes/pages/NewClassesPage"));
const NewClassDetailPage = lazy(() => import("@/features/classes/pages/NewClassDetailPage"));
const MyClassesPage = lazy(() => import("@/features/classes/pages/MyClassesPage"));
const MyPostsPage = lazy(() => import("@/features/classes/pages/MyPostsPage"));
const ClassInvitationsPage = lazy(() => import("@/features/classes/pages/ClassInvitationsPage"));
const ContractTemplatePage = lazy(() => import("@/features/classes/pages/ContractTemplatePage"));
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage"));
const MyVouchersPage = lazy(() => import("@/features/vouchers/pages/MyVouchersPage"));
const MyReviewsPage = lazy(() => import("@/features/reviews/pages/MyReviewsPage"));
const MyPaymentsPage = lazy(() => import("@/features/payments/pages/MyPaymentsPage"));

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const VerifyOtpPage = lazy(() => import("@/features/auth/pages/VerifyOtpPage"));
const ResendOtpPage = lazy(() => import("@/features/auth/pages/ResendOtpPage"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage"));
const VerifyForgotPasswordOtpPage = lazy(() => import("@/features/auth/pages/VerifyForgotPasswordOtpPage"));
const ResetPasswordPage = lazy(() => import("@/features/auth/pages/ResetPasswordPage"));

const TutorApprovalPage = lazy(() => import("@/admin/pages/TutorApprovalPage"));
const AdminDashboardPage = lazy(() => import("@/admin/pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("@/admin/pages/AdminUsersPage"));
const ClassApplicationsPage = lazy(() => import("@/admin/pages/ClassApplicationsPage"));
const AdminClassesPage = lazy(() => import("@/admin/pages/AdminClassesPage"));
const AdminPromosPage = lazy(() => import("@/admin/pages/AdminPromosPage"));
const AdminSubjectsPage = lazy(() => import("@/admin/pages/AdminSubjectsPage"));
const AdminTrashPage = lazy(() => import("@/admin/pages/AdminTrashPage"));
const AdminSettingsPage = lazy(() => import("@/admin/pages/AdminSettingsPage"));
const AdminProfileChangesPage = lazy(() => import("@/admin/pages/AdminProfileChangesPage"));
const AdminApplicationCancellationsPage = lazy(
  () => import("@/admin/pages/AdminApplicationCancellationsPage"),
);
const AdminReviewsPage = lazy(() => import("@/admin/pages/AdminReviewsPage"));
const AdminNotificationsPage = lazy(() => import("@/admin/pages/AdminNotificationsPage"));
const AdminMessagesPage = lazy(() => import("@/admin/pages/AdminMessagesPage"));
const AdminPaymentsPage = lazy(() => import("@/admin/pages/AdminPaymentsPage"));
const AdminStatsPage = lazy(() => import("@/admin/pages/AdminStatsPage"));

const router = createBrowserRouter([
  // Auth routes (chỉ dành cho khách, đã đăng nhập sẽ redirect về trang chủ)
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/verify-otp", element: <VerifyOtpPage /> },
          { path: "/resend-otp", element: <ResendOtpPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/verify-forgot-password-otp", element: <VerifyForgotPasswordOtpPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
        ],
      },
    ],
  },

  // Public routes
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/register-tutor", element: <RegisterTutorPage /> },
      { path: "/tutors", element: <TutorListingPage /> },
      { path: "/tutors/:id", element: <TutorDetailPage /> },
      { path: "/find-tutor", element: <FindTutorRequestPage /> },
      { path: "/classes", element: <NewClassesPage /> },
      { path: "/classes/:id", element: <NewClassDetailPage /> },
      { path: "/contract-template", element: <ContractTemplatePage /> },
    ],
  },

  // Protected routes (cần đăng nhập, bỏ qua kiểm tra profile hoàn chỉnh)
  // Route này không nằm trong layout nào nên bọc Suspense tại chỗ.
  {
    element: <ProtectedRoute skipProfileCheck />,
    children: [
      {
        path: "/complete-profile",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CompleteProfilePage />
          </Suspense>
        ),
      },
    ],
  },

  // Protected routes (cần đăng nhập + profile đầy đủ)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/profile", element: <ProfilePage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/my-posts", element: <MyPostsPage /> },
          { path: "/find-tutor/edit/:id", element: <FindTutorRequestPage /> },
          { path: "/my-vouchers", element: <MyVouchersPage /> },
        ],
      },
    ],
  },

  // Protected routes dành riêng cho gia sư
  {
    element: <ProtectedRoute allowedRoles={["tutor"]} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/my-classes", element: <MyClassesPage /> },
          { path: "/class-invitations", element: <ClassInvitationsPage /> },
          { path: "/my-reviews", element: <MyReviewsPage /> },
          { path: "/my-payments", element: <MyPaymentsPage /> },
        ],
      },
    ],
  },

  // Admin routes (bảo vệ trong AdminLayout)
  {
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <AdminDashboardPage /> },
      { path: "/admin/statistics", element: <AdminStatsPage /> },
      { path: "/admin/payments", element: <AdminPaymentsPage /> },
      { path: "/admin/notifications", element: <AdminNotificationsPage /> },
      { path: "/admin/users", element: <AdminUsersPage /> },
      { path: "/admin/messages", element: <AdminMessagesPage /> },
      { path: "/admin/tutors", element: <TutorApprovalPage /> },
      { path: "/admin/class-applications", element: <ClassApplicationsPage /> },
      { path: "/admin/application-cancellations", element: <AdminApplicationCancellationsPage /> },
      { path: "/admin/reviews", element: <AdminReviewsPage /> },
      { path: "/admin/profile-changes", element: <AdminProfileChangesPage /> },
      { path: "/admin/classes", element: <AdminClassesPage /> },
      { path: "/admin/promos", element: <AdminPromosPage /> },
      { path: "/admin/subjects", element: <AdminSubjectsPage /> },
      { path: "/admin/trash", element: <AdminTrashPage /> },
      { path: "/admin/settings", element: <AdminSettingsPage /> },
    ],
  },
]);

export default router;
