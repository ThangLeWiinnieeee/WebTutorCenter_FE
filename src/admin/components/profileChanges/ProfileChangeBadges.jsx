import { getInitials } from "@/lib/format";

// Badge trạng thái + avatar người gửi — dùng chung ở danh sách và modal chi tiết.

// Nhãn màu thể hiện trạng thái yêu cầu đổi hồ sơ.
export const StatusBadge = ({ status }) => {
  const config = {
    pending: { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700 border-amber-200" },
    approved: { label: "Đã duyệt", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rejected: { label: "Đã từ chối", className: "bg-rose-50 text-rose-700 border-rose-200" },
  }[status] || { label: status, className: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
};

// Khối ảnh đại diện người dùng, fallback về chữ cái đầu khi không có ảnh.
export const AvatarBlock = ({ user, size = "md" }) => {
  const cls = size === "lg" ? "h-11 w-11" : "h-10 w-10";
  return user?.avatar ? (
    <img
      src={user.avatar}
      alt={user.fullName}
      referrerPolicy="no-referrer"
      className={`${cls} rounded-full object-cover ring-2 ring-slate-100`}
    />
  ) : (
    <div
      className={`flex ${cls} items-center justify-center rounded-full bg-brand text-sm font-bold text-white`}
    >
      {getInitials(user?.fullName)}
    </div>
  );
};
