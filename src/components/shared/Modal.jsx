import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

// Modal dùng chung dựng trên <dialog> native mở bằng showModal().
// Trình duyệt lo sẵn: đóng bằng Esc, bẫy focus trong hộp thoại, khoá tương tác với nền
// (inert) và ngữ nghĩa aria-modal. Trước đây 23 file tự dựng lớp phủ bằng <div> nên
// không có thứ nào trong số đó.
//
// Component chỉ mount khi cần hiện — bên gọi tự điều kiện, giống các modal cũ vẫn làm
// với `if (!item) return null`.
const Modal = ({
  onClose,
  labelledBy,
  // Class khung nội dung (chiều rộng, bo góc, nền, padding…). Ghép bằng cn() nên có thể
  // ghi đè cả class mặc định bên dưới, kể cả `m-auto` khi cần canh sát trên.
  panelClassName,
  // Class lớp phủ mờ phía sau.
  overlayClassName,
  // Bấm ra ngoài để đóng — chỉ bật cho những hộp thoại vốn đã có hành vi này
  // (xem ảnh phóng to, popup chi tiết), không bật cho form đang nhập dở.
  closeOnBackdropClick = false,
  children,
}) => {
  const ref = useRef(null);

  // Mở ở chế độ modal ngay khi mount (chỉ showModal() mới cho bẫy focus + nền inert).
  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  // Esc làm <dialog> tự đóng — chặn lại để state React là nguồn sự thật duy nhất,
  // nếu không hộp thoại biến mất khỏi màn hình nhưng state cha vẫn tưởng đang mở.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleCancel = (event) => {
      event.preventDefault();
      onClose?.();
    };
    el.addEventListener("cancel", handleCancel);
    return () => el.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  // Khi modal đang mở, mọi điểm ngoài khung nội dung đều thuộc ::backdrop, và trình duyệt
  // báo target của click đó chính là <dialog> — đây là cách nhận biết "bấm ra ngoài".
  const handleClick = (event) => {
    if (closeOnBackdropClick && event.target === ref.current) onClose?.();
  };

  return (
    <>
      {/*
        Lớp phủ mờ cố tình KHÔNG dùng ::backdrop của <dialog>. ::backdrop nằm trong top
        layer ngay dưới dialog nên nó phủ mờ luôn toast của Sonner (toast ở tầng thường)
        — đã kiểm chứng: thông báo lỗi bị blur, không đọc được. Để lớp phủ ở tầng thường
        thì toast vẫn nổi lên trên như trước.

        ponytail: đánh đổi kèm theo — khi mở modal lồng nhau (xem ảnh phóng to đè lên
        modal chi tiết ở trang duyệt gia sư / duyệt đổi hồ sơ), lớp phủ của modal trong
        không làm mờ được modal ngoài vì modal ngoài nằm ở top layer. Chỉ ảnh hưởng 2 màn
        và thuần thẩm mỹ; đổi lại toast luôn đọc được ở mọi modal. Muốn mờ đúng cả hai
        thì phải đưa Toaster của Sonner vào top layer (popover API) — làm khi nào lồng
        modal trở thành chuyện phổ biến.
      */}
      <div
        aria-hidden="true"
        className={cn("fixed inset-0 z-80 bg-slate-950/50 backdrop-blur-sm", overlayClassName)}
      />
      <dialog
        ref={ref}
        aria-labelledby={labelledBy}
        onClick={handleClick}
        // `inset-0 m-auto h-fit` để căn giữa: preflight của Tailwind đặt margin:0 cho mọi
        // phần tử, làm mất kiểu căn giữa mặc định (margin:auto) của dialog:modal.
        // backdrop:bg-transparent tắt lớp mờ mặc định của trình duyệt, tránh mờ hai lần.
        className={cn(
          // overflow-auto (không phải overflow-y-auto) để panelClassName truyền
          // overflow-hidden là twMerge ghi đè được — hai class khác nhóm sẽ cùng áp dụng.
          "fixed inset-0 m-auto h-fit max-h-[90vh] w-full max-w-md overflow-auto rounded-xl",
          "border border-slate-200 bg-white p-6 shadow-2xl backdrop:bg-transparent",
          panelClassName,
        )}
      >
        {children}
      </dialog>
    </>
  );
};

export default Modal;
