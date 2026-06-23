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
            <KeyRound className="h-7 w-7 text-[#1e3a5f]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-800">Đặt lại mật khẩu</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Tạo mật khẩu mới cho{" "}
              <span className="font-semibold text-slate-700">{email}</span>
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
            <Label htmlFor="newPassword" className="text-slate-700 font-medium text-sm">
              Mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                className={`h-11 bg-white border-slate-200 focus-visible:ring-blue-500 pr-11 text-slate-800 placeholder:text-slate-400 ${
                  errors.newPassword ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-slate-700 font-medium text-sm">
              Xác nhận mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                className={`h-11 bg-white border-slate-200 focus-visible:ring-blue-500 pr-11 text-slate-800 placeholder:text-slate-400 ${
                  errors.confirmPassword ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
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
                Đang đặt lại...
              </>
            ) : (
              "Đổi mật khẩu"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Quay lại{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
