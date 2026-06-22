import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  BookOpen,
  Loader2,
  RefreshCw,
  RotateCcw,
  Ticket,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getTrashCountsThunk,
  getTrashItemsThunk,
  restoreTrashItemThunk,
  purgeTrashItemThunk,
} from "@/admin/store/adminThunks";
import { formatPrice, formatDateTime } from "@/features/classes/utils/classFormatters";

const PAGE_SIZE = 10;

const TABS = [
  { key: "users", label: "Người dùng", icon: Users },
  { key: "classes", label: "Bài đăng", icon: BookOpen },
  { key: "promos", label: "Mã ưu đãi", icon: Ticket },
];

const ROLE_LABEL = { admin: "Quản trị", tutor: "Gia sư", user: "Người dùng" };

const PURGE_COPY = {
  users: "Tài khoản sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.",
  classes: "Bài đăng cùng toàn bộ đơn nhận lớp liên quan sẽ bị xóa vĩnh viễn.",
  promos: "Mã ưu đãi sẽ bị xóa vĩnh viễn khỏi hệ thống.",
};

// Mô tả ngắn của item theo loại — dùng trong modal xác nhận xóa vĩnh viễn
const describeItem = (type, item) => {
  if (type === "users") return item.fullName || item.email;
  if (type === "classes") return `#${item.classCode} · ${item.subject}`;
  return item.code;
};

const ConfirmPurgeModal = ({ type, item, onClose, onConfirm, loading }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-700">
            <AlertTriangle className="h-6 w-6" />
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

        <div className="mt-5 space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Xóa vĩnh viễn</h2>
          <p className="text-sm leading-relaxed text-slate-600">{PURGE_COPY[type]} Hành động này không thể hoàn tác.</p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">{describeItem(type, item)}</p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-10 rounded-lg bg-rose-600 px-5 font-semibold text-white hover:bg-rose-700"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Xóa vĩnh viễn
          </Button>
        </div>
      </div>
    </div>
  );
};

const PrimaryCell = ({ type, item }) => {
  if (type === "users") {
    return (
      <div>
        <p className="text-sm font-semibold text-slate-800">{item.fullName}</p>
        <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">{item.email}</p>
      </div>
    );
  }
  if (type === "classes") {
    return (
      <div>
        <p className="text-sm font-bold text-slate-800">
          #{item.classCode}
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {item.subject}
          </span>
        </p>
        <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{item.summary}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-sm font-bold text-slate-800">{item.code}</p>
      {item.description && <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{item.description}</p>}
    </div>
  );
};

const SecondaryCell = ({ type, item }) => {
  if (type === "users") {
    return <span className="text-sm text-slate-600">{ROLE_LABEL[item.role] || item.role}</span>;
  }
  if (type === "classes") {
    return (
      <span className="text-sm text-slate-600">
        {item.createdBy?.fullName || item.createdBy?.email || "Người dùng đã xóa"}
      </span>
    );
  }
  return (
    <span className="text-sm text-slate-600">
      {item.discountType === "percent"
        ? `Giảm ${item.discountValue}%`
        : `Giảm ${formatPrice(item.discountValue)}`}
    </span>
  );
};

const SECONDARY_HEADER = { users: "Vai trò", classes: "Người đăng", promos: "Giảm giá" };

const AdminTrashPage = () => {
  const dispatch = useDispatch();
  const { trashItems, trashPagination, trashLoading, trashError, trashActionLoading, trashCounts } = useSelector(
    (state) => state.admin,
  );

  const [activeTab, setActiveTab] = useState("users");
  const [page, setPage] = useState(1);
  const [purgeTarget, setPurgeTarget] = useState(null);

  const params = useMemo(() => ({ page, limit: PAGE_SIZE }), [page]);

  const refetch = () => {
    dispatch(getTrashItemsThunk({ type: activeTab, params }));
    dispatch(getTrashCountsThunk());
  };

  useEffect(() => {
    dispatch(getTrashItemsThunk({ type: activeTab, params }));
  }, [dispatch, activeTab, params]);

  useEffect(() => {
    dispatch(getTrashCountsThunk());
  }, [dispatch]);

  const handleTabChange = (key) => {
    if (key === activeTab) return;
    setActiveTab(key);
    setPage(1);
  };

  const handleRestore = async (item) => {
    const result = await dispatch(restoreTrashItemThunk({ type: activeTab, id: item.id }));
    if (restoreTrashItemThunk.fulfilled.match(result)) {
      dispatch(getTrashCountsThunk());
      if (trashItems.length === 1 && page > 1) setPage((current) => current - 1);
    }
  };

  const handleConfirmPurge = async () => {
    if (!purgeTarget) return;
    const result = await dispatch(purgeTrashItemThunk({ type: activeTab, id: purgeTarget.id }));
    if (purgeTrashItemThunk.fulfilled.match(result)) {
      setPurgeTarget(null);
      dispatch(getTrashCountsThunk());
      if (trashItems.length === 1 && page > 1) setPage((current) => current - 1);
    }
  };

  const totalPages = trashPagination?.totalPages || 1;
  const totalItems = trashPagination?.totalItems || 0;
  const startIndex = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
              <Trash2 className="h-4 w-4" />
              Thùng rác
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Thùng rác</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Các mục đã xóa được giữ tại đây. Bạn có thể <strong>khôi phục</strong> hoặc{" "}
              <strong>xóa vĩnh viễn</strong>. Xóa vĩnh viễn sẽ không thể hoàn tác.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={refetch}
            disabled={trashLoading}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            {trashLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Làm mới
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const active = tab.key === activeTab;
            const count = trashCounts?.[tab.key] || 0;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {TABS.find((t) => t.key === activeTab)?.label} đã xóa
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Hiển thị {startIndex}–{endIndex} / {totalItems} mục
            </p>
          </div>
          {trashLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
        </div>

        {trashError ? (
          <div className="m-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{trashError}</div>
        ) : trashLoading && trashItems.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tải thùng rác...
          </div>
        ) : trashItems.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <Trash2 className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Thùng rác trống</p>
            <p className="mt-1 text-sm text-slate-500">Không có mục nào đã xóa trong mục này.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Thông tin</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{SECONDARY_HEADER[activeTab]}</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Thời điểm xóa</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {trashItems.map((item) => {
                  const busy = trashActionLoading === item.id;
                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <PrimaryCell type={activeTab} item={item} />
                      </td>
                      <td className="px-5 py-4">
                        <SecondaryCell type={activeTab} item={item} />
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(item.deletedAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => handleRestore(item)}
                            className="rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                            Khôi phục
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => setPurgeTarget(item)}
                            className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa vĩnh viễn
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm">
          <p className="text-slate-500">
            Trang {trashPagination?.page || page}/{totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || trashLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border-slate-300 text-slate-700"
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || trashLoading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-lg border-slate-300 text-slate-700"
            >
              Sau
            </Button>
          </div>
        </div>
      </section>

      <ConfirmPurgeModal
        type={activeTab}
        item={purgeTarget}
        onClose={() => setPurgeTarget(null)}
        onConfirm={handleConfirmPurge}
        loading={Boolean(purgeTarget && trashActionLoading === purgeTarget.id)}
      />
    </div>
  );
};

export default AdminTrashPage;
