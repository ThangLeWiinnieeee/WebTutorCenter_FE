import { Loader2 } from "lucide-react";

// Khung thẻ chứa 1 biểu đồ: tiêu đề + mô tả + vùng vẽ (tự xử lý loading).
const ChartCard = ({ icon, iconBg, title, subtitle, headerRight, loading, height = 280, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {headerRight}
    </div>
    {loading ? (
      <div className="flex items-center justify-center text-sm text-slate-400" style={{ height }}>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Đang tải biểu đồ...
      </div>
    ) : (
      children
    )}
  </div>
);

export default ChartCard;
