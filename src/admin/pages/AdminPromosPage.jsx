import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Loader2,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Ticket,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getPromosThunk,
  createPromoThunk,
  updatePromoThunk,
  deletePromoThunk,
} from "@/admin/store/adminThunks";
import { promoSchema } from "@/admin/schemas/promoSchema";
import {
  ADMIN_PAGE_SIZE as PAGE_SIZE,
  PROMO_TYPE_OPTIONS as TYPE_OPTIONS,
  PROMO_STATUS_OPTIONS as STATUS_OPTIONS,
  PROMO_DEFAULT_FILTERS as DEFAULT_FILTERS,
} from "@/admin/constants";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  // yyyy-mm-dd theo giờ địa phương
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
};

const getPromoFormValues = (promo) => ({
  code: promo?.code || "",
  description: promo?.description || "",
  discountType: promo?.discountType || "percent",
  discountValue: promo?.discountValue != null ? String(promo.discountValue) : "",
  maxDiscountAmount: promo?.maxDiscountAmount != null ? String(promo.maxDiscountAmount) : "",
  usageLimit: promo?.usageLimit != null ? String(promo.usageLimit) : "",
  startsAt: formatDateInput(promo?.startsAt),
  expiresAt: formatDateInput(promo?.expiresAt),
  isActive: promo?.isActive === false ? "false" : "true",
});

const buildParams = (filters, page) => ({
  page,
  limit: PAGE_SIZE,
  ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {}),
  ...(filters.discountType ? { discountType: filters.discountType } : {}),
  ...(filters.isActive !== "" ? { isActive: filters.isActive } : {}),
});

const buildPayload = (values) => {
  const isPercent = values.discountType === "percent";
  return {
    code: values.code.trim().toUpperCase(),
    description: values.description?.trim() || "",
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
    maxDiscountAmount: isPercent && values.maxDiscountAmount ? Number(values.maxDiscountAmount) : null,
    usageLimit: values.usageLimit ? Number(values.usageLimit) : null,
    startsAt: values.startsAt ? new Date(`${values.startsAt}T00:00:00`).toISOString() : null,
    expiresAt: values.expiresAt ? new Date(`${values.expiresAt}T23:59:59`).toISOString() : null,
    isActive: values.isActive === "true",
  };
};

const DiscountBadge = ({ promo }) =>
  promo.discountType === "percent" ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
      <Percent className="h-3.5 w-3.5" />
      Giảm {promo.discountValue}%
      {promo.maxDiscountAmount != null && (
        <span className="font-normal text-violet-500">(tối đa {formatPrice(promo.maxDiscountAmount)})</span>
      )}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <Tag className="h-3.5 w-3.5" />
      Giảm {formatPrice(promo.discountValue)}
    </span>
  );

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

const PromoFormModal = ({ promo, onClose, onSubmit, loading }) => {
  const isEdit = Boolean(promo);
  const form = useForm({
    resolver: zodResolver(promoSchema),
    defaultValues: getPromoFormValues(promo),
  });
  const errors = form.formState.errors;
  const discountType = form.watch("discountType");

  useEffect(() => {
    form.reset(getPromoFormValues(promo));
  }, [form, promo]);

  const handleSubmit = form.handleSubmit((values) => onSubmit(buildPayload(values)));

  const inputCls =
    "h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
              <Ticket className="h-4 w-4" />
              {isEdit ? "Cập nhật mã ưu đãi" : "Tạo mã ưu đãi"}
            </div>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              {isEdit ? "Sửa thông tin mã" : "Mã ưu đãi mới"}
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Mã ưu đãi</span>
            <input
              {...form.register("code")}
              className={`${inputCls} uppercase`}
              placeholder="VD: SALE10"
              autoCapitalize="characters"
            />
            {errors.code && <span className="text-xs text-rose-600">{errors.code.message}</span>}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Trạng thái</span>
            <select {...form.register("isActive")} className={inputCls}>
              <option value="true">Đang bật</option>
              <option value="false">Đã tắt</option>
            </select>
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Mô tả (tùy chọn)</span>
            <input
              {...form.register("description")}
              className={inputCls}
              placeholder="VD: Ưu đãi hè cho học viên mới"
            />
            {errors.description && <span className="text-xs text-rose-600">{errors.description.message}</span>}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Loại giảm giá</span>
            <select {...form.register("discountType")} className={inputCls}>
              <option value="percent">Giảm theo %</option>
              <option value="fixed">Giảm số tiền (VND)</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">
              {discountType === "percent" ? "Phần trăm giảm (%)" : "Số tiền giảm (VND)"}
            </span>
            <input
              type="number"
              min="0"
              {...form.register("discountValue")}
              className={inputCls}
              placeholder={discountType === "percent" ? "VD: 10" : "VD: 50000"}
            />
            {errors.discountValue && <span className="text-xs text-rose-600">{errors.discountValue.message}</span>}
          </label>

          {discountType === "percent" && (
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Trần giảm tối đa (VND, tùy chọn)</span>
              <input
                type="number"
                min="0"
                {...form.register("maxDiscountAmount")}
                className={inputCls}
                placeholder="VD: 100000 — để trống nếu không giới hạn"
              />
              {errors.maxDiscountAmount && (
                <span className="text-xs text-rose-600">{errors.maxDiscountAmount.message}</span>
              )}
            </label>
          )}

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Giới hạn lượt dùng (tùy chọn)</span>
            <input
              type="number"
              min="1"
              {...form.register("usageLimit")}
              className={inputCls}
              placeholder="Để trống nếu không giới hạn"
            />
            {errors.usageLimit && <span className="text-xs text-rose-600">{errors.usageLimit.message}</span>}
          </label>

          <div className="hidden sm:block" />

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Ngày bắt đầu (tùy chọn)</span>
            <input type="date" {...form.register("startsAt")} className={inputCls} />
            {errors.startsAt && <span className="text-xs text-rose-600">{errors.startsAt.message}</span>}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Ngày hết hạn (tùy chọn)</span>
            <input type="date" {...form.register("expiresAt")} className={inputCls} />
            {errors.expiresAt && <span className="text-xs text-rose-600">{errors.expiresAt.message}</span>}
          </label>
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
            {isEdit ? "Lưu thay đổi" : "Tạo mã"}
          </Button>
        </div>
      </form>
    </div>
  );
};

const ConfirmDeleteModal = ({ promo, onClose, onConfirm, loading }) => {
  if (!promo) return null;

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
          <h2 className="text-xl font-bold text-slate-900">Xóa mã ưu đãi</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Mã sẽ bị xóa vĩnh viễn khỏi hệ thống. Nếu chỉ muốn tạm dừng, hãy dùng nút bật/tắt.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">{promo.code}</p>
          {promo.description && <p className="mt-1 text-xs text-slate-500">{promo.description}</p>}
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
            Xóa mã
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminPromosPage = () => {
  const dispatch = useDispatch();
  const { promos, promosPagination, promosLoading, promosError, promoActionLoading } = useSelector(
    (state) => state.admin,
  );

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [formPromo, setFormPromo] = useState(null); // promo object (edit) hoặc {} (create)
  const [formOpen, setFormOpen] = useState(false);
  const [deletePromo, setDeletePromo] = useState(null);

  const params = useMemo(() => buildParams(appliedFilters, page), [appliedFilters, page]);

  const refetch = () => dispatch(getPromosThunk(params));

  useEffect(() => {
    dispatch(getPromosThunk(params));
  }, [dispatch, params]);

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

  const openCreate = () => {
    setFormPromo(null);
    setFormOpen(true);
  };

  const openEdit = (promo) => {
    setFormPromo(promo);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    const action = formPromo
      ? updatePromoThunk({ id: formPromo.id, payload })
      : createPromoThunk(payload);
    const result = await dispatch(action);
    const matcher = formPromo ? updatePromoThunk.fulfilled : createPromoThunk.fulfilled;
    if (matcher.match(result)) {
      setFormOpen(false);
      setFormPromo(null);
      refetch();
    }
  };

  const handleToggleActive = (promo) => {
    dispatch(updatePromoThunk({ id: promo.id, payload: { isActive: !promo.isActive } }));
  };

  const handleConfirmDelete = async () => {
    if (!deletePromo) return;
    const result = await dispatch(deletePromoThunk(deletePromo.id));
    if (deletePromoThunk.fulfilled.match(result)) {
      setDeletePromo(null);
      if (promos.length === 1 && page > 1) {
        setPage((current) => current - 1);
        return;
      }
      refetch();
    }
  };

  const totalPages = promosPagination?.totalPages || 1;
  const totalItems = promosPagination?.totalItems || 0;
  const startIndex = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
              <Ticket className="h-4 w-4" />
              Khuyến mãi
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Quản lý mã ưu đãi</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Tạo và quản lý mã giảm giá (theo % hoặc số tiền), đặt ngày hiệu lực, giới hạn lượt dùng và trần giảm tối đa.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={refetch}
              disabled={promosLoading}
              className="h-10 rounded-lg border-slate-300 text-slate-700"
            >
              {promosLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Làm mới
            </Button>
            <Button
              type="button"
              onClick={openCreate}
              className="h-10 rounded-lg bg-[#1e3a5f] px-4 font-semibold text-white hover:bg-[#16304f]"
            >
              <Plus className="h-4 w-4" />
              Tạo mã
            </Button>
          </div>
        </div>
      </section>

      <form onSubmit={handleFilterSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4 text-slate-500" />
          Bộ lọc mã ưu đãi
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.keyword}
              onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
              placeholder="Tìm theo mã"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
          </div>
          <select
            value={filters.discountType}
            onChange={(event) => setFilters((prev) => ({ ...prev, discountType: event.target.value }))}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={filters.isActive}
            onChange={(event) => setFilters((prev) => ({ ...prev, isActive: event.target.value }))}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
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
            <h2 className="text-lg font-bold text-slate-900">Danh sách mã ưu đãi</h2>
            <p className="mt-1 text-sm text-slate-500">
              Hiển thị {startIndex}–{endIndex} / {totalItems} mã
            </p>
          </div>
          {promosLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
        </div>

        {promosError ? (
          <div className="m-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{promosError}</div>
        ) : promosLoading && promos.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tải danh sách mã ưu đãi...
          </div>
        ) : promos.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <Ticket className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Chưa có mã ưu đãi</p>
            <p className="mt-1 text-sm text-slate-500">Bấm "Tạo mã" để thêm mã giảm giá mới.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Mã</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Giảm giá</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Hiệu lực</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Lượt dùng</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {promos.map((promo) => {
                  const busy = promoActionLoading === promo.id;
                  return (
                    <tr key={promo.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-800">{promo.code}</p>
                        {promo.description && (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{promo.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <DiscountBadge promo={promo} />
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(promo.startsAt) || formatDate(promo.expiresAt) ? (
                          <span>
                            {formatDate(promo.startsAt) || "—"} <span className="text-slate-400">→</span>{" "}
                            {formatDate(promo.expiresAt) || "Không hết hạn"}
                          </span>
                        ) : (
                          <span className="text-slate-400">Không giới hạn</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">{promo.usedCount}</span>
                        <span className="text-slate-400"> / {promo.usageLimit ?? "∞"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge active={promo.isActive} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => openEdit(promo)}
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
                            onClick={() => handleToggleActive(promo)}
                            className={`rounded-lg ${
                              promo.isActive
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {promo.isActive ? "Tắt" : "Bật"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => setDeletePromo(promo)}
                            className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
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
            Trang {promosPagination?.page || page}/{totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || promosLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border-slate-300 text-slate-700"
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || promosLoading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-lg border-slate-300 text-slate-700"
            >
              Sau
            </Button>
          </div>
        </div>
      </section>

      {formOpen && (
        <PromoFormModal
          promo={formPromo}
          onClose={() => {
            setFormOpen(false);
            setFormPromo(null);
          }}
          onSubmit={handleFormSubmit}
          loading={promoActionLoading === "create" || (formPromo && promoActionLoading === formPromo.id)}
        />
      )}

      <ConfirmDeleteModal
        promo={deletePromo}
        onClose={() => setDeletePromo(null)}
        onConfirm={handleConfirmDelete}
        loading={Boolean(deletePromo && promoActionLoading === deletePromo.id)}
      />
    </div>
  );
};

export default AdminPromosPage;
