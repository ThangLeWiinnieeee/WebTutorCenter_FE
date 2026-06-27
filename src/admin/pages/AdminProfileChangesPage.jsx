import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Clock, Eye, Loader2, UserCheck, X, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";
import {
  getProfileChangesThunk,
  approveProfileChangeThunk,
  rejectProfileChangeThunk,
} from "@/admin/store/adminThunks";
import { OCCUPATION_STATUS_LABEL } from "@/features/tutors/constants";
import { formatAvailabilitySlotsOneLine, formatDateTime } from "@/features/classes/utils/classFormatters";
import { getInitials } from "@/features/profile";

const PAGE_SIZE = 10;

const TABS = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Đã từ chối" },
  { value: "all", label: "Tất cả" },
];

const FIELD_LABELS = {
  phone: "Số điện thoại liên hệ",
  occupationStatus: "Tình trạng nghề nghiệp",
  teachingAreas: "Khu vực giảng dạy",
  currentArea: "Khu vực hiện tại",
  bio: "Giới thiệu bản thân",
  availability: "Lịch giảng dạy",
  subjects: "Môn học giảng dạy",
  graduationYear: "Năm tốt nghiệp",
  cccdFrontImage: "CCCD mặt trước",
  cccdBackImage: "CCCD mặt sau",
  studentCardFrontImage: "Thẻ sinh viên mặt trước",
  studentCardBackImage: "Thẻ sinh viên mặt sau",
  certificateImages: "Bằng cấp",
};

// Field ảnh đơn / ảnh nhiều — hiển thị ảnh thay vì text
const SINGLE_IMAGE_FIELDS = new Set([
  "cccdFrontImage",
  "cccdBackImage",
  "studentCardFrontImage",
  "studentCardBackImage",
]);
const MULTI_IMAGE_FIELDS = new Set(["certificateImages"]);
const isImageField = (key) => SINGLE_IMAGE_FIELDS.has(key) || MULTI_IMAGE_FIELDS.has(key);

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

const ImageLightbox = ({ src, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4" onClick={onClose}>
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
      alt="Ảnh phóng to"
      className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const formatFieldValue = (key, value) => {
  if (value == null) return "—";
  switch (key) {
    case "occupationStatus":
      return OCCUPATION_STATUS_LABEL[value] || value;
    case "teachingAreas": {
      const districts = (value.districts || []).map((d) => d.name).filter(Boolean).join(", ");
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

const StatusBadge = ({ status }) => {
  const config = {
    pending: { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700 border-amber-200" },
    approved: { label: "Đã duyệt", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rejected: { label: "Đã từ chối", className: "bg-rose-50 text-rose-700 border-rose-200" },
  }[status] || { label: status, className: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
};

const AvatarBlock = ({ user, size = "md" }) => {
  const cls = size === "lg" ? "h-11 w-11" : "h-10 w-10";
  return user?.avatar ? (
    <img
      src={user.avatar}
      alt={user.fullName}
      referrerPolicy="no-referrer"
      className={`${cls} rounded-full object-cover ring-2 ring-slate-100`}
    />
  ) : (
    <div className={`flex ${cls} items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white`}>
      {getInitials(user?.fullName)}
    </div>
  );
};

// Modal chi tiết các thay đổi của một yêu cầu đổi hồ sơ
const DetailModal = ({ request, acting, onClose, onApprove, onReject, onZoom }) => {
  const changeKeys = Object.keys(request.changes || {});
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
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
              {changeKeys.map((key) => (
                <div key={key} className="text-sm">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {FIELD_LABELS[key] || key}
                  </p>
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
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                      <p className="mb-0.5 text-[11px] text-emerald-600">Đề xuất mới</p>
                      {isImageField(key) ? (
                        <ImageFieldValue fieldKey={key} value={request.changes[key]} onZoom={onZoom} />
                      ) : (
                        <p className="whitespace-pre-wrap break-words text-emerald-800">
                          {formatFieldValue(key, request.changes[key])}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
      </div>
    </div>
  );
};

export default function AdminProfileChangesPage() {
  const dispatch = useDispatch();
  const {
    profileChanges,
    profileChangesPagination,
    profileChangesCounts,
    profileChangesLoading,
    profileChangeActionLoading,
  } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [zoomSrc, setZoomSrc] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  useEffect(() => {
    dispatch(getProfileChangesThunk({ status: activeTab, page, limit: PAGE_SIZE }));
  }, [dispatch, activeTab, page]);

  const totalPages = profileChangesPagination?.totalPages || 1;

  const handleTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handlePageChange = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitReject = async () => {
    if (rejectReason.trim().length < 5) return;
    const result = await dispatch(
      rejectProfileChangeThunk({ id: rejectTarget.id, rejectionReason: rejectReason.trim() })
    );
    if (!result.error) {
      setRejectTarget(null);
      setRejectReason("");
    }
  };

  const handleApprove = async (req) => {
    const result = await dispatch(approveProfileChangeThunk(req.id));
    if (!result.error) setDetailTarget(null);
  };

  // Mở modal nhập lý do từ chối (đóng modal chi tiết để tránh chồng modal)
  const openReject = (req) => {
    setDetailTarget(null);
    setRejectTarget(req);
    setRejectReason("");
  };

  return (
    <div>
      {/* Heading */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e3a5f]/10 text-[#1e3a5f]">
          <UserCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Duyệt đổi hồ sơ gia sư</h1>
          <p className="text-sm text-slate-500">Xét duyệt các yêu cầu thay đổi thông tin hồ sơ của gia sư.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = profileChangesCounts[tab.value] ?? 0;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTab(tab.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {profileChangesLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {/* Empty */}
      {!profileChangesLoading && profileChanges.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
          Không có yêu cầu nào ở trạng thái này.
        </div>
      )}

      {/* List (gọn): avatar, họ tên, email, tình trạng nghề nghiệp + nút xem chi tiết */}
      {!profileChangesLoading && profileChanges.length > 0 && (
        <div className="space-y-3">
          {profileChanges.map((req) => {
            const occupation = OCCUPATION_STATUS_LABEL[req.current?.occupationStatus] || "—";
            const changeCount = Object.keys(req.changes || {}).length;
            return (
              <div
                key={req.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <AvatarBlock user={req.user} size="lg" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{req.user?.fullName || "—"}</p>
                  <p className="truncate text-xs text-slate-500">{req.user?.email}</p>
                </div>

                <div className="hidden min-w-[140px] sm:block">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Tình trạng</p>
                  <p className="text-sm font-medium text-slate-700">{occupation}</p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={req.status} />
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(req.createdAt)}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDetailTarget(req)}
                  className="h-9 border-blue-200 px-3 text-xs text-blue-600 hover:bg-blue-50"
                >
                  <Eye className="mr-1.5 h-4 w-4" />
                  Xem chi tiết
                  <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-50 px-1.5 text-[11px] font-semibold text-blue-600">
                    {changeCount}
                  </span>
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {!profileChangesLoading && profileChanges.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="pt-6"
        />
      )}

      {/* Detail modal */}
      {detailTarget && (
        <DetailModal
          request={detailTarget}
          acting={profileChangeActionLoading === detailTarget.id}
          onClose={() => setDetailTarget(null)}
          onApprove={handleApprove}
          onReject={openReject}
          onZoom={setZoomSrc}
        />
      )}

      {zoomSrc && <ImageLightbox src={zoomSrc} onClose={() => setZoomSrc(null)} />}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Từ chối yêu cầu</h3>
            <p className="mt-1 text-sm text-slate-500">
              Nhập lý do từ chối yêu cầu đổi hồ sơ của {rejectTarget.user?.fullName}.
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Lý do từ chối (ít nhất 5 ký tự)..."
              className="mt-3 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:border-slate-400 focus-visible:outline-none"
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setRejectTarget(null)}>
                Hủy
              </Button>
              <Button
                type="button"
                onClick={submitReject}
                disabled={rejectReason.trim().length < 5 || profileChangeActionLoading === rejectTarget.id}
                className="bg-rose-600 text-white hover:bg-rose-700"
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
