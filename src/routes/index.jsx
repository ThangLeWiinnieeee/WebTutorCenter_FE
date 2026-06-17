import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import GuestRoute from "@/components/shared/GuestRoute";
import HomePage from "@/pages/HomePage";
import { ProfilePage, CompleteProfilePage } from "@/features/profile";
import { RegisterTutorPage, TutorListingPage, TutorDetailPage } from "@/features/tutors";
import {
  FindTutorRequestPage,
  NewClassesPage,
  NewClassDetailPage,
} from "@/features/classes";
import { AdminLayout, TutorApprovalPage, AdminDashboardPage, AdminUsersPage } from "@/admin";

import {
  LoginPage,
  RegisterPage,
  VerifyOtpPage,
  ResendOtpPage,
  ForgotPasswordPage,
  VerifyForgotPasswordOtpPage,
  ResetPasswordPage,
} from "@/features/auth";

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
    ],
  },

  // Protected routes (cần đăng nhập, bỏ qua kiểm tra profile hoàn chỉnh)
  {
    element: <ProtectedRoute skipProfileCheck />,
    children: [
      { path: "/complete-profile", element: <CompleteProfilePage /> },
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
        ],
      },
    ],
  },

  // Admin routes (bảo vệ trong AdminLayout)
  {
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <AdminDashboardPage /> },
      { path: "/admin/users", element: <AdminUsersPage /> },
      { path: "/admin/tutors", element: <TutorApprovalPage /> },
    ],
  },
]);

export default router;
