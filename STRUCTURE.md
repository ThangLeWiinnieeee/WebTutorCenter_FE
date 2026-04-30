# Cấu trúc thư mục - Frontend (WebTutorCenter_FE)

> **Stack:** React 19, Vite, Redux Toolkit, React Router v7, Tailwind CSS v4, shadcn/ui, React Hook Form, Zod, Axios, Sonner.

## Tổng quan

```text
WebTutorCenter_FE/
├── src/
│   ├── App.jsx                       # Gốc app: AuthBootstrap, RouterProvider, Toaster
│   ├── main.jsx                      # Entry React: GoogleOAuthProvider, Redux Provider
│   ├── index.css                     # Tailwind v4, shadcn theme vars, global focus/cursor CSS
│   ├── app/
│   │   └── store.js                  # reducers: auth, tutors, admin, notifications
│   ├── admin/
│   │   ├── index.js                  # Barrel export admin
│   │   ├── components/
│   │   │   └── TutorApprovalCard.jsx # Card duyệt/từ chối hồ sơ gia sư
│   │   ├── layouts/
│   │   │   └── AdminLayout.jsx       # Layout admin routes
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   └── TutorApprovalPage.jsx
│   │   ├── services/
│   │   │   └── adminService.js       # API admin tutor approval
│   │   └── store/
│   │       ├── adminSlice.js
│   │       └── adminThunks.js
│   ├── components/
│   │   ├── shared/
│   │   │   ├── GuestRoute.jsx
│   │   │   ├── Header.jsx            # Header + profile + NotificationBell + tutor link
│   │   │   └── ProtectedRoute.jsx
│   │   └── ui/
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── form.jsx
│   │       ├── input.jsx
│   │       ├── label.jsx
│   │       └── select.jsx
│   ├── constants/
│   │   └── apiEndpoints.js           # AUTH, TUTORS, ADMIN, LOCATIONS, NOTIFICATIONS
│   ├── features/
│   │   ├── auth/
│   │   │   ├── index.js
│   │   │   ├── components/
│   │   │   │   ├── AuthBootstrap.jsx # Restore session + fetch notifications khi user đổi
│   │   │   │   ├── AuthLeftPanel.jsx
│   │   │   │   ├── login/
│   │   │   │   │   └── LoginForm.jsx
│   │   │   │   └── register/
│   │   │   │       ├── RegisterForm.jsx
│   │   │   │       └── VerifyOtpForm.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.js
│   │   │   ├── pages/
│   │   │   │   ├── ForgotPasswordPage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   ├── ResendOtpPage.jsx
│   │   │   │   ├── ResetPasswordPage.jsx
│   │   │   │   ├── VerifyForgotPasswordOtpPage.jsx
│   │   │   │   └── VerifyOtpPage.jsx
│   │   │   ├── schemas/
│   │   │   │   └── authSchema.js
│   │   │   ├── services/
│   │   │   │   └── authService.js
│   │   │   └── store/
│   │   │       ├── authSlice.js
│   │   │       └── authThunks.js
│   │   ├── notifications/
│   │   │   ├── components/
│   │   │   │   └── NotificationBell.jsx
│   │   │   ├── services/
│   │   │   │   └── notificationService.js
│   │   │   └── store/
│   │   │       ├── notificationSlice.js
│   │   │       └── notificationThunks.js
│   │   ├── profile/
│   │   │   ├── index.js
│   │   │   ├── constants.js
│   │   │   ├── components/
│   │   │   │   ├── ProfileBadges.jsx
│   │   │   │   ├── ProfileEditForm.jsx
│   │   │   │   ├── ProfileInfoRow.jsx
│   │   │   │   ├── ProfilePersonalCard.jsx
│   │   │   │   ├── ProfileSidebar.jsx
│   │   │   │   ├── ProfileViewDetails.jsx
│   │   │   │   └── TutorInfoCard.jsx
│   │   │   ├── pages/
│   │   │   │   ├── CompleteProfilePage.jsx
│   │   │   │   └── ProfilePage.jsx
│   │   │   ├── schemas/
│   │   │   │   ├── completeProfileSchema.js
│   │   │   │   └── profileSchema.js
│   │   │   └── utils/
│   │   │       └── profileUtils.js
│   │   └── tutors/
│   │       ├── index.js
│   │       ├── constants.js          # Subjects, occupation status, tutor status, day labels
│   │       ├── components/
│   │       │   ├── AreaPicker.jsx    # Province/district picker via backend locations API
│   │       │   ├── AvailabilityPicker.jsx
│   │       │   ├── MultiCheckbox.jsx
│   │       │   └── TutorRegistrationForm.jsx
│   │       ├── pages/
│   │       │   └── RegisterTutorPage.jsx
│   │       ├── schemas/
│   │       │   └── tutorSchema.js
│   │       ├── services/
│   │       │   ├── locationService.js
│   │       │   └── tutorService.js
│   │       └── store/
│   │           ├── tutorSlice.js
│   │           └── tutorThunks.js
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   └── MainLayout.jsx
│   ├── lib/
│   │   └── utils.js                 # cn()
│   ├── pages/
│   │   └── HomePage.jsx
│   ├── routes/
│   │   └── index.jsx                # React Router route tree
│   ├── services/
│   │   └── axiosInstance.js         # baseURL, Bearer, refresh token, toast handling
│   └── utils/
│       └── tokenStorage.js
├── package.json
├── vite.config.js
└── STRUCTURE.md
```

## Redux store

`src/app/store.js` đăng ký các slice:

| Slice | Nguồn | Mục đích |
|---|---|---|
| `auth` | `features/auth` | User session, token, profile state |
| `tutors` | `features/tutors` | Hồ sơ/đăng ký gia sư của user |
| `admin` | `admin` | Danh sách hồ sơ gia sư pending và action approve/reject |
| `notifications` | `features/notifications` | Thông báo lấy từ backend DB theo userId |

## Routes

| Path | Layout/Guard | Page |
|---|---|---|
| `/login` | `GuestRoute` + `AuthLayout` | `LoginPage` |
| `/register` | `GuestRoute` + `AuthLayout` | `RegisterPage` |
| `/verify-otp` | `GuestRoute` + `AuthLayout` | `VerifyOtpPage` |
| `/resend-otp` | `GuestRoute` + `AuthLayout` | `ResendOtpPage` |
| `/forgot-password` | `GuestRoute` + `AuthLayout` | `ForgotPasswordPage` |
| `/verify-forgot-password-otp` | `GuestRoute` + `AuthLayout` | `VerifyForgotPasswordOtpPage` |
| `/reset-password` | `GuestRoute` + `AuthLayout` | `ResetPasswordPage` |
| `/complete-profile` | `ProtectedRoute skipProfileCheck` | `CompleteProfilePage` |
| `/` | `ProtectedRoute` + `MainLayout` | `HomePage` |
| `/profile` | `ProtectedRoute` + `MainLayout` | `ProfilePage` |
| `/register-tutor` | `ProtectedRoute` + `MainLayout` | `RegisterTutorPage` |
| `/admin` | `AdminLayout` | `AdminDashboardPage` |
| `/admin/tutors` | `AdminLayout` | `TutorApprovalPage` |

## API endpoints

`src/constants/apiEndpoints.js` gom các endpoint tương đối:

- `AUTH`: register, login, logout, refresh token, profile, avatar, forgot/reset password.
- `TUTORS`: register tutor, get tutor profile.
- `ADMIN`: pending tutors, approve tutor, reject tutor.
- `LOCATIONS`: provinces, districts by province.
- `NOTIFICATIONS`: list, mark read, mark all read.

## Luồng chính

### Khởi động app

```text
main.jsx
  -> GoogleOAuthProvider
  -> Redux Provider
  -> App.jsx
  -> AuthBootstrap
  -> RouterProvider + Toaster
```

`AuthBootstrap` đọc token từ `tokenStorage`; nếu có token thì dispatch `getUserInfoThunk`. Khi `user.id` xuất hiện hoặc đổi tài khoản, component dispatch `fetchNotificationsThunk` để chuông thông báo hiển thị đúng dữ liệu của tài khoản hiện tại mà không cần reload. Khi logout thì dispatch `clearNotifications`.

### Đăng ký làm gia sư

```text
RegisterTutorPage
  -> TutorRegistrationForm
  -> registerTutorThunk
  -> tutorService.register()
  -> API_ENDPOINTS.TUTORS.REGISTER
  -> Backend tạo Tutor + Notification TUTOR_PENDING
  -> FE fetchNotificationsThunk()
```

Nếu user đã có hồ sơ pending, `RegisterTutorPage` hiển thị trạng thái đang chờ duyệt và không cho đăng ký mới.

### Duyệt gia sư

```text
TutorApprovalPage
  -> adminThunks
  -> adminService
  -> API_ENDPOINTS.ADMIN.*
  -> Backend approve/reject Tutor
  -> Backend tạo Notification TUTOR_APPROVED/TUTOR_REJECTED cho user
```

### Thông báo

```text
NotificationBell
  -> Redux notifications state
  -> notificationThunks
  -> notificationService
  -> /notifications API
```

Thông báo được lưu trong backend DB theo `userId`. FE không dùng localStorage cho notification. Khi người dùng đánh dấu đã đọc, backend set `readAt`; MongoDB TTL tự xóa sau 7 ngày.

## Quy ước feature

```text
features/<feature>/
├── index.js          # Barrel export nếu cần
├── components/       # UI thuộc feature
├── constants.js      # Label/config riêng feature
├── hooks/            # React hooks riêng feature
├── pages/            # Route pages
├── schemas/          # Zod schemas
├── services/         # API calls qua axiosInstance
├── store/            # Redux slice/thunks nếu có shared state
└── utils/            # Helper thuần
```

## Quy ước gọi API

- Component không gọi `axiosInstance` trực tiếp.
- Endpoint thêm vào `src/constants/apiEndpoints.js`.
- API call đặt trong `features/<feature>/services` hoặc `admin/services`.
- Shared async state dùng Redux thunks/slices.
- Token lưu qua `tokenStorage`, refresh token xử lý tập trung trong `axiosInstance`.
