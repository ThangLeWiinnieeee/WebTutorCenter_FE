import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import tutorService from "@/features/tutors/services/tutorService";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Tải nhiều ảnh giấy tờ (thẻ sinh viên / bằng cấp). Lưu mảng URL trong form.
 * Hiển thị các ảnh đã tải + 1 ô "thêm" khi chưa đạt giới hạn `max`.
 */
const DocumentMultiUpload = ({ label, hint, required, value = [], onChange, max = 5, error }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const images = Array.isArray(value) ? value : [];

  const handleSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng file
    if (!file) return;

    if (images.length >= max) {
      toast.error(`Chỉ được tải tối đa ${max} ảnh`);
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      toast.error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Ảnh không được vượt quá 8MB");
      return;
    }

    setUploading(true);
    try {
      const res = await tutorService.uploadDocument(file);
      onChange([...images, res.data.data.url]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Tải ảnh lên thất bại");
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </p>
        <span className="text-xs text-slate-400">
          {images.length}/{max}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, index) => (
          <div
            key={src}
            className="relative aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
          >
            <img src={src} alt={`${label} ${index + 1}`} className="h-full w-full object-contain" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label={`Xóa ${label} ${index + 1}`}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/60 text-white transition-colors hover:bg-rose-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => !uploading && inputRef.current?.click()}
            disabled={uploading}
            className={`flex aspect-[16/10] flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-slate-400 transition-colors ${
              error
                ? "border-rose-300 bg-rose-50/40"
                : "border-slate-200 bg-slate-50 hover:border-[#1e3a5f]/40 hover:bg-slate-100"
            }`}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#1e3a5f]" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs">Thêm ảnh</span>
              </>
            )}
          </button>
        )}
      </div>

      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-rose-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSelect}
      />
    </div>
  );
};

export default DocumentMultiUpload;
