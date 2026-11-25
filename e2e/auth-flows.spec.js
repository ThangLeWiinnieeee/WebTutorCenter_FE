import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./fixtures/testHelper.js";

test.describe("Luồng xác thực tài khoản (Authentication Workflows)", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("Trang đăng nhập: hiển thị lỗi validation khi gửi form rỗng", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Chào mừng trở lại" })).toBeVisible();

    const submitBtn = page.getByRole("button", { name: "Đăng nhập" });
    await submitBtn.click();

    await expect(
      page.locator("form").getByText(/không được để trống/i).first(),
    ).toBeVisible();

    // Chụp ảnh minh chứng
    await page.screenshot({ path: "screenshots/auth-01-login-validation-loi.png" });
  });

  test("Trang đăng nhập: thông báo lỗi khi nhập sai mật khẩu", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill("wronguser@example.com");
    await page.locator("#password").fill("WrongPass123");

    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page.getByText(/không chính xác|thất bại/i).first()).toBeVisible({
      timeout: 5000,
    });

    // Chụp ảnh minh chứng
    await page.screenshot({ path: "screenshots/auth-02-login-sai-mat-khau.png" });
  });

  test("Trang đăng nhập: đăng nhập thành công với tài khoản quản trị và chuyển hướng về /admin", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.locator("#email").fill("admindemo@gmail.com");
    await page.locator("#password").fill("Password123");

    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

    // Chụp ảnh minh chứng
    await page.screenshot({ path: "screenshots/auth-03-login-admin-thanh-cong.png" });
  });

  test("Trang đăng ký: kiểm tra validation họ tên, email và khớp mật khẩu", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: "Tạo tài khoản mới" })).toBeVisible();

    await page.locator("#fullName").fill("Nguyễn Văn Test");
    await page.locator("#email").fill("testuser@gmail.com");
    await page.locator("#phone").fill("0912345678");
    await page.locator("#dateOfBirth").fill("2000-01-01");
    await page.locator("#password").fill("Password123");
    await page.locator("#confirmPassword").fill("DifferentPassword");

    await page.getByRole("button", { name: /Đăng ký/i }).click();

    await expect(page.getByText(/khớp|trùng khớp/i).first()).toBeVisible();

    // Chụp ảnh minh chứng
    await page.screenshot({ path: "screenshots/auth-04-dang-ky-khong-khop-pass.png" });
  });

  test("Trang quên mật khẩu: kiểm tra luồng gửi yêu cầu OTP khôi phục", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.getByRole("heading", { name: /Quên mật khẩu/i })).toBeVisible();

    const emailInput = page.locator("input[type='email'], #email");
    await emailInput.fill("test@example.com");

    const submitBtn = page.getByRole("button", { name: /Tiếp tục|Gửi|Xác nhận/i });
    await submitBtn.click();

    await expect(page).toHaveURL(/\/verify-forgot-password-otp/, { timeout: 10000 });

    // Chụp ảnh minh chứng
    await page.screenshot({ path: "screenshots/auth-05-quen-mat-khau-otp.png" });
  });
});
