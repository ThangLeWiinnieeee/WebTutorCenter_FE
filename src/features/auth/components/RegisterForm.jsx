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
import { scrollToFirstError } from '@/lib/formErrors';
import { zodResolver } from '@hookform/resolvers/zod';

const RegisterForm = ({ onSubmit }) => {
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  // Ô input dạng "filled" mềm, hòa vào nền trắng — focus mới nổi viền + nền trắng.
  const fieldClass = (hasError) =>
    `h-12 rounded-xl border px-4 text-[15px] text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-[#1e3a5f] ${
      hasError
        ? "border-red-300 bg-red-50/60 focus-visible:border-red-400"
        : "border-transparent bg-slate-100/70 hover:bg-slate-100"
    }`;

  return (
    <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-12">
      <div className="w-full max-w-[440px]">
        {/* Mobile logo */}
        <div data-aos="fade-up" className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#1e3a5f]">WebTutorCenter</span>
        </div>

        {/* Heading */}
        <div data-aos="fade-up" className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Tạo tài khoản mới
          </h2>
          <p className="text-[15px] text-slate-500">
            Tham gia cùng hàng ngàn học sinh và gia sư trên nền tảng
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
          noValidate
          data-aos="fade-up"
          data-aos-delay="100"
          className="mt-9 space-y-4"
        >
          {/* Full name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
              Họ và tên
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              className={fieldClass(errors.fullName)}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Thư điện tử */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Thư điện tử
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nhap-email@vi-du.com"
              autoComplete="email"
              className={fieldClass(errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Số điện thoại
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0912 345 678"
              autoComplete="tel"
              className={fieldClass(errors.phone)}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Date of birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-700">
              Ngày sinh
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              className={fieldClass(errors.dateOfBirth)}
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                className={`${fieldClass(errors.password)} pr-12`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
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
                className={`${fieldClass(errors.confirmPassword)} pr-12`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
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

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-linear-to-r from-[#1e3a5f] to-[#2c5286] text-[15px] font-semibold text-white shadow-lg shadow-[#1e3a5f]/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-[#16304f] hover:to-[#244269] hover:shadow-xl hover:shadow-[#1e3a5f]/30 active:translate-y-0 active:scale-[0.99] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
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
        <p data-aos="fade-up" data-aos-delay="150" className="mt-9 text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
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

export default RegisterForm;
