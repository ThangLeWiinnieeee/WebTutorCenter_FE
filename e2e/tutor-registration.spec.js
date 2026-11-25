import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./fixtures/testHelper.js";

test.describe("Luồng đăng ký làm gia sư (Tutor Registration Workflow)", () => {
  test("Khách chưa đăng nhập vào /register-tutor hiển thị nhắc nhở đăng nhập", async ({
    page,
  }) => {
    await setupApiMocks(page, { userType: null });

    await page.goto("/register-tutor");

    await expect(page.getByText("Bạn cần đăng nhập")).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("main").getByRole("link", { name: "Đăng nhập" }),
    ).toBeVisible();

    await page.screenshot({ path: "screenshots/tutor-01-khach-dang-ky-gia-su.png" });
  });

  test("Học viên (đã đăng nhập) vào /register-tutor thấy biểu mẫu đăng ký hồ sơ gia sư", async ({
    page,
  }) => {
    await setupApiMocks(page, { userType: "student" });

    await page.goto("/register-tutor");

    await expect(
      page.getByText(/Đăng ký làm gia sư|Thông tin gia sư/i).first(),
    ).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: "screenshots/tutor-02-form-dang-ky-gia-su.png" });
  });
});
