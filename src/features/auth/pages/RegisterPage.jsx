import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { registerThunk } from "@/features/auth/store/authThunks";
import AuthLeftPanel from "@/features/auth/components/AuthLeftPanel";
import RegisterForm from "@/features/auth/components/RegisterForm";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(result)) {
      navigate("/verify-otp", { state: { email: data.email } });
    }
  };

  return (
    <div className="auth-shell flex min-h-dvh w-full">
      <AuthLeftPanel />
      <RegisterForm onSubmit={onSubmit} />
    </div>
  );
};

export default RegisterPage;
