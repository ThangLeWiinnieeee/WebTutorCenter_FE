import { useState } from 'react';

import {
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema } from '@/features/auth/schemas/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';

const RegisterForm = ({ onSubmit }) => {
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-[440px] space-y-7">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#1e3a5f]">WebTutorCenter</span>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">Tạo tài khoản mới</h2>
          <p className="text-sm text-slate-500">
            Tham gia cùng hàng ngàn học sinh và gia sư trên nền tảng
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-slate-700 font-medium text-sm">
              Họ và tên
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              className={`h-11 bg-white border-slate-200 focus-visible:ring-blue-500 text-slate-800 placeholder:text-slate-400 ${
                errors.fullName ? "border-red-400 focus-visible:ring-red-400" : ""
              }`}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Thư điện tử */}
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

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-slate-700 font-medium text-sm">
              Số điện thoại
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0912 345 678"
              autoComplete="tel"
              className={`h-11 bg-white border-slate-200 focus-visible:ring-blue-500 text-slate-800 placeholder:text-slate-400 ${
                errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""
              }`}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Date of birth */}
          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth" className="text-slate-700 font-medium text-sm">
              Ngày sinh
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              className={`h-11 bg-white border-slate-200 focus-visible:ring-blue-500 text-slate-800 ${
                errors.dateOfBirth ? "border-red-400 focus-visible:ring-red-400" : ""
              }`}
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-700 font-medium text-sm">
              Mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                className={`h-11 bg-white border-slate-200 focus-visible:ring-blue-500 pr-11 text-slate-800 placeholder:text-slate-400 ${
                  errors.password ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
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
                onClick={() => setShowConfirmPassword((v) => !v)}
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

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#1e3a5f] hover:bg-[#16304f] text-white font-semibold text-sm rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang đăng ký...
              </>
            ) : (
              "Đăng ký"
            )}
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
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

export default RegisterForm;
