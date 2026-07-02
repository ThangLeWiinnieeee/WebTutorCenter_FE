import { CalendarDays } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getTodayIsoDateLocal } from '@/features/classes/schemas/classRequestSchema';
import {
  formatDdMmYyyyUi,
  parseIsoToLocalMidnightDate,
  saturdayIsoThisOrNextFromTodayLocal,
  toLocalIsoDate,
  tomorrowIsoFromTodayLocal,
} from '@/features/classes/utils/classRequestDateUtils';
import { cn } from '@/lib/utils';

const CustomDateField = ({ value, onChange }) => {
  const todayIso = getTodayIsoDateLocal();
  const tomorrowIso = tomorrowIsoFromTodayLocal();
  const weekendIso = saturdayIsoThisOrNextFromTodayLocal();

  const isToday = value === todayIso;
  const isTomorrow = value === tomorrowIso;
  const isWeekend = value === weekendIso;

  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = value ? parseIsoToLocalMidnightDate(value) : undefined;

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-11 w-full justify-start text-left font-normal rounded-xl border border-slate-200 bg-white px-3.5 text-slate-800 hover:bg-slate-50 hover:text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100",
              !value && "text-slate-500"
            )}
          >
            <CalendarDays className="mr-2.5 h-4 w-4 text-emerald-600 shrink-0" />
            {value ? formatDdMmYyyyUi(value) : <span>Chọn ngày bắt đầu</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onChange(toLocalIsoDate(date));
                setIsOpen(false);
              }
            }}
            disabled={(date) => {
              const today = parseIsoToLocalMidnightDate(todayIso);
              return date < today;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          className={cn(
            "rounded-full border px-2 py-1.5 text-xs font-bold transition cursor-pointer",
            isToday
              ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          )}
          onClick={() => onChange(todayIso)}
        >
          Hôm nay
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full border px-2 py-1.5 text-xs font-bold transition cursor-pointer",
            isTomorrow
              ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          )}
          onClick={() => onChange(tomorrowIso)}
        >
          Ngày mai
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full border px-2 py-1.5 text-xs font-bold transition cursor-pointer",
            isWeekend
              ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          )}
          onClick={() => onChange(weekendIso)}
        >
          Cuối tuần
        </button>
      </div>
    </div>
  );
};

export default CustomDateField;
