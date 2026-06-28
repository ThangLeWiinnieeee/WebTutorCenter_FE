import { BadgeCheck } from "lucide-react";

/**
 * Huy hiệu "Gia sư uy tín" — dành cho top gia sư theo điểm đánh giá (Bayesian, cân bằng
 * giữa số lượng và điểm sao). Chỉ render khi `tutor.isTrusted === true` (caller tự kiểm tra).
 * - compact: bản gọn (chữ "Uy tín") cho thẻ nhỏ như TopTutorCard.
 */
export default function TrustedTutorBadge({ compact = false, className = "" }) {
  if (compact) {
    return (
      <span
        title="Gia sư uy tín — top gia sư được đánh giá nhiều và cao nhất"
        className={`inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 ${className}`}
      >
        <BadgeCheck className="h-3.5 w-3.5" />
        Uy tín
      </span>
    );
  }

  return (
    <span
      title="Top gia sư được đánh giá nhiều và cao nhất"
      className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 ring-1 ring-amber-200 ${className}`}
    >
      <BadgeCheck className="h-4 w-4" />
      Gia sư uy tín
    </span>
  );
}
