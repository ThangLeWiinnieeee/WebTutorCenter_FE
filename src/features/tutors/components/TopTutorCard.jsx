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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-300 transition-all cursor-pointer h-full">
      {/* Avatar Section */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
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

      {/* Tutor Info */}
      <div className="px-4 pb-4 space-y-3">
        {/* Name */}
        <h3 className="font-bold text-gray-900 text-center text-lg">{tutor.fullName}</h3>

        {/* Location */}
        {tutor.currentArea && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {tutor.currentArea.district || ""},
              {tutor.currentArea.province || ""}
            </span>
          </div>
        )}

        {/* Rating or Classes */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <Users className="w-4 h-4 text-green-600" />
          <span className="text-gray-700">
            {tutor.totalClassesAccepted || 0} lớp
          </span>
        </div>

        {/* Teaching Subjects */}
        {tutor.teachingSubjects && tutor.teachingSubjects.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {tutor.teachingSubjects.slice(0, 3).map((subject) => (
              <span
                key={subject}
                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
              >
                {subject}
              </span>
            ))}
            {tutor.teachingSubjects.length > 3 && (
              <span className="text-xs text-gray-500">
                +{tutor.teachingSubjects.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
