import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  MailQuestion,
  MapPin,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";
import {
  fetchInvitationsThunk,
  acceptInvitationThunk,
  declineInvitationThunk,
} from "@/features/classes/store/classThunks";
import {
  formatPrice,
  formatDate,
  formatAvailabilitySlotsOneLine,
  formatStudentGender,
} from "@/features/classes/utils/classFormatters";

const PAGE_SIZE = 10;

const InfoRow = ({ icon, children }) => (
  <div className="flex items-start gap-2 text-sm text-slate-600">
    {icon}
    <span className="min-w-0">{children}</span>
  </div>
);

const InvitationCard = ({ invitation, onAccept, onDecline, responding }) => {
  const cls = invitation.classItem || {};
  const [declineOpen, setDeclineOpen] = useState(false);
  const [reason, setReason] = useState("");

  const area = [cls.districtName, cls.provinceName].filter(Boolean).join(", ");
  // Phí nhận lớp = 5% học phí tháng đầu (đồng bộ với cách tính ở khu vực admin)
  const receivingFee = Math.round((cls.feePerMonth || 0) * 0.05);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#1e3a5f]/10 px-2 py-0.5 text-xs font-semibold text-[#1e3a5f]">
              Mã lớp {cls.classCode}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              {cls.subject}
            </span>
          </div>
          <h3 className="mt-2 text-base font-bold text-slate-900">{cls.summary}</h3>
        </div>
        <span className="text-xs text-slate-400">{formatDate(invitation.createdAt)}</span>
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {area && (
          <InfoRow icon={<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}>{area}</InfoRow>
        )}
        <InfoRow icon={<Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}>
          {cls.studentCount} học viên
          {formatStudentGender(cls.studentGender) ? ` · ${formatStudentGender(cls.studentGender)}` : ""}
        </InfoRow>
        <InfoRow icon={<CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}>
          Bắt đầu: {formatDate(cls.startDate)}
        </InfoRow>
        <InfoRow icon={<Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}>
          {cls.sessionsPerWeek} buổi/tuần · {cls.minutesPerSession} phút/buổi
        </InfoRow>
        <InfoRow icon={<BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}>
          {formatAvailabilitySlotsOneLine(cls.availabilitySlots)}
        </InfoRow>
      </div>

      {/* Học phí + phí nhận lớp */}
      <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
        <div className="flex items-start gap-2 text-sm">
          <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-emerald-700">{formatPrice(cls.feePerSession)}</span>
            <span className="text-slate-500">/ buổi ·</span>
            <span className="font-semibold text-emerald-700">
              {formatPrice(cls.finalFeePerMonth ?? cls.feePerMonth)}
            </span>
            <span className="text-slate-500">/ tháng</span>
          </div>
        </div>
        <p className="mt-1.5 pl-6 text-xs text-slate-500">
          Phí nhận lớp (5% học phí tháng đầu):{" "}
          <span className="font-semibold text-slate-700">{formatPrice(receivingFee)}</span>
        </p>
      </div>

      {cls.description && (
        <p className="mt-3 whitespace-pre-line rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {cls.description}
        </p>
      )}

      {!declineOpen ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            className="h-10 rounded-xl bg-emerald-600 px-5 font-semibold text-white hover:bg-emerald-700"
            onClick={() => onAccept(invitation.id)}
            disabled={responding}
          >
            <Check className="mr-1.5 h-4 w-4" />
            Đồng ý nhận lớp
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-rose-200 px-5 font-semibold text-rose-600 hover:bg-rose-50"
            onClick={() => setDeclineOpen(true)}
            disabled={responding}
          >
            <X className="mr-1.5 h-4 w-4" />
            Từ chối
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/50 p-3">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Lý do từ chối <span className="text-rose-500">*</span>
          </label>
          <textarea
            className="min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            placeholder="Nhập lý do từ chối lời mời (ít nhất 5 ký tự)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <Button
              className="h-9 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700"
              onClick={() => onDecline(invitation.id, reason.trim())}
              disabled={responding || reason.trim().length < 5}
            >
              Xác nhận từ chối
            </Button>
            <Button
              variant="outline"
              className="h-9 rounded-lg border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-100"
              onClick={() => {
                setDeclineOpen(false);
                setReason("");
              }}
              disabled={responding}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ClassInvitationsPanel() {
  const dispatch = useDispatch();
  const invitations = useSelector((state) => state.classes.invitations);
  const pagination = useSelector((state) => state.classes.invitationsPagination);
  const loading = useSelector((state) => state.classes.loadingInvitations);
  const responding = useSelector((state) => state.classes.respondingInvitation);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchInvitationsThunk({ page, limit: PAGE_SIZE }));
  }, [dispatch, page]);

  const handleAccept = async (applicationId) => {
    const result = await dispatch(acceptInvitationThunk(applicationId));
    if (!result.error) {
      toast.success("Đã đồng ý nhận lớp. Vui lòng chờ admin xét duyệt.");
    } else {
      toast.error(result.payload || "Không thể đồng ý lời mời");
    }
  };

  const handleDecline = async (applicationId, reason) => {
    const result = await dispatch(declineInvitationThunk({ applicationId, reason }));
    if (!result.error) {
      toast.success("Đã từ chối lời mời.");
    } else {
      toast.error(result.payload || "Không thể từ chối lời mời");
    }
  };

  if (loading && invitations.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <MailQuestion className="h-7 w-7" />
        </div>
        <p className="text-base font-semibold text-slate-700">Chưa có lời mời nào</p>
        <p className="max-w-md text-sm text-slate-500">
          Khi có người dùng mời bạn dạy lớp của họ, lời mời sẽ xuất hiện ở đây để bạn xem và phản hồi.
        </p>
      </div>
    );
  }

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <InvitationCard
          key={invitation.id}
          invitation={invitation}
          onAccept={handleAccept}
          onDecline={handleDecline}
          responding={responding}
        />
      ))}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(next) => {
          setPage(next);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="pt-3"
      />
    </div>
  );
}
