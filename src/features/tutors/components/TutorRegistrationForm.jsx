import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, GraduationCap, BookOpen, MapPin, User2, CalendarClock } from "lucide-react";
import { toast } from "sonner";

import { tutorSchema } from "@/features/tutors/schemas/tutorSchema";
import { scrollToFirstError } from "@/lib/formErrors";
import { registerTutorThunk } from "@/features/tutors/store/tutorThunks";
import { OCCUPATION_STATUS_OPTIONS } from "@/features/tutors/constants";
import useSubjects from "@/hooks/useSubjects";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MultiCheckbox from "./MultiCheckbox";
import AvailabilityPicker from "./AvailabilityPicker";
import AreaPicker from "./AreaPicker";
import SchoolPicker from "./SchoolPicker";

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e3a5f]/10">
      <Icon className="h-4 w-4 text-[#1e3a5f]" />
    </div>
    <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
  </div>
);

const TutorRegistrationForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.tutors);
  const { subjects: subjectOptions } = useSubjects();

  const form = useForm({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      phone: "",
      subjects: [],
      occupationStatus: "",
      teachingAreas: { province: 0, districts: [] },
      currentArea: { province: 0, district: 0 },
      schoolName: "",
      graduationYear: null,
      bio: "",
      availability: [],
    },
  });

  const occupationStatus = form.watch("occupationStatus");

  const onSubmit = async (data) => {
    if (data.occupationStatus === "student") {
      data.graduationYear = null;
    }
    const result = await dispatch(registerTutorThunk(data));
    if (!result.error) {
      const { fetchNotificationsThunk } = await import("@/features/notifications/store/notificationThunks");
      dispatch(fetchNotificationsThunk());
      toast.success("Đăng ký thành công! Vui lòng chờ admin xét duyệt.");
      onSuccess?.();
    } else {
      toast.error(result.payload || "Đăng ký thất bại");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, scrollToFirstError)} className="space-y-8">
        {/* === PHẦN 1: THÔNG TIN CÁ NHÂN === */}

        {/* Contact */}
        <div>
          <SectionTitle icon={User2} title="Thông tin liên hệ" />
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại liên hệ <span className="text-rose-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: 0912345678"
                      className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentArea"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Khu vực hiện tại của bạn <span className="text-rose-500">*</span></FormLabel>
                  <AreaPicker
                    value={field.value}
                    onChange={field.onChange}
                    mode="single"
                  />
                  {fieldState.error && (
                    <p className="text-xs text-rose-500">
                      {fieldState.error.province?.message || fieldState.error.district?.message || fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Occupation & Education */}
        <div>
          <SectionTitle icon={GraduationCap} title="Nghề nghiệp & Học vấn" />
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="occupationStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tình trạng nghề nghiệp <span className="text-rose-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer focus:ring-0 focus:ring-offset-0 focus:border-slate-400">
                        <SelectValue placeholder="Chọn tình trạng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {OCCUPATION_STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value} className="cursor-pointer">{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Trường đã / đang học <span className="text-rose-500">*</span></FormLabel>
                    <FormControl>
                      <SchoolPicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Năm tốt nghiệp
                      {occupationStatus === "student" && (
                        <span className="ml-1 text-xs text-slate-400">(không áp dụng)</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder={occupationStatus === "student" ? "—" : `VD: ${new Date().getFullYear()}`}
                        disabled={occupationStatus === "student"}
                        className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          field.onChange(raw === "" ? null : Number(raw));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <SectionTitle icon={User2} title="Giới thiệu bản thân" />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả bản thân, kinh nghiệm giảng dạy <span className="text-rose-500">*</span></FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    rows={5}
                    placeholder="Hãy giới thiệu về bản thân, kinh nghiệm, phương pháp dạy học của bạn..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-slate-400 resize-none"
                  />
                </FormControl>
                <div className="flex justify-between">
                  <FormMessage />
                  <span className="text-xs text-slate-400 ml-auto">{field.value?.length ?? 0}/2000</span>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* === PHẦN 2: THÔNG TIN GIẢNG DẠY === */}

        {/* Subjects */}
        <div>
          <SectionTitle icon={BookOpen} title="Môn học giảng dạy" />
          <FormField
            control={form.control}
            name="subjects"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Chọn môn bạn có thể dạy <span className="text-rose-500">*</span></FormLabel>
                <MultiCheckbox
                  options={subjectOptions}
                  value={field.value}
                  onChange={field.onChange}
                  columns={3}
                />
                {field.value.length > 0 && (
                  <p className="text-xs text-slate-500">Đã chọn: {field.value.length} môn</p>
                )}
                {fieldState.error && (
                  <p className="text-xs text-rose-500">{fieldState.error.message}</p>
                )}
              </FormItem>
            )}
          />
        </div>

        {/* Teaching Areas */}
        <div>
          <SectionTitle icon={MapPin} title="Khu vực giảng dạy" />
          <FormField
            control={form.control}
            name="teachingAreas"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Tỉnh/thành & quận/huyện có thể dạy <span className="text-rose-500">*</span></FormLabel>
                <AreaPicker
                  value={field.value}
                  onChange={field.onChange}
                  mode="multi-district"
                />
                {fieldState.error && (
                  <p className="text-xs text-rose-500">
                    {fieldState.error.province?.message || fieldState.error.districts?.message || fieldState.error.message}
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>

        {/* Schedule */}
        <div>
          <SectionTitle icon={CalendarClock} title="Lịch giảng dạy" />
          <FormField
            control={form.control}
            name="availability"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Khung giờ bạn có thể dạy <span className="text-rose-500">*</span></FormLabel>
                <AvailabilityPicker value={field.value} onChange={field.onChange} />
                {fieldState.error && (
                  <p className="text-xs text-rose-500">{fieldState.error.message || fieldState.error.root?.message}</p>
                )}
              </FormItem>
            )}
          />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a5f] text-white hover:bg-[#2d5a9e] h-11 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi hồ sơ...
              </>
            ) : (
              "Gửi hồ sơ đăng ký gia sư"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TutorRegistrationForm;
