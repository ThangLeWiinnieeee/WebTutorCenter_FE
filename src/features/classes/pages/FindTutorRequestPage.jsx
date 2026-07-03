import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  BookOpenCheck,
  Check,
  CheckCircle2,
  CircleAlert,
  Loader2,
} from 'lucide-react';
import {
  useForm,
  useWatch,
} from 'react-hook-form';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import BookingProgressHeader from '@/features/classes/components/findTutorRequest/BookingProgressHeader';
import BookingSummaryAsideCard from '@/features/classes/components/findTutorRequest/BookingSummaryAsideCard';
import DescriptionLengthCounter from '@/features/classes/components/findTutorRequest/DescriptionLengthCounter';
import ClassRequestSuccessCard from '@/features/classes/components/findTutorRequest/ClassRequestSuccessCard';
import InviteTutorBanner from '@/features/classes/components/findTutorRequest/InviteTutorBanner';
import ClassInfoSection from '@/features/classes/components/findTutorRequest/ClassInfoSection';
import ScheduleSection from '@/features/classes/components/findTutorRequest/ScheduleSection';
import TutorRequirementSection from '@/features/classes/components/findTutorRequest/TutorRequirementSection';
import QuoteConfirmationPanel from '@/features/classes/components/findTutorRequest/QuoteConfirmationPanel';
import tutorService from '@/features/tutors/services/tutorService';
import {
  buildClassRequestSchema,
  getDefaultClassRequestValues,
} from '@/features/classes/schemas/classRequestSchema';
import { scrollToFirstError } from '@/lib/formErrors';
import classService from '@/features/classes/services/classService';
import { clearClassFlow } from '@/features/classes/store/classSlice';
import {
  createClassThunk,
  createInvitedClassThunk,
  quoteClassThunk,
  updateClassThunk,
} from '@/features/classes/store/classThunks';
import { mapClassToFormValues } from '@/features/classes/utils/classRequestDateUtils';
import {
  clearClassRequestFormDraft,
  loadClassRequestFormDraft,
  saveClassRequestFormDraft,
} from '@/features/classes/utils/classRequestFormDraftStorage';
import locationService from '@/features/tutors/services/locationService';
import { fetchMyVouchersThunk } from '@/features/vouchers/store/voucherThunks';
import { zodResolver } from '@hookform/resolvers/zod';



// Map tình trạng nghề nghiệp gia sư → mức trình độ bài đăng yêu cầu (đồng bộ với BE).
const OCCUPATION_TO_LEVEL_PREF = { student: 'student', graduated: 'teacher', teacher: 'teacher' };

const FindTutorRequestFormContent = ({ pricingConfig, editClass = null, invitedTutor = null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isEdit = Boolean(editClass);
  const isInvite = Boolean(invitedTutor) && !isEdit;
  const { quote, loadingQuote, creating, latestCreated, error } = useSelector((state) => state.classes);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const minuteOptions = useMemo(() => pricingConfig.minutesPerSessionOptions || [], [pricingConfig]);
  const classRequestSchema = useMemo(() => buildClassRequestSchema(pricingConfig), [pricingConfig]);

  // ── Ràng buộc khi mời gia sư trực tiếp (khóa/lọc theo hồ sơ gia sư) ──
  const inviteSubjects = useMemo(() => (isInvite ? invitedTutor.subjects || [] : []), [isInvite, invitedTutor]);
  const inviteProvinceCode = isInvite ? invitedTutor.teachingAreas?.province ?? 0 : 0;
  const inviteDistrictCodes = useMemo(
    () => (isInvite ? (invitedTutor.teachingAreas?.districts || []).map((d) => Number(d.code)) : []),
    [isInvite, invitedTutor],
  );
  const inviteAllowedSlots = useMemo(
    () => (isInvite ? invitedTutor.availability || [] : null),
    [isInvite, invitedTutor],
  );
  const inviteGenderPref =
    isInvite && (invitedTutor.gender === 'male' || invitedTutor.gender === 'female')
      ? invitedTutor.gender
      : 'any';
  const inviteLevelPref = isInvite
    ? OCCUPATION_TO_LEVEL_PREF[invitedTutor.occupationStatus] || 'any'
    : 'any';

  const defaultFormValues = useMemo(() => {
    if (isEdit) return mapClassToFormValues(editClass);
    if (isInvite) {
      return {
        ...getDefaultClassRequestValues(pricingConfig),
        provinceCode: inviteProvinceCode,
        tutorGenderPref: inviteGenderPref,
        tutorLevelPref: inviteLevelPref,
      };
    }
    return loadClassRequestFormDraft(getDefaultClassRequestValues(pricingConfig), minuteOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingConfig, minuteOptions, isEdit, editClass, isInvite]);
  const form = useForm({ resolver: zodResolver(classRequestSchema), defaultValues: defaultFormValues });
  const provinceCode = useWatch({ control: form.control, name: 'provinceCode' });
  const studentCount = useWatch({ control: form.control, name: 'studentCount' });
  const isSingleStudent = Number(studentCount) <= 1;
  const persistReadyRef = useRef(false);
  const {
    formState: { errors },
  } = form;

  // 1 học viên không thể là "Nam & Nữ" -> reset về "Nam"
  useEffect(() => {
    if (isSingleStudent && form.getValues('studentGender') === 'other') {
      form.setValue('studentGender', 'male', { shouldValidate: true });
    }
  }, [isSingleStudent, form]);

  // ─── Mã ưu đãi (áp dụng ở màn báo giá) ───
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [showPromoList, setShowPromoList] = useState(false);
  const promoBoxRef = useRef(null);
  const promoCodeValue = useWatch({ control: form.control, name: 'promoCode' });
  const myVouchers = useSelector((state) => state.vouchers.items);
  const activeVouchers = useMemo(
    () => (myVouchers || []).filter((v) => v.status === 'active'),
    [myVouchers],
  );

  // Lấy kho voucher cá nhân để gợi ý ngay khi ấn vào ô mã ưu đãi
  useEffect(() => {
    dispatch(fetchMyVouchersThunk({ page: 1, limit: 50 }));
  }, [dispatch]);

  // Đóng danh sách gợi ý khi bấm ra ngoài
  useEffect(() => {
    if (!showPromoList) return;
    const onClickOutside = (e) => {
      if (promoBoxRef.current && !promoBoxRef.current.contains(e.target)) {
        setShowPromoList(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showPromoList]);

  // Quay lại sửa (quote=null) hoặc đổi mã -> bỏ trạng thái đã áp dụng
  useEffect(() => {
    if (!quote) {
      setAppliedPromo(null);
      setPromoError("");
    }
  }, [quote]);

  useEffect(() => {
    if (appliedPromo && (promoCodeValue || "").trim().toUpperCase() !== appliedPromo.code) {
      setAppliedPromo(null);
    }
  }, [promoCodeValue, appliedPromo]);

  const handleApplyPromo = async (overrideCode) => {
    const code = (overrideCode ?? form.getValues('promoCode') ?? "").trim();
    if (!code) {
      setPromoError("Vui lòng nhập mã ưu đãi");
      return;
    }
    setPromoChecking(true);
    setPromoError("");
    try {
      const res = await classService.validatePromo(code, quote.feePerMonth);
      setAppliedPromo(res.data.data);
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err.response?.data?.message || "Mã ưu đãi không hợp lệ");
    } finally {
      setPromoChecking(false);
    }
  };

  const handleSelectVoucher = (voucher) => {
    setShowPromoList(false);
    form.setValue('promoCode', voucher.code, { shouldValidate: true });
    handleApplyPromo(voucher.code);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
    form.setValue('promoCode', "");
  };

  useEffect(() => {
    classService
      .subjects()
      .then((res) =>
        startTransition(() => setSubjectOptions(res.data.data.subjects || [])),
      )
      .catch(() => startTransition(() => setSubjectOptions([])));
  }, []);

  useEffect(() => {
    locationService
      .getProvinces()
      .then((res) =>
        startTransition(() => setProvinces(res.data.data.provinces || [])),
      )
      .catch(() => startTransition(() => setProvinces([])));
  }, []);

  useEffect(() => {
    if (!provinceCode) return;
    locationService
      .getDistricts(provinceCode)
      .then((res) =>
        startTransition(() => setDistricts(res.data.data.districts || [])),
      )
      .catch(() => startTransition(() => setDistricts([])));
  }, [provinceCode]);

  useEffect(() => {
    persistReadyRef.current = false;
    const id = requestAnimationFrame(() => {
      persistReadyRef.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Chế độ chỉnh sửa / mời gia sư: bỏ qua nháp (draft) và xoá trạng thái báo giá/đăng-mới còn sót lại
  useEffect(() => {
    if (isEdit || isInvite) dispatch(clearClassFlow());
  }, [isEdit, isInvite, dispatch]);

  useEffect(() => {
    if (isEdit || isInvite) return undefined; // không lưu nháp khi đang sửa bài / mời gia sư
    let debounceId;
    const unsubscribe = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        if (!persistReadyRef.current || !values) return;
        clearTimeout(debounceId);
        debounceId = window.setTimeout(() => {
          saveClassRequestFormDraft(values);
        }, 400);
      },
    });
    return () => {
      unsubscribe();
      clearTimeout(debounceId);
    };
  }, [form, isEdit, isInvite]);

  const subjectSelectOptions = useMemo(() => {
    // Mời gia sư: chỉ cho chọn trong các môn gia sư dạy
    const list = isInvite ? subjectOptions.filter((s) => inviteSubjects.includes(s)) : subjectOptions;
    return list.map((subject) => ({ value: subject, label: subject }));
  }, [subjectOptions, isInvite, inviteSubjects]);

  const provinceSelectOptions = useMemo(() => {
    // Mời gia sư: chỉ hiển thị tỉnh/thành mà gia sư có thể dạy (khóa, không cho đổi)
    const list = isInvite ? provinces.filter((item) => Number(item.code) === Number(inviteProvinceCode)) : provinces;
    return list.map((item) => ({ value: String(item.code), label: item.name }));
  }, [provinces, isInvite, inviteProvinceCode]);

  const districtSelectOptions = useMemo(() => {
    // Mời gia sư: chỉ hiển thị quận/huyện gia sư có thể dạy
    const list = isInvite ? districts.filter((item) => inviteDistrictCodes.includes(Number(item.code))) : districts;
    return list.map((item) => ({ value: String(item.code), label: item.name }));
  }, [districts, isInvite, inviteDistrictCodes]);

  const onQuote = async (values) => {
    const result = await dispatch(quoteClassThunk(values));
    if (result.error) toast.error(result.payload || "Không thể tính học phí");
  };

  const onCreate = async () => {
    // Luồng mời gia sư trực tiếp: tạo lớp + gửi lời mời tới gia sư được chọn
    if (isInvite) {
      const result = await dispatch(
        createInvitedClassThunk({ ...form.getValues(), requestedTutorId: invitedTutor.id }),
      );
      if (!result.error) {
        toast.success("Đã gửi lời mời tới gia sư. Vui lòng chờ gia sư phản hồi.");
        dispatch(clearClassFlow());
        form.reset(getDefaultClassRequestValues(pricingConfig));
        navigate("/my-posts");
      }
      return;
    }

    const result = await dispatch(createClassThunk(form.getValues()));
    if (!result.error) {
      clearClassRequestFormDraft();
      toast.success("Đăng lớp cần gia sư thành công");
      const createdClass = result.payload;
      const classId = createdClass?.id || createdClass?._id;

      // Clear flow states & reset form
      dispatch(clearClassFlow());
      form.reset(getDefaultClassRequestValues(pricingConfig));

      if (classId) {
        navigate(`/classes/${classId}`);
      } else {
        navigate("/classes");
      }
    }
  };

  const onUpdate = async (values) => {
    setSaving(true);
    const result = await dispatch(updateClassThunk({ id: editClass.id, payload: values }));
    setSaving(false);
    if (!result.error) {
      toast.success("Cập nhật bài đăng thành công");
      navigate(`/classes/${editClass.id}`);
    } else {
      toast.error(result.payload || "Cập nhật bài đăng thất bại");
    }
  };

  const startNewClassRequest = () => {
    dispatch(clearClassFlow());
    form.reset(getDefaultClassRequestValues(pricingConfig));
  };

  if (!isEdit && !isInvite && latestCreated) {
    return (
      <ClassRequestSuccessCard classCode={latestCreated.classCode} onCreateNew={startNewClassRequest} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 animate-in fade-in duration-500 motion-reduce:animate-none">
      <div className="mx-auto max-w-[1360px] px-4 py-6 md:px-6 md:py-8">
        <BookingProgressHeader control={form.control} isEdit={isEdit} />

        {isInvite && <InviteTutorBanner invitedTutor={invitedTutor} />}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-5 lg:col-span-9">
            {!quote && (
              <form className="space-y-5" onSubmit={form.handleSubmit(isEdit ? onUpdate : onQuote, scrollToFirstError)}>
                <ClassInfoSection
                  form={form}
                  errors={errors}
                  subjectSelectOptions={subjectSelectOptions}
                  provinceSelectOptions={provinceSelectOptions}
                  districtSelectOptions={districtSelectOptions}
                  provinceCode={provinceCode}
                  isInvite={isInvite}
                  setDistricts={setDistricts}
                />

                <ScheduleSection
                  control={form.control}
                  errors={errors}
                  minuteOptions={minuteOptions}
                  isSingleStudent={isSingleStudent}
                  isInvite={isInvite}
                  inviteAllowedSlots={inviteAllowedSlots}
                />

                <TutorRequirementSection control={form.control} isInvite={isInvite} />

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md md:p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    <BookOpenCheck className="h-4 w-4 text-emerald-600" />
                    4. Mô tả chi tiết <span className="text-rose-500">*</span>
                  </h2>
                  <textarea
                    className="min-h-[140px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    rows={5}
                    placeholder="Mô tả chi tiết mục tiêu học tập, tình hình hiện tại của học viên, mong muốn về lộ trình..."
                    {...form.register("description")}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Nên mô tả càng cụ thể để tăng tốc độ ghép gia sư.</span>
                    <DescriptionLengthCounter control={form.control} />
                  </div>
                  {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    5. Xác nhận yêu cầu
                  </h2>
                  {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700"
                    disabled={isEdit ? saving : loadingQuote}
                  >
                    {isEdit
                      ? saving
                        ? "Đang lưu..."
                        : "Lưu thay đổi"
                      : loadingQuote
                        ? "Đang xử lý..."
                        : "Xem báo giá & xác nhận"}
                  </Button>
                </section>
              </form>
            )}

            {quote && (
              <QuoteConfirmationPanel
                form={form}
                errors={errors}
                quote={quote}
                isInvite={isInvite}
                creating={creating}
                onBack={() => dispatch(clearClassFlow())}
                onCreate={onCreate}
                promo={{
                  appliedPromo,
                  promoError,
                  promoChecking,
                  showPromoList,
                  setShowPromoList,
                  activeVouchers,
                  promoBoxRef,
                  onApply: handleApplyPromo,
                  onSelectVoucher: handleSelectVoucher,
                  onRemove: handleRemovePromo,
                }}
              />
            )}
          </div>

          <aside className="hidden space-y-4 lg:col-span-3 lg:block">
            <div className="top-6 space-y-4 lg:sticky">
              <BookingSummaryAsideCard control={form.control} provinces={provinces} districts={districts} quote={quote} />

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Lợi ích khi đăng lớp</h3>
                <ul className="space-y-3">
                  {[
                    "Gia sư chất lượng, được kiểm duyệt kỹ càng",
                    "Kết nối nhanh chóng, hỗ trợ 24/7",
                    "Miễn phí tìm gia sư, không thu phí phụ huynh",
                    "Đổi gia sư nếu chưa phù hợp",
                    "Bảo mật thông tin tuyệt đối",
                  ].map((text) => (
                    <li key={text} className="flex items-start gap-2.5 text-sm text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{text}</span></li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Hỗ trợ trực tiếp</h3>
                <p className="text-xs uppercase tracking-wide text-slate-400">Hotline</p>
                <p className="text-2xl font-bold text-emerald-700">090 333 1985</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">098 707 5826</p>
                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const FindTutorRequestPage = () => {
  const { id: editId } = useParams();
  const [searchParams] = useSearchParams();
  const invitedTutorId = editId ? null : searchParams.get('tutor');
  const [pricingConfig, setPricingConfig] = useState(null);
  const [pricingConfigError, setPricingConfigError] = useState(null);
  const [loadingPricingConfig, setLoadingPricingConfig] = useState(true);
  const [editClass, setEditClass] = useState(null);
  const [loadingClass, setLoadingClass] = useState(Boolean(editId));
  const [classError, setClassError] = useState(null);
  const [invitedTutor, setInvitedTutor] = useState(null);
  const [loadingInvitedTutor, setLoadingInvitedTutor] = useState(Boolean(invitedTutorId));
  const [invitedTutorError, setInvitedTutorError] = useState(null);

  useEffect(() => {
    classService
      .pricingConfig()
      .then((res) => {
        const config = res.data?.data?.pricingConfig;
        if (!config) {
          setPricingConfigError("Không tải được cấu hình học phí");
          return;
        }
        setPricingConfig(config);
      })
      .catch(() => setPricingConfigError("Không tải được cấu hình học phí"))
      .finally(() => setLoadingPricingConfig(false));
  }, []);

  // Chế độ chỉnh sửa: tải dữ liệu bài đăng theo id (loadingClass khởi tạo true khi có editId)
  useEffect(() => {
    if (!editId) return;
    classService
      .detail(editId)
      .then((res) => {
        const item = res.data?.data?.classItem;
        if (!item) setClassError("Không tìm thấy bài đăng");
        else setEditClass(item);
      })
      .catch((err) => setClassError(err.response?.data?.message || "Không tải được bài đăng"))
      .finally(() => setLoadingClass(false));
  }, [editId]);

  // Chế độ mời gia sư trực tiếp: tải hồ sơ gia sư được mời để khóa/lọc các trường theo hồ sơ
  useEffect(() => {
    if (!invitedTutorId) return;
    tutorService
      .getTutorById(invitedTutorId)
      .then((res) => {
        const t = res.data?.data?.tutor;
        if (!t) setInvitedTutorError("Không tìm thấy gia sư được mời");
        else setInvitedTutor(t);
      })
      .catch((err) => setInvitedTutorError(err.response?.data?.message || "Không tải được hồ sơ gia sư"))
      .finally(() => setLoadingInvitedTutor(false));
  }, [invitedTutorId]);

  if (loadingPricingConfig || loadingClass || loadingInvitedTutor) {
    return (
      <div className="flex min-h-screen items-start justify-center bg-slate-50/60 px-4 pt-32 text-center text-slate-600">
        <div className="flex items-center gap-2 animate-in fade-in duration-300">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          {loadingClass
            ? "Đang tải bài đăng..."
            : loadingInvitedTutor
              ? "Đang tải hồ sơ gia sư..."
              : "Đang tải cấu hình học phí..."}
        </div>
      </div>
    );
  }

  if (!pricingConfig) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-rose-600">{pricingConfigError || "Không tải được cấu hình học phí"}</p>
        <p className="mt-2 text-sm text-slate-500">Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
      </div>
    );
  }

  if (editId && (classError || !editClass)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-rose-600">{classError || "Không tìm thấy bài đăng"}</p>
        <Link to="/my-posts" className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline">
          Quay lại danh sách bài đăng
        </Link>
      </div>
    );
  }

  if (invitedTutorId && (invitedTutorError || !invitedTutor)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-rose-600">{invitedTutorError || "Không tìm thấy gia sư được mời"}</p>
        <Link to="/tutors" className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline">
          Quay lại danh sách gia sư
        </Link>
      </div>
    );
  }

  return (
    <FindTutorRequestFormContent
      pricingConfig={pricingConfig}
      editClass={editClass}
      invitedTutor={invitedTutor}
    />
  );
};

export default FindTutorRequestPage;
