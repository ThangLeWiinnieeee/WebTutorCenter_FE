import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Award,
  BookOpenText,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  fetchApplicantsThunk,
  selectApplicantThunk,
} from "@/features/classes/store/classThunks";
import { clearApplicants } from "@/features/classes/store/classSlice";
import { APPLICANT_STATUS_META } from "@/features/classes/utils/applicationStatus";
import { OCCUPATION_STATUS_LABEL, GENDER_LABEL } from "@/features/tutors/constants";

const StatusBadge = ({ status }) => {
  const meta = APPLICANT_STATUS_META[status];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
};

export default function ClassApplicantsDialog({ open, post, onClose, onSelected }) {
  const dispatch = useDispatch();
  const { applicants, loadingApplicants, selectingApplicant } = useSelector((state) => state.classes);
  const [picked, setPicked] = useState(null);

  const classId = post?.id;
  const isClassOpen = !post?.status || post.status === "open";

  useEffect(() => {
    if (open && classId) {
      dispatch(fetchApplicantsThunk(classId));
    }
    return () => {
      if (open) {
        dispatch(clearApplicants());
        setPicked(null);
      }
    };
  }, [open, classId, dispatch]);

  // Gia sư đang bị "khóa": đã được chọn chờ admin (selected) hoặc đã được admin duyệt (approved).
  // Khi đã có lựa chọn bị khóa thì người đăng không được đổi sang gia sư khác nữa.
  const lockedApplicant = useMemo(
    () => applicants.find((a) => a.status === "selected" || a.status === "approved") || null,
    [applicants],
  );
  const hasLockedSelection = !!lockedApplicant;
  // Có gia sư đã bị admin từ chối → nhắc người đăng chọn lại người khác.
  const hasRejected = useMemo(() => applicants.some((a) => a.status === "rejected"), [applicants]);
  // Hiển thị sẵn lựa chọn đang khóa; nếu đang được chọn lại thì theo lựa chọn của người dùng.
  const effectivePicked = picked ?? lockedApplicant?.id ?? null;

  if (!open || !post) return null;

  const handleConfirm = async () => {
    if (!effectivePicked) {
      toast.error("Vui lòng chọn 1 gia sư");
      return;
    }
    const result = await dispatch(selectApplicantThunk({ classId, applicationId: effectivePicked }));
    if (selectApplicantThunk.fulfilled.match(result)) {
      toast.success("Đã chọn gia sư, đang chờ admin duyệt lớp");
      onSelected?.(); // người đăng làm mới danh sách bài đăng
      onClose?.(); // chọn xong thì đóng popup thay vì giữ nó mở
    } else {
      toast.error(result.payload || "Không thể chọn gia sư");
    }
  };

  // Chỉ cho tích chọn khi: lớp còn mở, chưa có lựa chọn bị khóa, và gia sư đang chờ được chọn.
  // Sau khi đã chọn (selected) hoặc đã duyệt (approved) thì không cho đổi nữa.
  const isSelectable = (a) => isClassOpen && !hasLockedSelection && a.status === "pending";

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900">Gia sư ứng tuyển</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                Mã lớp {post.classCode} · {post.subject} — chọn 1 gia sư bạn ưng ý, đơn sẽ chuyển admin duyệt.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!loadingApplicants && hasRejected && !hasLockedSelection && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Gia sư bạn chọn trước đó đã bị admin từ chối. Vui lòng chọn một gia sư khác trong danh sách bên dưới.
              </span>
            </div>
          )}

          {loadingApplicants && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang tải danh sách gia sư...
            </div>
          )}

          {!loadingApplicants && applicants.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users className="h-7 w-7" />
              </div>
              <p className="text-base font-semibold text-slate-700">Chưa có gia sư nào ứng tuyển</p>
              <p className="max-w-md text-sm text-slate-500">
                Khi có gia sư ứng tuyển, danh sách sẽ hiển thị ở đây (xếp theo số lớp đã dạy nhiều nhất).
              </p>
            </div>
          )}

          {!loadingApplicants && applicants.length > 0 && (
            <ul className="space-y-3">
              {applicants.map((a) => {
                const t = a.tutor || {};
                const selectable = isSelectable(a);
                const checked = effectivePicked === a.id;
                const isRejected = a.status === "rejected";
                return (
                  <li key={a.id}>
                    <label
                      className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                        checked
                          ? "border-emerald-400 bg-emerald-50/60 ring-1 ring-emerald-200"
                          : isRejected
                            ? "border-rose-200 bg-rose-50/40"
                            : "border-slate-200 hover:border-emerald-300"
                      } ${selectable ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                    >
                      <input
                        type="radio"
                        name="applicant"
                        className="mt-1.5 h-4 w-4 accent-emerald-600"
                        disabled={!selectable}
                        checked={checked}
                        onChange={() => setPicked(a.id)}
                      />
                      {/* Avatar */}
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-100">
                        {t.avatar ? (
                          <img src={t.avatar} alt={t.fullName || "Gia sư"} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                            {(t.fullName || "?").charAt(0)}
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900">{t.fullName || "Gia sư"}</span>
                          <StatusBadge status={a.status} />
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <Award className="h-3.5 w-3.5" />
                            Đã dạy {t.totalClassesAccepted || 0} lớp
                          </span>
                          {t.occupationStatus && (
                            <span className="inline-flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5" />
                              {OCCUPATION_STATUS_LABEL[t.occupationStatus] || t.occupationStatus}
                            </span>
                          )}
                          {t.gender && <span>{GENDER_LABEL[t.gender] || ""}</span>}
                        </div>
                        {t.schoolName && (
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {t.schoolName}
                            {t.graduationYear ? ` · TN ${t.graduationYear}` : ""}
                          </p>
                        )}
                        {Array.isArray(t.subjects) && t.subjects.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            <BookOpenText className="h-3.5 w-3.5 text-slate-400" />
                            {t.subjects.slice(0, 6).map((s) => (
                              <span key={s} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            {!isClassOpen
              ? "Lớp đã ghép gia sư — không thể thay đổi lựa chọn."
              : hasLockedSelection
                ? "Bạn đã chọn gia sư cho lớp này, đang chờ admin duyệt. Không thể đổi lựa chọn."
                : "Chọn 1 gia sư bạn ưng ý. Sau khi xác nhận, lựa chọn sẽ được khóa cho tới khi admin duyệt."}
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 rounded-lg border-slate-300 text-slate-700"
            >
              Đóng
            </Button>
            {isClassOpen && !hasLockedSelection && (
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={selectingApplicant || !effectivePicked}
                className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {selectingApplicant ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Xác nhận chọn gia sư
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
