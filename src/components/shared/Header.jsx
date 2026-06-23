import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ClipboardList, FileText, GraduationCap, LogOut, Ticket, UserRound } from "lucide-react";
import { useDispatch } from "react-redux";

import useAuth from "@/features/auth/hooks/useAuth";
import { logoutThunk } from "@/features/auth/store/authThunks";
import { getInitials } from "@/features/profile";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import { NAV_LINKS } from "@/constants/navigation";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isTutor = user?.role === "tutor";

  const navLinks = NAV_LINKS.filter(
    (item) =>
      !(item.hideForTutor && user?.role === "tutor") &&
      !(item.showForTutorOnly && user?.role !== "tutor")
  );

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
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
          <span className="hidden text-xl font-bold text-[#1e3a5f] sm:inline">WebTutorCenter</span>
        </Link>

        <nav className="hidden items-center justify-center gap-9 lg:flex">
          {navLinks.map((item) => {
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

              {/* User menu */}
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 ${
                    menuOpen ? "bg-slate-100" : ""
                  }`}
                >
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
                  <span className="hidden text-sm font-medium text-slate-700 sm:block">{user.fullName}</span>
                  <ChevronDown
                    className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                  >
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-800">{user.fullName}</p>
                      {user.email && <p className="truncate text-xs text-slate-400">{user.email}</p>}
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <UserRound className="h-4 w-4 text-slate-400" />
                      Thông tin cá nhân
                    </Link>

                    {isTutor && (
                      <Link
                        to="/my-classes"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <ClipboardList className="h-4 w-4 text-slate-400" />
                        Danh sách nhận lớp
                      </Link>
                    )}

                    <Link
                      to="/my-posts"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <FileText className="h-4 w-4 text-slate-400" />
                      Danh sách bài đăng
                    </Link>

                    <Link
                      to="/my-vouchers"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Ticket className="h-4 w-4 text-slate-400" />
                      Kho mã giảm giá
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
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
