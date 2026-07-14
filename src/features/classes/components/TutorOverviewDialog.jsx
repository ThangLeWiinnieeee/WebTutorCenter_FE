import { useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  Loader2,
  MapPin,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";

import tutorService from "@/features/tutors/services/tutorService";
import { getTutorInitials } from "@/features/tutors/utils/tutorInitials";
import { OCCUPATION_STATUS_LABEL, GENDER_LABEL } from "@/features/tutors/constants";
import TrustedTutorBadge from "@/features/tutors/components/TrustedTutorBadge";
import { StarRating } from "@/features/reviews";

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Popup xem nhanh thông tin tổng quát của một gia sư ứng tuyển (đọc chi tiết công khai
// qua tutorService.getTutorById — cùng nguồn với trang /tutors/:id, đã ẩn SĐT/email).
export default function TutorOverviewDialog({ tutorId, onClose }) {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tutorId) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      setTutor(null);
      try {
        const res = await tutorService.getTutorById(tutorId);
        if (active) setTutor(res.data.data.tutor);
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Không tải được thông tin gia sư");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [tutorId]);

  if (!tutorId) return null;

  const occupationLabel = tutor && (OCCUPATION_STATUS_LABEL[tutor.occupationStatus] || tutor.occupationStatus);
  const locationParts = tutor
    ? [tutor.currentArea?.districtName, tutor.currentArea?.provinceName].filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Thông tin gia sư</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang tải thông tin gia sư...
            </div>
          )}

          {!loading && error && (
            <div className="py-12 text-center text-sm text-rose-600">{error}</div>
          )}

          {!loading && tutor && (
            <div className="space-y-5">
              {/* Đầu trang: avatar + tên + badge */}
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-green-400 to-blue-500 text-2xl font-bold text-white">
                  {tutor.avatar ? (
                    <img src={tutor.avatar} alt={tutor.fullName || "Gia sư"} className="h-full w-full object-cover" />
                  ) : (
                    getTutorInitials(tutor.fullName)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h4 className="text-xl font-bold text-slate-900">{tutor.fullName || "—"}</h4>
                    {tutor.isTrusted && <TrustedTutorBadge />}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    {occupationLabel && (
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-medium text-blue-700">{occupationLabel}</span>
                      </span>
                    )}
                    {locationParts.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-green-600" />
                        {locationParts.join(", ")}
                      </span>
                    )}
                    {tutor.gender && (
                      <span className="inline-flex items-center gap-1">
                        <UserRound className="h-3.5 w-3.5 text-slate-400" />
                        {GENDER_LABEL[tutor.gender] || tutor.gender}
                      </span>
                    )}
                    {tutor.dateOfBirth && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(tutor.dateOfBirth)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Chỉ số */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                  <Users className="h-3.5 w-3.5" />
                  {tutor.totalClassesAccepted ?? 0} lớp đã dạy
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                  <Trophy className="h-3.5 w-3.5" />
                  {tutor.classesAcceptedThisMonth ?? 0} lớp tháng này
                </span>
                {(tutor.reviewCount ?? 0) > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-medium">
                    <StarRating value={tutor.averageRating ?? 0} size={15} />
                    <span className="font-semibold text-amber-600">{(tutor.averageRating ?? 0).toFixed(1)}</span>
                    <span className="text-slate-400">({tutor.reviewCount})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-500">
                    <StarRating value={0} size={15} />
                    Chưa có đánh giá
                  </span>
                )}
              </div>

              {/* Học vấn */}
              {(tutor.schoolName || tutor.graduationYear) && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <h5 className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <Building2 className="h-4 w-4 text-green-600" />
                    Học vấn
                  </h5>
                  {tutor.schoolName && <p className="text-sm font-semibold text-slate-900">{tutor.schoolName}</p>}
                  {tutor.graduationYear && (
                    <p className="mt-0.5 text-xs text-slate-500">Tốt nghiệp năm {tutor.graduationYear}</p>
                  )}
                </div>
              )}

              {/* Môn dạy */}
              {tutor.subjects?.length > 0 && (
                <div>
                  <h5 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    Môn học giảng dạy
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Giới thiệu */}
              {tutor.bio && (
                <div>
                  <h5 className="mb-2 text-sm font-bold text-slate-900">Giới thiệu</h5>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{tutor.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-3">
          {tutor ? (
            <a
              href={`/tutors/${tutor.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800"
            >
              <ExternalLink className="h-4 w-4" />
              Xem hồ sơ đầy đủ
            </a>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
