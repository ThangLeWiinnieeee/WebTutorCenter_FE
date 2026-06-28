import { useEffect, useState, useMemo, useRef, memo } from "react";
import { SunMedium, Sunset, Check, Trash2, Lightbulb, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DAY_OPTIONS } from "@/constants/enums";

const SCHEDULE_DAYS = DAY_OPTIONS;

const HOURS_24 = Array.from({ length: 24 }, (_, index) => index);
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEKEND = ["Sat", "Sun"];

const slotKey = (day, hour) => `${day}-${hour}`;

const hoursForDay = (slots, day) =>
  [...new Set(slots.filter((slot) => slot.day === day).map((slot) => Number(slot.hour)))].sort((a, b) => a - b);

const clearDaySlots = (slots, day) => slots.filter((slot) => slot.day !== day);

const addSlots = (slots, toAdd) => {
  const set = new Set(slots.map((slot) => slotKey(slot.day, slot.hour)));
  const next = [...slots];
  toAdd.forEach(({ day, hour }) => {
    const k = slotKey(day, hour);
    if (!set.has(k)) {
      set.add(k);
      next.push({ day, hour });
    }
  });
  return next;
};

const presetRanges = {
  morning: [6, 7, 8, 9, 10, 11],
  afternoon: [12, 13, 14, 15, 16, 17],
  evening: [18, 19, 20, 21, 22],
};

const WeeklyHourGrid = memo(function WeeklyHourGrid({ value = [], onChange, allowedSlots = null }) {
  const slotSet = useMemo(
    () => new Set(value.map((slot) => slotKey(slot.day, slot.hour))),
    [value]
  );
  const slotActive = (day, hour) => slotSet.has(slotKey(day, hour));

  // allowedSlots != null → giới hạn chỉ cho phép chọn các khung giờ này (luồng mời gia sư:
  // chỉ những giờ gia sư có thể dạy). null/undefined = không giới hạn (hành vi mặc định).
  const allowedSet = useMemo(
    () => (allowedSlots ? new Set(allowedSlots.map((slot) => slotKey(slot.day, Number(slot.hour)))) : null),
    [allowedSlots]
  );
  const slotAllowed = (day, hour) => !allowedSet || allowedSet.has(slotKey(day, hour));
  const filterAllowed = (slots) => (!allowedSet ? slots : slots.filter((s) => allowedSet.has(slotKey(s.day, Number(s.hour)))));

  const [dragMode, setDragMode] = useState(null); // 'add' | 'remove' | null
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const handleMouseUp = () => {
      setDragMode(null);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (day, hour, active) => {
    if (!active && !slotAllowed(day, hour)) return; // không cho thêm ô ngoài lịch dạy của gia sư
    const nextMode = active ? "remove" : "add";
    setDragMode(nextMode);

    let nextValue;
    if (active) {
      nextValue = valueRef.current.filter((slot) => !(slot.day === day && Number(slot.hour) === hour));
    } else {
      nextValue = [...valueRef.current, { day, hour }];
    }
    valueRef.current = nextValue;
    onChange(nextValue);
  };

  const handleMouseEnter = (day, hour) => {
    if (!dragMode) return;

    const active = valueRef.current.some((slot) => slot.day === day && Number(slot.hour) === hour);
    if (dragMode === "add" && !slotAllowed(day, hour)) return;
    let nextValue = valueRef.current;

    if (dragMode === "add" && !active) {
      nextValue = [...valueRef.current, { day, hour }];
    } else if (dragMode === "remove" && active) {
      nextValue = valueRef.current.filter((slot) => !(slot.day === day && Number(slot.hour) === hour));
    }

    if (nextValue !== valueRef.current) {
      valueRef.current = nextValue;
      onChange(nextValue);
    }
  };

  const clearDay = (day) => onChange(clearDaySlots(value, day));

  const applyPreset = (preset) => {
    const hours = presetRanges[preset];
    const targets = WEEKDAYS;
    let next = [...value];
    targets.forEach((day) => {
      hours.forEach((hour) => {
        next = addSlots(next, [{ day, hour }]);
      });
    });
    onChange(filterAllowed(next));
  };

  const applyWeekendPreset = () => {
    const hours = Array.from({ length: 13 }, (_, index) => 8 + index);
    let next = [...value];
    WEEKEND.forEach((day) => {
      hours.forEach((hour) => {
        next = addSlots(next, [{ day, hour }]);
      });
    });
    onChange(filterAllowed(next));
  };

  const mergePresetEveningWeekdays = () => {
    let next = [...value];
    presetRanges.evening.forEach((hour) => {
      WEEKDAYS.forEach((day) => {
        next = addSlots(next, [{ day, hour }]);
      });
    });
    onChange(filterAllowed(next));
  };

  const clearAll = () => onChange([]);

  return (
    <div className="space-y-4">
      {/* Quick suggestions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-slate-500">Gợi ý nhanh:</span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          onClick={() => applyPreset("morning")}
        >
          <SunMedium className="h-3.5 w-3.5 text-amber-500" />
          Buổi sáng
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          onClick={() => applyPreset("afternoon")}
        >
          <SunMedium className="h-3.5 w-3.5 text-orange-400" />
          Buổi chiều
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          onClick={mergePresetEveningWeekdays}
        >
          <Sunset className="h-3.5 w-3.5 text-indigo-500" />
          Buổi tối
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          onClick={applyWeekendPreset}
        >
          Cuối tuần
        </button>
      </div>

      {/* Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <div className="inline-block min-w-full align-middle xl:min-w-[720px]">
            <div className="mb-3 flex min-w-[640px] items-end gap-x-2 text-[10px] font-medium text-slate-400">
              <div className="sticky left-0 isolate z-[10] flex min-h-[2.125rem] shrink-0 items-end gap-x-2 self-stretch rounded-r-lg bg-white pl-2 pr-4 shadow-[6px_0_12px_-4px_rgba(15,23,42,0.12)]">
                <span className="inline-block size-5 shrink-0" aria-hidden />
                <span className="inline-flex min-w-[4.5rem] font-semibold uppercase tracking-wide text-slate-400">Ngày</span>
              </div>
              <div className="flex min-w-0 flex-1 justify-between px-0.5">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
              <span className="inline-flex size-8 shrink-0 items-center justify-center text-center">&nbsp;</span>
            </div>

            {SCHEDULE_DAYS.map((day) => {
              const activeCount = hoursForDay(value, day.value).length;
              return (
                <div
                  key={day.value}
                  className="mb-2 flex min-w-[640px] items-center gap-x-2 last:mb-0"
                >
                  <div className="sticky left-0 isolate z-[5] flex min-h-[2.5rem] shrink-0 items-center gap-x-2 self-stretch rounded-r-lg bg-white px-2 pr-4 py-1 shadow-[6px_0_14px_-4px_rgba(15,23,42,0.1)]">
                    <button
                      type="button"
                      aria-label={`Xóa lịch ${day.label}`}
                      title="Bỏ chọn cả ngày (xóa hết khung giờ)"
                      onClick={() => {
                        if (activeCount > 0) clearDay(day.value);
                      }}
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded border transition",
                        activeCount > 0
                          ? "border-emerald-500 bg-emerald-600 shadow-sm shadow-emerald-200/60"
                          : "border-slate-200 bg-white hover:border-emerald-200"
                      )}
                    >
                      {activeCount > 0 && <Check className="h-3 w-3 text-white" />}
                    </button>
                    <span className="min-w-[4.5rem] truncate text-xs font-semibold text-slate-700">{day.label}</span>
                  </div>

                  <div
                    className="relative z-0 grid h-10 min-w-[520px] flex-1 gap-px rounded-lg border border-slate-300/90 bg-slate-300 p-px shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)] [grid-template-columns:repeat(24,minmax(0,1fr))]"
                    role="group"
                    aria-label={`Khung giờ ${day.label}`}
                  >
                    {HOURS_24.map((hour) => {
                      const active = slotActive(day.value, hour);
                      const prevOn = hour > 0 && slotActive(day.value, hour - 1);
                      const nextOn = hour < 23 && slotActive(day.value, hour + 1);
                      const isQuarter = hour % 6 === 0;
                      const disabled = !active && !slotAllowed(day.value, hour);
                      return (
                        <button
                          key={slotKey(day.value, hour)}
                          type="button"
                          disabled={disabled}
                          title={
                            disabled
                              ? `${day.label}: ${String(hour).padStart(2, "0")}:00 — gia sư không dạy giờ này`
                              : `${day.label}: ${String(hour).padStart(2, "0")}:00–${String(hour + 1).padStart(2, "0")}:00`
                          }
                          onMouseDown={() => handleMouseDown(day.value, hour, active)}
                          onMouseEnter={() => handleMouseEnter(day.value, hour)}
                          className={cn(
                            "relative flex min-h-[32px] min-w-[22px] w-full items-center justify-center text-[9px] font-semibold tabular-nums transition-all duration-150 select-none",
                            disabled
                              ? "cursor-not-allowed bg-slate-200/80 text-slate-300"
                              : "cursor-pointer",
                            !disabled && active
                              ? cn(
                                  "z-[1] bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
                                  !prevOn && "rounded-l-[5px]",
                                  !nextOn && "rounded-r-[5px]"
                                )
                              : !disabled &&
                                  cn(
                                    "bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800 hover:ring-1 hover:ring-inset hover:ring-emerald-300/60",
                                    isQuarter && "bg-slate-100 text-slate-600"
                                  )
                          )}
                        >
                          <span className="pointer-events-none select-none opacity-90">{hour}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Xóa ${day.label}`}
                    title="Xóa ngày này"
                    onClick={() => clearDay(day.value)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500">
          Mỗi ô là một giờ. Ô liền nhau được tô xanh liền mạch. Bạn có thể nhấn giữ chuột và lia chuột qua lại để chọn/bỏ chọn nhanh nhiều ô.
        </p>
      </div>

      {/* Guide and Clean actions at the bottom */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm flex flex-col justify-center">
          <div className="mb-1.5 flex items-center gap-2 font-semibold text-amber-900 text-sm">
            <Lightbulb className="h-4 w-4 shrink-0" />
            Hướng dẫn chọn giờ
          </div>
          <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-amber-950/85">
            <li>Nhấp giữ và rê chuột (Click & Drag) qua các ô để chọn nhanh dải giờ học.</li>
            <li>Dùng các nút gợi ý nhanh ở trên để chọn hàng loạt giờ học.</li>
          </ul>
        </div>

        <div className="flex flex-col justify-center gap-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 cursor-pointer shadow-sm"
            onClick={clearAll}
          >
            <Trash2 className="h-4 w-4" />
            Xóa tất cả thời gian đã chọn
          </button>
        </div>
      </div>
    </div>
  );
});

export default WeeklyHourGrid;
