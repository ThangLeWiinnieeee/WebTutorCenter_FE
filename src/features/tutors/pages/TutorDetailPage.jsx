import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import tutorService from "@/features/tutors/services/tutorService";
import {
  MapPin,
  BookOpen,
  GraduationCap,
  Phone,
  Mail,
  ArrowLeft,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TutorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        // Use existing getProfile service if available, or create new endpoint
        const response = await fetch(`http://localhost:5002/api/tutors/${id}`);
        if (!response.ok) {
          throw new Error("Không tìm thấy gia sư");
        }
        const data = await response.json();
        setTutor(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <div className="text-center py-12 text-gray-500">Đang tải thông tin gia sư...</div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{error || "Không tìm thấy gia sư"}</p>
          <button onClick={() => navigate("/tim-gia-su")} className="text-green-600 hover:underline">
            Xem danh sách gia sư
          </button>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </button>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="md:flex gap-8 p-8">
          {/* Left: Avatar & Basic Info */}
          <div className="md:w-1/3 flex-shrink-0 mb-8 md:mb-0">
            {/* Avatar */}
            <div className="w-full max-w-sm mx-auto md:mx-0">
              <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-5xl mb-6">
                {tutor.avatar ? (
                  <img
                    src={tutor.avatar}
                    alt={tutor.fullName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  getInitials(tutor.fullName)
                )}
              </div>

              {/* Quick Info */}
              <div className="space-y-3">
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold text-gray-900">{tutor.fullName}</h1>
                  {tutor.occupationStatus && (
                    <p className="text-gray-600">{tutor.occupationStatus}</p>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>
                    {tutor.currentArea?.district}, {tutor.currentArea?.province}
                  </span>
                </div>

                {/* Stats */}
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">
                      <strong>{tutor.totalClassesAccepted || 0}</strong> lớp dạy
                    </span>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  {tutor.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span>{tutor.email}</span>
                    </div>
                  )}
                  {tutor.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span>{tutor.phone}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button className="w-full mt-6 bg-green-600 hover:bg-green-700">
                  Liên Hệ Gia Sư
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:w-2/3 space-y-8">
            {/* Bio */}
            {tutor.bio && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Giới Thiệu</h2>
                <p className="text-gray-600 leading-relaxed">{tutor.bio}</p>
              </div>
            )}

            {/* Teaching Subjects */}
            {tutor.teachingSubjects && tutor.teachingSubjects.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  Môn Học Dạy
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tutor.teachingSubjects.map((subject) => (
                    <span
                      key={subject}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Teaching Areas */}
            {tutor.teachingAreas && tutor.teachingAreas.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Khu Vực Giảng Dạy
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {tutor.teachingAreas.map((area, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <p className="font-semibold text-gray-900">{area.province}</p>
                      {area.districts && area.districts.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          {area.districts.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {tutor.availability && tutor.availability.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Lịch Làm Việc
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {tutor.availability.map((slot, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 text-center"
                    >
                      <p className="font-semibold text-gray-900">{slot.day}</p>
                      <p className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {tutor.education && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  Trình Độ
                </h2>
                <p className="text-gray-600">{tutor.education}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
