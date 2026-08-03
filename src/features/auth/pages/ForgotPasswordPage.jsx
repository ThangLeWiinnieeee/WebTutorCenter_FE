import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import AuthLeftPanel from "@/features/auth/components/AuthLeftPanel";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import { forgotPasswordThunk } from "@/features/auth/store/authThunks";

// Trang bước 1 quên mật khẩu: nhập email để nhận OTP.
const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [serverError, setServerError] = useState("");
  const defaultEmail = location.state?.email || "";

  // Gửi yêu cầu OTP và chuyển sang trang xác thực.
  const onSubmit = async (data) => {
    setServerError("");
    const result = await dispatch(forgotPasswordThunk(data));

    if (forgotPasswordThunk.fulfilled.match(result)) {
      navigate("/verify-forgot-password-otp", {
        state: { email: result.payload?.email || data.email },
      });
      return;
    }

    setServerError(result.payload || "Không thể gửi OTP, vui lòng thử lại.");
  };

  return (
    <div className="auth-shell flex min-h-dvh w-full">
      <AuthLeftPanel />
      <ForgotPasswordForm defaultEmail={defaultEmail} serverError={serverError} onSubmit={onSubmit} />
    </div>
  );
};

export default ForgotPasswordPage;
