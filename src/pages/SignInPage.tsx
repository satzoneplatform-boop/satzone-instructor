import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import {
  AuthHeader,
  ErrorBanner,
  FieldLabel,
  Mail,
  PasswordInput,
  PrimaryButton,
  TextInput,
} from "../components/AuthAtoms";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/client";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

const ERROR_BY_CODE: Record<string, string> = {
  email_not_verified: "Verify your email before signing in. Check your inbox.",
  oauth_only: "This account uses Google sign-in.",
  invalid_credentials: "Wrong email or password.",
  account_disabled: "This account is disabled — contact support.",
};

export function SignInPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(ERROR_BY_CODE[e.code] ?? e.message);
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout slide={2}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <AuthHeader title="Sign In" subtitle="Welcome back, you've been missed!" />

        <SocialButton provider="google" href={`${API_BASE}/auth/google/login`} />

        <div className="flex items-center gap-3 text-[12px] text-slate-400">
          <div className="h-px flex-1 bg-violet-100" />
          OR
          <div className="h-px flex-1 bg-violet-100" />
        </div>

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

        <FieldLabel label="Password">
          <PasswordInput value={password} onChange={setPassword} required />
        </FieldLabel>

        <div className="flex items-center justify-between text-[13px]">
          <label className="inline-flex cursor-pointer items-center gap-2 text-secondary">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Remember Me
          </label>
          <Link to="/forgot-password" className="font-medium text-danger-500 hover:underline">
            Forget Password?
          </Link>
        </div>

        <ErrorBanner>{error}</ErrorBanner>

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign In"}
        </PrimaryButton>

        <p className="text-center text-[13px] text-slate-500">
          Instructor access only. Contact{" "}
          <a href="mailto:satzoneplatform@gmail.com" className="font-medium text-primary hover:underline">
            support
          </a>{" "}
          to get an account.
        </p>
      </form>
    </AuthLayout>
  );
}

function SocialButton({ provider, href }: { provider: "google"; href: string }) {
  const cls =
    "flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-violet-100 bg-white text-[13px] font-medium text-secondary hover:bg-violet-50";
  return (
    <a className={cls} href={href}>
      {provider === "google" && <GoogleLogo />}
      <span>Sign in with Google</span>
    </a>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.68 9c0-.593.102-1.17.284-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

