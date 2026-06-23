import { createElement, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
  X,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";
import {
  approveClassApplicationThunk,
  getClassApplicationStatsThunk,
  getClassApplicationsThunk,
  rejectClassApplicationThunk,
} from "@/admin/store/adminThunks";
import {
  formatAvailabilitySlotsDetailed,
  formatClassTutorPrefsSummary,
} from "@/features/classes/utils/classFormatters";

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

const genderLabel = (value) =>
  value === "male" ? "Nam" : value === "female" ? "Nữ" : "Khác";

const occupationLabel = (value) =>
  value === "student" ? "Sinh viên" : value === "teacher" ? "Giáo viên" : "Đã tốt nghiệp";

const PAGE_SIZE = 10;

const TABS = [
  { key: "pending", label: "Chờ duyệt", color: "amber" },
  { key: "approved", label: "Đã duyệt", color: "emerald" },
  { key: "rejected", label: "Từ chối", color: "rose" },
];

const TAB_STYLE = {
  amber: { active: "border-amber-500 text-amber-700 bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  emerald: { active: "border-emerald-500 text-emerald-700 bg-emerald-50", badge: "bg-emerald-100 text-emerald-700" },
  rose: { active: "border-rose-500 text-rose-700 bg-rose-50", badge: "bg-rose-100 text-rose-700" },
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

const TutorAvatar = ({ tutor, size = "h-10 w-10" }) =>
  tutor?.avatar ? (
    <img
      src={tutor.avatar}
      alt={tutor.fullName}
      referrerPolicy="no-referrer"
      className={`${size} rounded-full object-cover ring-2 ring-slate-100`}
    />
  ) : (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white shadow-inner`}>
      {(tutor?.fullName ?? "?")[0]}
    </div>
  );

// ─── Detail modals ─────────────────────────────────────────────────────────────

const ModalShell = ({ title, icon, onClose, children }) => (
  <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#1e3a5f]">
          {createElement(icon, { className: "h-4 w-4" })}
          {title}
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
      <div className="px-5 py-4">{children}</div>
    </div>
  </div>
);

const InfoRow = ({ label, children }) => (
  <p className="text-sm">
    <span className="font-semibold text-slate-400">{label}:</span>{" "}
    <span className="text-slate-700">{children}</span>
  </p>
);

const SlotChips = ({ slots, tone = "slate" }) => {
  if (!slots || slots.length === 0) return <span className="text-slate-500">—</span>;
  const toneCls =
    tone === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : "bg-white text-slate-700 border-slate-200";
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {formatAvailabilitySlotsDetailed(slots)
        .split("\n")
        .map((line, idx) => (
          <span key={idx} className={`rounded border px-2 py-0.5 text-[11px] font-medium ${toneCls}`}>
            {line}
          </span>
        ))}
    </div>
  );
};

const ClassDetailModal = ({ classItem, onClose }) => {
  if (!classItem) return null;
  return (
    <ModalShell title={`Bài đăng #${classItem.classCode || "—"}`} icon={BookOpen} onClose={onClose}>
      <div className="space-y-2.5">
        <InfoRow label="Môn học">
          <span className="font-bold text-emerald-700">{classItem.subject || "—"}</span>
        </InfoRow>
        <InfoRow label="Địa chỉ chi tiết">{classItem.locationLabel || "—"}</InfoRow>
        <InfoRow label="SĐT phụ huynh">{classItem.contactPhone || "—"}</InfoRow>
        <InfoRow label="Thời lượng">
          {classItem.sessionsPerWeek} buổi/tuần · {classItem.minutesPerSession} phút/buổi
        </InfoRow>
        <InfoRow label="Học phí">
          <span className="font-bold text-emerald-600">
            {formatPrice(classItem.feePerSession)}/buổi ({formatPrice(classItem.feePerMonth)}/tháng)
          </span>
        </InfoRow>
        <InfoRow label="Yêu cầu gia sư">{formatClassTutorPrefsSummary(classItem)}</InfoRow>
        <InfoRow label="Học viên">
          {classItem.studentCount} học viên ({genderLabel(classItem.studentGender)})
        </InfoRow>
        <div>
          <span className="text-sm font-semibold text-slate-400">Lịch học yêu cầu:</span>
          <SlotChips slots={classItem.availabilitySlots} />
        </div>
        {classItem.description && (
          <div className="border-t border-slate-100 pt-3">
            <span className="mb-1 block text-sm font-semibold text-slate-400">Mô tả chi tiết:</span>
            <p className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              {classItem.description}
            </p>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

const TutorDetailModal = ({ tutor, classSubject, onClose }) => {
  if (!tutor) return null;
  return (
    <ModalShell title="Thông tin gia sư" icon={Users} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <TutorAvatar tutor={tutor} size="h-12 w-12" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-800">{tutor.fullName || "—"}</p>
            <p className="truncate text-xs text-slate-500">{tutor.email || "—"}</p>
          </div>
          <SubjectMatchBadge tutorSubjects={tutor.subjects} classSubject={classSubject} />
        </div>

        <div className="space-y-2.5">
          <InfoRow label="Số điện thoại">{tutor.phone || "—"}</InfoRow>
          <InfoRow label="Giới tính / Trình độ">
            {genderLabel(tutor.gender)} · {occupationLabel(tutor.occupationStatus)}
          </InfoRow>
          <InfoRow label="Học vị / Trường">
            {tutor.schoolName || "—"} {tutor.graduationYear ? `(Tốt nghiệp ${tutor.graduationYear})` : ""}
          </InfoRow>
          <InfoRow label="Môn đăng ký dạy">{tutor.subjects?.join(", ") || "—"}</InfoRow>
          <div>
            <span className="text-sm font-semibold text-slate-400">Lịch dạy:</span>
            <SlotChips slots={tutor.availability} tone="blue" />
          </div>
          {tutor.bio && (
            <div className="border-t border-slate-100 pt-3">
              <span className="mb-1 block text-sm font-semibold text-slate-400">Giới thiệu bản thân:</span>
              <p className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                {tutor.bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

// Mỗi lần mở lại được remount mới (qua prop key ở nơi sử dụng) nên state luôn sạch.
const RejectDialog = ({ open, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

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

// ─── Application row (compact) ───────────────────────────────────────────────────

const ApplicationRow = ({ application, activeTab, actionLoading, onApprove, onReject, onViewClass, onViewTutor }) => {
  const { classItem, tutor, status, rejectionReason } = application;
  const isLoading = actionLoading === application.id;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
      {/* Mã lớp + môn */}
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-[#1e3a5f] px-2.5 py-1.5 text-xs font-bold text-white shadow-sm">
          #{classItem?.classCode || "—"}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">{classItem?.subject || "—"}</p>
          <p className="text-xs text-slate-400">Ứng tuyển {formatDate(application.createdAt)}</p>
        </div>
      </div>

      <div className="hidden h-8 w-px bg-slate-100 xl:block" />

      {/* Gia sư */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <TutorAvatar tutor={tutor} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{tutor?.fullName || "—"}</p>
          <div className="mt-0.5">
            <SubjectMatchBadge tutorSubjects={tutor?.subjects} classSubject={classItem?.subject} />
          </div>
        </div>
      </div>

      {/* Nút xem chi tiết */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewClass(application)}
          className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <BookOpen className="h-4 w-4" />
          Xem bài đăng
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewTutor(application)}
          className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <Eye className="h-4 w-4" />
          Xem gia sư
        </Button>
      </div>

      {/* Hành động / trạng thái */}
      {activeTab === "pending" ? (
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 xl:border-l xl:border-t-0 xl:pl-3 xl:pt-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onReject(application.id)}
            className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Từ chối
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isLoading}
            onClick={() => onApprove(application.id)}
            className="rounded-lg bg-emerald-600 px-4 font-semibold text-white hover:bg-emerald-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Duyệt
          </Button>
        </div>
      ) : (
        <div className="border-t border-slate-100 pt-3 xl:border-t-0 xl:pt-0">
          <StatusBadge status={status} />
        </div>
      )}
    </div>

    {status === "rejected" && rejectionReason && (
      <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-rose-700">Lý do từ chối</p>
        <p className="mt-0.5 text-xs leading-relaxed text-rose-600">{rejectionReason}</p>
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
    classApplicationsPagination,
    classApplicationsLoading,
    classApplicationsError,
    classApplicationActionLoading,
    classApplicationStats,
    classApplicationStatsLoading,
  } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classModal, setClassModal] = useState(null);
  const [tutorModal, setTutorModal] = useState(null);

  const totalPages = classApplicationsPagination?.totalPages || 1;

  useEffect(() => {
    dispatch(getClassApplicationStatsThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getClassApplicationsThunk({ status: activeTab, page, limit: PAGE_SIZE }));
  }, [dispatch, activeTab, page]);

  const reload = (targetPage = page) =>
    dispatch(getClassApplicationsThunk({ status: activeTab, page: targetPage, limit: PAGE_SIZE }));

  // Sau khi duyệt/từ chối: nếu vừa xử lý item cuối của trang thì lùi 1 trang, ngược lại tải lại trang hiện tại
  const reloadAfterAction = () => {
    if (classApplications.length <= 1 && page > 1) setPage(page - 1);
    else reload();
  };

  const handleTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchQuery("");
  };

  const handlePageChange = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    dispatch(getClassApplicationStatsThunk());
    reload();
  };

  const handleApprove = (id) => {
    dispatch(approveClassApplicationThunk(id)).then((r) => {
      if (!r.error) reloadAfterAction();
    });
  };

  const handleRejectOpen = (id) => setRejectTarget(id);

  const handleRejectConfirm = (rejectionReason) => {
    dispatch(rejectClassApplicationThunk({ id: rejectTarget, rejectionReason })).then((r) => {
      setRejectTarget(null);
      if (!r.error) reloadAfterAction();
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
              Mỗi dòng hiển thị mã lớp và gia sư ứng tuyển. Bấm để xem chi tiết bài đăng hoặc hồ sơ gia sư trước khi duyệt.
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
