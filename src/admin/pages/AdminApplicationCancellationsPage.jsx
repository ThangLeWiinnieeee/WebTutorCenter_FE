import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ban, Check, Clock, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";
import {
  getApplicationCancellationsThunk,
  approveCancellationThunk,
  rejectCancellationThunk,
} from "@/admin/store/adminThunks";
import { formatDateTime } from "@/features/classes/utils/classFormatters";
import { getInitials } from "@/features/profile";

const PAGE_SIZE = 10;

const TABS = [
  { value: "cancel_requested", label: "Chờ duyệt hủy" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "all", label: "Tất cả" },
];

const StatusBadge = ({ status }) => {
  const config = {
    cancel_requested: { label: "Chờ duyệt hủy", className: "bg-orange-50 text-orange-700 border-orange-200" },
    cancelled: { label: "Đã hủy", className: "bg-slate-100 text-slate-600 border-slate-200" },
  }[status] || { label: status, className: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
};

export default function AdminApplicationCancellationsPage() {
  const dispatch = useDispatch();
  const {
    cancellations,
    cancellationsPagination,
    cancellationsCounts,
    cancellationsLoading,
    cancellationActionLoading,
  } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("cancel_requested");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    dispatch(getApplicationCancellationsThunk({ status: activeTab, page, limit: PAGE_SIZE }));
  }, [dispatch, activeTab, page]);

  const totalPages = cancellationsPagination?.totalPages || 1;

  const handleTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handlePageChange = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitReject = async () => {
    const result = await dispatch(
      rejectCancellationThunk({ id: rejectTarget.id, rejectionReason: rejectReason.trim() })
    );
    if (!result.error) {
      setRejectTarget(null);
      setRejectReason("");
    }
  };

  return (
    <div>
      {/* Heading */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e3a5f]/10 text-[#1e3a5f]">
          <Ban className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý hủy đơn nhận lớp</h1>
          <p className="text-sm text-slate-500">Duyệt yêu cầu hủy lớp đã nhận và theo dõi các đơn đã hủy.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = cancellationsCounts[tab.value] ?? 0;
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
      {cancellationsLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {/* Empty */}
      {!cancellationsLoading && cancellations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
          Không có đơn nào ở trạng thái này.
        </div>
      )}

      {/* List */}
      {!cancellationsLoading && cancellations.length > 0 && (
        <div className="space-y-4">
          {cancellations.map((item) => {
            const acting = cancellationActionLoading === item.id;
            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.tutor?.avatar ? (
                      <img
                        src={item.tutor.avatar}
                        alt={item.tutor.fullName}
                        referrerPolicy="no-referrer"
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white">
                        {getInitials(item.tutor?.fullName)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.tutor?.fullName || "—"}</p>
                      <p className="text-xs text-slate-500">{item.tutor?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={item.status} />
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(item.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                  <p className="text-slate-700">
                    <span className="text-slate-400">Lớp: </span>
                    <span className="font-medium">Mã {item.classItem?.classCode} · {item.classItem?.subject}</span>
                  </p>
                  <div className="rounded-lg bg-orange-50 px-3 py-2 text-orange-800">
                    <span className="text-xs font-semibold uppercase tracking-wide text-orange-500">Lý do hủy</span>
                    <p className="mt-0.5 whitespace-pre-wrap break-words">{item.cancellationReason || "—"}</p>
                  </div>
                </div>

                {item.status === "cancel_requested" && (
                  <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
                    <Button
                      type="button"
                      onClick={() => dispatch(approveCancellationThunk(item.id))}
                      disabled={acting}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {acting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      Duyệt hủy
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRejectTarget(item);
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

      {!cancellationsLoading && cancellations.length > 0 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} className="pt-6" />
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Từ chối yêu cầu hủy</h3>
            <p className="mt-1 text-sm text-slate-500">
              Gia sư {rejectTarget.tutor?.fullName} sẽ vẫn giữ lớp này. Bạn có thể nêu lý do (không bắt buộc).
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Lý do từ chối (không bắt buộc)..."
              className="mt-3 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:border-slate-400 focus-visible:outline-none"
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setRejectTarget(null)}>
                Hủy
              </Button>
              <Button
                type="button"
                onClick={submitReject}
                disabled={cancellationActionLoading === rejectTarget.id}
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
