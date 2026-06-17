import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import tutorService from "@/features/tutors/services/tutorService";
import { OCCUPATION_STATUS_LABEL, DAYS_OF_WEEK_OPTIONS } from "@/features/tutors/constants";
import {
  MapPin,
  BookOpen,
  GraduationCap,
  Phone,
  Mail,
  ArrowLeft,
  Clock,
  Users,
  Building2,
  CalendarDays,
  UserRound,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const GENDER_LABEL = { male: "Nam", female: "Nữ", other: "Khác" };

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDayLabel(dayValue) {
  const found = DAYS_OF_WEEK_OPTIONS.find((d) => d.value === dayValue);
  return found ? found.label : dayValue;
}

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
        const response = await tutorService.getTutorById(id);
        setTutor(response.data.data.tutor);
      } catch (err) {
        setError(err.response?.data?.message || "Không tìm thấy gia sư");
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <BackButton navigate={navigate} />
        <div className="text-center py-16 text-gray-500">Đang tải thông tin gia sư...</div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <BackButton navigate={navigate} />
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">{error || "Không tìm thấy gia sư"}</p>
          <button onClick={() => navigate("/tutors")} className="text-green-600 hover:underline">
            Xem danh sách gia sư
          </button>
        </div>
      </div>
    );
  }

  const occupationLabel = OCCUPATION_STATUS_LABEL[tutor.occupationStatus] || tutor.occupationStatus;
  const locationParts = [tutor.currentArea?.districtName, tutor.currentArea?.provinceName].filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <BackButton navigate={navigate} />

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar */}
        <div className="shrink-0 w-28 h-28 rounded-full bg-linear-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-4xl overflow-hidden">
          {tutor.avatar ? (
            <img src={tutor.avatar} alt={tutor.fullName} className="w-full h-full object-cover" />
          ) : (
            getInitials(tutor.fullName)
          )}
        </div>

        {/* Name & quick info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
            {tutor.fullName || "—"}
          </h1>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-600 mb-3">
            {occupationLabel && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-700">{occupationLabel}</span>
              </span>
            )}
            {locationParts.length > 0 && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-green-600" />
                {locationParts.join(", ")}
              </span>
            )}
            {tutor.gender && (
              <span className="flex items-center gap-1.5">
                <UserRound className="w-4 h-4 text-gray-400" />
                {GENDER_LABEL[tutor.gender] || tutor.gender}
              </span>
            )}
            {tutor.dateOfBirth && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                {formatDate(tutor.dateOfBirth)}
              </span>
            )}
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-sm font-medium">
              <Users className="w-3.5 h-3.5" />
              {tutor.totalClassesAccepted ?? 0} lớp đã dạy
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-sm font-medium">
              <Trophy className="w-3.5 h-3.5" />
              {tutor.classesAcceptedThisMonth ?? 0} lớp tháng này
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
          <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-40">Liên Hệ Gia Sư</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="space-y-4">
          {/* Thông tin liên hệ */}
          <InfoCard title="Liên hệ">
            {tutor.phone && (
              <InfoRow icon={<Phone className="w-4 h-4 text-blue-500" />} label="Điện thoại" value={tutor.phone} />
            )}
            {tutor.email && (
              <InfoRow icon={<Mail className="w-4 h-4 text-blue-500" />} label="Email" value={tutor.email} breakAll />
            )}
            {!tutor.phone && !tutor.email && <p className="text-sm text-gray-400">Chưa cập nhật</p>}
          </InfoCard>

          {/* Học vấn */}
          {(tutor.schoolName || tutor.graduationYear) && (
            <InfoCard title="Học vấn" icon={<Building2 className="w-4 h-4 text-green-600" />}>
              {tutor.schoolName && (
                <p className="font-semibold text-gray-900 text-sm">{tutor.schoolName}</p>
              )}
              {tutor.graduationYear && (
                <p className="text-xs text-gray-500 mt-0.5">Tốt nghiệp năm {tutor.graduationYear}</p>
              )}
            </InfoCard>
          )}

          {/* Khu vực giảng dạy */}
          {tutor.teachingAreas && (
            <InfoCard title="Khu vực dạy" icon={<MapPin className="w-4 h-4 text-green-600" />}>
              <p className="font-semibold text-gray-900 text-sm">
                {tutor.teachingAreas.provinceName || "—"}
              </p>
              {tutor.teachingAreas.districts?.length > 0 && (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {tutor.teachingAreas.districts.map((d) => d.name).filter(Boolean).join(", ")}
                </p>
              )}
            </InfoCard>
          )}
        </div>

        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Giới thiệu */}
          {tutor.bio && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Giới thiệu</h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{tutor.bio}</p>
            </section>
          )}

          {/* Môn dạy */}
          {tutor.subjects?.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600" />
                Môn học giảng dạy
              </h2>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Lịch giảng dạy */}
          {tutor.availability?.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                Lịch giảng dạy
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tutor.availability.map((slot, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center"
                  >
                    <p className="font-semibold text-gray-900 text-sm">{getDayLabel(slot.day)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {slot.startTime} – {slot.endTime}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function BackButton({ navigate }) {
  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 text-sm font-medium"
    >
      <ArrowLeft className="w-4 h-4" />
      Quay lại
    </button>
  );
}

function InfoCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, breakAll }) {
  return (
    <div className="flex items-start gap-2 mb-2 last:mb-0">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-sm text-gray-700 font-medium ${breakAll ? "break-all" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
