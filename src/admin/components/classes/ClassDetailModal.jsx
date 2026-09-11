import { BookOpen, CalendarDays, Clock, MapPin, Phone, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import {
  formatPrice,
  formatDate,
  formatDateTime,
  formatAvailabilitySlotsDetailed,
  formatStudentGender,
  formatClassTutorPrefsSummary,
} from "@/features/classes/utils/classFormatters";
import { getPosterName } from "./helpers";

// Ô thông tin có icon, nhãn và nội dung.
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

// Modal xem chi tiết bài đăng lớp trong trang quản lý lớp.
const ClassDetailModal = ({ classItem, onClose }) => {
  if (!classItem) return null;

  return (
    <Modal onClose={onClose} panelClassName="max-w-2xl p-0">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand">
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
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatPrice(classItem.feePerSession)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Phí / tháng</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {classItem.promoDiscount > 0 ? (
                <>
                  <span className="mr-1 text-slate-400 line-through">
                    {formatPrice(classItem.feePerMonth)}
                  </span>
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
              {classItem.promoCode
                ? `${classItem.promoCode} (-${formatPrice(classItem.promoDiscount)})`
                : "—"}
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
    </Modal>
  );
};

export default ClassDetailModal;
