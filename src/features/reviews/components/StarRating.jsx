import { useState } from "react";
import { Star } from "lucide-react";

/**
 * Hiển thị số sao (chỉ đọc), hỗ trợ sao lẻ (vd 4.5) bằng kỹ thuật phủ lớp.
 */
export function StarRating({ value = 0, size = 16, className = "", showValue = false, reviewCount = null }) {
  const safeValue = Number(value) || 0;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-0.5" aria-label={`${safeValue} trên 5 sao`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, safeValue - i));
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                className="absolute inset-0 text-slate-300"
                style={{ width: size, height: size }}
                strokeWidth={1.5}
              />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star
                  className="fill-amber-400 text-amber-400"
                  style={{ width: size, height: size }}
                  strokeWidth={1.5}
                />
              </span>
            </span>
          );
        })}
      </span>
      {showValue && (
        <span className="text-sm font-semibold text-slate-700">
          {safeValue.toFixed(1)}
          {reviewCount != null ? (
            <span className="font-normal text-slate-400"> ({reviewCount})</span>
          ) : null}
        </span>
      )}
    </span>
  );
}

/**
 * Chọn số sao (1-5) cho form đánh giá.
 */
export function StarRatingInput({ value = 0, onChange, size = 36, disabled = false }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Chọn số sao đánh giá">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          disabled={disabled}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:hover:scale-100"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} sao`}
        >
          <Star
            style={{ width: size, height: size }}
            className={
              star <= active ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300"
            }
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
