import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock, Eye, Loader2, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import Pagination from "@/components/shared/Pagination";
import {
  getProfileChangesThunk,
  approveProfileChangeThunk,
  rejectProfileChangeThunk,
} from "@/admin/store/adminThunks";
import { OCCUPATION_STATUS_LABEL } from "@/features/tutors/constants";
import { formatDateTime } from "@/features/classes/utils/classFormatters";
import { ADMIN_PAGE_SIZE as PAGE_SIZE } from "@/admin/constants";
import { StatusBadge, AvatarBlock } from "@/admin/components/profileChanges/ProfileChangeBadges";
import ImageLightbox from "@/components/shared/ImageLightbox";
import ProfileChangeDetailModal from "@/admin/components/profileChanges/ProfileChangeDetailModal";

const TABS = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Đã từ chối" },
  { value: "all", label: "Tất cả" },
];

// Trang admin duyệt/từ chối yêu cầu đổi hồ sơ của gia sư.
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

  // Đổi tab lọc theo trạng thái và quay về trang đầu.
  const handleTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Chuyển trang danh sách.
  const handlePageChange = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Gửi từ chối yêu cầu đổi hồ sơ kèm lý do.
  const submitReject = async () => {
    if (rejectReason.trim().length < 5) return;
    const result = await dispatch(
      rejectProfileChangeThunk({ id: rejectTarget.id, rejectionReason: rejectReason.trim() }),
    );
    if (!result.error) {
      setRejectTarget(null);
      setRejectReason("");
    }
  };

  // Duyệt một yêu cầu đổi hồ sơ.
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
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
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
                  ? "border-brand bg-brand text-white"
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
        <ProfileChangeDetailModal
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
        <Modal
          onClose={() => setRejectTarget(null)}
          overlayClassName="bg-black/40 backdrop-blur-none"
          panelClassName="rounded-2xl border-0 shadow-xl"
        >
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
        </Modal>
      )}
    </div>
  );
}
