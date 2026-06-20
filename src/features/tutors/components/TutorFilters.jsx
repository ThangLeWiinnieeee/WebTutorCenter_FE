import { useMemo } from "react";
import { ChevronDown, Filter, X } from "lucide-react";

const SelectField = ({ label, value, onChange, disabled, placeholder, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  </div>
);

export default function TutorFilters({
  filters = {},
  onFilterChange,
  lookups = {},
  districts = [],
  loading = false,
}) {
  const { subjects = [], occupations = [], genders = [], provinces = [] } = lookups;

  const update = (key, value) => {
    const next = { ...filters };
    if (value === undefined || value === "" || value === null) delete next[key];
    else next[key] = value;
    if (key === "province") delete next.district; // đổi tỉnh thì bỏ quận/huyện cũ
    onFilterChange(next);
  };

  const activeCount = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-slate-900">
          <Filter className="h-5 w-5 text-emerald-600" />
          Bộ lọc
          {activeCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-semibold text-white">
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onFilterChange({})}
            className="inline-flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-600"
          >
            <X className="h-3.5 w-3.5" /> Xóa tất cả
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <SelectField
          label="Môn học"
          value={filters.subject || ""}
          onChange={(e) => update("subject", e.target.value || undefined)}
          placeholder="Tất cả môn học"
        >
          {subjects.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Chuyên môn"
          value={filters.occupationStatus || ""}
          onChange={(e) => update("occupationStatus", e.target.value || undefined)}
          placeholder="Tất cả"
        >
          {occupations.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Giới tính"
          value={filters.gender || ""}
          onChange={(e) => update("gender", e.target.value || undefined)}
          placeholder="Tất cả"
        >
          {genders.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </SelectField>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Năm sinh</label>
          <input
            type="number"
            min={1960}
            max={new Date().getFullYear()}
            placeholder="VD: 1998"
            value={filters.yearOfBirth || ""}
            onChange={(e) => update("yearOfBirth", e.target.value || undefined)}
            className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <SelectField
          label="Tỉnh/Thành"
          value={filters.province || ""}
          onChange={(e) => update("province", e.target.value || undefined)}
          placeholder="Chọn tỉnh/thành phố"
        >
          {provinces.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Quận/Huyện"
          value={filters.district || ""}
          onChange={(e) => update("district", e.target.value || undefined)}
          disabled={!filters.province}
          placeholder={filters.province ? "Chọn quận/huyện" : "Chọn tỉnh trước"}
        >
          {districts.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </SelectField>
      </div>
    </div>
  );
}
