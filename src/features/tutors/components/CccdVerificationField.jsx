import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, CheckCircle2, ImagePlus, Loader2, ScanLine, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TUTOR_UPLOAD_ALLOWED_TYPES, TUTOR_UPLOAD_MAX_SIZE } from "@/features/tutors/constants";
import { clearCccdVerification } from "@/features/tutors/store/tutorSlice";
import { verifyCccdThunk } from "@/features/tutors/store/tutorThunks";

import { prepareCccdImage } from "@/features/tutors/utils/prepareCccdImage";

const DECISION_META = {
  pass: {
    label: "Đạt kiểm tra tự động",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  review: {
    label: "Cần admin kiểm tra",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: AlertTriangle,
  },
  suspicious: {
    label: "Có dấu hiệu bất thường",
    className: "border-rose-200 bg-rose-50 text-rose-800",
    icon: ShieldAlert,
  },
  retake: {
    label: "Cần chụp lại",
    className: "border-orange-200 bg-orange-50 text-orange-800",
    icon: AlertTriangle,
  },
};

const REASON_LABELS = {
  DOCUMENT_NOT_FOUND: "Không tìm thấy viền thẻ",
  BLURRY: "Ảnh bị mờ",
  TOO_SMALL: "Ảnh có độ phân giải thấp",
  TOO_DARK: "Ảnh quá tối",
  TOO_BRIGHT: "Ảnh quá sáng",
  TOO_MUCH_GLARE: "Ảnh bị lóa",
  FRONT_SIDE_NOT_DETECTED: "Không nhận ra mặt trước",
  BACK_SIDE_NOT_DETECTED: "Không nhận ra mặt sau",
  REQUIRED_FIELDS_MISSING: "Thiếu thông tin bắt buộc",
  OCR_TEXT_NOT_FOUND: "Không đọc được chữ",
  QR_NOT_DECODED: "Không đọc được mã QR",
  QR_FORMAT_UNSUPPORTED: "Định dạng QR chưa hỗ trợ",
  QR_OCR_MISMATCH: "Thông tin QR không khớp chữ trên thẻ",
  PROFILE_MISMATCH: "Thông tin CCCD không khớp hồ sơ tài khoản",
  ID_FORMAT_INVALID: "Số CCCD không hợp lệ",
  ID_BIRTH_YEAR_MISMATCH: "Năm sinh không khớp số CCCD",
  ID_BIRTH_CENTURY_MISMATCH: "Thế kỷ sinh không khớp số CCCD",
  ID_GENDER_MISMATCH: "Giới tính không khớp số CCCD",
};

const reasonLabel = (reason) =>
  REASON_LABELS[reason] || REASON_LABELS[reason.replace(/^FRONT_|^BACK_/, "")] || reason;

const CccdImagePicker = ({ disabled, label, preview, onSelect }) => (
  <label className={`block space-y-1.5 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
    <span className="text-sm font-medium text-slate-700">
      {label} <span className="text-rose-500">*</span>
    </span>
    <span className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-brand/40 hover:bg-slate-100">
      {preview ? (
        <img src={preview} alt={label} className="h-full w-full object-contain" />
      ) : (
        <span className="flex flex-col items-center gap-2 text-xs text-slate-400">
          <ImagePlus className="h-7 w-7" />
          Chọn ảnh từ thiết bị
        </span>
      )}
    </span>
    <input
      type="file"
      disabled={disabled}
      accept="image/jpeg,image/png,image/webp"
      className="sr-only"
      aria-label={label}
      onChange={onSelect}
    />
  </label>
);

const CccdVerificationField = ({ error, onReset, onVerified }) => {
  const dispatch = useDispatch();
  const { cccdVerification, verifyingCccd } = useSelector((state) => state.tutors);
  const [files, setFiles] = useState({ front: null, back: null });
  const [previews, setPreviews] = useState({ front: "", back: "" });
  const previewUrlsRef = useRef({ front: "", back: "" });
  const [preparingImages, setPreparingImages] = useState(false);

  useEffect(() => {
    dispatch(clearCccdVerification());
  }, [dispatch]);

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      Object.values(previewUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleSelect = (side) => (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!TUTOR_UPLOAD_ALLOWED_TYPES.includes(file.type)) {
      toast.error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP");
      return;
    }
    if (file.size > TUTOR_UPLOAD_MAX_SIZE) {
      toast.error("Mỗi ảnh không được vượt quá 8MB");
      return;
    }

    const previousUrl = previewUrlsRef.current[side];
    const previewUrl = URL.createObjectURL(file);
    previewUrlsRef.current[side] = previewUrl;
    setPreviews((current) => ({ ...current, [side]: previewUrl }));
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    setFiles((current) => ({ ...current, [side]: file }));
    dispatch(clearCccdVerification());
    onReset();
  };

  const handleVerify = async () => {
    if (!files.front || !files.back) {
      toast.error("Vui lòng chọn đủ ảnh mặt trước và mặt sau");
      return;
    }

    setPreparingImages(true);
    try {
      const [front, back] = await Promise.all([prepareCccdImage(files.front), prepareCccdImage(files.back)]);
      const action = await dispatch(verifyCccdThunk({ front, back }));
      if (!verifyCccdThunk.fulfilled.match(action)) {
        toast.error(action.payload || "Không thể quét CCCD lúc này");
        return;
      }

      if (action.payload.receipt) onVerified(action.payload);
      else onReset();
    } catch {
      toast.error("Không thể xử lý ảnh CCCD. Vui lòng chọn ảnh khác và thử lại");
    } finally {
      setPreparingImages(false);
    }
  };

  const verification = cccdVerification?.verification;
  const completed = Boolean(cccdVerification?.receipt);
  const meta = verification ? DECISION_META[verification.decision] : null;
  const ResultIcon = meta?.icon;
  const busy = preparingImages || verifyingCccd;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <CccdImagePicker
          disabled={busy}
          label="CCCD mặt trước"
          preview={previews.front}
          onSelect={handleSelect("front")}
        />
        <CccdImagePicker
          disabled={busy}
          label="CCCD mặt sau"
          preview={previews.back}
          onSelect={handleSelect("back")}
        />
      </div>

      <p className="text-xs text-slate-500">
        Ảnh sẽ được xoay đúng chiều, xóa metadata và tối ưu dung lượng ngay trên thiết bị trước khi gửi.
      </p>

      <Button
        type="button"
        variant="outline"
        disabled={busy || completed || !files.front || !files.back}
        aria-busy={busy}
        onClick={handleVerify}
        className="w-full border-brand/30 text-brand hover:bg-brand/5"
      >
        {busy ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <ScanLine aria-hidden="true" className="h-4 w-4" />
        )}
        {preparingImages
          ? "Đang tối ưu ảnh..."
          : verifyingCccd
            ? "Đang quét CCCD..."
            : completed
              ? "Đã quét CCCD"
              : "Quét và kiểm tra CCCD"}
      </Button>

      {meta && (
        <div className={`rounded-xl border p-3 text-sm ${meta.className}`} role="status" aria-live="polite">
          <div className="flex items-center gap-2 font-semibold">
            <ResultIcon className="h-4 w-4" />
            {meta.label}
          </div>
          {verification.reasons?.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {verification.reasons.map((reason) => (
                <li key={reason}>{reasonLabel(reason)}</li>
              ))}
            </ul>
          )}
          {actionableMessage(verification.decision)}
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

const actionableMessage = (decision) => {
  if (decision === "retake") {
    return <p className="mt-2 text-xs">Hãy chọn ảnh rõ hơn rồi quét lại.</p>;
  }
  if (decision === "pass") {
    return <p className="mt-2 text-xs">Hai ảnh đã được tải lên an toàn để gửi hồ sơ.</p>;
  }
  return <p className="mt-2 text-xs">Kết quả sẽ được chuyển cho admin quyết định cuối cùng.</p>;
};

export default CccdVerificationField;
