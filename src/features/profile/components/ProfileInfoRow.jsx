// Dòng thông tin dạng nhãn - giá trị trong trang hồ sơ.
const ProfileInfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-4">
    <span className="w-40 shrink-0 text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-800 break-all">{value || "—"}</span>
  </div>
);

export default ProfileInfoRow;
