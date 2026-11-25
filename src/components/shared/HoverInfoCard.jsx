// Thẻ hiển thị thông tin chi tiết khi hover (không phụ thuộc thư viện ngoài).
export default function HoverInfoCard({ trigger, title, items = [], badge }) {
  const validItems = items.filter((item) => item && item.value);

  return (
    <div className="group/hover relative inline-block max-w-full">
      <div className="cursor-help underline decoration-slate-300 decoration-dashed underline-offset-4 transition-colors group-hover/hover:text-indigo-700 group-hover/hover:decoration-indigo-400">
        {trigger}
      </div>

      {validItems.length > 0 && (
        <div className="pointer-events-none invisible absolute left-0 top-full z-50 mt-1.5 w-72 translate-y-1 rounded-xl border border-slate-200 bg-white p-3.5 opacity-0 shadow-xl ring-1 ring-slate-900/5 transition-all duration-150 group-hover/hover:pointer-events-auto group-hover/hover:visible group-hover/hover:translate-y-0 group-hover/hover:opacity-100">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
            <p className="text-xs font-bold text-slate-900">{title}</p>
            {badge && (
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                {badge}
              </span>
            )}
          </div>
          <dl className="mt-2 space-y-1.5 text-xs">
            {validItems.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-2">
                <dt className="shrink-0 text-slate-400">{item.label}:</dt>
                <dd className="text-right font-medium text-slate-700 break-words">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
