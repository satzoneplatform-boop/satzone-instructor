import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import {
  AuthHeader,
  ErrorBanner,
  FieldLabel,
  Mail,
  PasswordInput,
  PrimaryButton,
  SuccessBanner,
  TextInput,
  User,
} from "../components/AuthAtoms";
import { registerUser } from "../api/users";
import { ApiError } from "../api/client";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export function SignUpPage() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({ email, full_name: fullName, password });
      setSuccess("Check your inbox to verify your email, then sign in.");
      setTimeout(() => nav("/sign-in"), 2000);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === "email_taken") setError("That email is already registered.");
        else if (e.code === "validation_error") setError("Some fields are invalid.");
        else setError(e.message);
      } else {
        setError("Network error. Is the backend running on :8000?");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout slide={1}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <AuthHeader title="Sign Up" subtitle="Welcome back, you've been missed!" />

        <div className="flex items-center gap-3">
          <a
            href={`${API_BASE}/auth/google/login`}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-violet-100 bg-white text-[13px] font-medium text-secondary hover:bg-violet-50"
          >
            Sign With Google
          </a>
          <button
            type="button"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-violet-100 bg-white text-[13px] font-medium text-secondary hover:bg-violet-50"
            title="Apple sign-in coming soon"
          >
            Sign With Apple
          </button>
        </div>

        <div className="flex items-center gap-3 text-[12px] text-slate-400">
          <div className="h-px flex-1 bg-violet-100" />
          OR
          <div className="h-px flex-1 bg-violet-100" />
        </div>

        <FieldLabel label="Full Name">
          <TextInput
            icon={<User size={16} />}
            value={fullName}
            onChange={setFullName}
            placeholder="David Jasnon"
            autoComplete="name"
            required
          />
        </FieldLabel>

        <FieldLabel label="Email">
          <TextInput
            icon={<Mail size={16} />}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="davidjason@gmail.com"
            autoComplete="email"
            required
          />
        </FieldLabel>

        <FieldLabel label="Password">
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            required
          />
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
        <SuccessBanner>{success}</SuccessBanner>

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Sign Up"}
        </PrimaryButton>

        <p className="text-center text-[13px] text-slate-500">
          Don't have an account yet?{" "}
          <Link to="/sign-in" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
