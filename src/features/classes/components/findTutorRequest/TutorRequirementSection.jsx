import { Controller } from "react-hook-form";
import { ShieldCheck } from "lucide-react";

import { TUTOR_GENDER_PREF_LABEL, TUTOR_LEVEL_PREF_LABEL } from "@/features/classes/constants";

// Mục 3: yêu cầu gia sư — giới tính & trình độ. Ở luồng mời gia sư, các giá trị bị khóa theo hồ sơ.
const TutorRequirementSection = ({ control, isInvite }) => (
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
          control={control}
          render={({ field }) =>
            isInvite ? (
              <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-brand" />
                {TUTOR_GENDER_PREF_LABEL[field.value] || "Không yêu cầu"}
                <span className="ml-auto text-xs font-normal text-slate-400">Theo hồ sơ gia sư</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "any", label: "Không yêu cầu" },
                  { value: "male", label: "Nam" },
                  { value: "female", label: "Nữ" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`h-10 rounded-xl border px-2 text-xs font-semibold transition sm:text-sm ${
                      field.value === item.value
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                    }`}
                    onClick={() => field.onChange(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )
          }
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Trình độ gia sư</label>
        <Controller
          name="tutorLevelPref"
          control={control}
          render={({ field }) =>
            isInvite ? (
              <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-brand" />
                {TUTOR_LEVEL_PREF_LABEL[field.value] || "Không yêu cầu"}
                <span className="ml-auto text-xs font-normal text-slate-400">Theo hồ sơ gia sư</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "any", label: "Không yêu cầu" },
                  { value: "student", label: "Sinh viên" },
                  { value: "teacher", label: "Giáo viên" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`h-10 rounded-xl border px-2 text-xs font-semibold transition sm:text-sm ${
                      field.value === item.value
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                    }`}
                    onClick={() => field.onChange(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )
          }
        />
      </div>
    </div>
  </section>
);

export default TutorRequirementSection;
