import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

// Mỗi lần mở lại được remount mới (qua prop key ở nơi sử dụng) nên state luôn sạch.
const RejectDialog = ({ open, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (reason.trim().length < 5) {
      setError("Lý do phải có ít nhất 5 ký tự");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-slate-900">Từ chối đơn đăng ký</h2>
        <p className="mt-1 text-sm text-slate-500">
          Vui lòng nhập lý do để gia sư biết cần cải thiện điều gì.
        </p>
        <textarea
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
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
      </div>
    </div>
  );
};

export default RejectDialog;
