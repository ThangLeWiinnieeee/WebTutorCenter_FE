import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CalendarPlus,
  ClipboardCheck,
  Clock,
  FileWarning,
  Gavel,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";

import Modal from "@/components/shared/Modal";
import ImageLightbox from "@/components/shared/ImageLightbox";
import Pagination from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import {
  ADMIN_OVERRIDE_ACTION_LABELS,
  ATTENDANCE_STATUS_META,
  formatDateVN,
} from "@/features/attendance/constants/attendanceDisplay";
import {
  adminConfirmOnBehalfSchema,
  adminResolveSessionSchema,
} from "@/features/attendance/schemas/attendanceSchema";
import {
  adminConfirmOnBehalfThunk,
  adminInitPeriodThunk,
  adminResolveSessionThunk,
  fetchAdminAttendanceSessionsThunk,
} from "@/features/attendance/store/attendanceThunks";

const STATUS_TABS = [
  { key: "needs_attention", label: "Cần rà soát / Khiếu nại" },
  { key: "all", label: "Tất cả" },
  { key: "WAITING_CHECKIN_CONFIRMATION", label: "Chờ XN Check-in" },
  { key: "WAITING_CHECKOUT_CONFIRMATION", label: "Chờ XN Check-out" },
  { key: "VALID", label: "Hợp lệ" },
  { key: "INVALIDATED", label: "Không hợp lệ" },
];

const AdminConfirmOnBehalfModal = ({ session, loading, onClose, onSubmitConfirm }) => {
  const canConfirmCheckInOnly = session.status === "WAITING_CHECKIN_CONFIRMATION" || session.status === "CHECKIN_EXPIRED";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminConfirmOnBehalfSchema),
    defaultValues: {
      action: canConfirmCheckInOnly ? "CONFIRM_CHECKIN_ON_BEHALF" : "VALIDATE_SESSION",
      reason: "",
      verifiedDurationMinutes:
        session.durationMinutes >= session.requiredMinutes
          ? session.durationMinutes
          : session.requiredMinutes,
    },
  });

  const selectedAction = watch("action");

  return (
    <Modal onClose={onClose} panelClassName="max-w-lg p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Duyệt điểm danh thay học viên — Buổi #{session.sessionNumber}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Lớp {session.classInfo?.classCode || "—"} • Thời lượng yêu cầu: {session.requiredMinutes} phút
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit((vals) =>
          onSubmitConfirm(session.id, {
            action: vals.action,
            reason: vals.reason,
            ...(vals.action === "VALIDATE_SESSION" && vals.verifiedDurationMinutes !== undefined
              ? { verifiedDurationMinutes: vals.verifiedDurationMinutes }
              : {}),
          })
        )}
        className="mt-4 space-y-4"
      >
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Thao tác duyệt thay
          </label>
          <select
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
            {...register("action")}
          >
            <option value="VALIDATE_SESSION">
              Xác nhận hoàn thành & tính 1 buổi hợp lệ (VALID)
            </option>
            <option value="CONFIRM_CHECKIN_ON_BEHALF">
              Chỉ xác nhận Check-in thay học viên (Chuyển sang Đang học)
            </option>
          </select>
          {errors.action && (
            <p className="mt-1 text-xs text-rose-600">{errors.action.message}</p>
          )}
        </div>

        {selectedAction === "VALIDATE_SESSION" && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Thời lượng xác nhận (phút) — Tối thiểu {session.requiredMinutes} phút
            </label>
            <input
              type="number"
              min={1}
              max={600}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              {...register("verifiedDurationMinutes")}
            />
            {errors.verifiedDurationMinutes && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.verifiedDurationMinutes.message}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Lý do duyệt thay (lưu lịch sử kiểm toán) <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Ví dụ: Học viên gọi hotline báo đã học đủ buổi nhưng quên bấm xác nhận trong 30 phút..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
            {...register("reason")}
          />
          {errors.reason && (
            <p className="mt-1 text-xs text-rose-600">{errors.reason.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Xác nhận duyệt thay
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const AdminResolveModal = ({ session, loading, onClose, onSubmitResolve }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminResolveSessionSchema),
    defaultValues: {
      decision: "VALID",
      reason: "",
      verifiedDurationMinutes:
        session.durationMinutes >= session.requiredMinutes
          ? session.durationMinutes
          : session.requiredMinutes,
    },
  });

  const decision = watch("decision");

  return (
    <Modal onClose={onClose} panelClassName="max-w-lg p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Kết luận xử lý sự cố / khiếu nại — Buổi #{session.sessionNumber}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Lớp {session.classInfo?.classCode || "—"} • Thời lượng yêu cầu: {session.requiredMinutes} phút
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit((vals) =>
          onSubmitResolve(session.id, {
            decision: vals.decision,
            reason: vals.reason,
            verifiedDurationMinutes: vals.verifiedDurationMinutes,
          })
        )}
        className="mt-4 space-y-4"
      >
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Quyết định của Admin
          </label>
          <select
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
            {...register("decision")}
          >
            <option value="VALID">Công nhận buổi hợp lệ (VALID)</option>
            <option value="INVALIDATED">Không công nhận buổi (INVALIDATED)</option>
          </select>
          {errors.decision && (
            <p className="mt-1 text-xs text-rose-600">{errors.decision.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Thời lượng xác minh (phút)
            {decision === "VALID" && ` — Tối thiểu ${session.requiredMinutes} phút`}
          </label>
          <input
            type="number"
            min={0}
            max={600}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
            {...register("verifiedDurationMinutes")}
          />
          {errors.verifiedDurationMinutes && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.verifiedDurationMinutes.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Lý do kết luận <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Nhập căn cứ đối chiếu ảnh/thời gian và kết luận xử lý..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
            {...register("reason")}
          />
          {errors.reason && (
            <p className="mt-1 text-xs text-rose-600">{errors.reason.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Lưu kết luận
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const AdminInitPeriodModal = ({ loading, onClose, onSubmitInit }) => {
  const [classId, setClassId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = classId.trim();
    if (!/^[0-9a-fA-F]{24}$/.test(trimmed)) {
      setLocalError("Vui lòng nhập Class ID hợp lệ (24 ký tự hex ObjectId)");
      return;
    }
    setLocalError("");
    onSubmitInit({ classId: trimmed, startDate: startDate || undefined });
  };

  return (
    <Modal onClose={onClose} panelClassName="max-w-md p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Khởi tạo kỳ điểm danh cho lớp cũ</h3>
          <p className="mt-1 text-xs text-slate-500">
            Dùng cho các lớp đã thanh toán phí nhận lớp trước khi triển khai tính năng điểm danh.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Class ID (ObjectId) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            placeholder="Ví dụ: 67d1234567890abcdef12345"
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
          />
          {localError && <p className="mt-1 text-xs text-rose-600">{localError}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Ngày bắt đầu kỳ (tùy chọn, mặc định ngày mở lớp)
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading} className="bg-indigo-600 text-white hover:bg-indigo-700">
            {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Khởi tạo kỳ
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const AdminAttendancePage = () => {
  const dispatch = useDispatch();
  const {
    adminSessions,
    adminCounts,
    adminPagination,
    loadingAdmin,
    adminActionLoading,
  } = useSelector((state) => state.attendance);

  const [statusFilter, setStatusFilter] = useState("needs_attention");
  const [disputeOnly, setDisputeOnly] = useState(false);
  const [classCodeInput, setClassCodeInput] = useState("");
  const [appliedClassCode, setAppliedClassCode] = useState("");
  const [page, setPage] = useState(1);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [showInitModal, setShowInitModal] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const loadSessions = () => {
    dispatch(
      fetchAdminAttendanceSessionsThunk({
        page,
        limit: 10,
        status: statusFilter,
        disputeOnly,
        ...(appliedClassCode ? { classCode: appliedClassCode } : {}),
      })
    );
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, disputeOnly, appliedClassCode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedClassCode(classCodeInput.trim());
  };

  const handleConfirmOnBehalf = async (sessionId, payload) => {
    const res = await dispatch(adminConfirmOnBehalfThunk({ sessionId, payload }));
    if (adminConfirmOnBehalfThunk.fulfilled.match(res)) {
      setConfirmTarget(null);
      loadSessions();
    }
  };

  const handleResolveSession = async (sessionId, payload) => {
    const res = await dispatch(adminResolveSessionThunk({ sessionId, payload }));
    if (adminResolveSessionThunk.fulfilled.match(res)) {
      setResolveTarget(null);
      loadSessions();
    }
  };

  const handleInitPeriod = async ({ classId, startDate }) => {
    setInitLoading(true);
    const res = await dispatch(adminInitPeriodThunk({ classId, startDate }));
    setInitLoading(false);
    if (adminInitPeriodThunk.fulfilled.match(res)) {
      setShowInitModal(false);
      loadSessions();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <ClipboardCheck className="h-6 w-6 text-indigo-600" />
            Quản lý điểm danh lớp học
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi buổi học, xử lý khiếu nại và duyệt điểm danh thay học viên khi học viên quên xác nhận.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowInitModal(true)}
            className="gap-1.5"
          >
            <CalendarPlus className="h-4 w-4 text-indigo-600" />
            Khởi tạo kỳ lớp cũ
          </Button>
          <Button type="button" variant="outline" onClick={loadSessions} disabled={loadingAdmin}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${loadingAdmin ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Tổng số buổi</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{adminCounts.total}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
          <p className="text-xs font-medium text-rose-700">Cần xử lý / Rà soát</p>
          <p className="mt-1 text-2xl font-bold text-rose-800">{adminCounts.needsAttention}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-xs font-medium text-amber-700">Khiếu nại đang mở</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{adminCounts.disputedPending}</p>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
          <p className="text-xs font-medium text-indigo-700">Chờ HV xác nhận</p>
          <p className="mt-1 text-2xl font-bold text-indigo-800">{adminCounts.waitingConfirm}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-xs font-medium text-emerald-700">Buổi hợp lệ</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{adminCounts.valid}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setPage(1);
                setStatusFilter(tab.key);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === tab.key
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={classCodeInput}
                onChange={(e) => setClassCodeInput(e.target.value)}
                placeholder="Tìm theo mã lớp (VD: LOP001)..."
                className="h-9 w-56 rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <Button type="submit" size="sm" variant="outline" className="h-9 text-xs">
              Tìm
            </Button>
            {appliedClassCode && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setClassCodeInput("");
                  setAppliedClassCode("");
                  setPage(1);
                }}
                className="h-9 text-xs text-slate-500"
              >
                Xóa lọc mã
              </Button>
            )}
          </form>

          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={disputeOnly}
              onChange={(e) => {
                setPage(1);
                setDisputeOnly(e.target.checked);
              }}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Chỉ hiện buổi có khiếu nại đang chờ xử lý
          </label>
        </div>
      </div>

      {/* Sessions List */}
      {loadingAdmin ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-14 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-sm">Đang tải danh sách buổi điểm danh...</p>
        </div>
      ) : adminSessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          Không có buổi điểm danh nào phù hợp bộ lọc hiện tại.
        </div>
      ) : (
        <div className="space-y-4">
          {adminSessions.map((s) => {
            const statusMeta = ATTENDANCE_STATUS_META[s.status] || {
              label: s.status,
              badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
            };
            const canConfirmOnBehalf = s.status !== "VALID" && s.status !== "INVALIDATED";

            return (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                {/* Card Top */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
                        {s.classInfo?.classCode || "Lớp"}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        Buổi #{s.sessionNumber} ({s.targetWeek > 0 ? `Tuần ${s.targetWeek}` : "Ngày dư"})
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                      {s.dispute?.status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                          <AlertTriangle className="h-3 w-3" />
                          Khiếu nại chờ xử lý
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      Môn: <strong>{s.classInfo?.subject || "—"}</strong> • Gia sư:{" "}
                      <strong>{s.tutorUser?.fullName || "—"}</strong> ({s.tutorUser?.email || "—"}) •
                      Học viên/Người đăng: <strong>{s.posterUser?.fullName || "—"}</strong> (
                      {s.posterUser?.phone || s.posterUser?.email || "—"})
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    Thời lượng: <strong>{s.durationMinutes}</strong> / {s.requiredMinutes} phút
                  </div>
                </div>

                {/* 4 Timestamps */}
                <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <span className="block text-[11px] text-slate-400">1. GS Check-in</span>
                    <span className="font-medium text-slate-800">{formatDateVN(s.checkInAt)}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">2. XN Vào lớp</span>
                    <span className="font-medium text-slate-800">
                      {formatDateVN(s.confirmedCheckInAt)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">3. GS Check-out</span>
                    <span className="font-medium text-slate-800">{formatDateVN(s.checkOutAt)}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">4. XN Kết thúc</span>
                    <span className="font-medium text-slate-800">
                      {formatDateVN(s.confirmedCheckOutAt)}
                    </span>
                  </div>
                </div>

                {/* Evidence Photos */}
                {(s.checkInPhoto?.url || s.checkOutPhoto?.url) && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {s.checkInPhoto?.url && (
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(s.checkInPhoto.url)}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 p-1.5 pr-3 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40"
                      >
                        <img
                          src={s.checkInPhoto.url}
                          alt="Ảnh Check-in"
                          className="h-12 w-14 rounded object-cover"
                        />
                        <span>Ảnh Check-in</span>
                      </button>
                    )}
                    {s.checkOutPhoto?.url && (
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(s.checkOutPhoto.url)}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 p-1.5 pr-3 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40"
                      >
                        <img
                          src={s.checkOutPhoto.url}
                          alt="Ảnh Check-out"
                          className="h-12 w-14 rounded object-cover"
                        />
                        <span>Ảnh Check-out</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Failure / Rejection */}
                {(s.failureReason || s.rejectionReason) && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-2 text-xs text-rose-800">
                    <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                    <span>{s.failureReason || s.rejectionReason}</span>
                  </div>
                )}

                {/* Admin Override Audit */}
                {s.adminOverride?.isOverridden && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-semibold">
                        Đã duyệt thay học viên:{" "}
                        {ADMIN_OVERRIDE_ACTION_LABELS[s.adminOverride.action] ||
                          s.adminOverride.action}
                      </p>
                      <p className="mt-0.5">
                        Lý do: {s.adminOverride.reason} • Lúc{" "}
                        {formatDateVN(s.adminOverride.overriddenAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dispute */}
                {s.dispute?.isDisputed && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-900">
                    <p className="font-semibold">
                      Phản ánh từ {s.dispute.requestedByRole === "tutor" ? "Gia sư" : "Học viên"} (
                      {formatDateVN(s.dispute.requestedAt)}):
                    </p>
                    <p className="mt-0.5">{s.dispute.reason}</p>
                    {s.dispute.resolution && (
                      <div className="mt-1.5 border-t border-amber-200/70 pt-1.5 text-slate-800">
                        <p className="font-semibold">
                          Kết luận hiện tại ({s.dispute.resolution.decision}):{" "}
                          {s.dispute.resolution.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Actions */}
                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                  {canConfirmOnBehalf && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setConfirmTarget(s)}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <UserCheck className="mr-1.5 h-4 w-4" />
                      Duyệt thay học viên
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setResolveTarget(s)}
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    <Gavel className="mr-1.5 h-4 w-4" />
                    Xử lý khiếu nại / Kết luận
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {adminPagination && adminPagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={adminPagination.totalPages}
          onPageChange={setPage}
        />
      )}

      {confirmTarget && (
        <AdminConfirmOnBehalfModal
          session={confirmTarget}
          loading={adminActionLoading}
          onClose={() => setConfirmTarget(null)}
          onSubmitConfirm={handleConfirmOnBehalf}
        />
      )}

      {resolveTarget && (
        <AdminResolveModal
          session={resolveTarget}
          loading={adminActionLoading}
          onClose={() => setResolveTarget(null)}
          onSubmitResolve={handleResolveSession}
        />
      )}

      {showInitModal && (
        <AdminInitPeriodModal
          loading={initLoading}
          onClose={() => setShowInitModal(false)}
          onSubmitInit={handleInitPeriod}
        />
      )}

      {lightboxUrl && (
        <ImageLightbox src={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  );
};

export default AdminAttendancePage;
