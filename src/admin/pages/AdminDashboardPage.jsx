import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { getDashboardStatsThunk } from "@/admin/store/adminThunks";

const StatCard = ({ to, icon, iconBg, value, label, loading }) => {
  const Wrapper = to ? Link : "div";
  const wrapperProps = to
    ? { to, className: "flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#1e3a5f]/30 transition-all" }
    : { className: "flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" };

  return (
    <Wrapper {...wrapperProps}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
      <div>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        ) : (
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        )}
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Wrapper>
  );
};

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { dashboardStats, statsLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getDashboardStatsThunk());
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Tổng quan</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          to="/admin/tutors"
          icon={<Clock className="h-6 w-6 text-amber-700" />}
          iconBg="bg-amber-100"
          value={dashboardStats.pendingCount}
          label="Hồ sơ chờ duyệt"
          loading={statsLoading}
        />
        <StatCard
          icon={<CheckCircle2 className="h-6 w-6 text-emerald-700" />}
          iconBg="bg-emerald-100"
          value={dashboardStats.approvedCount}
          label="Đã phê duyệt"
          loading={statsLoading}
        />
        <StatCard
          icon={<XCircle className="h-6 w-6 text-rose-700" />}
          iconBg="bg-rose-100"
          value={dashboardStats.rejectedCount}
          label="Đã từ chối"
          loading={statsLoading}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
