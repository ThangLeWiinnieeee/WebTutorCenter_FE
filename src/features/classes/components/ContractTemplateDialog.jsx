import { useEffect, useRef } from "react";
import { Copy, Printer, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import ContractTemplate from "./ContractTemplate";
import { copyContract, printContract } from "../utils/contractActions";

// Modal hiển thị hợp đồng mẫu để gia sư đọc / sao chép / in ra rồi ký.
// Dùng cùng kiểu overlay tự dựng như ClassReceiveDialog (dự án không có primitive dialog).
const ContractTemplateDialog = ({ open, classCode, onClose }) => {
  const contentRef = useRef(null);

  // Đóng bằng phím Esc + khóa cuộn nền khi mở.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contract-dialog-title"
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150"
      >
        {/* Thanh tiêu đề + hành động */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 id="contract-dialog-title" className="text-base font-bold text-slate-900">
            Hợp đồng mẫu giao (nhận) lớp
          </h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => copyContract(contentRef.current)}
              className="h-9 gap-1.5 rounded-lg border-slate-300 px-3 text-slate-700"
            >
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Sao chép</span>
            </Button>
            <Button
              type="button"
              onClick={() => printContract(contentRef.current)}
              className="h-9 gap-1.5 rounded-lg bg-emerald-600 px-3 font-semibold text-white hover:bg-emerald-700"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">In hợp đồng</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="ml-1 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Nội dung hợp đồng (cuộn được) */}
        <div className="overflow-y-auto px-6 py-5">
          <ContractTemplate classCode={classCode} innerRef={contentRef} />
        </div>
      </div>
    </div>
  );
};

export default ContractTemplateDialog;
