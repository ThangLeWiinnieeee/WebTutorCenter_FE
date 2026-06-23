import { GraduationCap, Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/features/auth/schemas/authSchema";
import { scrollToFirstError } from "@/lib/formErrors";
import { zodResolver } from "@hookform/resolvers/zod";

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
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#1e3a5f]">WebTutorCenter</span>
        </div>

        <div className="space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
            <Mail className="h-7 w-7 text-[#1e3a5f]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-800">Quên mật khẩu</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nhập email tài khoản để nhận mã OTP khôi phục mật khẩu.
            </p>
          </div>
        </div>

        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-700 font-medium text-sm">
              Thư điện tử
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nhap-email@vi-du.com"
              autoComplete="email"
              className={`h-11 bg-white border-slate-200 focus-visible:ring-blue-500 text-slate-800 placeholder:text-slate-400 ${
                errors.email ? "border-red-400 focus-visible:ring-red-400" : ""
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#1e3a5f] hover:bg-[#16304f] text-white font-semibold text-sm rounded-lg transition-colors"
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

        <p className="text-center text-sm text-slate-500">
          Nhớ mật khẩu?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
