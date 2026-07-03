import { Controller } from 'react-hook-form';
import { PhoneCall } from 'lucide-react';

import { Input } from '@/components/ui/input';
import SearchableSelect from '@/features/classes/components/SearchableSelect';

// Mục 1: thông tin lớp học — liên hệ, môn học, tóm tắt, địa điểm.
const ClassInfoSection = ({
  form,
  errors,
  subjectSelectOptions,
  provinceSelectOptions,
  districtSelectOptions,
  provinceCode,
  isInvite,
  setDistricts,
}) => (
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
                disabled={isInvite}
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
);

export default ClassInfoSection;
