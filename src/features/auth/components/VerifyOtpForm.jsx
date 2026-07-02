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
    <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-12">
      <div className="w-full max-w-[400px]">
        {/* Mobile logo */}
        <div data-aos="fade-up" className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#1e3a5f]">WebTutorCenter</span>
        </div>

        {/* Icon + Heading */}
        <div className="space-y-4">
          <div
            data-aos="zoom-in"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 text-[#1e3a5f] shadow-sm ring-1 ring-blue-100"
          >
            <Mail className="h-7 w-7" />
          </div>
          <div data-aos="fade-up" data-aos-delay="100" className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
            <p className="text-[15px] leading-relaxed text-slate-500">
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
          <div
            data-aos="fade-up"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {serverError}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
          noValidate
          data-aos="fade-up"
          data-aos-delay="150"
          className="mt-8 space-y-6"
        >
          {/* OTP boxes */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
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
                className={`h-14 w-full max-w-[54px] rounded-xl border text-center text-xl font-bold text-slate-800 outline-none transition-all duration-150 focus:scale-105 focus:border-[#1e3a5f] focus:bg-white ${
                  otpValue[i]
                    ? "border-[#1e3a5f] bg-white"
                    : "border-transparent bg-slate-100/70"
                }`}
              />
            ))}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || otpValue.length < OTP_LENGTH}
            className="h-12 w-full rounded-xl bg-linear-to-r from-[#1e3a5f] to-[#2c5286] text-[15px] font-semibold text-white shadow-lg shadow-[#1e3a5f]/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-[#16304f] hover:to-[#244269] hover:shadow-xl hover:shadow-[#1e3a5f]/30 active:translate-y-0 active:scale-[0.99] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
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
        <p data-aos="fade-up" data-aos-delay="200" className="mt-8 text-center text-sm text-slate-500">
          Không nhận được mã?{" "}
          {resendCooldown > 0 ? (
            <span className="text-slate-400">
              Gửi lại sau{" "}
              <span className="font-semibold tabular-nums text-slate-600">{resendCooldown}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
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
