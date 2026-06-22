import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Clock,
  Eye,
  Filter,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";
import { getAdminClassesThunk, deleteAdminClassThunk } from "@/admin/store/adminThunks";
import {
  formatPrice,
  formatDate,
  formatDateTime,
  formatAvailabilitySlotsDetailed,
  formatStudentGender,
  formatClassTutorPrefsSummary,
} from "@/features/classes/utils/classFormatters";

const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { keyword: "", subject: "" };

const buildParams = (filters, page) => ({
  page,
  limit: PAGE_SIZE,
  ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {}),
  ...(filters.subject ? { subject: filters.subject } : {}),
});

const getPosterName = (classItem) =>
  classItem.createdBy?.fullName || classItem.createdBy?.email || "Người dùng đã xóa";

const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10";

const Field = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-0.5 text-sm text-slate-700">{children}</div>
    </div>
  </div>
);

const ClassDetailModal = ({ classItem, onClose }) => {
  if (!classItem) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
              <BookOpen className="h-4 w-4" />
              Lớp #{classItem.classCode}
            </div>
            <h2 className="mt-1.5 text-xl font-bold text-slate-900">{classItem.summary}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Đăng bởi <span className="font-medium text-slate-700">{getPosterName(classItem)}</span>
              {classItem.createdBy?.email ? ` · ${classItem.createdBy.email}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field icon={BookOpen} label="Môn học">
              {classItem.subject}
            </Field>
            <Field icon={Users} label="Học viên">
              {classItem.studentCount} người · {formatStudentGender(classItem.studentGender)}
            </Field>
            <Field icon={MapPin} label="Khu vực">
              {classItem.locationLabel || `${classItem.districtName}, ${classItem.provinceName}`}
            </Field>
            <Field icon={Phone} label="Liên hệ">
              {classItem.contactPhone || "—"}
            </Field>
            <Field icon={CalendarDays} label="Ngày bắt đầu">
              {formatDate(classItem.startDate)}
            </Field>
            <Field icon={Clock} label="Lịch học">
              <span className="whitespace-pre-line">
                {formatAvailabilitySlotsDetailed(classItem.availabilitySlots)}
              </span>
            </Field>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Yêu cầu gia sư</p>
            <p className="mt-1 text-sm text-slate-700">{formatClassTutorPrefsSummary(classItem)}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Mô tả chi tiết</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {classItem.description}
            </p>
          </div>

          <div className="grid gap-4 rounded-xl border border-slate-100 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Phí mỗi buổi</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{formatPrice(classItem.feePerSession)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Phí / tháng</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {classItem.promoDiscount > 0 ? (
                  <>
                    <span className="mr-1 text-slate-400 line-through">{formatPrice(classItem.feePerMonth)}</span>
                    {formatPrice(classItem.finalFeePerMonth)}
                  </>
                ) : (
                  formatPrice(classItem.feePerMonth)
                )}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Mã ưu đãi</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {classItem.promoCode ? `${classItem.promoCode} (-${formatPrice(classItem.promoDiscount)})` : "—"}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400">Tạo lúc {formatDateTime(classItem.createdAt)}</p>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDeleteModal = ({ classItem, onClose, onConfirm, loading }) => {
  if (!classItem) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Xóa bài đăng</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Bài đăng sẽ bị xóa vĩnh viễn cùng với{" "}
            <span className="font-semibold text-slate-800">{classItem.applicationsCount || 0}</span> đơn nhận lớp
            liên quan. Hành động này không thể hoàn tác.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">
            #{classItem.classCode} · {classItem.subject}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{classItem.summary}</p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-10 rounded-lg bg-rose-600 px-5 font-semibold text-white hover:bg-rose-700"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Xóa bài đăng
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminClassesPage = () => {
  const dispatch = useDispatch();
  const { classes, classesPagination, classesLoading, classesError, classActionLoading } = useSelector(
    (state) => state.admin,
  );

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [detailClass, setDetailClass] = useState(null);
  const [deleteClass, setDeleteClass] = useState(null);

  const params = useMemo(() => buildParams(appliedFilters, page), [appliedFilters, page]);

  const refetch = () => dispatch(getAdminClassesThunk(params));

  useEffect(() => {
    dispatch(getAdminClassesThunk(params));
  }, [dispatch, params]);

  useEffect(() => {
    let active = true;
    axiosInstance
      .get(API_ENDPOINTS.CLASSES.SUBJECTS)
      .then((res) => {
        if (active) setSubjects(res.data?.data?.subjects || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteClass) return;
    const result = await dispatch(deleteAdminClassThunk(deleteClass.id));
    if (deleteAdminClassThunk.fulfilled.match(result)) {
      setDeleteClass(null);
      if (classes.length === 1 && page > 1) {
        setPage((current) => current - 1);
        return;
      }
      refetch();
    }
  };

  const totalPages = classesPagination?.totalPages || 1;
  const totalItems = classesPagination?.totalItems || 0;
  const startIndex = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
              <BookOpen className="h-4 w-4" />
              Bài đăng
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Quản lý bài đăng tìm gia sư</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Xem toàn bộ bài đăng của người dùng, kiểm tra nội dung và gỡ bỏ bài đăng vi phạm. Khi xóa, các đơn
              nhận lớp liên quan cũng được xóa theo.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={refetch}
            disabled={classesLoading}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            {classesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Làm mới
          </Button>
        </div>
      </section>

      <form onSubmit={handleFilterSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4 text-slate-500" />
          Bộ lọc bài đăng
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.keyword}
              onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
              placeholder="Tìm theo mã lớp, tiêu đề, SĐT"
              className={`${inputCls} pl-10`}
            />
          </div>
          <select
            value={filters.subject}
            onChange={(event) => setFilters((prev) => ({ ...prev, subject: event.target.value }))}
            className={inputCls}
          >
            <option value="">Tất cả môn học</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <Button type="submit" className="h-10 rounded-lg bg-[#1e3a5f] text-white hover:bg-[#16304f]">
            Lọc
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            Xóa
          </Button>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Danh sách bài đăng</h2>
            <p className="mt-1 text-sm text-slate-500">
              Hiển thị {startIndex}–{endIndex} / {totalItems} bài đăng
            </p>
          </div>
          {classesLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
        </div>

        {classesError ? (
          <div className="m-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{classesError}</div>
        ) : classesLoading && classes.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tải danh sách bài đăng...
          </div>
        ) : classes.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <BookOpen className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Chưa có bài đăng nào</p>
            <p className="mt-1 text-sm text-slate-500">Không tìm thấy bài đăng phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Bài đăng</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Người đăng</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Khu vực</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Đơn nhận</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ngày đăng</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {classes.map((classItem) => {
                  const busy = classActionLoading === classItem.id;
                  return (
                    <tr key={classItem.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          #{classItem.classCode}
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {classItem.subject}
                          </span>
                        </p>
                        <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{classItem.summary}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">{getPosterName(classItem)}</p>
                        {classItem.createdBy?.email && (
                          <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-500">{classItem.createdBy.email}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {classItem.districtName}, {classItem.provinceName}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          <Users className="h-3.5 w-3.5" />
                          {classItem.applicationsCount || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(classItem.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailClass(classItem)}
                            className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                            Xem
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => setDeleteClass(classItem)}
                            className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                          >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm">
          <p className="text-slate-500">
            Trang {classesPagination?.page || page}/{totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || classesLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border-slate-300 text-slate-700"
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || classesLoading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-lg border-slate-300 text-slate-700"
            >
              Sau
            </Button>
          </div>
        </div>
      </section>

      {detailClass && <ClassDetailModal classItem={detailClass} onClose={() => setDetailClass(null)} />}

      <ConfirmDeleteModal
        classItem={deleteClass}
        onClose={() => setDeleteClass(null)}
        onConfirm={handleConfirmDelete}
        loading={Boolean(deleteClass && classActionLoading === deleteClass.id)}
      />
    </div>
  );
};

export default AdminClassesPage;
