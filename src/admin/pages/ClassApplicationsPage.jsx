import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  approveClassApplicationThunk,
  getClassApplicationStatsThunk,
  getClassApplicationsThunk,
  rejectClassApplicationThunk,
} from "@/admin/store/adminThunks";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (value) =>
  value != null
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
    : "—";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TABS = [
  { key: "pending", label: "Chờ duyệt", color: "amber" },
  { key: "approved", label: "Đã duyệt", color: "emerald" },
  { key: "rejected", label: "Từ chối", color: "rose" },
];

const TAB_STYLE = {
  amber: {
    active: "border-amber-500 text-amber-700 bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  emerald: {
    active: "border-emerald-500 text-emerald-700 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rose: {
    active: "border-rose-500 text-rose-700 bg-rose-50",
    badge: "bg-rose-100 text-rosese-700",
    dot: "bg-rose-500",
  },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ label, count, color, loading }) => {
  const colors = {
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  };
  return (
    <div className={`flex flex-col items-center rounded-xl border px-6 py-4 ${colors[color]}`}>
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin opacity-60" />
      ) : (
        <span className="text-2xl font-bold">{count}</span>
      )}
      <span className="mt-0.5 text-xs font-medium">{label}</span>
    </div>
  );
};

const SubjectMatchBadge = ({ tutorSubjects, classSubject }) => {
  const matches = Array.isArray(tutorSubjects) && tutorSubjects.includes(classSubject);
  return matches ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Đúng môn đăng ký
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
      <XCircle className="h-3.5 w-3.5" />
      Không đúng môn
    </span>
  );
};

const StatusBadge = ({ status }) => {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Đã duyệt
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
        <XCircle className="h-3.5 w-3.5" />
        Từ chối
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <Clock className="h-3.5 w-3.5" />
      Chờ duyệt
    </span>
  );
};

const RejectDialog = ({ open, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (reason.trim().length < 5) {
      setError("Lý do phải có ít nhất 5 ký tự");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-slate-900">Từ chối đơn đăng ký</h2>
        <p className="mt-1 text-sm text-slate-500">
          Vui lòng nhập lý do để gia sư biết cần cải thiện điều gì.
        </p>
        <textarea
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
          rows={4}
          placeholder="Nhập lý do từ chối (tối thiểu 5 ký tự)..."
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError("");
          }}
        />
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="h-9 rounded-lg border-slate-300 text-slate-700"
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="h-9 rounded-lg bg-rose-600 px-4 font-semibold text-white hover:bg-rose-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xác nhận từ chối"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ApplicationCard = ({ application, activeTab, actionLoading, onApprove, onReject }) => {
  const { classItem, tutor, status, rejectionReason } = application;
  const isLoading = actionLoading === application.id;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="grid gap-5 lg:grid-cols-[1fr_1px_1fr]">
        {/* Class info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                #{classItem?.classCode || "—"}
              </span>
              {activeTab === "all" && <StatusBadge status={status} />}
            </div>
            <span className="shrink-0 text-xs text-slate-400">{formatDate(application.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-semibold text-slate-800">Môn: {classItem?.subject || "—"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{classItem?.locationLabel || "—"}</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-slate-50 px-2 py-1 text-slate-600">
              {classItem?.sessionsPerWeek} buổi/tuần · {classItem?.minutesPerSession} phút
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
              {formatPrice(classItem?.feePerMonth)}/tháng
            </span>
          </div>

          {status === "rejected" && rejectionReason && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2">
              <p className="text-xs font-medium text-rose-700">Lý do từ chối:</p>
              <p className="mt-0.5 text-xs text-rose-600">{rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden bg-slate-100 lg:block" />

        {/* Tutor info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {tutor?.avatar ? (
              <img
                src={tutor.avatar}
                alt={tutor.fullName}
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white">
                {(tutor?.fullName ?? "?")[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-800">{tutor?.fullName || "—"}</p>
              <p className="truncate text-xs text-slate-500">{tutor?.email || "—"}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <p>
              Môn đăng ký dạy:{" "}
              <span className="font-medium text-slate-800">
                {tutor?.subjects?.join(", ") || "—"}
              </span>
            </p>
            {tutor?.occupationStatus && (
              <p>
                Nghề nghiệp:{" "}
                <span className="font-medium text-slate-800">{tutor.occupationStatus}</span>
              </p>
            )}
          </div>

          <SubjectMatchBadge tutorSubjects={tutor?.subjects} classSubject={classItem?.subject} />
        </div>
      </div>

      {/* Actions — chỉ hiển thị khi đang ở tab pending */}
      {activeTab === "pending" && (
        <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onReject(application.id)}
            className="h-9 rounded-lg border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <XCircle className="mr-1.5 h-4 w-4" />
                Từ chối
              </>
            )}
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => onApprove(application.id)}
            className="h-9 rounded-lg bg-emerald-600 px-4 font-semibold text-white hover:bg-emerald-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Duyệt nhận lớp
              </>
            )}
          </Button>
        </div>
      )}

      {/* Status footer — khi không ở tab pending */}
      {activeTab !== "pending" && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <StatusBadge status={status} />
          <span className="text-xs text-slate-400">Xử lý lúc {formatDate(application.updatedAt)}</span>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const ClassApplicationsPage = () => {
  const dispatch = useDispatch();
  const {
    classApplications,
    classApplicationsLoading,
    classApplicationsError,
    classApplicationActionLoading,
    classApplicationStats,
    classApplicationStatsLoading,
  } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("pending");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getClassApplicationStatsThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getClassApplicationsThunk({ status: activeTab }));
    setSearchQuery("");
  }, [dispatch, activeTab]);

  const handleRefresh = () => {
    dispatch(getClassApplicationStatsThunk());
    dispatch(getClassApplicationsThunk({ status: activeTab }));
  };

  const handleApprove = (id) => {
    dispatch(approveClassApplicationThunk(id));
  };

  const handleRejectOpen = (id) => setRejectTarget(id);

  const handleRejectConfirm = (rejectionReason) => {
    dispatch(rejectClassApplicationThunk({ id: rejectTarget, rejectionReason })).then(() => {
      setRejectTarget(null);
    });
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return classApplications;
    return classApplications.filter(
      (a) =>
        a.classItem?.classCode?.toLowerCase().includes(q) ||
        a.tutor?.fullName?.toLowerCase().includes(q) ||
        a.classItem?.subject?.toLowerCase().includes(q)
    );
  }, [classApplications, searchQuery]);

  const statCount = {
    pending: classApplicationStats.pending,
    approved: classApplicationStats.approved,
    rejected: classApplicationStats.rejected,
  };

  const emptyMessages = {
    pending: { title: "Không có đơn nào đang chờ", sub: "Tất cả yêu cầu nhận lớp đã được xử lý." },
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
              Xem xét, phê duyệt hoặc từ chối yêu cầu nhận lớp từ gia sư. Kiểm tra xem môn học có khớp với đăng ký của gia sư không.
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Chờ duyệt" count={statCount.pending} color="amber" loading={classApplicationStatsLoading} />
        <StatCard label="Đã duyệt" count={statCount.approved} color="emerald" loading={classApplicationStatsLoading} />
        <StatCard label="Từ chối" count={statCount.rejected} color="rose" loading={classApplicationStatsLoading} />
      </div>

      {/* Tab bar */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const style = TAB_STYLE[tab.color];
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
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
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
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
                {searchQuery
                  ? "Không tìm thấy kết quả phù hợp"
                  : emptyMessages[activeTab]?.title}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {searchQuery
                  ? "Thử tìm kiếm với từ khóa khác."
                  : emptyMessages[activeTab]?.sub}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {classApplicationsLoading && (
                <div className="flex items-center justify-center py-2 text-xs text-slate-400">
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Đang cập nhật...
                </div>
              )}
              {filtered.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  activeTab={activeTab}
                  actionLoading={classApplicationActionLoading}
                  onApprove={handleApprove}
                  onReject={handleRejectOpen}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <RejectDialog
        open={!!rejectTarget}
        loading={classApplicationActionLoading === rejectTarget}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
};

export default ClassApplicationsPage;
