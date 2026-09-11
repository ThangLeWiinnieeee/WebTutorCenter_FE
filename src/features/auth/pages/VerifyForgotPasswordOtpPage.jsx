import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import AuthLeftPanel from "@/features/auth/components/AuthLeftPanel";
import VerifyOtpForm from "@/features/auth/components/VerifyOtpForm";
import { forgotPasswordThunk, verifyForgotPasswordOtpThunk } from "@/features/auth/store/authThunks";

const RESEND_COOLDOWN_SECONDS = 60;

// Trang bước 2 quên mật khẩu: nhập OTP để lấy resetToken.
const VerifyForgotPasswordOtpPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [serverError, setServerError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Xác thực OTP rồi chuyển sang trang đặt lại mật khẩu.
  const onSubmit = async ({ otp }) => {
    setServerError("");
    const result = await dispatch(verifyForgotPasswordOtpThunk({ email, otp }));

    if (verifyForgotPasswordOtpThunk.fulfilled.match(result) && result.payload?.resetToken) {
      navigate("/reset-password", {
        state: { email, resetToken: result.payload.resetToken },
      });
      return;
    }

    setServerError(result.payload || "Mã OTP không đúng, vui lòng thử lại.");
  };

  const onResend = useCallback(async () => {
    setServerError("");
    const result = await dispatch(forgotPasswordThunk({ email }));

    if (forgotPasswordThunk.fulfilled.match(result)) {
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      return;
    }

    setServerError(result.payload || "Gửi lại OTP thất bại, vui lòng thử lại.");
  }, [dispatch, email]);

  return (
    <div className="auth-shell flex min-h-dvh w-full">
      <AuthLeftPanel />
      <VerifyOtpForm
        email={email}
        title="Xác thực OTP khôi phục mật khẩu"
        description={
          <>
            Nhập mã OTP gồm 6 chữ số đã gửi đến <span className="font-semibold text-slate-700">{email}</span>
          </>
        }
        submitLabel="Tiếp tục"
        submittingLabel="Đang xác thực..."
        onSubmit={onSubmit}
        onResend={onResend}
        resendCooldown={resendCooldown}
        serverError={serverError}
      />
    </div>
  );
};

export default VerifyForgotPasswordOtpPage;
