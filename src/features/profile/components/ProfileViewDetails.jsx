import {
  formatDate,
  GENDER_LABEL,
  ROLE_CONFIG,
} from '@/features/profile/constants';

import { ProfileBadge } from './ProfileBadges';
import ProfileInfoRow from './ProfileInfoRow';

const ProfileViewDetails = ({ user }) => {
  const roleConfig = ROLE_CONFIG[user.role] ?? { label: user.role, className: "bg-slate-100 text-slate-600" };

  return (
    <div className="space-y-4 divide-y divide-slate-100">
      <ProfileInfoRow label="Họ và tên" value={user.fullName} />
      <div className="pt-4">
        <ProfileInfoRow label="Thư điện tử" value={user.email} />
      </div>
      <div className="pt-4">
        <ProfileInfoRow label="Số điện thoại" value={user.phone} />
      </div>
      <div className="pt-4">
        <ProfileInfoRow label="Giới tính" value={GENDER_LABEL[user.gender] ?? null} />
      </div>
      <div className="pt-4">
        <ProfileInfoRow label="Ngày sinh" value={formatDate(user.dateOfBirth)} />
      </div>
      <div className="pt-4">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
          <span className="w-40 shrink-0 text-sm text-slate-500">Vai trò</span>
          <ProfileBadge className={roleConfig.className}>{roleConfig.label}</ProfileBadge>
        </div>
      </div>
      <div className="pt-4">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
          <span className="w-40 shrink-0 text-sm text-slate-500">Loại tài khoản</span>
          <ProfileBadge className="bg-violet-50 text-violet-700 border border-violet-200">
            {user.type === "google" ? "Google" : "Thư điện tử / Mật khẩu"}
          </ProfileBadge>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewDetails;
