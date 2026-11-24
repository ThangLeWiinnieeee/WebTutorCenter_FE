import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  FileWarning,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Upload,
  X,
  XCircle,
} from "lucide-react";

import Modal from "@/components/shared/Modal";
import ImageLightbox from "@/components/shared/ImageLightbox";
import { Button } from "@/components/ui/button";
import {
  ADMIN_OVERRIDE_ACTION_LABELS,
  ATTENDANCE_STATUS_META,
  formatDateVN,
  formatRemainingWindow,
  validateAttendancePhotoFile,
} from "@/features/attendance/constants/attendanceDisplay";
import {
  disputeSessionSchema,
  rejectSessionSchema,
} from "@/features/attendance/schemas/attendanceSchema";
import {
  adminConfirmOnBehalfThunk,
  adminResolveSessionThunk,
  checkInSessionThunk,
  checkOutSessionThunk,
  confirmCheckInThunk,
  confirmCheckOutThunk,
  fetchAttendanceOverviewThunk,
  openDisputeThunk,
  rejectCheckInThunk,
  rejectCheckOutThunk,
} from "@/features/attendance/store/attendanceThunks";
import { clearAttendanceOverview } from "@/features/attendance/store/attendanceSlice";

const formatOperationalIssue = (s) => {
  if (s.status === "EXPIRED_CHECKIN") {
    return "Học viên chưa bấm xác nhận vào lớp trong hạn 30 phút kể từ lúc gia sư gửi Check-in.";
  }
  if (s.status === "EXPIRED_CHECKOUT") {
    return "Học viên chưa bấm xác nhận kết thúc trong hạn 30 phút kể từ lúc gia sư gửi Check-out.";
  }
  if (s.status === "INSUFFICIENT_DURATION") {
    return `Thời lượng thực tế (${s.durationMinutes} phút) chưa đạt mức tối thiểu ${s.requiredMinutes} phút của lớp.`;
  }
  return s.failureReason || s.rejectionReason;
};

const AdminSessionCasePanel = ({ session, onSuccess }) => {
  const dispatch = useDispatch();
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const canValidate = session.status !== "VALID";
  const canInvalidate = session.status !== "INVALIDATED";
  const canReopenCheckIn = [
    "WAITING_CHECKIN_CONFIRMATION",
    "EXPIRED_CHECKIN",
    "REJECTED",
    "NEEDS_REVIEW",
  ].includes(session.status);

  const runAction = async (thunkCreator, payload) => {
    const trimmed = notes.trim();
    if (trimmed.length < 5) {
      setLocalError("Vui lòng nhập ghi chú xử lý (tối thiểu 5 ký tự) để lưu lịch sử kiểm toán.");
      return;
    }
    setLocalError("");
    setSubmitting(true);
    const res = await dispatch(thunkCreator({ sessionId: session.id, payload }));
    setSubmitting(false);
    if (thunkCreator.fulfilled.match(res)) {
      setNotes("");
      onSuccess();
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
        Quyết định xử lý của Admin
      </p>
      <div className="mt-2 flex flex-col gap-2.5">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Nhập ghi chú xử lý / căn cứ đối chiếu (bắt buộc)..."
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-400 focus:outline-none"
        />
        {localError && <p className="text-[11px] font-medium text-rose-600">{localError}</p>}
        <div className="flex flex-wrap items-center gap-2">
          {canValidate && (
            <Button
              type="button"
              size="sm"
              disabled={submitting}
              onClick={() =>
                runAction(adminResolveSessionThunk, {
                  decision: "VALID",
                  verifiedDurationMinutes: session.requiredMinutes,
                  reason: notes.trim(),
                })
              }
              className="h-8 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
            >
              {submitting ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Duyệt hợp lệ
            </Button>
          )}
          {canInvalidate && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={submitting}
              onClick={() =>
                runAction(adminResolveSessionThunk, {
                  decision: "INVALIDATED",
                  verifiedDurationMinutes: 0,
                  reason: notes.trim(),
                })
              }
              className="h-8 border-rose-200 bg-white px-3 text-xs text-rose-700 hover:bg-rose-50"
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Không tính buổi / Từ chối
            </Button>
          )}
          {canReopenCheckIn && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={submitting}
              onClick={() =>
                runAction(adminConfirmOnBehalfThunk, {
                  action: "CONFIRM_CHECKIN_ON_BEHALF",
                  reason: notes.trim(),
                })
              }
              className="h-8 border-amber-200 bg-white px-3 text-xs text-amber-800 hover:bg-amber-50"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Yêu cầu xác nhận lại
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const meta = ATTENDANCE_STATUS_META[status] || {
    label: status,
    shortLabel: status,
    badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
      title={meta.label}
    >
      {meta.label}
    </span>
  );
};

const toVNDateKey = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
};

const WEEKDAY_VN = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const getDaysInRange = (startDate, endDate) => {
  const startKey = toVNDateKey(startDate);
  const endKey = toVNDateKey(endDate);
  if (!startKey || !endKey) return [];
  const days = [];
  const cur = new Date(`${startKey}T00:00:00+07:00`);
  const end = new Date(`${endKey}T00:00:00+07:00`);
  while (cur <= end && days.length < 14) {
    const key = toVNDateKey(cur);
    const vnDay = new Date(cur.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    days.push({
      key,
      weekday: WEEKDAY_VN[vnDay.getDay()],
      dayMonth: `${String(vnDay.getDate()).padStart(2, "0")}/${String(vnDay.getMonth() + 1).padStart(2, "0")}`,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

const AttendanceWeekCalendar = ({
  weeks = [],
  sessions = [],
  viewScope,
  onChangeScope,
  selectedWeekNum,
  onChangeWeek,
  selectedDayKey,
  onSelectDay,
}) => {
  if (!weeks.length) return null;

  const defaultWeek = weeks.find((w) => w.isCurrent) || weeks[0];
  const activeWeek = weeks.find((w) => w.weekNumber === selectedWeekNum) || defaultWeek || weeks[0];
  const days = getDaysInRange(activeWeek.startDate, activeWeek.endDate);
  const todayKey = toVNDateKey(new Date());

  const sessionsByDay = new Map();
  for (const s of sessions) {
    const k = toVNDateKey(s.confirmedCheckInAt || s.checkInAt || s.createdAt);
    if (!k) continue;
    if (!sessionsByDay.has(k)) sessionsByDay.set(k, []);
    sessionsByDay.get(k).push(s);
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Scope Filter + Week Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {[
            { key: "today", label: "Hôm nay" },
            { key: "week", label: "Theo tuần" },
            { key: "month", label: "Cả tháng" },
          ].map((opt) => {
            const active = viewScope === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onChangeScope(opt.key);
                  if (opt.key === "today") onSelectDay(todayKey);
                }}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {viewScope === "week" && (
          <span className="text-xs font-medium text-slate-500">{activeWeek.statusText}</span>
        )}
      </div>

      {/* Week selector pills (shown in week & month views) */}
      {viewScope !== "today" && (
        <div className="flex flex-wrap gap-1.5">
          {weeks.map((w) => {
            const isActive = w.weekNumber === activeWeek.weekNumber;
            return (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => {
                  onChangeWeek(w.weekNumber);
                  onSelectDay(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                    : w.isCurrent
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{w.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-white text-slate-700"
                  }`}
                >
                  {w.weekNumber > 0 ? `${w.completedCount}/${w.target}` : `${w.completedCount}b`}
                </span>
                {w.isCurrent && !isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Tuần hiện tại" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Calendar Grid for Selected Week (spacious, max 2 pills + overflow count) */}
      {viewScope === "week" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {days.map((d) => {
            const isToday = d.key === todayKey;
            const isSelectedDay = selectedDayKey === d.key;
            const daySessions = sessionsByDay.get(d.key) || [];
            const visibleSessions = daySessions.slice(0, 2);
            const hiddenCount = daySessions.length - visibleSessions.length;

            return (
              <button
                key={d.key}
                type="button"
                onClick={() => onSelectDay(isSelectedDay ? null : d.key)}
                className={`flex min-h-[104px] flex-col justify-between rounded-xl border p-2.5 text-left transition ${
                  isSelectedDay
                    ? "border-2 border-emerald-700 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20"
                    : isToday
                      ? "border-2 border-emerald-600 bg-emerald-50/40 shadow-xs"
                      : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span
                    className={`text-[11px] font-bold uppercase ${
                      isToday ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    {d.weekday}
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${
                      isToday ? "bg-emerald-600 text-white" : "text-slate-800"
                    }`}
                  >
                    {d.dayMonth}
                  </span>
                </div>

                {isToday && (
                  <span className="mt-1 inline-block w-fit rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    Hôm nay
                  </span>
                )}

                <div className="mt-2 w-full space-y-1">
                  {daySessions.length === 0 ? (
                    <p className="text-[10px] text-slate-400">Trống</p>
                  ) : (
                    <>
                      {visibleSessions.map((s) => {
                        const meta = ATTENDANCE_STATUS_META[s.status] || {
                          shortLabel: s.status,
                          badgeClass: "border-slate-200 bg-white text-slate-700",
                        };
                        return (
                          <div
                            key={s.id}
                            className={`truncate rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
                            title={`Buổi #${s.sessionNumber}: ${meta.label}`}
                          >
                            #{s.sessionNumber} • {meta.shortLabel || meta.label}
                          </div>
                        );
                      })}
                      {hiddenCount > 0 && (
                        <p className="text-[10px] font-bold text-emerald-700">
                          +{hiddenCount} buổi nữa
                        </p>
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const RejectSessionModal = ({ sessionId, stage, actionLoading, onClose, onSubmitReject }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rejectSessionSchema),
    defaultValues: { reason: "" },
  });

  const title =
    stage === "checkin"
      ? "Từ chối xác nhận Check-in"
      : "Từ chối xác nhận Check-out";

  return (
    <Modal onClose={onClose} panelClassName="max-w-md p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">
            Vui lòng nêu rõ lý do từ chối để gia sư và quản trị viên nắm thông tin.
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

      <form onSubmit={handleSubmit((vals) => onSubmitReject(sessionId, stage, vals.reason))} className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Lý do từ chối <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Ví dụ: Ảnh không đúng thời điểm bắt đầu buổi học / Chưa kết thúc buổi học..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            {...register("reason")}
          />
          {errors.reason && (
            <p className="mt-1 text-xs text-rose-600">{errors.reason.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={actionLoading}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={actionLoading}
            className="bg-rose-600 text-white hover:bg-rose-700"
          >
            {actionLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Xác nhận từ chối
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const DisputeSessionModal = ({ session, actionLoading, onClose, onSubmitDispute }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(disputeSessionSchema),
    defaultValues: { reason: "" },
  });

  return (
    <Modal onClose={onClose} panelClassName="max-w-md p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Yêu cầu Admin hỗ trợ — Buổi #{session.sessionNumber}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Nếu học viên quên xác nhận hoặc có nhầm lẫn về thời gian/ảnh, hãy mô tả chi tiết để Admin kiểm tra và duyệt hỗ trợ.
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

      <form onSubmit={handleSubmit((vals) => onSubmitDispute(session.id, vals.reason))} className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Nội dung phản ánh / yêu cầu <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Ví dụ: Học viên bận việc nên quên bấm xác nhận check-out trong 30 phút, buổi học vẫn diễn ra đủ 90 phút..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            {...register("reason")}
          />
          {errors.reason && (
            <p className="mt-1 text-xs text-rose-600">{errors.reason.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={actionLoading}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={actionLoading}
            className="bg-amber-600 text-white hover:bg-amber-700"
          >
            {actionLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Gửi Admin hỗ trợ
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const ClassAttendanceDialog = ({ open = true, classId, onClose, inline = false }) => {
  const dispatch = useDispatch();
  const { overview, loadingOverview, actionLoading, error } = useSelector(
    (state) => state.attendance
  );

  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // { sessionId, stage: 'checkin' | 'checkout' }
  const [disputeTarget, setDisputeTarget] = useState(null); // session
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [viewScope, setViewScope] = useState("week"); // 'today' | 'week' | 'month'
  const [selectedWeekNum, setSelectedWeekNum] = useState(1);
  const [selectedDayKey, setSelectedDayKey] = useState(null);

  useEffect(() => {
    setSelectedPeriodId("");
    setSelectedFile(null);
    setFileError("");
    setSelectedDayKey(null);
    setViewScope("week");
  }, [classId]);

  const currentPeriodWeeks = overview?.currentPeriod?.weeks;
  useEffect(() => {
    if (!currentPeriodWeeks?.length) return;
    const current = currentPeriodWeeks.find((w) => w.isCurrent) || currentPeriodWeeks[0];
    if (current) setSelectedWeekNum(current.weekNumber);
  }, [currentPeriodWeeks]);

  useEffect(() => {
    if (!open || !classId) return;
    dispatch(fetchAttendanceOverviewThunk({ classId, periodId: selectedPeriodId || undefined }));
  }, [open, classId, selectedPeriodId, dispatch]);

  useEffect(() => {
    if (!open) {
      setSelectedPeriodId("");
      setSelectedFile(null);
      setFileError("");
      setRejectTarget(null);
      setDisputeTarget(null);
      setLightboxUrl(null);
      dispatch(clearAttendanceOverview());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Tick every second while an active waiting session exists to show accurate 30-min countdown
  const activeStatus = overview?.activeSession?.status;
  useEffect(() => {
    if (
      !open ||
      (activeStatus !== "WAITING_CHECKIN_CONFIRMATION" &&
        activeStatus !== "WAITING_CHECKOUT_CONFIRMATION")
    ) {
      return;
    }
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [open, activeStatus]);

  if (!open || !classId) return null;

  const refreshOverview = () => {
    dispatch(
      fetchAttendanceOverviewThunk({
        classId,
        periodId: selectedPeriodId || overview?.currentPeriod?.id || undefined,
      })
    );
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationErr = validateAttendancePhotoFile(file);
    if (validationErr) {
      setFileError(validationErr);
      setSelectedFile(null);
      return;
    }
    setFileError("");
    setSelectedFile(file);
  };

  const handleCheckIn = async () => {
    const validationErr = validateAttendancePhotoFile(selectedFile);
    if (validationErr) {
      setFileError(validationErr);
      return;
    }
    const result = await dispatch(checkInSessionThunk({ classId, file: selectedFile }));
    if (checkInSessionThunk.fulfilled.match(result)) {
      setSelectedFile(null);
      setFileError("");
      refreshOverview();
    }
  };

  const handleCheckOut = async (sessionId) => {
    const validationErr = validateAttendancePhotoFile(selectedFile);
    if (validationErr) {
      setFileError(validationErr);
      return;
    }
    const result = await dispatch(checkOutSessionThunk({ sessionId, file: selectedFile }));
    if (checkOutSessionThunk.fulfilled.match(result)) {
      setSelectedFile(null);
      setFileError("");
      refreshOverview();
    }
  };

  const handleConfirmCheckIn = async (sessionId) => {
    const result = await dispatch(confirmCheckInThunk(sessionId));
    if (confirmCheckInThunk.fulfilled.match(result)) {
      refreshOverview();
    }
  };

  const handleConfirmCheckOut = async (sessionId) => {
    const result = await dispatch(confirmCheckOutThunk(sessionId));
    if (confirmCheckOutThunk.fulfilled.match(result)) {
      refreshOverview();
    }
  };

  const handleSubmitReject = async (sessionId, stage, reason) => {
    const thunk = stage === "checkin" ? rejectCheckInThunk : rejectCheckOutThunk;
    const result = await dispatch(thunk({ sessionId, reason }));
    if (thunk.fulfilled.match(result)) {
      setRejectTarget(null);
      refreshOverview();
    }
  };

  const handleSubmitDispute = async (sessionId, reason) => {
    const result = await dispatch(openDisputeThunk({ sessionId, reason }));
    if (openDisputeThunk.fulfilled.match(result)) {
      setDisputeTarget(null);
      refreshOverview();
    }
  };

  const classInfo = overview?.classInfo;
  const viewerRole = overview?.viewerRole;
  const periods = overview?.periods || [];
  const currentPeriod = overview?.currentPeriod;
  const activeSession = overview?.activeSession;
  const sessions = overview?.sessions || [];

  const isPeriodOpen = currentPeriod?.status === "active";

  const innerContent = (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {viewerRole === "admin" ? "Rà soát & Xử lý điểm danh" : "Điểm danh lớp học"}{" "}
              {classInfo?.classCode ? `— ${classInfo.classCode}` : ""}
            </h2>
            {viewerRole === "admin" && (
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                Quản trị viên
              </span>
            )}
            {viewerRole === "tutor" && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Gia sư
              </span>
            )}
            {viewerRole === "poster" && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Học viên / Người đăng
              </span>
            )}
          </div>
          {classInfo && (
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {classInfo.subject} • {currentPeriod?.sessionsPerWeek || classInfo.sessionsPerWeek} buổi/tuần •{" "}
              {currentPeriod?.minutesPerSession || classInfo.minutesPerSession} phút/buổi
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {periods.length > 1 && (
            <select
              value={currentPeriod?.id || selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-indigo-400 focus:outline-none"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  Kỳ {p.periodNumber} ({formatDateVN(p.startDate, { withTime: false })} –{" "}
                  {formatDateVN(p.endDate, { withTime: false })})
                </option>
              ))}
            </select>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshOverview}
            disabled={loadingOverview}
            title="Làm mới"
          >
            <RefreshCw className={`h-4 w-4 ${loadingOverview ? "animate-spin" : ""}`} />
          </Button>
          {!inline && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={inline ? "space-y-5 p-5 sm:p-6" : "max-h-[75vh] space-y-5 overflow-y-auto p-5 sm:p-6"}>
          {loadingOverview && !overview ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-2 text-sm">Đang tải dữ liệu điểm danh...</p>
            </div>
          ) : error && !overview ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {typeof error === "string" ? error : "Không thể tải thông tin điểm danh lớp học."}
            </div>
          ) : (
            <>
              {/* Monthly summary */}
              {currentPeriod && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Kỳ #{currentPeriod.periodNumber}:{" "}
                        {formatDateVN(currentPeriod.startDate, { withTime: false })} –{" "}
                        {formatDateVN(currentPeriod.endDate, { withTime: false })}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Chốt kỳ ngày {currentPeriod.anchorDay} hàng tháng • Chỉ tiêu{" "}
                        {currentPeriod.monthlyTarget} buổi/tháng
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center">
                        <p className="text-[11px] font-medium text-emerald-700">Buổi hợp lệ</p>
                        <p className="text-base font-bold text-emerald-800">
                          {currentPeriod.stats.totalValidCount} / {currentPeriod.monthlyTarget}
                        </p>
                      </div>
                      {currentPeriod.stats.needsReviewCount > 0 && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-center">
                          <p className="text-[11px] font-medium text-rose-700">Cần xử lý</p>
                          <p className="text-base font-bold text-rose-800">
                            {currentPeriod.stats.needsReviewCount}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Calendar Week View (mặc định mở tuần hiện tại, làm sáng ngày hôm nay) */}
                  <AttendanceWeekCalendar
                    weeks={currentPeriod.weeks || []}
                    sessions={sessions}
                    viewScope={viewScope}
                    onChangeScope={setViewScope}
                    selectedWeekNum={selectedWeekNum}
                    onChangeWeek={setSelectedWeekNum}
                    selectedDayKey={selectedDayKey}
                    onSelectDay={setSelectedDayKey}
                  />
                </div>
              )}

              {/* Active Session / Action Panel */}
              {isPeriodOpen && viewerRole === "tutor" && (
                <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white p-5 shadow-xs">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                    <Camera className="h-4 w-4 text-emerald-600" />
                    Check-in / Điểm danh buổi học
                  </h3>

                  {!activeSession && (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs text-slate-600">
                        Chụp hoặc chọn ảnh minh chứng tại buổi học để gửi <strong>Check-in bắt đầu</strong>. Học viên có 30 phút để xác nhận.
                      </p>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-white px-4 py-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50">
                          <Upload className="h-4 w-4" />
                          <span>{selectedFile ? selectedFile.name : "Chọn ảnh Check-in (JPG/PNG/WEBP, ≤10MB)"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <Button
                          type="button"
                          onClick={handleCheckIn}
                          disabled={actionLoading || !selectedFile}
                          className="h-11 bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                        >
                          {actionLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                          Gửi Check-in bắt đầu buổi
                        </Button>
                      </div>
                      {fileError && <p className="text-xs font-medium text-rose-600">{fileError}</p>}
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Xem trước ảnh Check-in"
                          className="h-32 w-48 cursor-pointer rounded-lg border border-slate-200 object-cover"
                          onClick={() => setLightboxUrl(previewUrl)}
                        />
                      )}
                    </div>
                  )}

                  {activeSession?.status === "WAITING_CHECKIN_CONFIRMATION" && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <div className="space-y-1 text-xs text-amber-900">
                        <p className="font-semibold">
                          Buổi #{activeSession.sessionNumber}: Đã gửi Check-in lúc{" "}
                          {formatDateVN(activeSession.checkInAt)}
                        </p>
                        <p>
                          Đang chờ học viên xác nhận — Còn lại:{" "}
                          <strong className="font-mono">
                            {formatRemainingWindow(activeSession.checkInExpireAt, nowMs)}
                          </strong>
                        </p>
                      </div>
                      {activeSession.checkInPhoto?.url && (
                        <button
                          type="button"
                          onClick={() => setLightboxUrl(activeSession.checkInPhoto.url)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Xem ảnh đã gửi
                        </button>
                      )}
                    </div>
                  )}

                  {activeSession?.status === "IN_PROGRESS" && (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
                        <p className="font-semibold">
                          Buổi #{activeSession.sessionNumber} đang diễn ra — Đã xác nhận vào lớp lúc{" "}
                          {formatDateVN(activeSession.confirmedCheckInAt)}
                        </p>
                        <p className="mt-0.5 text-sky-700">
                          Thời lượng yêu cầu tối thiểu: {activeSession.requiredMinutes} phút. Khi dạy xong, hãy gửi ảnh Check-out.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-indigo-300 bg-white px-4 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">
                          <Upload className="h-4 w-4" />
                          <span>{selectedFile ? selectedFile.name : "Chọn ảnh Check-out (JPG/PNG/WEBP, ≤10MB)"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <Button
                          type="button"
                          onClick={() => handleCheckOut(activeSession.id)}
                          disabled={actionLoading || !selectedFile}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {actionLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                          Gửi Check-out kết thúc buổi
                        </Button>
                      </div>
                      {fileError && <p className="text-xs font-medium text-rose-600">{fileError}</p>}
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Xem trước ảnh Check-out"
                          className="h-32 w-48 cursor-pointer rounded-lg border border-slate-200 object-cover"
                          onClick={() => setLightboxUrl(previewUrl)}
                        />
                      )}
                    </div>
                  )}

                  {activeSession?.status === "WAITING_CHECKOUT_CONFIRMATION" && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                      <div className="space-y-1 text-xs text-indigo-900">
                        <p className="font-semibold">
                          Buổi #{activeSession.sessionNumber}: Đã gửi Check-out lúc{" "}
                          {formatDateVN(activeSession.checkOutAt)}
                        </p>
                        <p>
                          Đang chờ học viên xác nhận kết thúc — Còn lại:{" "}
                          <strong className="font-mono">
                            {formatRemainingWindow(activeSession.checkOutExpireAt, nowMs)}
                          </strong>
                        </p>
                      </div>
                      {activeSession.checkOutPhoto?.url && (
                        <button
                          type="button"
                          onClick={() => setLightboxUrl(activeSession.checkOutPhoto.url)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Xem ảnh Check-out
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isPeriodOpen && viewerRole === "poster" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Xác nhận buổi học (Học viên / Người đăng)
                  </h3>

                  {!activeSession && (
                    <p className="mt-2 text-xs text-slate-600">
                      Hiện chưa có yêu cầu Check-in / Check-out nào đang chờ xác nhận. Khi gia sư gửi ảnh bắt đầu hoặc kết thúc buổi học, bạn có 30 phút để xác nhận tại đây.
                    </p>
                  )}

                  {activeSession?.status === "WAITING_CHECKIN_CONFIRMATION" && (
                    <div className="mt-3 flex flex-col gap-4 rounded-lg border border-amber-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        {activeSession.checkInPhoto?.url && (
                          <img
                            src={activeSession.checkInPhoto.url}
                            alt="Ảnh Check-in của gia sư"
                            onClick={() => setLightboxUrl(activeSession.checkInPhoto.url)}
                            className="h-20 w-24 shrink-0 cursor-pointer rounded-lg border border-slate-200 object-cover hover:opacity-90"
                          />
                        )}
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-slate-900">
                            Buổi #{activeSession.sessionNumber} — Gia sư gửi Check-in
                          </p>
                          <p className="text-slate-600">
                            Thời gian gửi: {formatDateVN(activeSession.checkInAt)}
                          </p>
                          <p className="font-semibold text-amber-700">
                            Còn lại:{" "}
                            <span className="font-mono">
                              {formatRemainingWindow(activeSession.checkInExpireAt, nowMs)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => handleConfirmCheckIn(activeSession.id)}
                          disabled={actionLoading}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {actionLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                          Xác nhận vào lớp
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setRejectTarget({ sessionId: activeSession.id, stage: "checkin" })
                          }
                          disabled={actionLoading}
                          className="border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          <XCircle className="mr-1.5 h-4 w-4" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeSession?.status === "IN_PROGRESS" && (
                    <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
                      <p className="font-semibold">
                        Buổi #{activeSession.sessionNumber} đang diễn ra (vào lớp lúc{" "}
                        {formatDateVN(activeSession.confirmedCheckInAt)}).
                      </p>
                      <p className="mt-0.5 text-sky-700">
                        Chờ gia sư gửi ảnh Check-out sau khi hoàn thành tối thiểu{" "}
                        {activeSession.requiredMinutes} phút học.
                      </p>
                    </div>
                  )}

                  {activeSession?.status === "WAITING_CHECKOUT_CONFIRMATION" && (
                    <div className="mt-3 flex flex-col gap-4 rounded-lg border border-indigo-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        {activeSession.checkOutPhoto?.url && (
                          <img
                            src={activeSession.checkOutPhoto.url}
                            alt="Ảnh Check-out của gia sư"
                            onClick={() => setLightboxUrl(activeSession.checkOutPhoto.url)}
                            className="h-20 w-24 shrink-0 cursor-pointer rounded-lg border border-slate-200 object-cover hover:opacity-90"
                          />
                        )}
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-slate-900">
                            Buổi #{activeSession.sessionNumber} — Gia sư gửi Check-out
                          </p>
                          <p className="text-slate-600">
                            Vào lớp: {formatDateVN(activeSession.confirmedCheckInAt)} • Gửi Check-out:{" "}
                            {formatDateVN(activeSession.checkOutAt)}
                          </p>
                          <p className="text-slate-600">
                            Thời lượng tạm tính:{" "}
                            <strong>{activeSession.durationMinutes} phút</strong> / yêu cầu{" "}
                            {activeSession.requiredMinutes} phút
                          </p>
                          <p className="font-semibold text-indigo-700">
                            Còn lại:{" "}
                            <span className="font-mono">
                              {formatRemainingWindow(activeSession.checkOutExpireAt, nowMs)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => handleConfirmCheckOut(activeSession.id)}
                          disabled={actionLoading}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {actionLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                          Xác nhận kết thúc buổi
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setRejectTarget({ sessionId: activeSession.id, stage: "checkout" })
                          }
                          disabled={actionLoading}
                          className="border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          <XCircle className="mr-1.5 h-4 w-4" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Session History (filtered by Hôm nay / Theo tuần / Cả tháng) */}
              {(() => {
                const todayKey = toVNDateKey(new Date());
                const filteredSessions = sessions.filter((s) => {
                  const sKey = toVNDateKey(s.confirmedCheckInAt || s.checkInAt || s.createdAt);
                  if (viewScope === "today") {
                    return sKey === (selectedDayKey || todayKey);
                  }
                  if (viewScope === "week") {
                    if (selectedDayKey) return sKey === selectedDayKey;
                    return s.targetWeek === selectedWeekNum;
                  }
                  return true; // month
                });

                const scopeLabel =
                  viewScope === "today"
                    ? "hôm nay"
                    : viewScope === "week"
                      ? selectedDayKey
                        ? `ngày ${selectedDayKey.split("-").reverse().slice(0, 2).join("/")}`
                        : selectedWeekNum > 0
                          ? `Tuần ${selectedWeekNum}`
                          : "Ngày dư"
                      : "cả tháng";

                return (
                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Clock className="h-4 w-4 text-slate-500" />
                        Lịch sử điểm danh ({scopeLabel}: {filteredSessions.length} buổi)
                      </h3>
                      {selectedDayKey && viewScope === "week" && (
                        <button
                          type="button"
                          onClick={() => setSelectedDayKey(null)}
                          className="text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          Xem cả Tuần {selectedWeekNum > 0 ? selectedWeekNum : "ngày dư"}
                        </button>
                      )}
                    </div>

                    {filteredSessions.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-500">
                        Không có buổi điểm danh nào trong {scopeLabel}.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredSessions.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              Buổi #{s.sessionNumber}
                            </span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                              {s.targetWeek > 0 ? `Tuần ${s.targetWeek}` : "Ngày dư"}
                            </span>
                            <StatusBadge status={s.status} />
                          </div>
                          <span className="text-xs font-medium text-slate-500">
                            Thời lượng: <strong>{s.durationMinutes}</strong>/{s.requiredMinutes} phút
                          </span>
                        </div>

                        {/* 4 Timestamps */}
                        <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <span className="block text-[11px] text-slate-400">1. GS Check-in</span>
                            <span className="font-medium text-slate-800">
                              {formatDateVN(s.checkInAt)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[11px] text-slate-400">2. XN Vào lớp</span>
                            <span className="font-medium text-slate-800">
                              {formatDateVN(s.confirmedCheckInAt)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[11px] text-slate-400">3. GS Check-out</span>
                            <span className="font-medium text-slate-800">
                              {formatDateVN(s.checkOutAt)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[11px] text-slate-400">4. XN Kết thúc</span>
                            <span className="font-medium text-slate-800">
                              {formatDateVN(s.confirmedCheckOutAt)}
                            </span>
                          </div>
                        </div>

                        {/* Photos (larger preview for comparison + sender/time) */}
                        {(s.checkInPhoto?.url || s.checkOutPhoto?.url) && (
                          <div className="mt-3 flex flex-wrap gap-3">
                            {s.checkInPhoto?.url && (
                              <button
                                type="button"
                                onClick={() => setLightboxUrl(s.checkInPhoto.url)}
                                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-2 pr-3.5 text-left transition hover:border-slate-400 hover:bg-slate-100/70"
                              >
                                <img
                                  src={s.checkInPhoto.url}
                                  alt="Ảnh check-in"
                                  className="h-20 w-28 shrink-0 rounded-lg object-cover"
                                />
                                <div>
                                  <span className="block text-xs font-bold text-slate-800">
                                    Ảnh Check-in
                                  </span>
                                  <span className="mt-0.5 block text-[11px] text-slate-500">
                                    Gia sư gửi: {formatDateVN(s.checkInAt)}
                                  </span>
                                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                                    <Eye className="h-3 w-3" />
                                    Bấm phóng to
                                  </span>
                                </div>
                              </button>
                            )}
                            {s.checkOutPhoto?.url && (
                              <button
                                type="button"
                                onClick={() => setLightboxUrl(s.checkOutPhoto.url)}
                                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-2 pr-3.5 text-left transition hover:border-slate-400 hover:bg-slate-100/70"
                              >
                                <img
                                  src={s.checkOutPhoto.url}
                                  alt="Ảnh check-out"
                                  className="h-20 w-28 shrink-0 rounded-lg object-cover"
                                />
                                <div>
                                  <span className="block text-xs font-bold text-slate-800">
                                    Ảnh Check-out
                                  </span>
                                  <span className="mt-0.5 block text-[11px] text-slate-500">
                                    Gia sư gửi: {formatDateVN(s.checkOutAt)}
                                  </span>
                                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                                    <Eye className="h-3 w-3" />
                                    Bấm phóng to
                                  </span>
                                </div>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Operational Issue Explanation */}
                        {(s.failureReason || s.rejectionReason) && (
                          <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-2.5 text-xs text-rose-800">
                            <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                            <div>
                              <span className="font-semibold">Nguyên nhân cần rà soát: </span>
                              {formatOperationalIssue(s)}
                            </div>
                          </div>
                        )}

                        {/* Admin Override Banner */}
                        {s.adminOverride?.isOverridden && (
                          <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <div>
                              <p className="font-semibold">
                                Admin đã duyệt hỗ trợ:{" "}
                                {ADMIN_OVERRIDE_ACTION_LABELS[s.adminOverride.action] ||
                                  s.adminOverride.action}
                              </p>
                              <p className="mt-0.5 text-emerald-800">
                                Lý do: {s.adminOverride.reason} ({formatDateVN(s.adminOverride.overriddenAt)})
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Dispute info */}
                        {s.dispute?.isDisputed && (
                          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-900">
                            <p className="font-semibold">
                              Yêu cầu hỗ trợ ({s.dispute.status === "pending" ? "Đang chờ Admin xử lý" : "Đã xử lý"}):
                            </p>
                            <p className="mt-0.5">{s.dispute.reason}</p>
                            {s.dispute.resolution && (
                              <p className="mt-1 border-t border-amber-200/70 pt-1 font-medium text-slate-800">
                                Kết luận Admin ({s.dispute.resolution.decision}):{" "}
                                {s.dispute.resolution.notes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Admin inline case-handling actions */}
                        {viewerRole === "admin" && (
                          <AdminSessionCasePanel session={s} onSuccess={refreshOverview} />
                        )}

                        {/* Footer action */}
                        {(viewerRole === "tutor" || viewerRole === "poster") &&
                          s.dispute?.status !== "pending" && (
                            <div className="mt-3 flex justify-end border-t border-slate-100 pt-2.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDisputeTarget(s)}
                                className="h-8 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                              >
                                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                                Yêu cầu Admin hỗ trợ
                              </Button>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
    </>
  );

  return (
    <>
      {inline ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {innerContent}
        </div>
      ) : (
        <Modal
          onClose={onClose}
          closeOnBackdropClick
          panelClassName="max-w-4xl p-0 overflow-hidden"
        >
          {innerContent}
        </Modal>
      )}

      {rejectTarget && (
        <RejectSessionModal
          sessionId={rejectTarget.sessionId}
          stage={rejectTarget.stage}
          actionLoading={actionLoading}
          onClose={() => setRejectTarget(null)}
          onSubmitReject={handleSubmitReject}
        />
      )}

      {disputeTarget && (
        <DisputeSessionModal
          session={disputeTarget}
          actionLoading={actionLoading}
          onClose={() => setDisputeTarget(null)}
          onSubmitDispute={handleSubmitDispute}
        />
      )}

      {lightboxUrl && (
        <ImageLightbox src={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </>
  );
};

export default ClassAttendanceDialog;
