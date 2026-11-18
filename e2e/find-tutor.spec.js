import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./fixtures/testHelper.js";

test.describe("Luồng đăng yêu cầu tìm gia sư (Find Tutor Workflow)", () => {
  test("Trang tìm gia sư (/find-tutor) tải đầy đủ giao diện tạo yêu cầu", async ({ page }) => {
    await setupApiMocks(page, { userType: "student" });

    await page.goto("/find-tutor");

    await expect(
      page.getByText(/Tìm gia sư|Đăng yêu cầu tìm gia sư/i).first(),
    ).toBeVisible({ timeout: 10000 });

    await expect(page.locator("form")).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: "screenshots/class-01-form-tim-gia-su.png" });
  });
});
