import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownRight, Info, Loader2, MessageSquareText, Reply, Send } from "lucide-react";

import reviewService from "@/features/reviews/services/reviewService";
import { reviewReplySchema } from "@/features/reviews/schemas/reviewSchema";
import { replyToReviewThunk } from "@/features/reviews/store/reviewThunks";
import { StarRating } from "@/features/reviews/components/StarRating";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";

const PAGE_SIZE = 5;

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Khối hiển thị phản hồi của gia sư cho một đánh giá (hiển thị cho mọi người xem)
function ReviewReplyBlock({ reply }) {
  return (
    <div className="mt-3 ml-3 rounded-xl border-l-2 border-green-400 bg-green-50/70 p-3 sm:ml-13">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
        <CornerDownRight className="h-3.5 w-3.5" />
        Phản hồi từ gia sư
        {reply.repliedAt && (
          <span className="font-normal text-gray-400">· {formatDate(reply.repliedAt)}</span>
        )}
      </div>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">{reply.comment}</p>
    </div>
  );
}

// Form gia sư trả lời một đánh giá — chỉ được gửi MỘT lần
function ReviewReplyForm({ review, onReplied }) {
  const dispatch = useDispatch();
  const replying = useSelector((state) => state.reviews.replying);
  const [open, setOpen] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewReplySchema),
    defaultValues: { comment: "" },
  });

  // useWatch (thay cho watch()) để tương thích React Compiler memoization
  const comment = useWatch({ control, name: "comment" }) || "";

  const onSubmit = async (values) => {
    const result = await dispatch(
      replyToReviewThunk({ reviewId: review.id, comment: values.comment })
    );
    if (replyToReviewThunk.fulfilled.match(result)) {
      onReplied?.(result.payload.review);
      reset({ comment: "" });
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <div className="mt-3 ml-3 sm:ml-13">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
        >
          <Reply className="h-3.5 w-3.5" />
          Phản hồi đánh giá
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-3 ml-3 rounded-xl border border-gray-200 bg-white p-3 sm:ml-13"
    >
      {/* Lưu ý: chỉ được phản hồi 1 lần */}
      <div className="mb-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-xs text-amber-700">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          <span className="font-semibold">Lưu ý:</span> Mỗi đánh giá chỉ được phản hồi{" "}
          <span className="font-semibold">MỘT lần duy nhất</span> và không thể chỉnh sửa sau khi gửi.
          Hãy cân nhắc kỹ nội dung (vd: lịch sự giải thích nếu bị đánh giá chưa đúng).
        </span>
      </div>

      <textarea
        rows={3}
        disabled={replying}
        placeholder="Nhập phản hồi của bạn cho đánh giá này..."
        className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:border-slate-400 focus-visible:outline-none disabled:opacity-60"
        {...register("comment")}
      />
      <div className="mt-1 flex items-center justify-between">
        {errors.comment ? (
          <p className="text-xs font-medium text-rose-600">{errors.comment.message}</p>
        ) : (
          <span className="text-xs text-slate-400">Tối thiểu 2 ký tự</span>
        )}
        <span className="text-xs text-slate-400">{comment.length}/1000</span>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset({ comment: "" });
            setOpen(false);
          }}
          disabled={replying}
          className="h-9 rounded-lg border-slate-300 text-slate-700"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={replying}
          className="h-9 rounded-lg bg-green-600 px-4 font-semibold text-white hover:bg-green-700"
        >
          {replying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Gửi phản hồi
        </Button>
      </div>
    </form>
  );
}

export default function TutorReviewsSection({ tutorId, initialSummary, editable = false }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(
    initialSummary || { averageRating: 0, reviewCount: 0 }
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!tutorId) return;
    try {
      setLoading(true);
      const res = await reviewService.getTutorReviews(tutorId, { page, limit: PAGE_SIZE });
      const data = res.data.data;
      setReviews(data.reviews || []);
      setSummary(data.summary || { averageRating: 0, reviewCount: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [tutorId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Cập nhật tại chỗ đánh giá vừa được gia sư phản hồi (không cần tải lại cả trang)
  const handleReplied = useCallback((updated) => {
    if (!updated?.id) return;
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? { ...r, reply: updated.reply } : r)));
  }, []);

  const reviewCount = summary.reviewCount || 0;
  const averageRating = summary.averageRating || 0;

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6" data-aos="fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-green-600" />
          Đánh giá từ học viên
          {reviewCount > 0 && <span className="text-sm font-normal text-gray-400">({reviewCount})</span>}
        </h2>
        {reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-amber-500">{averageRating.toFixed(1)}</span>
            <StarRating value={averageRating} size={18} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-sm text-gray-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải đánh giá...
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <MessageSquareText className="h-9 w-9 text-gray-300" />
          <p className="text-sm font-semibold text-gray-600">Chưa có đánh giá nào</p>
          <p className="text-sm text-gray-400">
            {editable
              ? "Bạn chưa nhận được đánh giá nào từ học viên."
              : "Gia sư này chưa nhận được đánh giá từ học viên."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-green-400 to-blue-500 text-sm font-bold text-white">
                  {review.reviewerAvatar ? (
                    <img
                      src={review.reviewerAvatar}
                      alt={review.reviewerName}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(review.reviewerName)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{review.reviewerName}</p>
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                  </div>
                  <StarRating value={review.rating} size={14} className="mt-1" />
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">{review.comment}</p>
                </div>
              </div>

              {/* Phản hồi của gia sư: hiển thị nếu đã có; nếu chưa và đang ở chế độ sửa thì cho phép trả lời */}
              {review.reply ? (
                <ReviewReplyBlock reply={review.reply} />
              ) : editable ? (
                <ReviewReplyForm review={review} onReplied={handleReplied} />
              ) : null}
            </div>
          ))}

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="pt-2" />
        </div>
      )}
    </section>
  );
}
