import { BookOpen } from "lucide-react";

import {
  CLASS_FEE_LABEL,
  classFee,
  formatClassTutorPrefsSummary,
} from "@/features/classes/utils/classFormatters";
import { ModalShell, InfoRow, SlotChips } from "./ModalShell";
import { ClassStatusBadge } from "./badges";
import { formatPrice } from "./formatters";
import { GENDER_LABEL } from "@/constants/enums";
import { formatDate, formatDateTime } from "@/lib/format";

// Modal xem nhanh thông tin lớp khi admin duyệt đơn nhận lớp.
const ClassDetailModal = ({ classItem, onClose }) => {
  if (!classItem) return null;

  const receivingFee = classFee(classItem);
  const hasPromo = Boolean(classItem.promoCode) && (classItem.promoDiscount || 0) > 0;
  const region =
    classItem.provinceName && classItem.districtName
      ? `${classItem.districtName}, ${classItem.provinceName}`
      : classItem.provinceName || classItem.districtName || "—";

  return (
    <ModalShell title={`Bài đăng #${classItem.classCode || "—"}`} icon={BookOpen} onClose={onClose}>
      <div className="space-y-3">
        {/* Tiêu đề + trạng thái + ngày đăng */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold leading-snug text-slate-800">
              {classItem.summary || `Cần gia sư môn ${classItem.subject || ""}`}
            </p>
            <ClassStatusBadge status={classItem.status} />
          </div>
          <p className="mt-1 text-xs text-slate-400">Đăng lúc {formatDateTime(classItem.createdAt)}</p>
        </div>

        {/* Thông tin chính */}
        <div className="space-y-2.5">
          <InfoRow label="Môn học">
            <span className="font-bold text-emerald-700">{classItem.subject || "—"}</span>
          </InfoRow>
          <InfoRow label="Khu vực">{region}</InfoRow>
          <InfoRow label="Địa chỉ chi tiết">{classItem.locationLabel || "—"}</InfoRow>
          <InfoRow label="SĐT phụ huynh">{classItem.contactPhone || "—"}</InfoRow>
          <InfoRow label="Học viên">
            {classItem.studentCount ?? "—"} học viên ({GENDER_LABEL[classItem.studentGender] || "Khác"})
          </InfoRow>
          <InfoRow label="Thời lượng">
            {classItem.sessionsPerWeek} buổi/tuần · {classItem.minutesPerSession} phút/buổi
          </InfoRow>
          <InfoRow label="Ngày bắt đầu">{formatDate(classItem.startDate)}</InfoRow>
          <InfoRow label="Yêu cầu gia sư">{formatClassTutorPrefsSummary(classItem)}</InfoRow>
        </div>

        {/* Học phí */}
        <div className="space-y-1 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
          <p className="text-sm">
            <span className="font-semibold text-slate-500">Học phí:</span>{" "}
            <span className="font-bold text-emerald-700">
              {formatPrice(classItem.feePerSession)}/buổi · {formatPrice(classItem.feePerMonth)}/tháng
            </span>
          </p>
          {hasPromo && (
            <p className="text-xs text-slate-500">
              Mã ưu đãi <span className="font-semibold text-slate-700">{classItem.promoCode}</span> · giảm{" "}
              {formatPrice(classItem.promoDiscount)} → còn{" "}
              <span className="font-semibold text-emerald-700">
                {formatPrice(classItem.finalFeePerMonth)}/tháng
              </span>
            </p>
          )}
          <p className="text-xs text-slate-500">
            Phí nhận lớp ({CLASS_FEE_LABEL}):{" "}
            <span className="font-semibold text-slate-700">{formatPrice(receivingFee)}</span>
          </p>
        </div>

        {/* Lịch học yêu cầu */}
        <div>
          <span className="text-sm font-semibold text-slate-400">Lịch học yêu cầu:</span>
          <SlotChips slots={classItem.availabilitySlots} />
        </div>

        {/* Mô tả chi tiết */}
        {classItem.description && (
          <div className="border-t border-slate-100 pt-3">
            <span className="mb-1 block text-sm font-semibold text-slate-400">Mô tả chi tiết:</span>
            <p className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              {classItem.description}
            </p>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export default ClassDetailModal;
