import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";

// Xác nhận xóa mềm mã ưu đãi.
const PromoDeleteModal = ({ promo, onClose, onConfirm, loading }) => (
  <ConfirmDeleteModal
    open={Boolean(promo)}
    title="Xóa mã ưu đãi"
    description="Mã sẽ bị xóa vĩnh viễn khỏi hệ thống. Nếu chỉ muốn tạm dừng, hãy dùng nút bật/tắt."
    confirmLabel="Xóa mã"
    onClose={onClose}
    onConfirm={onConfirm}
    loading={loading}
  >
    <p className="text-sm font-semibold text-slate-800">{promo?.code}</p>
    {promo?.description && <p className="mt-1 text-xs text-slate-500">{promo.description}</p>}
  </ConfirmDeleteModal>
);

export default PromoDeleteModal;
