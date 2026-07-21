import { AlertTriangle, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";

// Hộp thoại xác nhận xóa dùng chung cho admin (người dùng, bài đăng, mã ưu đãi,
// đánh giá, thùng rác). Trước đây 5 file chép lại gần như y hệt khung này, chỉ khác
// tiêu đề / mô tả / khối tóm tắt đối tượng / nhãn nút.
//
// `children` là khối tóm tắt đối tượng sắp xóa (tên, mã lớp, nội dung đánh giá…).
const ConfirmDeleteModal = ({
  open,
  title,
  description,
  confirmLabel,
  confirmIcon,
  onClose,
  onConfirm,
  loading,
  children,
}) => {
  if (!open) return null;

  return (
    <Modal onClose={onClose} labelledBy="confirm-delete-title">
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
        <h2 id="confirm-delete-title" className="text-xl font-bold text-slate-900">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>

      {children && (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">{children}</div>
      )}

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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmIcon}
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
