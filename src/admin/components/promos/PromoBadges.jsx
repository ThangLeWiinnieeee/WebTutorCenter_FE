import { CheckCircle2, Percent, Tag, XCircle } from "lucide-react";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );

export const DiscountBadge = ({ promo }) =>
  promo.discountType === "percent" ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
      <Percent className="h-3.5 w-3.5" />
      Giảm {promo.discountValue}%
      {promo.maxDiscountAmount != null && (
        <span className="font-normal text-violet-500">(tối đa {formatPrice(promo.maxDiscountAmount)})</span>
      )}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <Tag className="h-3.5 w-3.5" />
      Giảm {formatPrice(promo.discountValue)}
    </span>
  );

export const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
      active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"
    }`}
  >
    {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
    {active ? "Đang bật" : "Đã tắt"}
  </span>
);
