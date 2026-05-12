import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, X, XCircle } from "lucide-react";
import { cn } from "../lib/cn";

type ToastKind = "success" | "error" | "info";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastCtx = {
  notify: (message: string, kind?: ToastKind) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, kind: ToastKind = "success") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, kind, message }]);
    },
    []
  );

  // Auto-dismiss after 4s.
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((t) => t.slice(1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[340px] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border bg-white p-3 shadow-dropdown",
              t.kind === "success" && "border-positive-100",
              t.kind === "error" && "border-danger-100",
              t.kind === "info" && "border-violet-100"
            )}
          >
            <span className="mt-0.5">
              {t.kind === "success" ? (
                <CheckCircle2 size={18} className="text-positive-600" />
              ) : t.kind === "error" ? (
                <XCircle size={18} className="text-danger-500" />
              ) : (
                <AlertTriangle size={18} className="text-primary" />
              )}
            </span>
            <p className="flex-1 text-[13px] leading-5 text-secondary">{t.message}</p>
            <button
              aria-label="Dismiss"
              onClick={() => remove(t.id)}
              className="text-slate-400 hover:text-secondary"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
