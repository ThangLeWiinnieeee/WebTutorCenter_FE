import { Controller } from "react-hook-form";
import { CalendarCheck, Check, UserRound, Users } from "lucide-react";

import { Input } from "@/components/ui/input";
import CustomDateField from "@/features/classes/components/findTutorRequest/CustomDateField";
import CustomMinutesField from "@/features/classes/components/findTutorRequest/CustomMinutesField";
import SchedulePreviewCard from "@/features/classes/components/findTutorRequest/SchedulePreviewCard";
import WeeklyHourGrid from "@/features/classes/components/WeeklyHourGrid";
import { cn } from "@/lib/utils";

// Mục 2: lịch học — số học viên, ngày bắt đầu, thời lượng, số buổi/tuần, giới tính học viên,
// xem trước lịch và lưới khung giờ có thể học.
const ScheduleSection = ({
  control,
  errors,
  minuteOptions,
  isSingleStudent,
  isInvite,
  inviteAllowedSlots,
}) => (
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
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Số học viên <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="studentCount"
            control={control}
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
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Ngày bắt đầu buổi học <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => <CustomDateField value={field.value} onChange={field.onChange} />}
          />
          {errors.startDate && <p className="mt-1 text-xs text-rose-600">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Thời lượng mỗi buổi <span className="text-rose-500">*</span>
          </label>
          <p className="mb-1.5 text-xs text-slate-500">Chọn một mức: {minuteOptions.join(", ")} phút</p>
          <Controller
            name="minutesPerSession"
            control={control}
            render={({ field }) => (
              <CustomMinutesField
                value={field.value}
                onChange={field.onChange}
                minuteOptions={minuteOptions}
              />
            )}
          />
          {errors.minutesPerSession && (
            <p className="mt-1 text-xs text-rose-600">{errors.minutesPerSession.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Số buổi / tuần <span className="text-rose-500">*</span>
          </label>
          <Controller
            name="sessionsPerWeek"
            control={control}
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
          {errors.sessionsPerWeek && (
            <p className="mt-1 text-xs text-rose-600">{errors.sessionsPerWeek.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 xl:gap-8">
        <div className="min-w-0 xl:col-span-7">
          <label className="mb-3 block text-sm font-medium text-slate-700">Giới tính học viên</label>
          <Controller
            name="studentGender"
            control={control}
            render={({ field }) => (
              <div
                className={cn(
                  "grid grid-cols-1 gap-3",
                  isSingleStudent ? "sm:grid-cols-2" : "sm:grid-cols-3",
                )}
              >
                {[
                  { value: "male", label: "Nam", desc: "", Icon: UserRound },
                  { value: "female", label: "Nữ", desc: "", Icon: UserRound },
                  { value: "other", label: "Nam & Nữ", desc: "Ghép lớp hỗn hợp", Icon: Users },
                ]
                  .filter((item) => !(isSingleStudent && item.value === "other"))
                  .map((item) => {
                    const selected = field.value === item.value;
                    const IconCmp = item.Icon;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => field.onChange(item.value)}
                        className={cn(
                          "relative flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 transition",
                          selected
                            ? "border-emerald-600 bg-emerald-50/70 shadow-md shadow-emerald-100"
                            : "border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50",
                        )}
                      >
                        {selected && (
                          <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <IconCmp
                          className={cn("h-7 w-7", selected ? "text-emerald-700" : "text-slate-400")}
                        />
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            selected ? "text-emerald-900" : "text-slate-800",
                          )}
                        >
                          {item.label}
                        </span>
                        {item.desc ? (
                          <span className="text-center text-xs text-slate-500">{item.desc}</span>
                        ) : null}
                      </button>
                    );
                  })}
              </div>
            )}
          />
        </div>

        <div className="min-w-0 xl:col-span-5">
          <SchedulePreviewCard control={control} />
        </div>
      </div>
    </div>

    <div className="mt-8 border-t border-slate-100 pt-6">
      <label className="mb-4 block text-sm font-semibold text-slate-800">
        Thời gian có thể học <span className="text-rose-500">*</span>
      </label>
      {isInvite && (
        <p className="mb-3 text-xs font-medium text-brand">
          Chỉ có thể chọn trong các khung giờ gia sư có thể dạy (ô mờ là giờ gia sư không dạy).
        </p>
      )}
      <Controller
        control={control}
        name="availabilitySlots"
        render={({ field }) => (
          <WeeklyHourGrid value={field.value} onChange={field.onChange} allowedSlots={inviteAllowedSlots} />
        )}
      />
      {errors.availabilitySlots && (
        <p className="mt-2 text-xs text-rose-600">{errors.availabilitySlots.message}</p>
      )}
    </div>
  </section>
);

export default ScheduleSection;
