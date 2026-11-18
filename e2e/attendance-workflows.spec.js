import { test, expect } from "@playwright/test";

test.describe("Kiểm thử chuyên sâu Chức năng Điểm danh (Attendance Workflow)", () => {
  test.describe.configure({ mode: "serial" });

  // ─── 1. PHÍA QUẢN TRỊ VIÊN (ADMIN ATTENDANCE MONITORING) ────────────────
  test("Luồng Điểm danh 1.1: Admin giám sát danh sách điểm danh và các buổi cần rà soát (/admin/attendance)", async ({
    page,
  }) => {
    // Đăng nhập Admin
    await page.goto("/login");
    await page.locator("#email").fill("admin@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    // Điều hướng vào trang Quản lý điểm danh
    await page.goto("/admin/attendance");
    await expect(page).toHaveURL(/\/admin\/attendance/, { timeout: 10000 });

    // Kiểm tra tiêu đề trang và danh sách buổi học
    await expect(page.getByRole("heading", { name: /Quản lý điểm danh lớp học/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/Theo dõi buổi học, xử lý khiếu nại/i)).toBeVisible();

    await page.waitForTimeout(1000);
    await page.screenshot({ path: "screenshots/attendance-01-admin-quan-ly-diem-danh.png" });
  });

  test("Luồng Điểm danh 1.2: Admin xem danh sách tất cả các buổi học và mở modal Duyệt thay học viên", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.locator("#email").fill("admin@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    await page.goto("/admin/attendance");
    await expect(page.getByRole("heading", { name: /Quản lý điểm danh lớp học/i })).toBeVisible({
      timeout: 10000,
    });

    // Chuyển sang tab "Tất cả"
    const allTab = page.locator("button:has-text('Tất cả')");
    await expect(allTab).toBeVisible({ timeout: 10000 });
    await allTab.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "screenshots/attendance-02-admin-tab-tat-ca-buoi-hoc.png" });

    // Tìm và mở modal "Duyệt thay học viên"
    const overrideBtn = page.locator("button:has-text('Duyệt thay học viên')").first();
    await expect(overrideBtn).toBeVisible({ timeout: 10000 });
    await overrideBtn.click();

    // Modal Duyệt điểm danh thay học viên hiển thị
    await expect(page.getByText(/Thao tác duyệt thay/i)).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screenshots/attendance-03-admin-modal-duyet-thay.png" });

    // Đóng modal
    await page.getByRole("button", { name: /Hủy/i }).click();
  });

  test("Luồng Điểm danh 1.3: Admin mở modal Xử lý khiếu nại buổi học (Dispute Resolution)", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.locator("#email").fill("admin@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    await page.goto("/admin/attendance");
    await expect(page.getByRole("heading", { name: /Quản lý điểm danh lớp học/i })).toBeVisible({
      timeout: 10000,
    });

    // Tab Cần rà soát / Khiếu nại
    const reviewTab = page.locator("button:has-text('Cần rà soát / Khiếu nại')");
    await expect(reviewTab).toBeVisible({ timeout: 10000 });
    await reviewTab.click();
    await page.waitForTimeout(1000);

    // Mở modal Xử lý khiếu nại
    const resolveBtn = page.locator("button:has-text('Xử lý khiếu nại')").first();
    await expect(resolveBtn).toBeVisible({ timeout: 10000 });
    await resolveBtn.click();

    // Modal Kết luận xử lý sự cố / khiếu nại hiển thị
    await expect(page.getByText(/Kết luận xử lý sự cố/i)).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screenshots/attendance-04-admin-modal-xu-ly-khieu-nai.png" });

    // Đóng modal
    await page.getByRole("button", { name: /Hủy/i }).click();
  });

  // ─── 2. PHÍA GIA SƯ (TUTOR ROLL CALL & SESSION DIALOG) ─────────────────
  test("Luồng Điểm danh 2.1: Gia sư mở Chi tiết lớp học và hộp thoại Điểm danh (/my-classes)", async ({
    page,
  }) => {
    // Đăng nhập Gia sư phụ trách lớp
    await page.goto("/login");
    await page.locator("#email").fill("vo.thanhtung48@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Vào trang Quản lý lớp học của gia sư
    await page.goto("/my-classes");
    await expect(page).toHaveURL(/\/my-classes/, { timeout: 10000 });

    // Bấm vào thẻ lớp học đầu tiên (đã được mở khóa / feePaid)
    const classCard = page.locator("button.group").first();
    await expect(classCard).toBeVisible({ timeout: 10000 });
    await classCard.click();

    // Dialog chi tiết lớp học mở ra, kiểm tra có nút "Điểm danh lớp học"
    const attendanceBtn = page.getByRole("button", { name: /Điểm danh lớp học/i });
    await expect(attendanceBtn).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: "screenshots/attendance-05-gia-su-nut-diem-danh-lop.png" });

    // Bấm "Điểm danh lớp học"
    await attendanceBtn.click();

    // Hộp thoại Điểm danh lớp học (ClassAttendanceDialog) mở ra
    await expect(page.getByRole("heading", { name: /Điểm danh lớp học/i })).toBeVisible({
      timeout: 10000,
    });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "screenshots/attendance-06-gia-su-hop-thoai-diem-danh.png" });
  });

  // ─── 3. PHÍA PHỤ HUYNH / HỌC VIÊN (STUDENT CONFIRMATION & HISTORY) ──────
  test("Luồng Điểm danh 3.1: Phụ huynh kiểm tra lịch sử điểm danh của lớp đã đăng (/my-posts)", async ({
    page,
  }) => {
    // Đăng nhập Phụ huynh người đăng lớp
    await page.goto("/login");
    await page.locator("#email").fill("huynh.khanhvy25@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Vào trang Quản lý bài đăng tìm gia sư (/my-posts)
    await page.goto("/my-posts");
    await expect(page).toHaveURL(/\/my-posts/, { timeout: 10000 });

    // Chờ danh sách bài đăng tải xong và tìm nút "Điểm danh buổi học"
    const attendancePostBtn = page.getByRole("button", { name: /Điểm danh buổi học|Lịch sử điểm danh/i }).first();
    await expect(attendancePostBtn).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: "screenshots/attendance-07-phu-huynh-nut-diem-danh-lop-da-dang.png" });

    // Bấm "Điểm danh buổi học"
    await attendancePostBtn.click();

    // Hộp thoại Điểm danh lớp học hiển thị cho Phụ huynh
    await expect(page.getByRole("heading", { name: /Điểm danh lớp học/i })).toBeVisible({
      timeout: 10000,
    });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "screenshots/attendance-08-phu-huynh-hop-thoai-diem-danh.png" });
  });
});
