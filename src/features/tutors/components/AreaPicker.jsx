import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import locationService from "@/features/tutors/services/locationService";

const AreaPicker = ({ value, onChange, mode = "single" }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await locationService.getProvinces();
        setProvinces(res.data.data.provinces || []);
      } catch {
        setProvinces([]);
      }
      setLoadingProvinces(false);
    };
    fetchProvinces();
  }, []);

  const currentProvince = mode === "single"
    ? value?.province || 0
    : value?.province || 0;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentProvince) {
        if (!cancelled) setDistricts([]);
        return;
      }
      setLoadingDistricts(true);
      try {
        const res = await locationService.getDistricts(currentProvince);
        if (!cancelled) setDistricts(res.data.data.districts || []);
      } catch {
        if (!cancelled) setDistricts([]);
      }
      if (!cancelled) setLoadingDistricts(false);
    };
    load();
    return () => { cancelled = true; };
  }, [currentProvince]);

  if (mode === "single") {
    const item = value || { province: 0, district: 0 };

    return (
      <div className="flex items-center gap-2">
        <Select
          value={item.province ? String(item.province) : ""}
          onValueChange={(v) => {
            const code = Number(v);
            onChange({ province: code, district: 0 });
          }}
        >
          <SelectTrigger className="flex-1 h-9 text-sm cursor-pointer">
            <SelectValue placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành"} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {provinces.map((p) => (
              <SelectItem key={p.code} value={String(p.code)} className="text-sm cursor-pointer">
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={item.district ? String(item.district) : ""}
          onValueChange={(v) => onChange({ ...item, district: Number(v) })}
          disabled={!item.province}
        >
          <SelectTrigger className="flex-1 h-9 text-sm cursor-pointer">
            <SelectValue placeholder={loadingDistricts ? "Đang tải..." : "Chọn quận/huyện"} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {districts.map((d) => (
              <SelectItem key={d.code} value={String(d.code)} className="text-sm cursor-pointer">
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Mode: "multi-district" — one province, multiple districts
  const selectedDistricts = value?.districts || [];

  const toggleDistrict = (code) => {
    const updated = selectedDistricts.includes(code)
      ? selectedDistricts.filter((d) => d !== code)
      : [...selectedDistricts, code];
    onChange({ province: currentProvince, districts: updated });
  };

  return (
    <div className="space-y-3">
      <Select
        value={currentProvince ? String(currentProvince) : ""}
        onValueChange={(v) => {
          const code = Number(v);
          onChange({ province: code, districts: [] });
        }}
      >
        <SelectTrigger className="h-9 text-sm cursor-pointer">
          <SelectValue placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành muốn dạy"} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {provinces.map((p) => (
            <SelectItem key={p.code} value={String(p.code)} className="text-sm cursor-pointer">
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentProvince > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">
            Chọn quận/huyện bạn có thể dạy ({selectedDistricts.length} đã chọn):
          </p>
          {loadingDistricts ? (
            <p className="text-xs text-slate-400">Đang tải quận/huyện...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
              {districts.map((d) => {
                const isSelected = selectedDistricts.includes(d.code);
                return (
                  <label
                    key={d.code}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors select-none
                      ${isSelected
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => toggleDistrict(d.code)}
                    />
                    <span className="truncate">{d.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AreaPicker;
