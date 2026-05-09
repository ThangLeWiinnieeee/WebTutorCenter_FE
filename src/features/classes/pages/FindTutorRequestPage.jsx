import {
  memo,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  BookOpenCheck,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Copy,
  GraduationCap,
  Lightbulb,
  MapPinHouse,
  PhoneCall,
  Plus,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Sunset,
  Trash2,
  UserRound,
  Users,
  Zap,
} from 'lucide-react';
import {
  Controller,
  useForm,
  useWatch,
} from 'react-hook-form';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchableSelect from '@/features/classes/components/SearchableSelect';
import {
  classRequestSchema,
  getDefaultClassRequestValues,
  getTodayIsoDateLocal,
  MINUTES_PER_SESSION_PRESETS,
} from '@/features/classes/schemas/classRequestSchema';
import classService from '@/features/classes/services/classService';
import { clearClassFlow } from '@/features/classes/store/classSlice';
import {
  createClassThunk,
  quoteClassThunk,
} from '@/features/classes/store/classThunks';
import {
  formatDate,
  formatPrice,
} from '@/features/classes/utils/classFormatters';
import {
  clearClassRequestFormDraft,
  loadClassRequestFormDraft,
  saveClassRequestFormDraft,
} from '@/features/classes/utils/classRequestFormDraftStorage';
import locationService from '@/features/tutors/services/locationService';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

const SCHEDULE_DAYS = [
  { value: 'Mon', label: 'Thứ 2' },
  { value: 'Tue', label: 'Thứ 3' },
  { value: 'Wed', label: 'Thứ 4' },
  { value: 'Thu', label: 'Thứ 5' },
  { value: 'Fri', label: 'Thứ 6' },
  { value: 'Sat', label: 'Thứ 7' },
  { value: 'Sun', label: 'Chủ nhật' },
];

const HOURS_24 = Array.from({ length: 24 }, (_, index) => index);
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEKEND = ['Sat', 'Sun'];

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

const ScheduleTimeMatrix = memo(function ScheduleTimeMatrix({ value = [], onChange }) {
  const slotSet = useMemo(
    () => new Set(value.map((slot) => slotKey(slot.day, slot.hour))),
    [value],
  );
  const slotActive = (day, hour) => slotSet.has(slotKey(day, hour));

  const [copySource, setCopySource] = useState('Mon');
  const [copyTargets, setCopyTargets] = useState(() => new Set(['Tue']));

  const toggleHour = (day, hour) => {
    if (slotActive(day, hour)) {
      onChange(value.filter((slot) => !(slot.day === day && Number(slot.hour) === hour)));
    } else {
      onChange([...value, { day, hour }]);
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
    onChange(next);
  };

  const applyWeekendPreset = () => {
    const hours = Array.from({ length: 13 }, (_, index) => 8 + index);
    let next = [...value];
    WEEKEND.forEach((day) => {
      hours.forEach((hour) => {
        next = addSlots(next, [{ day, hour }]);
      });
    });
    onChange(next);
  };

  const mergePresetEveningWeekdays = () => {
    let next = [...value];
    presetRanges.evening.forEach((hour) => {
      WEEKDAYS.forEach((day) => {
        next = addSlots(next, [{ day, hour }]);
      });
    });
    onChange(next);
  };

  const toggleCopyTarget = (day) => {
    if (day === copySource) return;
    const nextSet = new Set(copyTargets);
    if (nextSet.has(day)) nextSet.delete(day);
    else nextSet.add(day);
    setCopyTargets(nextSet);
  };

  const applyCopySchedule = () => {
    const sourceHours = hoursForDay(value, copySource);
    if (sourceHours.length === 0) {
      toast.error('Ngày nguồn chưa có khung giờ để sao chép');
      return;
    }
    const targets = [...copyTargets].filter((day) => day !== copySource);
    if (targets.length === 0) {
      toast.error('Chọn ít nhất một ngày đích');
      return;
    }
    let next = value.filter((slot) => !targets.includes(slot.day));
    targets.forEach((day) => {
      sourceHours.forEach((hour) => {
        next = addSlots(next, [{ day, hour }]);
      });
    });
    onChange(next);
    toast.success('Đã sao chép lịch');
  };

  const clearAll = () => onChange([]);

  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-slate-500">Gợi ý nhanh:</span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          onClick={() => applyPreset('morning')}
        >
          <SunMedium className="h-3.5 w-3.5 text-amber-500" />
          Buổi sáng
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          onClick={() => applyPreset('afternoon')}
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
        <button
          id="schedule-matrix-anchor"
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-emerald-300 bg-emerald-50/50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
          onClick={() => document.getElementById('schedule-matrix-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm khung giờ
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <div className="inline-block min-w-full align-middle xl:min-w-[720px]">
            <div className="mb-3 flex min-w-[640px] items-end gap-x-2 text-[10px] font-medium text-slate-400">
              <div className="sticky left-0 isolate z-[40] flex min-h-[2.125rem] shrink-0 items-end gap-x-2 self-stretch rounded-r-lg bg-white pl-2 pr-4 shadow-[6px_0_12px_-4px_rgba(15,23,42,0.12)]">
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
                  <div className="sticky left-0 isolate z-[35] flex min-h-[2.5rem] shrink-0 items-center gap-x-2 self-stretch rounded-r-lg bg-white px-2 pr-4 py-1 shadow-[6px_0_14px_-4px_rgba(15,23,42,0.1)]">
                    <button
                      type="button"
                      aria-label={`Xóa lịch ${day.label}`}
                      title="Bỏ chọn cả ngày (xóa hết khung giờ)"
                      onClick={() => {
                        if (activeCount > 0) clearDay(day.value);
                      }}
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded border transition',
                        activeCount > 0
                          ? 'border-emerald-500 bg-emerald-600 shadow-sm shadow-emerald-200/60'
                          : 'border-slate-200 bg-white hover:border-emerald-200',
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
                      return (
                        <button
                          key={slotKey(day.value, hour)}
                          type="button"
                          title={`${day.label}: ${String(hour).padStart(2, '0')}:00–${String(hour + 1).padStart(2, '0')}:00`}
                          onClick={() => toggleHour(day.value, hour)}
                          className={cn(
                            'relative flex min-h-[32px] min-w-[22px] w-full items-center justify-center text-[9px] font-semibold tabular-nums transition-all duration-150',
                            active
                              ? cn(
                                  'z-[1] bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
                                  !prevOn && 'rounded-l-[5px]',
                                  !nextOn && 'rounded-r-[5px]',
                                )
                              : cn(
                                  'bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800 hover:ring-1 hover:ring-inset hover:ring-emerald-300/60',
                                  isQuarter && 'bg-slate-100 text-slate-600',
                                ),
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
          Mỗi ô là một giờ; số trong ô chưa chọn giúp đọc timeline. Các vạch xám giữa ô là rõ hơn khi chưa chọn. Vuốt ngang nếu màn hẹp; ô liền nhau được tô xanh liền mạch.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-600">Sao chép lịch từ</p>
          <div className="flex flex-wrap gap-1.5">
            {SCHEDULE_DAYS.map((day) => (
              <button
                key={`src-${day.value}`}
                type="button"
                onClick={() => setCopySource(day.value)}
                className={cn(
                  'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
                  copySource === day.value
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200',
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
        <div className="min-w-[12rem] flex-1">
          <p className="mb-1.5 text-xs font-medium text-slate-600">Sang</p>
          <div className="flex flex-wrap gap-1.5">
            {SCHEDULE_DAYS.map((day) => (
              <button
                key={`dst-${day.value}`}
                type="button"
                disabled={day.value === copySource}
                onClick={() => toggleCopyTarget(day.value)}
                className={cn(
                  'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-40',
                  copyTargets.has(day.value)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200',
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 rounded-xl bg-emerald-600 px-5 text-sm font-semibold hover:bg-emerald-700"
          onClick={applyCopySchedule}
        >
          Áp dụng
        </Button>
      </div>
      </div>

      <aside className="w-full shrink-0 space-y-4 xl:w-72 xl:border-l xl:border-slate-100 xl:pl-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
            <Lightbulb className="h-4 w-4 shrink-0" />
            Hướng dẫn
          </div>
          <ul className="list-inside list-disc space-y-1.5 text-xs leading-relaxed text-amber-950/85">
            <li>Bấm từng ô trên timeline để bật hoặc tắt khung giờ (mỗi ô = một giờ).</li>
            <li>O liền nhau sẽ gộp thành một dải như trên các ứng dụng đặt lịch.</li>
            <li>Dùng gợi ý nhanh hoặc sao chép lịch giữa các ngày để nhập liệu nhanh hơn.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/90 p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 font-semibold text-sky-900">
            <Zap className="h-4 w-4 shrink-0" />
            Mẹo nhanh
          </div>
          <p className="text-xs leading-relaxed text-sky-950/85">
            Nếu nhiều ngày trùng lịch, chọn một ngày nguồn, tick các ngày đích rồi bấm <strong>Áp dụng</strong>.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-9 w-full rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50"
            onClick={applyCopySchedule}
          >
            <Copy className="mr-2 h-3.5 w-3.5" />
            Sao chép lịch
          </Button>
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          onClick={clearAll}
        >
          <Trash2 className="h-4 w-4" />
          Xóa tất cả thời gian
        </button>
      </aside>
    </div>
  );
});

const BOOKING_PROGRESS_FIELD_NAMES = [
  'contactPhone',
  'subject',
  'summary',
  'provinceCode',
  'districtCode',
  'locationLabel',
  'studentCount',
  'startDate',
  'minutesPerSession',
  'sessionsPerWeek',
  'availabilitySlots',
  'description',
];

const BookingProgressHeader = ({ control }) => {
  const watched = useWatch({ control, name: BOOKING_PROGRESS_FIELD_NAMES }) || [];
  const [
    contactPhone,
    subject,
    summary,
    provinceCode,
    districtCode,
    locationLabel,
    studentCount,
    startDate,
    minutesPerSession,
    sessionsPerWeek,
    availabilitySlots,
    description,
  ] = watched;
  const filledCount = [
    contactPhone,
    subject,
    summary,
    provinceCode,
    districtCode,
    locationLabel,
    studentCount,
    startDate,
    minutesPerSession,
    sessionsPerWeek,
    availabilitySlots?.length,
    description,
  ].filter(Boolean).length;
  const progress = Math.min(100, Math.round((filledCount / 12) * 100));

  return (
    <section className="mb-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Booking trải nghiệm hiện đại
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Tìm gia sư phù hợp cho con bạn
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
            Cung cấp càng rõ thông tin lớp học, hệ thống càng ghép gia sư nhanh và chính xác.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          <p className="font-medium">Tiến độ hoàn thành</p>
          <p className="text-2xl font-bold text-slate-900">{progress}%</p>
        </div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 md:grid-cols-6">
        {[
          '1. Thông tin lớp học',
          '2. Lịch học',
          '3. Yêu cầu gia sư',
          '4. Học phí & bắt đầu',
          '5. Mô tả chi tiết',
          '6. Xác nhận yêu cầu',
        ].map((item) => (
          <div key={item} className="rounded-lg bg-slate-100 px-2.5 py-2 text-center">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
};

const SchedulePreviewCard = ({ control }) => {
  const watched = useWatch({
    control,
    name: ['studentCount', 'sessionsPerWeek', 'minutesPerSession', 'startDate'],
  }) || [];
  const [studentCount, sessionsPerWeek, minutesPerSession, startDateVal] = watched;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-5 shadow-inner">
      <div className="relative z-[1]">
        <p className="text-sm font-bold text-emerald-950">Lịch học dự kiến</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-center gap-2.5 text-slate-700">
            <Users className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{studentCount || 1} học viên</span>
          </li>
          <li className="flex items-center gap-2.5 text-slate-700">
            <CalendarDays className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{sessionsPerWeek || 1} buổi / tuần</span>
          </li>
          <li className="flex items-center gap-2.5 text-slate-700">
            <Clock3 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{minutesPerSession || 90} phút / buổi</span>
          </li>
          <li className="flex items-center gap-2.5 text-slate-700">
            <SunMedium className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Bắt đầu:{' '}
              {startDateVal && formatDdMmYyyyUi(startDateVal)
                ? formatDdMmYyyyUi(startDateVal)
                : '—'}
            </span>
          </li>
        </ul>
      </div>
      <div className="pointer-events-none absolute -bottom-6 -right-4 flex opacity-70">
        <CalendarDays className="h-24 w-24 text-emerald-200/90" strokeWidth={1} />
        <Clock3 className="-ml-4 mt-4 h-20 w-20 text-teal-200/80" strokeWidth={1} />
      </div>
    </div>
  );
};

const DescriptionLengthCounter = ({ control }) => {
  const description = useWatch({ control, name: 'description' });
  const len = description != null && description !== '' ? String(description).length : 0;
  return <span>{len}/2000</span>;
};

const BookingSummaryAsideCard = ({ control, provinces, districts, quote }) => {
  const watched =
    useWatch({
      control,
      name: [
        'subject',
        'provinceCode',
        'districtCode',
        'availabilitySlots',
        'studentCount',
        'tutorLevelPref',
        'startDate',
      ],
    }) || [];
  const [subject, provinceCodeW, districtCodeW, availabilitySlots, studentCountW, tutorLevelPref, startDateW] = watched;

  const selectedProvince = provinces.find((item) => item.code === provinceCodeW);
  const selectedDistrict = districts.find((item) => item.code === districtCodeW);
  const estimatedTutorMatches = Math.max(
    3,
    24 - (availabilitySlots?.length || 0) + (tutorLevelPref === 'any' ? 4 : 0),
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Tóm tắt yêu cầu trực tiếp</h3>
      <div className="space-y-3 text-sm">
        <p className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
          <span className="flex items-center gap-2 text-slate-500"><BookOpenCheck className="h-4 w-4" /> Môn học</span>
          <span className="text-right font-semibold text-slate-800">{subject || 'Chưa chọn'}</span>
        </p>
        <p className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
          <span className="flex items-center gap-2 text-slate-500"><MapPinHouse className="h-4 w-4" /> Khu vực</span>
          <span className="text-right font-semibold text-slate-800">
            {selectedDistrict?.name && selectedProvince?.name
              ? `${selectedDistrict.name}, ${selectedProvince.name}`
              : 'Chưa chọn'}
          </span>
        </p>
        <p className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
          <span className="flex items-center gap-2 text-slate-500"><CalendarDays className="h-4 w-4" /> Lịch học</span>
          <span className="text-right font-semibold text-slate-800">
            {availabilitySlots?.length || 0} khung giờ/tuần
          </span>
        </p>
        <p className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
          <span className="flex items-center gap-2 text-slate-500"><Users className="h-4 w-4" /> Học viên</span>
          <span className="text-right font-semibold text-slate-800">{studentCountW || 0} học viên</span>
        </p>
        <p className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
          <span className="flex items-center gap-2 text-slate-500"><GraduationCap className="h-4 w-4" /> Yêu cầu gia sư</span>
          <span className="text-right font-semibold text-slate-800">
            {tutorLevelPref === 'teacher' ? 'Giáo viên' : tutorLevelPref === 'student' ? 'Sinh viên' : 'Không yêu cầu'}
          </span>
        </p>
        <p className="flex items-start justify-between gap-3">
          <span className="text-slate-500">Ngày bắt đầu</span>
          <span className="text-right font-semibold text-slate-800">{formatDate(startDateW)}</span>
        </p>
      </div>
      <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
        <p className="text-xs uppercase tracking-wide text-emerald-700">Ước tính kết nối</p>
        <p className="mt-1 text-2xl font-bold text-emerald-900">{estimatedTutorMatches} gia sư phù hợp</p>
      </div>
      {quote && (
        <div className="mt-3 rounded-2xl bg-slate-100 p-4 text-sm">
          <p className="flex items-center justify-between">
            <span className="text-slate-600">Học phí 1 buổi</span>
            <span className="font-bold text-slate-900">{formatPrice(quote.feePerSession)}</span>
          </p>
          <p className="mt-1 flex items-center justify-between">
            <span className="text-slate-600">Học phí 1 tháng</span>
            <span className="font-bold text-slate-900">{formatPrice(quote.feePerMonth)}</span>
          </p>
        </div>
      )}
    </div>
  );
};

const formatDdMmYyyyUi = (iso) => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
};

const toLocalIsoDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const clampStartDateIsoToMin = (iso, minIso) => (iso >= minIso ? iso : minIso);

const parseIsoToLocalMidnightDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const tomorrowIsoFromTodayLocal = () => {
  const base = parseIsoToLocalMidnightDate(getTodayIsoDateLocal());
  base.setDate(base.getDate() + 1);
  return toLocalIsoDate(base);
};

const saturdayIsoThisOrNextFromTodayLocal = () => {
  const base = parseIsoToLocalMidnightDate(getTodayIsoDateLocal());
  const wd = base.getDay();
  const daysUntilSaturday = wd === 6 ? 0 : (6 - wd + 7) % 7;
  base.setDate(base.getDate() + daysUntilSaturday);
  return toLocalIsoDate(base);
};

const parseDatePartsFromIso = (val) => {
  if (!val || !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return { day: "", month: "", year: "" };
  }
  const [year, month, day] = val.split("-");
  return { day, month, year };
};

const CustomDateField = ({ value, onChange }) => {
  const [dateParts, setDateParts] = useState(() => parseDatePartsFromIso(value));
  const [showDetail, setShowDetail] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setDateParts(parseDatePartsFromIso(value));
  }

  const syncToFormValue = (nextParts) => {
    const day = Number(nextParts.day);
    const month = Number(nextParts.month);
    const year = Number(nextParts.year);
    if (!day || !month || !year) return;

    const date = new Date(year, month - 1, day);
    if (
      Number.isNaN(date.getTime()) ||
      date.getDate() !== day ||
      date.getMonth() !== month - 1 ||
      date.getFullYear() !== year
    ) {
      return;
    }

    const isoDate = `${year.toString().padStart(4, "0")}-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    onChange(clampStartDateIsoToMin(isoDate, getTodayIsoDateLocal()));
  };

  const updatePart = (key, rawValue) => {
    const numeric = rawValue.replace(/\D/g, "").slice(0, key === "year" ? 4 : 2);
    const nextParts = { ...dateParts, [key]: numeric };
    setDateParts(nextParts);
    syncToFormValue(nextParts);
  };

  const applyIso = (isoDateRaw) => {
    const isoDate = clampStartDateIsoToMin(isoDateRaw, getTodayIsoDateLocal());
    onChange(isoDate);
    const [year, month, day] = isoDate.split("-");
    setDateParts({ day, month, year });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setShowDetail((prev) => !prev)}
        className="flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-emerald-600" />
        <span className="flex-1 text-sm font-medium text-slate-800">
          {formatDdMmYyyyUi(value) || "Chọn ngày bắt đầu"}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition', showDetail && 'rotate-180')} />
      </button>
      {showDetail && (
        <div className="grid grid-cols-3 gap-2">
          <Input
            value={dateParts.day}
            onChange={(event) => updatePart("day", event.target.value)}
            placeholder="DD"
            className="h-11 rounded-xl border-slate-200 text-center focus-visible:ring-emerald-200"
          />
          <Input
            value={dateParts.month}
            onChange={(event) => updatePart("month", event.target.value)}
            placeholder="MM"
            className="h-11 rounded-xl border-slate-200 text-center focus-visible:ring-emerald-200"
          />
          <Input
            value={dateParts.year}
            onChange={(event) => updatePart("year", event.target.value)}
            placeholder={String(new Date().getFullYear())}
            className="h-11 rounded-xl border-slate-200 text-center focus-visible:ring-emerald-200"
          />
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          className={cn(
            'rounded-full border px-2 py-1.5 text-xs font-semibold transition',
            value === getTodayIsoDateLocal()
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800',
          )}
          onClick={() => applyIso(getTodayIsoDateLocal())}
        >
          Hôm nay
        </button>
        <button type="button" className="rounded-full border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800" onClick={() => applyIso(tomorrowIsoFromTodayLocal())}>Ngày mai</button>
        <button type="button" className="rounded-full border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800" onClick={() => applyIso(saturdayIsoThisOrNextFromTodayLocal())}>Cuối tuần</button>
      </div>
    </div>
  );
};

const CustomMinutesField = ({ value, onChange }) => {
  const normalizedValue = Number(value) || 90;

  return (
    <div className="flex flex-wrap gap-2">
      {MINUTES_PER_SESSION_PRESETS.map((minute) => (
        <button
          key={minute}
          type="button"
          className={cn(
            'h-10 min-w-[4.5rem] flex-1 rounded-xl border px-2 text-xs font-semibold transition sm:text-sm',
            normalizedValue === minute
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50',
          )}
          onClick={() => onChange(minute)}
        >
          {minute} phút
        </button>
      ))}
    </div>
  );
};

const FindTutorRequestPage = () => {
  const dispatch = useDispatch();
  const { quote, loadingQuote, creating, latestCreated, error } = useSelector((state) => state.classes);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const ALL_SUBJECTS_VALUE = "__all_subjects__";
  const ALL_PROVINCES_VALUE = "__all_provinces__";
  const ALL_DISTRICTS_VALUE = "__all_districts__";
  const defaultFormValues = useMemo(
    () => loadClassRequestFormDraft(getDefaultClassRequestValues()),
    [],
  );
  const form = useForm({ resolver: zodResolver(classRequestSchema), defaultValues: defaultFormValues });
  const provinceCode = useWatch({ control: form.control, name: 'provinceCode' });
  const persistReadyRef = useRef(false);
  const {
    formState: { errors },
  } = form;

  useEffect(() => {
    classService
      .subjects()
      .then((res) =>
        startTransition(() => setSubjectOptions(res.data.data.subjects || [])),
      )
      .catch(() => startTransition(() => setSubjectOptions([])));
  }, []);

  useEffect(() => {
    locationService
      .getProvinces()
      .then((res) =>
        startTransition(() => setProvinces(res.data.data.provinces || [])),
      )
      .catch(() => startTransition(() => setProvinces([])));
  }, []);

  useEffect(() => {
    if (!provinceCode) return;
    locationService
      .getDistricts(provinceCode)
      .then((res) =>
        startTransition(() => setDistricts(res.data.data.districts || [])),
      )
      .catch(() => startTransition(() => setDistricts([])));
  }, [provinceCode]);

  useEffect(() => {
    persistReadyRef.current = false;
    const id = requestAnimationFrame(() => {
      persistReadyRef.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let debounceId;
    const unsubscribe = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        if (!persistReadyRef.current || !values) return;
        clearTimeout(debounceId);
        debounceId = window.setTimeout(() => {
          saveClassRequestFormDraft(values);
        }, 400);
      },
    });
    return () => {
      unsubscribe();
      clearTimeout(debounceId);
    };
  }, [form]);

  const subjectSelectOptions = useMemo(
    () => subjectOptions.map((subject) => ({ value: subject, label: subject })),
    [subjectOptions],
  );

  const provinceSelectOptions = useMemo(
    () => provinces.map((item) => ({ value: String(item.code), label: item.name })),
    [provinces],
  );

  const districtSelectOptions = useMemo(
    () => districts.map((item) => ({ value: String(item.code), label: item.name })),
    [districts],
  );

  const onQuote = async (values) => {
    const result = await dispatch(quoteClassThunk(values));
    if (result.error) toast.error(result.payload || "Không thể tính học phí");
  };

  const onCreate = async () => {
    const result = await dispatch(createClassThunk(form.getValues()));
    if (!result.error) {
      clearClassRequestFormDraft();
      toast.success("Đăng lớp mới thành công");
    }
  };

  const startNewClassRequest = () => {
    dispatch(clearClassFlow());
    form.reset(getDefaultClassRequestValues());
  };

  if (latestCreated) {
    return (
      <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-lg shadow-emerald-100/50">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Đăng lớp thành công</h1>
        <p className="mt-2 text-slate-600">
          Mã lớp của bạn: <span className="font-semibold">{latestCreated.classCode}</span>
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Bạn có thể tạo thêm yêu cầu khác bất cứ lúc nào — mỗi lớp là một tin đăng riêng.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="h-11 rounded-xl bg-emerald-600 px-6 text-white hover:bg-emerald-700" asChild>
            <Link to="/lop-moi">Xem danh sách lớp mới</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-emerald-200 px-6 text-emerald-800 hover:bg-emerald-50"
            onClick={startNewClassRequest}
          >
            Tạo yêu cầu mới
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="mx-auto max-w-[1360px] px-4 py-6 md:px-6 md:py-8">
        <BookingProgressHeader control={form.control} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-5 lg:col-span-9">
            {!quote && (
              <form className="space-y-5" onSubmit={form.handleSubmit(onQuote)}>
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md md:p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    <PhoneCall className="h-4 w-4 text-emerald-600" />
                    1. Thông tin lớp học
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại liên hệ *</label>
                      <Input
                        className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                        placeholder="Ví dụ: 0912 345 678"
                        {...form.register("contactPhone")}
                      />
                      {errors.contactPhone && <p className="mt-1 text-xs text-rose-600">{errors.contactPhone.message}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Môn học *</label>
                      <Controller
                        name="subject"
                        control={form.control}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value || ALL_SUBJECTS_VALUE}
                            onValueChange={(selectedValue) => field.onChange(selectedValue === ALL_SUBJECTS_VALUE ? "" : selectedValue)}
                            placeholder="Chọn môn học"
                            allValue={ALL_SUBJECTS_VALUE}
                            allLabel="Tất cả môn học"
                            options={subjectSelectOptions}
                            searchPlaceholder="Tìm môn học..."
                            emptyText="Không tìm thấy môn học"
                            triggerClassName="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-emerald-200"
                            contentClassName="max-h-80"
                          />
                        )}
                      />
                      {errors.subject && <p className="mt-1 text-xs text-rose-600">{errors.subject.message}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Tóm tắt yêu cầu *</label>
                      <Input
                        className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                        placeholder="Ví dụ: Tìm gia sư Toán lớp 9 tại Quận 7"
                        {...form.register("summary")}
                      />
                      {errors.summary && <p className="mt-1 text-xs text-rose-600">{errors.summary.message}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Địa điểm dạy *</label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Controller
                          name="provinceCode"
                          control={form.control}
                          render={({ field }) => (
                            <SearchableSelect
                              value={field.value ? String(field.value) : ALL_PROVINCES_VALUE}
                              onValueChange={(selectedValue) => {
                                const normalized = selectedValue === ALL_PROVINCES_VALUE ? 0 : Number(selectedValue);
                                field.onChange(normalized);
                                form.setValue("districtCode", 0);
                                setDistricts([]);
                              }}
                              placeholder="Tỉnh/thành"
                              allValue={ALL_PROVINCES_VALUE}
                              allLabel="Tất cả khu vực"
                              options={provinceSelectOptions}
                              searchPlaceholder="Tìm tỉnh/thành..."
                              emptyText="Không tìm thấy khu vực"
                              triggerClassName="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-emerald-200"
                              contentClassName="max-h-80"
                            />
                          )}
                        />
                        <Controller
                          name="districtCode"
                          control={form.control}
                          render={({ field }) => (
                            <SearchableSelect
                              value={field.value ? String(field.value) : ALL_DISTRICTS_VALUE}
                              onValueChange={(selectedValue) => field.onChange(selectedValue === ALL_DISTRICTS_VALUE ? 0 : Number(selectedValue))}
                              placeholder="Quận/huyện"
                              allValue={ALL_DISTRICTS_VALUE}
                              allLabel="Tất cả quận/huyện"
                              options={districtSelectOptions}
                              searchPlaceholder="Tìm quận/huyện..."
                              emptyText="Không tìm thấy quận/huyện"
                              disabled={!provinceCode}
                              triggerClassName="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-emerald-200"
                              contentClassName="max-h-80"
                            />
                          )}
                        />
                      </div>
                      {(errors.provinceCode || errors.districtCode) && (
                        <p className="mt-1 text-xs text-rose-600">
                          {errors.provinceCode?.message || errors.districtCode?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Địa chỉ ngắn gọn *</label>
                    <Input
                      className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                      placeholder="Ví dụ: Chung cư Sunrise City, đường Nguyễn Hữu Thọ"
                      {...form.register("locationLabel")}
                    />
                    {errors.locationLabel && <p className="mt-1 text-xs text-rose-600">{errors.locationLabel.message}</p>}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md md:p-6">
                  <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <CalendarCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-800">2. Lịch học</h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                          Thiết lập thông tin lịch học phù hợp với nhu cầu của bạn
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Số học viên *</label>
                          <Controller
                            name="studentCount"
                            control={form.control}
                            render={({ field }) => {
                              const n = Number(field.value) || 1;
                              return (
                                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white shadow-sm">
                                  <button
                                    type="button"
                                    className="h-full w-11 rounded-l-xl text-lg text-slate-500 transition hover:bg-slate-50 hover:text-emerald-700"
                                    onClick={() => field.onChange(Math.max(1, n - 1))}
                                  >
                                    −
                                  </button>
                                  <div className="flex flex-1 items-center justify-center gap-1 text-sm font-semibold text-slate-800 tabular-nums">
                                    <Input
                                      type="text"
                                      inputMode="numeric"
                                      className="w-12 border-0 p-0 text-center font-semibold shadow-none focus-visible:ring-0"
                                      value={n}
                                      onChange={(event) => {
                                        const nextValue = Number(event.target.value.replace(/\D/g, ""));
                                        field.onChange(nextValue || 1);
                                      }}
                                    />
                                    <span className="text-xs font-semibold text-slate-600">học viên</span>
                                  </div>
                                  <button
                                    type="button"
                                    className="h-full w-11 rounded-r-xl text-lg text-slate-500 transition hover:bg-slate-50 hover:text-emerald-700"
                                    onClick={() => field.onChange(n + 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              );
                            }}
                          />
                          {errors.studentCount && <p className="mt-1 text-xs text-rose-600">{errors.studentCount.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Ngày bắt đầu *</label>
                          <Controller
                            name="startDate"
                            control={form.control}
                            render={({ field }) => <CustomDateField value={field.value} onChange={field.onChange} />}
                          />
                          {errors.startDate && <p className="mt-1 text-xs text-rose-600">{errors.startDate.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Thời lượng mỗi buổi *</label>
                          <p className="mb-1.5 text-xs text-slate-500">
                            Chọn một mức: 60, 90, 120, 150 hoặc 180 phút
                          </p>
                          <Controller
                            name="minutesPerSession"
                            control={form.control}
                            render={({ field }) => <CustomMinutesField value={field.value} onChange={field.onChange} />}
                          />
                          {errors.minutesPerSession && <p className="mt-1 text-xs text-rose-600">{errors.minutesPerSession.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Số buổi / tuần *</label>
                          <Controller
                            name="sessionsPerWeek"
                            control={form.control}
                            render={({ field }) => {
                              const s = Number(field.value) || 1;
                              return (
                                <div className="space-y-1.5">
                                  <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <button
                                      type="button"
                                      className="h-full w-11 rounded-l-xl text-lg text-slate-500 transition hover:bg-slate-50 hover:text-emerald-700"
                                      onClick={() => field.onChange(Math.max(1, s - 1))}
                                    >
                                      −
                                    </button>
                                    <div className="flex flex-1 items-center justify-center gap-1 text-sm font-semibold text-slate-800 tabular-nums">
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        className="w-12 border-0 p-0 text-center font-semibold shadow-none focus-visible:ring-0"
                                        value={s}
                                        onChange={(event) => {
                                          const nextValue = Number(event.target.value.replace(/\D/g, ""));
                                          field.onChange(nextValue || 1);
                                        }}
                                      />
                                      <span className="text-xs font-semibold text-slate-600">buổi/tuần</span>
                                    </div>
                                    <button
                                      type="button"
                                      className="h-full w-11 rounded-r-xl text-lg text-slate-500 transition hover:bg-slate-50 hover:text-emerald-700"
                                      onClick={() => field.onChange(s + 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-500">Có thể linh hoạt thêm nếu cần</p>
                                </div>
                              );
                            }}
                          />
                          {errors.sessionsPerWeek && <p className="mt-1 text-xs text-rose-600">{errors.sessionsPerWeek.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 xl:gap-8">
                        <div className="min-w-0 xl:col-span-7">
                          <label className="mb-3 block text-sm font-medium text-slate-700">Giới tính học viên</label>
                          <Controller
                            name="studentGender"
                            control={form.control}
                            render={({ field }) => (
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                {[
                                  { value: 'male', label: 'Nam', desc: '', Icon: UserRound },
                                  { value: 'female', label: 'Nữ', desc: '', Icon: UserRound },
                                  { value: 'other', label: 'Nam & Nữ', desc: 'Ghép lớp hỗn hợp', Icon: Users },
                                ].map((item) => {
                                  const selected = field.value === item.value;
                                  const IconCmp = item.Icon;
                                  return (
                                    <button
                                      key={item.value}
                                      type="button"
                                      onClick={() => field.onChange(item.value)}
                                      className={cn(
                                        'relative flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 transition',
                                        selected
                                          ? 'border-emerald-600 bg-emerald-50/70 shadow-md shadow-emerald-100'
                                          : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50',
                                      )}
                                    >
                                      {selected && (
                                        <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                                          <Check className="h-3.5 w-3.5" />
                                        </span>
                                      )}
                                      <IconCmp className={cn('h-7 w-7', selected ? 'text-emerald-700' : 'text-slate-400')} />
                                      <span className={cn('text-sm font-semibold', selected ? 'text-emerald-900' : 'text-slate-800')}>{item.label}</span>
                                      {item.desc ? <span className="text-center text-xs text-slate-500">{item.desc}</span> : null}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          />
                        </div>

                        <div className="min-w-0 xl:col-span-5">
                          <SchedulePreviewCard control={form.control} />
                        </div>
                      </div>
                  </div>

                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <label className="mb-4 block text-sm font-semibold text-slate-800">Thời gian có thể học *</label>
                    <Controller
                      control={form.control}
                      name="availabilitySlots"
                      render={({ field }) => <ScheduleTimeMatrix value={field.value} onChange={field.onChange} />}
                    />
                    {errors.availabilitySlots && <p className="mt-2 text-xs text-rose-600">{errors.availabilitySlots.message}</p>}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md md:p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    3. Yêu cầu gia sư
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Giới tính gia sư</label>
                      <Controller
                        name="tutorGenderPref"
                        control={form.control}
                        render={({ field }) => (
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'any', label: 'Không yêu cầu' },
                              { value: 'male', label: 'Nam' },
                              { value: 'female', label: 'Nữ' },
                            ].map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                className={`h-10 rounded-xl border px-2 text-xs font-semibold transition sm:text-sm ${
                                  field.value === item.value
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50'
                                }`}
                                onClick={() => field.onChange(item.value)}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Trình độ gia sư</label>
                      <Controller
                        name="tutorLevelPref"
                        control={form.control}
                        render={({ field }) => (
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'any', label: 'Không yêu cầu' },
                              { value: 'student', label: 'Sinh viên' },
                              { value: 'teacher', label: 'Giáo viên' },
                            ].map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                className={`h-10 rounded-xl border px-2 text-xs font-semibold transition sm:text-sm ${
                                  field.value === item.value
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50'
                                }`}
                                onClick={() => field.onChange(item.value)}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md md:p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    <Clock3 className="h-4 w-4 text-emerald-600" />
                    4. Học phí & lịch bắt đầu
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Mã ưu đãi (nếu có)</label>
                      <Input className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200" placeholder="Nhập mã ưu đãi" {...form.register("promoCode")} />
                      {errors.promoCode && <p className="mt-1 text-xs text-rose-600">{errors.promoCode.message}</p>}
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                      <p className="font-semibold">Tạm tính tự động</p>
                      <p className="mt-1 text-emerald-700">
                        Hệ thống sẽ báo giá sau khi bạn xác nhận thông tin bên dưới.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md md:p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    <BookOpenCheck className="h-4 w-4 text-emerald-600" />
                    5. Mô tả chi tiết
                  </h2>
                  <textarea
                    className="min-h-[140px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    rows={5}
                    placeholder="Mô tả chi tiết mục tiêu học tập, tình hình hiện tại của học viên, mong muốn về lộ trình..."
                    {...form.register("description")}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Nên mô tả càng cụ thể để tăng tốc độ ghép gia sư.</span>
                    <DescriptionLengthCounter control={form.control} />
                  </div>
                  {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    6. Xác nhận yêu cầu
                  </h2>
                  {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}
                  <div className="hidden md:block">
                    <Button
                      type="submit"
                      className="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700"
                      disabled={loadingQuote}
                    >
                      {loadingQuote ? "Đang xử lý..." : "Xem báo giá & xác nhận"}
                    </Button>
                  </div>
                </section>

                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    disabled={loadingQuote}
                  >
                    {loadingQuote ? "Đang xử lý..." : "Xem báo giá & xác nhận"}
                  </Button>
                </div>
              </form>
            )}

            {quote && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-semibold text-emerald-900">Xác nhận thông tin & Báo giá</h3>
                <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-sm">
                  <p className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Môn học</span>
                    <span className="font-semibold text-slate-800">{form.getValues('subject')}</span>
                  </p>
                  <p className="mt-3 flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Số học viên</span>
                    <span className="font-semibold text-slate-800">{form.getValues('studentCount')}</span>
                  </p>
                  <p className="mt-3 flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Lịch học</span>
                    <span className="font-semibold text-slate-800">{form.getValues('availabilitySlots')?.length || 0} khung giờ</span>
                  </p>
                  <p className="mt-3 flex justify-between text-base">
                    <span className="text-slate-600">Phí 1 buổi</span>
                    <span className="font-bold text-emerald-700">{formatPrice(quote.feePerSession)}</span>
                  </p>
                  <p className="mt-1 flex justify-between text-base">
                    <span className="text-slate-600">Phí 1 tháng</span>
                    <span className="font-bold text-emerald-700">{formatPrice(quote.feePerMonth)}</span>
                  </p>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" className="h-11 flex-1 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100" onClick={() => dispatch(clearClassFlow())}>
                    Quay lại sửa
                  </Button>
                  <Button className="h-11 flex-1 rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700" onClick={onCreate} disabled={creating}>
                    {creating ? "Đang đăng..." : "Đồng ý & Đăng bài"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:col-span-3">
            <div className="top-6 space-y-4 lg:sticky">
              <BookingSummaryAsideCard control={form.control} provinces={provinces} districts={districts} quote={quote} />

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Lợi ích khi đăng lớp</h3>
                <ul className="space-y-3">
                  {[
                    "Gia sư chất lượng, được kiểm duyệt kỹ càng",
                    "Kết nối nhanh chóng, hỗ trợ 24/7",
                    "Miễn phí tìm gia sư, không thu phí phụ huynh",
                    "Đổi gia sư nếu chưa phù hợp",
                    "Bảo mật thông tin tuyệt đối",
                  ].map((text) => (
                    <li key={text} className="flex items-start gap-2.5 text-sm text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{text}</span></li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Hỗ trợ trực tiếp</h3>
                <p className="text-xs uppercase tracking-wide text-slate-400">Hotline</p>
                <p className="text-2xl font-bold text-emerald-700">090 333 1985</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">098 707 5826</p>
                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default FindTutorRequestPage;
