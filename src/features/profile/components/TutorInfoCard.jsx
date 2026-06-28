import {
  BookOpen,
  MapPin,
  GraduationCap,
  Clock,
  User2,
  Briefcase,
  AlertCircle,
  Loader2,
  Pencil,
  Hourglass,
} from "lucide-react";
import {
  TUTOR_STATUS_CONFIG,
  OCCUPATION_STATUS_LABEL,
  DAYS_OF_WEEK_OPTIONS,
} from "@/features/tutors/constants";
import { createElement } from "react";
import { ProfileBadge } from "./ProfileBadges";
import TrustedTutorBadge from "@/features/tutors/components/TrustedTutorBadge";

const Section = ({ icon, title, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
      {createElement(icon, { className: "h-4 w-4 text-slate-500" })}
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
    </div>
    {children}
  </div>
);

const dayLabel = (day) =>
  DAYS_OF_WEEK_OPTIONS.find((d) => d.value === day)?.label ?? day;

const hhmm = (h) => `${String(h).padStart(2, "0")}:00`;

// Gộp các giờ liên tiếp trong cùng 1 ngày thành 1 khoảng; tách khi có quãng trống.
// VD ngày T2 có giờ [7..15] → "07:00 – 16:00"; nếu thêm [19..21] → thành 2 khoảng.
const buildAvailabilityRanges = (availability = []) => {
  const order = DAYS_OF_WEEK_OPTIONS.map((d) => d.value);
  const hoursByDay = new Map();
  for (const slot of availability) {
    if (!slot || slot.hour == null) continue;
    if (!hoursByDay.has(slot.day)) hoursByDay.set(slot.day, []);
    hoursByDay.get(slot.day).push(Number(slot.hour));
  }

  const ranges = [];
  for (const day of order) {
    const hours = hoursByDay.get(day);
    if (!hours?.length) continue;
    const sorted = [...new Set(hours)].sort((a, b) => a - b);
    let start = sorted[0];
    let prev = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === prev + 1) {
        prev = sorted[i];
      } else {
        ranges.push({ day, start, end: prev + 1 });
        start = sorted[i];
        prev = sorted[i];
      }
    }
    ranges.push({ day, start, end: prev + 1 });
  }
  return ranges;
};

const TutorInfoCard = ({ tutorProfile, loading, canEdit = false, pendingRequest = null, onEdit }) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!tutorProfile) return null;

  const statusConfig =
    TUTOR_STATUS_CONFIG[tutorProfile.status] ?? {
      label: tutorProfile.status,
      className: "bg-slate-100 text-slate-600 border border-slate-200",
    };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-700">Hồ sơ gia sư</h3>
        <div className="flex items-center gap-3">
          {tutorProfile.isTrusted && <TrustedTutorBadge />}
          {canEdit && !pendingRequest && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Chỉnh sửa
            </button>
          )}
          <ProfileBadge className={statusConfig.className}>{statusConfig.label}</ProfileBadge>
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* Đang chờ duyệt thay đổi */}
        {pendingRequest && (
          <div className="flex gap-3 rounded-lg bg-amber-50 border border-amber-100 p-4">
            <Hourglass className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Bạn có một yêu cầu đổi thông tin đang chờ admin duyệt. Khi được duyệt, hồ sơ sẽ tự động cập nhật.
            </p>
          </div>
        )}

        {/* Rejection notice */}
        {tutorProfile.status === "rejected" && tutorProfile.rejectionReason && (
          <div className="flex gap-3 rounded-lg bg-rose-50 border border-rose-100 p-4">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-rose-700 mb-1">Lý do từ chối</p>
              <p className="text-sm text-rose-600">{tutorProfile.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Pending notice */}
        {tutorProfile.status === "pending" && (
          <div className="flex gap-3 rounded-lg bg-amber-50 border border-amber-100 p-4">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Hồ sơ của bạn đang được xét duyệt. Chúng tôi sẽ thông báo kết quả trong 1–3 ngày làm việc.
            </p>
          </div>
        )}

        {/* Contact */}
        <Section icon={User2} title="Liên hệ">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 w-36 shrink-0">Số điện thoại</span>
            <span className="text-sm font-medium text-slate-800">{tutorProfile.phone || "—"}</span>
          </div>
        </Section>

        {/* Occupation & Education */}
        <Section icon={Briefcase} title="Nghề nghiệp & Học vấn">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 w-36 shrink-0">Tình trạng</span>
              <span className="text-sm font-medium text-slate-800">
                {OCCUPATION_STATUS_LABEL[tutorProfile.occupationStatus] || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 w-36 shrink-0">Trường học</span>
              <span className="text-sm font-medium text-slate-800">{tutorProfile.schoolName || "—"}</span>
            </div>
            {tutorProfile.graduationYear && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 w-36 shrink-0">Năm tốt nghiệp</span>
                <span className="text-sm font-medium text-slate-800">{tutorProfile.graduationYear}</span>
              </div>
            )}
          </div>
        </Section>

        {/* Subjects */}
        <Section icon={BookOpen} title="Môn học giảng dạy">
          <div className="flex flex-wrap gap-1.5">
            {tutorProfile.subjects?.length > 0 ? (
              tutorProfile.subjects.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">—</span>
            )}
          </div>
        </Section>

        {/* Areas */}
        <Section icon={MapPin} title="Khu vực">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-sm text-slate-500 w-36 shrink-0">Khu vực hiện tại</span>
              <span className="text-sm font-medium text-slate-800">
                {tutorProfile.currentArea
                  ? `${tutorProfile.currentArea.districtName}, ${tutorProfile.currentArea.provinceName}`
                  : "—"}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm text-slate-500 w-36 shrink-0">Có thể dạy tại</span>
              <div>
                {tutorProfile.teachingAreas?.provinceName && (
                  <p className="text-sm font-medium text-slate-800 mb-1">{tutorProfile.teachingAreas.provinceName}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {tutorProfile.teachingAreas?.districts?.map((d, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs text-emerald-700"
                    >
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Bio */}
        <Section icon={User2} title="Giới thiệu bản thân">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap rounded-lg bg-slate-50 border border-slate-100 p-4">
            {tutorProfile.bio || "—"}
          </p>
        </Section>

        {/* Availability */}
        {tutorProfile.availability?.length > 0 && (
          <Section icon={Clock} title="Lịch giảng dạy">
            <div className="flex flex-wrap gap-2">
              {buildAvailabilityRanges(tutorProfile.availability).map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5"
                >
                  <span className="text-xs font-medium text-slate-700">{dayLabel(r.day)}</span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs text-slate-600">
                    {hhmm(r.start)} – {hhmm(r.end)}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

export default TutorInfoCard;
