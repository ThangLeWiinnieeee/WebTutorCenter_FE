import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";

import useAuth from "@/features/auth/hooks/useAuth";
import { logoutThunk } from "@/features/auth/store/authThunks";
import { getInitials } from "@/features/profile";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/features/notifications/components/NotificationBell";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#1e3a5f]">WebTutorCenter</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            to="/lop-moi"
            className="hidden md:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#1e3a5f] border border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/5 transition-colors"
          >
            Lớp mới
          </Link>

          {isAuthenticated && user ? (
            <>
              <Link
                to="/tim-gia-su"
                className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#1e3a5f] border border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/5 transition-colors"
              >
                Tìm gia sư
              </Link>

              {/* Tutor registration link (only for regular users) */}
              {user.role === "user" && (
                <Link
                  to="/register-tutor"
                  className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#1e3a5f] border border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/5 transition-colors"
                >
                  Trở thành gia sư
                </Link>
              )}

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
            <Button
              asChild
              size="sm"
              className="bg-[#1e3a5f] text-white hover:bg-[#16304f]"
            >
              <Link to="/login">Đăng nhập</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
