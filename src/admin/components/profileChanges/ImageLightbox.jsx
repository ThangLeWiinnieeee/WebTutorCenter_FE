import { X } from "lucide-react";

// Lớp phủ phóng to ảnh giấy tờ.
const ImageLightbox = ({ src, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4" onClick={onClose}>
    <button
      type="button"
      onClick={onClose}
      aria-label="Đóng ảnh phóng to"
      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
    >
      <X className="h-5 w-5" />
    </button>
    <img
      src={src}
      alt="Ảnh phóng to"
      className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

export default ImageLightbox;
