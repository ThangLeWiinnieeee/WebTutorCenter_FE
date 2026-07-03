import { CheckCircle2, Ticket } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/features/classes/utils/classFormatters';
import { cn } from '@/lib/utils';

// Màn xác nhận thông tin & báo giá (hiện sau khi có `quote`), kèm ô nhập/gợi ý mã ưu đãi.
// `promo` gom toàn bộ trạng thái + handler của mã ưu đãi để giữ danh sách prop gọn gàng.
const QuoteConfirmationPanel = ({
  form,
  errors,
  quote,
  isInvite,
  creating,
  onBack,
  onCreate,
  promo,
}) => {
  const {
    appliedPromo,
    promoError,
    promoChecking,
    showPromoList,
    setShowPromoList,
    activeVouchers,
    promoBoxRef,
    onApply,
    onSelectVoucher,
    onRemove,
  } = promo;

  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold text-emerald-900">Xác nhận thông tin & Báo giá</h3>
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-sm">
        <p className="flex justify-between border-b border-slate-100 pb-2">
          <span className="text-slate-500">Môn học</span>
          <span className="font-semibold text-slate-800">{form.getValues('subject')}</span>
        </p>
        <p className="mt-3 flex justify-between border-b border-slate-100 pb-2">
          <span className="text-slate-500">Số học viên</span>
          <span className="font-semibold text-slate-800">{form.getValues('studentCount')}</span>
        </p>
        <p className="mt-3 flex justify-between border-b border-slate-100 pb-2">
          <span className="text-slate-500">Lịch học</span>
          <span className="font-semibold text-slate-800">{form.getValues('availabilitySlots')?.length || 0} khung giờ</span>
        </p>
        <p className="mt-3 flex justify-between text-base">
          <span className="text-slate-600">Phí 1 buổi</span>
          <span className="font-bold text-emerald-700">{formatPrice(quote.feePerSession)}</span>
        </p>
        <p className="mt-1 flex justify-between text-base">
          <span className="text-slate-600">Phí 1 tháng</span>
          <span className={cn("font-bold text-emerald-700", appliedPromo && "text-slate-400 line-through")}>
            {formatPrice(quote.feePerMonth)}
          </span>
        </p>
        {appliedPromo && (
          <>
            <p className="mt-2 flex justify-between text-sm">
              <span className="text-slate-600">Giảm giá ({appliedPromo.code})</span>
              <span className="font-semibold text-rose-600">− {formatPrice(appliedPromo.discountAmount)}</span>
            </p>
            <p className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-base">
              <span className="font-semibold text-slate-700">Phí 1 tháng sau giảm</span>
              <span className="font-bold text-emerald-700">{formatPrice(appliedPromo.finalAmount)}</span>
            </p>
          </>
        )}
      </div>
      <div className="mt-4 rounded-2xl border border-emerald-100 bg-white p-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Mã ưu đãi (nếu có)</label>
        <div ref={promoBoxRef} className="relative flex gap-2">
          <Input
            className="h-11 flex-1 rounded-xl border-slate-200 uppercase focus-visible:ring-emerald-200 disabled:opacity-70"
            placeholder="Nhập mã ưu đãi"
            disabled={Boolean(appliedPromo)}
            autoComplete="off"
            {...form.register("promoCode")}
            onFocus={() => setShowPromoList(true)}
          />
          {showPromoList && !appliedPromo && activeVouchers.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              <p className="px-2 py-1.5 text-xs font-medium text-slate-400">Mã giảm giá của bạn</p>
              {activeVouchers.map((voucher) => (
                <button
                  key={voucher.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelectVoucher(voucher)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-emerald-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Ticket className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-sm font-bold tracking-wider text-slate-900">{voucher.code}</span>
                    <span className="block text-xs font-medium text-emerald-700">
                      {voucher.discountType === "percent"
                        ? `Giảm ${voucher.discountValue}%${voucher.maxDiscountAmount ? ` (tối đa ${formatPrice(voucher.maxDiscountAmount)})` : ""}`
                        : `Giảm ${formatPrice(voucher.discountValue)}`}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {appliedPromo ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-slate-300 px-5 text-slate-700 hover:bg-slate-100"
              onClick={onRemove}
            >
              Bỏ
            </Button>
          ) : (
            <Button
              type="button"
              className="h-11 rounded-xl bg-slate-800 px-5 font-semibold text-white hover:bg-slate-900"
              onClick={() => onApply()}
              disabled={promoChecking}
            >
              {promoChecking ? "Đang kiểm tra..." : "Áp dụng"}
            </Button>
          )}
        </div>
        {appliedPromo && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã áp dụng mã {appliedPromo.code}
          </p>
        )}
        {promoError && <p className="mt-2 text-xs text-rose-600">{promoError}</p>}
        {errors.promoCode && <p className="mt-1 text-xs text-rose-600">{errors.promoCode.message}</p>}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" className="h-11 flex-1 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100" onClick={onBack}>
          Quay lại sửa
        </Button>
        <Button className="h-11 flex-1 rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700" onClick={onCreate} disabled={creating}>
          {creating
            ? isInvite
              ? "Đang gửi lời mời..."
              : "Đang đăng..."
            : isInvite
              ? "Đồng ý & Gửi lời mời"
              : "Đồng ý & Đăng bài"}
        </Button>
      </div>
    </div>
  );
};

export default QuoteConfirmationPanel;
