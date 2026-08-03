import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, Inbox, ReceiptText, RefreshCw, XCircle } from "lucide-react";

import paymentService from "@/features/payments/services/paymentService";
import { formatDateTime, formatPrice } from "@/features/classes/utils/classFormatters";
import Pagination from "@/components/shared/Pagination";

const PAGE_SIZE = 10;

const STATUS_META = {
  success: {
    label: "Thành công",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  failed: { label: "Thất bại", icon: XCircle, className: "border-rose-200 bg-rose-50 text-rose-700" },
  pending: { label: "Đang xử lý", icon: Clock, className: "border-amber-200 bg-amber-50 text-amber-700" },
};

// Trang lịch sử thanh toán phí nhận lớp của gia sư.
export default function MyPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Tải danh sách thanh toán theo trang.
  const load = async (targetPage) => {
    setLoading(true);
    try {
      const res = await paymentService.mine({ page: targetPage, limit: PAGE_SIZE });
      setPayments(res.data.data.payments || []);
      setPagination(res.data.data.pagination || { totalPages: 1 });
    } catch {
      toast.error("Không tải được lịch sử thanh toán");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  // Chuyển trang danh sách thanh toán.
  const handlePageChange = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header band */}
      <div className="border-b border-slate-200 bg-linear-to-r from-brand to-[#2c5282]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-2 text-emerald-300">
            <ReceiptText className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Hóa đơn thanh toán</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">Lịch sử phí nhận lớp</h1>
          <p className="mt-1 text-sm text-white/80">
            Các lần bạn chuyển tiền phí nhận lớp qua cổng thanh toán.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => load(page)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>

        {loading && payments.length === 0 && (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        )}

        {!loading && payments.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold text-slate-700">Chưa có hóa đơn nào</p>
            <p className="max-w-md text-sm text-slate-500">
              Hóa đơn sẽ xuất hiện sau khi bạn thanh toán phí nhận lớp cho một lớp đã được duyệt.
            </p>
          </div>
        )}

        {payments.length > 0 && (
          <div className="space-y-3">
            {payments.map((p) => {
              const meta = STATUS_META[p.status] || STATUS_META.pending;
              const StatusIcon = meta.icon;
              const classItem = p.classItem || {};
              return (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        Mã lớp {classItem.classCode || "-"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {p.providerLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      Phí nhận lớp{classItem.subject ? ` · Môn ${classItem.subject}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Tạo lúc {formatDateTime(p.createdAt)}
                      {p.paidAt ? ` · Thanh toán lúc ${formatDateTime(p.paidAt)}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">Mã giao dịch: {p.txnRef}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Số tiền</p>
                    <p className="text-xl font-bold text-emerald-700">{formatPrice(p.amount)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {payments.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={pagination?.totalPages || 1}
            onPageChange={handlePageChange}
            className="pt-4"
          />
        )}
      </div>
    </div>
  );
}
