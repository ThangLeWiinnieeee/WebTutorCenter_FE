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
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchableSelect from '@/features/classes/components/SearchableSelect';
import WeeklyHourGrid from '@/features/classes/components/WeeklyHourGrid';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  buildClassRequestSchema,
  getDefaultClassRequestValues,
  getTodayIsoDateLocal,
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
  'studentGender',
  'availabilitySlots',
  'tutorGenderPref',
  'tutorLevelPref',
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
    studentGender,
    availabilitySlots,
    tutorGenderPref,
    tutorLevelPref,
    description,
  ] = watched;

  // Section 1: Thông tin lớp học (6 fields)
  const s1Fields = [
    !!contactPhone && /^(84|0)(3|5|7|8|9)[0-9]{8}$/.test(contactPhone),
    !!subject,
    !!summary && summary.trim().length >= 10,
    !!provinceCode && Number(provinceCode) > 0,
    !!districtCode && Number(districtCode) > 0,
    !!locationLabel && locationLabel.trim().length >= 3,
  ];
  const s1Filled = s1Fields.filter(Boolean).length;
  const s1Progress = Math.round((s1Filled / 6) * 100);

  // Section 2: Lịch học (6 fields)
  const s2Fields = [
    !!studentCount && Number(studentCount) >= 1,
    !!startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate),
    !!minutesPerSession && Number(minutesPerSession) > 0,
    !!sessionsPerWeek && Number(sessionsPerWeek) >= 1,
    ['male', 'female', 'other'].includes(studentGender),
    Array.isArray(availabilitySlots) && availabilitySlots.length >= 1,
  ];
  const s2Filled = s2Fields.filter(Boolean).length;
  const s2Progress = Math.round((s2Filled / 6) * 100);

  // Section 3: Yêu cầu gia sư (2 fields)
  const s3Fields = [
    ['male', 'female', 'other', 'any'].includes(tutorGenderPref),
    ['student', 'teacher', 'any'].includes(tutorLevelPref),
  ];
  const s3Filled = s3Fields.filter(Boolean).length;
  const s3Progress = Math.round((s3Filled / 2) * 100);

  // Section 5: Mô tả chi tiết (1 field)
  const s5Fields = [
    !!description && description.trim().length >= 20,
  ];
  const s5Filled = s5Fields.filter(Boolean).length;
  const s5Progress = Math.round((s5Filled / 1) * 100);

  // Total Progress
  const totalFilled = s1Filled + s2Filled + s3Filled + s5Filled;
  const totalFields = 15;
  const progress = Math.round((totalFilled / totalFields) * 100);

  const sectionsInfo = [
    { label: '1. Thông tin lớp', progress: s1Progress },
    { label: '2. Lịch học', progress: s2Progress },
    { label: '3. Yêu cầu gia sư', progress: s3Progress },
    { label: '4. Học phí', progress: 100 },
    { label: '5. Mô tả chi tiết', progress: s5Progress },
    { label: '6. Xác nhận', progress: progress === 100 ? 100 : 0 },
  ];

  return (
    <section className="mb-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Đăng ký tìm gia sư trực tuyến
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Tìm gia sư phù hợp cho con bạn
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
            Cung cấp càng rõ thông tin lớp học, hệ thống càng ghép gia sư nhanh và chính xác.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 min-w-[150px] text-center md:text-left">
          <p className="font-semibold text-xs uppercase tracking-wider text-slate-500">Tiến độ tổng thể</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">{progress}%</p>
        </div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-xs md:grid-cols-6">
        {sectionsInfo.map((item) => {
          const isComplete = item.progress === 100;
          const isStarted = item.progress > 0;
          return (
            <div
              key={item.label}
              className={cn(
                "rounded-xl p-3 text-center border font-medium transition-all duration-300 flex flex-col justify-between gap-1 shadow-sm",
                isComplete
                  ? "bg-emerald-50/70 border-emerald-250 text-emerald-800"
                  : isStarted
                  ? "bg-amber-50/70 border-amber-250 text-amber-800"
                  : "bg-slate-50/60 border-slate-200/50 text-slate-400"
              )}
            >
              <span className="font-semibold text-slate-750">{item.label}</span>
              <span className={cn(
                "text-[10px] font-bold mt-1.5",
                isComplete ? "text-emerald-600" : isStarted ? "text-amber-600" : "text-slate-450"
              )}>
                {isComplete ? "✓ Hoàn thành" : isStarted ? `Đang điền (${item.progress}%)` : "Chưa bắt đầu"}
              </span>
            </div>
          );
        })}
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

const CustomMinutesField = ({ value, onChange, minuteOptions = [] }) => {
  const normalizedValue = Number(value) || minuteOptions[0] || 90;

  return (
    <div className="flex flex-wrap gap-2">
      {minuteOptions.map((minute) => (
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

const FindTutorRequestFormContent = ({ pricingConfig }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quote, loadingQuote, creating, latestCreated, error } = useSelector((state) => state.classes);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const minuteOptions = pricingConfig.minutesPerSessionOptions || [];
  const classRequestSchema = useMemo(() => buildClassRequestSchema(pricingConfig), [pricingConfig]);
  const defaultFormValues = useMemo(
    () =>
      loadClassRequestFormDraft(
        getDefaultClassRequestValues(pricingConfig),
        minuteOptions,
      ),
    [pricingConfig, minuteOptions],
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
      toast.success("Đăng lớp cần gia sư thành công");
      const createdClass = result.payload;
      const classId = createdClass?._id;

      // Clear flow states & reset form
      dispatch(clearClassFlow());
      form.reset(getDefaultClassRequestValues(pricingConfig));

      if (classId) {
        navigate(`/classes/${classId}`);
      } else {
        navigate("/classes");
      }
    }
  };

  const startNewClassRequest = () => {
    dispatch(clearClassFlow());
    form.reset(getDefaultClassRequestValues(pricingConfig));
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
            <Link to="/classes">Xem danh sách lớp cần gia sư</Link>
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
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại liên hệ <span className="text-rose-500">*</span></label>
                      <Input
                        className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                        placeholder="Ví dụ: 0912 345 678"
                        {...form.register("contactPhone")}
                      />
                      {errors.contactPhone && <p className="mt-1 text-xs text-rose-600">{errors.contactPhone.message}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Môn học <span className="text-rose-500">*</span></label>
                      <Controller
                        name="subject"
                        control={form.control}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Chọn môn học"
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
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Tóm tắt yêu cầu <span className="text-rose-500">*</span></label>
                      <Input
                        className="h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-200"
                        placeholder="Ví dụ: Tìm gia sư Toán lớp 9 tại Quận 7"
                        {...form.register("summary")}
                      />
                      {errors.summary && <p className="mt-1 text-xs text-rose-600">{errors.summary.message}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Địa điểm dạy <span className="text-rose-500">*</span></label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Controller
                          name="provinceCode"
                          control={form.control}
                          render={({ field }) => (
                            <SearchableSelect
                              value={field.value ? String(field.value) : ""}
                              onValueChange={(selectedValue) => {
                                const normalized = Number(selectedValue);
                                field.onChange(normalized);
                                form.setValue("districtCode", 0);
                                setDistricts([]);
                              }}
                              placeholder="Chọn tỉnh/thành phố"
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
                              value={field.value ? String(field.value) : ""}
                              onValueChange={(selectedValue) => field.onChange(Number(selectedValue))}
                              placeholder="Chọn quận/huyện"
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
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nhập địa chỉ chi tiết <span className="text-rose-500">*</span></label>
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
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Số học viên <span className="text-rose-500">*</span></label>
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
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Ngày bắt đầu <span className="text-rose-500">*</span></label>
                          <Controller
                            name="startDate"
                            control={form.control}
                            render={({ field }) => <CustomDateField value={field.value} onChange={field.onChange} />}
                          />
                          {errors.startDate && <p className="mt-1 text-xs text-rose-600">{errors.startDate.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Thời lượng mỗi buổi <span className="text-rose-500">*</span></label>
                          <p className="mb-1.5 text-xs text-slate-500">
                            Chọn một mức: {minuteOptions.join(", ")} phút
                          </p>
                          <Controller
                            name="minutesPerSession"
                            control={form.control}
                            render={({ field }) => (
                              <CustomMinutesField
                                value={field.value}
                                onChange={field.onChange}
                                minuteOptions={minuteOptions}
                              />
                            )}
                          />
                          {errors.minutesPerSession && <p className="mt-1 text-xs text-rose-600">{errors.minutesPerSession.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Số buổi / tuần <span className="text-rose-500">*</span></label>
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
                    <label className="mb-4 block text-sm font-semibold text-slate-800">Thời gian có thể học <span className="text-rose-500">*</span></label>
                    <Controller
                      control={form.control}
                      name="availabilitySlots"
                      render={({ field }) => <WeeklyHourGrid value={field.value} onChange={field.onChange} />}
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
                    5. Mô tả chi tiết <span className="text-rose-500">*</span>
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

const FindTutorRequestPage = () => {
  const [pricingConfig, setPricingConfig] = useState(null);
  const [pricingConfigError, setPricingConfigError] = useState(null);
  const [loadingPricingConfig, setLoadingPricingConfig] = useState(true);

  useEffect(() => {
    classService
      .pricingConfig()
      .then((res) => {
        const config = res.data?.data?.pricingConfig;
        if (!config) {
          setPricingConfigError("Không tải được cấu hình học phí");
          return;
        }
        setPricingConfig(config);
      })
      .catch(() => setPricingConfigError("Không tải được cấu hình học phí"))
      .finally(() => setLoadingPricingConfig(false));
  }, []);

  if (loadingPricingConfig) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-600">
        Đang tải cấu hình học phí...
      </div>
    );
  }

  if (!pricingConfig) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-rose-600">{pricingConfigError || "Không tải được cấu hình học phí"}</p>
        <p className="mt-2 text-sm text-slate-500">Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
      </div>
    );
  }

  return <FindTutorRequestFormContent pricingConfig={pricingConfig} />;
};

export default FindTutorRequestPage;
