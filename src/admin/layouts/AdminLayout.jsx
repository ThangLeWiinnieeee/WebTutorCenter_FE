import { createElement, useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Users, LogOut, LayoutDashboard, ShieldAlert, UserCog, ClipboardCheck, Settings, Ticket, FileText, Trash2, UserCheck, Ban, BookOpen, Star, MessageSquare, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import useAuth from "@/features/auth/hooks/useAuth";
import { logoutThunk } from "@/features/auth/store/authThunks";
import { getDashboardStatsThunk } from "@/admin/store/adminThunks";
import { fetchAdminUnreadCountThunk } from "@/features/chat/store/chatThunks";
import { selectAdminUnreadTotal } from "@/features/chat/store/chatSlice";
import { getInitials } from "@/features/profile";
import { Button } from "@/components/ui/button";
import ScrollToTop from "@/components/shared/ScrollToTop";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";

const Badge = ({ count, collapsed }) => {
  if (!count) return null;
  const label = count > 99 ? "99+" : count;
  if (collapsed) {
    // Đặt ở góc trên-phải của cả nút (không phải trên icon) để số lượng không đè lên icon.
    return (
      <span className="pointer-events-none absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
        {label}
      </span>
    );
  }
  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
      {label}
    </span>
  );
};

const NavItem = ({ to, icon, label, active, badge = 0, collapsed }) => (
  <Link
    to={to}
    title={collapsed ? label : undefined}
    className={`relative flex items-center rounded-lg text-sm font-medium transition-colors
      ${collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2"}
      ${active
        ? "bg-[#1e3a5f] text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      }`}
  >
    <span className="shrink-0">
      {createElement(icon, { className: "h-4 w-4" })}
    </span>
    {!collapsed && (
      <>
        <span className="truncate">{label}</span>
        <Badge count={badge} />
      </>
    )}
    {/* Badge thu gọn: định vị theo cả nút (Link relative) ở góc trên-phải */}
    {collapsed && <Badge count={badge} collapsed />}
  </Link>
);

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { dashboardStats } = useSelector((state) => state.admin);
  const chatUnread = useSelector(selectAdminUnreadTotal);

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  const isAdmin = isAuthenticated && user?.role === "admin";

  // Lấy số lượng cần duyệt để hiển thị badge cạnh menu (chỉ khi là admin).
  useEffect(() => {
    if (isAdmin) dispatch(getDashboardStatsThunk());
  }, [dispatch, isAdmin]);

  // Số tin nhắn chưa đọc ban đầu cho badge menu "Tin nhắn"; socket tự cập nhật realtime.
  useEffect(() => {
    if (isAdmin) dispatch(fetchAdminUnreadCountThunk());
  }, [dispatch, isAdmin]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Không có quyền truy cập</h2>
          <p className="text-slate-500 text-sm mb-4">Bạn cần quyền quản trị viên để vào khu vực này.</p>
          <Button asChild size="sm" className="bg-[#1e3a5f] text-white hover:bg-[#16304f]">
            <Link to="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ScrollToTop />
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Logo + toggle */}
        <div
          className={`flex items-center border-b border-slate-100 px-3 py-4 ${
            collapsed ? "justify-center" : "gap-2.5"
          }`}
        >
          {!collapsed && (
            <>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f]">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1e3a5f] leading-tight truncate">WebTutorCenter</p>
                <p className="text-xs text-slate-500">Quản trị viên</p>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {!collapsed && (
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quản lý
            </p>
          )}
          <NavItem
            to="/admin"
            icon={LayoutDashboard}
            label="Tổng quan"
            active={location.pathname === "/admin"}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/users"
            icon={UserCog}
            label="Người dùng"
            active={location.pathname === "/admin/users"}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/messages"
            icon={MessageSquare}
            label="Tin nhắn"
            active={location.pathname === "/admin/messages"}
            badge={chatUnread}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/tutors"
            icon={Users}
            label="Duyệt gia sư"
            active={location.pathname === "/admin/tutors"}
            badge={dashboardStats?.pendingCount}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/class-applications"
            icon={ClipboardCheck}
            label="Duyệt nhận lớp"
            active={location.pathname === "/admin/class-applications"}
            badge={dashboardStats?.pendingClassApplicationsCount}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/profile-changes"
            icon={UserCheck}
            label="Duyệt đổi hồ sơ"
            active={location.pathname === "/admin/profile-changes"}
            badge={dashboardStats?.pendingProfileChangesCount}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/application-cancellations"
            icon={Ban}
            label="Quản lý hủy đơn"
            active={location.pathname === "/admin/application-cancellations"}
            badge={dashboardStats?.pendingCancellationsCount}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/classes"
            icon={FileText}
            label="Bài đăng"
            active={location.pathname === "/admin/classes"}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/promos"
            icon={Ticket}
            label="Mã ưu đãi"
            active={location.pathname === "/admin/promos"}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/subjects"
            icon={BookOpen}
            label="Quản lý môn học"
            active={location.pathname === "/admin/subjects"}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/reviews"
            icon={Star}
            label="Quản lý đánh giá"
            active={location.pathname === "/admin/reviews"}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/trash"
            icon={Trash2}
            label="Thùng rác"
            active={location.pathname === "/admin/trash"}
            collapsed={collapsed}
          />
          <NavItem
            to="/admin/settings"
            icon={Settings}
            label="Cấu hình chân trang"
            active={location.pathname === "/admin/settings"}
            collapsed={collapsed}
          />
        </nav>

        {/* User info */}
        <div className="border-t border-slate-100 p-3">
          <div
            className={`mb-2 flex items-center rounded-lg py-2 ${
              collapsed ? "justify-center px-0" : "gap-2.5 px-2"
            }`}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                referrerPolicy="no-referrer"
                title={collapsed ? user.fullName : undefined}
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-slate-200"
              />
            ) : (
              <div
                title={collapsed ? user.fullName : undefined}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white"
              >
                {getInitials(user.fullName)}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700">{user.fullName}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            title={collapsed ? "Đăng xuất" : undefined}
            className={`w-full gap-2 text-slate-600 hover:bg-red-50 hover:text-red-600 ${
              collapsed ? "justify-center px-0" : "justify-start"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Đăng xuất"}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-200 ${collapsed ? "ml-16" : "ml-60"}`}>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
