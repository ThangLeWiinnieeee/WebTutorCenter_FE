// Options/filter (dữ liệu thuần) cho AdminPromosPage.

export const PROMO_TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại giảm" },
  { value: "percent", label: "Giảm theo %" },
  { value: "fixed", label: "Giảm số tiền" },
];

export const PROMO_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "true", label: "Đang bật" },
  { value: "false", label: "Đã tắt" },
];

export const PROMO_DEFAULT_FILTERS = { discountType: "", isActive: "" };
