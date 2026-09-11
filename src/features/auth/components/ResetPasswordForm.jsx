import { useState } from "react";

import { Eye, EyeOff, GraduationCap, KeyRound, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema } from "@/features/auth/schemas/authSchema";
import { scrollToFirstError } from "@/lib/formErrors";
import { zodResolver } from "@hookform/resolvers/zod";

// Form nhập mật khẩu mới ở bước cuối của luồng quên mật khẩu.
const ResetPasswordForm = ({ email, onSubmit, serverError }) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Ô input dạng "filled" mềm, hòa vào nền trắng — focus mới nổi viền + nền trắng.
  const fieldClass = (hasError) =>
    `h-12 rounded-xl border px-4 pr-12 text-[15px] text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-brand ${
      hasError
        ? "border-red-300 bg-red-50/60 focus-visible:border-red-400"
        : "border-transparent bg-slate-100/70 hover:bg-slate-100"
    }`;

  return (
    <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-12">
      <div className="w-full max-w-[400px]">
        {/* Mobile logo */}
        <div data-aos="fade-up" className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-brand">WebTutorCenter</span>
        </div>

        {/* Icon + Heading */}
        <div className="space-y-4">
          <div
            data-aos="zoom-in"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 text-brand shadow-sm ring-1 ring-blue-100"
          >
            <KeyRound className="h-7 w-7" />
          </div>
          <div data-aos="fade-up" data-aos-delay="100" className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Đặt lại mật khẩu
            </h2>
            <p className="text-[15px] leading-relaxed text-slate-500">
              Tạo mật khẩu mới cho <span className="font-semibold text-slate-700">{email}</span>
            </p>
          </div>
        </div>

        {/* Server error */}
        {serverError && (
          <div
            data-aos="fade-up"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {serverError}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
          noValidate
          data-aos="fade-up"
          data-aos-delay="150"
          className="mt-8 space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
              Mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                className={fieldClass(errors.newPassword)}
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              Xác nhận mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                className={fieldClass(errors.confirmPassword)}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-linear-to-r from-brand to-[#2c5286] text-[15px] font-semibold text-white shadow-lg shadow-brand/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-brand-dark hover:to-[#244269] hover:shadow-xl hover:shadow-brand/30 active:translate-y-0 active:scale-[0.99] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang đặt lại...
              </>
            ) : (
              "Đổi mật khẩu"
            )}
          </Button>
        </form>

        {/* Back to login */}
        <p data-aos="fade-up" data-aos-delay="200" className="mt-8 text-center text-sm text-slate-500">
          Quay lại{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
          >
            đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
