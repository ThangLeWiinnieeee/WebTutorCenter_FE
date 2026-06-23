import { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, GraduationCap, Mail } from "lucide-react";

import { verifyOtpSchema } from "@/features/auth/schemas/authSchema";
import { scrollToFirstError } from "@/lib/formErrors";
import { Button } from "@/components/ui/button";

const OTP_LENGTH = 6;

const VerifyOtpForm = ({
  email,
  onSubmit,
  onResend,
  resendCooldown,
  serverError,
  title = "Xác thực email",
  description,
  submitLabel = "Xác nhận",
  submittingLabel = "Đang xác thực...",
}) => {
  const inputRefs = useRef([]);

  const {
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const otpValue = useWatch({ control, name: "otp" }) || "";

  const handleOtpChange = (index, char) => {
    const digits = char.replace(/\D/g, "").slice(0, 1);
    const current = (otpValue).split("");
    current[index] = digits;
    const next = current.join("").slice(0, OTP_LENGTH);
    setValue("otp", next, { shouldValidate: true });

    if (digits && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const current = otpValue.split("");
      if (!current[index] && index > 0) {
        current[index - 1] = "";
        setValue("otp", current.join(""), { shouldValidate: true });
        inputRefs.current[index - 1]?.focus();
      } else {
        current[index] = "";
        setValue("otp", current.join(""), { shouldValidate: true });
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    setValue("otp", pasted, { shouldValidate: true });
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
  };

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

        {/* Icon + Heading */}
        <div className="space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
            <Mail className="h-7 w-7 text-[#1e3a5f]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {description || (
                <>
                  Chúng tôi đã gửi mã OTP gồm 6 chữ số đến{" "}
                  <span className="font-semibold text-slate-700">{email}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)} noValidate className="space-y-6">
          {/* OTP boxes */}
          <div className="flex gap-2 justify-between" onPaste={handlePaste}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otpValue[i] || ""}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`h-13 w-full max-w-[52px] rounded-lg border text-center text-xl font-bold text-slate-800 bg-white outline-none transition-all focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 ${
                  otpValue[i] ? "border-[#1e3a5f]" : "border-slate-200"
                }`}
                style={{ height: "52px" }}
              />
            ))}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || otpValue.length < OTP_LENGTH}
            className="w-full h-11 bg-[#1e3a5f] hover:bg-[#16304f] text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {submittingLabel}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </form>

        {/* Resend */}
        <p className="text-center text-sm text-slate-500">
          Không nhận được mã?{" "}
          {resendCooldown > 0 ? (
            <span className="text-slate-400">
              Gửi lại sau{" "}
              <span className="font-semibold text-slate-600 tabular-nums">{resendCooldown}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Gửi lại OTP
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default VerifyOtpForm;
