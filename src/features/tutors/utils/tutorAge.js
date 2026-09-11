// Tính tuổi từ ngày sinh (ISO string hoặc Date). Trả null nếu không hợp lệ.
// Tính tuổi từ ngày sinh.
export const getAgeFromDate = (value) => {
  if (!value) return null;
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age >= 0 && age < 120 ? age : null;
};
