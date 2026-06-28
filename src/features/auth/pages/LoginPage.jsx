import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

import { loginThunk, googleLoginThunk } from "@/features/auth/store/authThunks";
import AuthLeftPanel from "@/features/auth/components/AuthLeftPanel";
import LoginForm from "@/features/auth/components/login/LoginForm";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const onSubmit = async (data) => {
    const result = await dispatch(loginThunk(data));
    if (loginThunk.fulfilled.match(result)) {
      const user = result.payload?.user;
      navigate(user?.role === "admin" ? "/admin" : redirectTo, { replace: true });
    }
  };

  const onGoogleSuccess = async (credential) => {
    const result = await dispatch(googleLoginThunk(credential));
    if (googleLoginThunk.fulfilled.match(result)) {
      const user = result.payload?.user;
      if (user?.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }
      const needsProfile = user && (!user.phone || !user.dateOfBirth);
      navigate(needsProfile ? "/complete-profile" : redirectTo, { replace: true });
    }
  };

  const onGoogleError = () => {
    toast.error("Không thể mở đăng nhập Google. Vui lòng kiểm tra cấu hình OAuth hoặc thử lại.");
  };

  return (
    <div className="auth-shell flex min-h-dvh w-full">
      <AuthLeftPanel />
      <LoginForm
        onSubmit={onSubmit}
        onGoogleSuccess={onGoogleSuccess}
        onGoogleError={onGoogleError}
      />
    </div>
  );
};

export default LoginPage;
