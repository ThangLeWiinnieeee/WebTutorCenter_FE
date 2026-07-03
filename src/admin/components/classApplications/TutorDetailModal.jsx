import { Users } from "lucide-react";

import { ModalShell, InfoRow, SlotChips } from "./ModalShell";
import { TutorAvatar, SubjectMatchBadge } from "./badges";
import { genderLabel, occupationLabel } from "./formatters";

const TutorDetailModal = ({ tutor, classSubject, onClose }) => {
  if (!tutor) return null;
  return (
    <ModalShell title="Thông tin gia sư" icon={Users} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <TutorAvatar tutor={tutor} size="h-12 w-12" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-800">{tutor.fullName || "—"}</p>
            <p className="truncate text-xs text-slate-500">{tutor.email || "—"}</p>
          </div>
          <SubjectMatchBadge tutorSubjects={tutor.subjects} classSubject={classSubject} />
        </div>

        <div className="space-y-2.5">
          <InfoRow label="Số điện thoại">{tutor.phone || "—"}</InfoRow>
          <InfoRow label="Giới tính / Trình độ">
            {genderLabel(tutor.gender)} · {occupationLabel(tutor.occupationStatus)}
          </InfoRow>
          <InfoRow label="Học vị / Trường">
            {tutor.schoolName || "—"} {tutor.graduationYear ? `(Tốt nghiệp ${tutor.graduationYear})` : ""}
          </InfoRow>
          <InfoRow label="Môn đăng ký dạy">{tutor.subjects?.join(", ") || "—"}</InfoRow>
          <div>
            <span className="text-sm font-semibold text-slate-400">Lịch dạy:</span>
            <SlotChips slots={tutor.availability} tone="blue" />
          </div>
          {tutor.bio && (
            <div className="border-t border-slate-100 pt-3">
              <span className="mb-1 block text-sm font-semibold text-slate-400">Giới thiệu bản thân:</span>
              <p className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                {tutor.bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

export default TutorDetailModal;
