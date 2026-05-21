import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import lookupService from "@/features/tutors/services/lookupService";

export default function TutorFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [expandedSections, setExpandedSections] = useState({
    subject: true,
    status: false,
    gender: false,
    yearOfBirth: false,
    location: false,
  });

  // Lookup data from API
  const [subjects, setSubjects] = useState([]);
  const [occupationStatuses, setOccupationStatuses] = useState([]);
  const [genders, setGenders] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load lookup data on mount
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        setLoading(true);
        const [subjects, occupationStatuses, genders, provinces] = await Promise.all([
          lookupService.getSubjects(),
          lookupService.getOccupationStatuses(),
          lookupService.getGenders(),
          lookupService.getProvinces(),
        ]);

        setSubjects(subjects);
        setOccupationStatuses(occupationStatuses);
        setGenders(genders);
        setProvinces(provinces);
      } catch (error) {
        console.error("Failed to load lookup data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLookupData();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (localFilters.province) {
      const loadDistricts = async () => {
        try {
          const data = await lookupService.getDistrictsByProvince(localFilters.province);
          setDistricts(data);
        } catch (error) {
          console.error("Failed to load districts:", error);
          setDistricts([]);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
    }
  }, [localFilters.province]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubjectToggle = (subject) => {
    const current = localFilters.subjects || [];
    const updated = current.includes(subject)
      ? current.filter((s) => s !== subject)
      : [...current, subject];
    updateFilter("subjects", updated.length > 0 ? updated : undefined);
  };

  const handleOccupationChange = (status) => {
    updateFilter(
      "occupationStatus",
      status === localFilters.occupationStatus ? undefined : status
    );
  };

  const handleGenderChange = (gender) => {
    updateFilter("gender", gender === localFilters.gender ? undefined : gender);
  };

  const handleProvinceChange = (province) => {
    updateFilter("province", province === localFilters.province ? undefined : province);
    updateFilter("district", undefined); // Reset district
  };

  const handleDistrictChange = (district) => {
    updateFilter("district", district === localFilters.district ? undefined : district);
  };

  const handleYearOfBirthChange = (year) => {
    updateFilter("yearOfBirth", year || undefined);
  };

  const updateFilter = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-center text-gray-500">Đang tải bộ lọc...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Bộ Lọc
        </h3>
        {Object.keys(localFilters).some((k) => localFilters[k]) && (
          <button
            onClick={handleReset}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Xóa
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-6">
        {/* Subject Filter */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleSection("subject")}
            className="w-full text-left font-semibold text-gray-900 flex items-center justify-between"
          >
            Môn Học
            <span className="text-gray-400">{expandedSections.subject ? "−" : "+"}</span>
          </button>
          {expandedSections.subject && (
            <div className="mt-3 space-y-2">
              {subjects.map((subject) => (
                <label key={subject.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(localFilters.subjects || []).includes(subject.value)}
                    onChange={() => handleSubjectToggle(subject.value)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{subject.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Occupation Status Filter */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleSection("status")}
            className="w-full text-left font-semibold text-gray-900 flex items-center justify-between"
          >
            Chuyên Môn
            <span className="text-gray-400">{expandedSections.status ? "−" : "+"}</span>
          </button>
          {expandedSections.status && (
            <div className="mt-3 space-y-2">
              {occupationStatuses.map((status) => (
                <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={localFilters.occupationStatus === status.value}
                    onChange={() => handleOccupationChange(status.value)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{status.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Gender Filter */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleSection("gender")}
            className="w-full text-left font-semibold text-gray-900 flex items-center justify-between"
          >
            Giới Tính
            <span className="text-gray-400">{expandedSections.gender ? "−" : "+"}</span>
          </button>
          {expandedSections.gender && (
            <div className="mt-3 space-y-2">
              {genders.map((gender) => (
                <label key={gender.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={localFilters.gender === gender.value}
                    onChange={() => handleGenderChange(gender.value)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{gender.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Year of Birth Filter */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleSection("yearOfBirth")}
            className="w-full text-left font-semibold text-gray-900 flex items-center justify-between"
          >
            Năm Sinh
            <span className="text-gray-400">{expandedSections.yearOfBirth ? "−" : "+"}</span>
          </button>
          {expandedSections.yearOfBirth && (
            <div className="mt-3">
              <input
                type="number"
                min={1960}
                max={new Date().getFullYear()}
                placeholder="Nhập năm sinh (VD: 1990)"
                value={localFilters.yearOfBirth || ""}
                onChange={(e) => handleYearOfBirthChange(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>

        {/* Location Filter */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleSection("location")}
            className="w-full text-left font-semibold text-gray-900 flex items-center justify-between"
          >
            Địa Điểm
            <span className="text-gray-400">{expandedSections.location ? "−" : "+"}</span>
          </button>
          {expandedSections.location && (
            <div className="mt-3 space-y-3">
              {/* Province */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Tỉnh/Thành
                </label>
                <select
                  value={localFilters.province || ""}
                  onChange={(e) => handleProvinceChange(e.target.value || undefined)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">-- Chọn --</option>
                  {provinces.map((prov) => (
                    <option key={prov.value} value={prov.value}>
                      {prov.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              {localFilters.province && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Quận/Huyện
                  </label>
                  <select
                    value={localFilters.district || ""}
                    onChange={(e) => handleDistrictChange(e.target.value || undefined)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Chọn --</option>
                    {districts.map((dist) => (
                      <option key={dist.value} value={dist.value}>
                        {dist.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
