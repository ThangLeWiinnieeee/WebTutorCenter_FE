import { cn } from "@/lib/utils";

// Ô chọn số phút mỗi buổi học.
const CustomMinutesField = ({ value, onChange, minuteOptions = [] }) => {
  const normalizedValue = Number(value) || minuteOptions[0] || 90;

  return (
    <div className="flex flex-wrap gap-2">
      {minuteOptions.map((minute) => (
        <button
          key={minute}
          type="button"
          className={cn(
            "h-10 min-w-[4.5rem] flex-1 rounded-xl border px-2 text-xs font-semibold transition sm:text-sm",
            normalizedValue === minute
              ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50",
          )}
          onClick={() => onChange(minute)}
        >
          {minute} phút
        </button>
      ))}
    </div>
  );
};

export default CustomMinutesField;
