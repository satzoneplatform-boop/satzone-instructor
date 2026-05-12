import { Component, type ErrorInfo, type ReactNode } from "react";

type State = { error: Error | null };

/**
 * Top-level error boundary. Catches render-time crashes so the whole app
 * doesn't go white. Logs to the console and renders a friendly fallback
 * with a "reload" affordance.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-violet-50/40 p-6">
          <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center shadow-card">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-danger-50 text-[20px]">
              ⚠️
            </span>
            <h1 className="text-[20px] font-bold text-ink">Something went wrong</h1>
            <p className="text-[13px] text-slate-500">
              The screen ran into an unexpected error. Reload to try again.
            </p>
            <pre className="max-w-full overflow-auto rounded bg-slate-50 p-2 text-left text-[11px] text-slate-500">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-5 py-2 text-[13px] font-medium text-white hover:bg-violet-600"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
