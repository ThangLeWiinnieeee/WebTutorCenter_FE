import { GraduationCap, Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/features/auth/schemas/authSchema";
import { scrollToFirstError } from "@/lib/formErrors";
import { zodResolver } from "@hookform/resolvers/zod";

// Form nhập email để nhận mã OTP đặt lại mật khẩu.
const ForgotPasswordForm = ({ onSubmit, serverError, defaultEmail = "" }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: defaultEmail },
  });

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
            <Mail className="h-7 w-7" />
          </div>
          <div data-aos="fade-up" data-aos-delay="100" className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Quên mật khẩu
            </h2>
            <p className="text-[15px] leading-relaxed text-slate-500">
              Nhập email tài khoản để nhận mã OTP khôi phục mật khẩu.
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
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Thư điện tử
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nhap-email@vi-du.com"
              autoComplete="email"
              className={`h-12 rounded-xl border px-4 text-[15px] text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-brand ${
                errors.email
                  ? "border-red-300 bg-red-50/60 focus-visible:border-red-400"
                  : "border-transparent bg-slate-100/70 hover:bg-slate-100"
              }`}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-linear-to-r from-brand to-[#2c5286] text-[15px] font-semibold text-white shadow-lg shadow-brand/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-brand-dark hover:to-[#244269] hover:shadow-xl hover:shadow-brand/30 active:translate-y-0 active:scale-[0.99] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang gửi OTP...
              </>
            ) : (
              "Gửi mã OTP"
            )}
          </Button>
        </form>

        {/* Back to login */}
        <p data-aos="fade-up" data-aos-delay="200" className="mt-8 text-center text-sm text-slate-500">
          Nhớ mật khẩu?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
