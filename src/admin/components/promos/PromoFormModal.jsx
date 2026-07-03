import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Ticket, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { promoSchema } from "@/admin/schemas/promoSchema";
import { scrollToFirstError } from "@/lib/formErrors";

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

  const handleSubmit = form.handleSubmit((values) => onSubmit(buildPayload(values)), scrollToFirstError);

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

export default PromoFormModal;
