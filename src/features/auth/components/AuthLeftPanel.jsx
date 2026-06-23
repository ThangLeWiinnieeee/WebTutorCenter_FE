import { GraduationCap } from "lucide-react";
import { createElement } from "react";
import { Link } from "react-router-dom";
import { AUTH_PANEL_FEATURES } from "@/features/auth/constants";

const AuthLeftPanel = () => (
  <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-[#1e3a5f] px-14 py-12 relative overflow-hidden">
    {/* Decorative circles */}
    <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
    <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-white/5" />
    <div className="absolute -bottom-16 left-1/4 w-56 h-56 rounded-full bg-white/5" />

    {/* Logo */}
    <Link to="/" className="relative z-10 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
        <GraduationCap className="h-6 w-6 text-white" />
      </div>
      <span className="text-xl font-bold text-white tracking-wide">
        WebTutorCenter
      </span>
    </Link>

    {/* Headline */}
    <div className="relative z-10 space-y-6">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-white leading-tight">
          Học tập hiệu quả<br />
          <span className="text-blue-300">cùng gia sư giỏi</span>
        </h1>
        <p className="text-blue-100/80 text-base leading-relaxed max-w-sm">
          Nền tảng kết nối học sinh với gia sư uy tín, giúp bạn nắm vững
          kiến thức và đạt kết quả tốt nhất.
        </p>
      </div>

      {/* Feature list */}
      <ul className="space-y-4">
        {AUTH_PANEL_FEATURES.map(({ icon: IconComponent, text }) => (
          <li key={text} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              {createElement(IconComponent, { className: "h-4 w-4 text-blue-200" })}
            </div>
            <span className="text-blue-100 text-sm">{text}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Copyright */}
    <p className="relative z-10 text-blue-200/50 text-xs">
      © {new Date().getFullYear()} WebTutorCenter · Tất cả quyền được bảo lưu
    </p>
  </div>
);

export default AuthLeftPanel;
