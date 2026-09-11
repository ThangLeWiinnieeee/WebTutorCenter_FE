import { CalendarDays, Clock3, SunMedium, Users } from "lucide-react";
import { useWatch } from "react-hook-form";

import { formatDdMmYyyyUi } from "@/features/classes/utils/classRequestDateUtils";

// Xem trước lịch học đã chọn trong form đăng lớp.
const SchedulePreviewCard = ({ control }) => {
  const watched =
    useWatch({
      control,
      name: ["studentCount", "sessionsPerWeek", "minutesPerSession", "startDate"],
    }) || [];
  const [studentCount, sessionsPerWeek, minutesPerSession, startDateVal] = watched;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-5 shadow-inner">
      <div className="relative z-1">
        <p className="text-sm font-bold text-emerald-950">Lịch học dự kiến</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-center gap-2.5 text-slate-700">
            <Users className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{studentCount || 1} học viên</span>
          </li>
          <li className="flex items-center gap-2.5 text-slate-700">
            <CalendarDays className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{sessionsPerWeek || 1} buổi / tuần</span>
          </li>
          <li className="flex items-center gap-2.5 text-slate-700">
            <Clock3 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{minutesPerSession || 90} phút / buổi</span>
          </li>
          <li className="flex items-center gap-2.5 text-slate-700">
            <SunMedium className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Bắt đầu: {startDateVal && formatDdMmYyyyUi(startDateVal) ? formatDdMmYyyyUi(startDateVal) : "—"}
            </span>
          </li>
        </ul>
      </div>
      <div className="pointer-events-none absolute -bottom-6 -right-4 flex opacity-70">
        <CalendarDays className="h-24 w-24 text-emerald-200/90" strokeWidth={1} />
        <Clock3 className="-ml-4 mt-4 h-20 w-20 text-teal-200/80" strokeWidth={1} />
      </div>
    </div>
  );
};

export default SchedulePreviewCard;
