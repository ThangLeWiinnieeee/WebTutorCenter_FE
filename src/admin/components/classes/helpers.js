// Tên người đăng bài (fallback khi tài khoản đã bị xóa). Dùng chung giữa bảng
// danh sách và modal chi tiết bài đăng.
export const getPosterName = (classItem) =>
  classItem.createdBy?.fullName || classItem.createdBy?.email || "Người dùng đã xóa";
