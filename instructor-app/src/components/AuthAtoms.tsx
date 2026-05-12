import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { cn } from "../lib/cn";

export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <h1 className="text-[24px] font-bold text-ink">{title}</h1>
      {subtitle && <p className="text-[14px] text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-secondary">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  autoComplete,
  invalid,
}: {
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  invalid?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-2 rounded-lg border bg-white px-3 transition focus-within:border-primary",
        invalid ? "border-danger-500" : "border-violet-100"
      )}
    >
      {icon && <span className="text-slate-400">{icon}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-300"
      />
    </div>
  );
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  autoComplete = "current-password",
  required,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  invalid?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-2 rounded-lg border bg-white px-3 transition focus-within:border-primary",
        invalid ? "border-danger-500" : "border-violet-100"
      )}
    >
      <Lock size={16} className="text-slate-400" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-300"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="text-slate-400 hover:text-secondary"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function PrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="h-12 w-full rounded-lg bg-primary text-[14px] font-medium text-white shadow-sm transition hover:bg-violet-600 active:translate-y-px disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function ErrorBanner({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div role="alert" className="rounded-md bg-danger-50 px-3 py-2 text-[13px] text-danger-500">
      {children}
    </div>
  );
}

export function SuccessBanner({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div role="status" className="rounded-md bg-positive-50 px-3 py-2 text-[13px] text-positive-600">
      {children}
    </div>
  );
}

/** Common email + name + password icons re-exported for callers. */
export { Lock, Mail, User };
