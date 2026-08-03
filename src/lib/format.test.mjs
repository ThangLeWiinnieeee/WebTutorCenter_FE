// Tự kiểm tra src/lib/format.js — chạy: node src/lib/format.test.mjs
import assert from "node:assert/strict";

import { formatDate, formatDateTime, formatNumber, getInitials } from "./format.js";

// formatDate: hợp lệ → dd/mm/yyyy, rỗng/không hợp lệ → fallback
assert.equal(formatDate("2026-07-22T00:00:00Z"), "22/07/2026");
assert.equal(formatDate(null), "—");
assert.equal(formatDate(""), "—");
assert.equal(formatDate("không-phải-ngày"), "—");
assert.equal(formatDate(undefined, "-"), "-");
assert.equal(formatDate("không-phải-ngày", null), null);

// formatDateTime: locale vi-VN đặt giờ trước ngày — giữ đúng hành vi cũ của FE
assert.equal(formatDateTime("2026-07-22T08:30:00"), "08:30 22/07/2026");
assert.equal(formatDateTime(null, "-"), "-");

// formatNumber: null-safe, phân cách hàng nghìn kiểu vi-VN
assert.equal(formatNumber(1234567), "1.234.567");
assert.equal(formatNumber(null), "0");

// getInitials: họ + tên gọi (tên Việt để tên gọi ở cuối)
assert.equal(getInitials("Lê Đăng Toàn Thắng"), "LT");
assert.equal(getInitials("Nguyễn An"), "NA");
assert.equal(getInitials("Thắng"), "TH");
assert.equal(getInitials("  Lê   Thắng  "), "LT"); // thừa khoảng trắng
assert.equal(getInitials(null), "?");
assert.equal(getInitials(""), "?");
assert.equal(getInitials("   "), "?");

console.log("format.js OK");
