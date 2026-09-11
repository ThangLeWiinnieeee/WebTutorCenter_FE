import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, ChevronRight } from "lucide-react";

import { getInitials } from "@/lib/format";

// Thẻ thông tin gia sư/bài đăng do admin gửi. Chỉ hiển thị dữ liệu công khai
// (họ tên/avatar gia sư, mã + môn bài đăng) + nút mở trang chi tiết.
const MessageCard = ({ card }) => {
  if (!card) return null;
  const isTutor = card.kind === "tutor";
  const to = isTutor ? `/tutors/${card.refId}` : `/classes/${card.refId}`;

  return (
    <div className="w-60 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm">
      <div className="flex items-center gap-3 p-3">
        {isTutor ? (
          card.image ? (
            <img
              src={card.image}
              alt={card.title}
              referrerPolicy="no-referrer"
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {getInitials(card.title)}
            </div>
          )
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <BookOpen className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            {isTutor ? <GraduationCap className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
            {isTutor ? "Gia sư" : "Bài đăng lớp"}
          </p>
          <p className="truncate text-sm font-semibold text-slate-800">{card.title}</p>
          {card.subtitle && <p className="truncate text-xs text-slate-500">{card.subtitle}</p>}
        </div>
      </div>
      <Link
        to={to}
        className="flex items-center justify-center gap-1 border-t border-slate-100 bg-slate-50 py-2 text-xs font-medium text-brand transition hover:bg-brand/5"
      >
        {isTutor ? "Xem hồ sơ gia sư" : "Xem chi tiết bài đăng"}
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
};

export default MessageCard;
