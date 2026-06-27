import { createElement, useState } from "react";
import { useDispatch } from "react-redux";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User2,
  X,
  XCircle,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";

import { approveTutorThunk, rejectTutorThunk } from "@/admin/store/adminThunks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OCCUPATION_STATUS_LABEL } from "@/features/tutors/constants";
import { formatAvailabilitySlotsDetailed } from "@/features/classes/utils/classFormatters";

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    {createElement(icon, {
      className: "mt-0.5 h-4 w-4 shrink-0 text-slate-400",
    })}
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  </div>
);

const TutorAvatar = ({ tutor, size = "md" }) => {
  const sizeClass = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const textClass = size === "lg" ? "text-sm" : "text-xs";

  return tutor.avatar ? (
    <img
      src={tutor.avatar}
      alt={tutor.fullName}
      referrerPolicy="no-referrer"
      className={`${sizeClass} rounded-full object-cover ring-2 ring-slate-200`}
    />
  ) : (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-full bg-[#1e3a5f] ${textClass} font-bold text-white ring-2 ring-slate-200`}
    >
      {(tutor.fullName ?? "?")[0]}
    </div>
  );
};

const currentAreaLabel = (tutor) =>
  tutor.currentArea
    ? `${tutor.currentArea.districtName}, ${tutor.currentArea.provinceName}`
    : "—";

const teachingAreasLabel = (tutor) =>
  tutor.teachingAreas
    ? `${tutor.teachingAreas.provinceName}: ${
        tutor.teachingAreas.districts?.map((d) => d.name).join(", ") || "—"
      }`
    : "—";

// Ô ảnh giấy tờ trong modal chi tiết — nhấn để phóng to
const DocumentThumb = ({ label, src, onZoom }) => (
  <div className="space-y-1.5">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    {src ? (
      <button
        type="button"
        onClick={() => onZoom(src)}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
      >
        <img src={src} alt={label} className="h-full w-full object-contain" />
        <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/40 group-hover:opacity-100">
          <ZoomIn className="h-6 w-6 text-white" />
        </span>
      </button>
    ) : (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
        Chưa cung cấp
      </div>
    )}
  </div>
);

// Nhóm nhiều ảnh giấy tờ (thẻ sinh viên / bằng cấp) — mỗi ảnh nhấn để phóng to
const DocumentImageGroup = ({ label, images, onZoom }) => {
  const list = Array.isArray(images) ? images : [];
  if (list.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-500">
        {label} <span className="text-slate-400">({list.length})</span>
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => onZoom(src)}
            className="group relative block aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
          >
            <img src={src} alt={`${label} ${index + 1}`} className="h-full w-full object-contain" />
            <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/40 group-hover:opacity-100">
              <ZoomIn className="h-5 w-5 text-white" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Lớp phủ phóng to ảnh giấy tờ
const ImageLightbox = ({ src, onClose }) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4"
    onClick={onClose}
  >
    <button
      type="button"
      onClick={onClose}
      aria-label="Đóng ảnh phóng to"
      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
    >
      <X className="h-5 w-5" />
    </button>
    <img
      src={src}
      alt="Ảnh giấy tờ phóng to"
      className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const TutorDetailModal = ({ tutor, onClose }) => {
  const [zoomSrc, setZoomSrc] = useState(null);

  return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`tutor-detail-${tutor.id}`}
      className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <TutorAvatar tutor={tutor} size="lg" />
          <div className="min-w-0">
            <h2
              id={`tutor-detail-${tutor.id}`}
              className="truncate text-base font-semibold text-slate-800"
            >
              {tutor.fullName}
            </h2>
            <p className="truncate text-sm text-slate-500">{tutor.email}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Đóng chi tiết"
          className="h-8 w-8 text-slate-400 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="max-h-[calc(90vh-72px)] overflow-y-auto p-6">
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <InfoItem icon={Phone} label="Điện thoại" value={tutor.phone} />
          <InfoItem
            icon={User2}
            label="Tình trạng nghề nghiệp"
            value={OCCUPATION_STATUS_LABEL[tutor.occupationStatus]}
          />
          <InfoItem icon={GraduationCap} label="Trường học" value={tutor.schoolName} />
          <InfoItem
            icon={GraduationCap}
            label="Năm tốt nghiệp"
            value={tutor.graduationYear?.toString()}
          />
          <InfoItem icon={BookOpen} label="Môn học" value={tutor.subjects?.join(", ")} />
          <InfoItem icon={MapPin} label="Khu vực hiện tại" value={currentAreaLabel(tutor)} />
          <div className="sm:col-span-2">
            <InfoItem icon={MapPin} label="Khu vực có thể dạy" value={teachingAreasLabel(tutor)} />
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-start gap-2.5">
            <User2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-xs font-medium text-slate-500">Giới thiệu bản thân</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {tutor.bio || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Lịch giảng dạy</p>
              {tutor.availability?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {formatAvailabilitySlotsDetailed(tutor.availability)
                    .split("\n")
                    .map((line, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                      >
                        {line}
                      </span>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">—</p>
              )}
            </div>
          </div>
        </div>

        {/* Hình ảnh chứng thực (CCCD / bằng cấp) — nhấn ảnh để phóng to */}
        <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <IdCard className="h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-xs font-medium text-slate-500">Hình ảnh chứng thực</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <DocumentThumb
              label="CCCD mặt trước"
              src={tutor.cccdFrontImage}
              onZoom={setZoomSrc}
            />
            <DocumentThumb
              label="CCCD mặt sau"
              src={tutor.cccdBackImage}
              onZoom={setZoomSrc}
            />
          </div>
          {(tutor.studentCardFrontImage || tutor.studentCardBackImage) && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DocumentThumb
                label="Thẻ sinh viên mặt trước"
                src={tutor.studentCardFrontImage}
                onZoom={setZoomSrc}
              />
              <DocumentThumb
                label="Thẻ sinh viên mặt sau"
                src={tutor.studentCardBackImage}
                onZoom={setZoomSrc}
              />
            </div>
          )}
          {tutor.certificateImages?.length > 0 && (
            <div className="mt-4">
              <DocumentImageGroup
                label="Bằng cấp"
                images={tutor.certificateImages}
                onZoom={setZoomSrc}
              />
            </div>
          )}
        </div>
      </div>
    </div>

    {zoomSrc && <ImageLightbox src={zoomSrc} onClose={() => setZoomSrc(null)} />}
  </div>
  );
};

const RejectForm = ({ reason, reasonError, isActioning, onReasonChange, onSubmit, onCancel }) => (
  <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50/50 p-3">
    <Input
      placeholder="Nhập lý do từ chối (tối thiểu 5 ký tự)..."
      value={reason}
      onChange={(e) => onReasonChange(e.target.value)}
      className="h-9 bg-white"
    />
    {reasonError && <p className="mt-1 text-xs text-rose-500">{reasonError}</p>}
    <div className="mt-2 flex gap-2">
      <Button
        type="button"
        size="sm"
        onClick={onSubmit}
        disabled={isActioning}
        className="bg-rose-600 text-white hover:bg-rose-700"
      >
        {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
        Xác nhận từ chối
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onCancel}>
        Hủy
      </Button>
    </div>
  </div>
);

const TutorApprovalCard = ({ tutor, isActioning, index, onActionComplete }) => {
  const dispatch = useDispatch();
  const [rejectMode, setRejectMode] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const handleApprove = async () => {
    const result = await dispatch(approveTutorThunk(tutor.id));
    if (!result.error) {
      toast.success(`Đã phê duyệt gia sư ${tutor.fullName}`);
      onActionComplete?.();
    } else {
      toast.error(result.payload);
    }
  };

  const handleReject = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      setReasonError("Lý do từ chối phải có ít nhất 5 ký tự");
      return;
    }

    const result = await dispatch(
      rejectTutorThunk({ id: tutor.id, rejectionReason: reason.trim() })
    );

    if (!result.error) {
      toast.success(`Đã từ chối hồ sơ của ${tutor.fullName}`);
      setRejectMode(false);
      setReason("");
      onActionComplete?.();
    } else {
      toast.error(result.payload);
    }
  };

  const submittedAt = tutor.createdAt
    ? new Date(tutor.createdAt).toLocaleDateString("vi-VN")
    : "—";

  const rowBg = index % 2 === 0 ? "bg-white" : "bg-slate-50/50";

  return (
    <>
      <div className={`border-b border-slate-100 px-5 py-3.5 last:border-b-0 ${rowBg}`}>
        <div className="grid items-center gap-x-4 gap-y-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr]">
          <div className="flex min-w-0 items-center gap-3">
            <TutorAvatar tutor={tutor} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{tutor.fullName}</p>
              <p className="truncate text-xs text-slate-500">{tutor.email}</p>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-400 lg:hidden">Môn học</p>
            <p className="truncate text-sm text-slate-700">
              {tutor.subjects?.join(", ") || "—"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-400 lg:hidden">Khu vực</p>
            <p className="truncate text-sm text-slate-700">
              {currentAreaLabel(tutor)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 lg:hidden">Ngày gửi</p>
            <p className="text-sm text-slate-700">{submittedAt}</p>
          </div>

          <div className="flex items-center gap-1.5 lg:justify-end">
            <button
              type="button"
              onClick={() => setDetailOpen(true)}
              aria-label={`Xem chi tiết hồ sơ ${tutor.fullName}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              <Eye className="h-4 w-4" />
            </button>
            <Button
              type="button"
              size="sm"
              onClick={handleApprove}
              disabled={isActioning}
              className="h-8 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
            >
              {isActioning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Duyệt
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setRejectMode((prev) => !prev)}
              disabled={isActioning}
              className="h-8 border-rose-200 px-3 text-xs text-rose-600 hover:bg-rose-50"
            >
              <XCircle className="h-3.5 w-3.5" />
              Từ chối
            </Button>
          </div>
        </div>

        {rejectMode && (
          <RejectForm
            reason={reason}
            reasonError={reasonError}
            isActioning={isActioning}
            onReasonChange={(val) => {
              setReason(val);
              setReasonError("");
            }}
            onSubmit={handleReject}
            onCancel={() => {
              setRejectMode(false);
              setReason("");
              setReasonError("");
            }}
          />
        )}
      </div>

      {detailOpen && (
        <TutorDetailModal tutor={tutor} onClose={() => setDetailOpen(false)} />
      )}
    </>
  );
};

export default TutorApprovalCard;
