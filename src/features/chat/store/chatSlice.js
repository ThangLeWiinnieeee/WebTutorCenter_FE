import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMyConversationThunk,
  fetchMyUnreadCountThunk,
  sendMyMessageThunk,
  sendMyImageThunk,
  markMyReadThunk,
  fetchConversationsThunk,
  fetchAdminUnreadCountThunk,
  fetchConversationMessagesThunk,
  sendConversationMessageThunk,
  sendConversationImageThunk,
  markConversationReadThunk,
  startConversationThunk,
} from "./chatThunks";

const initialState = {
  tutor: {
    conversation: null,
    messages: [],
    unreadCount: 0,
    loading: false,
    sending: false,
  },
  admin: {
    conversations: [],
    pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 1 },
    totalUnread: 0,
    activeId: null,
    activeConversation: null,
    messages: [],
    loadingList: false,
    loadingMessages: false,
    sending: false,
  },
};

// Đẩy/cập nhật một hội thoại lên đầu danh sách của admin (mới hoạt động trước).
const upsertConversation = (list, conversation) => {
  const idx = list.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    const merged = { ...list[idx], ...conversation };
    list.splice(idx, 1);
    return [merged, ...list];
  }
  return [conversation, ...list];
};

// Thêm tin nhắn nhưng tránh trùng (tin do chính mình gửi đã được thêm lạc quan,
// rồi socket lại phát về → chỉ giữ một bản theo id).
const dedupPush = (arr, msg) => {
  if (msg && !arr.some((m) => m.id === msg.id)) arr.push(msg);
};

// Nội dung xem trước ở danh sách hội thoại (ảnh không có text → hiển thị nhãn).
const previewOf = (message) => message.content || (message.imageUrl ? "[Hình ảnh]" : "");

// Áp tin nhắn admin vừa gửi vào state: thêm vào khung đang mở + cập nhật xem trước.
const applyAdminSent = (admin, { id, message }) => {
  if (admin.activeId === id) dedupPush(admin.messages, message);
  const item = admin.conversations.find((c) => c.id === id);
  if (item) {
    item.lastMessage = previewOf(message);
    item.lastMessageAt = message.createdAt;
    item.lastSenderRole = "admin";
  }
};

// Đánh dấu đã đọc phía admin cho 1 hội thoại: trừ đúng phần chưa đọc khỏi tổng.
const applyAdminRead = (admin, conversationId) => {
  const item = admin.conversations.find((c) => c.id === conversationId);
  if (item) {
    admin.totalUnread = Math.max(0, admin.totalUnread - (item.unreadCount || 0));
    item.unreadCount = 0;
  }
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChat: () => initialState,
    setActiveConversation: (state, action) => {
      state.admin.activeId = action.payload;
    },

    // ── Sự kiện realtime từ socket ──

    // Có tin nhắn mới. Payload dạng admin: { conversation, message }; dạng gia sư:
    // { conversationId, message, unreadCount }.
    socketMessageReceived: (state, action) => {
      const p = action.payload;
      if (p.conversation) {
        const admin = state.admin;
        const incoming = p.conversation;
        const idx = admin.conversations.findIndex((c) => c.id === incoming.id);
        const oldUnread = idx >= 0 ? admin.conversations[idx].unreadCount || 0 : 0;
        admin.totalUnread = Math.max(
          0,
          admin.totalUnread + ((incoming.unreadCount || 0) - oldUnread)
        );
        admin.conversations = upsertConversation(admin.conversations, incoming);
        if (admin.activeId === incoming.id) dedupPush(admin.messages, p.message);
      } else if (p.conversationId !== undefined) {
        const tutor = state.tutor;
        dedupPush(tutor.messages, p.message);
        if (typeof p.unreadCount === "number") tutor.unreadCount = p.unreadCount;
      }
    },

    // Một phía đã đọc. Payload: { conversationId, viewerRole }.
    socketReadReceived: (state, action) => {
      const { conversationId, viewerRole } = action.payload;
      if (viewerRole === "admin") {
        applyAdminRead(state.admin, conversationId);
      } else if (viewerRole === "tutor") {
        state.tutor.unreadCount = 0;
      }
    },

    // Hội thoại mới được admin mở. Payload: { conversation }.
    socketConversationUpserted: (state, action) => {
      state.admin.conversations = upsertConversation(state.admin.conversations, action.payload.conversation);
    },
  },
  extraReducers: (builder) => {
    // ── Gia sư ──
    builder
      .addCase(fetchMyConversationThunk.pending, (state) => {
        state.tutor.loading = true;
      })
      .addCase(fetchMyConversationThunk.fulfilled, (state, action) => {
        state.tutor.loading = false;
        state.tutor.conversation = action.payload.conversation;
        state.tutor.messages = action.payload.messages || [];
        state.tutor.unreadCount = action.payload.conversation?.unreadCount ?? 0;
      })
      .addCase(fetchMyConversationThunk.rejected, (state) => {
        state.tutor.loading = false;
      });

    builder.addCase(fetchMyUnreadCountThunk.fulfilled, (state, action) => {
      state.tutor.unreadCount = action.payload ?? 0;
    });

    builder
      .addCase(sendMyMessageThunk.pending, (state) => {
        state.tutor.sending = true;
      })
      .addCase(sendMyMessageThunk.fulfilled, (state, action) => {
        state.tutor.sending = false;
        // Socket có thể đã phát tin này về trước khi HTTP trả về → tránh trùng theo id.
        dedupPush(state.tutor.messages, action.payload);
      })
      .addCase(sendMyMessageThunk.rejected, (state) => {
        state.tutor.sending = false;
      });

    // Gia sư gửi ảnh — dùng chung logic chống trùng với gửi text.
    builder
      .addCase(sendMyImageThunk.pending, (state) => {
        state.tutor.sending = true;
      })
      .addCase(sendMyImageThunk.fulfilled, (state, action) => {
        state.tutor.sending = false;
        dedupPush(state.tutor.messages, action.payload);
      })
      .addCase(sendMyImageThunk.rejected, (state) => {
        state.tutor.sending = false;
      });

    builder.addCase(markMyReadThunk.fulfilled, (state) => {
      state.tutor.unreadCount = 0;
    });

    // ── Admin ──
    builder
      .addCase(fetchConversationsThunk.pending, (state) => {
        state.admin.loadingList = true;
      })
      .addCase(fetchConversationsThunk.fulfilled, (state, action) => {
        state.admin.loadingList = false;
        state.admin.conversations = action.payload.conversations || [];
        if (action.payload.pagination) state.admin.pagination = action.payload.pagination;
        // Đồng bộ lại tổng chưa đọc từ server (nguồn chuẩn) khi tải danh sách.
        if (typeof action.payload.totalUnread === "number") {
          state.admin.totalUnread = action.payload.totalUnread;
        }
      })
      .addCase(fetchConversationsThunk.rejected, (state) => {
        state.admin.loadingList = false;
      });

    builder.addCase(fetchAdminUnreadCountThunk.fulfilled, (state, action) => {
      state.admin.totalUnread = action.payload ?? 0;
    });

    builder
      .addCase(fetchConversationMessagesThunk.pending, (state) => {
        state.admin.loadingMessages = true;
      })
      .addCase(fetchConversationMessagesThunk.fulfilled, (state, action) => {
        state.admin.loadingMessages = false;
        state.admin.activeConversation = action.payload.conversation;
        state.admin.messages = action.payload.messages || [];
      })
      .addCase(fetchConversationMessagesThunk.rejected, (state) => {
        state.admin.loadingMessages = false;
      });

    builder
      .addCase(sendConversationMessageThunk.pending, (state) => {
        state.admin.sending = true;
      })
      .addCase(sendConversationMessageThunk.fulfilled, (state, action) => {
        state.admin.sending = false;
        // Socket có thể đã phát tin này về trước khi HTTP trả về → tránh trùng theo id.
        applyAdminSent(state.admin, action.payload);
      })
      .addCase(sendConversationMessageThunk.rejected, (state) => {
        state.admin.sending = false;
      });

    // Admin gửi ảnh — dùng chung logic với gửi text.
    builder
      .addCase(sendConversationImageThunk.pending, (state) => {
        state.admin.sending = true;
      })
      .addCase(sendConversationImageThunk.fulfilled, (state, action) => {
        state.admin.sending = false;
        applyAdminSent(state.admin, action.payload);
      })
      .addCase(sendConversationImageThunk.rejected, (state) => {
        state.admin.sending = false;
      });

    builder.addCase(markConversationReadThunk.fulfilled, (state, action) => {
      applyAdminRead(state.admin, action.payload);
    });

    builder.addCase(startConversationThunk.fulfilled, (state, action) => {
      state.admin.conversations = upsertConversation(state.admin.conversations, action.payload);
      state.admin.activeId = action.payload.id;
    });
  },
});

export const {
  clearChat,
  setActiveConversation,
  socketMessageReceived,
  socketReadReceived,
  socketConversationUpserted,
} = chatSlice.actions;

export const selectTutorChat = (state) => state.chat.tutor;
export const selectTutorUnreadCount = (state) => state.chat.tutor.unreadCount;
export const selectAdminChat = (state) => state.chat.admin;
export const selectAdminUnreadTotal = (state) => state.chat.admin.totalUnread;

export default chatSlice.reducer;
