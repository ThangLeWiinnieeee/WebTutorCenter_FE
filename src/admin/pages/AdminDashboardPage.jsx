import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Home,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDashboardStatsThunk, getPendingTutorsThunk } from "@/admin/store/adminThunks";

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getCurrentDateLabel = () =>
  new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const currentAreaLabel = (tutor) =>
  tutor.currentArea
    ? `${tutor.currentArea.districtName}, ${tutor.currentArea.provinceName}`
    : "Chưa cập nhật";

const StatCard = ({ to, icon, iconBg, value, label, description, loading }) => {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        {to && <ArrowRight className="h-4 w-4 text-slate-400" />}
      </div>
      <div className="mt-4">
        {loading ? (
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
        ) : (
          <p className="text-3xl font-bold text-slate-900">{formatNumber(value)}</p>
        )}
        <p className="mt-1 text-sm font-semibold text-slate-700">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1e3a5f]/30 hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {content}
    </div>
  );
};

const ProgressRow = ({ label, value, total, barClassName }) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full ${barClassName}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const PendingTutorItem = ({ tutor }) => (
  <Link
    to="/admin/tutors"
    className="grid grid-cols-[1fr_auto] gap-4 rounded-lg border border-slate-100 bg-white px-4 py-3 transition hover:border-[#1e3a5f]/20 hover:bg-slate-50"
  >
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        {tutor.avatar ? (
          <img
            src={tutor.avatar}
            alt={tutor.fullName}
            referrerPolicy="no-referrer"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white">
            {(tutor.fullName ?? "?")[0]}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{tutor.fullName || "Chưa có tên"}</p>
          <p className="truncate text-xs text-slate-500">{tutor.email || "Chưa có email"}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
          {tutor.subjects?.slice(0, 2).join(", ") || "Chưa có môn"}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
          {currentAreaLabel(tutor)}
        </span>
      </div>
    </div>
    <div className="text-right text-xs text-slate-500">
      <p>Ngày gửi</p>
      <p className="mt-1 font-semibold text-slate-700">{formatDate(tutor.createdAt)}</p>
    </div>
  </Link>
);

const QuickAction = ({ to, icon, title, description }) => (
  <Link
    to={to}
    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#1e3a5f]/25 hover:shadow-md"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#1e3a5f]">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
    </div>
  </Link>
);

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const {
    dashboardStats,
    statsLoading,
    pendingTutors,
    loading: pendingLoading,
    error,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getDashboardStatsThunk());
    dispatch(getPendingTutorsThunk({ page: 1, limit: 5 }));
  }, [dispatch]);

  const stats = dashboardStats || {};
  const pendingCount = stats.pendingCount || 0;
  const approvedCount = stats.approvedCount || 0;
  const rejectedCount = stats.rejectedCount || 0;
  const pendingClassApplicationsCount = stats.pendingClassApplicationsCount || 0;
  const totalProfiles = pendingCount + approvedCount + rejectedCount;
  const latestPendingTutors = useMemo(
    () => pendingTutors.slice(0, 5),
    [pendingTutors],
  );

  const handleRefresh = () => {
    dispatch(getDashboardStatsThunk());
    dispatch(getPendingTutorsThunk({ page: 1, limit: 5 }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{getCurrentDateLabel()}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Bảng điều khiển quản trị</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Theo dõi hàng chờ duyệt gia sư, tiến độ xử lý hồ sơ và các tác vụ quản trị quan trọng.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleRefresh}
              disabled={statsLoading || pendingLoading}
              className="h-10 rounded-lg border-slate-300 text-slate-700"
            >
              {statsLoading || pendingLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Làm mới
            </Button>
            <Button asChild className="h-10 rounded-lg bg-[#1e3a5f] text-white hover:bg-[#16304f]">
              <Link to="/admin/tutors">Duyệt hồ sơ</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={<BarChart3 className="h-6 w-6 text-[#1e3a5f]" />}
          iconBg="bg-blue-50"
          value={totalProfiles}
          label="Tổng hồ sơ gia sư"
          description="Tổng số hồ sơ đã ghi nhận trong hệ thống."
          loading={statsLoading}
        />
        <StatCard
          to="/admin/tutors"
          icon={<Clock className="h-6 w-6 text-amber-700" />}
          iconBg="bg-amber-100"
          value={pendingCount}
          label="Hồ sơ chờ duyệt"
          description="Cần kiểm tra và ra quyết định phê duyệt."
          loading={statsLoading}
        />
        <StatCard
          icon={<CheckCircle2 className="h-6 w-6 text-emerald-700" />}
          iconBg="bg-emerald-100"
          value={approvedCount}
          label="Đã phê duyệt"
          description="Tài khoản đã được kích hoạt vai trò gia sư."
          loading={statsLoading}
        />
        <StatCard
          icon={<XCircle className="h-6 w-6 text-rose-700" />}
          iconBg="bg-rose-100"
          value={rejectedCount}
          label="Đã từ chối"
          description="Hồ sơ không đạt yêu cầu hoặc cần bổ sung."
          loading={statsLoading}
        />
        <StatCard
          to="/admin/class-applications"
          icon={<BookOpen className="h-6 w-6 text-violet-700" />}
          iconBg="bg-violet-100"
          value={pendingClassApplicationsCount}
          label="Đơn nhận lớp chờ duyệt"
          description="Gia sư đã gửi yêu cầu nhận lớp, cần xét duyệt."
          loading={statsLoading}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hàng chờ duyệt gần nhất</h2>
              <p className="mt-1 text-sm text-slate-500">Ưu tiên xử lý các hồ sơ mới gửi.</p>
            </div>
            <Link
              to="/admin/tutors"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3a5f] hover:underline"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {pendingLoading && latestPendingTutors.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải hồ sơ chờ duyệt...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          ) : latestPendingTutors.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
              <ShieldCheck className="h-10 w-10 text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-slate-800">Không có hồ sơ đang chờ</p>
              <p className="mt-1 text-sm text-slate-500">Hàng chờ duyệt hiện đã được xử lý hết.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestPendingTutors.map((tutor) => (
                <PendingTutorItem key={tutor.id} tutor={tutor} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Tỷ lệ xử lý hồ sơ</h2>
            <p className="mt-1 text-sm text-slate-500">Dựa trên tổng hồ sơ gia sư hiện có.</p>
            <div className="mt-5 space-y-4">
              <ProgressRow
                label="Chờ duyệt"
                value={pendingCount}
                total={totalProfiles}
                barClassName="bg-amber-500"
              />
              <ProgressRow
                label="Đã phê duyệt"
                value={approvedCount}
                total={totalProfiles}
                barClassName="bg-emerald-500"
              />
              <ProgressRow
                label="Đã từ chối"
                value={rejectedCount}
                total={totalProfiles}
                barClassName="bg-rose-500"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Checklist vận hành</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <p className="text-slate-600">Kiểm tra chứng chỉ, môn dạy và khu vực hoạt động.</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <p className="text-slate-600">Ghi lý do cụ thể khi từ chối để gia sư có thể bổ sung.</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <p className="text-slate-600">Ưu tiên hồ sơ gửi lâu hoặc có nhiều môn đang thiếu gia sư.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Tác vụ nhanh</h2>
          <p className="text-sm text-slate-500">Các lối tắt thường dùng cho quản trị viên.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            to="/admin/users"
            icon={<UserCog className="h-5 w-5" />}
            title="Quản lý người dùng"
            description="Tìm kiếm, lọc và khóa hoặc mở khóa tài khoản người dùng."
          />
          <QuickAction
            to="/admin/tutors"
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="Duyệt hồ sơ gia sư"
            description="Xem chi tiết, phê duyệt hoặc từ chối hồ sơ đang chờ."
          />
          <QuickAction
            to="/tutors"
            icon={<Users className="h-5 w-5" />}
            title="Xem danh sách gia sư"
            description="Kiểm tra danh sách gia sư đang hiển thị phía người dùng."
          />
          <QuickAction
            to="/admin/class-applications"
            icon={<BookOpen className="h-5 w-5" />}
            title="Duyệt nhận lớp"
            description="Xem xét và phê duyệt yêu cầu nhận lớp từ gia sư."
          />
          <QuickAction
            to="/"
            icon={<Home className="h-5 w-5" />}
            title="Về trang chủ"
            description="Mở giao diện công khai để kiểm tra trải nghiệm người dùng."
          />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
