import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, GraduationCap, LogIn, Clock, Loader2 } from "lucide-react";

import useAuth from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import TutorRegistrationForm from "@/features/tutors/components/TutorRegistrationForm";
import { getTutorProfileThunk } from "@/features/tutors/store/tutorThunks";

const SuccessBanner = () => (
  <div className="mx-auto max-w-xl text-center py-16 px-4">
    <div className="flex justify-center mb-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
      </div>
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-3">Đăng ký thành công!</h2>
    <p className="text-slate-600 mb-2">
      Hồ sơ của bạn đã được gửi đi và đang chờ xét duyệt.
    </p>
    <p className="text-slate-500 text-sm mb-8">
      Chúng tôi sẽ thông báo kết quả qua{" "}
      <span className="font-medium text-[#1e3a5f]">chuông thông báo</span> trên thanh điều hướng.
      Thời gian xét duyệt thường từ 1–3 ngày làm việc.
    </p>
    <Button asChild className="bg-[#1e3a5f] hover:bg-[#2d5a9e]">
      <Link to="/">Về trang chủ</Link>
    </Button>
  </div>
);

const PendingBanner = () => (
  <div className="mx-auto max-w-xl text-center py-16 px-4">
    <div className="flex justify-center mb-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
        <Clock className="h-10 w-10 text-amber-600" />
      </div>
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-3">Hồ sơ đang chờ xét duyệt</h2>
    <p className="text-slate-600 mb-2">
      Bạn đã gửi hồ sơ đăng ký gia sư và đang đợi admin xét duyệt.
    </p>
    <p className="text-slate-500 text-sm mb-8">
      Thời gian xét duyệt thường từ 1–3 ngày làm việc. Chúng tôi sẽ thông báo kết quả qua{" "}
      <span className="font-medium text-[#1e3a5f]">chuông thông báo</span> trên thanh điều hướng.
    </p>
    <Button asChild className="bg-[#1e3a5f] hover:bg-[#2d5a9e]">
      <Link to="/">Về trang chủ</Link>
    </Button>
  </div>
);

const LoginPrompt = () => (
  <div className="mx-auto max-w-md text-center py-16 px-4">
    <div className="flex justify-center mb-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1e3a5f]/10">
        <GraduationCap className="h-10 w-10 text-[#1e3a5f]" />
      </div>
    </div>
    <h2 className="text-xl font-bold text-slate-800 mb-3">Bạn cần đăng nhập</h2>
    <p className="text-slate-500 text-sm mb-8">
      Vui lòng đăng nhập vào tài khoản của bạn trước khi đăng ký làm gia sư.
    </p>
    <div className="flex justify-center gap-3">
      <Button asChild className="bg-[#1e3a5f] hover:bg-[#2d5a9e] gap-2">
        <Link to="/login">
          <LogIn className="h-4 w-4" />
          Đăng nhập
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/register">Đăng ký tài khoản</Link>
      </Button>
    </div>
  </div>
);

const AlreadyTutorBanner = () => (
  <div className="mx-auto max-w-md text-center py-16 px-4">
    <div className="flex justify-center mb-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <GraduationCap className="h-10 w-10 text-emerald-600" />
      </div>
    </div>
    <h2 className="text-xl font-bold text-slate-800 mb-3">Bạn đã là gia sư</h2>
    <p className="text-slate-500 text-sm mb-8">
      Tài khoản của bạn đã có vai trò gia sư. Hãy vào trang hồ sơ để xem thông tin.
    </p>
    <Button asChild className="bg-[#1e3a5f] hover:bg-[#2d5a9e]">
      <Link to="/profile">Xem hồ sơ</Link>
    </Button>
  </div>
);

const RegisterTutorPage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  const { profile, loading } = useSelector((state) => state.tutors);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role !== "tutor") {
      dispatch(getTutorProfileThunk());
    }
  }, [dispatch, isAuthenticated, user?.role]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)]">
        <LoginPrompt />
      </div>
    );
  }

  if (user?.role === "tutor") {
    return (
      <div className="min-h-[calc(100vh-64px)]">
        <AlreadyTutorBanner />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (justRegistered) {
    return (
      <div className="min-h-[calc(100vh-64px)]">
        <SuccessBanner />
      </div>
    );
  }

  if (profile?.status === "pending") {
    return (
      <div className="min-h-[calc(100vh-64px)]">
        <PendingBanner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e3a5f]">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Đăng ký làm gia sư</h1>
            <p className="text-sm text-slate-500">Chia sẻ kiến thức và tạo thu nhập từ việc dạy học</p>
          </div>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Hồ sơ của bạn sẽ được admin xét duyệt trước khi kích hoạt. Thời gian xét duyệt từ 1–3 ngày làm việc.
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
        <TutorRegistrationForm onSuccess={() => setJustRegistered(true)} />
      </div>
    </div>
  );
};

export default RegisterTutorPage;
