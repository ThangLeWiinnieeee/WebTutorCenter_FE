import { AlertTriangle, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

// Xác nhận xóa mềm người dùng (ẩn khỏi danh sách, giữ dữ liệu trong database).
const UserDeleteModal = ({ user, onClose, onConfirm, loading }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-delete-dialog-title"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
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
          <h2 id="user-delete-dialog-title" className="text-xl font-bold text-slate-900">
            Xóa mềm người dùng
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Tài khoản sẽ được ẩn khỏi danh sách và bị vô hiệu hóa, nhưng dữ liệu vẫn được giữ trong database.
          </p>
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
            className="h-10 rounded-lg bg-rose-600 px-5 font-semibold text-white hover:bg-rose-700"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Xóa mềm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDeleteModal;
