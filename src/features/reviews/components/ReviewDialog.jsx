import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import { reviewSchema } from "@/features/reviews/schemas/reviewSchema";
import { createReviewThunk } from "@/features/reviews/store/reviewThunks";
import { StarRatingInput } from "@/features/reviews/components/StarRating";

const RATING_HINTS = {
  1: "Rất không hài lòng",
  2: "Không hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Rất hài lòng",
};

// Hộp thoại để người đăng chấm sao và viết đánh giá cho gia sư sau khi lớp hoàn thành.
export default function ReviewDialog({ open, classItem, tutor, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const submitting = useSelector((state) => state.reviews.submitting);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  // useWatch (thay cho watch()) để tương thích React Compiler memoization
  const rating = useWatch({ control, name: "rating" }) || 0;
  const comment = useWatch({ control, name: "comment" }) || "";

  // Reset form mỗi khi mở hộp thoại cho một lớp khác
  useEffect(() => {
    if (open) reset({ rating: 0, comment: "" });
  }, [open, classItem?.id, reset]);

  if (!open || !classItem) return null;

  // Gửi đánh giá lên server rồi đóng hộp thoại.
  const onSubmit = async (values) => {
    const result = await dispatch(
      createReviewThunk({
        classId: classItem.id,
        rating: values.rating,
        comment: values.comment,
      }),
    );
    if (createReviewThunk.fulfilled.match(result)) {
      onSuccess?.(result.payload);
      onClose?.();
    }
  };

  const tutorName = tutor?.fullName || "gia sư";

  return (
    <Modal onClose={onClose} panelClassName="rounded-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Star className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900">Đánh giá gia sư</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Lớp <span className="font-semibold">#{classItem.classCode}</span> · {tutorName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
        {/* Chọn sao */}
        <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 py-4">
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <StarRatingInput value={field.value} onChange={field.onChange} disabled={submitting} />
            )}
          />
          <p className="h-5 text-sm font-medium text-amber-600">
            {RATING_HINTS[rating] || "Chạm vào sao để đánh giá"}
          </p>
          {errors.rating && <p className="text-xs font-medium text-rose-600">{errors.rating.message}</p>}
        </div>

        {/* Nhận xét */}
        <div>
          <label htmlFor="review-comment" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Nhận xét của bạn
          </label>
          <textarea
            id="review-comment"
            rows={4}
            disabled={submitting}
            placeholder="Chia sẻ trải nghiệm học cùng gia sư (tối thiểu 5 ký tự)..."
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:border-slate-400 focus-visible:outline-none disabled:opacity-60"
            {...register("comment")}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.comment ? (
              <p className="text-xs font-medium text-rose-600">{errors.comment.message}</p>
            ) : (
              <span className="text-xs text-slate-400">Tối thiểu 5 ký tự</span>
            )}
            <span className="text-xs text-slate-400">{comment.length}/1000</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="h-10 rounded-lg bg-amber-500 px-5 font-semibold text-white hover:bg-amber-600"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Star className="mr-2 h-4 w-4" />
            )}
            Gửi đánh giá
          </Button>
        </div>
      </form>
    </Modal>
  );
}
