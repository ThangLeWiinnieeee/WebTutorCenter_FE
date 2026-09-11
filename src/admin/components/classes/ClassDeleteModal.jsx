import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";

// Modal xác nhận xóa mềm một bài đăng lớp.
const ClassDeleteModal = ({ classItem, onClose, onConfirm, loading }) => (
  <ConfirmDeleteModal
    open={Boolean(classItem)}
    title="Xóa bài đăng"
    description={
      <>
        Bài đăng sẽ bị xóa vĩnh viễn cùng với{" "}
        <span className="font-semibold text-slate-800">{classItem?.applicationsCount || 0}</span> đơn nhận lớp
        liên quan. Hành động này không thể hoàn tác.
      </>
    }
    confirmLabel="Xóa bài đăng"
    onClose={onClose}
    onConfirm={onConfirm}
    loading={loading}
  >
    <p className="text-sm font-semibold text-slate-800">
      #{classItem?.classCode} · {classItem?.subject}
    </p>
    <p className="mt-1 truncate text-xs text-slate-500">{classItem?.summary}</p>
  </ConfirmDeleteModal>
);

export default ClassDeleteModal;
