import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ChevronRight, ClipboardList, FileText, LogOut, Ticket } from "lucide-react";

import { logoutThunk } from "@/features/auth/store/authThunks";

const ProfileMenu = ({ isTutor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = [
    ...(isTutor
      ? [
          {
            to: "/my-classes",
            label: "Danh sách nhận lớp",
            desc: "Các lớp bạn đã gửi yêu cầu nhận",
            icon: ClipboardList,
          },
        ]
      : []),
    {
      to: "/my-posts",
      label: "Danh sách bài đăng",
      desc: "Bài đăng tìm gia sư bạn đã tạo",
      icon: FileText,
    },
    {
      to: "/my-vouchers",
      label: "Kho mã giảm giá",
      desc: "Mã giảm giá bạn đã nhận",
      icon: Ticket,
    },
  ];

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
              <p className="truncate text-xs text-slate-500">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          </Link>
        );
      })}

      {/* Đăng xuất — đặt dưới danh sách bài đăng */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-rose-50"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
          <LogOut className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-rose-600">Đăng xuất</p>
          <p className="truncate text-xs text-slate-500">Thoát khỏi tài khoản hiện tại</p>
        </div>
      </button>
    </div>
  );
};

export default ProfileMenu;
