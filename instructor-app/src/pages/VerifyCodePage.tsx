import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import {
  AuthHeader,
  ErrorBanner,
  FieldLabel,
  PrimaryButton,
  SuccessBanner,
  TextInput,
} from "../components/AuthAtoms";
import {
  resendPhoneCode,
  submitPhoneNumber,
  verifyEmail,
  verifyPhoneCode,
} from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { cn } from "../lib/cn";

const LENGTH = 6;

/**
 * Two-mode verification page:
 *   - ?mode=email&token=... → POST /auth/verify-email
 *   - ?mode=phone (default)  → phone-number submit → 6-digit code → /auth/verify-phone
 * The phone mode is the post-login gate; the user must complete it before any
 * authenticated endpoint becomes callable.
 */
export function VerifyCodePage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { user, refreshUser } = useAuth();
  const mode = (params.get("mode") as "email" | "phone") ?? "phone";
  const emailToken = params.get("token") ?? "";

  // For phone mode, drive a 2-step flow: if the user has no phone on record,
  // collect it first; otherwise (or after submitting one) move straight to code.
  const [step, setStep] = useState<"phone" | "code">(
    mode === "phone" && !user?.phone_number ? "phone" : "code"
  );
  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // Email-mode: as soon as we land, redeem the token automatically.
  useEffect(() => {
    if (mode !== "email") return;
    if (!emailToken) {
      setError("Missing verification token.");
      return;
    }
    setSubmitting(true);
    verifyEmail(emailToken)
      .then(() => {
        setSuccess("Email verified. Redirecting to sign in…");
        setTimeout(() => nav("/sign-in"), 1500);
      })
      .catch((e) => {
        setError(e instanceof ApiError ? e.message : "Could not verify email.");
      })
      .finally(() => setSubmitting(false));
  }, [mode, emailToken, nav]);

  const code = digits.join("");

  function focus(i: number) {
    refs.current[i]?.focus();
    refs.current[i]?.select();
  }

  function onDigitChange(i: number, e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < LENGTH - 1) focus(i + 1);
  }

  function onDigitKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) focus(i - 1);
    if (e.key === "ArrowLeft" && i > 0) focus(i - 1);
    if (e.key === "ArrowRight" && i < LENGTH - 1) focus(i + 1);
  }

  async function onSubmitPhone(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!phone.trim()) {
      setError("Enter your phone number.");
      return;
    }
    setSubmitting(true);
    try {
      await submitPhoneNumber(phone.trim());
      setSuccess("Code sent — check your email (SMS coming soon).");
      setStep("code");
      setDigits(Array(LENGTH).fill(""));
      setTimeout(() => focus(0), 50);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === "phone_already_verified") {
          setSuccess("Already verified.");
          await refreshUser();
          nav("/");
        } else if (e.code === "phone_taken") {
          setError("Another account owns that phone number.");
        } else setError(e.message);
      } else {
        setError("Network error.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (code.length !== LENGTH) {
      setError(`Enter all ${LENGTH} digits.`);
      return;
    }
    setSubmitting(true);
    try {
      await verifyPhoneCode(code);
      setSuccess("Phone verified.");
      await refreshUser();
      setTimeout(() => nav("/"), 800);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === "invalid_phone_code") setError("Wrong or expired code. Try again.");
        else if (e.code === "phone_code_attempts_exceeded") setError("Too many tries — request a new code.");
        else if (e.code === "phone_not_submitted") {
          setError("Your code expired — submit your phone again.");
          setStep("phone");
        } else setError(e.message);
      } else {
        setError("Network error.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    setError(null);
    try {
      await resendPhoneCode();
      setSuccess("A new code is on its way.");
    } catch (e) {
      if (e instanceof ApiError && e.code === "phone_not_submitted") {
        setError("Submit your phone first.");
        setStep("phone");
      } else {
        setError(e instanceof ApiError ? e.message : "Could not resend.");
      }
    }
  }

  if (mode === "email") {
    return (
      <AuthLayout slide={2}>
        <div className="flex flex-col gap-5">
          <AuthHeader title="Email verification" subtitle="Confirming your email…" />
          <ErrorBanner>{error}</ErrorBanner>
          <SuccessBanner>{success}</SuccessBanner>
          {!success && !error && <p className="text-center text-[13px] text-slate-500">Working…</p>}
          <p className="text-center text-[13px] text-slate-500">
            <Link to="/sign-in" className="font-medium text-primary hover:underline">Back to sign in</Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (step === "phone") {
    return (
      <AuthLayout slide={2}>
        <form onSubmit={onSubmitPhone} className="flex flex-col gap-5">
          <AuthHeader
            title="Verify your phone"
            subtitle="We need a phone number on file before you can use the app."
          />
          <FieldLabel label="Phone number">
            <TextInput
              value={phone}
              onChange={setPhone}
              placeholder="+1 555 123 4567"
              autoComplete="tel"
            />
          </FieldLabel>
          <ErrorBanner>{error}</ErrorBanner>
          <SuccessBanner>{success}</SuccessBanner>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send code"}
          </PrimaryButton>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout slide={2}>
      <form onSubmit={onSubmitCode} className="flex flex-col gap-5">
        <AuthHeader
          title="2-Step Verification"
          subtitle="Enter the 6-digit code we sent."
        />

        <div className="flex items-center justify-center gap-2">
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
              onChange={(e) => onDigitChange(i, e)}
              onKeyDown={(e) => onDigitKeyDown(i, e)}
              className={cn(
                "h-14 w-12 rounded-lg border bg-white text-center text-[20px] font-semibold text-ink outline-none transition focus:border-primary",
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
          <button type="button" onClick={onResend} className="font-medium text-primary hover:underline">
            Resend code
          </button>{" "}
          ·{" "}
          <button type="button" onClick={() => setStep("phone")} className="font-medium text-primary hover:underline">
            Change phone
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
