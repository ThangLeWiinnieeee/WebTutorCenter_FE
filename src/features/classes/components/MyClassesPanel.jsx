import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  ClipboardList,
  Clock3,
  Inbox,
  Lock,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import MyClassDetailDialog from "@/features/classes/components/MyClassDetailDialog";
import { fetchMyClassesThunk } from "@/features/classes/store/classThunks";
import { formatDateTime, formatPrice, formatStudentGender } from "@/features/classes/utils/classFormatters";
import { STATUS_META, STATUS_TABS } from "@/features/classes/utils/applicationStatus";

export default function MyClassesPanel() {
  const dispatch = useDispatch();
  const { myClasses, loadingMyClasses, error } = useSelector((state) => state.classes);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchMyClassesThunk());
  }, [dispatch]);

  const counts = useMemo(() => {
    const base = { all: myClasses.length, pending: 0, approved: 0, rejected: 0 };
    myClasses.forEach((item) => {
      if (base[item.status] !== undefined) base[item.status] += 1;
    });
    return base;
  }, [myClasses]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return myClasses;
    return myClasses.filter((item) => item.status === activeTab);
  }, [activeTab, myClasses]);

  const skeletonItems = useMemo(() => Array.from({ length: 3 }, (_, index) => `my-class-skeleton-${index}`), []);

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Danh sách nhận lớp</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Các lớp bạn đã gửi yêu cầu nhận và trạng thái xét duyệt.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch(fetchMyClassesThunk())}
          disabled={loadingMyClasses}
          className="h-10 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loadingMyClasses ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {counts[tab.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loadingMyClasses && (
        <div className="space-y-4">
          {skeletonItems.map((key) => (
            <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-1/3 rounded bg-slate-200" />
                <div className="h-6 w-2/3 rounded bg-slate-200" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-10 rounded bg-slate-200" />
                  <div className="h-10 rounded bg-slate-200" />
                  <div className="h-10 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loadingMyClasses && error && myClasses.length === 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700 shadow-sm">{error}</div>
      )}

      {/* Empty */}
      {!loadingMyClasses && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            {activeTab === "all" ? "Bạn chưa nhận lớp nào" : "Không có lớp nào ở trạng thái này"}
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

      {/* List */}
      {!loadingMyClasses && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((application) => {
            const classItem = application.classItem || {};
            const status = STATUS_META[application.status] || STATUS_META.pending;
            const StatusIcon = status.icon;
            const isUnlocked = application.isUnlocked || application.status === "approved";

            return (
              <button
                key={application.id}
                type="button"
                onClick={() => setSelected(application)}
                className="group block w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-[box-shadow,border-color] duration-200 ease-out hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        Mã lớp {classItem.classCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>
                      {!isUnlocked && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Lock className="h-3.5 w-3.5" />
                          Thông tin chi tiết đang ẩn
                        </span>
                      )}
                    </div>
                    <h4 className="mt-2 line-clamp-1 text-lg font-semibold text-slate-900">
                      {classItem.subject} - {classItem.summary || `Cần Gia Sư tại ${classItem.districtName || ''}, ${classItem.provinceName || ''}`}
                    </h4>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      <span>Gửi yêu cầu lúc {formatDateTime(application.createdAt)}</span>
                    </div>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs uppercase tracking-wide text-emerald-700">Học phí / buổi</p>
                    <p className="mt-0.5 text-xl font-bold leading-none text-emerald-700">
                      {formatPrice(classItem.feePerSession)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <BookOpenText className="h-4 w-4 text-emerald-600" />
                    <span>{classItem.subject || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <span>
                      {classItem.studentCount} học viên
                      {classItem.studentGender ? ` (${formatStudentGender(classItem.studentGender)})` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    <span>{classItem.sessionsPerWeek} buổi/tuần</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="line-clamp-1">{classItem.provinceName && classItem.districtName ? `${classItem.provinceName}, ${classItem.districtName}` : (classItem.locationLabel || "-")}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition group-hover:gap-2">
                    Xem chi tiết
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <MyClassDetailDialog open={Boolean(selected)} application={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
