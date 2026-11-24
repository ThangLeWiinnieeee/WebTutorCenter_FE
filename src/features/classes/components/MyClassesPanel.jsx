import { useEffect, useMemo, useRef, useState } from "react";
import AOS from "aos";

import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  CreditCard,
  Eye,
  Inbox,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import HoverInfoCard from "@/components/shared/HoverInfoCard";
import Pagination from "@/components/shared/Pagination";
import ClassAttendanceDialog from "@/features/attendance/components/ClassAttendanceDialog";
import MyClassDetailDialog from "@/features/classes/components/MyClassDetailDialog";
import { fetchMyClassesThunk } from "@/features/classes/store/classThunks";
import { refreshUnreadCountThunk } from "@/features/notifications/store/notificationThunks";
import { formatDateTime, formatPrice, formatStudentGender } from "@/features/classes/utils/classFormatters";
import { STATUS_META } from "@/features/classes/utils/applicationStatus";

const PAGE_SIZE = 10;

const FILTER_GROUPS = [
  { key: "all", label: "Tất cả", apiStatus: "all" },
  { key: "teaching", label: "Đang dạy", apiStatus: "approved" },
  { key: "waiting", label: "Chờ xác nhận", apiStatus: "all", statuses: ["pending", "selected", "cancel_requested"] },
  { key: "ended", label: "Đã kết thúc / Hủy", apiStatus: "all", statuses: ["rejected", "not_selected", "cancelled"] },
];

// Quản lý lớp học & điểm danh dành cho Gia sư (Trái: danh sách lớp 33%, Phải: bảng điểm danh 67%).
export default function MyClassesPanel() {
  const dispatch = useDispatch();
  const { myClasses, myClassesPagination, myClassesCounts, loadingMyClasses, error } = useSelector(
    (state) => state.classes,
  );
  const [activeGroup, setActiveGroup] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [attendanceApp, setAttendanceApp] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const attendanceSectionRef = useRef(null);

  const currentGroup = FILTER_GROUPS.find((g) => g.key === activeGroup) || FILTER_GROUPS[0];

  useEffect(() => {
    dispatch(fetchMyClassesThunk({ page, limit: PAGE_SIZE, status: currentGroup.apiStatus }));
  }, [dispatch, page, currentGroup.apiStatus]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (!payment) return;
    const classCode = searchParams.get("classCode");
    const suffix = classCode ? ` mã lớp ${classCode}` : "";
    if (payment === "success") {
      toast.success(`Đã thanh toán phí nhận lớp${suffix} thành công! Thông tin lớp đã được mở khóa.`);
    } else {
      toast.error(`Thanh toán phí nhận lớp${suffix} thất bại. Vui lòng liên hệ admin nếu có lỗi.`);
    }
    dispatch(refreshUnreadCountThunk());
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleClasses = useMemo(() => {
    if (!currentGroup.statuses) return myClasses;
    return myClasses.filter((app) => currentGroup.statuses.includes(app.status));
  }, [myClasses, currentGroup.statuses]);

  // Ngầm định chọn lớp đầu tiên đã mở khóa khi vào trang
  useEffect(() => {
    if (loadingMyClasses) return;
    if (visibleClasses.length === 0) {
      setAttendanceApp(null);
      return;
    }
    const unlockedList = visibleClasses.filter((app) => Boolean(app.isUnlocked));
    const stillValid = unlockedList.find((app) => app.id === attendanceApp?.id);
    if (!stillValid) {
      setAttendanceApp(unlockedList[0] || null);
    }
  }, [visibleClasses, loadingMyClasses, attendanceApp?.id]);

  const handleGroupChange = (groupKey) => {
    setActiveGroup(groupKey);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectAttendance = (application) => {
    setAttendanceApp(application);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        attendanceSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  };

  const counts = myClassesCounts || {};
  const groupCounts = {
    all: counts.all ?? 0,
    teaching: counts.approved ?? 0,
    waiting: (counts.pending ?? 0) + (counts.selected ?? 0) + (counts.cancel_requested ?? 0),
    ended: (counts.rejected ?? 0) + (counts.not_selected ?? 0) + (counts.cancelled ?? 0),
  };
  const totalPages = myClassesPagination?.totalPages || 1;

  const skeletonItems = useMemo(
    () => Array.from({ length: 3 }, (_, index) => `my-class-skeleton-${index}`),
    [],
  );

  useEffect(() => {
    AOS.refreshHard();
  }, [loadingMyClasses, visibleClasses.length]);

  const getClassDisplayStatus = (application) => {
    const classItem = application.classItem || {};
    if (classItem.status === "completed") {
      return {
        label: "Đã kết thúc",
        className: "border-slate-200 bg-slate-100 text-slate-700",
      };
    }
    if (application.isUnlocked) {
      return {
        label: "Đang dạy",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }
    if (application.needsFeePayment) {
      return {
        label: "Chờ thanh toán",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    }
    const status = STATUS_META[application.status] || STATUS_META.pending;
    return {
      label: status.label,
      className: status.className,
    };
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Lớp của tôi & Điểm danh</h3>
            <p className="text-xs text-slate-500">
              Chọn một lớp ở cột trái để theo dõi lịch học và gửi điểm danh nhanh ở bên phải.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => dispatch(fetchMyClassesThunk({ page, limit: PAGE_SIZE, status: currentGroup.apiStatus }))}
          disabled={loadingMyClasses}
          className="h-9 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loadingMyClasses ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Compact Core Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_GROUPS.map((group) => {
          const isActive = activeGroup === group.key;
          return (
            <button
              key={group.key}
              type="button"
              onClick={() => handleGroupChange(group.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
              }`}
            >
              {group.label}
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {groupCounts[group.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loadingMyClasses && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-4">
            {skeletonItems.map((key) => (
              <div key={key} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white p-4" />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white lg:col-span-8" />
        </div>
      )}

      {/* Error */}
      {!loadingMyClasses && error && visibleClasses.length === 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700 shadow-xs">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loadingMyClasses && !error && visibleClasses.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            {activeGroup === "all" ? "Bạn chưa nhận lớp nào" : "Không có lớp nào trong nhóm này"}
          </p>
          <p className="max-w-md text-sm text-slate-500">
            Khám phá danh sách lớp đang cần gia sư và gửi yêu cầu nhận lớp phù hợp với bạn.
          </p>
          <Link to="/classes">
            <Button className="mt-2 h-10 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700">
              Xem lớp cần gia sư
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Split Layout: Left 33% (4 cols) = Class Cards, Right 67% (8 cols) = Attendance Workspace */}
      {!loadingMyClasses && visibleClasses.length > 0 && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left: Class Cards */}
          <div className="space-y-3 lg:col-span-4">
            {visibleClasses.map((application) => {
              const classItem = application.classItem || {};
              const isUnlocked = Boolean(application.isUnlocked);
              const needsFeePayment = Boolean(application.needsFeePayment);
              const classStatus = getClassDisplayStatus(application);
              const isSelected = attendanceApp?.id === application.id;
              const classTitle = `${classItem.subject || "Lớp"} - ${
                classItem.summary ||
                `Cần Gia Sư tại ${classItem.districtName || ""}, ${classItem.provinceName || ""}`
              }`;

              return (
                <div
                  key={application.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-2 border-emerald-600 bg-emerald-50/40 shadow-sm"
                      : "border-slate-200 bg-white shadow-xs hover:border-slate-300"
                  }`}
                >
                  {/* Top row: Mã lớp + Trạng thái */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-block rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                      {classItem.classCode || "—"}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${classStatus.className}`}
                    >
                      {classStatus.label}
                    </span>
                  </div>

                  {/* Title + Hover detail */}
                  <div className="mt-2.5">
                    <HoverInfoCard
                      title={`Chi tiết lớp ${classItem.classCode || ""}`}
                      badge={classItem.subject}
                      items={[
                        { label: "Môn học", value: classItem.subject },
                        { label: "Học phí / buổi", value: formatPrice(classItem.feePerSession) },
                        {
                          label: "Lịch học",
                          value: classItem.sessionsPerWeek
                            ? `${classItem.sessionsPerWeek} buổi/tuần • ${classItem.minutesPerSession || 90} phút`
                            : null,
                        },
                        {
                          label: "Học viên",
                          value: `${classItem.studentCount || 1} HV${
                            classItem.studentGender ? ` (${formatStudentGender(classItem.studentGender)})` : ""
                          }`,
                        },
                        {
                          label: "Người đăng",
                          value: isUnlocked
                            ? application.posterInfo?.fullName || classItem.posterName || "Đã mở khóa"
                            : "Ẩn đến khi thanh toán",
                        },
                        { label: "Ngày nhận", value: formatDateTime(application.createdAt) },
                      ]}
                      trigger={
                        <h4 className="line-clamp-2 text-sm font-bold text-slate-900">
                          {classTitle}
                        </h4>
                      }
                    />
                  </div>

                  {/* Meta */}
                  <p className="mt-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-emerald-700">
                      {formatPrice(classItem.feePerSession)}/buổi
                    </span>{" "}
                    • {classItem.sessionsPerWeek || 0} buổi/tuần • {classItem.studentCount || 1} học viên
                  </p>

                  {!isUnlocked && (
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                      {needsFeePayment ? (
                        <>
                          <CreditCard className="h-3.5 w-3.5" />
                          Chờ thanh toán phí nhận lớp
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-slate-400">Thông tin chi tiết đang ẩn</span>
                        </>
                      )}
                    </p>
                  )}

                  {/* Actions: 1 Primary CTA ("Điểm danh") + 1 Secondary link ("Xem chi tiết") */}
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelected(application)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-emerald-700"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Xem chi tiết
                    </button>

                    {isUnlocked && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSelectAttendance(application)}
                        className="h-8 bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <CalendarCheck2 className="mr-1.5 h-3.5 w-3.5" />
                        Điểm danh
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="pt-1"
              />
            )}
          </div>

          {/* Right: Attendance Workspace (8 cols) */}
          <div ref={attendanceSectionRef} className="lg:col-span-8 lg:sticky lg:top-6">
            {attendanceApp?.classItem?.id ? (
              <ClassAttendanceDialog
                inline
                open
                classId={attendanceApp.classItem.id}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-xs">
                <CalendarCheck2 className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Chưa có lớp nào mở khóa điểm danh
                </p>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Lớp cần được duyệt và hoàn tất thanh toán phí nhận lớp để mở bảng điểm danh.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <MyClassDetailDialog
        open={Boolean(selected)}
        application={selected}
        onClose={() => setSelected(null)}
        onCancelled={() => {
          setSelected(null);
          dispatch(fetchMyClassesThunk({ page, limit: PAGE_SIZE, status: currentGroup.apiStatus }));
        }}
        onCompleted={() => {
          setSelected(null);
          dispatch(fetchMyClassesThunk({ page, limit: PAGE_SIZE, status: currentGroup.apiStatus }));
        }}
      />
    </div>
  );
}
