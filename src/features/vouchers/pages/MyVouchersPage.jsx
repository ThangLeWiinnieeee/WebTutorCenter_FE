import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Check, Copy, Loader2, Ticket } from "lucide-react";

import Pagination from "@/components/shared/Pagination";
import { fetchMyVouchersThunk } from "@/features/vouchers/store/voucherThunks";

const PAGE_SIZE = 10;

const STATUS_META = {
  active: { label: "Còn hiệu lực", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  used: { label: "Đã dùng", className: "bg-slate-100 text-slate-500 border-slate-200" },
  expired: { label: "Hết hạn", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

const formatPrice = (value) => `${(value || 0).toLocaleString("vi-VN")}đ`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "—");

const discountLabel = (v) =>
  v.discountType === "percent"
    ? `Giảm ${v.discountValue}%${v.maxDiscountAmount ? ` (tối đa ${formatPrice(v.maxDiscountAmount)})` : ""}`
    : `Giảm ${formatPrice(v.discountValue)}`;

const VoucherCard = ({ voucher }) => {
  const [copied, setCopied] = useState(false);
  const meta = STATUS_META[voucher.status] || STATUS_META.active;
  const usable = voucher.status === "active";

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      toast.success("Đã sao chép mã");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Không sao chép được mã");
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
        usable ? "border-emerald-200" : "border-slate-200 opacity-80"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${usable ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
          <Ticket className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-bold tracking-wider text-slate-900">{voucher.code}</span>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.className}`}>
              {meta.label}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-emerald-700">{discountLabel(voucher)}</p>
          {voucher.description && <p className="mt-0.5 text-xs text-slate-500">{voucher.description}</p>}
          <p className="mt-0.5 text-xs text-slate-400">Hạn dùng đến {formatDate(voucher.expiresAt)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={copyCode}
        disabled={!usable}
        className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition ${
          usable
            ? "border-slate-200 text-slate-700 hover:bg-slate-50"
            : "cursor-not-allowed border-slate-200 text-slate-400"
        }`}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        {copied ? "Đã chép" : "Sao chép"}
      </button>
    </div>
  );
};

export default function MyVouchersPage() {
  const dispatch = useDispatch();
  const { items, pagination, loading } = useSelector((state) => state.vouchers);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchMyVouchersThunk({ page, limit: PAGE_SIZE }));
  }, [dispatch, page]);

  const totalPages = pagination?.totalPages || 1;
  const handlePageChange = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Ticket className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kho mã giảm giá</h1>
          <p className="text-sm text-slate-500">Mã giảm giá bạn nhận được khi hoàn thành lớp học.</p>
        </div>
      </div>

      {loading && items.length === 0 && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Ticket className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-slate-700">Chưa có mã giảm giá nào</p>
          <p className="max-w-md text-sm text-slate-500">
            Hoàn thành một lớp học (cả bạn và đối phương cùng xác nhận) để nhận mã giảm giá nhé.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((voucher) => (
            <VoucherCard key={voucher.id} voucher={voucher} />
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} className="pt-6" />
      )}
    </div>
  );
}
