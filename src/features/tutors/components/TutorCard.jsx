import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Handshake,
  MapPin,
  MapPinned,
  School,
  Sparkles,
  User2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GENDER_LABEL, OCCUPATION_STATUS_LABEL, getAgeFromDate } from "@/features/tutors/constants";
import { StarRating } from "@/features/reviews";
import TrustedTutorBadge from "@/features/tutors/components/TrustedTutorBadge";

const getInitials = (name) =>
  (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const ROW_ICON = "mt-0.5 h-4 w-4 shrink-0 text-slate-400";

const MetaRow = ({ icon, children }) => (
  <div className="flex items-start gap-2 text-sm text-slate-600">
    {icon}
    <span className="min-w-0">{children}</span>
  </div>
);

export default function TutorCard({ tutor }) {
  const navigate = useNavigate();
  const occupationLabel = OCCUPATION_STATUS_LABEL[tutor.occupationStatus] || tutor.occupationStatus;
  const genderLabel = GENDER_LABEL[tutor.gender] || null;
  const age = getAgeFromDate(tutor.dateOfBirth);

  const locationParts = [tutor.currentArea?.districtName, tutor.currentArea?.provinceName].filter(Boolean);
  const totalClasses = tutor.totalClassesAccepted || 0;
  const monthClasses = tutor.classesAcceptedThisMonth || 0;
  const reviewCount = tutor.reviewCount || 0;
  const averageRating = tutor.averageRating || 0;

  const schoolLabel = tutor.schoolName
    ? `${tutor.schoolName}${tutor.graduationYear ? ` · TN ${tutor.graduationYear}` : ""}`
    : null;

  const teachDistricts = (tutor.teachingAreas?.districts || []).map((d) => d.name).filter(Boolean);
  const teachingLabel = tutor.teachingAreas?.provinceName
    ? `${tutor.teachingAreas.provinceName}${
        teachDistricts.length ? ` · ${teachDistricts.slice(0, 3).join(", ")}${teachDistricts.length > 3 ? "…" : ""}` : ""
      }`
    : null;

  return (
    <div className="group relative flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-[box-shadow,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md sm:flex-row">
      {/* Avatar */}
      <div className="shrink-0">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-emerald-400 to-[#1e3a5f] text-2xl font-bold text-white ring-4 ring-slate-100">
          {tutor.avatar ? (
            <img src={tutor.avatar} alt={tutor.fullName} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            getInitials(tutor.fullName)
          )}
        </div>
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-[#1e3a5f]">{tutor.fullName}</h3>
          {tutor.isTrusted && <TrustedTutorBadge />}
          {reviewCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <StarRating value={averageRating} size={15} />
              <span className="text-sm font-semibold text-amber-600">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({reviewCount})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <StarRating value={0} size={14} />
              Chưa có đánh giá
            </span>
          )}
        </div>

        {/* Detail grid */}
        <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {occupationLabel && (
            <MetaRow icon={<GraduationCap className={ROW_ICON} />}>
              <span className="font-medium text-[#1e3a5f]">{occupationLabel}</span>
            </MetaRow>
          )}
          {(genderLabel || age != null) && (
            <MetaRow icon={<User2 className={ROW_ICON} />}>
              {[genderLabel, age != null ? `${age} tuổi` : null].filter(Boolean).join(" · ")}
            </MetaRow>
          )}
          {locationParts.length > 0 && <MetaRow icon={<MapPin className={ROW_ICON} />}>{locationParts.join(", ")}</MetaRow>}
          {schoolLabel && <MetaRow icon={<School className={ROW_ICON} />}>{schoolLabel}</MetaRow>}
          {teachingLabel && (
            <MetaRow icon={<MapPinned className={ROW_ICON} />}>
              <span className="text-slate-500">Dạy tại:</span> {teachingLabel}
            </MetaRow>
          )}
        </div>

        {/* Bio */}
        {tutor.bio && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{tutor.bio}</p>}

        {/* Subjects */}
        {tutor.subjects?.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              <BookOpen className="h-3.5 w-3.5" />
              Môn dạy
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tutor.subjects.slice(0, 8).map((subject) => (
                <span
                  key={subject}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                >
                  {subject}
                </span>
              ))}
              {tutor.subjects.length > 8 && (
                <span className="px-1 py-0.5 text-xs text-slate-400">+{tutor.subjects.length - 8} môn khác</span>
              )}
            </div>
          </div>
        )}

        {/* Footer stats */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-slate-900">{totalClasses}</span> lớp đã nhận
            </span>
            {monthClasses > 0 && (
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <CalendarCheck className="h-4 w-4 text-emerald-600" />
                {monthClasses} lớp tháng này
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/find-tutor?tutor=${tutor.id}`);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e3a5f] px-3.5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#16304f]"
            >
              <Handshake className="h-4 w-4" />
              Chọn gia sư này dạy lớp của bạn
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 transition-all group-hover:gap-2.5 group-hover:bg-emerald-100">
              Xem hồ sơ
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
