import { createAsyncThunk } from "@reduxjs/toolkit";
import tutorService from "@/features/tutors/services/tutorService";

export const registerTutorThunk = createAsyncThunk(
  "tutors/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await tutorService.register(data);
      return res.data.data.tutor;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đăng ký gia sư thất bại");
    }
  }
);

export const getTutorProfileThunk = createAsyncThunk(
  "tutors/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await tutorService.getProfile();
      return res.data.data.tutor;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Không lấy được hồ sơ gia sư");
    }
  }
);
