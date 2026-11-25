import { test, expect } from "@playwright/test";

test.describe("Kiểm thử các luồng nghiệp vụ đã được IMPLEMENT thực tế (Real Backend & Database)", () => {
  test.describe.configure({ mode: "serial" });
  // ─── LUỒNG 1: KHÁM PHÁ & TÌM KIẾM CÔNG KHAI ─────────────────────────────
  test("Luồng 1.1: Truy cập Trang chủ và tải dữ liệu thực tế từ Database", async ({ page }) => {
    await page.goto("/");

    // Kiểm tra thương hiệu & thanh điều hướng
    await expect(page).toHaveTitle(/WebTutorCenter|Gia sư/i);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByRole("link", { name: /Tìm gia sư/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Lớp cần gia sư/i }).first()).toBeVisible();

    await page.waitForTimeout(1000);
    await page.screenshot({ path: "screenshots/real-01-trang-chu.png" });
  });

  test("Luồng 1.2: Xem danh mục gia sư thực tế và chi tiết gia sư", async ({ page }) => {
    await page.goto("/tutors");

    // Đợi danh sách gia sư từ MongoDB hiển thị
    await expect(page.getByRole("heading", { name: "Danh sách gia sư" })).toBeVisible();
    const tutorCards = page.locator("a[href^='/tutors/']");
    await expect(tutorCards.first()).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: "screenshots/real-02-danh-sach-gia-su-that.png" });

    // Bấm xem chi tiết gia sư đầu tiên
    await tutorCards.first().click();
    await expect(page).toHaveURL(/\/tutors\/[a-zA-Z0-9]+/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "screenshots/real-03-chi-tiet-gia-su-that.png" });
  });

  test("Luồng 1.3: Xem danh mục bài đăng tìm gia sư (/classes)", async ({ page }) => {
    await page.goto("/classes");

    await expect(page.getByRole("heading", { name: /Lớp cần gia sư/i }).first()).toBeVisible();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "screenshots/real-04-danh-sach-lop-that.png" });
  });

  test("Luồng 1.4: Xem hợp đồng mẫu chuẩn của trung tâm (/contract-template)", async ({
    page,
  }) => {
    await page.goto("/contract-template");

    await expect(page.getByRole("heading", { name: /Hợp đồng/i }).first()).toBeVisible({
      timeout: 10000,
    });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "screenshots/real-05-hop-dong-mau-that.png" });
  });

  // ─── LUỒNG 2: XÁC THỰC & HỒ SƠ HỌC VIÊN (ROLE: USER) ────────────────────
  test("Luồng 2.1: Đăng nhập thực tế với tài khoản Học viên và kiểm tra phiên", async ({
    page,
  }) => {
    await page.goto("/login");

    // Điền thông tin học viên thực tế trong Database
    await page.locator("#email").fill("pham.huuphuoc03@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    // Xác nhận đã đăng nhập thành công và không còn ở trang login
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Tên học viên thực tế hiển thị trên giao diện
    await expect(page.getByText(/Phạm Hữu Phước/i).first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: "screenshots/real-06-dang-nhap-hoc-vien-that.png" });
  });

  test("Luồng 2.2: Học viên xem thông tin hồ sơ cá nhân thực tế", async ({ page }) => {
    // Đăng nhập học viên
    await page.goto("/login");
    await page.locator("#email").fill("pham.huuphuoc03@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Truy cập trang hồ sơ cá nhân
    await page.goto("/profile");
    await expect(page.getByText(/Phạm Hữu Phước/i).first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: "screenshots/real-07-ho-so-ca-nhan-hoc-vien.png" });
  });

  test("Luồng 2.3: Học viên truy cập biểu mẫu Đăng yêu cầu tìm gia sư (/find-tutor)", async ({
    page,
  }) => {
    // Đăng nhập học viên
    await page.goto("/login");
    await page.locator("#email").fill("pham.huuphuoc03@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Truy cập trang tìm gia sư
    await page.goto("/find-tutor");
    // Kiểm tra cấu hình học phí và form đã tải thành công
    await expect(page.locator("form")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Không tải được cấu hình học phí")).not.toBeVisible();

    await page.screenshot({ path: "screenshots/real-08-form-tim-gia-su-that.png" });
  });

  // ─── LUỒNG 3: NGHIỆP VỤ GIA SƯ (ROLE: TUTOR) ────────────────────────────
  test("Luồng 3.1: Đăng nhập thực tế với tài khoản Gia sư và quản lý lớp học", async ({
    page,
  }) => {
    await page.goto("/login");

    // Tài khoản gia sư thực tế trong DB
    await page.locator("#email").fill("vo.thanhtung48@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await expect(page.getByText(/Võ Thanh Tùng/i).first()).toBeVisible({ timeout: 10000 });

    // Gia sư truy cập trang Quản lý lớp học (/my-classes)
    await page.goto("/my-classes");
    await expect(page).toHaveURL(/\/my-classes/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "screenshots/real-09-trang-lop-cua-gia-su.png" });
  });

  test("Luồng 3.2: Gia sư xem danh sách lời mời dạy học (/class-invitations)", async ({
    page,
  }) => {
    // Đăng nhập gia sư
    await page.goto("/login");
    await page.locator("#email").fill("vo.thanhtung48@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Truy cập trang lời mời dạy
    await page.goto("/class-invitations");
    await expect(page).toHaveURL(/\/class-invitations/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "screenshots/real-10-trang-loi-moi-day-gia-su.png" });
  });

  // ─── LUỒNG 4: NGHIỆP VỤ QUẢN TRỊ VIÊN (ROLE: ADMIN) ─────────────────────
  test("Luồng 4.1: Đăng nhập Quản trị viên và tải dữ liệu Dashboard từ Database", async ({
    page,
  }) => {
    await page.goto("/login");

    // Đăng nhập tài khoản admin thực tế
    await page.locator("#email").fill("admin@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    // Chuyển hướng trực tiếp vào trang quản trị
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    await expect(page.locator("aside, nav").first()).toBeVisible();

    await page.waitForTimeout(1500);
    await page.screenshot({ path: "screenshots/real-11-admin-dashboard-that.png" });
  });

  test("Luồng 4.2: Admin quản lý danh sách người dùng thực tế (/admin/users)", async ({
    page,
  }) => {
    // Đăng nhập admin
    await page.goto("/login");
    await page.locator("#email").fill("admin@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    // Vào trang quản lý người dùng
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin\/users/, { timeout: 10000 });

    // Kiểm tra bảng tài khoản thực tế hiển thị
    await expect(page.locator("table")).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: "screenshots/real-12-admin-quan-ly-nguoi-dung-that.png" });
  });

  test("Luồng 4.3: Admin quản lý danh sách lớp học thực tế (/admin/classes)", async ({
    page,
  }) => {
    // Đăng nhập admin
    await page.goto("/login");
    await page.locator("#email").fill("admin@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    // Vào trang quản lý lớp học
    await page.goto("/admin/classes");
    await expect(page).toHaveURL(/\/admin\/classes/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "screenshots/real-13-admin-quan-ly-lop-hoc-that.png" });
  });

  test("Luồng 4.4: Admin kiểm tra cấu hình trung tâm gia sư (/admin/settings)", async ({
    page,
  }) => {
    // Đăng nhập admin
    await page.goto("/login");
    await page.locator("#email").fill("admin@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    // Vào trang cấu hình hệ thống
    await page.goto("/admin/settings");
    await expect(page).toHaveURL(/\/admin\/settings/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "screenshots/real-14-admin-cai-dat-he-thong-that.png" });
  });
});
