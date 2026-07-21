import { Loader2, Lock, Unlock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";

// Xác nhận khóa / mở khóa tài khoản người dùng.
const UserStatusModal = ({ user, onClose, onConfirm, loading }) => {
  if (!user) return null;

  const nextActive = !user.isActive;
  const title = nextActive ? "Mở khóa tài khoản" : "Khóa tài khoản";
  const description = nextActive
    ? "Người dùng sẽ có thể đăng nhập và tiếp tục sử dụng hệ thống."
    : "Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa lại.";

  return (
    <Modal onClose={onClose} labelledBy="user-status-dialog-title">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
            nextActive
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {nextActive ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
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
        <h2 id="user-status-dialog-title" className="text-xl font-bold text-slate-900">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>

      <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">{user.fullName || "Chưa cập nhật"}</p>
        <p className="mt-1 text-xs text-slate-500">{user.email}</p>
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
          className={`h-10 rounded-lg px-5 font-semibold text-white ${
            nextActive ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {nextActive ? "Mở khóa" : "Khóa tài khoản"}
        </Button>
      </div>
    </Modal>
  );
};

export default UserStatusModal;
