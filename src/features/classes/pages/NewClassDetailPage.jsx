import {
  useEffect,
  useState,
} from 'react';

import {
  ArrowRight,
  Award,
  BookOpenText,
  CalendarClock,
  CalendarDays,
  CircleHelp,
  Clock3,
  FileText,
  GraduationCap,
  MapPin,
  PhoneCall,
  UserCheck,
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
import { hasCompleteTutorDocuments } from '@/features/tutors/utils/tutorDocuments';
import { OCCUPATION_STATUS_LABEL, GENDER_LABEL } from '@/features/tutors/constants';
import { toast } from 'sonner';
import AOS from 'aos';

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

  // Tính lại vị trí animation sau khi chi tiết lớp được tải
  useEffect(() => {
    if (detail?.id || detail?._id) AOS.refresh();
  }, [detail?.id]);

  const mapClassToListItem = (item) => ({
    id: item.id || item._id,
    title: `${item.subject} - ${item.summary || `Cần Gia Sư tại ${item.districtName || ''}, ${item.provinceName || ''}`}`,
  });

  useEffect(() => {
    const detailId = detail?.id || detail?._id;
    if (!detailId) return;

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
          .filter((item) => (item.id || item._id) !== detailId)
          .map(mapClassToListItem);
        const latestItems = (latestRes.data?.data?.classes || [])
          .filter((item) => (item.id || item._id) !== detailId)
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
  }, [detail?.id, detail?.provinceCode, detail?.subject]);

  if (loadingDetail || loading) {
    return (
      <div className="mx-auto max-w-[1360px] px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-9">
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
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

      // Chưa bổ sung hồ sơ chứng thực → yêu cầu cập nhật trước khi nhận lớp
      if (!hasCompleteTutorDocuments(tutorProfile)) {
        setReceiveDialog({ open: true, type: "documentsRequired", classItem: detail });
        return;
      }

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

  // Ô phí nhận lớp + CTA dùng chung: desktop nổi góc phải bài, điện thoại đặt xuống cuối
  const priceCard = (extraClass) => (
    <div
      data-aos="zoom-in"
      className={`rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-right ${extraClass}`}
    >
      <p className="text-xs uppercase tracking-wide text-emerald-700">Phí nhận lớp</p>
      <p className="mt-1 text-4xl font-bold leading-none text-emerald-700">
        {formatPrice(Math.round((detail.feePerMonth || 0) * 0.05))}
      </p>
      <p className="mt-1 text-xs text-emerald-700/80">5% học phí tháng đầu</p>
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
  );

  return (
    <div className="mx-auto max-w-[1360px] px-6 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="min-w-0 space-y-5 lg:col-span-9">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-aos="fade-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
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
                {/* Học phí / buổi — kiểu gọn giống bài đăng ngoài danh sách */}
                <div className="mt-2 flex items-center gap-2">
                  <BookOpenText className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-slate-500">Học phí / buổi:</span>
                  <strong className="text-lg font-bold leading-none text-emerald-600">
                    {formatPrice(detail.feePerSession)}
                  </strong>
                </div>
              </div>

              {/* Desktop/tablet: ô phí nhận lớp nổi góc phải. Điện thoại ẩn, hiển thị ở cuối bài */}
              {priceCard("hidden w-full shrink-0 sm:block sm:w-[250px]")}
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm leading-relaxed text-slate-700">
                {detail.description || "Chưa có mô tả chi tiết cho lớp học này."}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
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

            <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 text-sm text-slate-600 sm:grid-cols-2">
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

          {detail.matchedTutor && (
            <article className="rounded-2xl border border-sky-200 bg-sky-50/40 p-5 shadow-sm" data-aos="fade-up">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky-700">
                <UserCheck className="h-4 w-4" />
                Gia sư đã nhận lớp
              </h3>
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-sky-200">
                  {detail.matchedTutor.avatar ? (
                    <img
                      src={detail.matchedTutor.avatar}
                      alt={detail.matchedTutor.fullName || "Gia sư"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-sky-600">
                      {(detail.matchedTutor.fullName || "?").charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-slate-900">{detail.matchedTutor.fullName || "Gia sư"}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <Award className="h-4 w-4" />
                      Đã dạy {detail.matchedTutor.totalClassesAccepted || 0} lớp
                    </span>
                    {detail.matchedTutor.occupationStatus && (
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {OCCUPATION_STATUS_LABEL[detail.matchedTutor.occupationStatus] || detail.matchedTutor.occupationStatus}
                      </span>
                    )}
                    {detail.matchedTutor.gender && <span>{GENDER_LABEL[detail.matchedTutor.gender] || ""}</span>}
                  </div>
                  {detail.matchedTutor.schoolName && (
                    <p className="mt-1 text-sm text-slate-500">
                      {detail.matchedTutor.schoolName}
                      {detail.matchedTutor.graduationYear ? ` · TN ${detail.matchedTutor.graduationYear}` : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-sky-200 bg-white px-4 py-3">
                <PhoneCall className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Số điện thoại gia sư</p>
                  <p className="text-base font-bold text-slate-900">{detail.matchedTutor.phone || "Chưa cập nhật"}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Admin đã duyệt gia sư này cho bài đăng của bạn. Bạn có thể liên hệ trực tiếp với gia sư qua số điện thoại trên.
              </p>
            </article>
          )}

          <article
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Thông tin nhận lớp
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
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

          {/* Điện thoại: học phí + nút nhận lớp đặt ở cuối cùng */}
          {priceCard("w-full sm:hidden")}

          <div className="hidden gap-4 sm:grid sm:grid-cols-2" data-aos="fade-up" data-aos-delay="100">
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

        <aside className="hidden space-y-4 lg:col-span-3 lg:block" data-aos="fade-left" data-aos-delay="100">
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
