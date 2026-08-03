import { CheckCircle2, XCircle } from "lucide-react";

import { getInitials } from "@/lib/format";

// Badge trạng thái (hoạt động/xác thực) + ô avatar người dùng cho bảng danh sách.

// Nhãn bật/tắt trạng thái hoạt động trong bảng người dùng.
export const StatusBadge = ({ active, activeLabel, inactiveLabel }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
      active
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-50 text-slate-600"
    }`}
  >
    {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
    {active ? activeLabel : inactiveLabel}
  </span>
);

// Ô avatar kèm tên/email của người dùng trong bảng.
export const UserAvatar = ({ user }) => (
  <div className="flex items-center gap-3">
    {user.avatar ? (
      <img
        src={user.avatar}
        alt={user.fullName}
        referrerPolicy="no-referrer"
        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
      />
    ) : (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
        {getInitials(user.fullName || user.email)}
      </div>
    )}
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-slate-800">{user.fullName || "Chưa cập nhật"}</p>
      <p className="truncate text-xs text-slate-500">{user.email}</p>
    </div>
  </div>
);
