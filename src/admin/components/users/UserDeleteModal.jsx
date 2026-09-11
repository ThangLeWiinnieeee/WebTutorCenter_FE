import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";

// Xác nhận xóa mềm người dùng (ẩn khỏi danh sách, giữ dữ liệu trong database).
const UserDeleteModal = ({ user, onClose, onConfirm, loading }) => (
  <ConfirmDeleteModal
    open={Boolean(user)}
    title="Xóa mềm người dùng"
    description="Tài khoản sẽ được ẩn khỏi danh sách và bị vô hiệu hóa, nhưng dữ liệu vẫn được giữ trong database."
    confirmLabel="Xóa mềm"
    onClose={onClose}
    onConfirm={onConfirm}
    loading={loading}
  >
    <p className="text-sm font-semibold text-slate-800">{user?.fullName || "Chưa cập nhật"}</p>
    <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
  </ConfirmDeleteModal>
);

export default UserDeleteModal;
