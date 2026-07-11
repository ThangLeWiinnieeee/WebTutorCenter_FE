import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageCircle, Send, X, Headset, ImagePlus, Bot } from "lucide-react";

import useAuth from "@/features/auth/hooks/useAuth";
import { selectTutorChat } from "@/features/chat/store/chatSlice";
import {
  fetchMyConversationThunk,
  fetchMyUnreadCountThunk,
  sendMyMessageThunk,
  sendMyImageThunk,
  markMyReadThunk,
} from "@/features/chat/store/chatThunks";
import chatbotService from "@/features/chat/services/chatbotService";

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

// Câu hỏi mồi cho khách chưa biết hỏi gì (khớp FAQ của chatbot-service).
const BOT_STARTERS = [
  "Làm sao để đăng ký tài khoản?",
  "Làm sao để trở thành gia sư?",
  "Cách tìm gia sư phù hợp?",
  "Học phí được tính thế nào?",
];

const bubbleBase = "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm";
const bubbleMine = `${bubbleBase} rounded-br-sm bg-[#1e3a5f] text-white`;
const bubbleBot = `${bubbleBase} rounded-bl-sm bg-white text-slate-700 ring-1 ring-slate-200`;
const bubbleError = `${bubbleBase} rounded-bl-sm bg-rose-50 text-rose-600 ring-1 ring-rose-200`;

const TabButton = ({ active, onClick, icon, label, badge = 0 }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition ${
      active ? "border-b-2 border-[#1e3a5f] text-[#1e3a5f]" : "text-slate-400 hover:text-slate-600"
    }`}
  >
    {icon}
    {label}
    {badge > 0 && (
      <span className="flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
        {badge > 99 ? "99+" : badge}
      </span>
    )}
  </button>
);

const TutorChatWidget = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  // Tab "Admin" (nhắn quản trị viên) chỉ cho người đã đăng nhập, non-admin.
  // Tab "Trợ lý ảo" thì ai cũng dùng được (kể cả khách).
  const canChat = isAuthenticated && !isAdmin;

  const { messages, unreadCount, sending, loading } = useSelector(selectTutorChat);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bot"); // "bot" | "admin"
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState(null); // { file, preview } — chỉ dùng ở tab admin

  // Hội thoại với trợ lý ảo giữ ở client (stateless). sessionId cố định theo lần mount.
  const [botMessages, setBotMessages] = useState([]); // { id, role, content, error?, suggestions? }
  const [botSending, setBotSending] = useState(false);
  const sessionIdRef = useRef();
  if (!sessionIdRef.current) sessionIdRef.current = uid();

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Lấy số chưa đọc ban đầu (badge). Sau đó socket tự cập nhật realtime.
  useEffect(() => {
    if (!canChat) return;
    dispatch(fetchMyUnreadCountThunk());
  }, [canChat, dispatch]);

  // Mở tab admin: tải lịch sử tin nhắn một lần (socket lo phần cập nhật về sau).
  useEffect(() => {
    if (!canChat || !open || activeTab !== "admin") return;
    dispatch(fetchMyConversationThunk());
  }, [canChat, open, activeTab, dispatch]);

  // Đang xem tab admin mà còn tin chưa đọc → đánh dấu đã đọc.
  useEffect(() => {
    if (canChat && open && activeTab === "admin" && unreadCount > 0) dispatch(markMyReadThunk());
  }, [canChat, open, activeTab, unreadCount, dispatch]);

  // Cuộn xuống đáy khi có tin mới / đổi tab / mở khung.
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };
  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, botMessages, botSending, open, activeTab, loading]);

  // Giải phóng object URL của ảnh xem trước khi thay/đóng.
  useEffect(() => {
    return () => {
      if (image?.preview) URL.revokeObjectURL(image.preview);
    };
  }, [image]);

  // Admin dùng trang quản lý tin nhắn riêng → không hiện widget nổi.
  if (isAdmin) return null;

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === "bot" && image) clearImage(); // ảnh không dùng cho bot
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng file
    if (!file) return;
    setImage({ file, preview: URL.createObjectURL(file) });
  };

  const clearImage = () => setImage(null);

  // ── Gửi cho admin (text/ảnh) ──
  const sendAdmin = async () => {
    if (sending) return;
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

  // ── Hỏi trợ lý ảo ──
  const askBot = async (text) => {
    const content = (text ?? "").trim();
    if (!content || botSending) return;

    // Gửi kèm tối đa 20 lượt gần nhất (BE giới hạn), bỏ các bubble lỗi. content ≤ 2000.
    const history = botMessages
      .filter((m) => !m.error)
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    setBotMessages((prev) => [...prev, { id: uid(), role: "user", content }]);
    setDraft("");
    setBotSending(true);
    try {
      const res = await chatbotService.ask({
        message: content,
        history,
        sessionId: sessionIdRef.current,
      });
      const { answer, suggestions = [] } = res.data.data;
      setBotMessages((prev) => [...prev, { id: uid(), role: "assistant", content: answer, suggestions }]);
    } catch {
      // 503 cold-start / mất mạng: interceptor nuốt 5xx → tự báo inline.
      setBotMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: "Trợ lý đang bận hoặc mất kết nối. Bạn thử lại sau giây lát nhé.",
          error: true,
        },
      ]);
    } finally {
      setBotSending(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "bot") return askBot(draft);
    return sendAdmin();
  };

  const isBot = activeTab === "bot";
  const header = isBot
    ? { icon: <Bot className="h-5 w-5" />, title: "Trợ lý ảo", subtitle: "Trả lời tự động 24/7" }
    : { icon: <Headset className="h-5 w-5" />, title: "Hỗ trợ từ Trung tâm", subtitle: "Đội ngũ quản trị viên" };

  const sendDisabled = isBot
    ? !draft.trim() || botSending
    : (!draft.trim() && !image) || sending;

  const renderBot = () => {
    if (botMessages.length === 0 && !botSending) {
      return (
        <div className="flex h-full flex-col items-center justify-center px-5 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f]">
            <Bot className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-700">Xin chào! Mình là trợ lý ảo 🤖</p>
          <p className="mt-1 text-xs text-slate-400">Hỏi mình về đăng ký, tìm gia sư, học phí…</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {BOT_STARTERS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => askBot(q)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <>
        {botMessages.map((m, i) => {
          const mine = m.role === "user";
          const isLast = i === botMessages.length - 1;
          return (
            <div key={m.id}>
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={mine ? bubbleMine : m.error ? bubbleError : bubbleBot}>
                  <p className="whitespace-pre-wrap wrap-break-word">{m.content}</p>
                </div>
              </div>
              {!mine && isLast && m.suggestions?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => askBot(s)}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {/* Bot lọc câu dễ; câu khó → chuyển tab nhắn admin. Chỉ user đã đăng nhập mới có tab admin. */}
              {!mine && isLast && canChat && (
                <button
                  type="button"
                  onClick={() => switchTab("admin")}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#1e3a5f] transition hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5"
                >
                  <Headset className="h-3.5 w-3.5" />
                  Không giải quyết được? → Nhắn admin
                </button>
              )}
            </div>
          );
        })}
        {botSending && (
          <div className="flex justify-start">
            <div className={bubbleBot}>
              <span className="flex gap-1 py-0.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              </span>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderAdmin = () => {
    if (messages.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-400">
          <MessageCircle className="mb-2 h-8 w-8" />
          <p className="text-sm">Hãy gửi tin nhắn cho admin nếu bạn cần hỗ trợ.</p>
        </div>
      );
    }
    return messages.map((m) => {
      const mine = m.senderRole === "tutor";
      return (
        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
          <div className={mine ? bubbleMine : bubbleBot}>
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
    });
  };

  return (
    <div className="fixed bottom-6 right-7 z-50 flex flex-col items-end">
      {/* Khung chat — mobile: sheet gần full màn hình (fixed inset); sm+: nổi góc phải như cũ */}
      {open && (
        <div className="fixed inset-3 z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:static sm:mb-3 sm:mr-5 sm:inset-auto sm:h-[39rem] sm:max-h-[calc(100vh-6rem)] sm:w-[26rem] sm:max-w-[calc(100vw-3rem)]">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              {header.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{header.title}</p>
              <p className="truncate text-xs text-white/70">{header.subtitle}</p>
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

          {/* Tabs — chỉ hiện khi có cả 2 (người đã đăng nhập). Khách chỉ có trợ lý ảo. */}
          {canChat && (
            <div className="flex border-b border-slate-100 bg-white">
              <TabButton
                active={isBot}
                onClick={() => switchTab("bot")}
                icon={<Bot className="h-4 w-4" />}
                label="Trợ lý ảo"
              />
              <TabButton
                active={!isBot}
                onClick={() => switchTab("admin")}
                icon={<Headset className="h-4 w-4" />}
                label="Admin"
                badge={unreadCount}
              />
            </div>
          )}

          {/* Danh sách tin nhắn */}
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-slate-50 px-3 py-3">
            {isBot ? renderBot() : renderAdmin()}
          </div>

          {/* Ảnh xem trước trước khi gửi (chỉ tab admin) */}
          {!isBot && image && (
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
          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-slate-100 bg-white p-2">
            {!isBot && (
              <>
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
              </>
            )}
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={isBot ? "Hỏi trợ lý ảo…" : image ? "Nhấn gửi để gửi ảnh..." : "Nhập tin nhắn..."}
              disabled={!isBot && !!image}
              maxLength={isBot ? 1000 : 2000}
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-[#1e3a5f] focus:bg-white disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sendDisabled}
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
        className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] text-white shadow-lg transition hover:scale-105 hover:shadow-xl ${
          open ? "max-sm:hidden" : ""
        }`}
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
