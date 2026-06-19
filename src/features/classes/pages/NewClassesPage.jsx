import {
  startTransition,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  CalendarDays,
  CircleHelp,
  Clock3,
  FileText,
  Filter,
  MapPin,
  MapPinned,
  PhoneCall,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import ClassReceiveDialog from '@/features/classes/components/ClassReceiveDialog';
import SearchableSelect from '@/features/classes/components/SearchableSelect';
import classService from '@/features/classes/services/classService';
import { fetchClassesThunk, applyForClassThunk } from '@/features/classes/store/classThunks';
import {
  formatAvailabilitySlotsOneLine,
  formatClassTutorPrefsSummary,
  formatStudentGender,
} from '@/features/classes/utils/classFormatters';
import useAuth from '@/features/auth/hooks/useAuth';
import locationService from '@/features/tutors/services/locationService';

const NewClassesPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { list, pagination, loadingList, applying } = useSelector((state) => state.classes);
  const [filters, setFilters] = useState({ subject: "", provinceCode: "", districtCode: "" });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [receiveDialog, setReceiveDialog] = useState({ open: false, type: "login", classItem: null });
  const pageSize = 6;
  const ALL_SUBJECTS_VALUE = "__all_subjects__";
  const ALL_PROVINCES_VALUE = "__all_provinces__";
  const ALL_DISTRICTS_VALUE = "__all_districts__";
  const normalizedSubjectFilter = useMemo(() => {
    if (!filters.subject) return "";
    const currentSubject = filters.subject.trim().toLowerCase();
    const matchedSubject = subjects.find((item) => item.toLowerCase() === currentSubject);
    return matchedSubject || filters.subject;
  }, [filters.subject, subjects]);

  useEffect(() => {
    classService
      .subjects()
      .then((res) =>
        startTransition(() => setSubjects(res.data.data.subjects || [])),
      )
      .catch(() => startTransition(() => setSubjects([])));
  }, []);

  useEffect(() => {
    locationService
      .getProvinces()
      .then((res) =>
        startTransition(() => setProvinces(res.data.data.provinces || [])),
      )
      .catch(() => startTransition(() => setProvinces([])));
  }, []);

  useEffect(() => {
    dispatch(
      fetchClassesThunk({
        ...(normalizedSubjectFilter ? { subject: normalizedSubjectFilter } : {}),
        ...(filters.provinceCode ? { provinceCode: Number(filters.provinceCode) } : {}),
        ...(filters.districtCode ? { districtCode: Number(filters.districtCode) } : {}),
        page: currentPage,
        limit: pageSize,
      })
    );
  }, [currentPage, dispatch, filters, normalizedSubjectFilter]);

  useEffect(() => {
    if (!filters.provinceCode) return;
    locationService
      .getDistricts(Number(filters.provinceCode))
      .then((res) =>
        startTransition(() => setDistricts(res.data.data.districts || [])),
      )
      .catch(() => startTransition(() => setDistricts([])));
  }, [filters.provinceCode]);

  useEffect(() => {
    startTransition(() => setCurrentPage(1));
  }, [filters]);

  const formatPrice = (value) => `${(value || 0).toLocaleString("vi-VN")}`;
  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value)
      .toLocaleString("vi-VN", {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(',', '');
  };

  const popularTags = [
    'Toán',
    'Tiếng Anh',
    'Văn',
    'Vật Lý',
    'Đàn Piano',
    'Luyện thi',
    'Tiếng Việt Lớp 1',
    'STEM',
    'Yoga',
    'IELTS',
  ];

  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems || 0;
  const returnTo = `${location.pathname}${location.search}`;

  const handleReceiveClass = (classItem) => {
    if (!isAuthenticated) {
      setReceiveDialog({ open: true, type: "login", classItem });
      return;
    }

    if (user?.role !== "tutor") {
      setReceiveDialog({ open: true, type: "tutorRequired", classItem });
      return;
    }

    setReceiveDialog({ open: true, type: "confirm", classItem });
  };

  const handleConfirmApply = async () => {
    const classItem = receiveDialog.classItem;
    const result = await dispatch(applyForClassThunk(classItem?.id || classItem?._id));
    if (applyForClassThunk.fulfilled.match(result)) {
      setReceiveDialog((prev) => ({ ...prev, type: "submitted" }));
    } else {
      setReceiveDialog((prev) => ({ ...prev, open: false }));
      toast.error(result.payload || "Không thể gửi yêu cầu nhận lớp");
    }
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      startTransition(() => setCurrentPage(totalPages));
    }
  }, [currentPage, totalPages]);

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    return [...pages]
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  const skeletonItems = useMemo(
    () => Array.from({ length: Math.min(pageSize, 3) }, (_, index) => `class-skeleton-${index}`),
    [pageSize]
  );

  return (
    <div className="mx-auto max-w-[1360px] px-6 py-8">
      <div className="sticky top-16 z-40 mb-7 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-md backdrop-blur-md ring-1 ring-white/60">
        <div className="flex items-center gap-3">
          <div className="relative min-w-[300px] flex-1">
            <BookOpenText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <SearchableSelect
              value={filters.subject || ALL_SUBJECTS_VALUE}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  subject: value === ALL_SUBJECTS_VALUE ? "" : value,
                }))
              }
              placeholder="Tất cả môn học"
              allValue={ALL_SUBJECTS_VALUE}
              allLabel="Tất cả môn học"
              options={subjects.map((subject) => ({ value: subject, label: subject }))}
              searchPlaceholder="Tìm môn học..."
              emptyText="Không tìm thấy môn học phù hợp"
              triggerClassName="h-11 rounded-xl border-slate-200 pl-10 text-sm text-slate-700 focus-visible:ring-emerald-200"
              contentClassName="max-h-80"
            />
          </div>

          <div className="relative min-w-[280px] flex-1">
            <MapPinned className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <SearchableSelect
              value={filters.provinceCode || ALL_PROVINCES_VALUE}
              onValueChange={(value) => {
                setDistricts([]);
                setFilters((prev) => ({
                  ...prev,
                  provinceCode: value === ALL_PROVINCES_VALUE ? "" : value,
                  districtCode: "",
                }));
              }}
              placeholder="Tất cả khu vực"
              allValue={ALL_PROVINCES_VALUE}
              allLabel="Tất cả khu vực"
              options={provinces.map((item) => ({ value: String(item.code), label: item.name }))}
              searchPlaceholder="Tìm tỉnh/thành..."
              emptyText="Không tìm thấy khu vực phù hợp"
              triggerClassName="h-11 rounded-xl border-slate-200 pl-10 text-sm text-slate-700 focus-visible:ring-emerald-200"
              contentClassName="max-h-80"
            />
          </div>

          <Button className="h-11 min-w-[140px] rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700">
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Bộ lọc
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Gợi ý nhanh
          </span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                filters.subject === tag
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
              }`}
              onClick={() => setFilters((prev) => ({ ...prev, subject: tag }))}
            >
              {tag}
            </button>
          ))}
        </div>

        {showAdvancedFilters && (
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
            <div className="col-span-1">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Quận/huyện
              </label>
              <SearchableSelect
                value={filters.districtCode || ALL_DISTRICTS_VALUE}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    districtCode: value === ALL_DISTRICTS_VALUE ? "" : value,
                  }))
                }
                placeholder="Tất cả quận/huyện"
                allValue={ALL_DISTRICTS_VALUE}
                allLabel="Tất cả quận/huyện"
                options={districts.map((item) => ({ value: String(item.code), label: item.name }))}
                searchPlaceholder="Tìm quận/huyện..."
                emptyText="Không tìm thấy quận/huyện phù hợp"
                disabled={!filters.provinceCode}
                triggerClassName="h-10 rounded-lg border-slate-200 text-sm text-slate-700 focus-visible:ring-emerald-200"
                contentClassName="max-h-80"
              />
            </div>

            <div className="col-span-2 flex items-end justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  setDistricts([]);
                  setFilters({ subject: "", provinceCode: "", districtCode: "" });
                }}
              >
                Xóa bộ lọc
              </Button>
              <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Dữ liệu tự cập nhật theo bộ lọc đang chọn
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-9 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Lớp cần gia sư</h1>
              <p className="text-sm text-slate-500">
                Danh sách cập nhật theo môn học, khu vực và nhu cầu thực tế.
              </p>
            </div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {totalItems} lớp khả dụng
            </span>
          </div>

          {!loadingList && list.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Chưa có lớp phù hợp với bộ lọc hiện tại.
            </div>
          )}

          {loadingList && skeletonItems.map((skeletonKey) => (
            <article
              key={skeletonKey}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="animate-pulse">
                <div className="mb-4 flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="h-7 w-3/4 rounded-md bg-slate-200" />
                    <div className="mt-3 h-4 w-1/3 rounded-md bg-slate-200" />
                  </div>
                  <div className="h-28 w-[220px] rounded-xl bg-slate-200" />
                </div>

                <div className="mb-4 h-16 w-full rounded-xl bg-slate-200" />

                <div className="mb-3 grid grid-cols-3 gap-3">
                  <div className="h-16 rounded-lg bg-slate-200" />
                  <div className="h-16 rounded-lg bg-slate-200" />
                  <div className="h-16 rounded-lg bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="h-5 rounded bg-slate-200" />
                  <div className="h-5 rounded bg-slate-200" />
                  <div className="h-5 rounded bg-slate-200" />
                  <div className="h-5 rounded bg-slate-200" />
                </div>
              </div>
            </article>
          ))}

          {!loadingList && list.map((item) => (
            <article
              key={item._id}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-[box-shadow,border-color] duration-200 ease-out hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-[22px] font-semibold leading-tight text-slate-900">
                    {item.summary || `Cần Gia Sư Môn ${item.subject} - ${item.locationLabel}`}
                  </h2>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      Mã lớp {item.classCode}
                    </span>
                    <span>•</span>
                    <Clock3 className="h-4 w-4" />
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>
                </div>

                <div className="w-[220px] shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-right">
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Học phí / buổi</p>
                  <p className="mt-1 text-3xl font-bold leading-none text-emerald-700">
                    {formatPrice(item.feePerSession)}đ
                  </p>
                  <p className="mt-1 text-xs text-emerald-700/80">
                    Phí nhận lớp 5% ({formatPrice(Math.round((item.feePerMonth || 0) * 0.05))}đ)
                  </p>
                  <Button
                    type="button"
                    className="mt-3 h-10 w-full rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
                    onClick={() => handleReceiveClass(item)}
                  >
                    Nhận lớp ngay
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-700">
                  {item.description || "Chưa có mô tả chi tiết cho lớp học này."}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-slate-700">
                  <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Users className="h-4 w-4 text-emerald-600" />
                    Học viên
                  </p>
                  <p>
                    {item.studentCount} học viên
                    {item.studentGender ? ` (${formatStudentGender(item.studentGender)})` : ""}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-slate-700">
                  <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    Lịch học
                  </p>
                  <p>{item.sessionsPerWeek} buổi/tuần ({item.minutesPerSession} phút/buổi)</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-slate-700">
                  <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <BookOpenText className="h-4 w-4 text-emerald-600" />
                    Môn học
                  </p>
                  <p>{item.subject}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <p>
                    Địa điểm: {item.locationLabel}{" "}
                    <span className="cursor-pointer text-xs font-medium text-rose-500 hover:underline">
                      (Xem bản đồ)
                    </span>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <p className="line-clamp-2 text-sm" title={formatAvailabilitySlotsOneLine(item.availabilitySlots)}>
                    Thời gian có thể học:{' '}
                    {formatAvailabilitySlotsOneLine(item.availabilitySlots)}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <p className="line-clamp-2 text-sm">
                    Yêu cầu gia sư: {formatClassTutorPrefsSummary(item)}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 text-slate-400" />
                  <Link to={`/classes/${item._id}`} className="font-medium text-sky-700 transition hover:text-sky-800 hover:underline">
                    Xem chi tiết lớp và điều kiện nhận lớp
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {!loadingList && list.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
              <p className="text-slate-500">
                Trang {currentPage}/{totalPages} • Hiển thị{" "}
                {list.length} / {totalItems} lớp
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>

                {visiblePageNumbers.map((page, index) => {
                  const prevPage = visiblePageNumbers[index - 1];
                  const hasGap = index > 0 && page - prevPage > 1;

                  return (
                    <div key={page} className="flex items-center gap-1.5">
                      {hasGap && <span className="px-1 text-slate-400">...</span>}
                      <button
                        type="button"
                        className={`min-w-9 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition ${
                          page === currentPage
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="col-span-3 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Trở thành gia sư đối tác</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Tham gia mạng lưới gia sư chuyên nghiệp để nhận lớp phù hợp theo môn và khu vực của bạn.
            </p>
            <Link to="/register-tutor">
              <Button className="mt-4 h-10 w-full rounded-lg bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700">
                Đăng ký làm gia sư
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <PhoneCall className="h-4 w-4" />
              Hỗ trợ trực tiếp
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Hotline 1</p>
            <p className="mb-2 text-2xl font-bold tracking-wide">093 143 9203</p>
            <p className="text-xs uppercase tracking-wide text-slate-400">Hotline 2</p>
            <p className="text-2xl font-bold tracking-wide">098 707 5826</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <CircleHelp className="h-4 w-4" />
              Gia sư cần biết
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="#" className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                  Quy trình nhận lớp
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
              <li>
                <Link to="#" className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                  Hợp đồng mẫu
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Danh mục phổ biến</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={() => setFilters((prev) => ({ ...prev, subject: tag }))}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <ClassReceiveDialog
        open={receiveDialog.open}
        type={receiveDialog.type}
        classItem={receiveDialog.classItem}
        returnTo={returnTo}
        onClose={() => setReceiveDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={handleConfirmApply}
        applying={applying}
      />
    </div>
  );
};

export default NewClassesPage;
