// Thông tin Bên A (trung tâm — chủ website) dùng cho hợp đồng mẫu.
// Đây là dữ liệu ẢO/placeholder cho môi trường demo; thay bằng thông tin thật khi triển khai.
export const CONTRACT_CENTER = {
  name: "Trung tâm Gia sư",
  representative: "Nguyễn Văn An",
  address: "123 Đường Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh",
  email: "hopdong@giasu.vn",
  website: "web-tutor-center.vercel.app",
  hotline1: "0900 123 456",
  hotline2: "0900 654 321",
};

export const CONTRACT_ROUTE = "/hop-dong-mau";

// Nhãn rút gọn cho yêu cầu gia sư khi tạo/sửa lớp (dùng ở form FindTutorRequestPage).
// Bản đầy đủ cho hiển thị công khai nằm ở classFormatters (formatTutorGenderPref/LevelPref).
export const TUTOR_GENDER_PREF_LABEL = { any: "Không yêu cầu", male: "Nam", female: "Nữ" };
export const TUTOR_LEVEL_PREF_LABEL = { any: "Không yêu cầu", student: "Sinh viên", teacher: "Giáo viên" };
