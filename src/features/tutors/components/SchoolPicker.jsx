import { useCallback, useEffect, useRef, useState } from "react";
import { Search, GraduationCap, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import locationService from "@/features/tutors/services/locationService";

const SCHOOL_TYPE_LABEL = {
  university: "Đại học",
  college: "Cao đẳng",
  academy: "Học viện",
};

const SchoolPicker = ({ value, onChange }) => {
  const [query, setQuery] = useState(value || "");
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchSchools = useCallback(async (searchQuery) => {
    setLoading(true);
    try {
      const res = await locationService.searchSchools(searchQuery);
      setSchools(res.data.data.schools);
    } catch {
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSchools(query);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, open, fetchSchools]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (school) => {
    setQuery(school.name);
    onChange(school.name);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (!open) setOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Nhập tên trường để tìm kiếm..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          className="pl-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-400"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {schools.length > 0 ? (
            schools.map((school) => (
              <button
                key={school._id}
                type="button"
                onClick={() => handleSelect(school)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
              >
                <GraduationCap className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{school.name}</p>
                  <p className="text-xs text-slate-500">
                    {SCHOOL_TYPE_LABEL[school.type] || school.type}
                    {school.shortName ? ` • ${school.shortName}` : ""}
                  </p>
                </div>
              </button>
            ))
          ) : !loading ? (
            <div className="px-3 py-4 text-center text-sm text-slate-500">
              {query
                ? "Không tìm thấy trường phù hợp. Bạn có thể nhập tên trường thủ công."
                : "Nhập tên trường để tìm kiếm"}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SchoolPicker;
