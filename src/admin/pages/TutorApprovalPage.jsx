import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Loader2, CheckCircle2 } from "lucide-react";

import { getPendingTutorsThunk } from "@/admin/store/adminThunks";
import TutorApprovalCard from "@/admin/components/TutorApprovalCard";
import Pagination from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

const TutorApprovalPage = () => {
  const dispatch = useDispatch();
  const { pendingTutors, pendingTutorsPagination, loading, actionLoading } = useSelector(
    (state) => state.admin
  );
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = pendingTutorsPagination?.totalPages || 1;
  const totalItems = pendingTutorsPagination?.totalItems || 0;

  const loadPage = useCallback(() => {
    dispatch(getPendingTutorsThunk({ page: currentPage, limit: PAGE_SIZE }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sau khi duyệt/từ chối 1 hồ sơ: nếu là hồ sơ cuối của trang thì lùi 1 trang, ngược lại tải lại trang hiện tại
  const handleActionComplete = () => {
    if (pendingTutors.length <= 1 && currentPage > 1) setCurrentPage((p) => p - 1);
    else loadPage();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Xét duyệt gia sư</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Danh sách hồ sơ đang chờ xét duyệt ({totalItems})
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadPage}
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Làm mới
        </Button>
      </div>

      {loading && pendingTutors.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#1e3a5f]" />
            <p className="text-sm text-slate-500">Đang tải danh sách...</p>
          </div>
        </div>
      ) : totalItems === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-slate-700">
            Không có hồ sơ chờ duyệt
          </h3>
          <p className="text-sm text-slate-500">
            Tất cả hồ sơ gia sư đã được xử lý.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden border-b border-slate-200 bg-slate-50 px-5 py-3 lg:grid lg:grid-cols-[1fr_1fr_1fr_1fr_1fr] lg:items-center lg:gap-x-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gia sư</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Môn học</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Khu vực</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ngày gửi</span>
              <span className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Thao tác</span>
            </div>

            {pendingTutors.map((tutor, idx) => (
              <TutorApprovalCard
                key={tutor.id}
                tutor={tutor}
                isActioning={actionLoading === tutor.id}
                index={idx}
                onActionComplete={handleActionComplete}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalItems)} / {totalItems} hồ sơ
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorApprovalPage;
