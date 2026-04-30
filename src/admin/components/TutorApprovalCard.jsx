import { useState } from "react";
import { useDispatch } from "react-redux";
import { CheckCircle2, XCircle, User2, BookOpen, MapPin, GraduationCap, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { approveTutorThunk, rejectTutorThunk } from "@/admin/store/adminThunks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OCCUPATION_STATUS_LABEL, DAYS_OF_WEEK_OPTIONS } from "@/features/tutors/constants";

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  </div>
);

const dayLabel = (day) =>
  DAYS_OF_WEEK_OPTIONS.find((d) => d.value === day)?.label ?? day;

const TutorApprovalCard = ({ tutor, isActioning }) => {
  const dispatch = useDispatch();
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const handleApprove = async () => {
    const result = await dispatch(approveTutorThunk(tutor.id));
    if (!result.error) {
      toast.success(`Đã phê duyệt gia sư ${tutor.fullName}`);
    } else {
      toast.error(result.payload);
    }
  };

  const handleReject = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      setReasonError("Lý do từ chối phải có ít nhất 5 ký tự");
      return;
    }
    const result = await dispatch(rejectTutorThunk({ id: tutor.id, rejectionReason: reason.trim() }));
    if (!result.error) {
      toast.success(`Đã từ chối hồ sơ của ${tutor.fullName}`);
    } else {
      toast.error(result.payload);
    }
    setRejectMode(false);
    setReason("");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
        {tutor.avatar ? (
          <img
            src={tutor.avatar}
            alt={tutor.fullName}
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white ring-2 ring-slate-200">
            {(tutor.fullName ?? "?")[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{tutor.fullName}</p>
          <p className="text-xs text-slate-500 truncate">{tutor.email}</p>
        </div>
        <span className="text-xs text-slate-400">
          {new Date(tutor.createdAt).toLocaleDateString("vi-VN")}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 grid gap-4 sm:grid-cols-2">
        <InfoItem icon={User2} label="Điện thoại" value={tutor.phone} />
        <InfoItem
          icon={User2}
          label="Tình trạng nghề nghiệp"
          value={OCCUPATION_STATUS_LABEL[tutor.occupationStatus]}
        />
        <InfoItem icon={GraduationCap} label="Trường học" value={tutor.schoolName} />
        <InfoItem
          icon={GraduationCap}
          label="Năm tốt nghiệp"
          value={tutor.graduationYear?.toString()}
        />
        <InfoItem
          icon={BookOpen}
          label="Môn học"
          value={tutor.subjects?.join(", ")}
        />
        <InfoItem
          icon={MapPin}
          label="Khu vực hiện tại"
          value={
            tutor.currentArea
              ? `${tutor.currentArea.districtName}, ${tutor.currentArea.provinceName}`
              : "—"
          }
        />
        <div className="sm:col-span-2">
          <InfoItem
            icon={MapPin}
            label="Khu vực có thể dạy"
            value={
              tutor.teachingAreas
                ? `${tutor.teachingAreas.provinceName}: ${tutor.teachingAreas.districts?.map((d) => d.name).join(", ") || "—"}`
                : "—"
            }
          />
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-start gap-2">
            <User2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-1">Giới thiệu bản thân</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap rounded-lg bg-slate-50 border border-slate-100 p-3">
                {tutor.bio}
              </p>
            </div>
          </div>
        </div>

        {tutor.availability?.length > 0 && (
          <div className="sm:col-span-2">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 mb-2">Lịch giảng dạy</p>
                <div className="flex flex-wrap gap-1.5">
                  {tutor.availability.map((slot, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs text-blue-700"
                    >
                      {dayLabel(slot.day)}: {slot.startTime}–{slot.endTime}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5">
        {rejectMode ? (
          <div className="space-y-2">
            <Input
              placeholder="Nhập lý do từ chối (tối thiểu 5 ký tự)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError("");
              }}
            />
            {reasonError && (
              <p className="text-xs text-rose-500">{reasonError}</p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReject}
                disabled={isActioning}
                className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
              >
                {isActioning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                Xác nhận từ chối
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRejectMode(false);
                  setReason("");
                  setReasonError("");
                }}
              >
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isActioning}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {isActioning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Phê duyệt
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRejectMode(true)}
              disabled={isActioning}
              className="border-rose-200 text-rose-600 hover:bg-rose-50 gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              Từ chối
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorApprovalCard;
