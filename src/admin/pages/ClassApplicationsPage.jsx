import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { normalizeForSearch } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, RefreshCw, Search, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";
import {
  approveClassApplicationThunk,
  getClassApplicationStatsThunk,
  getClassApplicationOriginCountsThunk,
  getClassApplicationsThunk,
  rejectClassApplicationThunk,
} from "@/admin/store/adminThunks";
import { ADMIN_PAGE_SIZE as PAGE_SIZE } from "@/admin/constants";
import {
  StatCard,
  ApplicationRow,
  ClassDetailModal,
  TutorDetailModal,
  RejectDialog,
} from "@/admin/components/classApplications";

// Admin chỉ thao tác trên đơn "selected" (gia sư đã được người đăng chọn, chờ duyệt lớp)
const TABS = [
  { key: "selected", label: "Chờ duyệt", color: "amber" },
  { key: "approved", label: "Đã duyệt", color: "emerald" },
  { key: "rejected", label: "Từ chối", color: "rose" },
];

// 2 mục: gia sư tự ứng tuyển bài đăng công khai vs gia sư được người đăng mời trực tiếp
const ORIGIN_TABS = [
  { key: "apply", label: "Gia sư tự ứng tuyển" },
  { key: "invite", label: "Gia sư được mời" },
];

const TAB_STYLE = {
  amber: { active: "border-amber-500 text-amber-700 bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  emerald: {
    active: "border-emerald-500 text-emerald-700 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
  },
  rose: { active: "border-rose-500 text-rose-700 bg-rose-50", badge: "bg-rose-100 text-rose-700" },
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

// Trang admin duyệt/từ chối đơn nhận lớp và lời mời dạy.
const ClassApplicationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    classApplications,
    classApplicationsPagination,
    classApplicationsLoading,
    classApplicationsError,
    classApplicationActionLoading,
    classApplicationStats,
    classApplicationStatsLoading,
    classApplicationOriginCounts,
  } = useSelector((state) => state.admin);

  const [activeOrigin, setActiveOrigin] = useState("apply");
  const [activeTab, setActiveTab] = useState("selected");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classModal, setClassModal] = useState(null);
  const [tutorModal, setTutorModal] = useState(null);

  const totalPages = classApplicationsPagination?.totalPages || 1;

  useEffect(() => {
    dispatch(getClassApplicationStatsThunk({ origin: activeOrigin }));
  }, [dispatch, activeOrigin]);

  // Số đơn chờ duyệt cho CẢ 2 mục (badge trên 2 tab origin) — tải 1 lần khi vào trang.
  useEffect(() => {
    dispatch(getClassApplicationOriginCountsThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getClassApplicationsThunk({ status: activeTab, origin: activeOrigin, page, limit: PAGE_SIZE }));
  }, [dispatch, activeTab, activeOrigin, page]);

  // Tải lại danh sách đơn và các số đếm theo bộ lọc hiện tại.
  const reload = (targetPage = page) =>
    dispatch(
      getClassApplicationsThunk({
        status: activeTab,
        origin: activeOrigin,
        page: targetPage,
        limit: PAGE_SIZE,
      }),
    );

  // Sau khi duyệt/từ chối: nếu vừa xử lý item cuối của trang thì lùi 1 trang, ngược lại tải lại trang hiện tại
  const reloadAfterAction = () => {
    if (classApplications.length <= 1 && page > 1) setPage(page - 1);
    else reload();
  };

  // Đổi tab lọc theo trạng thái đơn.
  const handleTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchQuery("");
  };

  // Đổi bộ lọc theo nguồn đơn (ứng tuyển hay lời mời).
  const handleOrigin = (origin) => {
    setActiveOrigin(origin);
    setActiveTab("selected");
    setPage(1);
    setSearchQuery("");
  };

  // Chuyển trang danh sách đơn.
  const handlePageChange = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Tải lại danh sách đơn.
  const handleRefresh = () => {
    dispatch(getClassApplicationStatsThunk({ origin: activeOrigin }));
    dispatch(getClassApplicationOriginCountsThunk());
    reload();
  };

  // Duyệt một đơn nhận lớp.
  const handleApprove = (id) => {
    dispatch(approveClassApplicationThunk(id)).then((r) => {
      if (!r.error) {
        reloadAfterAction();
        dispatch(getClassApplicationOriginCountsThunk());
      }
    });
  };

  // Mở hộp thoại nhập lý do từ chối cho một đơn.
  const handleRejectOpen = (id) => setRejectTarget(id);

  // Mở mục Tin nhắn và chat với gia sư (tạo mới nếu chưa có hội thoại, ngược lại vào hội thoại cũ)
  const handleChat = (application) => {
    const userId = application.tutor?.userId;
    if (!userId) {
      toast.error("Không tìm thấy tài khoản gia sư để trò chuyện");
      return;
    }
    navigate("/admin/messages", { state: { openUserId: userId } });
  };

  // Gửi từ chối đơn kèm lý do.
  const handleRejectConfirm = (rejectionReason) => {
    dispatch(rejectClassApplicationThunk({ id: rejectTarget, rejectionReason })).then((r) => {
      setRejectTarget(null);
      if (!r.error) {
        reloadAfterAction();
        dispatch(getClassApplicationOriginCountsThunk());
      }
    });
  };

  const filtered = useMemo(() => {
    const q = normalizeForSearch(searchQuery);
    if (!q) return classApplications;
    return classApplications.filter(
      (a) =>
        normalizeForSearch(a.classItem?.classCode).includes(q) ||
        normalizeForSearch(a.tutor?.fullName).includes(q) ||
        normalizeForSearch(a.classItem?.subject).includes(q),
    );
  }, [classApplications, searchQuery]);

  const statCount = {
    selected: classApplicationStats.selected,
    approved: classApplicationStats.approved,
    rejected: classApplicationStats.rejected,
  };

  const emptyMessages = {
    selected: {
      title: "Không có đơn nào chờ duyệt",
      sub: "Đơn gia sư người đăng đã chọn sẽ hiển thị ở đây.",
    },
    approved: { title: "Chưa có đơn nào được duyệt", sub: "Các đơn được duyệt sẽ hiển thị ở đây." },
    rejected: { title: "Chưa có đơn nào bị từ chối", sub: "Các đơn bị từ chối sẽ hiển thị ở đây." },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý duyệt nhận lớp</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
              Mỗi dòng là gia sư đã được người đăng chọn, đang chờ bạn duyệt. Bấm để xem chi tiết bài đăng
              hoặc hồ sơ gia sư trước khi duyệt.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={classApplicationsLoading || classApplicationStatsLoading}
            className="h-10 shrink-0 rounded-lg border-slate-300 text-slate-700"
          >
            {classApplicationsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Làm mới
          </Button>
        </div>
      </section>

      {/* Origin segmented control — 2 mục: tự ứng tuyển / được mời */}
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {ORIGIN_TABS.map((o) => {
          const isActive = activeOrigin === o.key;
          const pendingCount = classApplicationOriginCounts?.[o.key] || 0;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => handleOrigin(o.key)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-brand text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {o.label}
              {/* Số đơn chờ duyệt của mục này — đồng bộ màu badge với mục Thùng rác */}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {pendingCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Chờ duyệt"
          count={statCount.selected}
          color="amber"
          loading={classApplicationStatsLoading}
        />
        <StatCard
          label="Đã duyệt"
          count={statCount.approved}
          color="emerald"
          loading={classApplicationStatsLoading}
        />
        <StatCard
          label="Từ chối"
          count={statCount.rejected}
          color="rose"
          loading={classApplicationStatsLoading}
        />
      </div>

      {/* Tab bar */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex border-b border-slate-100">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const style = TAB_STYLE[tab.color];
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? style.active
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                    isActive ? style.badge : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {statCount[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã lớp, tên gia sư hoặc môn học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        {/* List */}
        <div className="p-4">
          {classApplicationsLoading && classApplications.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tải danh sách...
            </div>
          ) : classApplicationsError ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">
              {classApplicationsError}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <ShieldCheck className="h-12 w-12 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">
                {searchQuery ? "Không tìm thấy kết quả phù hợp" : emptyMessages[activeTab]?.title}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {searchQuery ? "Thử tìm kiếm với từ khóa khác." : emptyMessages[activeTab]?.sub}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {classApplicationsLoading && (
                <div className="flex items-center justify-center py-2 text-xs text-slate-400">
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Đang cập nhật...
                </div>
              )}
              {filtered.map((application) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  activeTab={activeTab}
                  actionLoading={classApplicationActionLoading}
                  onApprove={handleApprove}
                  onReject={handleRejectOpen}
                  onViewClass={(app) => setClassModal(app.classItem)}
                  onViewTutor={(app) => setTutorModal(app)}
                  onChat={handleChat}
                />
              ))}
            </div>
          )}
        </div>

        {/* Phân trang (ẩn khi đang tìm kiếm vì tìm kiếm chỉ lọc trong trang hiện tại) */}
        {!classApplicationsLoading && !searchQuery && totalPages > 1 && (
          <div className="border-t border-slate-100 px-4 py-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {classModal && <ClassDetailModal classItem={classModal} onClose={() => setClassModal(null)} />}
      {tutorModal && (
        <TutorDetailModal
          tutor={tutorModal.tutor}
          classSubject={tutorModal.classItem?.subject}
          onClose={() => setTutorModal(null)}
        />
      )}

      <RejectDialog
        key={rejectTarget || "reject-dialog"}
        open={!!rejectTarget}
        loading={classApplicationActionLoading === rejectTarget}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
};

export default ClassApplicationsPage;
