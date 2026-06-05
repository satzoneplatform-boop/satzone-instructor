import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import {
  AuthHeader,
  ErrorBanner,
  FieldLabel,
  Mail,
  PrimaryButton,
  SuccessBanner,
  TextInput,
} from "../components/AuthAtoms";
import { requestPasswordReset } from "../api/auth";
import { ApiError } from "../api/client";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      // Backend returns 200 regardless of whether the email exists (no enumeration).
      setSuccess(
        "If that email is registered, a password-reset link is on its way. Check your inbox."
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Network error. Try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout slide={2}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <AuthHeader
          title="Forgot Password"
          subtitle="Welcome back, you've been missed!"
        />

        <FieldLabel label="Email">
          <TextInput
            icon={<Mail size={16} />}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </FieldLabel>

        <ErrorBanner>{error}</ErrorBanner>
        <SuccessBanner>{success}</SuccessBanner>

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Submit"}
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
