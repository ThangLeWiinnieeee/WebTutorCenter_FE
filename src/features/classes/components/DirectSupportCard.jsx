import { PhoneCall } from "lucide-react";

import useSiteSettings from "@/hooks/useSiteSettings";

const phoneHref = (phone) => `tel:${phone.replace(/[^+\d]/g, "")}`;

// Thẻ hotline dùng chung cho trang danh sách, chi tiết lớp và trang đăng tìm gia sư.
const DirectSupportCard = ({ className = "", ...props }) => {
  const { data } = useSiteSettings();
  const phones = [...new Set([data.phone, data.phone2].filter(Boolean))];

  if (phones.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border border-emerald-100 bg-white p-5 text-slate-900 shadow-sm ${className}`}
      {...props}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <PhoneCall className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900">Hỗ trợ trực tiếp</p>
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Hotline</p>
      <div className="mt-1.5 space-y-1">
        {phones.map((phone) => (
          <a
            key={phone}
            href={phoneHref(phone)}
            className="block w-fit text-2xl font-bold tracking-wide text-emerald-700 transition hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {phone}
          </a>
        ))}
      </div>
      <p className="mt-4 border-t border-emerald-100 pt-3 text-xs leading-relaxed text-slate-500">
        Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn.
      </p>
    </section>
  );
};

export default DirectSupportCard;
