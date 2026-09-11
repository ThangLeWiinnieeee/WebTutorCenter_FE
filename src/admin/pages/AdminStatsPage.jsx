import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart3, FileText, RefreshCw, TrendingUp, UserPlus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import adminService from "@/admin/services/adminService";
import StatLineChart from "@/admin/components/charts/StatLineChart";
import ChartCard from "@/admin/components/charts/ChartCard";
import {
  formatDayFull,
  formatDayTick,
  formatMonthTick,
  formatNumber,
  formatVnd,
  formatVndCompact,
} from "@/admin/utils/statsFormat";

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

// Trang thống kê chi tiết của khu vực quản trị.
export default function AdminStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Tải dữ liệu thống kê tổng hợp.
  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStatsSummary();
      setStats(res.data.data.stats);
    } catch {
      toast.error("Không tải được dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = stats?.totals || {};

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Thống kê</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Thống kê hệ thống</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Số lượng bài đăng, gia sư mới (30 ngày qua) và doanh thu phí nhận lớp (3 tháng gần nhất).
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

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryTile
          icon={<FileText className="h-5 w-5 text-blue-700" />}
          iconBg="bg-blue-50"
          label="Bài đăng (30 ngày)"
          value={formatNumber(totals.posts30d)}
        />
        <SummaryTile
          icon={<UserPlus className="h-5 w-5 text-emerald-700" />}
          iconBg="bg-emerald-50"
          label="Gia sư mới (30 ngày)"
          value={formatNumber(totals.newTutors30d)}
        />
        <SummaryTile
          icon={<Wallet className="h-5 w-5 text-violet-700" />}
          iconBg="bg-violet-50"
          label="Doanh thu phí (30 ngày)"
          value={formatVnd(totals.revenue30d)}
        />
      </section>

      <ChartCard
        icon={<FileText className="h-5 w-5 text-blue-700" />}
        iconBg="bg-blue-50"
        title="Số lượng bài đăng — 30 ngày qua"
        subtitle="Bài đăng tìm gia sư được tạo mỗi ngày."
        loading={loading}
      >
        <StatLineChart
          data={stats?.postsDaily || []}
          xKey="date"
          yKey="count"
          color="#2563eb"
          xTickFormatter={formatDayTick}
          tooltipLabelFormatter={formatDayFull}
          tooltipValueFormatter={formatNumber}
          valueName="Bài đăng"
        />
      </ChartCard>

      <ChartCard
        icon={<UserPlus className="h-5 w-5 text-emerald-700" />}
        iconBg="bg-emerald-50"
        title="Gia sư mới — 30 ngày qua"
        subtitle="Số hồ sơ gia sư đăng ký mỗi ngày."
        loading={loading}
      >
        <StatLineChart
          data={stats?.newTutorsDaily || []}
          xKey="date"
          yKey="count"
          color="#059669"
          xTickFormatter={formatDayTick}
          tooltipLabelFormatter={formatDayFull}
          tooltipValueFormatter={formatNumber}
          valueName="Gia sư mới"
        />
      </ChartCard>

      <ChartCard
        icon={<TrendingUp className="h-5 w-5 text-violet-700" />}
        iconBg="bg-violet-50"
        title="Doanh thu phí nhận lớp — 3 tháng gần nhất"
        subtitle="Tổng tiền gia sư chuyển phí nhận lớp (giao dịch thành công) theo tháng."
        loading={loading}
      >
        <StatLineChart
          data={stats?.revenueMonthly || []}
          xKey="month"
          yKey="amount"
          color="#7c3aed"
          dot={{ r: 4, strokeWidth: 0, fill: "#7c3aed" }}
          xTickFormatter={formatMonthTick}
          yTickFormatter={formatVndCompact}
          tooltipLabelFormatter={formatMonthTick}
          tooltipValueFormatter={formatVnd}
          valueName="Doanh thu"
        />
      </ChartCard>
    </div>
  );
}
