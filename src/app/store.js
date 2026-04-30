import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth";
import { tutorReducer } from "@/features/tutors";
import { adminReducer } from "@/admin";
import notificationReducer from "@/features/notifications/store/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tutors: tutorReducer,
    admin: adminReducer,
    notifications: notificationReducer,
  },
});
