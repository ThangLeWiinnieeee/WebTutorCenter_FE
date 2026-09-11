import { configureStore } from "@reduxjs/toolkit";
// Import reducer trực tiếp từ file slice (không qua barrel) để các trang vẫn tách được chunk.
import authReducer from "@/features/auth/store/authSlice";
import tutorReducer from "@/features/tutors/store/tutorSlice";
import adminReducer from "@/admin/store/adminSlice";
import notificationReducer from "@/features/notifications/store/notificationSlice";
import adminNotificationReducer from "@/admin/store/adminNotificationSlice";
import classReducer from "@/features/classes/store/classSlice";
import voucherReducer from "@/features/vouchers/store/voucherSlice";
import reviewReducer from "@/features/reviews/store/reviewSlice";
import chatReducer from "@/features/chat/store/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tutors: tutorReducer,
    admin: adminReducer,
    notifications: notificationReducer,
    adminNotifications: adminNotificationReducer,
    classes: classReducer,
    vouchers: voucherReducer,
    reviews: reviewReducer,
    chat: chatReducer,
  },
});
