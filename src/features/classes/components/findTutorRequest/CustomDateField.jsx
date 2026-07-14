import { CalendarDays } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getMinStartIsoDateLocal } from '@/features/classes/schemas/classRequestSchema';
import {
  dayAfterMinStartIsoFromTodayLocal,
  formatDdMmYyyyUi,
  parseIsoToLocalMidnightDate,
  saturdayIsoOnOrAfterMinLocal,
  toLocalIsoDate,
} from '@/features/classes/utils/classRequestDateUtils';
import { cn } from '@/lib/utils';

const CustomDateField = ({ value, onChange }) => {
  // Ngày bắt đầu buổi học phải cách hôm nay >= 2 ngày (không nhận hôm nay/ngày mai)
  const minIso = getMinStartIsoDateLocal();
  const nextIso = dayAfterMinStartIsoFromTodayLocal();
  const weekendIso = saturdayIsoOnOrAfterMinLocal();

  const isMin = value === minIso;
  const isNext = value === nextIso;
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
            {value ? formatDdMmYyyyUi(value) : <span>Chọn ngày bắt đầu buổi học</span>}
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
            disabled={(date) => date < parseIsoToLocalMidnightDate(minIso)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          className={cn(
            "rounded-full border px-2 py-1.5 text-xs font-bold transition cursor-pointer",
            isMin
              ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          )}
          onClick={() => onChange(minIso)}
        >
          Sớm nhất
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full border px-2 py-1.5 text-xs font-bold transition cursor-pointer",
            isNext
              ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          )}
          onClick={() => onChange(nextIso)}
        >
          3 ngày nữa
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
