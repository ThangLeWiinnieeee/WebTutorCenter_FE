import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./fixtures/testHelper.js";

test.describe("Luồng quản trị viên (Admin Management Workflows)", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page, { userType: "admin" });
  });

  test("Admin Dashboard hiển thị số liệu thống kê tổng quan", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    await expect(page.locator("aside, nav").first()).toBeVisible();

    await page.screenshot({ path: "screenshots/admin-01-dashboard.png" });
  });

  test("Trang xét duyệt gia sư (/admin/tutors) hiển thị danh sách hồ sơ cần duyệt", async ({
    page,
  }) => {
    await page.goto("/admin/tutors");

    await expect(page).toHaveURL(/\/admin\/tutors/, { timeout: 10000 });
    await expect(page.getByText("Trần Đăng Ký")).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: "screenshots/admin-02-xet-duyet-gia-su.png" });
  });

  test("Trang quản lý người dùng (/admin/users) hiển thị danh sách tài khoản", async ({
    page,
  }) => {
    await page.goto("/admin/users");

    await expect(page).toHaveURL(/\/admin\/users/, { timeout: 10000 });
    await expect(page.getByText("Nguyễn Văn A")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("table").getByText("Admin Quản Trị")).toBeVisible();

    await page.screenshot({ path: "screenshots/admin-03-quan-ly-nguoi-dung.png" });
  });

  test("Trang cấu hình hệ thống (/admin/settings) hiển thị form cài đặt", async ({ page }) => {
    await page.goto("/admin/settings");

    await expect(page).toHaveURL(/\/admin\/settings/, { timeout: 10000 });
    await expect(page.getByText(/Cấu hình|Cài đặt/i).first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: "screenshots/admin-04-cai-dat-he-thong.png" });
  });
});
