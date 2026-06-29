import { useEffect, useMemo, useState } from "react";
import { normalizeForSearch } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";
import {
  getSubjectsThunk,
  createSubjectThunk,
  updateSubjectThunk,
} from "@/admin/store/adminThunks";
import { subjectSchema } from "@/admin/schemas/subjectSchema";
import { scrollToFirstError } from "@/lib/formErrors";

const PAGE_SIZE = 10;

const getFormValues = (subject) => ({
  name: subject?.name || "",
  isActive: subject?.isActive === false ? "false" : "true",
});

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
      active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"
    }`}
  >
    {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
    {active ? "Đang bật" : "Đã tắt"}
  </span>
);

const SubjectFormModal = ({ subject, onClose, onSubmit, loading }) => {
  const isEdit = Boolean(subject);
  const form = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: getFormValues(subject),
  });
  const errors = form.formState.errors;

  useEffect(() => {
    form.reset(getFormValues(subject));
  }, [form, subject]);

  const handleSubmit = form.handleSubmit(
    (values) => onSubmit({ name: values.name.trim(), isActive: values.isActive === "true" }),
    scrollToFirstError
  );

  const inputCls =
    "h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
              <BookOpen className="h-4 w-4" />
              {isEdit ? "Cập nhật môn học" : "Thêm môn học"}
            </div>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              {isEdit ? "Sửa môn học" : "Môn học mới"}
            </h2>
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

        <div className="mt-6 space-y-4">
          <label className="space-y-1.5 block">
            <span className="text-sm font-semibold text-slate-700">Tên môn học</span>
            <input {...form.register("name")} className={inputCls} placeholder="VD: Toán" autoFocus />
            {errors.name && <span className="text-xs text-rose-600">{errors.name.message}</span>}
          </label>

          {isEdit && (
            <label className="space-y-1.5 block">
              <span className="text-sm font-semibold text-slate-700">Trạng thái</span>
              <select {...form.register("isActive")} className={inputCls}>
                <option value="true">Đang bật</option>
                <option value="false">Đã tắt</option>
              </select>
            </label>
          )}
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
            type="submit"
            disabled={loading}
            className="h-10 rounded-lg bg-[#1e3a5f] px-5 font-semibold text-white hover:bg-[#16304f]"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Thêm môn"}
          </Button>
        </div>
      </form>
    </div>
  );
};

const AdminSubjectsPage = () => {
  const dispatch = useDispatch();
  const { subjects, subjectsLoading, subjectsError, subjectActionLoading } = useSelector(
    (state) => state.admin
  );

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [formSubject, setFormSubject] = useState(null);

  const refetch = () => dispatch(getSubjectsThunk());

  useEffect(() => {
    dispatch(getSubjectsThunk());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const kw = normalizeForSearch(keyword);
    if (!kw) return subjects;
    return subjects.filter((s) => normalizeForSearch(s.name).includes(kw));
  }, [subjects, keyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Giữ trang hiện tại hợp lệ khi danh sách đã lọc thu nhỏ lại — điều chỉnh ngay trong
  // render (mẫu "adjust state during render" của React), không dùng effect.
  if (page > totalPages) setPage(totalPages);

  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const handleKeywordChange = (value) => {
    setKeyword(value);
    setPage(1);
  };

  const handlePageChange = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCreate = () => {
    setFormSubject(null);
    setFormOpen(true);
  };

  const openEdit = (subject) => {
    setFormSubject(subject);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    const action = formSubject
      ? updateSubjectThunk({ id: formSubject.id, payload })
      : createSubjectThunk(payload);
    const result = await dispatch(action);
    const matcher = formSubject ? updateSubjectThunk.fulfilled : createSubjectThunk.fulfilled;
    if (matcher.match(result)) {
      setFormOpen(false);
      setFormSubject(null);
      refetch();
    }
  };

  const handleToggleActive = (subject) => {
    dispatch(updateSubjectThunk({ id: subject.id, payload: { isActive: !subject.isActive } }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
              <BookOpen className="h-4 w-4" />
              Môn học
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Quản lý môn học</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Thêm môn học mới, sửa tên hoặc bật/tắt môn. Môn đã tắt sẽ không hiện trong các form chọn môn,
              nhưng dữ liệu gia sư/lớp cũ vẫn giữ nguyên.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={refetch}
              disabled={subjectsLoading}
              className="h-10 rounded-lg border-slate-300 text-slate-700"
            >
              {subjectsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Làm mới
            </Button>
            <Button
              type="button"
              onClick={openCreate}
              className="h-10 rounded-lg bg-[#1e3a5f] px-4 font-semibold text-white hover:bg-[#16304f]"
            >
              <Plus className="h-4 w-4" />
              Thêm môn
            </Button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Danh sách môn học</h2>
            <p className="mt-1 text-sm text-slate-500">{filtered.length} môn</p>
          </div>
          <div className="relative w-64 max-w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              placeholder="Tìm theo tên môn"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
          </div>
        </div>

        {subjectsError ? (
          <div className="m-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {subjectsError}
          </div>
        ) : subjectsLoading && subjects.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tải danh sách môn học...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <BookOpen className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Chưa có môn học</p>
            <p className="mt-1 text-sm text-slate-500">Bấm "Thêm môn" để tạo môn học mới.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tên môn</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paged.map((subject) => {
                  const busy = subjectActionLoading === subject.id;
                  return (
                    <tr key={subject.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-800">{subject.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge active={subject.isActive} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => openEdit(subject)}
                            className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" />
                            Sửa
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => handleToggleActive(subject)}
                            className={`rounded-lg ${
                              subject.isActive
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {subject.isActive ? "Tắt" : "Bật"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="border-t border-slate-100 px-5 py-4"
              />
            )}
          </div>
        )}
      </section>

      {formOpen && (
        <SubjectFormModal
          subject={formSubject}
          onClose={() => {
            setFormOpen(false);
            setFormSubject(null);
          }}
          onSubmit={handleFormSubmit}
          loading={subjectActionLoading === "create" || (formSubject && subjectActionLoading === formSubject.id)}
        />
      )}
    </div>
  );
};

export default AdminSubjectsPage;
