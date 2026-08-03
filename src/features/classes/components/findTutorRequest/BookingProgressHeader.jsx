import { useWatch } from "react-hook-form";

import { cn } from "@/lib/utils";

const BOOKING_PROGRESS_FIELD_NAMES = [
  "contactPhone",
  "subject",
  "summary",
  "provinceCode",
  "districtCode",
  "locationLabel",
  "studentCount",
  "startDate",
  "minutesPerSession",
  "sessionsPerWeek",
  "studentGender",
  "availabilitySlots",
  "tutorGenderPref",
  "tutorLevelPref",
  "description",
];

// Thanh tiến trình các bước điền form đăng lớp.
const BookingProgressHeader = ({ control, isEdit = false }) => {
  const watched = useWatch({ control, name: BOOKING_PROGRESS_FIELD_NAMES }) || [];
  const [
    contactPhone,
    subject,
    summary,
    provinceCode,
    districtCode,
    locationLabel,
    studentCount,
    startDate,
    minutesPerSession,
    sessionsPerWeek,
    studentGender,
    availabilitySlots,
    tutorGenderPref,
    tutorLevelPref,
    description,
  ] = watched;

  // Section 1: Thông tin lớp học (6 fields)
  const s1Fields = [
    !!contactPhone && /^(84|0)(3|5|7|8|9)[0-9]{8}$/.test(contactPhone),
    !!subject,
    !!summary && summary.trim().length >= 10,
    !!provinceCode && Number(provinceCode) > 0,
    !!districtCode && Number(districtCode) > 0,
    !!locationLabel && locationLabel.trim().length >= 3,
  ];
  const s1Filled = s1Fields.filter(Boolean).length;
  const s1Progress = Math.round((s1Filled / 6) * 100);

  // Section 2: Lịch học (6 fields)
  const s2Fields = [
    !!studentCount && Number(studentCount) >= 1,
    !!startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate),
    !!minutesPerSession && Number(minutesPerSession) > 0,
    !!sessionsPerWeek && Number(sessionsPerWeek) >= 1,
    ["male", "female", "other"].includes(studentGender),
    Array.isArray(availabilitySlots) && availabilitySlots.length >= 1,
  ];
  const s2Filled = s2Fields.filter(Boolean).length;
  const s2Progress = Math.round((s2Filled / 6) * 100);

  // Section 3: Yêu cầu gia sư (2 fields)
  const s3Fields = [
    ["male", "female", "other", "any"].includes(tutorGenderPref),
    ["student", "teacher", "any"].includes(tutorLevelPref),
  ];
  const s3Filled = s3Fields.filter(Boolean).length;
  const s3Progress = Math.round((s3Filled / 2) * 100);

  // Section 5: Mô tả chi tiết (1 field)
  const s5Fields = [!!description && description.trim().length >= 20];
  const s5Filled = s5Fields.filter(Boolean).length;
  const s5Progress = Math.round((s5Filled / 1) * 100);

  // Total Progress
  const totalFilled = s1Filled + s2Filled + s3Filled + s5Filled;
  const totalFields = 15;
  const progress = Math.round((totalFilled / totalFields) * 100);

  const sectionsInfo = [
    { label: "1. Thông tin lớp", progress: s1Progress },
    { label: "2. Lịch học", progress: s2Progress },
    { label: "3. Yêu cầu gia sư", progress: s3Progress },
    { label: "4. Mô tả chi tiết", progress: s5Progress },
    { label: "5. Xác nhận", progress: progress === 100 ? 100 : 0 },
  ];

  return (
    <section className="mb-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {isEdit ? "Chỉnh sửa bài đăng tìm gia sư" : "Tìm gia sư phù hợp cho con bạn"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
            {isEdit
              ? "Cập nhật thông tin lớp học. Học phí sẽ được tính lại tự động khi bạn lưu."
              : "Cung cấp càng rõ thông tin lớp học, hệ thống càng ghép gia sư nhanh và chính xác."}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 min-w-[150px] text-center md:text-left">
          <p className="font-semibold text-xs uppercase tracking-wider text-slate-500">Tiến độ tổng thể</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">{progress}%</p>
        </div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-xs md:grid-cols-5">
        {sectionsInfo.map((item) => {
          const isComplete = item.progress === 100;
          const isStarted = item.progress > 0;
          return (
            <div
              key={item.label}
              className={cn(
                "rounded-xl p-3 text-center border font-medium transition-all duration-300 flex flex-col justify-between gap-1 shadow-sm",
                isComplete
                  ? "bg-emerald-50/70 border-emerald-250 text-emerald-800"
                  : isStarted
                    ? "bg-amber-50/70 border-amber-250 text-amber-800"
                    : "bg-slate-50/60 border-slate-200/50 text-slate-400",
              )}
            >
              <span className="font-semibold text-slate-750">{item.label}</span>
              <span
                className={cn(
                  "text-[10px] font-bold mt-1.5",
                  isComplete ? "text-emerald-600" : isStarted ? "text-amber-600" : "text-slate-450",
                )}
              >
                {isComplete ? "✓ Hoàn thành" : isStarted ? `Đang điền (${item.progress}%)` : "Chưa bắt đầu"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BookingProgressHeader;
