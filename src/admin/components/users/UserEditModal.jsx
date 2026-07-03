import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { adminUserSchema } from "@/admin/schemas/adminUserSchema";
import { scrollToFirstError } from "@/lib/formErrors";

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getUserFormValues = (user) => ({
  fullName: user?.fullName || "",
  phone: user?.phone || "",
  gender: user?.gender || "",
  dateOfBirth: formatDateInput(user?.dateOfBirth),
  isVerified: user?.isVerified ? "true" : "false",
});

const UserEditModal = ({ user, isSelf, onClose, onSubmit, loading }) => {
  const form = useForm({
    resolver: zodResolver(adminUserSchema),
    defaultValues: getUserFormValues(user),
  });

  // Vai trò quản lý ngoài react-hook-form (chỉ cho phép user ↔ admin; gia sư quản qua
  // luồng duyệt nên không sửa ở đây, và không cho tự đổi vai trò của chính mình).
  const [role, setRole] = useState(user?.role || "user");
  const canEditRole = !isSelf && user?.role !== "tutor";

  // Đồng bộ vai trò khi đổi user được chọn — điều chỉnh state trong render (không qua effect).
  const [prevUserId, setPrevUserId] = useState(user?.id);
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setRole(user?.role || "user");
  }

  useEffect(() => {
    form.reset(getUserFormValues(user));
  }, [form, user]);

  const errors = form.formState.errors;

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      fullName: values.fullName.trim(),
      phone: values.phone?.trim() || null,
      gender: values.gender || null,
      dateOfBirth: values.dateOfBirth || null,
      isVerified: values.isVerified === "true",
      ...(canEditRole ? { role } : {}),
    });
  }, scrollToFirstError);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
              <Pencil className="h-4 w-4" />
              Cập nhật tài khoản
            </div>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Sửa thông tin người dùng</h2>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Họ tên</span>
            <input
              {...form.register("fullName")}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              placeholder="Nhập họ tên"
            />
            {errors.fullName && <span className="text-xs text-rose-600">{errors.fullName.message}</span>}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Số điện thoại</span>
            <input
              {...form.register("phone")}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              placeholder="VD: 0987654321"
            />
            {errors.phone && <span className="text-xs text-rose-600">{errors.phone.message}</span>}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Ngày sinh</span>
            <input
              type="date"
              {...form.register("dateOfBirth")}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
            {errors.dateOfBirth && <span className="text-xs text-rose-600">{errors.dateOfBirth.message}</span>}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Giới tính</span>
            <select
              {...form.register("gender")}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            >
              <option value="">Chưa cập nhật</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            {errors.gender && <span className="text-xs text-rose-600">{errors.gender.message}</span>}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Vai trò</span>
            {canEditRole ? (
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              >
                <option value="user">Học viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            ) : (
              <select
                value={user.role || "user"}
                disabled
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="user">Học viên</option>
                <option value="tutor">Gia sư</option>
                <option value="admin">Quản trị viên</option>
              </select>
            )}
            {canEditRole && role === "admin" && user.role !== "admin" ? (
              <span className="text-xs text-amber-600">Tài khoản sẽ được cấp toàn quyền quản trị hệ thống.</span>
            ) : (
              <span className="text-xs text-slate-500">
                {isSelf
                  ? "Không thể thay đổi vai trò của chính bạn."
                  : user.role === "tutor"
                    ? "Vai trò gia sư được quản lý qua quy trình duyệt gia sư."
                    : "Cấp hoặc thu quyền quản trị viên cho tài khoản này."}
              </span>
            )}
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Xác thực email</span>
            <select
              {...form.register("isVerified")}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            >
              <option value="true">Đã xác thực</option>
              <option value="false">Chưa xác thực</option>
            </select>
            {errors.isVerified && <span className="text-xs text-rose-600">{errors.isVerified.message}</span>}
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-10 rounded-lg bg-[#1e3a5f] px-5 font-semibold text-white hover:bg-[#16304f]"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserEditModal;
