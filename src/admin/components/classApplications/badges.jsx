import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

import { CLASS_STATUS_META } from "@/features/classes/utils/classStatus";

// Ô thống kê hiển thị nhãn và số lượng theo một trạng thái.
export const StatCard = ({ label, count, color, loading }) => {
  const colors = {
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  };
  return (
    <div className={`flex flex-col items-center rounded-xl border px-6 py-4 ${colors[color]}`}>
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin opacity-60" />
      ) : (
        <span className="text-2xl font-bold">{count}</span>
      )}
      <span className="mt-0.5 text-xs font-medium">{label}</span>
    </div>
  );
};

// Nhãn cho biết gia sư có dạy đúng môn của lớp hay không.
export const SubjectMatchBadge = ({ tutorSubjects, classSubject }) => {
  const matches = Array.isArray(tutorSubjects) && tutorSubjects.includes(classSubject);
  return matches ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Đúng môn đăng ký
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
      <XCircle className="h-3.5 w-3.5" />
      Không đúng môn
    </span>
  );
};

// Nhãn màu thể hiện trạng thái của đơn nhận lớp.
export const StatusBadge = ({ status }) => {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Đã duyệt
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
        <XCircle className="h-3.5 w-3.5" />
        Từ chối
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <Clock className="h-3.5 w-3.5" />
      Chờ duyệt
    </span>
  );
};

// Ảnh đại diện gia sư, fallback về chữ cái đầu khi không có ảnh.
export const TutorAvatar = ({ tutor, size = "h-10 w-10" }) =>
  tutor?.avatar ? (
    <img
      src={tutor.avatar}
      alt={tutor.fullName}
      referrerPolicy="no-referrer"
      className={`${size} rounded-full object-cover ring-2 ring-slate-100`}
    />
  ) : (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-inner`}
    >
      {(tutor?.fullName ?? "?")[0]}
    </div>
  );

// Nhãn màu thể hiện trạng thái vòng đời của bài đăng lớp.
export const ClassStatusBadge = ({ status }) => {
  const s = CLASS_STATUS_META[status] || CLASS_STATUS_META.open;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${s.className}`}
    >
      {s.label}
    </span>
  );
};
