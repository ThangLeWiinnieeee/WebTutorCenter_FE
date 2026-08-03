import { Check, Loader2, X, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import { OCCUPATION_STATUS_LABEL } from "@/features/tutors/constants";
import { formatAvailabilitySlotsOneLine } from "@/features/classes/utils/classFormatters";
import {
  PROFILE_CHANGE_FIELD_LABELS as FIELD_LABELS,
  PROFILE_CHANGE_APPLICABLE_FIELDS as APPLICABLE_FIELDS,
} from "@/admin/constants";
import { StatusBadge, AvatarBlock } from "./ProfileChangeBadges";

// Field ảnh đơn / ảnh nhiều — hiển thị ảnh thay vì text
const SINGLE_IMAGE_FIELDS = new Set([
  "cccdFrontImage",
  "cccdBackImage",
  "studentCardFrontImage",
  "studentCardBackImage",
]);
const MULTI_IMAGE_FIELDS = new Set(["certificateImages", "publicCertificateImages"]);
// Kiểm tra một field trong yêu cầu đổi hồ sơ có phải dạng ảnh hay không.
const isImageField = (key) => SINGLE_IMAGE_FIELDS.has(key) || MULTI_IMAGE_FIELDS.has(key);

// Ảnh thu nhỏ, bấm vào để phóng to trong lightbox.
const ZoomThumb = ({ src, onZoom }) =>
  src ? (
    <button
      type="button"
      onClick={() => onZoom(src)}
      className="group relative block aspect-[16/10] w-full overflow-hidden rounded-md border border-slate-200 bg-slate-50"
    >
      <img src={src} alt="Ảnh giấy tờ" className="h-full w-full object-contain" />
      <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/40 group-hover:opacity-100">
        <ZoomIn className="h-4 w-4 text-white" />
      </span>
    </button>
  ) : (
    <div className="flex aspect-[16/10] w-full items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
      —
    </div>
  );

// Hiển thị giá trị của field dạng ảnh (một hoặc nhiều ảnh).
const ImageFieldValue = ({ fieldKey, value, onZoom }) => {
  if (MULTI_IMAGE_FIELDS.has(fieldKey)) {
    const list = Array.isArray(value) ? value : [];
    if (list.length === 0) return <p className="text-sm text-slate-400">—</p>;
    return (
      <div className="grid grid-cols-2 gap-2">
        {list.map((src) => (
          <ZoomThumb key={src} src={src} onZoom={onZoom} />
        ))}
      </div>
    );
  }
  return <ZoomThumb src={value} onZoom={onZoom} />;
};

// Đổi giá trị thô của field thành chuỗi hiển thị cho admin đối chiếu.
const formatFieldValue = (key, value) => {
  if (value == null) return "—";
  switch (key) {
    case "occupationStatus":
      return OCCUPATION_STATUS_LABEL[value] || value;
    case "teachingAreas": {
      const districts = (value.districts || [])
        .map((d) => d.name)
        .filter(Boolean)
        .join(", ");
      return `${value.provinceName || "?"}${districts ? ` (${districts})` : ""}`;
    }
    case "currentArea":
      return [value.districtName, value.provinceName].filter(Boolean).join(", ") || "—";
    case "availability":
      return formatAvailabilitySlotsOneLine(value);
    case "subjects":
      return Array.isArray(value) ? value.join(", ") : String(value);
    default:
      return String(value);
  }
};

// Modal chi tiết các thay đổi của một yêu cầu đổi hồ sơ
const ProfileChangeDetailModal = ({ request, acting, onClose, onApprove, onReject, onZoom }) => {
  const changeKeys = Object.keys(request.changes || {});
  return (
    <Modal
      onClose={onClose}
      closeOnBackdropClick
      overlayClassName="backdrop-blur-none"
      panelClassName="flex max-h-[88vh] max-w-2xl flex-col overflow-hidden rounded-2xl border-0 p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <AvatarBlock user={request.user} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{request.user?.fullName || "—"}</p>
            <p className="truncate text-xs text-slate-500">{request.user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={request.status} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Các thay đổi đề xuất
        </p>
        {changeKeys.length === 0 ? (
          <p className="text-sm text-slate-500">Không có thay đổi.</p>
        ) : (
          <div className="space-y-3">
            {changeKeys.map((key) => {
              const applicable = APPLICABLE_FIELDS.has(key);
              return (
                <div key={key} className="text-sm">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {FIELD_LABELS[key] || key}
                    </p>
                    {!applicable && (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Không thể đổi · sẽ không áp dụng
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="mb-0.5 text-[11px] text-slate-400">Hiện tại</p>
                      {isImageField(key) ? (
                        <ImageFieldValue fieldKey={key} value={request.current?.[key]} onZoom={onZoom} />
                      ) : (
                        <p className="whitespace-pre-wrap break-words text-slate-600">
                          {formatFieldValue(key, request.current?.[key])}
                        </p>
                      )}
                    </div>
                    <div
                      className={`rounded-lg border px-3 py-2 ${
                        applicable ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <p
                        className={`mb-0.5 text-[11px] ${applicable ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        {applicable ? "Đề xuất mới" : "Đề xuất mới (bị bỏ qua)"}
                      </p>
                      {isImageField(key) ? (
                        <ImageFieldValue fieldKey={key} value={request.changes[key]} onZoom={onZoom} />
                      ) : (
                        <p
                          className={`whitespace-pre-wrap break-words ${
                            applicable ? "text-emerald-800" : "text-amber-800 line-through"
                          }`}
                        >
                          {formatFieldValue(key, request.changes[key])}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {request.status === "rejected" && request.rejectionReason && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Lý do từ chối: {request.rejectionReason}
          </p>
        )}
      </div>

      {/* Footer actions */}
      {request.status === "pending" && (
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <Button
            type="button"
            onClick={() => onApprove(request)}
            disabled={acting}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {acting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Duyệt
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onReject(request)}
            disabled={acting}
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <X className="mr-2 h-4 w-4" />
            Từ chối
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default ProfileChangeDetailModal;
