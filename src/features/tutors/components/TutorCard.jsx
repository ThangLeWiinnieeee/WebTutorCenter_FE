import { MapPin, GraduationCap, BookOpen } from "lucide-react";
import { OCCUPATION_STATUS_LABEL } from "@/features/tutors/constants";

export default function TutorCard({ tutor }) {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const occupationLabel =
    OCCUPATION_STATUS_LABEL[tutor.occupationStatus] || tutor.occupationStatus;

  const locationParts = [
    tutor.currentArea?.districtName,
    tutor.currentArea?.provinceName,
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all">
      <div className="flex gap-5 items-start">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
            {tutor.avatar ? (
              <img
                src={tutor.avatar}
                alt={tutor.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(tutor.fullName)
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Họ tên */}
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {tutor.fullName}
          </h3>

          {/* Tình trạng nghề nghiệp */}
          {occupationLabel && (
            <div className="flex items-center gap-1.5 mt-1 mb-2">
              <GraduationCap className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm font-medium text-blue-700">
                {occupationLabel}
              </span>
            </div>
          )}

          {/* Khu vực */}
          {locationParts.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{locationParts.join(", ")}</span>
            </div>
          )}

          {/* Môn dạy */}
          {tutor.subjects && tutor.subjects.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Môn dạy</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tutor.subjects.slice(0, 6).map((subject) => (
                  <span
                    key={subject}
                    className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full"
                  >
                    {subject}
                  </span>
                ))}
                {tutor.subjects.length > 6 && (
                  <span className="text-xs text-gray-400 px-1 py-0.5">
                    +{tutor.subjects.length - 6} môn khác
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
