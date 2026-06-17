import { Users, MapPin } from "lucide-react";

export default function TopTutorCard({ tutor }) {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const locationParts = [
    tutor.currentArea?.districtName,
    tutor.currentArea?.provinceName,
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-300 transition-all cursor-pointer h-full">
      {/* Avatar */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <div className="w-16 h-16 rounded-full bg-linear-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
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
      <div className="px-4 pb-4 space-y-2">
        <h3 className="font-bold text-gray-900 text-center text-sm leading-tight">
          {tutor.fullName}
        </h3>

        {locationParts.length > 0 && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{locationParts.join(", ")}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-sm">
          <Users className="w-4 h-4 text-green-600" />
          <span className="text-gray-700">
            {tutor.totalClassesAccepted || 0} lớp
          </span>
        </div>

        {tutor.subjects && tutor.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {tutor.subjects.slice(0, 3).map((subject) => (
              <span
                key={subject}
                className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded"
              >
                {subject}
              </span>
            ))}
            {tutor.subjects.length > 3 && (
              <span className="text-xs text-gray-400">
                +{tutor.subjects.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
