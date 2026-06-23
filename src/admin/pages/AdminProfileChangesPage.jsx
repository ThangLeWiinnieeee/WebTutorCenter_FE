import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Clock, Loader2, UserCheck, X } from "lucide-react";

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
};

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

  return (
    <div className="mx-auto max-w-5xl">
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

      {/* List */}
      {!profileChangesLoading && profileChanges.length > 0 && (
        <div className="space-y-4">
          {profileChanges.map((req) => {
            const acting = profileChangeActionLoading === req.id;
            const changeKeys = Object.keys(req.changes || {});
            return (
              <div key={req.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {/* Tutor info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {req.user?.avatar ? (
                      <img
                        src={req.user.avatar}
                        alt={req.user.fullName}
                        referrerPolicy="no-referrer"
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white">
                        {getInitials(req.user?.fullName)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{req.user?.fullName || "—"}</p>
                      <p className="text-xs text-slate-500">{req.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={req.status} />
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(req.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Diff */}
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  {changeKeys.map((key) => (
                    <div key={key} className="text-sm">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {FIELD_LABELS[key] || key}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="mb-0.5 text-[11px] text-slate-400">Hiện tại</p>
                          <p className="whitespace-pre-wrap break-words text-slate-600">
                            {formatFieldValue(key, req.current?.[key])}
                          </p>
                        </div>
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                          <p className="mb-0.5 text-[11px] text-emerald-600">Đề xuất mới</p>
                          <p className="whitespace-pre-wrap break-words text-emerald-800">
                            {formatFieldValue(key, req.changes[key])}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rejection reason (nếu đã từ chối) */}
                {req.status === "rejected" && req.rejectionReason && (
                  <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    Lý do từ chối: {req.rejectionReason}
                  </p>
                )}

                {/* Actions (chỉ khi pending) */}
                {req.status === "pending" && (
                  <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
                    <Button
                      type="button"
                      onClick={() => dispatch(approveProfileChangeThunk(req.id))}
                      disabled={acting}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {acting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      Duyệt
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRejectTarget(req);
                        setRejectReason("");
                      }}
                      disabled={acting}
                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Từ chối
                    </Button>
                  </div>
                )}
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
