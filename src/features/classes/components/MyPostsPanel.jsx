import { useEffect, useState } from "react";
import AOS from "aos";

import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FilePlus2,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  completeClassThunk,
  deleteClassThunk,
  fetchMyPostsThunk,
} from "@/features/classes/store/classThunks";
import { formatDateTime, formatPrice, formatStudentGender } from "@/features/classes/utils/classFormatters";
import Pagination from "@/components/shared/Pagination";

const PAGE_SIZE = 5;

// Nhãn trạng thái vòng đời bài đăng (đồng bộ với CLASS_STATUS ở backend)
const STATUS_META = {
  open: { label: "Đang mở", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  matched: { label: "Đã có gia sư", className: "bg-sky-50 text-sky-700 border-sky-200" },
  completed: { label: "Đã hoàn thành", className: "bg-violet-50 text-violet-700 border-violet-200" },
  expired: { label: "Hết hạn", className: "bg-slate-100 text-slate-500 border-slate-200" },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.open;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
};

export default function MyPostsPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myPosts, myPostsPagination, loadingMyPosts, error } = useSelector((state) => state.classes);
  const [page, setPage] = useState(1);
  const [completingId, setCompletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Người đăng xác nhận hoàn thành lớp (lớp đang ở trạng thái matched)
  const handleComplete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setCompletingId(id);
    const result = await dispatch(completeClassThunk(id));
    setCompletingId(null);
    if (!result.error) {
      dispatch(fetchMyPostsThunk({ page, limit: PAGE_SIZE }));
    }
  };

  // Sửa bài: điều hướng sang form ở chế độ chỉnh sửa
  const handleEdit = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/find-tutor/edit/${id}`);
  };

  // Mở hộp xác nhận xóa
  const openDelete = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await dispatch(deleteClassThunk(deleteTarget.id));
    setDeleting(false);
    if (!result.error) {
      setDeleteTarget(null);
      dispatch(fetchMyPostsThunk({ page, limit: PAGE_SIZE }));
    }
  };

  useEffect(() => {
    dispatch(fetchMyPostsThunk({ page, limit: PAGE_SIZE }));
  }, [dispatch, page]);

  const totalPages = myPostsPagination?.totalPages || 1;
  const totalItems = myPostsPagination?.totalItems || 0;

  // Đổi trang thì cuộn lên đầu để xem từ mục đầu tiên
  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Tính lại vị trí animation sau khi danh sách (tải bất đồng bộ) thay đổi
  useEffect(() => {
    AOS.refresh();
  }, [loadingMyPosts, myPosts.length]);

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Danh sách bài đăng</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Các bài đăng tìm gia sư bạn đã tạo {totalItems > 0 ? `(${totalItems})` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/find-tutor">
            <Button className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Đăng bài mới
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(fetchMyPostsThunk({ page, limit: PAGE_SIZE }))}
            disabled={loadingMyPosts}
            className="h-10 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loadingMyPosts ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loadingMyPosts && (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-1/3 rounded bg-slate-200" />
                <div className="h-6 w-2/3 rounded bg-slate-200" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-10 rounded bg-slate-200" />
                  <div className="h-10 rounded bg-slate-200" />
                  <div className="h-10 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loadingMyPosts && error && myPosts.length === 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700 shadow-sm">{error}</div>
      )}

      {/* Empty */}
      {!loadingMyPosts && !error && myPosts.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <FileText className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-slate-700">Bạn chưa đăng bài tìm gia sư nào</p>
          <p className="max-w-md text-sm text-slate-500">
            Tạo bài đăng để tìm gia sư phù hợp cho nhu cầu học tập của bạn.
          </p>
          <Link to="/find-tutor">
            <Button className="mt-2 h-10 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700">
              <FilePlus2 className="mr-1.5 h-4 w-4" />
              Đăng bài tìm gia sư
            </Button>
          </Link>
        </div>
      )}

      {/* List */}
      {!loadingMyPosts &&
        myPosts.map((item, idx) => (
          <Link
            key={item.id}
            to={`/classes/${item.id}`}
            data-aos="fade-up"
            data-aos-delay={Math.min(idx, 4) * 60}
            className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-[box-shadow,border-color] duration-200 ease-out hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    Mã lớp {item.classCode}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <h4 className="mt-2 line-clamp-2 text-lg font-semibold leading-tight text-slate-900">
                  {item.subject} - {item.summary || `Cần Gia Sư tại ${item.districtName || ''}, ${item.provinceName || ''}`}
                </h4>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>Đăng lúc {formatDateTime(item.createdAt)}</span>
                </div>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Học phí / buổi</p>
                <p className="mt-0.5 text-xl font-bold leading-none text-emerald-700">{formatPrice(item.feePerSession)}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2 text-slate-600">
                <BookOpenText className="h-4 w-4 text-emerald-600" />
                <span>{item.subject}</span>
              </div>
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
            </div>

            {item.status === "matched" && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                {item.completedByPoster ? (
                  <p className="text-sm font-medium text-amber-600">
                    Bạn đã xác nhận hoàn thành — đang chờ gia sư xác nhận.
                  </p>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => handleComplete(e, item.id)}
                    disabled={completingId === item.id}
                    className="h-9 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    {completingId === item.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Xác nhận đã hoàn thành
                  </Button>
                )}
              </div>
            )}

            {(item.status === "open" || item.status === "expired") && !item.hasActiveApplications && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                {item.status === "open" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => handleEdit(e, item.id)}
                    className="h-9 rounded-lg border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Sửa bài
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => openDelete(e, item)}
                  className="h-9 rounded-lg border-rose-200 px-3 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa bài
                </Button>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="line-clamp-1">{item.provinceName && item.districtName ? `${item.provinceName}, ${item.districtName}` : item.locationLabel}</span>
              </div>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700 transition group-hover:gap-2">
                Xem chi tiết
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}

      {/* Pagination */}
      {!loadingMyPosts && myPosts.length > 0 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} className="pt-2" />
      )}

      {/* Hộp xác nhận xóa bài đăng */}
      {deleteTarget && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900">Xóa bài đăng?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Bạn có chắc muốn xóa bài đăng{" "}
                  <span className="font-semibold">Mã lớp {deleteTarget.classCode}</span> ({deleteTarget.subject})?
                  Hành động này sẽ gỡ bài khỏi danh sách của bạn.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="h-10 rounded-lg border-slate-300 text-slate-700"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="h-10 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              >
                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Xóa bài
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
