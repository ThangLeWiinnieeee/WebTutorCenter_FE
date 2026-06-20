import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  Clock3,
  FilePlus2,
  FileText,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { fetchMyPostsThunk } from "@/features/classes/store/classThunks";
import { formatDateTime, formatPrice, formatStudentGender } from "@/features/classes/utils/classFormatters";

const PAGE_SIZE = 10;

export default function MyPostsPanel() {
  const dispatch = useDispatch();
  const { myPosts, myPostsPagination, loadingMyPosts, error } = useSelector((state) => state.classes);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchMyPostsThunk({ page, limit: PAGE_SIZE }));
  }, [dispatch, page]);

  const totalPages = myPostsPagination?.totalPages || 1;
  const totalItems = myPostsPagination?.totalItems || 0;

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, totalPages, page - 1, page, page + 1]);
    return [...set].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  }, [page, totalPages]);

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
        myPosts.map((item) => (
          <Link
            key={item.id}
            to={`/classes/${item.id}`}
            className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-[box-shadow,border-color] duration-200 ease-out hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    Mã lớp {item.classCode}
                  </span>
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
      {!loadingMyPosts && myPosts.length > 0 && totalPages > 1 && (
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
    </div>
  );
}
