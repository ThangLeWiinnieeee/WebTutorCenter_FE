import { MapPin, Users } from "lucide-react";

const getInitials = (name) =>
  (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export default function TopTutorCard({ tutor, rank }) {
  const locationParts = [tutor.currentArea?.districtName, tutor.currentArea?.provinceName].filter(Boolean);

  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
      {rank != null && (
        <span
          className={`absolute left-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
            rank === 1 ? "bg-amber-500" : rank === 2 ? "bg-slate-400" : rank === 3 ? "bg-orange-500" : "bg-[#1e3a5f]"
          }`}
        >
          {rank}
        </span>
      )}

      <div className="flex h-full flex-col items-center px-4 pb-6 pt-6">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-emerald-400 to-[#1e3a5f] text-lg font-bold text-white ring-4 ring-slate-100">
          {tutor.avatar ? (
            <img src={tutor.avatar} alt={tutor.fullName} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            getInitials(tutor.fullName)
          )}
        </div>

        <h3 className="mt-3 line-clamp-1 text-center text-sm font-bold text-slate-900">{tutor.fullName}</h3>

        {locationParts.length > 0 && (
          <div className="mt-1 flex items-start justify-center gap-1 text-xs text-slate-500">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="text-center wrap-break-word">{locationParts.join(", ")}</span>
          </div>
        )}

        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          <Users className="h-3.5 w-3.5" />
          {tutor.totalClassesAccepted || 0} lớp
        </div>

        {tutor.subjects?.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {tutor.subjects.slice(0, 2).map((subject) => (
              <span key={subject} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {subject}
              </span>
            ))}
            {tutor.subjects.length > 2 && (
              <span className="text-xs text-slate-400">+{tutor.subjects.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
