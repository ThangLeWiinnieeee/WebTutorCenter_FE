import { Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopThisMonthTutors({ tutors = [] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-bold text-gray-900">Top Tháng Này</h3>
      </div>

      {/* Tutor List */}
      <div className="space-y-4">
        {tutors.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Không có dữ liệu</p>
        ) : (
          tutors.map((tutor, index) => (
            <Link
              key={tutor.id}
              to={`/tutors/${tutor.id}`}
              className="flex items-start gap-3 pb-4 border-b border-gray-100 hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors cursor-pointer"
            >
              {/* Rank */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {tutor.fullName}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <Users className="w-3 h-3" />
                  <span>{tutor.classesAcceptedThisMonth || 0} lớp</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* View More Link */}
      <Link
        to="/tutors"
        className="block mt-6 text-center py-2 px-4 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-semibold transition-colors"
      >
        Xem Tất Cả
      </Link>
    </div>
  );
}
