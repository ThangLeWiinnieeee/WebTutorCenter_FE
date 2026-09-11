import { createApiThunk } from "@/app/createApiThunk";
import voucherService from "@/features/vouchers/services/voucherService";

// Lấy kho voucher cá nhân của người dùng.
export const fetchMyVouchersThunk = createApiThunk(
  "vouchers/fetchMine",
  async (params = {}) => {
    const res = await voucherService.getMyVouchers(params);
    return res.data.data; // { vouchers, pagination }
  },
  "Không tải được kho mã giảm giá",
);
