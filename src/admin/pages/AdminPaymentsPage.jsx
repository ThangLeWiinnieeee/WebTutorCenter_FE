import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, CreditCard, Inbox, ListChecks, RefreshCw, Wallet, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";
import adminService from "@/admin/services/adminService";
import { formatNumber, formatVnd } from "@/admin/utils/statsFormat";
import { formatDateTime } from "@/lib/format";

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

const STATUS_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "success", label: "Thành công" },
  { value: "failed", label: "Thất bại" },
  { value: "pending", label: "Đang xử lý" },
];

const PROVIDERS = [
  { value: "all", label: "Tất cả cổng" },
  { value: "vnpay", label: "VNPay" },
  { value: "momo", label: "MoMo" },
  { value: "zalopay", label: "ZaloPay" },
];

// Ô hiển thị một chỉ số tổng hợp kèm icon.
const SummaryTile = ({ icon, iconBg, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
    <div className="min-w-0">
      <p className="truncate text-xs font-medium text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

// Trang admin theo dõi các khoản thanh toán phí nhận lớp.
export default function AdminPaymentsPage() {
  const [data, setData] = useState({
    payments: [],
    pagination: { totalPages: 1 },
    counts: {},
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("all");
  const [provider, setProvider] = useState("all");
  const [page, setPage] = useState(1);

  // Tải danh sách thanh toán theo bộ lọc hiện tại.
  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAdminPayments({ page, limit: PAGE_SIZE, status, provider });
      setData(res.data.data);
    } catch {
      toast.error("Không tải được danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, provider]);

  const counts = data.counts || {};
  const payments = data.payments || [];
  const totalPages = data.pagination?.totalPages || 1;

  // Đổi bộ lọc theo trạng thái thanh toán.
  const changeStatus = (value) => {
    setStatus(value);
    setPage(1);
  };
  // Đổi bộ lọc theo cổng thanh toán.
  const changeProvider = (value) => {
    setProvider(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Thanh toán</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Thanh toán phí nhận lớp</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Toàn bộ giao dịch gia sư chuyển phí nhận lớp qua các cổng thanh toán.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={load}
            disabled={loading}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          icon={<Wallet className="h-5 w-5 text-emerald-700" />}
          iconBg="bg-emerald-50"
          label="Doanh thu (thành công)"
          value={formatVnd(data.totalRevenue)}
        />
        <SummaryTile
          icon={<ListChecks className="h-5 w-5 text-brand" />}
          iconBg="bg-blue-50"
          label="Tổng giao dịch"
          value={formatNumber(counts.all)}
        />
        <SummaryTile
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
          iconBg="bg-emerald-50"
          label="Thành công"
          value={formatNumber(counts.success)}
        />
        <SummaryTile
          icon={<XCircle className="h-5 w-5 text-rose-700" />}
          iconBg="bg-rose-50"
          label="Thất bại"
          value={formatNumber(counts.failed)}
        />
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const active = status === tab.value;
            const count = tab.value === "all" ? counts.all : counts[tab.value];
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => changeStatus(tab.value)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand/30"
                }`}
              >
                {tab.label}
                <span
                  className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {formatNumber(count)}
                </span>
              </button>
            );
          })}
        </div>
        <select
          value={provider}
          onChange={(e) => changeProvider(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-brand focus:outline-none"
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && payments.length === 0 ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse bg-slate-50" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold text-slate-700">Chưa có giao dịch nào</p>
            <p className="max-w-md text-sm text-slate-500">
              Chưa có gia sư nào thanh toán phí nhận lớp ở bộ lọc này.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Gia sư</th>
                  <th className="px-4 py-3">Mã lớp / Môn</th>
                  <th className="px-4 py-3">Cổng</th>
                  <th className="px-4 py-3 text-right">Số tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => {
                  const meta = STATUS_META[p.status] || STATUS_META.pending;
                  const StatusIcon = meta.icon;
                  const tutor = p.tutor || {};
                  const classItem = p.classItem || {};
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {tutor.avatar ? (
                            <img
                              src={tutor.avatar}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                              {(tutor.fullName || "?")[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800">{tutor.fullName || "—"}</p>
                            <p className="truncate text-xs text-slate-500">{tutor.email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{classItem.classCode || "—"}</p>
                        <p className="text-xs text-slate-500">{classItem.subject || ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {p.providerLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatVnd(p.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <p>Tạo: {formatDateTime(p.createdAt)}</p>
                        {p.paidAt && <p className="text-emerald-600">TT: {formatDateTime(p.paidAt)}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {payments.length > 0 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="pt-1" />
      )}
    </div>
  );
}
