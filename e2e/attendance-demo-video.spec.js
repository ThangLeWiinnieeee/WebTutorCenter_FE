import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.use({ viewport: { width: 1280, height: 720 } });
test.setTimeout(150 * 1000);

const SAMPLE_IMG = path.resolve("e2e/fixtures/sample-attendance.png");

async function spotlight(page, locator, durationMs = 2500) {
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate((el) => {
    el.dataset.prevOutline = el.style.outline || "";
    el.dataset.prevBoxShadow = el.style.boxShadow || "";
    el.dataset.prevTransition = el.style.transition || "";
    el.style.transition = "all 0.25s ease";
    el.style.outline = "4px solid #f97316";
    el.style.boxShadow = "0 0 0 8px rgba(249, 115, 22, 0.28)";
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

test("Demo E2E Đầy Đủ Theo DOCX: Gia sư -> Phụ huynh -> Admin", async ({ page, context }) => {
  const t0 = Date.now();
  const cues = [];
  const mark = async (text, fn) => {
    const start = (Date.now() - t0) / 1000;
    await fn();
    const end = (Date.now() - t0) / 1000;
    cues.push({ start, end, text });
  };

  // =========================================================================
  // BƯỚC 1 (MỤC 4): GIA SƯ GỬI CHECK-IN ĐẦU BUỔI
  // =========================================================================
  await mark("[Bước 1 - Gia sư] Đăng nhập Gia sư -> Vào /my-classes (Mục 3.1: Lớp đã duyệt & trả phí)", async () => {
    await page.goto("/login");
    await page.locator("#email").fill("vo.thanhtung48@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await page.goto("/my-classes");
    await expect(page).toHaveURL(/\/my-classes/, { timeout: 10000 });
  });

  await mark("[Bước 1 - Gia sư] Mở chi tiết lớp & bấm 'Điểm danh lớp học'", async () => {
    const classCard = page.locator("button.group").first();
    await expect(classCard).toBeVisible({ timeout: 10000 });
    await classCard.click();
    const attendanceBtn = page.getByRole("button", { name: /Điểm danh lớp học/i });
    await expect(attendanceBtn).toBeVisible({ timeout: 10000 });
    await spotlight(page, attendanceBtn, 2000);
    await attendanceBtn.click();
    await expect(page.getByRole("heading", { name: /Điểm danh lớp học/i })).toBeVisible({ timeout: 10000 });
  });

  await mark(
    "[Mục 2 & 3.3] Chỉ tiêu tháng = Buổi/tuần x 4 (4 tuần 7 ngày); tuần thiếu không dồn; ngày 29-31 để học bù",
    async () => {
      await page.waitForTimeout(3500);
    },
  );

  await mark(
    "[Bước 1 - Mục 4] Gia sư chọn ảnh đầu buổi & bấm 'Gửi Check-in bắt đầu buổi' (mở hạn 30p cho HV)",
    async () => {
      const checkInBtn = page.getByRole("button", { name: /Gửi Check-in bắt đầu buổi/i });
      if (await checkInBtn.isVisible().catch(() => false)) {
        const fileInput = page.locator("input[type='file']").first();
        await fileInput.setInputFiles(SAMPLE_IMG);
        await spotlight(page, checkInBtn, 2000);
        await checkInBtn.click();
        await expect(page.getByText(/Đang chờ học viên xác nhận/i)).toBeVisible({ timeout: 15000 });
      }
      await page.waitForTimeout(2000);
    },
  );

  // =========================================================================
  // BƯỚC 2 (MỤC 4): PHỤ HUYNH XÁC NHẬN BẮT ĐẦU (VÀO LỚP)
  // =========================================================================
  await mark("[Bước 2 - Phụ huynh] Đăng nhập Người đăng lớp -> Vào /my-posts", async () => {
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto("/login");
    await page.locator("#email").fill("huynh.khanhvy25@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await page.goto("/my-posts");
    await expect(page).toHaveURL(/\/my-posts/, { timeout: 10000 });
  });

  await mark(
    "[Bước 2 - Mục 4] Phụ huynh mở 'Điểm danh buổi học', xem ảnh Check-in & bấm 'Xác nhận vào lớp' (bắt đầu tính giờ)",
    async () => {
      const btn = page.getByRole("button", { name: /Điểm danh buổi học|Lịch sử điểm danh/i }).first();
      await expect(btn).toBeVisible({ timeout: 15000 });
      await btn.click();
      await expect(page.getByRole("heading", { name: /Điểm danh lớp học/i })).toBeVisible({ timeout: 10000 });
      const confirmInBtn = page.getByRole("button", { name: /Xác nhận vào lớp/i });
      await expect(confirmInBtn).toBeVisible({ timeout: 10000 });
      await spotlight(page, confirmInBtn, 2500);
      await confirmInBtn.click();
      await expect(page.getByText(/Chờ gia sư gửi ảnh Check-out/i)).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(2000);
    },
  );

  // =========================================================================
  // BƯỚC 3 (MỤC 4): GIA SƯ GỬI CHECK-OUT CUỐI BUỔI
  // =========================================================================
  await mark("[Bước 3 - Gia sư] Quay lại Gia sư -> Mở lại hộp thoại Điểm danh", async () => {
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto("/login");
    await page.locator("#email").fill("vo.thanhtung48@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await page.goto("/my-classes");
    await page.locator("button.group").first().click();
    await page.getByRole("button", { name: /Điểm danh lớp học/i }).click();
    await expect(page.getByRole("heading", { name: /Điểm danh lớp học/i })).toBeVisible({ timeout: 10000 });
  });

  await mark(
    "[Bước 3 - Mục 4] Gia sư chọn ảnh cuối buổi & bấm 'Gửi Check-out kết thúc buổi' (tính giờ từ lúc HV XN vào lớp)",
    async () => {
      const checkOutBtn = page.getByRole("button", { name: /Gửi Check-out kết thúc buổi/i });
      await expect(checkOutBtn).toBeVisible({ timeout: 10000 });
      const fileInput = page.locator("input[type='file']").first();
      await fileInput.setInputFiles(SAMPLE_IMG);
      await spotlight(page, checkOutBtn, 2500);
      await checkOutBtn.click();
      await expect(page.getByText(/Đang chờ học viên xác nhận kết thúc/i)).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(2000);
    },
  );

  // =========================================================================
  // BƯỚC 4 (MỤC 4 + EDGE CASE AT08): PHỤ HUYNH XÁC NHẬN KẾT THÚC (THIẾU PHÚT)
  // =========================================================================
  await mark("[Bước 4 - Phụ huynh] Quay lại Phụ huynh xác nhận kết thúc buổi", async () => {
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto("/login");
    await page.locator("#email").fill("huynh.khanhvy25@webtutor.dev");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await page.goto("/my-posts");
    await page.getByRole("button", { name: /Điểm danh buổi học|Lịch sử điểm danh/i }).first().click();
    await expect(page.getByRole("heading", { name: /Điểm danh lớp học/i })).toBeVisible({ timeout: 10000 });
  });

  await mark(
    "[Edge Case AT08] Buổi mới học < số phút tối thiểu -> Kể cả HV bấm 'Xác nhận kết thúc', buổi KHÔNG tự cộng +1 mà chuyển Cần xử lý",
    async () => {
      const confirmOutBtn = page.getByRole("button", { name: /Xác nhận kết thúc buổi/i });
      await expect(confirmOutBtn).toBeVisible({ timeout: 10000 });
      await spotlight(page, confirmOutBtn, 3000);
      await confirmOutBtn.click();
      await page.waitForTimeout(3000);
    },
  );

  // =========================================================================
  // BƯỚC 5 (MỤC 5 + AT16/AT17): ADMIN XỬ LÝ KHIẾU NẠI & DUYỆT THAY
  // =========================================================================
  await mark("[Bước 5 - Admin] Đăng nhập Admin -> Vào /admin/attendance xử lý sự cố & khiếu nại", async () => {
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
    await expect(page.getByRole("heading", { name: /Quản lý điểm danh lớp học/i })).toBeVisible({ timeout: 10000 });
  });

  await mark(
    "[Mục 5 - Admin Xử lý khiếu nại] Mở modal xem ảnh đầu/cuối, 4 mốc giờ gốc, chọn kết luận & ghi lý do (lưu lịch sử kiểm toán)",
    async () => {
      const reviewTab = page.locator("button:has-text('Cần rà soát / Khiếu nại')");
      await reviewTab.click();
      await page.waitForTimeout(1000);
      const resolveBtn = page.locator("button:has-text('Xử lý khiếu nại')").first();
      await expect(resolveBtn).toBeVisible({ timeout: 10000 });
      await spotlight(page, resolveBtn, 2500);
      await resolveBtn.click();

      const reasonBox = page.locator("textarea").first();
      await expect(reasonBox).toBeVisible({ timeout: 10000 });
      await reasonBox.fill("Đã đối chiếu ảnh check-in/check-out và xác nhận với hai bên, công nhận buổi hợp lệ.");
      const saveBtn = page.getByRole("button", { name: /Lưu kết luận/i });
      await spotlight(page, saveBtn, 2500);
      await saveBtn.click();
      await page.waitForTimeout(2500);
    },
  );

  fs.writeFileSync("e2e-demo-cues.json", JSON.stringify(cues, null, 2), "utf-8");
});
