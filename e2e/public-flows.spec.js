import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./fixtures/testHelper.js";

test.describe("Luồng người dùng công khai (Public Navigation Workflows)", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("Trang chủ hiển thị đầy đủ thông tin, header, banner và footer", async ({ page }) => {
    await page.goto("/");

    // Kiểm tra logo/tiêu đề thương hiệu
    await expect(page).toHaveTitle(/WebTutorCenter|Gia sư/i);
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Kiểm tra các liên kết điều hướng chính
    await expect(page.getByRole("link", { name: /Tìm gia sư/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Lớp cần gia sư/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Đăng nhập/i }).first()).toBeVisible();

    // Chụp ảnh minh chứng
    await page.screenshot({ path: "screenshots/public-01-trang-chu.png" });
  });

  test("Trang danh sách gia sư (/tutors) hiển thị bộ lọc và danh sách gia sư", async ({
    page,
  }) => {
    await page.goto("/tutors");

    await expect(page.getByText("Nguyễn Văn Gia Sư").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Trần Thị Mai Anh").first()).toBeVisible();
    await expect(page.getByText("Toán").first()).toBeVisible();
    await expect(page.getByText("Tiếng Anh").first()).toBeVisible();

    // Chụp ảnh minh chứng
    await page.screenshot({ path: "screenshots/public-02-danh-sach-gia-su.png" });
  });

  test("Trang danh sách lớp mới (/classes) hiển thị danh sách lớp học cần gia sư", async ({
    page,
  }) => {
    await page.goto("/classes");

    await expect(
      page.getByText(/Toán - Cần tìm gia sư|Toán - Cần Gia Sư/i).first(),
    ).toBeVisible({ timeout: 10000 });

    // Chụp ảnh minh chứng
    await page.screenshot({ path: "screenshots/public-03-danh-sach-lop-moi.png" });
  });

  test("Trang điều khoản hợp đồng (/contract-template) hiển thị nội dung mẫu", async ({
    page,
  }) => {
    await page.goto("/contract-template");

    await expect(page.getByRole("heading", { name: /Hợp đồng/i }).first()).toBeVisible({
      timeout: 10000,
    });

    // Chụp ảnh minh chứng
    await page.screenshot({ path: "screenshots/public-04-hop-dong-mau.png" });
  });
});
