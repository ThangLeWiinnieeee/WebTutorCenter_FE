import { MapPin, Users, BookOpen, GraduationCap } from "lucide-react";

export default function TutorCard({ tutor }) {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all">
      <div className="flex gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
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

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{tutor.fullName}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span>
                  {tutor.currentArea?.district}, {tutor.currentArea?.province}
                </span>
              </div>
            </div>
          </div>

          {/* Bio/Description */}
          {tutor.bio && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tutor.bio}</p>
          )}

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">{tutor.totalClassesAccepted || 0} lớp</span>
            </div>

            {tutor.occupationStatus && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">{tutor.occupationStatus}</span>
              </div>
            )}

            {tutor.classesAcceptedThisMonth !== undefined && (
              <div className="flex items-center gap-2 text-sm bg-yellow-50 px-2 py-1 rounded">
                <span className="font-semibold text-yellow-700">
                  {tutor.classesAcceptedThisMonth} lớp tháng này
                </span>
              </div>
            )}
          </div>

          {/* Teaching Subjects */}
          {tutor.teachingSubjects && tutor.teachingSubjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tutor.teachingSubjects.slice(0, 5).map((subject) => (
                <span
                  key={subject}
                  className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full"
                >
                  {subject}
                </span>
              ))}
              {tutor.teachingSubjects.length > 5 && (
                <span className="text-xs text-gray-500 px-3 py-1">
                  +{tutor.teachingSubjects.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
