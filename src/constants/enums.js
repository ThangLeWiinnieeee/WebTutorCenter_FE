// Hằng số domain dùng chung cho toàn FE (nguồn sự thật duy nhất).
// Tránh hardcode/lặp lại các bảng nhãn này trong từng component.

// Nhãn giới tính dùng chung (hiển thị mặc định).
// Lưu ý: một số nơi có nhãn theo ngữ cảnh riêng (vd "Hỗn hợp", "Nam/Nữ")
// nên giữ hàm format riêng tại chỗ đó, KHÔNG thay bằng bảng này.
export const GENDER_LABEL = { male: "Nam", female: "Nữ", other: "Khác" };

// Thứ tự ngày trong tuần (khớp enum DAYS_OF_WEEK bên backend).
export const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Nhãn ngày dạng đầy đủ (Thứ 2 … Chủ nhật).
export const DAY_FULL_LABEL_VI = {
  Mon: "Thứ 2",
  Tue: "Thứ 3",
  Wed: "Thứ 4",
  Thu: "Thứ 5",
  Fri: "Thứ 6",
  Sat: "Thứ 7",
  Sun: "Chủ nhật",
};

// Nhãn ngày dạng rút gọn (T2 … CN).
export const DAY_SHORT_LABEL_VI = {
  Mon: "T2",
  Tue: "T3",
  Wed: "T4",
  Thu: "T5",
  Fri: "T6",
  Sat: "T7",
  Sun: "CN",
};

// Danh sách { value, label } cho các picker/select chọn ngày.
export const DAY_OPTIONS = DAYS_OF_WEEK.map((value) => ({
  value,
  label: DAY_FULL_LABEL_VI[value],
}));
