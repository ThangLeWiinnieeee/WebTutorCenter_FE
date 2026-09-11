import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, Eye, Filter, Loader2, RefreshCw, Search, Trash2, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import axiosInstance from "@/services/axiosInstance";
import API_ENDPOINTS from "@/constants/apiEndpoints";
import { getAdminClassesThunk, deleteAdminClassThunk } from "@/admin/store/adminThunks";
import { ADMIN_PAGE_SIZE as PAGE_SIZE, CLASS_DEFAULT_FILTERS as DEFAULT_FILTERS } from "@/admin/constants";
import { formatDate } from "@/features/classes/utils/classFormatters";
import ClassDetailModal from "@/admin/components/classes/ClassDetailModal";
import ClassDeleteModal from "@/admin/components/classes/ClassDeleteModal";
import { getPosterName } from "@/admin/components/classes/helpers";

// Dựng tham số truy vấn danh sách lớp từ bộ lọc và số trang.
const buildParams = (filters, keyword, page) => ({
  page,
  limit: PAGE_SIZE,
  ...(keyword ? { keyword } : {}),
  ...(filters.subject ? { subject: filters.subject } : {}),
});

const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10";

// Trang admin quản lý bài đăng lớp: lọc, xem chi tiết và xóa mềm.
const AdminClassesPage = () => {
  const dispatch = useDispatch();
  const { classes, classesPagination, classesLoading, classesError, classActionLoading } = useSelector(
    (state) => state.admin,
  );

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [keywordInput, setKeywordInput] = useState("");
  const [page, setPage] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [detailClass, setDetailClass] = useState(null);
  const [deleteClass, setDeleteClass] = useState(null);

  const debouncedKeyword = useDebouncedValue(keywordInput.trim());

  // Từ khóa vừa chốt sau debounce → quay về trang 1. Chỉnh state ngay trong lượt render
  // (pattern "adjusting state when props change" của React) chứ không đặt trong onChange
  // hay useEffect: hai cách kia đều bắn thêm một lượt fetch thừa với từ khóa cũ.
  const [appliedKeyword, setAppliedKeyword] = useState(debouncedKeyword);
  if (appliedKeyword !== debouncedKeyword) {
    setAppliedKeyword(debouncedKeyword);
    setPage(1);
  }

  const params = useMemo(
    () => buildParams(filters, debouncedKeyword, page),
    [filters, debouncedKeyword, page],
  );

  // Tải lại danh sách lớp theo bộ lọc hiện tại.
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

  // Select lọc áp dụng ngay khi đổi và quay về trang 1.
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Xóa toàn bộ bộ lọc về mặc định.
  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setKeywordInput("");
    setPage(1);
  };

  // Xác nhận xóa mềm lớp đang chọn.
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
            <div className="flex items-center gap-2 text-sm font-semibold text-brand">
              <BookOpen className="h-4 w-4" />
              Bài đăng
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Quản lý bài đăng tìm gia sư</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Xem toàn bộ bài đăng của người dùng, kiểm tra nội dung và gỡ bỏ bài đăng vi phạm. Khi xóa, các
              đơn nhận lớp liên quan cũng được xóa theo.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={refetch}
            disabled={classesLoading}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            {classesLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Làm mới
          </Button>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4 text-slate-500" />
          Bộ lọc bài đăng
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="Tìm theo mã lớp, tiêu đề, SĐT"
              autoComplete="off"
              className={`${inputCls} pl-10 pr-9`}
            />
            {keywordInput && (
              <button
                type="button"
                onClick={() => setKeywordInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Xóa từ khóa"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={filters.subject}
            onChange={(event) => updateFilter("subject", event.target.value)}
            className={inputCls}
          >
            <option value="">Tất cả môn học</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            Xóa
          </Button>
        </div>
      </div>

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
          <div className="m-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {classesError}
          </div>
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
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bài đăng
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Người đăng
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Khu vực
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Đơn nhận
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ngày đăng
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Thao tác
                  </th>
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
                          <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-500">
                            {classItem.createdBy.email}
                          </p>
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
                            {busy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </section>

      {detailClass && <ClassDetailModal classItem={detailClass} onClose={() => setDetailClass(null)} />}

      <ClassDeleteModal
        classItem={deleteClass}
        onClose={() => setDeleteClass(null)}
        onConfirm={handleConfirmDelete}
        loading={Boolean(deleteClass && classActionLoading === deleteClass.id)}
      />
    </div>
  );
};

export default AdminClassesPage;
