import { useEffect, useState, startTransition } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import settingsService from "@/services/settingsService";

const Facebook = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const DEFAULT_FOOTER = {
  address: "54 Nguyễn Lương Bằng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng",
  phone: "093 143 9203",
  email: "contact@webtutor.vn",
  facebookLink: "https://facebook.com/webtutor",
  zaloLink: "https://zalo.me/0931439203",
};

const Footer = () => {
  const [data, setData] = useState(DEFAULT_FOOTER);

  useEffect(() => {
    settingsService
      .getFooter()
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          startTransition(() => {
            setData(res.data.data);
          });
        }
      })
      .catch(() => {
        // Fallback to default
      });
  }, []);

  return (
    <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Logo & Intro */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-lg font-bold text-white tracking-wide">
                WebTutorCenter
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Mạng lưới kết nối gia sư chuyên nghiệp và uy tín hàng đầu. Đồng hành cùng học viên trên con đường chinh phục tri thức.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Lối tắt</h3>
            <ul className="grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
              </li>
              <li>
                <Link to="/classes" className="hover:text-white transition-colors">Lớp cần gia sư</Link>
              </li>
              <li>
                <Link to="/find-tutor" className="hover:text-white transition-colors">Tìm gia sư</Link>
              </li>
              <li>
                <Link to="/tutors" className="hover:text-white transition-colors">Danh sách gia sư</Link>
              </li>
              <li>
                <Link to="/register-tutor" className="hover:text-white transition-colors">Trở thành gia sư</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-orange-500 mt-0.5" />
                <span className="leading-relaxed">{data.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-orange-500" />
                <a href={`tel:${data.phone}`} className="hover:text-white transition-colors">{data.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-orange-500" />
                <a href={`mailto:${data.email}`} className="hover:text-white transition-colors">{data.email}</a>
              </li>
              <li className="flex items-center gap-4 pt-2">
                {data.facebookLink && (
                  <a
                    href={data.facebookLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
                    aria-label="Facebook Page"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {data.zaloLink && (
                  <a
                    href={data.zaloLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
                    aria-label="Zalo Contact"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs">
          <p>&copy; {new Date().getFullYear()} WebTutorCenter. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:underline">Điều khoản dịch vụ</Link>
            <Link to="#" className="hover:underline">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
