import { AlertTriangle, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const ClassDeleteModal = ({ classItem, onClose, onConfirm, loading }) => {
  if (!classItem) return null;

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
          <h2 className="text-xl font-bold text-slate-900">Xóa bài đăng</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Bài đăng sẽ bị xóa vĩnh viễn cùng với{" "}
            <span className="font-semibold text-slate-800">{classItem.applicationsCount || 0}</span> đơn nhận lớp
            liên quan. Hành động này không thể hoàn tác.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">
            #{classItem.classCode} · {classItem.subject}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{classItem.summary}</p>
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
            Xóa bài đăng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClassDeleteModal;
