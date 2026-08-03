import { GraduationCap } from "lucide-react";
import { createElement } from "react";
import { Link } from "react-router-dom";
import { AUTH_PANEL_FEATURES } from "@/features/auth/constants";

const STATS = [
  { value: "500+", label: "Gia sư" },
  { value: "10K+", label: "Học viên" },
  { value: "4.9★", label: "Đánh giá" },
];

// Panel giới thiệu bên trái của các trang xác thực.
const AuthLeftPanel = () => (
  <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-brand via-[#1b3556] to-[#0e2038] px-14 py-12 lg:flex lg:w-[52%]">
    {/* Ambient floating blobs — single blue accent family */}
    <div className="animate-float-slow pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-400/15 blur-2xl" />
    <div className="animate-float-slower pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-sky-400/10 blur-2xl" />
    <div className="animate-float-slow pointer-events-none absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-blue-500/15 blur-2xl" />

    {/* Subtle grid overlay */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }}
    />

    {/* Grain overlay */}
    <div className="noise-overlay opacity-[0.08] mix-blend-overlay" />

    {/* Logo */}
    <Link
      to="/"
      data-aos="fade-up"
      className="relative z-10 flex w-fit items-center gap-3 transition-opacity hover:opacity-90"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
        <GraduationCap className="h-6 w-6 text-white" />
      </div>
      <span className="text-xl font-bold tracking-wide text-white">WebTutorCenter</span>
    </Link>

    {/* Headline */}
    <div className="relative z-10 space-y-8">
      <div className="space-y-3">
        <h1
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-[2.6rem] font-extrabold leading-[1.08] tracking-tight text-white"
        >
          Học tập hiệu quả
          <br />
          <span className="bg-linear-to-r from-sky-200 to-blue-300 bg-clip-text text-transparent">
            cùng gia sư giỏi
          </span>
        </h1>
        <p
          data-aos="fade-up"
          data-aos-delay="200"
          className="max-w-sm text-base leading-relaxed text-blue-100/80"
        >
          Nền tảng kết nối học sinh với gia sư uy tín, giúp bạn nắm vững kiến thức và đạt kết quả tốt nhất.
        </p>
      </div>

      {/* Feature list */}
      <ul className="space-y-3">
        {AUTH_PANEL_FEATURES.map(({ icon: IconComponent, text }, i) => (
          <li
            key={text}
            data-aos="fade-up"
            data-aos-delay={300 + i * 100}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-colors duration-200 hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
              {createElement(IconComponent, { className: "h-4 w-4 text-blue-200" })}
            </div>
            <span className="text-sm text-blue-50">{text}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Stats + copyright */}
    <div data-aos="fade-up" data-aos-delay="500" className="relative z-10 space-y-6">
      <div className="flex items-center gap-5">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-5">
            {i > 0 && <span className="h-8 w-px bg-white/15" />}
            <div>
              <p className="text-xl font-bold tabular-nums text-white">{stat.value}</p>
              <p className="text-xs text-blue-200/70">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-blue-200/50">
        © {new Date().getFullYear()} WebTutorCenter · Tất cả quyền được bảo lưu
      </p>
    </div>
  </div>
);

export default AuthLeftPanel;
