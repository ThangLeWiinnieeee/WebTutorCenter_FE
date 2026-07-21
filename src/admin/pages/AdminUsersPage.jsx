import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/Pagination";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import {
  getAdminUsersThunk,
  softDeleteAdminUserThunk,
  updateAdminUserStatusThunk,
  updateAdminUserThunk,
} from "@/admin/store/adminThunks";
import useAuth from "@/features/auth/hooks/useAuth";
import {
  ADMIN_PAGE_SIZE as PAGE_SIZE,
  USER_ROLE_OPTIONS as ROLE_OPTIONS,
  USER_STATUS_OPTIONS as STATUS_OPTIONS,
  USER_VERIFY_OPTIONS as VERIFY_OPTIONS,
  USER_ROLE_CONFIG as ROLE_CONFIG,
  USER_DEFAULT_FILTERS as DEFAULT_FILTERS,
} from "@/admin/constants";
import {
  StatusBadge,
  UserAvatar,
  UserStatusModal,
  UserEditModal,
  UserDeleteModal,
} from "@/admin/components/users";
import { formatDate } from "@/lib/format";

// Dựng tham số truy vấn danh sách người dùng từ bộ lọc và số trang.
const buildParams = (filters, keyword, page) => ({
  page,
  limit: PAGE_SIZE,
  ...(keyword ? { keyword } : {}),
  ...(filters.role ? { role: filters.role } : {}),
  ...(filters.isActive !== "" ? { isActive: filters.isActive } : {}),
  ...(filters.isVerified !== "" ? { isVerified: filters.isVerified } : {}),
});

// Trang admin quản lý người dùng: lọc, sửa, đổi trạng thái và xóa mềm.
const AdminUsersPage = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { users, usersPagination, usersLoading, usersError, userActionLoading } = useSelector(
    (state) => state.admin,
  );

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [keywordInput, setKeywordInput] = useState("");
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  const debouncedKeyword = useDebouncedValue(keywordInput.trim());

  // Từ khóa vừa chốt sau debounce → quay về trang 1. Chỉnh state ngay trong lượt render
  // (pattern "adjusting state when props change" của React) chứ không đặt trong onChange
  // hay useEffect: hai cách kia đều bắn thêm một lượt fetch thừa với từ khóa cũ.
  const [appliedKeyword, setAppliedKeyword] = useState(debouncedKeyword);
  if (appliedKeyword !== debouncedKeyword) {
    setAppliedKeyword(debouncedKeyword);
    setPage(1);
  }

  const params = useMemo(
    () => buildParams(filters, debouncedKeyword, page),
    [filters, debouncedKeyword, page],
  );

  useEffect(() => {
    dispatch(getAdminUsersThunk(params));
  }, [dispatch, params]);

  // Select lọc áp dụng ngay khi đổi và quay về trang 1.
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Xóa toàn bộ bộ lọc về mặc định.
  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setKeywordInput("");
    setPage(1);
  };

  // Tải lại danh sách người dùng.
  const handleRefresh = () => {
    dispatch(getAdminUsersThunk(params));
  };

  // Lưu thay đổi thông tin người dùng.
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

  // Xác nhận bật/tắt trạng thái hoạt động của người dùng.
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

  // Xác nhận xóa mềm người dùng đang chọn.
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
            <div className="flex items-center gap-2 text-sm font-semibold text-brand">
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4 text-slate-500" />
          Bộ lọc người dùng
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại"
              autoComplete="off"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
            {keywordInput && (
              <button
                type="button"
                onClick={() => setKeywordInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Xóa từ khóa"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <select
            value={filters.role}
            onChange={(event) => updateFilter("role", event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.isActive}
            onChange={(event) => updateFilter("isActive", event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.isVerified}
            onChange={(event) => updateFilter("isVerified", event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
          >
            {VERIFY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-10 rounded-lg border-slate-300 text-slate-700"
          >
            Xóa
          </Button>
        </div>
      </div>

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
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Người dùng
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Vai trò
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Xác thực
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ngày tạo
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Thao tác
                  </th>
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
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${roleConfig.className}`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge active={item.isActive} activeLabel="Hoạt động" inactiveLabel="Đã khóa" />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          active={item.isVerified}
                          activeLabel="Đã xác thực"
                          inactiveLabel="Chưa xác thực"
                        />
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(item.createdAt)}</td>
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
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </section>

      <UserStatusModal
        user={confirmUser}
        onClose={() => setConfirmUser(null)}
        onConfirm={handleConfirmStatus}
        loading={Boolean(confirmUser && userActionLoading === confirmUser.id)}
      />
      {editUser && (
        <UserEditModal
          user={editUser}
          isSelf={currentUser?.id === editUser.id}
          onClose={() => setEditUser(null)}
          onSubmit={handleUpdateUser}
          loading={userActionLoading === editUser.id}
        />
      )}
      <UserDeleteModal
        user={confirmDeleteUser}
        onClose={() => setConfirmDeleteUser(null)}
        onConfirm={handleConfirmDelete}
        loading={Boolean(confirmDeleteUser && userActionLoading === confirmDeleteUser.id)}
      />
    </div>
  );
};

export default AdminUsersPage;
