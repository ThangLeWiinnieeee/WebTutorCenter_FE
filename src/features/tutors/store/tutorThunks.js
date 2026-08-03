import { createApiThunk } from "@/app/createApiThunk";
import tutorService from "@/features/tutors/services/tutorService";

// Gửi hồ sơ đăng ký làm gia sư (trạng thái chờ duyệt).
export const registerTutorThunk = createApiThunk(
  "tutors/register",
  async (data) => {
    const res = await tutorService.register(data);
    return res.data.data.tutor;
  },
  "Đăng ký gia sư thất bại",
);

// Lấy hồ sơ gia sư của chính người dùng.
export const getTutorProfileThunk = createApiThunk(
  "tutors/getProfile",
  async () => {
    const res = await tutorService.getProfile();
    return res.data.data.tutor;
  },
  "Không lấy được hồ sơ gia sư",
);

// Lấy danh sách gia sư nổi bật.
export const getTopTutorsThunk = createApiThunk(
  "tutors/getTop",
  async (limit = 10) => {
    const res = await tutorService.getTopTutors(limit);
    return res.data.data.tutors || [];
  },
  "Lấy danh sách gia sư nổi bật thất bại",
);

// Lấy danh sách gia sư nổi bật trong tháng.
export const getTopTutorsThisMonthThunk = createApiThunk(
  "tutors/getTopThisMonth",
  async (limit = 10) => {
    const res = await tutorService.getTopTutorsThisMonth(limit);
    return res.data.data.tutors || [];
  },
  "Lấy danh sách gia sư tháng này thất bại",
);

// Lấy danh sách gia sư mới tham gia.
export const getNewTutorsThunk = createApiThunk(
  "tutors/getNew",
  async ({ days = 30, limit = 10 } = {}) => {
    const res = await tutorService.getNewTutors(days, limit);
    return res.data.data.tutors || [];
  },
  "Lấy danh sách gia sư mới thất bại",
);

// Lấy yêu cầu đổi hồ sơ đang chờ duyệt của chính gia sư.
export const fetchMyProfileChangeRequestThunk = createApiThunk(
  "tutors/fetchMyProfileChange",
  async () => {
    const res = await tutorService.getMyProfileChangeRequest();
    return res.data.data.request; // null nếu không có yêu cầu chờ duyệt
  },
  "Không tải được yêu cầu đổi thông tin",
);

// Gửi yêu cầu đổi hồ sơ gia sư để admin duyệt.
export const requestProfileChangeThunk = createApiThunk(
  "tutors/requestProfileChange",
  async (data) => {
    const res = await tutorService.requestProfileChange(data);
    return res.data.data.request;
  },
  "Gửi yêu cầu đổi thông tin thất bại",
);

// Tìm kiếm gia sư theo bộ lọc và phân trang.
export const searchTutorsThunk = createApiThunk(
  "tutors/search",
  async ({ filters = {}, page = 1, limit = 10 } = {}) => {
    const res = await tutorService.searchTutors(filters, page, limit);
    return {
      tutors: res.data.data.tutors || [],
      total: res.data.data.total || 0,
      page: page,
    };
  },
  "Tìm kiếm gia sư thất bại",
);
