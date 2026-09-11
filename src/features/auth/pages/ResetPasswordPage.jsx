import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import AuthLeftPanel from "@/features/auth/components/AuthLeftPanel";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import { resetPasswordThunk } from "@/features/auth/store/authThunks";

// Trang bước 3 quên mật khẩu: đặt lại mật khẩu bằng resetToken.
const ResetPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!resetToken) {
      navigate("/forgot-password", { replace: true, state: { email } });
    }
  }, [email, navigate, resetToken]);

  // Gửi mật khẩu mới và điều hướng về trang đăng nhập.
  const onSubmit = async (data) => {
    setServerError("");
    const result = await dispatch(resetPasswordThunk({ resetToken, ...data }));

    if (resetPasswordThunk.fulfilled.match(result)) {
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
      navigate("/login", { replace: true });
      return;
    }

    setServerError(result.payload || "Không thể đặt lại mật khẩu, vui lòng thử lại.");
  };

  return (
    <div className="auth-shell flex min-h-dvh w-full">
      <AuthLeftPanel />
      <ResetPasswordForm email={email} serverError={serverError} onSubmit={onSubmit} />
    </div>
  );
};

export default ResetPasswordPage;
