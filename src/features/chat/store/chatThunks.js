import { createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "@/features/chat/services/chatService";

// ──────────────────────────── Gia sư ────────────────────────────

export const fetchMyConversationThunk = createAsyncThunk(
  "chat/fetchMyConversation",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await chatService.getMyConversation(params);
      return res.data.data; // { conversation, messages, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy cuộc trò chuyện thất bại");
    }
  }
);

export const fetchMyUnreadCountThunk = createAsyncThunk(
  "chat/fetchMyUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await chatService.getMyUnreadCount();
      return res.data.data.unreadCount ?? 0;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy số tin chưa đọc thất bại");
    }
  }
);

export const sendMyMessageThunk = createAsyncThunk(
  "chat/sendMyMessage",
  async (content, { rejectWithValue }) => {
    try {
      const res = await chatService.sendMyMessage(content);
      return res.data.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gửi tin nhắn thất bại");
    }
  }
);

export const sendMyImageThunk = createAsyncThunk(
  "chat/sendMyImage",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await chatService.sendMyImage(formData);
      return res.data.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gửi ảnh thất bại");
    }
  }
);

export const markMyReadThunk = createAsyncThunk(
  "chat/markMyRead",
  async (_, { rejectWithValue }) => {
    try {
      await chatService.markMyConversationRead();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đánh dấu đã đọc thất bại");
    }
  }
);

// ──────────────────────────── Admin ────────────────────────────

export const fetchConversationsThunk = createAsyncThunk(
  "chat/fetchConversations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await chatService.getConversations(params);
      return res.data.data; // { conversations, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy danh sách hội thoại thất bại");
    }
  }
);

export const fetchAdminUnreadCountThunk = createAsyncThunk(
  "chat/fetchAdminUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await chatService.getAdminUnreadCount();
      return res.data.data.unreadCount ?? 0;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy số tin chưa đọc thất bại");
    }
  }
);

export const fetchConversationMessagesThunk = createAsyncThunk(
  "chat/fetchConversationMessages",
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const res = await chatService.getConversationMessages(id, params);
      return res.data.data; // { conversation, messages, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lấy tin nhắn thất bại");
    }
  }
);

export const sendConversationMessageThunk = createAsyncThunk(
  "chat/sendConversationMessage",
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const res = await chatService.sendConversationMessage(id, content);
      return { id, message: res.data.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gửi tin nhắn thất bại");
    }
  }
);

export const sendConversationImageThunk = createAsyncThunk(
  "chat/sendConversationImage",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await chatService.sendConversationImage(id, formData);
      return { id, message: res.data.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gửi ảnh thất bại");
    }
  }
);

export const markConversationReadThunk = createAsyncThunk(
  "chat/markConversationRead",
  async (id, { rejectWithValue }) => {
    try {
      await chatService.markConversationRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đánh dấu đã đọc thất bại");
    }
  }
);

export const startConversationThunk = createAsyncThunk(
  "chat/startConversation",
  async (tutorUserId, { rejectWithValue }) => {
    try {
      const res = await chatService.startConversation(tutorUserId);
      return res.data.data.conversation;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Mở cuộc trò chuyện thất bại");
    }
  }
);
