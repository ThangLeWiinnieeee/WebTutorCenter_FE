import { createElement } from "react";
import { X } from "lucide-react";

import Modal from "@/components/shared/Modal";

import { formatAvailabilitySlotsDetailed } from "@/features/classes/utils/classFormatters";

// Khung modal + các dòng thông tin dùng chung cho ClassDetailModal / TutorDetailModal.

// Khung modal dùng chung: lớp phủ, tiêu đề và nút đóng.
export const ModalShell = ({ title, icon, onClose, children }) => (
  <Modal onClose={onClose} labelledBy="modal-shell-title" panelClassName="max-w-lg p-0">
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <div id="modal-shell-title" className="flex items-center gap-2 text-sm font-bold text-brand">
        {createElement(icon, { className: "h-4 w-4" })}
        {title}
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
    <div className="px-5 py-4">{children}</div>
  </Modal>
);

// Dòng thông tin dạng nhãn - giá trị trong modal.
export const InfoRow = ({ label, children }) => (
  <p className="text-sm">
    <span className="font-semibold text-slate-400">{label}:</span>{" "}
    <span className="text-slate-700">{children}</span>
  </p>
);

// Hiển thị lịch rảnh/lịch học dưới dạng các chip theo ngày.
export const SlotChips = ({ slots, tone = "slate" }) => {
  if (!slots || slots.length === 0) return <span className="text-slate-500">—</span>;
  const toneCls =
    tone === "blue" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-white text-slate-700 border-slate-200";
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {formatAvailabilitySlotsDetailed(slots)
        .split("\n")
        .map((line, idx) => (
          <span key={idx} className={`rounded border px-2 py-0.5 text-[11px] font-medium ${toneCls}`}>
            {line}
          </span>
        ))}
    </div>
  );
};
