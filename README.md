# WebTutorCenter Frontend

Frontend React cho hệ thống quản lý trung tâm gia sư trực tuyến. Ứng dụng gồm các luồng chính: xác thực & hoàn thiện hồ sơ, đăng ký làm gia sư, đăng tin tìm gia sư, gia sư ứng tuyển nhận lớp, người đăng chọn gia sư, admin duyệt nhiều luồng, mã ưu đãi/voucher, đánh giá gia sư, và khu vực quản trị (users, classes, trash, settings...).

## Tech Stack

- React 19 + Vite 8
- Redux Toolkit 2, React Redux
- React Router v7
- Tailwind CSS v4 (`@tailwindcss/vite`)
- shadcn/ui primitives + Radix (label, popover, select, slot)
- React Hook Form + Zod v4 (`@hookform/resolvers`)
- Axios
- Sonner (toast)
- `@react-oauth/google`
- react-day-picker + date-fns, lucide-react, AOS, class-variance-authority + clsx + tailwind-merge

## Yêu Cầu

- Node.js
- Backend WebTutorCenter đang chạy
- Google OAuth client ID nếu dùng đăng nhập Google

## Cài Đặt

```bash
npm install
```

Tạo file cấu hình môi trường trong thư mục frontend và điền base API backend + Google OAuth client ID theo môi trường chạy của bạn.

## Chạy Dự Án

```bash
npm run dev          # Development
npm run dev:force    # Development, force rebuild Vite cache
npm run build        # Build production
npm run preview      # Preview build
npm run lint         # ESLint
```

## Cấu Trúc Chính

```text
src/
├── app/
│   └── store.js                  # reducers: auth, tutors, admin, notifications, classes, vouchers, reviews
├── admin/                        # admin area tách riêng khỏi features
│   ├── components/               # TutorApprovalCard, ...
│   ├── layouts/                  # AdminLayout (tự guard role admin)
│   ├── pages/                    # Dashboard, Users, TutorApproval, ClassApplications,
│   │                             #   ApplicationCancellations, Reviews, ProfileChanges,
│   │                             #   Classes, Promos, Subjects, Trash, Settings
│   ├── schemas/                  # adminUser, promo, subject, ...
│   ├── services/
│   └── store/                    # adminSlice/adminThunks
├── components/
│   ├── shared/                   # Header, Footer (động), ProtectedRoute, GuestRoute,
│   │                             #   FloatingContactBar, Pagination
│   ├── home/                     # IntroSections, HomeCTA
│   └── ui/                       # shadcn/ui primitives
├── constants/                    # apiEndpoints.js, enums, footer, navigation
├── features/
│   ├── auth/                     # login/register/OTP/forgot-reset, session (slice `auth`)
│   ├── profile/                  # hồ sơ cá nhân + chỉnh sửa hồ sơ gia sư
│   ├── tutors/                   # đăng ký gia sư, listing, chi tiết, pickers
│   ├── classes/                  # đăng tin, feed, nhận lớp, bài đăng, ứng viên, hoàn thành
│   ├── notifications/            # NotificationBell, NotificationsPage
│   ├── vouchers/                 # kho voucher cá nhân (slice `vouchers`)
│   └── reviews/                  # đánh giá gia sư (slice `reviews`)
├── hooks/                        # useSubjects, ...
├── layouts/                      # AuthLayout, MainLayout
├── lib/                          # utils, formErrors
├── pages/                        # HomePage
├── routes/                       # createBrowserRouter
├── services/                     # axiosInstance.js, settingsService.js
└── utils/                        # tokenStorage.js
```

## Routes (`src/routes/index.jsx`)

| Path | Guard/Layout | Mô tả |
|---|---|---|
| `/login` `/register` `/verify-otp` `/resend-otp` `/forgot-password` `/verify-forgot-password-otp` `/reset-password` | `GuestRoute` + `AuthLayout` | Xác thực |
| `/` `/register-tutor` `/tutors` `/tutors/:id` `/find-tutor` `/classes` `/classes/:id` | Public + `MainLayout` | Trang chủ, listing/chi tiết gia sư, đăng tin & danh sách/chi tiết lớp |
| `/complete-profile` | `ProtectedRoute skipProfileCheck` | Hoàn thiện hồ sơ bắt buộc |
| `/profile` `/notifications` `/my-posts` `/find-tutor/edit/:id` `/my-vouchers` | `ProtectedRoute` + `MainLayout` | Cần đăng nhập + profile đầy đủ |
| `/my-classes` | `ProtectedRoute allowedRoles={["tutor"]}` | Đơn nhận lớp của gia sư |
| `/admin`, `/admin/users`, `/admin/tutors`, `/admin/class-applications`, `/admin/application-cancellations`, `/admin/reviews`, `/admin/profile-changes`, `/admin/classes`, `/admin/promos`, `/admin/subjects`, `/admin/trash`, `/admin/settings` | `AdminLayout` | Khu vực quản trị |

## Redux Store (`src/app/store.js`)

| Slice | Mục đích |
|---|---|
| `auth` | Session, user, token, cờ `initialized` (sở hữu cả state hồ sơ cá nhân) |
| `tutors` | Hồ sơ gia sư của user, kết quả listing/search |
| `admin` | Dữ liệu các trang quản trị, action approve/reject/restore |
| `notifications` | Thông báo lấy từ backend theo `userId` (unread count derive) |
| `classes` | Báo giá, danh sách/feed/bài đăng, đơn nhận lớp, ứng viên |
| `vouchers` | Kho voucher cá nhân |
| `reviews` | Đánh giá gia sư |

## API Layer

- Tất cả endpoint đặt trong `src/constants/apiEndpoints.js` — nhóm: `AUTH`, `TUTORS`, `ADMIN`, `LOCATIONS`, `NOTIFICATIONS`, `LOOKUPS`, `SUBJECTS`, `PROMOS`, `CLASSES`, `REVIEWS`.
- Component không gọi `axiosInstance` trực tiếp (ngoại lệ: `settingsService.js` hardcode path `/settings/footer`).
- API call đặt trong `features/<feature>/services` hoặc `admin/services`; shared async state dùng Redux thunk/slice.
- Access token lưu qua `tokenStorage`; refresh token (single-flight 401) xử lý tập trung trong `axiosInstance` (toast lỗi/success, hard-redirect `/login` khi refresh fail).
- Thêm endpoint mới: cập nhật `apiEndpoints.js` → service → thunk → component.

## Luồng Chính

### Khởi động app

```text
main.jsx → GoogleOAuthProvider → Redux Provider → App.jsx → AuthBootstrap → RouterProvider + Toaster
```

`AuthBootstrap` đọc token từ `tokenStorage`; nếu có thì gọi `getUserInfoThunk` để restore session, và fetch/clear notifications theo `user.id` khi đổi tài khoản.

### Đăng tin tìm gia sư

```text
FindTutorRequestPage → quoteClassThunk (báo giá, có thể áp voucher)
  → màn xác nhận → createClassThunk → POST /classes → điều hướng /classes/:id
```

### Ghép gia sư

```text
Gia sư: ClassReceiveDialog (kiểm tra eligibility) → applyForClassThunk → đơn PENDING
Người đăng: fetchApplicantsThunk → selectApplicantThunk (chọn 1 gia sư → SELECTED)
Admin: approve/reject ở ClassApplicationsPage → APPROVED (lớp matched) / REJECTED
Hoàn thành: completeClassThunk (hai phía) → lớp completed → voucher thưởng + cho phép đánh giá
```

### Đánh giá gia sư

```text
ReviewDialog (lớp completed) → createReviewThunk → POST /reviews
  → TutorReviewsSection hiển thị ở trang chi tiết gia sư
```

### Khu vực quản trị

`AdminLayout` tự guard role `admin`. Mỗi trang dispatch thunk trong `adminThunks` → `adminService` → API `ADMIN.*`. Bao gồm duyệt gia sư, duyệt nhận lớp, duyệt hủy đơn, duyệt đổi hồ sơ, quản lý users/classes/promos/subjects/reviews, thùng rác (xóa mềm) và cấu hình chân trang.

### Thông báo

Lưu ở backend theo `userId`; FE dùng slice `notifications`, không lưu `localStorage`. Mark read → backend set `readAt`, MongoDB TTL tự xóa sau 7 ngày.

## Quy Ước Phát Triển

- Form dùng React Hook Form + Zod; schema đặt trong `features/<feature>/schemas`.
- Endpoint mới phải thêm vào `apiEndpoints.js` và gọi qua service function.
- Async shared state dùng Redux thunk/slice, không đặt logic API trong component; không dùng React Query.
- Không tự xử lý refresh token ngoài `axiosInstance`.
- Không sửa `components/ui/*` nếu chỉ phục vụ một màn hình cụ thể.
- Dữ liệu tỉnh/quận/môn lấy từ backend (`locationService`/`lookupService`/`useSubjects`), không hardcode. Lưu ý hai nguồn khác shape: `locationService` trả `{code,name}`, `lookupService` trả `{value,label}`.
- Tôn trọng mask thông tin nhạy cảm lớp (`isUnlocked`) — không lộ contactPhone/chi tiết khi đơn chưa `APPROVED`.
