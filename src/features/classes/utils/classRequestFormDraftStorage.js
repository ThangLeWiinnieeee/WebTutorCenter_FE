const CLASS_REQUEST_FORM_DRAFT_STORAGE_KEY = "webtutor:classRequestFormDraft:v1";

// Đọc bản nháp form đăng lớp đã lưu, hợp nhất với giá trị mặc định.
export function loadClassRequestFormDraft(baseDefaults, minutesPerSessionOptions = []) {
  if (typeof window === "undefined") return baseDefaults;
  try {
    const raw = window.localStorage.getItem(CLASS_REQUEST_FORM_DRAFT_STORAGE_KEY);
    if (!raw) return baseDefaults;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return baseDefaults;
    const merged = { ...baseDefaults, ...parsed };
    const m = Number(merged.minutesPerSession);
    if (minutesPerSessionOptions.length > 0 && !minutesPerSessionOptions.includes(m)) {
      merged.minutesPerSession = baseDefaults.minutesPerSession;
    }
    return merged;
  } catch {
    return baseDefaults;
  }
}

// Lưu bản nháp form đăng lớp để không mất dữ liệu khi tải lại trang.
export function saveClassRequestFormDraft(values) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLASS_REQUEST_FORM_DRAFT_STORAGE_KEY, JSON.stringify(values));
  } catch {
    /* ignore quota / privacy mode */
  }
}

// Xóa bản nháp form đăng lớp.
export function clearClassRequestFormDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLASS_REQUEST_FORM_DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
