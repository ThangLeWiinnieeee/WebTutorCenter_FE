# WebTutorCenter Frontend

Frontend React cho hệ thống quản lý trung tâm gia sư trực tuyến. Ứng dụng gồm các luồng chính: xác thực, hoàn thiện hồ sơ, đăng ký làm gia sư, admin duyệt hồ sơ gia sư, hiển thị thông báo theo tài khoản và chọn tỉnh/quận động từ backend.

## Tech Stack

- React 19 + Vite
- Redux Toolkit, React Redux
- React Router v7
- Tailwind CSS v4
- shadcn/ui primitives
- React Hook Form + Zod
- Axios
- Sonner
- Google OAuth

## Yêu Cầu

- Node.js
- Backend WebTutorCenter đang chạy
- Google OAuth client ID nếu dùng đăng nhập Google

## Cài Đặt

```bash
npm install
```

Tạo file cấu hình môi trường trong thư mục frontend và điền các biến cần thiết cho base API backend và Google OAuth theo môi trường chạy của bạn.

## Chạy Dự Án

```bash
# Development
npm run dev

# Development, force rebuild Vite cache
npm run dev:force

# Build production
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

Mặc định Vite dev server được cấu hình trong `vite.config.js`.

## Cấu Trúc Chính

```text
src/
├── app/
│   └── store.js                  # reducers: auth, tutors, admin, notifications
├── admin/                        # admin area tách riêng khỏi features
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   └── store/
├── components/
│   ├── shared/                   # Header, ProtectedRoute, GuestRoute
│   └── ui/                       # shadcn/ui primitives
├── constants/
│   └── apiEndpoints.js           # AUTH, TUTORS, ADMIN, LOCATIONS, NOTIFICATIONS
├── features/
│   ├── auth/                     # login/register/OTP/session
│   ├── profile/                  # hồ sơ cá nhân và hồ sơ gia sư trong profile
│   ├── tutors/                   # đăng ký làm gia sư, form, services, store
│   └── notifications/            # NotificationBell, service, slice/thunks
├── layouts/                      # AuthLayout, MainLayout
├── pages/                        # HomePage
├── routes/                       # createBrowserRouter
├── services/
│   └── axiosInstance.js          # baseURL, Bearer token, refresh token, toast
└── utils/
    └── tokenStorage.js
```

Chi tiết cấu trúc xem thêm `STRUCTURE.md`.

## Routes

| Path | Guard/Layout | Mô tả |
|---|---|---|
| `/login` | `GuestRoute` + `AuthLayout` | Đăng nhập |
| `/register` | `GuestRoute` + `AuthLayout` | Đăng ký tài khoản |
| `/verify-otp` | `GuestRoute` + `AuthLayout` | Xác thực OTP |
| `/forgot-password` | `GuestRoute` + `AuthLayout` | Quên mật khẩu |
| `/verify-forgot-password-otp` | `GuestRoute` + `AuthLayout` | Xác thực OTP quên mật khẩu |
| `/reset-password` | `GuestRoute` + `AuthLayout` | Đặt lại mật khẩu |
| `/complete-profile` | `ProtectedRoute skipProfileCheck` | Hoàn thiện hồ sơ bắt buộc |
| `/` | `ProtectedRoute` + `MainLayout` | Trang chủ |
| `/profile` | `ProtectedRoute` + `MainLayout` | Hồ sơ cá nhân/gia sư |
| `/register-tutor` | `ProtectedRoute` + `MainLayout` | Đăng ký làm gia sư |
| `/admin` | `AdminLayout` | Dashboard admin |
| `/admin/tutors` | `AdminLayout` | Duyệt hồ sơ gia sư |

## Redux Store

`src/app/store.js` đăng ký:

| Slice | Mục đích |
|---|---|
| `auth` | Session, user, token, trạng thái khởi tạo |
| `tutors` | Hồ sơ gia sư của user, trạng thái đăng ký |
| `admin` | Danh sách hồ sơ pending, action approve/reject |
| `notifications` | Thông báo lấy từ backend DB theo `userId` |

## API Layer

- Tất cả endpoint đặt trong `src/constants/apiEndpoints.js`.
- Component không gọi `axiosInstance` trực tiếp.
- API call đặt trong `features/<feature>/services` hoặc `admin/services`.
- Shared async state dùng Redux thunks/slices.
- Access token lưu qua `tokenStorage`; refresh token xử lý tập trung trong `axiosInstance`.

Nhóm endpoint hiện có:

- `AUTH`: đăng ký, đăng nhập, Google login, logout, refresh token, user info, update profile, upload avatar.
- `TUTORS`: đăng ký làm gia sư, lấy tutor profile.
- `ADMIN`: danh sách hồ sơ pending, approve/reject tutor.
- `LOCATIONS`: danh sách tỉnh/thành và quận/huyện.
- `NOTIFICATIONS`: lấy thông báo, đánh dấu đã đọc, đánh dấu tất cả đã đọc.

## Luồng Chính

### Khởi động app

```text
main.jsx
  -> GoogleOAuthProvider
  -> Redux Provider
  -> App.jsx
  -> AuthBootstrap
  -> RouterProvider + Toaster
```

`AuthBootstrap` đọc token từ `tokenStorage`; nếu có token thì gọi `getUserInfoThunk`. Khi `user.id` xuất hiện hoặc đổi tài khoản, app dispatch `fetchNotificationsThunk` để chuông thông báo hiển thị đúng dữ liệu của tài khoản hiện tại mà không cần reload.

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

Nếu user đã có hồ sơ pending, trang đăng ký hiển thị trạng thái đang chờ xét duyệt và không cho gửi hồ sơ mới.

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

Thông báo được lưu trong backend DB theo `userId`. FE dùng Redux `notifications` slice để hiển thị chuông thông báo. Không lưu thông báo trong `localStorage`.

Khi user đánh dấu thông báo đã đọc, backend set `readAt`; MongoDB TTL tự xóa thông báo đã đọc sau 7 ngày.

## Quy Ước Phát Triển

- Form dùng React Hook Form + Zod; schema đặt trong `features/<feature>/schemas`.
- Endpoint mới phải thêm vào `apiEndpoints.js` và gọi qua service function.
- Async shared state dùng Redux thunk/slice, không đặt logic API trong component.
- Không tự xử lý refresh token ngoài `axiosInstance`.
- Không sửa `components/ui/*` nếu chỉ phục vụ một màn hình cụ thể.
- Không dùng React Query trong dự án hiện tại.
- Dữ liệu tỉnh/quận lấy từ backend qua `locationService`, không hardcode trong FE.
