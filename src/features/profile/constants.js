export const ROLE_CONFIG = {
  user: { label: "Học viên", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  tutor: { label: "Gia sư", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  admin: { label: "Quản trị viên", className: "bg-rose-50 text-rose-700 border border-rose-200" },
};

export const GENDER_LABEL = { male: "Nam", female: "Nữ", other: "Khác" };

export const toInputDate = (dateVal) => {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
};

export const formatDate = (dateVal) => {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};
