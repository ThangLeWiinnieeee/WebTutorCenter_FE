import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./fixtures/testHelper.js";

test.describe("Luồng phân quyền và bảo vệ route (Protected Routes & RBAC)", () => {
  test("Khách (chưa đăng nhập) vào /profile bị chuyển hướng về /login", async ({ page }) => {
    await setupApiMocks(page, { userType: null });

    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    await page.screenshot({ path: "screenshots/rbac-01-khach-vao-profile.png" });
  });

  test("Khách (chưa đăng nhập) vào /admin bị chặn quyền truy cập", async ({ page }) => {
    await setupApiMocks(page, { userType: null });

    await page.goto("/admin");
    await expect(
      page.getByText(/Không có quyền truy cập|Đăng nhập/i).first(),
    ).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: "screenshots/rbac-02-khach-vao-admin.png" });
  });

  test("Học viên (role: user) không có quyền vào /admin", async ({ page }) => {
    await setupApiMocks(page, { userType: "student" });

    await page.goto("/admin");
    await expect(page.getByText(/Không có quyền truy cập/i).first()).toBeVisible({
      timeout: 10000,
    });

    await page.screenshot({ path: "screenshots/rbac-03-hoc-vien-vao-admin.png" });
  });

  test("Học viên (role: user) không có quyền vào trang gia sư /my-classes", async ({ page }) => {
    await setupApiMocks(page, { userType: "student" });

    await page.goto("/my-classes");
    await expect(page).not.toHaveURL(/\/my-classes$/, { timeout: 10000 });

    await page.screenshot({ path: "screenshots/rbac-04-hoc-vien-vao-myclasses.png" });
  });

  test("Quản trị viên (role: admin) được cấp quyền vào /admin", async ({ page }) => {
    await setupApiMocks(page, { userType: "admin" });

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

    await page.screenshot({ path: "screenshots/rbac-05-admin-duoc-vao-admin.png" });
  });
});
