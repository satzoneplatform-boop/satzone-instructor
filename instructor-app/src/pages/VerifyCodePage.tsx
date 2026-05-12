import { useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import {
  AuthHeader,
  ErrorBanner,
  PrimaryButton,
  SuccessBanner,
} from "../components/AuthAtoms";
import { resendPhoneCode, verifyEmail, verifyPhoneCode } from "../api/auth";
import { ApiError } from "../api/client";
import { cn } from "../lib/cn";

const LENGTH = 4;

/**
 * Generic 2-step verification screen. Two modes (chosen via ?mode=):
 *   - ?mode=email&token=... → POST /auth/verify-email
 *   - ?mode=phone → POST /auth/verify-phone with the typed code
 * Defaults to phone.
 */
export function VerifyCodePage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const mode = (params.get("mode") as "email" | "phone") ?? "phone";
  const emailToken = params.get("token") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");

  function focus(i: number) {
    refs.current[i]?.focus();
    refs.current[i]?.select();
  }

  function onChange(i: number, e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < LENGTH - 1) focus(i + 1);
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) focus(i - 1);
    if (e.key === "ArrowLeft" && i > 0) focus(i - 1);
    if (e.key === "ArrowRight" && i < LENGTH - 1) focus(i + 1);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (code.length !== LENGTH) {
      setError(`Enter all ${LENGTH} digits.`);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "email") {
        if (!emailToken) throw new ApiError(400, "missing_token", "Missing email token.");
        await verifyEmail(emailToken);
        setSuccess("Email verified. Redirecting to sign in…");
        setTimeout(() => nav("/sign-in"), 1500);
      } else {
        await verifyPhoneCode(code);
        setSuccess("Phone verified.");
        setTimeout(() => nav("/"), 1500);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === "invalid_phone_code") setError("Wrong or expired code. Try again.");
        else if (e.code === "phone_code_attempts_exceeded") setError("Too many tries — request a new code.");
        else setError(e.message);
      } else {
        setError("Network error. Try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    try {
      await resendPhoneCode();
      setSuccess("A new code is on its way.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not resend.");
    }
  }

  return (
    <AuthLayout slide={2}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <AuthHeader
          title="2-Step Verification"
          subtitle={
            mode === "email"
              ? "We sent a verification code to your email."
              : "Enter the code we sent to your phone."
          }
        />

        <div className="flex items-center justify-center gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => onChange(i, e)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className={cn(
                "h-14 w-14 rounded-lg border bg-white text-center text-[20px] font-semibold text-ink outline-none transition focus:border-primary",
                d ? "border-primary" : "border-violet-100"
              )}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        <ErrorBanner>{error}</ErrorBanner>
        <SuccessBanner>{success}</SuccessBanner>

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Verifying…" : "Verify my account"}
        </PrimaryButton>

        <p className="text-center text-[13px] text-slate-500">
          Haven't received it?{" "}
          {mode === "phone" ? (
            <button type="button" onClick={onResend} className="font-medium text-primary hover:underline">
              Resend code
            </button>
          ) : (
            <Link to="/sign-in" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          )}
        </p>
      </form>
    </AuthLayout>
  );
}
