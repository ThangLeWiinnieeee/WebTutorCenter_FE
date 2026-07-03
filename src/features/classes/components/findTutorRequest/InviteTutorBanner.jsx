import { ShieldCheck } from 'lucide-react';

import { TUTOR_GENDER_PREF_LABEL } from '@/features/classes/constants';

// Banner nhắc người dùng đang ở luồng "mời gia sư trực tiếp" (các trường bị khóa theo hồ sơ gia sư).
const InviteTutorBanner = ({ invitedTutor }) => (
  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 p-4">
    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#1e3a5f]" />
    <div className="text-sm text-slate-700">
      <p className="font-semibold text-[#1e3a5f]">
        Bạn đang mời gia sư {invitedTutor.fullName}
        {invitedTutor.dateOfBirth
          ? ` (sinh năm ${new Date(invitedTutor.dateOfBirth).getFullYear()}`
          : ''}
        {invitedTutor.gender
          ? `${invitedTutor.dateOfBirth ? ', ' : ' ('}${TUTOR_GENDER_PREF_LABEL[invitedTutor.gender] || invitedTutor.gender})`
          : invitedTutor.dateOfBirth
            ? ')'
            : ''}
      </p>
      <p className="mt-1 text-slate-600">
        Môn học, khu vực, khung giờ và yêu cầu gia sư đã được giới hạn theo hồ sơ của gia sư này.
        Lớp sẽ chỉ được gửi riêng cho gia sư, không hiển thị công khai.
      </p>
    </div>
  </div>
);

export default InviteTutorBanner;
