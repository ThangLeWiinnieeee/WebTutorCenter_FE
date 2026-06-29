import { useEffect, useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";

import SearchableSelect from "@/features/classes/components/SearchableSelect";

// Giá trị nội bộ cho lựa chọn "Tất cả" (rỗng) trong SearchableSelect.
const ALL = "__all__";

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
    if (value === undefined || value === "" || value === null || value === ALL) delete next[key];
    else next[key] = value;
    if (key === "province") delete next.district; // đổi tỉnh thì bỏ quận/huyện cũ
    onFilterChange(next);
  };

  const activeCount = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);

  // Ô tìm theo tên dùng state cục bộ + debounce 400ms để tránh gọi API mỗi lần gõ phím.
  const [nameInput, setNameInput] = useState(filters.name || "");

  // Đồng bộ lại ô nhập khi filter tên đổi từ bên ngoài (xóa chip / xóa tất cả) —
  // theo mẫu "điều chỉnh state khi prop đổi" của React (chỉnh ngay trong render, không qua effect).
  const [prevFilterName, setPrevFilterName] = useState(filters.name || "");
  if ((filters.name || "") !== prevFilterName) {
    setPrevFilterName(filters.name || "");
    setNameInput(filters.name || "");
  }

  // Áp dụng tìm theo tên sau khi ngừng gõ
  useEffect(() => {
    const trimmed = nameInput.trim();
    if (trimmed === (filters.name || "")) return;
    const timer = setTimeout(() => {
      const next = { ...filters };
      if (trimmed) next.name = trimmed;
      else delete next.name;
      onFilterChange(next);
    }, 400);
    return () => clearTimeout(timer);
  }, [nameInput, filters, onFilterChange]);

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

  const triggerClass =
    "h-11 rounded-lg border-slate-200 text-sm text-slate-700 focus-visible:ring-emerald-200";

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

      {/* Tìm theo tên gia sư */}
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tên gia sư</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Tìm theo tên gia sư..."
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {nameInput && (
            <button
              type="button"
              onClick={() => setNameInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Môn học</label>
          <SearchableSelect
            value={filters.subject || ALL}
            onValueChange={(v) => update("subject", v)}
            placeholder="Tất cả môn học"
            allValue={ALL}
            allLabel="Tất cả môn học"
            options={subjects}
            searchPlaceholder="Tìm môn học..."
            emptyText="Không có môn học"
            triggerClassName={triggerClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Chuyên môn</label>
          <SearchableSelect
            value={filters.occupationStatus || ALL}
            onValueChange={(v) => update("occupationStatus", v)}
            placeholder="Tất cả"
            allValue={ALL}
            allLabel="Tất cả"
            options={occupations}
            searchPlaceholder="Tìm..."
            emptyText="Không có dữ liệu"
            triggerClassName={triggerClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Giới tính</label>
          <SearchableSelect
            value={filters.gender || ALL}
            onValueChange={(v) => update("gender", v)}
            placeholder="Tất cả"
            allValue={ALL}
            allLabel="Tất cả"
            options={genders}
            searchPlaceholder="Tìm..."
            emptyText="Không có dữ liệu"
            triggerClassName={triggerClass}
          />
        </div>

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

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tỉnh/Thành</label>
          <SearchableSelect
            value={filters.province || ALL}
            onValueChange={(v) => update("province", v)}
            placeholder="Chọn tỉnh/thành phố"
            allValue={ALL}
            allLabel="Tất cả tỉnh/thành"
            options={provinces}
            searchPlaceholder="Tìm tỉnh/thành..."
            emptyText="Không tìm thấy khu vực"
            triggerClassName={triggerClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Quận/Huyện</label>
          <SearchableSelect
            value={filters.district || ALL}
            onValueChange={(v) => update("district", v)}
            placeholder={filters.province ? "Chọn quận/huyện" : "Chọn tỉnh trước"}
            allValue={ALL}
            allLabel="Tất cả quận/huyện"
            options={districts}
            searchPlaceholder="Tìm quận/huyện..."
            emptyText="Không tìm thấy quận/huyện"
            disabled={!filters.province}
            triggerClassName={triggerClass}
          />
        </div>
      </div>
    </div>
  );
}
