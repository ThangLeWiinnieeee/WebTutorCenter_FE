import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

import { verifyOtpThunk, resendOtpThunk } from "@/features/auth/store/authThunks";
import AuthLeftPanel from "@/features/auth/components/AuthLeftPanel";
import VerifyOtpForm from "@/features/auth/components/VerifyOtpForm";

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyOtpPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();

  const email = location.state?.email || "";
  const from = location.state?.from; // giữ đích quay lại (vd /find-tutor) xuyên suốt luồng đăng ký

  const [serverError,     setServerError]     = useState("");
  const [resendCooldown,  setResendCooldown]   = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const onSubmit = async ({ otp }) => {
    setServerError("");
    const result = await dispatch(verifyOtpThunk({ email, otp }));
    if (verifyOtpThunk.fulfilled.match(result)) {
      navigate("/login", { state: { verified: true, from } });
    } else {
      setServerError(result.payload || "Mã OTP không đúng, vui lòng thử lại.");
    }
  };

  const onResend = useCallback(async () => {
    setServerError("");
    const result = await dispatch(resendOtpThunk({ email }));
    if (resendOtpThunk.fulfilled.match(result)) {
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } else {
      setServerError(result.payload || "Gửi lại OTP thất bại, vui lòng thử lại.");
    }
  }, [dispatch, email]);

  return (
    <div className="auth-shell flex min-h-dvh w-full">
      <AuthLeftPanel />
      <VerifyOtpForm
        email={email}
        onSubmit={onSubmit}
        onResend={onResend}
        resendCooldown={resendCooldown}
        serverError={serverError}
      />
    </div>
  );
};

export default VerifyOtpPage;
