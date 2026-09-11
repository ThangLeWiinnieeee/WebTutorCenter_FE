// Nhãn nhỏ hiển thị trạng thái/vai trò trong trang hồ sơ.
export const ProfileBadge = ({ className, children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
    {children}
  </span>
);

export const StatusBadge = ({ active, activeLabel = "Hoạt động", inactiveLabel = "Không hoạt động" }) =>
  active ? (
    <ProfileBadge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
      {activeLabel}
    </ProfileBadge>
  ) : (
    <ProfileBadge className="bg-slate-100 text-slate-500 border border-slate-200">
      {inactiveLabel}
    </ProfileBadge>
  );
