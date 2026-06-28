# WebTutorCenter Frontend

Frontend React cho hệ thống quản lý trung tâm gia sư trực tuyến. Ứng dụng gồm các luồng chính: xác thực & hoàn thiện hồ sơ, đăng ký làm gia sư, đăng tin tìm gia sư, gia sư ứng tuyển nhận lớp, người đăng chọn gia sư (hoặc mời đích danh), gia sư xem đánh giá của mình, chat realtime với admin, mã ưu đãi/voucher, đánh giá gia sư, và khu vực quản trị (users, classes, trash, messages, settings...).

## Tech Stack

- React 19 + Vite 8
- Redux Toolkit 2, React Redux
- React Router v7
- Tailwind CSS v4 (`@tailwindcss/vite`)
- shadcn/ui primitives + Radix (label, popover, select, slot)
- React Hook Form + Zod v4 (`@hookform/resolvers`)
- Axios
- Socket.IO client (chat realtime với admin)
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

Tạo file cấu hình môi trường trong thư mục frontend và điền base API backend (`VITE_API_BASE_URL`) + Google OAuth client ID theo môi trường chạy của bạn. URL Socket.IO được suy ra từ `VITE_API_BASE_URL` bằng cách bỏ hậu tố `/api`.

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
│   └── store.js                  # reducers: auth, tutors, admin, notifications, classes,
│                                 #   vouchers, reviews, chat
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
│   │                             #   FloatingContactBar, Pagination, ScrollToTop
│   ├── home/                     # IntroSections, HomeCTA
│   └── ui/                       # shadcn/ui primitives
├── constants/                    # apiEndpoints.js, enums, footer, navigation
├── features/
│   ├── auth/                     # login/register/OTP/forgot-reset, session (slice `auth`)
│   ├── profile/                  # hồ sơ cá nhân + chỉnh sửa hồ sơ gia sư + giấy tờ
│   ├── tutors/                   # đăng ký gia sư, listing, chi tiết, pickers, upload giấy tờ
│   ├── classes/                  # đăng tin, feed, nhận lớp, bài đăng, ứng viên, lời mời, hoàn thành
│   ├── notifications/            # NotificationBell, NotificationsPage
│   ├── vouchers/                 # kho voucher cá nhân (slice `vouchers`)
│   ├── reviews/                  # đánh giá gia sư + trang đánh giá của tôi (slice `reviews`)
│   └── chat/                     # chat realtime với admin (slice `chat`)
├── hooks/                        # useSubjects, ...
├── layouts/                      # AuthLayout, MainLayout (gắn TutorChatWidget)
├── lib/                          # utils, formErrors
├── pages/                        # HomePage
├── routes/                       # createBrowserRouter
├── services/                     # axiosInstance.js, settingsService.js, socket.js
└── utils/                        # tokenStorage.js
```

## Routes (`src/routes/index.jsx`)

| Path | Guard/Layout | Mô tả |
|---|---|---|
| `/login` `/register` `/verify-otp` `/resend-otp` `/forgot-password` `/verify-forgot-password-otp` `/reset-password` | `GuestRoute` + `AuthLayout` | Xác thực |
| `/` `/register-tutor` `/tutors` `/tutors/:id` `/find-tutor` `/classes` `/classes/:id` | Public + `MainLayout` | Trang chủ, listing/chi tiết gia sư, đăng tin & danh sách/chi tiết lớp |
| `/complete-profile` | `ProtectedRoute skipProfileCheck` | Hoàn thiện hồ sơ bắt buộc |
| `/profile` `/notifications` `/my-posts` `/find-tutor/edit/:id` `/my-vouchers` | `ProtectedRoute` + `MainLayout` | Cần đăng nhập + profile đầy đủ |
| `/my-classes` `/class-invitations` `/my-reviews` | `ProtectedRoute allowedRoles={["tutor"]}` | Đơn nhận lớp, lời mời dạy lớp, đánh giá của gia sư |
| `/admin`, `/admin/users`, `/admin/messages`, `/admin/tutors`, `/admin/class-applications`, `/admin/application-cancellations`, `/admin/reviews`, `/admin/profile-changes`, `/admin/classes`, `/admin/promos`, `/admin/subjects`, `/admin/trash`, `/admin/settings` | `AdminLayout` | Khu vực quản trị |

## Redux Store (`src/app/store.js`)

| Slice | Mục đích |
|---|---|
| `auth` | Session, user, token, cờ `initialized` (sở hữu cả state hồ sơ cá nhân) |
| `tutors` | Hồ sơ gia sư của user, kết quả listing/search |
| `admin` | Dữ liệu các trang quản trị, action approve/reject/restore |
| `notifications` | Thông báo lấy từ backend theo `userId` (unread count derive) |
| `classes` | Báo giá, danh sách/feed/bài đăng, đơn nhận lớp, ứng viên, lời mời |
| `vouchers` | Kho voucher cá nhân |
| `reviews` | Đánh giá gia sư |
| `chat` | Hội thoại, tin nhắn, đếm chưa đọc (đồng bộ realtime qua Socket.IO) |

## API Layer

- Tất cả endpoint đặt trong `src/constants/apiEndpoints.js` — nhóm: `AUTH`, `TUTORS`, `ADMIN`, `LOCATIONS`, `NOTIFICATIONS`, `LOOKUPS`, `SUBJECTS`, `PROMOS`, `CLASSES`, `REVIEWS`, `CHAT`.
- Component không gọi `axiosInstance` trực tiếp (ngoại lệ: `settingsService.js` hardcode path `/settings/footer`).
- API call đặt trong `features/<feature>/services` hoặc `admin/services`; shared async state dùng Redux thunk/slice.
- Access token lưu qua `tokenStorage`; refresh token (single-flight 401) xử lý tập trung trong `axiosInstance` (toast lỗi/success, hard-redirect `/login` khi refresh fail).
- Socket.IO client (`src/services/socket.js`) dùng chung access token từ `tokenStorage`, kết nối idempotent; URL suy ra từ `VITE_API_BASE_URL` bỏ `/api`.
- Thêm endpoint mới: cập nhật `apiEndpoints.js` → service → thunk → component.

## Luồng Chính

### Khởi động app

```text
main.jsx → GoogleOAuthProvider → Redux Provider → App.jsx
  → AuthBootstrap → ChatSocketProvider → RouterProvider + Toaster
```

`AuthBootstrap` đọc token từ `tokenStorage`; nếu có thì gọi `getUserInfoThunk` để restore session, và fetch/clear notifications theo `user.id` khi đổi tài khoản. `ChatSocketProvider` kết nối/ngắt Socket.IO theo trạng thái đăng nhập và lắng nghe sự kiện chat để cập nhật slice `chat`.

### Đăng tin tìm gia sư

```text
FindTutorRequestPage → quoteClassThunk (báo giá, có thể áp voucher)
  → màn xác nhận → createClassThunk → POST /classes → điều hướng /classes/:id
```

### Ghép gia sư

```text
Gia sư: ClassReceiveDialog (kiểm tra eligibility) → applyForClassThunk → đơn PENDING
Người đăng: fetchApplicantsThunk → selectApplicantThunk (chọn 1 gia sư → SELECTED)
  hoặc mời đích danh một gia sư → đơn lời mời → gia sư accept/decline ở /class-invitations
Admin: approve/reject ở ClassApplicationsPage → APPROVED (lớp matched) / REJECTED
Hoàn thành: completeClassThunk (hai phía) → lớp completed → voucher thưởng + cho phép đánh giá
```

### Đánh giá gia sư

```text
ReviewDialog (lớp completed) → createReviewThunk → POST /reviews
  → TutorReviewsSection hiển thị ở trang chi tiết gia sư và trang "Đánh giá của tôi" (/my-reviews)
```

### Chat với admin

```text
Gia sư/học viên: TutorChatWidget (khung nổi trong MainLayout) → chatThunks → CHAT.MY_*
Admin: AdminMessagesPage (/admin/messages) → danh sách hội thoại + trả lời → CHAT.CONVERSATION_*
Realtime: services/socket.js + ChatSocketProvider lắng nghe chat:message / chat:read / chat:conversation
```

### Khu vực quản trị

`AdminLayout` tự guard role `admin`. Mỗi trang dispatch thunk trong `adminThunks` → `adminService` → API `ADMIN.*` (riêng trang Messages dùng feature `chat`). Bao gồm duyệt gia sư, duyệt nhận lớp, duyệt hủy đơn, duyệt đổi hồ sơ, quản lý users/classes/promos/subjects/reviews, hộp thư người dùng, thùng rác (xóa mềm) và cấu hình chân trang.

### Thông báo

Lưu ở backend theo `userId`; FE dùng slice `notifications`, không lưu `localStorage`. Mark read → backend set `readAt`, MongoDB TTL tự xóa sau 7 ngày.

## Quy Ước Phát Triển

- Form dùng React Hook Form + Zod; schema đặt trong `features/<feature>/schemas`.
- Endpoint mới phải thêm vào `apiEndpoints.js` và gọi qua service function.
- Async shared state dùng Redux thunk/slice, không đặt logic API trong component; không dùng React Query.
- Không tự xử lý refresh token ngoài `axiosInstance`; không kết nối Socket.IO ngoài `services/socket.js` + `ChatSocketProvider`.
- Không sửa `components/ui/*` nếu chỉ phục vụ một màn hình cụ thể.
- Dữ liệu tỉnh/quận/môn lấy từ backend (`locationService`/`lookupService`/`useSubjects`), không hardcode. Lưu ý hai nguồn khác shape: `locationService` trả `{code,name}`, `lookupService` trả `{value,label}`.
- Tôn trọng mask thông tin nhạy cảm lớp (`isUnlocked`) — không lộ contactPhone/chi tiết khi đơn chưa `APPROVED`.
