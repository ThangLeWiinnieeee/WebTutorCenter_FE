# CHANGELOG — Phần việc đã hoàn thành

> Nhánh: `feat/giao-viec-tlcn`  
> Cập nhật lần cuối: 20/06/2026

---

## ✅ 1. Ẩn thông tin nhạy cảm ở Backend & Bảo mật dữ liệu

- [x] Enforce logic phân quyền trực tiếp tại API: Số điện thoại (`contactPhone`) và địa chỉ chi tiết (`locationLabel`) chỉ trả về đầy đủ cho **Admin**, **người tạo lớp**, hoặc **Gia sư được duyệt nhận lớp đó**
- [x] Với các đối tượng khác, số điện thoại trả về `null`, địa chỉ rút gọn chỉ hiển thị Quận/Huyện, Tỉnh/Thành phố
- [x] Lưu thêm trường `provinceName` và `districtName` vào Class model khi tạo lớp mới

---

## ✅ 2. Đồng bộ hóa lịch dạy Gia sư

- [x] Cập nhật schema `tutor.model.js`: Đổi `availability` sang định dạng `{ day, hour }` thống nhất
- [x] Cập nhật schema Joi validation trong `tutor.validation.js`
- [x] Tích hợp lưới chọn lịch 24h hỗ trợ **Click & Drag** (nhấp giữ rê chuột) qua `WeeklyHourGrid.jsx`
- [x] Đồng bộ lưới chọn giờ cho cả **Trở thành gia sư** và **Đăng tin tìm gia sư**
- [x] Trang chi tiết gia sư và card duyệt gia sư của Admin hiển thị lịch dạy theo dải giờ gộp trực quan

---

## ✅ 3. Bắt buộc đăng nhập & Kiểm tra điều kiện ứng tuyển Gia sư

- [x] Trang chi tiết lớp (`/classes/:id`) bắt buộc đăng nhập, tự động điều hướng về trang chi tiết sau khi login
- [x] Popup xác nhận `ClassReceiveDialog.jsx` hiển thị đầy đủ: Mã lớp, Môn học, Lịch học, Yêu cầu, Địa điểm khái quát
- [x] Kiểm tra chéo hồ sơ gia sư với yêu cầu lớp (Môn học, Giới tính, Trình độ)
- [x] Hiển thị thông báo lỗi rõ ràng và nút **"Tìm lớp phù hợp"** nếu thiếu điều kiện
- [x] Backend chặn cứng ở API: trả về lỗi `422` nếu ứng tuyển không đúng điều kiện

---

## ✅ 4. Trang Admin duyệt ứng tuyển nhận lớp

- [x] Thiết kế lại `ClassApplicationsPage.jsx`: hiển thị trực tiếp đầy đủ thông tin lớp + gia sư trên card duyệt
- [x] Admin có thể phê duyệt/từ chối ngay mà không cần mở popup phụ

---

## ✅ 5. Tối ưu trang Tìm Gia sư (`FindTutorRequestPage`)

- [x] Thay `<input type="date">` bằng **Shadcn UI DatePicker** (Popover + Calendar + Button) có locale tiếng Việt
- [x] Grid chọn giờ hỗ trợ **Click & Drag** chọn/hủy chọn nhanh dải giờ học
- [x] Nút chọn nhanh "Hôm nay", "Ngày mai", "Cuối tuần" bôi đậm khi ngày trùng khớp
- [x] Xóa lựa chọn "Tất cả" trong dropdown môn học, tỉnh/thành, quận/huyện
- [x] Hiển thị tất cả dấu hoa thị bắt buộc (`*`) màu đỏ (`text-rose-500`)
- [x] **Real-time Progress Bar**: Theo dõi 15 trường nhập liệu, tính tiến độ tổng + tiến độ phụ từng Section
- [x] Badge trạng thái động: 🟢 Emerald (đủ) / 🟡 Amber (đang điền) / ⚪ Slate (chưa bắt đầu)
- [x] Sau khi đăng thành công: reset form, xóa localStorage draft, redirect về `/classes/:id`

---

## ✅ 6. Danh sách lớp & Card hiển thị lớp học

- [x] Tiêu đề card định dạng: `[Môn học] - [Tóm tắt]` (ví dụ: *3D Max - Cần gia sư lớp 10*)
- [x] Bỏ badge môn học màu cam trùng lặp phía trên tiêu đề
- [x] Thời gian tạo ("Đăng ngày: ...") nằm riêng dưới mã lớp
- [x] Thay `>> Xem thêm` bằng icon mắt `<Eye />` + text "Xem thêm"
- [x] Layout chân card dạng lưới 2 cột: **Địa điểm** | **Yêu cầu gia sư**
- [x] **Thời gian có thể học** xuống hàng riêng, phân tách bằng `border-t`
- [x] Địa điểm chỉ hiển thị: `[Tỉnh/Thành phố], [Quận/Huyện]` (không lộ địa chỉ chi tiết)
- [x] Đồng bộ trên tất cả màn hình: `NewClassesPage`, `ClassFeedPanel`, `MyClassesPanel`, `MyPostsPanel`, `MyClassDetailDialog`, `NewClassDetailPage`, `ClassReceiveDialog`

---

## ✅ 7. Bỏ tùy chọn "Tất cả" trong Dropdown Tỉnh/Thành & Quận/Huyện

- [x] `SearchableSelect.jsx`: Chỉ hiển thị tùy chọn "Tất cả" khi có truyền `allLabel`
- [x] Thêm nút xóa nhanh `X` khi đã chọn giá trị cụ thể
- [x] Placeholder "Chọn tỉnh/thành phố" và "Chọn quận/huyện" trong `NewClassesPage.jsx` và `TutorFilters.jsx`

---

## ✅ 8. Chân trang Footer & Cấu hình Settings

- [x] Component `Footer.jsx` đồng bộ thông tin từ API Backend (email, hotline, facebook, zalo)
- [x] Trang quản trị `/admin/settings` cho phép Admin chỉnh sửa thông tin Footer
- [x] Sửa lỗi race condition MongoDB (E11000 duplicate key) bằng `findOneAndUpdate` nguyên tử

---

## ✅ 9. Shadcn UI DatePicker (Cải thiện UX)

- [x] Cài đặt `popover` và `calendar` từ Shadcn UI (`react-day-picker`, `date-fns`)
- [x] Locale **tiếng Việt** mặc định cho toàn bộ Calendar (tháng, thứ bằng tiếng Việt)
- [x] Vô hiệu hóa ngày trong quá khứ (disabled past dates)
- [x] Hiển thị ngày đã chọn định dạng `DD/MM/YYYY`

---

## 👤 Tài khoản thử nghiệm

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | `admindemo@gmail.com` | `Password123` |
| Gia sư (đã duyệt, dạy 3D Max) | `giasudemo@gmail.com` | `Password123` |
| Phụ huynh / Học sinh | `minhanhuser@gmail.com` | `Password123` |

---

## 📦 Dependencies mới thêm

- `react-day-picker@latest` — Shadcn Calendar component
- `date-fns` — Xử lý format ngày & locale vi
- `@radix-ui/react-popover` — Shadcn Popover component
