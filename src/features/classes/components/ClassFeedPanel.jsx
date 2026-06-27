import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  Clock3,
  Eye,
  Inbox,
  MapPin,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import useAuth from "@/features/auth/hooks/useAuth";
import tutorService from "@/features/tutors/services/tutorService";
import { hasCompleteTutorDocuments } from "@/features/tutors/utils/tutorDocuments";
import ClassReceiveDialog from "@/features/classes/components/ClassReceiveDialog";
import { applyForClassThunk, fetchClassFeedThunk } from "@/features/classes/store/classThunks";
import {
  formatAvailabilitySlotsOneLine,
  formatDateTime,
  formatPrice,
  formatStudentGender,
  formatTutorGenderPref,
  formatTutorLevelPref,
} from "@/features/classes/utils/classFormatters";

const formatPersonalGender = (gender) => {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  return "Chưa cập nhật";
};

const formatPersonalLevel = (level) => {
  if (level === "student") return "Sinh viên";
  if (level === "teacher") return "Giáo viên";
  return "Chưa xác định";
};

const PAGE_SIZE = 10;
const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

const isNewPost = (createdAt) => {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  return !Number.isNaN(t) && Date.now() - t < NEW_WINDOW_MS;
};

export default function ClassFeedPanel() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { feed, feedPagination, feedSubjects, feedNewCount, feedPersonalization, loadingFeed, applying } =
    useSelector((state) => state.classes);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [page, setPage] = useState(1);
  const [receiveDialog, setReceiveDialog] = useState({ open: false, type: "confirm", classItem: null });

  useEffect(() => {
    dispatch(
      fetchClassFeedThunk({
        ...(selectedSubject ? { subject: selectedSubject } : {}),
        page,
        limit: PAGE_SIZE,
      })
    );
  }, [dispatch, selectedSubject, page]);

  const totalPages = feedPagination?.totalPages || 1;
  const totalItems = feedPagination?.totalItems || 0;

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, totalPages, page - 1, page, page + 1]);
    return [...set].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  }, [page, totalPages]);

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setPage(1);
  };

  const handleReceive = async (item) => {
    if (user?.id && item.createdBy === user.id) return;
    // Chưa bổ sung hồ sơ chứng thực → yêu cầu cập nhật trước khi nhận lớp
    try {
      const response = await tutorService.getProfile();
      if (!hasCompleteTutorDocuments(response.data?.data?.tutor)) {
        setReceiveDialog({ open: true, type: "documentsRequired", classItem: item });
        return;
      }
    } catch (err) {
      console.error("Failed to check tutor documents", err);
    }
    setReceiveDialog({ open: true, type: "confirm", classItem: item });
  };

  const handleConfirmApply = async () => {
    const item = receiveDialog.classItem;
    const result = await dispatch(applyForClassThunk(item?.id || item?._id));
    if (applyForClassThunk.fulfilled.match(result)) {
      setReceiveDialog((prev) => ({ ...prev, type: "submitted" }));
      // Tải lại feed: bài vừa nhận sẽ được ẩn và badge cập nhật
      dispatch(
        fetchClassFeedThunk({
          ...(selectedSubject ? { subject: selectedSubject } : {}),
          page,
          limit: PAGE_SIZE,
        })
      );
    } else {
      setReceiveDialog((prev) => ({ ...prev, open: false }));
      toast.error(result.payload || "Không thể gửi yêu cầu nhận lớp");
    }
  };

  const hasNoSubjects = !loadingFeed && feedSubjects.length === 0;

  return (
    <div className="space-y-5">
      {/* New count banner */}
      {feedNewCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <Sparkles className="h-4 w-4" />
          {feedNewCount} bài đăng mới trong 24 giờ qua phù hợp với hồ sơ của bạn
        </div>
      )}

      {/* Personalization summary: feed đã được lọc theo hồ sơ gia sư */}
      {feedPersonalization && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-medium text-slate-500">Đang lọc theo hồ sơ của bạn:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
            <UserRound className="h-3.5 w-3.5 text-emerald-600" />
            Giới tính: {formatPersonalGender(feedPersonalization.gender)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
            <BookOpenText className="h-3.5 w-3.5 text-emerald-600" />
            Trình độ: {formatPersonalLevel(feedPersonalization.level)}
          </span>
          {feedPersonalization.provinceName && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              Khu vực: {feedPersonalization.provinceName}
            </span>
          )}
        </div>
      )}

      {/* Subject filter chips */}
      {feedSubjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Môn dạy:</span>
          <button
            type="button"
            onClick={() => handleSelectSubject("")}
            className={`rounded-full border px-3.5 py-1 text-sm font-medium transition ${
              selectedSubject === ""
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            Tất cả môn của bạn
          </button>
          {feedSubjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => handleSelectSubject(subject)}
              className={`rounded-full border px-3.5 py-1 text-sm font-medium transition ${
                selectedSubject === subject
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loadingFeed && !hasNoSubjects && (
        <p className="text-sm text-slate-600">
          <span className="font-bold text-slate-900">{totalItems}</span> bài đăng
          {selectedSubject ? ` cho môn ${selectedSubject}` : " phù hợp với môn bạn dạy"}
        </p>
      )}

      {/* No subjects registered */}
      {hasNoSubjects && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <BookOpenText className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-slate-700">Hồ sơ của bạn chưa có môn dạy nào</p>
          <p className="max-w-md text-sm text-slate-500">
            Cập nhật các môn bạn nhận dạy trong hồ sơ gia sư để nhận bài đăng tuyển phù hợp.
          </p>
        </div>
      )}

      {/* Loading */}
      {loadingFeed && (
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-2/3 rounded bg-slate-200" />
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-12 rounded bg-slate-200" />
                  <div className="h-12 rounded bg-slate-200" />
                  <div className="h-12 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty (has subjects but no posts) */}
      {!loadingFeed && !hasNoSubjects && feed.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-slate-700">Chưa có bài đăng nào</p>
          <p className="max-w-md text-sm text-slate-500">
            Hiện chưa có bài đăng tuyển gia sư cho {selectedSubject ? `môn ${selectedSubject}` : "các môn bạn dạy"}. Hãy quay lại sau nhé.
          </p>
        </div>
      )}

      {/* Feed list */}
      {!loadingFeed &&
        feed.map((item) => (
          <article
            key={item.id}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-[box-shadow,border-color] duration-200 ease-out hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {isNewPost(item.createdAt) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                      <Sparkles className="h-3 w-3" />
                      Mới
                    </span>
                  )}
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    Mã lớp {item.classCode}
                  </span>
                </div>
                <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-tight text-slate-900">
                  {item.subject} - {item.summary || `Cần Gia Sư tại ${item.districtName || ''}, ${item.provinceName || ''}`}
                </h3>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>Đăng lúc {formatDateTime(item.createdAt)}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <BookOpenText className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Học phí / buổi:{" "}
                    <strong className="font-semibold text-slate-700">{formatPrice(item.feePerSession)}</strong>
                  </span>
                </div>
              </div>

              <div className="w-full shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-right sm:w-[200px]">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Phí nhận lớp</p>
                <p className="mt-1 text-2xl font-bold leading-none text-emerald-700">
                  {formatPrice(Math.round((item.feePerMonth || 0) * 0.05))}
                </p>
                <p className="mt-1 text-xs text-emerald-700/80">5% học phí tháng đầu</p>
                {user?.id && item.createdBy === user.id ? (
                  <div className="mt-3 flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm font-medium text-slate-500">
                    Bài đăng của bạn
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleReceive(item)}
                    className="mt-3 h-10 w-full rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Nhận lớp ngay
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>
                  {item.studentCount} học viên
                  {item.studentGender ? ` (${formatStudentGender(item.studentGender)})` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CalendarClock className="h-4 w-4 text-emerald-600" />
                <span>
                  {item.sessionsPerWeek} buổi/tuần ({item.minutesPerSession} phút)
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <UserRound className="h-4 w-4 text-emerald-600" />
                <span className="line-clamp-1">
                  <span className="text-slate-400">Trình độ:</span> {formatTutorLevelPref(item.tutorLevelPref)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <UserRound className="h-4 w-4 text-emerald-600" />
                <span className="line-clamp-1">
                  <span className="text-slate-400">Giới tính:</span> {formatTutorGenderPref(item.tutorGenderPref)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="line-clamp-1">{item.provinceName && item.districtName ? `${item.provinceName}, ${item.districtName}` : item.locationLabel}</span>
                <span className="hidden text-slate-300 sm:inline">·</span>
                <span className="hidden line-clamp-1 sm:inline" title={formatAvailabilitySlotsOneLine(item.availabilitySlots)}>
                  {formatAvailabilitySlotsOneLine(item.availabilitySlots)}
                </span>
              </div>
              <Link
                to={`/classes/${item.id}`}
                className="inline-flex items-center gap-1 font-medium text-sky-700 transition hover:text-sky-800 hover:underline"
              >
                Xem chi tiết
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}

      {/* Pagination */}
      {!loadingFeed && feed.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>
          {visiblePages.map((p, idx) => {
            const prev = visiblePages[idx - 1];
            const gap = idx > 0 && p - prev > 1;
            return (
              <div key={p} className="flex items-center gap-1.5">
                {gap && <span className="px-1 text-slate-400">...</span>}
                <button
                  type="button"
                  onClick={() => setPage(p)}
                  className={`min-w-9 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition ${
                    p === page ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      <ClassReceiveDialog
        open={receiveDialog.open}
        type={receiveDialog.type}
        classItem={receiveDialog.classItem}
        onClose={() => setReceiveDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={handleConfirmApply}
        applying={applying}
      />
    </div>
  );
}
