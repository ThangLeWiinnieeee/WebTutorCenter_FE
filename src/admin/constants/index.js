// Barrel export cho constants khu vực admin.
// Cấu hình dạng dữ liệu (options/filter/nhãn) tách khỏi JSX để tái sử dụng và
// chỉnh sửa tập trung. Lưu ý: cấu hình gắn với icon/màu sắc (TABS có icon,
// STATUS_META, TAB_STYLE…) vẫn để cạnh component vì là "view config", không phải
// dữ liệu thuần.

export * from "./common";
export * from "./users";
export * from "./promos";
export * from "./trash";
export * from "./profileChanges";
export * from "./classes";
