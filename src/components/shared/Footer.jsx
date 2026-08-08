import { Link } from "react-router-dom";
import { GraduationCap, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import useSiteSettings from "@/hooks/useSiteSettings";

// Icon Facebook dạng SVG inline (lucide-react không có sẵn icon này).
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

const phoneHref = (phone) => `tel:${phone.replace(/[^+\d]/g, "")}`;

// Chân trang: lấy thông tin liên hệ động từ settings trong database.
const Footer = () => {
  const { data } = useSiteSettings();
  const phones = [...new Set([data.phone, data.phone2].filter(Boolean))];

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
              <span className="text-lg font-bold text-white tracking-wide">WebTutorCenter</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Mạng lưới kết nối gia sư chuyên nghiệp và uy tín hàng đầu. Đồng hành cùng học viên trên con
              đường chinh phục tri thức.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Lối tắt</h3>
            <ul className="grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/classes" className="hover:text-white transition-colors">
                  Lớp cần gia sư
                </Link>
              </li>
              <li>
                <Link to="/find-tutor" className="hover:text-white transition-colors">
                  Tìm gia sư
                </Link>
              </li>
              <li>
                <Link to="/tutors" className="hover:text-white transition-colors">
                  Danh sách gia sư
                </Link>
              </li>
              <li>
                <Link to="/register-tutor" className="hover:text-white transition-colors">
                  Trở thành gia sư
                </Link>
              </li>
              <li>
                <Link to="/contract-template" className="hover:text-white transition-colors">
                  Hợp đồng mẫu
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              {data.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-orange-500 mt-0.5" />
                  <span className="leading-relaxed">{data.address}</span>
                </li>
              )}
              {phones.length > 0 && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Hotline
                    </p>
                    {phones.map((phone) => (
                      <a
                        key={phone}
                        href={phoneHref(phone)}
                        className="block hover:text-white transition-colors"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </li>
              )}
              {data.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-orange-500" />
                  <a href={`mailto:${data.email}`} className="hover:text-white transition-colors">
                    {data.email}
                  </a>
                </li>
              )}
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
            <Link to="#" className="hover:underline">
              Điều khoản dịch vụ
            </Link>
            <Link to="#" className="hover:underline">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
