import {
  BookOpenCheck,
  CalendarDays,
  GraduationCap,
  MapPinHouse,
  Users,
} from 'lucide-react';
import { useWatch } from 'react-hook-form';

import {
  formatDate,
  formatPrice,
} from '@/features/classes/utils/classFormatters';

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

export default BookingSummaryAsideCard;
