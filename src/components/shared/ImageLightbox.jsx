import { X } from "lucide-react";

import Modal from "@/components/shared/Modal";

// Xem ảnh giấy tờ ở kích thước lớn. Trước đây admin và trang hồ sơ gia sư mỗi bên
// chép một bản gần như y hệt (một bên còn tự dựng portal + tự bắt phím Esc).
const ImageLightbox = ({ src, onClose }) => (
  <Modal
    onClose={onClose}
    closeOnBackdropClick
    overlayClassName="bg-slate-950/80 backdrop-blur-none"
    panelClassName="relative h-fit max-h-none w-fit max-w-none rounded-none border-0 bg-transparent p-0 shadow-none"
  >
    <button
      type="button"
      onClick={onClose}
      aria-label="Đóng ảnh phóng to"
      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
    >
      <X className="h-5 w-5" />
    </button>
    <img
      src={src}
      alt="Ảnh phóng to"
      className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
    />
  </Modal>
);

export default ImageLightbox;
