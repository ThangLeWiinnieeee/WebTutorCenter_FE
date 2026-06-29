import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Star } from "lucide-react";

import { getTutorProfileThunk } from "@/features/tutors";
import { StarRating } from "@/features/reviews/components/StarRating";
import TutorReviewsSection from "@/features/reviews/components/TutorReviewsSection";

export default function MyReviewsPage() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.tutors.profile);
  const loading = useSelector((state) => state.tutors.loading);

  useEffect(() => {
    if (!profile) dispatch(getTutorProfileThunk());
  }, [dispatch, profile]);

  const averageRating = profile?.averageRating ?? 0;
  const reviewCount = profile?.reviewCount ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-linear-to-r from-[#1e3a5f] to-[#2c5282]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-2 text-amber-300">
            <Star className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Đánh giá của tôi</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">Đánh giá từ học viên</h1>
          <p className="mt-1 text-sm text-slate-200">
            Tổng hợp những đánh giá mà học viên đã dành cho bạn sau khi hoàn thành lớp.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {loading && !profile ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tải hồ sơ...
          </div>
        ) : (
          <>
            {/* Tóm tắt điểm đánh giá */}
            <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-amber-500">{averageRating.toFixed(1)}</span>
                <StarRating value={averageRating} size={18} className="mt-1" />
                <span className="mt-1 text-xs text-gray-400">{reviewCount} đánh giá</span>
              </div>
              <div className="flex-1 text-sm text-gray-600">
                {reviewCount > 0 ? (
                  <p>
                    Điểm đánh giá trung bình của bạn là{" "}
                    <span className="font-semibold text-gray-900">{averageRating.toFixed(1)}/5</span> từ{" "}
                    <span className="font-semibold text-gray-900">{reviewCount}</span> học viên.
                  </p>
                ) : (
                  <p>Bạn chưa nhận được đánh giá nào. Hãy hoàn thành thêm lớp học để nhận đánh giá từ học viên.</p>
                )}
              </div>
            </div>

            {/* Danh sách đánh giá chi tiết — gia sư có thể phản hồi (1 lần/đánh giá) */}
            {profile?.id && (
              <TutorReviewsSection
                tutorId={profile.id}
                initialSummary={{ averageRating, reviewCount }}
                editable
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
