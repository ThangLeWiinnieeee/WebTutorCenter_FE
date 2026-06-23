// Các liên kết điều hướng chính trên Header.
// `hideForTutor`: ẩn mục với tài khoản đã là gia sư (vd "Trở thành gia sư").
export const NAV_LINKS = [
  { label: "Trang chủ", to: "/", paths: ["/"] },
  { label: "Lớp cần gia sư", to: "/classes", paths: ["/classes"] },
  { label: "Tìm gia sư", to: "/find-tutor", paths: ["/find-tutor"] },
  { label: "Danh sách gia sư", to: "/tutors", paths: ["/tutors"] },
  { label: "Trở thành gia sư", to: "/register-tutor", paths: ["/register-tutor"], hideForTutor: true },
];
