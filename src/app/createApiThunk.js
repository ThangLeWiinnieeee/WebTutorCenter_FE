import { createAsyncThunk } from "@reduxjs/toolkit";

// Gói lại phần try/catch + rejectWithValue mà mọi thunk gọi API đều lặp y hệt nhau
// (trước đây là 97 khối giống hệt rải khắp 9 file store).
//
//   export const getUsersThunk = createApiThunk(
//     "admin/getUsers",
//     async (params) => (await adminService.getUsers(params)).data.data,
//     "Không lấy được danh sách người dùng",
//   );
//
// `run` trả thẳng giá trị muốn đưa vào payload. Thunk nào cần thêm việc trong nhánh
// catch (ví dụ logoutThunk vẫn phải xoá token khi API lỗi) thì giữ createAsyncThunk gốc.
export const createApiThunk = (type, run, errorMessage) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await run(arg);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || errorMessage);
    }
  });

export default createApiThunk;
