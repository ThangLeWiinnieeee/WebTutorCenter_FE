import {
  useEffect,
  useState,
} from 'react';

import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  CalendarDays,
  CircleHelp,
  Clock3,
  FileText,
  MapPin,
  PhoneCall,
  UserRound,
  Users,
} from 'lucide-react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  Link,
  useLocation,
  useParams,
  Navigate,
} from 'react-router-dom';

import { Button } from '@/components/ui/button';
import ClassReceiveDialog from '@/features/classes/components/ClassReceiveDialog';
import classService from '@/features/classes/services/classService';
import { applyForClassThunk, fetchClassDetailThunk } from '@/features/classes/store/classThunks';
import {
  formatAvailabilitySlotsDetailed,
  formatClassTutorPrefsSummary,
  formatDate,
  formatDateTime,
  formatPrice,
  formatStudentGender,
} from '@/features/classes/utils/classFormatters';
import useAuth from '@/features/auth/hooks/useAuth';
import tutorService from '@/features/tutors/services/tutorService';
import { toast } from 'sonner';

const NewClassDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useAuth();
  const { detail, loadingDetail, applying } = useSelector((state) => state.classes);
  const [relatedClasses, setRelatedClasses] = useState([]);
  const [latestClasses, setLatestClasses] = useState([]);
  const [sidebarSuggestedClasses, setSidebarSuggestedClasses] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [receiveDialog, setReceiveDialog] = useState({ open: false, type: "login", classItem: null });
  const returnTo = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (id) dispatch(fetchClassDetailThunk(id));
  }, [dispatch, id]);

  const mapClassToListItem = (item) => ({
    id: item._id,
    title: `${item.subject} - ${item.summary || `Cần Gia Sư tại ${item.districtName || ''}, ${item.provinceName || ''}`}`,
  });

  useEffect(() => {
    if (!detail?._id) return;

    let isCancelled = false;
    const fetchSuggestionData = async () => {
      setLoadingSuggestions(true);
      try {
        const [relatedRes, latestRes] = await Promise.all([
          classService.list({
            ...(detail.subject ? { subject: detail.subject } : {}),
            ...(detail.provinceCode ? { provinceCode: detail.provinceCode } : {}),
            page: 1,
            limit: 8,
          }),
          classService.list({ page: 1, limit: 8 }),
        ]);

        if (isCancelled) return;

        const relatedItems = (relatedRes.data?.data?.classes || [])
          .filter((item) => item._id !== detail._id)
          .map(mapClassToListItem);
        const latestItems = (latestRes.data?.data?.classes || [])
          .filter((item) => item._id !== detail._id)
          .map(mapClassToListItem);

        setRelatedClasses(relatedItems.slice(0, 4));
        setSidebarSuggestedClasses(relatedItems.slice(0, 5));
        setLatestClasses(latestItems.slice(0, 4));
      } catch {
        if (isCancelled) return;
        setRelatedClasses([]);
        setSidebarSuggestedClasses([]);
        setLatestClasses([]);
      } finally {
        if (!isCancelled) setLoadingSuggestions(false);
      }
    };

    fetchSuggestionData();

    return () => {
      isCancelled = true;
    };
  }, [detail?._id, detail?.provinceCode, detail?.subject]);

  if (loadingDetail || loading) {
    return (
      <div className="mx-auto max-w-[1360px] px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-9 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-2/3 rounded bg-slate-200" />
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-24 rounded-xl bg-slate-200" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 rounded-lg bg-slate-200" />
                <div className="h-20 rounded-lg bg-slate-200" />
                <div className="h-20 rounded-lg bg-slate-200" />
              </div>
            </div>
          </div>
          <div className="col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="animate-pulse space-y-3">
              <div className="h-20 rounded-lg bg-slate-200" />
              <div className="h-8 rounded bg-slate-200" />
              <div className="h-8 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: returnTo }} replace />;
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-[1360px] px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Không tìm thấy lớp học.
        </div>
      </div>
    );
  }

  const isOwnPost = isAuthenticated && user?.id != null && detail.createdBy === user.id;

  const handleReceiveClass = async () => {
    if (isOwnPost) return;

    if (!isAuthenticated) {
      setReceiveDialog({ open: true, type: "login", classItem: detail });
      return;
    }

    if (user?.role !== "tutor") {
      setReceiveDialog({ open: true, type: "tutorRequired", classItem: detail });
      return;
    }

    try {
      const response = await tutorService.getProfile();
      const tutorProfile = response.data?.data?.tutor;
      const registeredSubjects = tutorProfile?.subjects || [];
      const mismatchReasons = [];

      if (!registeredSubjects.includes(detail.subject)) {
        mismatchReasons.push(`Môn học: Lớp yêu cầu môn "${detail.subject}" nhưng bạn chưa đăng ký dạy môn này.`);
      }

      if (detail.tutorGenderPref && detail.tutorGenderPref !== 'any' && user?.gender !== detail.tutorGenderPref) {
        const requiredGender = detail.tutorGenderPref === 'male' ? 'Nam' : 'Nữ';
        const currentGender = user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Chưa cập nhật';
        mismatchReasons.push(`Giới tính: Lớp yêu cầu gia sư giới tính "${requiredGender}" nhưng giới tính tài khoản của bạn là "${currentGender}".`);
      }

      if (detail.tutorLevelPref && detail.tutorLevelPref !== 'any') {
        const requiredLevel = detail.tutorLevelPref === 'student' ? 'Sinh viên' : 'Giáo viên';
        const currentOccupation = tutorProfile?.occupationStatus;
        const currentLevel = currentOccupation === 'student' ? 'Sinh viên' : currentOccupation === 'teacher' ? 'Giáo viên' : 'Khác';
        if (detail.tutorLevelPref !== currentOccupation) {
          mismatchReasons.push(`Trình độ: Lớp yêu cầu gia sư là "${requiredLevel}" nhưng trình độ của bạn là "${currentLevel}".`);
        }
      }

      if (mismatchReasons.length > 0) {
        setReceiveDialog({
          open: true,
          type: "mismatch",
          classItem: detail,
          tutorSubjects: registeredSubjects,
          mismatchReasons,
        });
        return;
      }
      setReceiveDialog({ open: true, type: "confirm", classItem: detail, tutorSubjects: registeredSubjects });
    } catch (err) {
      console.error("Failed to check tutor profile conditions", err);
      setReceiveDialog({ open: true, type: "confirm", classItem: detail });
    }
  };

  const handleConfirmApply = async () => {
    const result = await dispatch(applyForClassThunk(detail.id || detail._id));
    if (applyForClassThunk.fulfilled.match(result)) {
      setReceiveDialog((prev) => ({ ...prev, type: "submitted" }));
    } else {
      setReceiveDialog((prev) => ({ ...prev, open: false }));
      toast.error(result.payload || "Không thể gửi yêu cầu nhận lớp");
    }
  };

  return (
    <div className="mx-auto max-w-[1360px] px-6 py-8">
      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-9 space-y-5">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold leading-tight text-slate-900">
                  {detail.subject} - {detail.summary || `Cần Gia Sư tại ${detail.districtName || ''}, ${detail.provinceName || ''}`}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    Mã lớp {detail.classCode}
                  </span>
                  <span>•</span>
                  <Clock3 className="h-4 w-4" />
                  <span>{formatDateTime(detail.createdAt)}</span>
                </div>
              </div>

              <div className="w-[250px] shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-right">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Học phí / buổi</p>
                <p className="mt-1 text-4xl font-bold leading-none text-emerald-700">
                  {formatPrice(detail.feePerSession)}
                </p>
                <p className="mt-1 text-xs text-emerald-700/80">
                  Ước tính/tháng: {formatPrice(detail.feePerMonth)}
                </p>
                {isOwnPost ? (
                  <div className="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm font-medium text-slate-500">
                    Bài đăng của bạn
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="mt-3 h-11 w-full rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
                    onClick={handleReceiveClass}
                  >
                    Nhận lớp ngay
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm leading-relaxed text-slate-700">
                {detail.description || "Chưa có mô tả chi tiết cho lớp học này."}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-100 bg-white px-3 py-3">
                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Users className="h-4 w-4 text-emerald-600" />
                  Học viên
                </p>
                <p className="text-sm text-slate-700">
                  {detail.studentCount} học viên
                  {detail.studentGender ? ` (${formatStudentGender(detail.studentGender)})` : ""}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-white px-3 py-3">
                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                  Tần suất học
                </p>
                <p className="text-sm text-slate-700">
                  {detail.sessionsPerWeek} buổi/tuần ({detail.minutesPerSession} phút/buổi)
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-white px-3 py-3">
                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <BookOpenText className="h-4 w-4 text-emerald-600" />
                  Môn học
                </p>
                <p className="text-sm text-slate-700">{detail.subject || "-"}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                <p>Địa điểm: {detail.locationLabel || "-"}</p>
              </div>
              <div className="flex items-start gap-2">
                <CalendarClock className="mt-0.5 h-4 w-4 text-slate-400" />
                <p>Ngày bắt đầu: {formatDate(detail.startDate)}</p>
              </div>
              <div className="flex items-start gap-2">
                <UserRound className="mt-0.5 h-4 w-4 text-slate-400" />
                <p>Yêu cầu gia sư: {formatClassTutorPrefsSummary(detail)}</p>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 text-slate-400" />
                <p>SĐT liên hệ: {detail.contactPhone || "Được ẩn để bảo mật (chỉ hiển thị khi nhận lớp)"}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-white px-4 py-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Clock3 className="h-4 w-4 text-emerald-600" />
                Thời gian có thể học (theo khung đã chọn)
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {formatAvailabilitySlotsDetailed(detail.availabilitySlots)}
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Thông tin nhận lớp
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-slate-700">
                <p className="text-xs text-slate-500">Hoa hồng nhận lớp</p>
                <p className="font-semibold text-slate-900">5% học phí tháng đầu</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-slate-700">
                <p className="text-xs text-slate-500">Hình thức xác nhận</p>
                <p className="font-semibold text-slate-900">Qua tư vấn viên</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-slate-700">
                <p className="text-xs text-slate-500">Trạng thái lớp</p>
                <p className="font-semibold text-emerald-700">Đang mở nhận gia sư</p>
              </div>
            </div>
          </article>

          <div className="grid grid-cols-2 gap-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Các lớp tương tự</h3>
                <Link to="/classes" className="text-xs font-medium text-slate-500 hover:text-slate-700">
                  Xem tất cả
                </Link>
              </div>
              <ul className="space-y-2 text-sm">
                {loadingSuggestions && (
                  <li className="text-slate-500">Đang tải dữ liệu...</li>
                )}
                {!loadingSuggestions && relatedClasses.map((item) => (
                  <li key={item.id}>
                    <Link to={`/classes/${item.id}`} className="line-clamp-1 text-slate-700 hover:text-emerald-700 hover:underline">
                      {item.title}
                    </Link>
                  </li>
                ))}
                {!loadingSuggestions && relatedClasses.length === 0 && (
                  <li className="text-slate-500">Chưa có lớp tương tự.</li>
                )}
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Lớp cần gia sư</h3>
                <Link to="/classes" className="text-xs font-medium text-slate-500 hover:text-slate-700">
                  Xem các lớp khác
                </Link>
              </div>
              <ul className="space-y-2 text-sm">
                {loadingSuggestions && (
                  <li className="text-slate-500">Đang tải dữ liệu...</li>
                )}
                {!loadingSuggestions && latestClasses.map((item) => (
                  <li key={item.id}>
                    <Link to={`/classes/${item.id}`} className="line-clamp-1 text-slate-700 hover:text-emerald-700 hover:underline">
                      {item.title}
                    </Link>
                  </li>
                ))}
                {!loadingSuggestions && latestClasses.length === 0 && (
                  <li className="text-slate-500">Chưa có lớp cần gia sư phù hợp.</li>
                )}
              </ul>
            </article>
          </div>
        </section>

        <aside className="col-span-3 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Thông tin nhanh
            </h3>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Học phí / buổi</p>
              <p className="mt-1 text-3xl font-bold text-emerald-700">{formatPrice(detail.feePerSession)}</p>
              <p className="mt-1 text-xs text-emerald-700/80">
                Ước tính/tháng: {formatPrice(detail.feePerMonth)}
              </p>
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Gia sư được hỗ trợ xác minh thông tin lớp trước khi kết nối phụ huynh.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Lớp gợi ý theo môn
            </h3>
            <ul className="space-y-2.5">
              {loadingSuggestions && (
                <li className="text-sm text-slate-500">Đang tải dữ liệu...</li>
              )}
              {!loadingSuggestions && sidebarSuggestedClasses.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-100 px-2.5 py-2">
                  <Link to={`/classes/${item.id}`} className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-emerald-700 hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
              {!loadingSuggestions && sidebarSuggestedClasses.length === 0 && (
                <li className="text-sm text-slate-500">Chưa có lớp gợi ý.</li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <PhoneCall className="h-4 w-4" />
              Hỗ trợ trực tiếp
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Hotline 1</p>
            <p className="mb-2 text-2xl font-bold tracking-wide">093 143 9203</p>
            <p className="text-xs uppercase tracking-wide text-slate-400">Hotline 2</p>
            <p className="text-2xl font-bold tracking-wide">098 707 5826</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <CircleHelp className="h-4 w-4" />
              Gia sư cần biết
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                  Quy trình nhận lớp
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
              <li>
                <Link to="#" className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                  Hợp đồng mẫu
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
      <ClassReceiveDialog
        open={receiveDialog.open}
        type={receiveDialog.type}
        classItem={receiveDialog.classItem}
        returnTo={returnTo}
        onClose={() => setReceiveDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={handleConfirmApply}
        applying={applying}
        tutorSubjects={receiveDialog.tutorSubjects}
        mismatchReasons={receiveDialog.mismatchReasons}
      />
    </div>
  );
};

export default NewClassDetailPage;
