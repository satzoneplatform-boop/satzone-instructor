import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import {
  AuthHeader,
  ErrorBanner,
  FieldLabel,
  PasswordInput,
  PrimaryButton,
  SuccessBanner,
} from "../components/AuthAtoms";
import { confirmPasswordReset } from "../api/auth";
import { ApiError } from "../api/client";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token") ?? "";

  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("This link is missing a reset token. Request a new email.");
      return;
    }
    if (pw.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (pw !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(token, pw);
      setSuccess("Password updated. Redirecting to sign in…");
      setTimeout(() => nav("/sign-in"), 1500);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === "invalid_reset_token" || e.code === "reset_expired") {
          setError("Reset link is invalid or has expired. Request a new one.");
        } else {
          setError(e.message);
        }
      } else {
        setError("Network error. Try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout slide={1}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <AuthHeader
          title="Create a new Password"
          subtitle="Welcome back, you've been missed!"
        />

        <FieldLabel label="Password">
          <PasswordInput
            value={pw}
            onChange={setPw}
            autoComplete="new-password"
            required
          />
        </FieldLabel>

        <FieldLabel label="Confirm Password">
          <PasswordInput
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            required
          />
        </FieldLabel>

        <ErrorBanner>{error}</ErrorBanner>
        <SuccessBanner>{success}</SuccessBanner>

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Updating…" : "Summit"}
        </PrimaryButton>

        <p className="text-center text-[13px] text-slate-500">
          Back to{" "}
          <Link to="/sign-in" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
