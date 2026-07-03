import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Filter,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Ticket,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getPromosThunk,
  createPromoThunk,
  updatePromoThunk,
  deletePromoThunk,
} from "@/admin/store/adminThunks";
import {
  ADMIN_PAGE_SIZE as PAGE_SIZE,
  PROMO_TYPE_OPTIONS as TYPE_OPTIONS,
  PROMO_STATUS_OPTIONS as STATUS_OPTIONS,
  PROMO_DEFAULT_FILTERS as DEFAULT_FILTERS,
} from "@/admin/constants";
import {
  DiscountBadge,
  StatusBadge,
  PromoFormModal,
  PromoDeleteModal,
} from "@/admin/components/promos";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const buildParams = (filters, page) => ({
  page,
  limit: PAGE_SIZE,
  ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {}),
  ...(filters.discountType ? { discountType: filters.discountType } : {}),
  ...(filters.isActive !== "" ? { isActive: filters.isActive } : {}),
});

const AdminPromosPage = () => {
  const dispatch = useDispatch();
  const { promos, promosPagination, promosLoading, promosError, promoActionLoading } = useSelector(
    (state) => state.admin,
  );

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [keywordInput, setKeywordInput] = useState(DEFAULT_FILTERS.keyword);
  const [page, setPage] = useState(1);
  const [formPromo, setFormPromo] = useState(null); // promo object (edit) hoặc {} (create)
  const [formOpen, setFormOpen] = useState(false);
  const [deletePromo, setDeletePromo] = useState(null);

  const params = useMemo(() => buildParams(filters, page), [filters, page]);

  const refetch = () => dispatch(getPromosThunk(params));

  useEffect(() => {
    dispatch(getPromosThunk(params));
  }, [dispatch, params]);

  // Tự tìm sau khi ngừng gõ (debounce 400ms) — bỏ nút "Lọc", đồng bộ hành vi với bộ lọc client.
  useEffect(() => {
    const trimmed = keywordInput.trim();
    if (trimmed === filters.keyword) return;
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, keyword: trimmed }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [keywordInput, filters.keyword]);

  // Select lọc áp dụng ngay khi đổi và quay về trang 1.
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setKeywordInput(DEFAULT_FILTERS.keyword);
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4 text-slate-500" />
          Bộ lọc mã ưu đãi
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="Tìm theo mã"
              autoComplete="off"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
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
            value={filters.discountType}
            onChange={(event) => updateFilter("discountType", event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={filters.isActive}
            onChange={(event) => updateFilter("isActive", event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
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

      <PromoDeleteModal
        promo={deletePromo}
        onClose={() => setDeletePromo(null)}
        onConfirm={handleConfirmDelete}
        loading={Boolean(deletePromo && promoActionLoading === deletePromo.id)}
      />
    </div>
  );
};

export default AdminPromosPage;
