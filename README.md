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
- recharts (biểu đồ thống kê admin)
- react-day-picker + date-fns, lucide-react, AOS, class-variance-authority + clsx + tailwind-merge
- ESLint (flat config) + Prettier

## Yêu Cầu

- Node.js
- Backend WebTutorCenter đang chạy
- Google OAuth client ID nếu dùng đăng nhập Google

## Cài Đặt

```bash
npm install
```

Ở development, tạo `.env` và đặt `VITE_API_BASE_URL` trỏ thẳng backend. Trên Vercel, REST/auth luôn gọi `/api` qua reverse proxy trong `vercel.json`; đặt `VITE_SOCKET_URL` trỏ thẳng Render và cấu hình Google OAuth client ID.

## Chạy Dự Án

```bash
npm run dev          # Development
npm run dev:force    # Development, force rebuild Vite cache
npm run build        # Build production
npm run preview      # Preview build
npm run lint         # ESLint
npm run format       # Prettier: format toàn bộ src + file config ở gốc
npm run format:check # Prettier: chỉ kiểm tra, không sửa (dùng cho CI)
```

Luật format nằm trong `.prettierrc.json` (110 cột, nháy kép, dấu phẩy cuối, xuống dòng LF).
`.prettierignore` chặn Prettier ghi đè `package-lock.json`, `dist`, `node_modules`.
**Cả hai file đều phải commit** — thiếu một trong hai thì mỗi máy format ra một kiểu,
lần chạy sau sẽ đẻ diff rác hàng trăm file.

## Cấu Trúc Chính

```text
src/
├── app/
│   ├── store.js                  # reducers: auth, tutors, admin, notifications,
│   │                             #   adminNotifications, classes, vouchers, reviews, chat
│   └── createApiThunk.js         # factory bọc createAsyncThunk + try/catch chuẩn
├── admin/                        # admin area tách riêng khỏi features
│   ├── components/               # TutorApprovalCard, charts/ (ChartCard, StatLineChart), ...
│   ├── layouts/                  # AdminLayout (tự guard role admin)
│   ├── pages/                    # Dashboard, Statistics, Payments, Users, TutorApproval,
│   │                             #   ClassApplications, ApplicationCancellations, Reviews,
│   │                             #   ProfileChanges, Classes, Promos, Subjects, Trash,
│   │                             #   Notifications, Messages, Settings
│   ├── schemas/                  # adminUser, promo, subject, ...
│   ├── services/
│   ├── store/                    # adminSlice/adminThunks, adminNotificationSlice/Thunks
│   └── utils/                    # statsFormat.js (định dạng trục & tooltip biểu đồ)
├── components/
│   ├── shared/                   # Header, Footer (động), ProtectedRoute, GuestRoute,
│   │                             #   Modal, ConfirmDeleteModal, ImageLightbox,
│   │                             #   FloatingContactBar, Pagination, PageLoader, ScrollToTop
│   ├── home/                     # IntroSections, HomeCTA
│   └── ui/                       # shadcn/ui primitives
├── constants/                    # apiEndpoints.js, enums, footer, navigation
├── features/
│   ├── auth/                     # login/register/OTP/forgot-reset, session (slice `auth`)
│   ├── profile/                  # hồ sơ cá nhân + chỉnh sửa hồ sơ gia sư + giấy tờ
│   ├── tutors/                   # đăng ký gia sư, listing, chi tiết, pickers, upload giấy tờ
│   ├── classes/                  # đăng tin, feed, nhận lớp, bài đăng, ứng viên, lời mời, hoàn thành
│   ├── payments/                 # thanh toán phí nhận lớp + lịch sử (gọi service, không có slice)
│   ├── notifications/            # NotificationBell, NotificationsPage
│   ├── vouchers/                 # kho voucher cá nhân (slice `vouchers`)
│   ├── reviews/                  # đánh giá gia sư + trang đánh giá của tôi (slice `reviews`)
│   └── chat/                     # chat realtime với admin (slice `chat`)
├── hooks/                        # useSubjects, useDebouncedValue
├── layouts/                      # AuthLayout, MainLayout (gắn TutorChatWidget)
├── lib/                          # utils (cn), formErrors, format (+ format.test.mjs)
├── pages/                        # HomePage
├── routes/                       # createBrowserRouter
├── services/                     # axiosInstance.js, settingsService.js, socket.js
└── utils/                        # tokenStorage.js
```

> Không dùng file barrel `index.js` để re-export. Import thẳng tới file cụ thể
> (`@/features/reviews/components/StarRating`), nếu không Rollup sẽ kéo cả feature
> vào chunk của trang chỉ dùng một component nhỏ.

## Routes (`src/routes/index.jsx`)

| Path | Guard/Layout | Mô tả |
|---|---|---|
| `/login` `/register` `/verify-otp` `/resend-otp` `/forgot-password` `/verify-forgot-password-otp` `/reset-password` | `GuestRoute` + `AuthLayout` | Xác thực |
| `/` `/register-tutor` `/tutors` `/tutors/:id` `/find-tutor` `/classes` `/classes/:id` `/contract-template` | Public + `MainLayout` | Trang chủ, listing/chi tiết gia sư, đăng tin & danh sách/chi tiết lớp, mẫu hợp đồng |
| `/complete-profile` | `ProtectedRoute skipProfileCheck` | Hoàn thiện hồ sơ bắt buộc |
| `/profile` `/notifications` `/my-posts` `/find-tutor/edit/:id` `/my-vouchers` | `ProtectedRoute` + `MainLayout` | Cần đăng nhập + profile đầy đủ |
| `/my-classes` `/class-invitations` `/my-reviews` `/my-payments` | `ProtectedRoute allowedRoles={["tutor"]}` | Đơn nhận lớp, lời mời dạy lớp, đánh giá và lịch sử thanh toán của gia sư |
| `/admin`, `/admin/statistics`, `/admin/payments`, `/admin/notifications`, `/admin/users`, `/admin/messages`, `/admin/tutors`, `/admin/class-applications`, `/admin/application-cancellations`, `/admin/reviews`, `/admin/profile-changes`, `/admin/classes`, `/admin/promos`, `/admin/subjects`, `/admin/trash`, `/admin/settings` | `AdminLayout` | Khu vực quản trị |

Mọi page đều nạp qua `React.lazy` → mỗi route là một chunk riêng. Layout, guard và
`PageLoader` giữ eager vì là khung dùng chung.

## Redux Store (`src/app/store.js`)

| Slice | Mục đích |
|---|---|
| `auth` | Session, user, token, cờ `initialized` (sở hữu cả state hồ sơ cá nhân) |
| `tutors` | Hồ sơ gia sư của user, kết quả listing/search |
| `admin` | Dữ liệu các trang quản trị, action approve/reject/restore |
| `notifications` | Thông báo lấy từ backend theo `userId` (unread count derive) |
| `adminNotifications` | Chuông thông báo + số việc chờ xử lý ở sidebar admin |
| `classes` | Báo giá, danh sách/feed/bài đăng, đơn nhận lớp, ứng viên, lời mời |
| `vouchers` | Kho voucher cá nhân |
| `reviews` | Đánh giá gia sư |
| `chat` | Hội thoại, tin nhắn, đếm chưa đọc (đồng bộ realtime qua Socket.IO) |

`payments` cố ý **không** có slice: dữ liệu chỉ dùng trong đúng một màn hình, gọi thẳng
`paymentService` bằng state cục bộ.

## API Layer

- Tất cả endpoint đặt trong `src/constants/apiEndpoints.js` — nhóm: `AUTH`, `TUTORS`, `ADMIN`, `LOCATIONS`, `NOTIFICATIONS`, `LOOKUPS`, `SUBJECTS`, `PROMOS`, `CLASSES`, `REVIEWS`, `CHAT`.
- Component không gọi `axiosInstance` trực tiếp (ngoại lệ: `settingsService.js` hardcode path `/settings/footer`).
- API call đặt trong `features/<feature>/services` hoặc `admin/services`; shared async state dùng Redux thunk/slice.
- Access token chỉ nằm trong RAM qua `tokenStorage`; refresh token HttpOnly được xoay single-flight trong `axiosInstance`.
- Production REST/auth đi qua `/api` cùng origin Vercel; Socket.IO dùng access token RAM để kết nối thẳng Render qua `VITE_SOCKET_URL`.
- Thêm endpoint mới: cập nhật `apiEndpoints.js` → service → thunk → component.

### Viết thunk

Mọi thunk gọi API dùng `createApiThunk(type, run, errorMessage)` (`src/app/createApiThunk.js`)
thay vì tự viết `createAsyncThunk` + `try/catch` + `rejectWithValue`:

```js
export const getPromosThunk = createApiThunk(
  "admin/getPromos",
  async (params) => (await adminService.getPromos(params)).data.data,
  "Không tải được danh sách mã ưu đãi",
);
```

### Cờ loading trong `adminSlice`

`adminSlice` gom 12 domain nên phần bật/tắt loading được khai báo bằng dữ liệu thay vì
viết tay từng cặp `pending`/`rejected`:

- `LIST_THUNKS` — `[thunk, loadingKey, errorKey?]` cho thunk tải danh sách.
- `ACTION_THUNKS` — `[thunk, loadingKey, argId]` cho thunk thao tác; `argId(meta.arg)`
  cho biết đang xử lý dòng nào để disable đúng nút đó.

Hai bảng này sinh `addMatcher` ở cuối `extraReducers`. Trong `extraReducers` chỉ còn
`addCase` cho `fulfilled` — đúng chỗ dữ liệu thật sự thay đổi. **Thứ tự bắt buộc:** mọi
`addCase` phải đứng trước `addMatcher`, nếu không RTK sẽ ném lỗi.

## Code Dùng Chung

Trước khi viết mới, kiểm tra 4 chỗ này — phần lớn nhu cầu đã có sẵn:

| Dùng khi | Ở đâu |
|---|---|
| Hiện ngày/giờ/số/chữ cái đầu avatar | `src/lib/format.js` — `formatDate`, `formatDateTime`, `formatNumber`, `getInitials` |
| Bất kỳ hộp thoại nào | `components/shared/Modal.jsx` |
| Hỏi xác nhận trước khi xoá | `components/shared/ConfirmDeleteModal.jsx` |
| Phóng to ảnh (giấy tờ, bằng cấp) | `components/shared/ImageLightbox.jsx` |
| Ô tìm kiếm gõ tới đâu gọi API tới đó | `hooks/useDebouncedValue.js` |

**`Modal`** dựng trên thẻ `<dialog>` native + `showModal()`, nên bẫy focus, khoá nền và
đóng bằng Esc là hành vi sẵn có của trình duyệt — không tự dựng lại bằng `div` +
`role="dialog"`. Lưu ý lớp phủ nền đặt ở layer thường chứ không dùng `::backdrop`, để
toast Sonner còn đọc được khi modal đang mở (đánh đổi: modal lồng nhau không làm tối
lớp bên dưới).

**Màu thương hiệu** khai báo trong `@theme` ở `src/index.css`: dùng `bg-brand`,
`text-brand-dark`, `from-brand-accent`… Không viết hex thẳng vào class (`bg-[#1e3a5f]`).

**z-index** viết dạng `z-80`, không dùng `z-[80]`.

`src/lib/format.test.mjs` là self-check chạy bằng `node src/lib/format.test.mjs` —
sửa `format.js` thì chạy lại.

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
- Trước khi viết helper mới, xem bảng **Code Dùng Chung** ở trên — định dạng, modal,
  lightbox, debounce đều đã có bản dùng chung.
- Không tạo file barrel `index.js` để re-export; import thẳng file cần dùng.
- Chạy `npm run lint` và `npm run format` trước khi commit.
- Async shared state dùng Redux thunk/slice, không đặt logic API trong component; không dùng React Query.
- Không tự xử lý refresh token ngoài `axiosInstance`; không kết nối Socket.IO ngoài `services/socket.js` + `ChatSocketProvider`.
- Không sửa `components/ui/*` nếu chỉ phục vụ một màn hình cụ thể.
- Dữ liệu tỉnh/quận/môn lấy từ backend (`locationService`/`lookupService`/`useSubjects`), không hardcode. Lưu ý hai nguồn khác shape: `locationService` trả `{code,name}`, `lookupService` trả `{value,label}`.
- Tôn trọng mask thông tin nhạy cảm lớp (`isUnlocked`) — không lộ contactPhone/chi tiết khi đơn chưa `APPROVED`.
