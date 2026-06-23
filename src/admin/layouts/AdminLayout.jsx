import { createElement } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Users, LogOut, LayoutDashboard, ShieldAlert, UserCog, ClipboardCheck, Settings, Ticket, FileText, Trash2, UserCheck, Ban, BookOpen } from "lucide-react";
import { useDispatch } from "react-redux";

import useAuth from "@/features/auth/hooks/useAuth";
import { logoutThunk } from "@/features/auth/store/authThunks";
import { getInitials } from "@/features/profile";
import { Button } from "@/components/ui/button";

const NavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors
      ${active
        ? "bg-[#1e3a5f] text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      }`}
  >
    {createElement(icon, { className: "h-4 w-4 shrink-0" })}
    {label}
  </Link>
);

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== "admin") {
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
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f]">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1e3a5f] leading-tight">WebTutorCenter</p>
            <p className="text-xs text-slate-500">Quản trị viên</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quản lý
          </p>
          <NavItem
            to="/admin"
            icon={LayoutDashboard}
            label="Tổng quan"
            active={location.pathname === "/admin"}
          />
          <NavItem
            to="/admin/users"
            icon={UserCog}
            label="Người dùng"
            active={location.pathname === "/admin/users"}
          />
          <NavItem
            to="/admin/tutors"
            icon={Users}
            label="Duyệt gia sư"
            active={location.pathname === "/admin/tutors"}
          />
          <NavItem
            to="/admin/class-applications"
            icon={ClipboardCheck}
            label="Duyệt nhận lớp"
            active={location.pathname === "/admin/class-applications"}
          />
          <NavItem
            to="/admin/profile-changes"
            icon={UserCheck}
            label="Duyệt đổi hồ sơ"
            active={location.pathname === "/admin/profile-changes"}
          />
          <NavItem
            to="/admin/application-cancellations"
            icon={Ban}
            label="Quản lý hủy đơn"
            active={location.pathname === "/admin/application-cancellations"}
          />
          <NavItem
            to="/admin/classes"
            icon={FileText}
            label="Bài đăng"
            active={location.pathname === "/admin/classes"}
          />
          <NavItem
            to="/admin/promos"
            icon={Ticket}
            label="Mã ưu đãi"
            active={location.pathname === "/admin/promos"}
          />
          <NavItem
            to="/admin/subjects"
            icon={BookOpen}
            label="Quản lý môn học"
            active={location.pathname === "/admin/subjects"}
          />
          <NavItem
            to="/admin/trash"
            icon={Trash2}
            label="Thùng rác"
            active={location.pathname === "/admin/trash"}
          />
          <NavItem
            to="/admin/settings"
            icon={Settings}
            label="Cấu hình chân trang"
            active={location.pathname === "/admin/settings"}
          />
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 mb-2">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white">
                {getInitials(user.fullName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
