# Quy trình nhận lớp

Trang công khai: `/class-receiving-guide`. Liên kết nằm trong mục Gia sư cần biết ở danh sách và chi tiết lớp.

Ba nguồn workflow do Archify tạo: ứng tuyển (`apply`), lời mời (`invite`) và rút/hủy đơn (`cancel`).
HTML được xuất sẵn vào `public/diagrams`, không cần cài Archify trên máy chủ hoặc thêm dependency vào frontend.
Trang React dùng chế độ nhúng nền sáng và deep link `#focus=<node-id>` để xem từng bước. Nút mở sơ đồ lớn cung cấp bản độc lập với các công cụ của Archify.
Nội dung sơ đồ là tiếng Việt; thanh công cụ và thẻ ngôn ngữ HTML của bản độc lập mặc định tiếng Anh do Archify chưa hỗ trợ locale Việt. Phần điều khiển trong trang React dùng tiếng Việt.

## Cập nhật

1. Đối chiếu nghiệp vụ trong BE: `class.application.service.js`, `classApplicationAdmin.service.js`, `cancellationAdmin.service.js`, `class.service.js` và `classLifecycle.js`.
2. Cập nhật nguồn JSON và nội dung tương ứng trong `src/features/classes/constants/classReceivingGuide.js`. Giữ ID của bước khớp ID nút sơ đồ.
3. Dùng skill Archify đã cài (thay `<ARCHIFY_DIR>` bằng đường dẫn cài skill):

```sh
node <ARCHIFY_DIR>/bin/archify.mjs validate workflow docs/diagrams/apply.workflow.json --quality showcase --json
node <ARCHIFY_DIR>/bin/archify.mjs deliver workflow docs/diagrams/apply.workflow.json public/diagrams/class-apply.html --quality showcase --json
node <ARCHIFY_DIR>/bin/archify.mjs visual-check public/diagrams/class-apply.html --json
```

Lặp lại với `invite` và `cancel`. Chỉ đưa HTML đã qua kiểm tra vào public; lưu ảnh và biên bản trực quan bên ngoài public.
Chạy `node --test test/class-receiving-guide.test.mjs` và `npm run build` sau khi sửa.
`validation.json` ghi hash nguồn, HTML và kết quả kiểm tra tại thời điểm tạo. Kiểm thử trình duyệt của trang dùng API giả lập, không thay đổi database.

## Các điểm nghiệp vụ cần giữ

- Ứng tuyển → người đăng chọn → trung tâm duyệt → mới mở liên hệ.
- Đồng ý lời mời → trung tâm duyệt; từ chối lời mời không qua trung tâm.
- Đơn chờ người đăng chọn có thể rút ngay; đơn đã chọn chưa có thao tác rút trực tiếp.
- Hủy lớp đã nhận cần duyệt; được duyệt thì lớp mở lại hoặc hết hạn tùy ngày bắt đầu.
- Cần cả hai bên xác nhận để hoàn thành. Voucher theo chính sách hiện hành; một đánh giá mỗi lớp và một phản hồi mỗi đánh giá.

Đây là trang hướng dẫn. Sơ đồ không tự thực hiện hay thay đổi trạng thái lớp.
