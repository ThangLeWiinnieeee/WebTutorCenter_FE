import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import tutorService from "@/features/tutors/services/tutorService";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Ô tải một ảnh giấy tờ (CCCD/bằng cấp). Upload ngay khi chọn file,
 * lưu URL Cloudinary trả về vào form qua onChange.
 */
const DocumentUploadField = ({ value, onChange, label, hint, error, required }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng file
    if (!file) return;

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
      onChange(res.data.data.url);
    } catch (err) {
      toast.error(err.response?.data?.message || "Tải ảnh lên thất bại");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading) inputRef.current?.click();
        }}
        className={`relative flex aspect-[16/10] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
          error
            ? "border-rose-300 bg-rose-50/40"
            : "border-slate-200 bg-slate-50 hover:border-[#1e3a5f]/40 hover:bg-slate-100"
        }`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-contain" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              aria-label={`Xóa ${label}`}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/60 text-white transition-colors hover:bg-rose-600"
            >
              <X className="h-4 w-4" />
            </button>
            {!uploading && (
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/60 px-3 py-1 text-xs text-white">
                Nhấn để đổi ảnh
              </span>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center text-slate-400">
            <ImagePlus className="h-7 w-7" />
            <span className="text-xs">Nhấn để tải ảnh lên</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
          </div>
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

export default DocumentUploadField;
