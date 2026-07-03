// Viết tắt tên cho avatar thẻ gia sư: lấy chữ cái đầu của mỗi từ, giữ tối đa 2 ký tự.
// Khác với getInitials ở profile (chữ đầu + chữ cuối) — giữ nguyên hành vi cũ của các thẻ.
export const getTutorInitials = (name) =>
  (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
