import { createElement, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User2, GraduationCap, MapPin, CalendarClock, Lock } from "lucide-react";
import { toast } from "sonner";

import {
  tutorProfileEditSchema,
  tutorProfileToFormValues,
  diffTutorProfileChanges,
} from "@/features/profile/schemas/tutorProfileEditSchema";
import { OCCUPATION_STATUS_OPTIONS } from "@/features/tutors/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AvailabilityPicker from "@/features/tutors/components/AvailabilityPicker";
import AreaPicker from "@/features/tutors/components/AreaPicker";

const SectionTitle = ({ icon, title }) => (
  <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e3a5f]/10">
      {createElement(icon, { className: "h-4 w-4 text-[#1e3a5f]" })}
    </div>
    <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
  </div>
);

const TutorProfileEditForm = ({ tutorProfile, submitting, onSubmit, onCancel }) => {
  const initialValues = useMemo(() => tutorProfileToFormValues(tutorProfile), [tutorProfile]);

  const form = useForm({
    resolver: zodResolver(tutorProfileEditSchema),
    defaultValues: initialValues,
  });

  const handleSubmit = (data) => {
    const changes = diffTutorProfileChanges(initialValues, data);
    if (Object.keys(changes).length === 0) {
      toast.info("Bạn chưa thay đổi thông tin nào.");
      return;
    }
    onSubmit(changes);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-700">Chỉnh sửa hồ sơ gia sư</h3>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
          Thay đổi cần admin duyệt
        </span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 px-6 py-6">
          {/* Liên hệ + khu vực hiện tại */}
          <div>
            <SectionTitle icon={User2} title="Thông tin liên hệ" />
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại liên hệ</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: 0912345678" {...field} />
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
                    <FormLabel>Khu vực hiện tại</FormLabel>
                    <AreaPicker value={field.value} onChange={field.onChange} mode="single" />
                    {fieldState.error && (
                      <p className="text-xs text-rose-500">
                        {fieldState.error.province?.message ||
                          fieldState.error.district?.message ||
                          fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Tình trạng nghề nghiệp */}
          <div>
            <SectionTitle icon={GraduationCap} title="Tình trạng nghề nghiệp" />
            <FormField
              control={form.control}
              name="occupationStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tình trạng nghề nghiệp</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Chọn tình trạng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {OCCUPATION_STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value} className="cursor-pointer">
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Giới thiệu */}
          <div>
            <SectionTitle icon={User2} title="Giới thiệu bản thân" />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả bản thân, kinh nghiệm giảng dạy</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={5}
                      placeholder="Giới thiệu về bản thân, kinh nghiệm, phương pháp dạy học..."
                      className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-slate-400 focus-visible:outline-none"
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="ml-auto text-xs text-slate-400">{field.value?.length ?? 0}/2000</span>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Khu vực giảng dạy */}
          <div>
            <SectionTitle icon={MapPin} title="Khu vực giảng dạy" />
            <FormField
              control={form.control}
              name="teachingAreas"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Tỉnh/thành & quận/huyện có thể dạy</FormLabel>
                  <AreaPicker value={field.value} onChange={field.onChange} mode="multi-district" />
                  {fieldState.error && (
                    <p className="text-xs text-rose-500">
                      {fieldState.error.province?.message ||
                        fieldState.error.districts?.message ||
                        fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>

          {/* Lịch giảng dạy */}
          <div>
            <SectionTitle icon={CalendarClock} title="Lịch giảng dạy" />
            <FormField
              control={form.control}
              name="availability"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Khung giờ bạn có thể dạy</FormLabel>
                  <AvailabilityPicker value={field.value} onChange={field.onChange} />
                  {fieldState.error && (
                    <p className="text-xs text-rose-500">
                      {fieldState.error.message || fieldState.error.root?.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>

          {/* Field bị khóa — chỉ xem */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Lock className="h-4 w-4" />
              Không thể thay đổi
            </div>
            <div className="space-y-1.5 text-sm text-slate-600">
              <p>
                <span className="text-slate-400">Môn học: </span>
                {tutorProfile?.subjects?.join(", ") || "—"}
              </p>
              <p>
                <span className="text-slate-400">Trường học: </span>
                {tutorProfile?.schoolName || "—"}
              </p>
              {tutorProfile?.graduationYear && (
                <p>
                  <span className="text-slate-400">Năm tốt nghiệp: </span>
                  {tutorProfile.graduationYear}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#1e3a5f] text-white hover:bg-[#2d5a9e]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi yêu cầu duyệt"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Hủy
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TutorProfileEditForm;
