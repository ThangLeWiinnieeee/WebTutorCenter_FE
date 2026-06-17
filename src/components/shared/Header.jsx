import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";

import useAuth from "@/features/auth/hooks/useAuth";
import { logoutThunk } from "@/features/auth/store/authThunks";
import { getInitials } from "@/features/profile";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/features/notifications/components/NotificationBell";

const NAV_LINKS = [
  { label: "Trang chủ", to: "/", paths: ["/"] },
  { label: "Lớp cần gia sư", to: "/classes", paths: ["/classes"] },
  { label: "Tìm gia sư", to: "/find-tutor", paths: ["/find-tutor"] },
  { label: "Danh sách gia sư", to: "/tutors", paths: ["/tutors"] },
  { label: "Trở thành gia sư", to: "/register-tutor", paths: ["/register-tutor"] },
];

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e3a5f]">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <span className="hidden text-xl font-bold text-[#1e3a5f] sm:inline">
            WebTutorCenter
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-9 lg:flex">
          {NAV_LINKS.map((item) => {
            const isActive = item.hash
              ? location.hash === item.hash
              : item.paths?.some((path) =>
                  path === "/" ? location.pathname === path : location.pathname.startsWith(path)
                );

            return (
              <Link
                key={item.label}
                to={item.to}
                className={`relative py-2 text-sm font-semibold transition-colors ${
                  isActive ? "text-[#1e3a5f]" : "text-slate-700 hover:text-[#1e3a5f]"
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-0 -bottom-0.5 h-0.5 bg-orange-500 transition-all ${
                    isActive ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center justify-end gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Notification bell */}
              <NotificationBell />

              {/* User info */}
              <Link to="/profile" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white ring-2 ring-slate-200">
                    {getInitials(user.fullName)}
                  </div>
                )}
                <span className="hidden text-sm font-medium text-slate-700 sm:block">
                  {user.fullName}
                </span>
              </Link>

              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#1e3a5f] px-5 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[#1e3a5f]/5"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
