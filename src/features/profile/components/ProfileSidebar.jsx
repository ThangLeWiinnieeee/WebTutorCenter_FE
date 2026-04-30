import { Camera, Loader2 } from "lucide-react";
import { getInitials } from "@/features/profile/utils/profileUtils";
import { formatDate, ROLE_CONFIG } from "@/features/profile/constants";
import { ProfileBadge, StatusBadge } from "./ProfileBadges";

const ProfileSidebar = ({
  user,
  displayAvatar,
  isUploadingAvatar,
  fileInputRef,
  onAvatarChange,
  onPickAvatar,
}) => {
  const roleConfig = ROLE_CONFIG[user.role] ?? { label: user.role, className: "bg-slate-100 text-slate-600" };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="group relative inline-block">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={user.fullName}
                referrerPolicy="no-referrer"
                className="h-28 w-28 rounded-full object-cover ring-4 ring-slate-100"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#1e3a5f] text-3xl font-bold text-white ring-4 ring-slate-100 select-none">
                {getInitials(user.fullName)}
              </div>
            )}

            {isUploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <Loader2 className="h-7 w-7 animate-spin text-white" />
              </div>
            )}

            {!isUploadingAvatar && (
              <button
                type="button"
                onClick={onPickAvatar}
                className="absolute bottom-0.5 right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-white shadow-lg ring-2 ring-white transition-all hover:scale-110 hover:bg-[#2d5a9e] active:scale-95"
                title="Đổi ảnh đại diện"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={onAvatarChange}
          />

          <h2 className="mt-4 text-xl font-bold text-slate-800 leading-tight">{user.fullName}</h2>
          <p className="mt-1 text-sm text-slate-500 break-all">{user.email}</p>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <ProfileBadge className={roleConfig.className}>{roleConfig.label}</ProfileBadge>
          </div>
        </div>

        <div className="my-5 border-t border-slate-100" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Xác thực email</span>
            <StatusBadge active={user.isVerified} activeLabel="Đã xác thực" inactiveLabel="Chưa xác thực" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Trạng thái</span>
            <StatusBadge active={user.isActive} activeLabel="Hoạt động" inactiveLabel="Bị khoá" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Loại tài khoản</span>
            <ProfileBadge className="bg-violet-50 text-violet-700 border border-violet-200">
              {user.type === "google" ? "Google" : "Email"}
            </ProfileBadge>
          </div>
        </div>

        <div className="my-5 border-t border-slate-100" />

        <div className="space-y-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-400">Ngày tham gia</span>
            <span className="text-sm font-medium text-slate-700">{formatDate(user.createdAt)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-400">Cập nhật lần cuối</span>
            <span className="text-sm font-medium text-slate-700">{formatDate(user.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
