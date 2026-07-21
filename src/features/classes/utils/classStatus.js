// Nhãn và màu hiển thị cho từng trạng thái vòng đời của bài đăng lớp.
export const CLASS_STATUS_META = {
  open: { label: "Đang mở", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  matched: { label: "Đã có gia sư", className: "bg-sky-50 text-sky-700 border-sky-200" },
  completed: { label: "Đã hoàn thành", className: "bg-violet-50 text-violet-700 border-violet-200" },
  expired: { label: "Hết hạn", className: "bg-slate-100 text-slate-500 border-slate-200" },
};
