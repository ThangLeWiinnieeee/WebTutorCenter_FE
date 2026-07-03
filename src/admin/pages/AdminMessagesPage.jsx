import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, MessageCircle, Plus, Search, Send, X, Headset, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import chatService from "@/features/chat/services/chatService";
import { selectAdminChat, setActiveConversation } from "@/features/chat/store/chatSlice";
import {
  fetchConversationsThunk,
  fetchConversationMessagesThunk,
  sendConversationMessageThunk,
  sendConversationImageThunk,
  markConversationReadThunk,
  startConversationThunk,
} from "@/features/chat/store/chatThunks";

const getInitials = (name) =>
  !name
    ? "?"
    : name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatTime = (iso) =>
  !iso ? "" : new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

const formatListTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

// ──────────────────────────── Modal chọn người dùng để mở chat mới ────────────────────────────
const NewChatModal = ({ onClose, onPick }) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await chatService.searchUsers(keyword.trim());
        setResults(res.data.data.users || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [keyword]);

  return (
    <div className="fixed inset-0 z-80 flex items-start justify-center bg-slate-950/50 px-4 pt-24 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-900">Nhắn tin với người dùng</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên hoặc email người dùng..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1e3a5f] focus:bg-white"
            />
          </div>
        </div>
        {!loading && results.length > 0 && (
          <p className="px-4 pb-1 text-xs text-slate-400">
            {results.length} người dùng{keyword.trim() ? " phù hợp" : ""}
          </p>
        )}
        <div className="max-h-96 overflow-y-auto px-3 pb-3">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Không tìm thấy người dùng phù hợp.</p>
          ) : (
            results.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onPick(u)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-100"
              >
                {u.avatar ? (
                  <img src={u.avatar} alt={u.fullName} referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white">
                    {getInitials(u.fullName)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{u.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{u.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const AdminMessagesPage = () => {
  const dispatch = useDispatch();
  const { conversations, activeId, activeConversation, messages, loadingMessages, sending } =
    useSelector(selectAdminChat);

  const [keyword, setKeyword] = useState("");
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState(null); // { file, preview }
  const [showNewChat, setShowNewChat] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Tải danh sách hội thoại (lọc theo từ khóa, có debounce). Socket lo cập nhật realtime.
  useEffect(() => {
    const fetchList = () => dispatch(fetchConversationsThunk({ keyword: keyword.trim() }));
    const t = setTimeout(fetchList, keyword ? 300 : 0);
    return () => clearTimeout(t);
  }, [keyword, dispatch]);

  // Khi chọn hội thoại: tải lịch sử tin nhắn một lần + đánh dấu đã đọc.
  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const res = await dispatch(fetchConversationMessagesThunk({ id: activeId }));
      if (res.payload?.conversation?.unreadCount > 0) {
        dispatch(markConversationReadThunk(activeId));
      }
    })();
  }, [activeId, dispatch]);

  // Cuộn xuống đáy (tin mới nhất). Dùng rAF để chờ layout cập nhật xong mới cuộn.
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  // Chọn hội thoại / tải xong tin nhắn / có tin mới → nhảy tới tin nhắn mới nhất.
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeId, loadingMessages]);

  // Giải phóng object URL của ảnh xem trước khi thay/đóng.
  useEffect(() => {
    return () => {
      if (image?.preview) URL.revokeObjectURL(image.preview);
    };
  }, [image]);

  const handleSelect = (id) => {
    dispatch(setActiveConversation(id));
    dispatch(markConversationReadThunk(id));
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng file
    if (!file) return;
    setImage({ file, preview: URL.createObjectURL(file) });
  };

  const clearImage = () => setImage(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (sending || !activeId) return;
    // Ưu tiên gửi ảnh nếu đã chọn; ngược lại gửi text.
    if (image) {
      const { file } = image;
      setImage(null);
      await dispatch(sendConversationImageThunk({ id: activeId, file }));
      return;
    }
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    await dispatch(sendConversationMessageThunk({ id: activeId, content }));
  };

  const handlePickTutor = async (user) => {
    setShowNewChat(false);
    const res = await dispatch(startConversationThunk(user.id));
    if (res.payload?.id) handleSelect(res.payload.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tin nhắn</h1>
          <p className="text-sm text-slate-500">Trao đổi trực tiếp với người dùng</p>
        </div>
        <Button onClick={() => setShowNewChat(true)} className="gap-2 bg-[#1e3a5f] text-white hover:bg-[#16304f]">
          <Plus className="h-4 w-4" /> Nhắn tin mới
        </Button>
      </div>

      <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Danh sách hội thoại */}
        <div className="flex w-72 shrink-0 flex-col border-r border-slate-200">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm người dùng..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1e3a5f] focus:bg-white"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">Chưa có cuộc trò chuyện nào.</p>
            ) : (
              conversations.map((c) => {
                const tutor = c.tutor;
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className={`flex w-full items-center gap-3 border-b border-slate-50 px-3 py-3 text-left transition ${
                      isActive ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    {tutor?.avatar ? (
                      <img src={tutor.avatar} alt={tutor.fullName} referrerPolicy="no-referrer" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white">
                        {getInitials(tutor?.fullName)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">{tutor?.fullName || "Người dùng"}</p>
                        <span className="shrink-0 text-[11px] text-slate-400">{formatListTime(c.lastMessageAt)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate text-xs ${c.unreadCount > 0 ? "font-semibold text-slate-700" : "text-slate-500"}`}>
                          {c.lastSenderRole === "admin" ? "Bạn: " : ""}
                          {c.lastMessage || "Bắt đầu trò chuyện"}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                            {c.unreadCount > 99 ? "99+" : c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Khung tin nhắn */}
        <div className="flex flex-1 flex-col bg-slate-50">
          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center text-slate-400">
              <MessageCircle className="mb-3 h-12 w-12" />
              <p className="text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
                {activeConversation?.tutor?.avatar ? (
                  <img src={activeConversation.tutor.avatar} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white">
                    {getInitials(activeConversation?.tutor?.fullName)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {activeConversation?.tutor?.fullName || "Người dùng"}
                  </p>
                  <p className="truncate text-xs text-slate-500">{activeConversation?.tutor?.email}</p>
                </div>
              </div>

              {/* Tin nhắn */}
              <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400">
                    <Headset className="mb-2 h-8 w-8" />
                    <p className="text-sm">Chưa có tin nhắn. Hãy gửi lời chào tới người dùng.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderRole === "admin";
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
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
                                className="mb-1 max-h-60 w-full rounded-lg object-cover"
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
                <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 pt-2">
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
              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
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
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
                <input
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
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-white transition hover:bg-[#16304f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} onPick={handlePickTutor} />}
    </div>
  );
};

export default AdminMessagesPage;
