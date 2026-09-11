import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";

// Mỗi lần mở lại được remount mới (qua prop key ở nơi sử dụng) nên state luôn sạch.
const RejectDialog = ({ open, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  // Kiểm tra lý do rồi gửi lên component cha để từ chối đơn.
  const handleSubmit = () => {
    if (reason.trim().length < 5) {
      setError("Lý do phải có ít nhất 5 ký tự");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Modal onClose={onCancel}>
      <h2 className="text-lg font-bold text-slate-900">Từ chối đơn đăng ký</h2>
      <p className="mt-1 text-sm text-slate-500">Vui lòng nhập lý do để gia sư biết cần cải thiện điều gì.</p>
      <textarea
        className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        rows={4}
        placeholder="Nhập lý do từ chối (tối thiểu 5 ký tự)..."
        value={reason}
        onChange={(e) => {
          setReason(e.target.value);
          if (error) setError("");
        }}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      <div className="mt-5 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="h-9 rounded-lg border-slate-300 text-slate-700"
        >
          Hủy
        </Button>
        <Button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="h-9 rounded-lg bg-rose-600 px-4 font-semibold text-white hover:bg-rose-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xác nhận từ chối"}
        </Button>
      </div>
    </Modal>
  );
};

export default RejectDialog;
