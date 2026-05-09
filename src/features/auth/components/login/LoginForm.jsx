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
import { loginSchema } from '@/features/auth/schemas/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';

const LoginForm = ({ onSubmit, onGoogleSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#1e3a5f]">WebTutorCenter</span>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">Chào mừng trở lại</h2>
          <p className="text-sm text-slate-500">
            Đăng nhập để tiếp tục học tập cùng gia sư của bạn
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-700 font-medium text-sm">
              Mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
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
            <Link
              to="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Quên mật khẩu?
            </Link>
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
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">hoặc</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Google login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => {}}
            width="368"
            text="signin_with"
            locale="vi"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
