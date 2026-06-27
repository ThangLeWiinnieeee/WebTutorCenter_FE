import { useEffect, useRef, useState } from "react";
import { AlertCircle, Hourglass, Loader2, ShieldCheck, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import DocumentUploadField from "@/features/tutors/components/DocumentUploadField";
import DocumentMultiUpload from "@/features/tutors/components/DocumentMultiUpload";
import { hasCompleteTutorDocuments } from "@/features/tutors/utils/tutorDocuments";

// Ảnh xem (nhấn để phóng to)
const ViewThumb = ({ label, src, onZoom }) => (
  <div className="space-y-1.5">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    {src ? (
      <button
        type="button"
        onClick={() => onZoom(src)}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
      >
        <img src={src} alt={label} className="h-full w-full object-contain" />
        <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/40 group-hover:opacity-100">
          <ZoomIn className="h-5 w-5 text-white" />
        </span>
      </button>
    ) : (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
        Chưa cập nhật
      </div>
    )}
  </div>
);

const Lightbox = ({ src, onClose }) => (
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

/**
 * Khu vực hồ sơ chứng thực trong trang hồ sơ gia sư: xem + bổ sung/cập nhật
 * CCCD và thẻ sinh viên/bằng cấp. Thay đổi gửi qua luồng duyệt đổi hồ sơ.
 */
const TutorDocumentsCard = ({ tutorProfile, pendingRequest, submitting, onSubmit, autoEdit = false }) => {
  const isStudent = tutorProfile?.occupationStatus === "student";
  const complete = hasCompleteTutorDocuments(tutorProfile);

  const [editing, setEditing] = useState(autoEdit && !pendingRequest);
  const [zoomSrc, setZoomSrc] = useState(null);
  const [cccdFront, setCccdFront] = useState(tutorProfile?.cccdFrontImage || "");
  const [cccdBack, setCccdBack] = useState(tutorProfile?.cccdBackImage || "");
  const [scFront, setScFront] = useState(tutorProfile?.studentCardFrontImage || "");
  const [scBack, setScBack] = useState(tutorProfile?.studentCardBackImage || "");
  const [certs, setCerts] = useState(tutorProfile?.certificateImages || []);
  const cardRef = useRef(null);

  // Cuộn tới khu vực này khi được điều hướng từ "Bổ sung hồ sơ" (chế độ sửa đã mở sẵn theo autoEdit)
  useEffect(() => {
    if (autoEdit && !pendingRequest) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [autoEdit, pendingRequest]);

  const resetFromProfile = () => {
    setCccdFront(tutorProfile?.cccdFrontImage || "");
    setCccdBack(tutorProfile?.cccdBackImage || "");
    setScFront(tutorProfile?.studentCardFrontImage || "");
    setScBack(tutorProfile?.studentCardBackImage || "");
    setCerts(tutorProfile?.certificateImages || []);
  };

  const handleSubmit = () => {
    if (!cccdFront || !cccdBack) {
      toast.error("Vui lòng tải đủ ảnh CCCD mặt trước và mặt sau.");
      return;
    }
    const changes = { cccdFrontImage: cccdFront, cccdBackImage: cccdBack };
    if (isStudent) {
      if (!scFront || !scBack) {
        toast.error("Vui lòng tải đủ ảnh thẻ sinh viên mặt trước và mặt sau.");
        return;
      }
      changes.studentCardFrontImage = scFront;
      changes.studentCardBackImage = scBack;
    } else {
      if (!certs || certs.length < 1) {
        toast.error("Vui lòng tải lên ít nhất 1 ảnh bằng cấp.");
        return;
      }
      changes.certificateImages = certs;
    }
    onSubmit(changes, () => setEditing(false));
  };

  return (
    <div ref={cardRef} id="tutor-documents" className="scroll-mt-20 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#1e3a5f]" />
          <h3 className="text-base font-semibold text-slate-700">Hồ sơ chứng thực</h3>
        </div>
        {!editing && !pendingRequest && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              resetFromProfile();
              setEditing(true);
            }}
            className="h-8 text-xs"
          >
            {complete ? "Cập nhật" : "Bổ sung ngay"}
          </Button>
        )}
      </div>

      <div className="px-6 py-5">
        {/* Đang chờ duyệt */}
        {pendingRequest && (
          <div className="mb-4 flex gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4">
            <Hourglass className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-700">
              Bạn có một yêu cầu đang chờ admin duyệt. Khi được duyệt, hồ sơ chứng thực sẽ tự động cập nhật.
            </p>
          </div>
        )}

        {/* Cảnh báo chưa đủ hồ sơ */}
        {!complete && !pendingRequest && !editing && (
          <div className="mb-4 flex gap-3 rounded-lg border border-rose-100 bg-rose-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <p className="text-sm text-rose-700">
              Bạn cần bổ sung ảnh CCCD và {isStudent ? "thẻ sinh viên" : "bằng cấp"} để có thể nhận lớp. Nhấn
              "Bổ sung ngay" để cập nhật và gửi admin duyệt.
            </p>
          </div>
        )}

        {editing ? (
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Ảnh CCCD/CMND</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <DocumentUploadField label="CCCD mặt trước" required value={cccdFront} onChange={setCccdFront} />
                <DocumentUploadField label="CCCD mặt sau" required value={cccdBack} onChange={setCccdBack} />
              </div>
            </div>

            {isStudent ? (
              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">Thẻ sinh viên</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DocumentUploadField label="Thẻ sinh viên mặt trước" required value={scFront} onChange={setScFront} />
                  <DocumentUploadField label="Thẻ sinh viên mặt sau" required value={scBack} onChange={setScBack} />
                </div>
              </div>
            ) : (
              <DocumentMultiUpload
                label="Bằng cấp"
                hint="Hãy gửi ảnh bằng cấp của môn bạn dạy vào đây (Bạn có thể gửi tối đa 5 ảnh)"
                required
                max={5}
                value={certs}
                onChange={setCerts}
              />
            )}

            <div className="flex gap-3 border-t border-slate-100 pt-4">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-[#1e3a5f] text-white hover:bg-[#2d5a9e]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi cho admin duyệt"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetFromProfile();
                  setEditing(false);
                }}
                disabled={submitting}
              >
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <ViewThumb label="CCCD mặt trước" src={tutorProfile?.cccdFrontImage} onZoom={setZoomSrc} />
              <ViewThumb label="CCCD mặt sau" src={tutorProfile?.cccdBackImage} onZoom={setZoomSrc} />
            </div>

            {isStudent ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <ViewThumb label="Thẻ sinh viên mặt trước" src={tutorProfile?.studentCardFrontImage} onZoom={setZoomSrc} />
                <ViewThumb label="Thẻ sinh viên mặt sau" src={tutorProfile?.studentCardBackImage} onZoom={setZoomSrc} />
              </div>
            ) : (
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">Bằng cấp</p>
                {tutorProfile?.certificateImages?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {tutorProfile.certificateImages.map((src) => (
                      <ViewThumb key={src} label="" src={src} onZoom={setZoomSrc} />
                    ))}
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] w-full max-w-xs items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
                    Chưa cập nhật
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {zoomSrc && <Lightbox src={zoomSrc} onClose={() => setZoomSrc(null)} />}
    </div>
  );
};

export default TutorDocumentsCard;
