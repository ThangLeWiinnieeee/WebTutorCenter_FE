import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Loader2,
  Lock,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Unlock,
  UserCog,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getAdminUsersThunk,
  softDeleteAdminUserThunk,
  updateAdminUserStatusThunk,
  updateAdminUserThunk,
} from "@/admin/store/adminThunks";
import { adminUserSchema } from "@/admin/schemas/adminUserSchema";
import useAuth from "@/features/auth/hooks/useAuth";
import {
  ADMIN_PAGE_SIZE as PAGE_SIZE,
  USER_ROLE_OPTIONS as ROLE_OPTIONS,
  USER_STATUS_OPTIONS as STATUS_OPTIONS,
  USER_VERIFY_OPTIONS as VERIFY_OPTIONS,
  USER_ROLE_CONFIG as ROLE_CONFIG,
  USER_DEFAULT_FILTERS as DEFAULT_FILTERS,
} from "@/admin/constants";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

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

const buildParams = (filters, page) => ({
  page,
  limit: PAGE_SIZE,
  ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {}),
  ...(filters.role ? { role: filters.role } : {}),
  ...(filters.isActive !== "" ? { isActive: filters.isActive } : {}),
  ...(filters.isVerified !== "" ? { isVerified: filters.isVerified } : {}),
});

const StatusBadge = ({ active, activeLabel, inactiveLabel }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
      active
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-50 text-slate-600"
    }`}
  >
    {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
    {active ? activeLabel : inactiveLabel}
  </span>
);

const UserAvatar = ({ user }) => (
  <div className="flex items-center gap-3">
    {user.avatar ? (
      <img
        src={user.avatar}
        alt={user.fullName}
        referrerPolicy="no-referrer"
        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
      />
    ) : (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white">
        {(user.fullName ?? user.email ?? "?")[0].toUpperCase()}
      </div>
    )}
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-slate-800">{user.fullName || "Chưa cập nhật"}</p>
      <p className="truncate text-xs text-slate-500">{user.email}</p>
    </div>
  </div>
);

const ConfirmStatusModal = ({ user, onClose, onConfirm, loading }) => {
  if (!user) return null;

  const nextActive = !user.isActive;
  const title = nextActive ? "Mở khóa tài khoản" : "Khóa tài khoản";
  const description = nextActive
    ? "Người dùng sẽ có thể đăng nhập và tiếp tục sử dụng hệ thống."
    : "Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa lại.";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-status-dialog-title"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
              nextActive
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-rose-100 bg-rose-50 text-rose-700"
            }`}
          >
            {nextActive ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
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

        <div className="mt-5 space-y-2">
          <h2 id="user-status-dialog-title" className="text-xl font-bold text-slate-900">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">{user.fullName || "Chưa cập nhật"}</p>
          <p className="mt-1 text-xs text-slate-500">{user.email}</p>
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
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`h-10 rounded-lg px-5 font-semibold text-white ${
              nextActive ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {nextActive ? "Mở khóa" : "Khóa tài khoản"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const EditUserModal = ({ user, onClose, onSubmit, loading }) => {
  const form = useForm({
    resolver: zodResolver(adminUserSchema),
    defaultValues: getUserFormValues(user),
  });

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
    });
  });

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
            <select
              defaultValue={user.role || "user"}
              disabled
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="user">Học viên</option>
              <option value="tutor">Gia sư</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <span className="text-xs text-slate-500">Vai trò gia sư được cập nhật qua quy trình duyệt gia sư.</span>
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

const ConfirmDeleteModal = ({ user, onClose, onConfirm, loading }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-delete-dialog-title"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-700">
            <AlertTriangle className="h-6 w-6" />
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

        <div className="mt-5 space-y-2">
          <h2 id="user-delete-dialog-title" className="text-xl font-bold text-slate-900">
            Xóa mềm người dùng
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Tài khoản sẽ được ẩn khỏi danh sách và bị vô hiệu hóa, nhưng dữ liệu vẫn được giữ trong database.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">{user.fullName || "Chưa cập nhật"}</p>
          <p className="mt-1 text-xs text-slate-500">{user.email}</p>
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
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-10 rounded-lg bg-rose-600 px-5 font-semibold text-white hover:bg-rose-700"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Xóa mềm
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminUsersPage = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const {
    users,
    usersPagination,
    usersLoading,
    usersError,
    userActionLoading,
  } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  const params = useMemo(() => buildParams(appliedFilters, page), [appliedFilters, page]);

  useEffect(() => {
    dispatch(getAdminUsersThunk(params));
  }, [dispatch, params]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleRefresh = () => {
    dispatch(getAdminUsersThunk(params));
  };

  const handleUpdateUser = async (payload) => {
    if (!editUser) return;

    const result = await dispatch(
      updateAdminUserThunk({
        id: editUser.id,
        payload,
      }),
    );

    if (updateAdminUserThunk.fulfilled.match(result)) {
      toast.success("Cập nhật người dùng thành công");
      setEditUser(null);
      dispatch(getAdminUsersThunk(params));
      return;
    }

    toast.error(result.payload || "Cập nhật người dùng thất bại");
  };

  const handleConfirmStatus = async () => {
    if (!confirmUser) return;

    const result = await dispatch(
      updateAdminUserStatusThunk({
        id: confirmUser.id,
        isActive: !confirmUser.isActive,
      }),
    );

    if (updateAdminUserStatusThunk.fulfilled.match(result)) {
      toast.success("Cập nhật trạng thái người dùng thành công");
      setConfirmUser(null);
      dispatch(getAdminUsersThunk(params));
      return;
    }

    toast.error(result.payload || "Cập nhật trạng thái người dùng thất bại");
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteUser) return;

    const result = await dispatch(softDeleteAdminUserThunk(confirmDeleteUser.id));

    if (softDeleteAdminUserThunk.fulfilled.match(result)) {
      toast.success("Xóa mềm người dùng thành công");
      setConfirmDeleteUser(null);

      if (users.length === 1 && page > 1) {
        setPage((current) => current - 1);
        return;
      }

      dispatch(getAdminUsersThunk(params));
      return;
    }

    toast.error(result.payload || "Xóa người dùng thất bại");
  };

  const totalPages = usersPagination?.totalPages || 1;
  const totalItems = usersPagination?.totalItems || 0;
  const startIndex = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
              <UserCog className="h-4 w-4" />
              Quản lý hệ thống
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Theo dõi tài khoản, lọc theo vai trò/trạng thái và khóa hoặc mở khóa người dùng khi cần.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={usersLoading}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            {usersLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Làm mới
          </Button>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4 text-slate-500" />
          Bộ lọc người dùng
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.keyword}
              onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
              placeholder="Tìm theo tên, email, số điện thoại"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
          </div>

          <select
            value={filters.role}
            onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value }))}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={filters.isActive}
            onChange={(event) => setFilters((prev) => ({ ...prev, isActive: event.target.value }))}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={filters.isVerified}
            onChange={(event) => setFilters((prev) => ({ ...prev, isVerified: event.target.value }))}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
          >
            {VERIFY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <Button type="submit" className="h-10 rounded-lg bg-[#1e3a5f] text-white hover:bg-[#16304f]">
            Lọc
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            Xóa
          </Button>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Danh sách tài khoản</h2>
            <p className="mt-1 text-sm text-slate-500">
              Hiển thị {startIndex}–{endIndex} / {totalItems} người dùng
            </p>
          </div>
          {usersLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
        </div>

        {usersError ? (
          <div className="m-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {usersError}
          </div>
        ) : usersLoading && users.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tải danh sách người dùng...
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <Shield className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Không tìm thấy người dùng</p>
            <p className="mt-1 text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Người dùng</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vai trò</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Xác thực</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ngày tạo</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((item) => {
                  const roleConfig = ROLE_CONFIG[item.role] ?? {
                    label: item.role,
                    className: "bg-slate-50 text-slate-700 border-slate-200",
                  };
                  const isSelf = currentUser?.id === item.id;

                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <UserAvatar user={item} />
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${roleConfig.className}`}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge active={item.isActive} activeLabel="Hoạt động" inactiveLabel="Đã khóa" />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge active={item.isVerified} activeLabel="Đã xác thực" inactiveLabel="Chưa xác thực" />
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={userActionLoading === item.id}
                            onClick={() => setEditUser(item)}
                            className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" />
                            Sửa
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSelf || userActionLoading === item.id}
                            onClick={() => setConfirmUser(item)}
                            className={`rounded-lg ${
                              item.isActive
                                ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                            title={isSelf ? "Không thể khóa chính tài khoản đang đăng nhập" : undefined}
                          >
                            {userActionLoading === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : item.isActive ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                            {item.isActive ? "Khóa" : "Mở khóa"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSelf || userActionLoading === item.id}
                            onClick={() => setConfirmDeleteUser(item)}
                            className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                            title={isSelf ? "Không thể xóa chính tài khoản đang đăng nhập" : undefined}
                          >
                            {userActionLoading === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm">
          <p className="text-slate-500">
            Trang {usersPagination?.page || page}/{totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || usersLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border-slate-300 text-slate-700"
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || usersLoading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-lg border-slate-300 text-slate-700"
            >
              Sau
            </Button>
          </div>
        </div>
      </section>

      <ConfirmStatusModal
        user={confirmUser}
        onClose={() => setConfirmUser(null)}
        onConfirm={handleConfirmStatus}
        loading={Boolean(confirmUser && userActionLoading === confirmUser.id)}
      />
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSubmit={handleUpdateUser}
          loading={userActionLoading === editUser.id}
        />
      )}
      <ConfirmDeleteModal
        user={confirmDeleteUser}
        onClose={() => setConfirmDeleteUser(null)}
        onConfirm={handleConfirmDelete}
        loading={Boolean(confirmDeleteUser && userActionLoading === confirmDeleteUser.id)}
      />
    </div>
  );
};

export default AdminUsersPage;
