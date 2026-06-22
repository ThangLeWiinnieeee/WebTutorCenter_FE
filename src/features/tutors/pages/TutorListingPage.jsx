import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { Flame, UserX, X } from "lucide-react";
import AOS from "aos";

import { Button } from "@/components/ui/button";
import TutorFilters from "@/features/tutors/components/TutorFilters";
import TutorCard from "@/features/tutors/components/TutorCard";
import TopTutorCard from "@/features/tutors/components/TopTutorCard";
import TutorPagination from "@/features/tutors/components/TutorPagination";
import lookupService from "@/features/tutors/services/lookupService";
import { searchTutorsThunk, getTopTutorsThisMonthThunk } from "@/features/tutors/store/tutorThunks";

const LIMIT = 10;
const FILTER_KEYS = ["subject", "occupationStatus", "gender", "yearOfBirth", "province", "district"];

const readFilters = (params) => {
  const f = {};
  FILTER_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) f[k] = v;
  });
  return f;
};

const labelFor = (list, value) => list.find((x) => String(x.value) === String(value))?.label || value;

const CardSkeleton = () => (
  <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
    <div className="h-24 w-24 shrink-0 animate-pulse rounded-2xl bg-slate-200" />
    <div className="flex-1 space-y-3">
      <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="h-4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  </div>
);

export default function TutorListingPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchResults, topTutorsThisMonth, totalResults, loading } = useSelector((state) => state.tutors);

  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const page = Number(searchParams.get("page")) || 1;
  const searchKey = searchParams.toString();

  // Lookup data (tập trung tại page để dùng cho cả filter và chip)
  const [lookups, setLookups] = useState({ subjects: [], occupations: [], genders: [], provinces: [] });
  const [districts, setDistricts] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  useEffect(() => {
    dispatch(getTopTutorsThisMonthThunk(10));
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingLookups(true);
        const [subjects, occupations, genders, provinces] = await Promise.all([
          lookupService.getSubjects(),
          lookupService.getOccupationStatuses(),
          lookupService.getGenders(),
          lookupService.getProvinces(),
        ]);
        if (!cancelled) setLookups({ subjects, occupations, genders, provinces });
      } catch {
        if (!cancelled) setLookups({ subjects: [], occupations: [], genders: [], provinces: [] });
      } finally {
        if (!cancelled) setLoadingLookups(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load districts khi đổi tỉnh
  useEffect(() => {
    if (!filters.province) {
      setDistricts([]);
      return;
    }
    let cancelled = false;
    lookupService
      .getDistrictsByProvince(filters.province)
      .then((data) => !cancelled && setDistricts(data))
      .catch(() => !cancelled && setDistricts([]));
    return () => {
      cancelled = true;
    };
  }, [filters.province]);

  // Fetch kết quả theo URL
  useEffect(() => {
    dispatch(searchTutorsThunk({ filters, page, limit: LIMIT }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, searchKey]);

  const applyFilters = (nextFilters, nextPage = 1) => {
    const params = new URLSearchParams();
    FILTER_KEYS.forEach((k) => {
      if (nextFilters[k]) params.set(k, String(nextFilters[k]));
    });
    if (nextPage > 1) params.set("page", String(nextPage));
    setSearchParams(params);
  };

  const handleFilterChange = (nextFilters) => applyFilters(nextFilters, 1);

  const handlePageChange = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeFilter = (key) => {
    const next = { ...filters };
    delete next[key];
    if (key === "province") delete next.district;
    applyFilters(next, 1);
  };

  // Chips trạng thái lọc đang áp dụng (đã resolve label)
  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.subject) chips.push({ key: "subject", label: `Môn: ${labelFor(lookups.subjects, filters.subject)}` });
    if (filters.occupationStatus)
      chips.push({ key: "occupationStatus", label: `Chuyên môn: ${labelFor(lookups.occupations, filters.occupationStatus)}` });
    if (filters.gender) chips.push({ key: "gender", label: `Giới tính: ${labelFor(lookups.genders, filters.gender)}` });
    if (filters.yearOfBirth) chips.push({ key: "yearOfBirth", label: `Năm sinh: ${filters.yearOfBirth}` });
    if (filters.province) chips.push({ key: "province", label: `Tỉnh/Thành: ${labelFor(lookups.provinces, filters.province)}` });
    if (filters.district) chips.push({ key: "district", label: `Quận/Huyện: ${labelFor(districts, filters.district)}` });
    return chips;
  }, [filters, lookups, districts]);

  // Tính lại vị trí kích hoạt animation sau khi danh sách (load bất đồng bộ) thay đổi
  useEffect(() => {
    AOS.refresh();
  }, [loading, searchResults.length, topTutorsThisMonth?.length]);

  const hasActiveFilters = activeChips.length > 0;
  const totalPages = Math.ceil(totalResults / LIMIT) || 1;
  const rangeStart = totalResults === 0 ? 0 : (page - 1) * LIMIT + 1;
  const rangeEnd = Math.min(page * LIMIT, totalResults);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header band */}
      <div className="border-b border-slate-200 bg-linear-to-r from-[#1e3a5f] to-[#2c5282]">
        <div className="mx-auto max-w-7xl px-6 py-10" data-aos="fade-down">
          <h1 className="text-3xl font-bold text-white">Danh sách gia sư</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200">
            Kết nối với đội ngũ gia sư đã được duyệt hồ sơ — lọc theo môn học, khu vực và kinh nghiệm để tìm người phù hợp nhất.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* Filter bar (toàn bộ bộ lọc nằm trên đầu) */}
        <TutorFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          lookups={lookups}
          districts={districts}
          loading={loadingLookups}
        />

        {/* Top tutors this month — chỉ hiện khi không lọc */}
        {!hasActiveFilters && topTutorsThisMonth?.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Flame className="h-5 w-5 text-orange-500" />
              Gia sư hàng đầu tháng này
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {topTutorsThisMonth.slice(0, 5).map((tutor, idx) => (
                <Link key={tutor.id} to={`/tutors/${tutor.id}`} data-aos="fade-up" data-aos-delay={idx * 60}>
                  <TopTutorCard tutor={tutor} rank={idx + 1} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Results header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Tìm thấy <span className="font-bold text-slate-900">{totalResults}</span> gia sư
            {totalResults > 0 && (
              <span className="text-slate-400">
                {" "}
                · hiển thị {rangeStart}–{rangeEnd}
              </span>
            )}
          </p>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="-mt-2 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => removeFilter(chip.key)}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                {chip.label}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => applyFilters({}, 1)}
              className="text-xs font-medium text-rose-500 hover:text-rose-600"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <UserX className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold text-slate-700">Không tìm thấy gia sư phù hợp</p>
            <p className="max-w-md text-sm text-slate-500">
              Hãy thử nới lỏng bộ lọc hoặc xóa bớt điều kiện tìm kiếm để xem thêm gia sư.
            </p>
            {hasActiveFilters && (
              <Button
                type="button"
                onClick={() => applyFilters({}, 1)}
                className="mt-2 h-10 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((tutor, idx) => (
                <Link
                  key={tutor.id}
                  to={`/tutors/${tutor.id}`}
                  data-aos="fade-up"
                  data-aos-delay={Math.min(idx, 5) * 50}
                >
                  <TutorCard tutor={tutor} />
                </Link>
              ))}
            </div>
            <TutorPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}
