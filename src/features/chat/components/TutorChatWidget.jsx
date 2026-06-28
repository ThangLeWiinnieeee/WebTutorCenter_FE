import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageCircle, Send, X, Headset, ImagePlus } from "lucide-react";

import useAuth from "@/features/auth/hooks/useAuth";
import { selectTutorChat } from "@/features/chat/store/chatSlice";
import {
  fetchMyConversationThunk,
  fetchMyUnreadCountThunk,
  sendMyMessageThunk,
  sendMyImageThunk,
  markMyReadThunk,
} from "@/features/chat/store/chatThunks";

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const TutorChatWidget = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  // Mọi người dùng đã đăng nhập (gia sư hoặc học viên) đều có thể liên hệ admin.
  // Riêng admin dùng trang quản lý tin nhắn nên không hiển thị widget này.
  const canChat = isAuthenticated && user?.role !== "admin";

  const { messages, unreadCount, sending, loading } = useSelector(selectTutorChat);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState(null); // { file, preview }

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Lấy số chưa đọc ban đầu (badge). Sau đó socket tự cập nhật realtime.
  useEffect(() => {
    if (!canChat) return;
    dispatch(fetchMyUnreadCountThunk());
  }, [canChat, dispatch]);

  // Khi mở: tải lịch sử tin nhắn một lần (socket lo phần cập nhật về sau).
  useEffect(() => {
    if (!canChat || !open) return;
    dispatch(fetchMyConversationThunk());
  }, [canChat, open, dispatch]);

  // Đang mở mà còn tin chưa đọc (kể cả tin đến qua socket) → đánh dấu đã đọc.
  useEffect(() => {
    if (canChat && open && unreadCount > 0) dispatch(markMyReadThunk());
  }, [canChat, open, unreadCount, dispatch]);

  // Cuộn xuống đáy (tin mới nhất). Dùng rAF để chờ layout cập nhật xong mới cuộn.
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  // Mở khung chat hoặc có tin mới → nhảy tới tin nhắn mới nhất.
  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open, loading]);

  // Giải phóng object URL của ảnh xem trước khi thay/đóng.
  useEffect(() => {
    return () => {
      if (image?.preview) URL.revokeObjectURL(image.preview);
    };
  }, [image]);

  if (!canChat) return null;

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng file
    if (!file) return;
    setImage({ file, preview: URL.createObjectURL(file) });
  };

  const clearImage = () => setImage(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (sending) return;
    // Ưu tiên gửi ảnh nếu đã chọn; ngược lại gửi text.
    if (image) {
      const { file } = image;
      setImage(null);
      await dispatch(sendMyImageThunk(file));
      return;
    }
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    await dispatch(sendMyMessageThunk(content));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Khung chat */}
      {open && (
        <div className="mb-3 flex h-[28rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Headset className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Hỗ trợ từ Trung tâm</p>
              <p className="truncate text-xs text-white/70">Đội ngũ quản trị viên</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Danh sách tin nhắn */}
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-slate-50 px-3 py-3">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-400">
                <MessageCircle className="mb-2 h-8 w-8" />
                <p className="text-sm">Hãy gửi tin nhắn cho admin nếu bạn cần hỗ trợ.</p>
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.senderRole === "tutor";
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        mine
                          ? "rounded-br-sm bg-[#1e3a5f] text-white"
                          : "rounded-bl-sm bg-white text-slate-700 ring-1 ring-slate-200"
                      }`}
                    >
                      {m.imageUrl && (
                        <a href={m.imageUrl} target="_blank" rel="noreferrer">
                          <img
                            src={m.imageUrl}
                            alt="Ảnh đính kèm"
                            onLoad={scrollToBottom}
                            className="mb-1 max-h-48 w-full rounded-lg object-cover"
                          />
                        </a>
                      )}
                      {m.content && <p className="whitespace-pre-wrap wrap-break-word">{m.content}</p>}
                      <p className={`mt-1 text-right text-[10px] ${mine ? "text-white/60" : "text-slate-400"}`}>
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ảnh xem trước trước khi gửi */}
          {image && (
            <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-3 pt-2">
              <div className="relative">
                <img src={image.preview} alt="Xem trước" className="h-16 w-16 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={clearImage}
                  aria-label="Bỏ ảnh"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Ô nhập */}
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-100 bg-white p-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePickImage}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              aria-label="Đính kèm ảnh"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={image ? "Nhấn gửi để gửi ảnh..." : "Nhập tin nhắn..."}
              disabled={!!image}
              maxLength={2000}
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-[#1e3a5f] focus:bg-white disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={(!draft.trim() && !image) || sending}
              aria-label="Gửi"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-white transition hover:bg-[#16304f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Nút bong bóng */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mở khung nhắn tin"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default TutorChatWidget;
