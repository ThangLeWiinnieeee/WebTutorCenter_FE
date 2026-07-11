// Nhãn field & whitelist (dữ liệu thuần) cho AdminProfileChangesPage.

export const PROFILE_CHANGE_FIELD_LABELS = {
  phone: "Số điện thoại liên hệ",
  occupationStatus: "Tình trạng nghề nghiệp",
  teachingAreas: "Khu vực giảng dạy",
  currentArea: "Khu vực hiện tại",
  bio: "Giới thiệu bản thân",
  availability: "Lịch giảng dạy",
  subjects: "Môn học giảng dạy",
  graduationYear: "Năm tốt nghiệp",
  schoolName: "Trường học",
  cccdFrontImage: "CCCD mặt trước",
  cccdBackImage: "CCCD mặt sau",
  studentCardFrontImage: "Thẻ sinh viên mặt trước",
  studentCardBackImage: "Thẻ sinh viên mặt sau",
  certificateImages: "Bằng cấp",
  publicCertificateImages: "Bằng cấp công khai",
};

// Field còn được phép áp khi duyệt (khớp whitelist backend). Field ngoài danh sách
// này (vd đổi tên trường ở các yêu cầu cũ) sẽ KHÔNG được áp dụng dù admin bấm duyệt.
export const PROFILE_CHANGE_APPLICABLE_FIELDS = new Set([
  "phone",
  "occupationStatus",
  "teachingAreas",
  "currentArea",
  "bio",
  "availability",
  "subjects",
  "graduationYear",
  "cccdFrontImage",
  "cccdBackImage",
  "studentCardFrontImage",
  "studentCardBackImage",
  "certificateImages",
  "publicCertificateImages",
]);
