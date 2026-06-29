import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";
import { StarRating } from "@/features/reviews";
import { formatDateTime } from "@/features/classes/utils/classFormatters";
import { ADMIN_PAGE_SIZE as PAGE_SIZE } from "@/admin/constants";
import {
  getReviewTutorsThunk,
  getAdminTutorReviewsThunk,
  deleteReviewThunk,
} from "@/admin/store/adminThunks";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Modal xác nhận xóa mềm một đánh giá → chuyển vào thùng rác
const ConfirmDeleteModal = ({ review, onClose, onConfirm, loading }) => {
  if (!review) return null;
  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Xóa đánh giá</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Đánh giá sẽ được chuyển vào <strong>thùng rác</strong>. Bạn có thể khôi phục hoặc xóa vĩnh viễn trong trang Thùng rác.
          </p>
        </div>
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <StarRating value={review.rating} size={14} />
          <p className="mt-1 line-clamp-3 text-sm text-slate-700">{review.comment}</p>
          <p className="mt-1 text-xs text-slate-400">— {review.reviewerName}</p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-10 rounded-lg border-slate-300 text-slate-700">
            Hủy
          </Button>
          <Button type="button" onClick={onConfirm} disabled={loading} className="h-10 rounded-lg bg-rose-600 px-5 font-semibold text-white hover:bg-rose-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Chuyển vào thùng rác
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminReviewsPage = () => {
  const dispatch = useDispatch();
  const {
    reviewTutors,
    reviewTutorsPagination,
    reviewTutorsLoading,
    reviewTutorsError,
    tutorReviews,
    tutorReviewsPagination,
    tutorReviewsLoading,
    tutorReviewsError,
    selectedReviewTutor,
    reviewActionLoading,
  } = useSelector((state) => state.admin);

  // Gia sư đang xem đánh giá (null = đang ở màn danh sách gia sư)
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [tutorPage, setTutorPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const tutorParams = useMemo(() => ({ page: tutorPage, limit: PAGE_SIZE, keyword }), [tutorPage, keyword]);

  // Tải danh sách gia sư (khi đang ở màn danh sách)
  useEffect(() => {
    if (!selectedTutor) dispatch(getReviewTutorsThunk(tutorParams));
  }, [dispatch, selectedTutor, tutorParams]);

  // Tải đánh giá của gia sư đang chọn
  useEffect(() => {
    if (selectedTutor) {
      dispatch(getAdminTutorReviewsThunk({ tutorId: selectedTutor.id, params: { page: reviewPage, limit: PAGE_SIZE } }));
    }
  }, [dispatch, selectedTutor, reviewPage]);

  // Tự tìm sau khi ngừng gõ (debounce 400ms) — bỏ nút "Tìm", đồng bộ hành vi với bộ lọc client.
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === keyword) return;
    const timer = setTimeout(() => {
      setTutorPage(1);
      setKeyword(trimmed);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, keyword]);

  const openTutorReviews = (tutor) => {
    setSelectedTutor(tutor);
    setReviewPage(1);
  };

  const backToTutors = () => {
    setSelectedTutor(null);
    // Làm mới danh sách gia sư để cập nhật điểm trung bình sau khi xóa
    dispatch(getReviewTutorsThunk(tutorParams));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteReviewThunk(deleteTarget.id));
    if (deleteReviewThunk.fulfilled.match(result)) {
      setDeleteTarget(null);
      // Nếu trang hiện tại trống sau khi xóa → lùi trang; ngược lại tải lại để cập nhật điểm
      const isLastItemOnPage = tutorReviews.length === 1 && reviewPage > 1;
      if (isLastItemOnPage) {
        setReviewPage((p) => p - 1);
      } else {
        dispatch(getAdminTutorReviewsThunk({ tutorId: selectedTutor.id, params: { page: reviewPage, limit: PAGE_SIZE } }));
      }
    }
  };

  // ──────────────────────────── Màn xem đánh giá của 1 gia sư ────────────────────────────
  if (selectedTutor) {
    const tutor = selectedReviewTutor || selectedTutor;
    const totalPages = tutorReviewsPagination?.totalPages || 1;
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <Button
            type="button"
            variant="outline"
            onClick={backToTutors}
            className="mb-4 h-9 rounded-lg border-slate-300 text-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Danh sách gia sư
          </Button>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1e3a5f] text-base font-bold text-white">
              {tutor.avatar ? (
                <img src={tutor.avatar} alt={tutor.fullName} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              ) : (
                getInitials(tutor.fullName)
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900">{tutor.fullName || "Gia sư"}</h1>
              <div className="mt-1 flex items-center gap-2">
                <StarRating value={tutor.averageRating ?? 0} size={16} />
                <span className="text-sm font-semibold text-amber-600">{(tutor.averageRating ?? 0).toFixed(1)}</span>
                <span className="text-sm text-slate-400">· {tutor.reviewCount ?? 0} đánh giá</span>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Tất cả đánh giá</h2>
            {tutorReviewsLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
          </div>

          {tutorReviewsError ? (
            <div className="m-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{tutorReviewsError}</div>
          ) : tutorReviewsLoading && tutorReviews.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải đánh giá...
            </div>
          ) : tutorReviews.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <MessageSquareText className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">Chưa có đánh giá</p>
              <p className="mt-1 text-sm text-slate-500">Gia sư này chưa nhận được đánh giá nào.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tutorReviews.map((review) => (
                <li key={review.id} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                    {review.reviewerAvatar ? (
                      <img src={review.reviewerAvatar} alt={review.reviewerName} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    ) : (
                      getInitials(review.reviewerName)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-semibold text-slate-800">{review.reviewerName}</span>
                      <StarRating value={review.rating} size={14} />
                      {review.classCode && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          Lớp #{review.classCode}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{formatDateTime(review.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{review.comment}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={reviewActionLoading === review.id}
                    onClick={() => setDeleteTarget(review)}
                    className="shrink-0 rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                  >
                    {reviewActionLoading === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Xóa
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {tutorReviews.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-4">
              <Pagination currentPage={reviewPage} totalPages={totalPages} onPageChange={setReviewPage} />
            </div>
          )}
        </section>

        <ConfirmDeleteModal
          review={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          loading={Boolean(deleteTarget && reviewActionLoading === deleteTarget.id)}
        />
      </div>
    );
  }

  // ──────────────────────────── Màn danh sách gia sư ────────────────────────────
  const totalPages = reviewTutorsPagination?.totalPages || 1;
  const totalItems = reviewTutorsPagination?.totalItems || 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
              <Star className="h-4 w-4" />
              Quản lý đánh giá
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Quản lý đánh giá gia sư</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Chọn một gia sư để xem tất cả đánh giá của họ. Bạn có thể xóa (chuyển vào thùng rác) các đánh giá không phù hợp.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(getReviewTutorsThunk(tutorParams))}
            disabled={reviewTutorsLoading}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            {reviewTutorsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Làm mới
          </Button>
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm gia sư theo tên..."
            autoComplete="off"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm focus-visible:border-slate-400 focus-visible:outline-none"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Xóa từ khóa"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Danh sách gia sư</h2>
            <p className="mt-1 text-sm text-slate-500">{totalItems} gia sư</p>
          </div>
          {reviewTutorsLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
        </div>

        {reviewTutorsError ? (
          <div className="m-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{reviewTutorsError}</div>
        ) : reviewTutorsLoading && reviewTutors.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tải danh sách gia sư...
          </div>
        ) : reviewTutors.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <Star className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Không tìm thấy gia sư</p>
            <p className="mt-1 text-sm text-slate-500">Thử tìm với từ khóa khác.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Gia sư</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Điểm trung bình</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Lượt đánh giá</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reviewTutors.map((tutor) => (
                  <tr key={tutor.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1e3a5f] text-sm font-bold text-white">
                          {tutor.avatar ? (
                            <img src={tutor.avatar} alt={tutor.fullName} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                          ) : (
                            getInitials(tutor.fullName)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{tutor.fullName || "Gia sư"}</p>
                          <p className="max-w-55 truncate text-xs text-slate-500">{tutor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {(tutor.reviewCount ?? 0) > 0 ? (
                        <div className="flex items-center gap-2">
                          <StarRating value={tutor.averageRating ?? 0} size={14} />
                          <span className="text-sm font-semibold text-amber-600">{(tutor.averageRating ?? 0).toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Chưa có</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{tutor.reviewCount ?? 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openTutorReviews(tutor)}
                          className="rounded-lg border-slate-200 text-[#1e3a5f] hover:bg-slate-50"
                        >
                          <MessageSquareText className="h-4 w-4" />
                          Xem đánh giá
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reviewTutors.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4">
            <Pagination currentPage={tutorPage} totalPages={totalPages} onPageChange={setTutorPage} />
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminReviewsPage;
