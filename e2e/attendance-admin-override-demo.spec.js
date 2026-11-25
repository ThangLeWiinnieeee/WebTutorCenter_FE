import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.use({ viewport: { width: 1280, height: 720 } });
test.setTimeout(120 * 1000);

const SAMPLE_IMG = path.resolve("e2e/fixtures/sample-attendance.png");

async function spotlight(page, locator, durationMs = 2500) {
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate((el) => {
    el.dataset.prevOutline = el.style.outline || "";
    el.dataset.prevBoxShadow = el.style.boxShadow || "";
    el.dataset.prevTransition = el.style.transition || "";
    el.style.transition = "all 0.25s ease";
    el.style.outline = "4px solid #10b981";
    el.style.boxShadow = "0 0 0 8px rgba(16, 185, 129, 0.28)";
  });
  await page.waitForTimeout(durationMs);
  await locator
    .evaluate((el) => {
      el.style.outline = el.dataset.prevOutline || "";
      el.style.boxShadow = el.dataset.prevBoxShadow || "";
      el.style.transition = el.dataset.prevTransition || "";
    })
    .catch(() => {});
}

test("Demo E2E: Học viên quên xác nhận -> Admin duyệt thay & tính 1 buổi hợp lệ", async ({
  page,
  context,
}) => {
  const t0 = Date.now();
  const cues = [];
  const mark = async (text, fn) => {
    const start = (Date.now() - t0) / 1000;
    await fn();
    const end = (Date.now() - t0) / 1000;
    cues.push({ start, end, text });
  };

  // 1. Gia sư gửi Check-in
  await mark("[1/3 - Gia sư] Đăng nhập Gia sư -> Vào /my-classes -> Mở Điểm danh lớp học", async () => {
    await page.goto("/login");
    await page.locator("#email").fill("vo.thanhtung48@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await page.goto("/my-classes");
    await page.locator("button.group").first().click();
    await page.getByRole("button", { name: /Điểm danh lớp học/i }).click();
    await expect(page.getByRole("heading", { name: /Điểm danh lớp học/i })).toBeVisible({
      timeout: 10000,
    });
  });

  await mark(
    "[1/3 - Gia sư] Gia sư gửi Check-in -> Trạng thái 'Đang chờ học viên xác nhận' (giả lập HV quên xác nhận)",
    async () => {
      const checkInBtn = page.getByRole("button", { name: /Gửi Check-in bắt đầu buổi/i });
      const hasCheckIn = await checkInBtn.waitFor({ state: "visible", timeout: 5000 }).then(() => true).catch(() => false);
      if (hasCheckIn) {
        await page.locator("input[type='file']").first().setInputFiles(SAMPLE_IMG);
        await spotlight(page, checkInBtn, 2000);
        await checkInBtn.click();
        await expect(page.getByText(/Đang chờ học viên xác nhận/i)).toBeVisible({ timeout: 15000 });
      }
      await page.waitForTimeout(2000);
    },
  );

  // 2. Admin vào duyệt thay
  await mark("[2/3 - Admin] Học viên báo Admin -> Admin vào /admin/attendance tab 'Chờ XN Check-in'", async () => {
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto("/login");
    await page.locator("#email").fill("admin@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    await page.goto("/admin/attendance");
    await expect(page.getByRole("heading", { name: /Quản lý điểm danh lớp học/i })).toBeVisible({
      timeout: 10000,
    });

    const allTab = page.locator("button:has-text('Tất cả')");
    await spotlight(page, allTab, 1800);
    await allTab.click();
    await page.waitForTimeout(1000);
  });

  await mark(
    "[3/3 - Admin Duyệt thay] Bấm 'Duyệt thay học viên' -> Chọn tính 1 buổi hợp lệ (VALID) & nhập lý do kiểm toán",
    async () => {
      const overrideBtn = page.locator("button:has-text('Duyệt thay học viên')").first();
      await expect(overrideBtn).toBeVisible({ timeout: 10000 });
      await spotlight(page, overrideBtn, 2200);
      await overrideBtn.click();

      await expect(page.getByText(/Thao tác duyệt thay/i)).toBeVisible({ timeout: 10000 });
      const actionSelect = page.locator("select").first();
      await actionSelect.selectOption("VALIDATE_SESSION");
      await spotlight(page, actionSelect, 2000);

      const reasonBox = page.locator("textarea").first();
      await reasonBox.fill("Học viên báo lại đã học đủ buổi nhưng quên bấm xác nhận trong 30 phút.");
      const submitBtn = page.getByRole("button", { name: /Xác nhận duyệt thay/i });
      await spotlight(page, submitBtn, 2200);
      await submitBtn.click();
    },
  );

  await mark(
    "[Hoàn tất] Kiểm tra tab 'Hợp lệ' -> Buổi đã được tính 1 buổi hợp lệ & ghi lịch sử 'Đã duyệt thay học viên'",
    async () => {
      await page.waitForTimeout(1500);
      const validTab = page.getByRole("button", { name: "Hợp lệ", exact: true });
      await validTab.click();
      await page.waitForTimeout(1500);
      const badge = page.getByText(/Đã duyệt thay học viên/i).first();
      await expect(badge).toBeVisible({ timeout: 10000 });
      await spotlight(page, badge, 3500);
    },
  );

  fs.writeFileSync("e2e-override-cues.json", JSON.stringify(cues, null, 2), "utf-8");
});
