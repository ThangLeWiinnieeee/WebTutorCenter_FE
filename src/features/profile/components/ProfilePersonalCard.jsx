import { Button } from "@/components/ui/button";

// Khung thẻ thông tin cá nhân, có nút chuyển sang chế độ chỉnh sửa.
const ProfilePersonalCard = ({ isEditing, onEdit, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
      <h3 className="text-base font-semibold text-slate-700">Thông tin cá nhân</h3>
      {!isEditing && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          Chỉnh sửa
        </Button>
      )}
    </div>

    <div className="px-6 py-5">{children}</div>
  </div>
);

export default ProfilePersonalCard;
