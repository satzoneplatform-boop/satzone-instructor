import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/cn";

const SLIDES = [
  {
    headline: "Learn at Your Fingertips:\nStart Explor UStudy Now!",
    body: "Seize the moment and help shape the future by starting a career in blockchain now",
    illustration: "fingertips",
  },
  {
    headline: "Unlock Knowledge On-the-\nGo UStudy",
    body: "Seize the moment and help shape the future by starting a career in blockchain now",
    illustration: "knowledge",
  },
  {
    headline: "Transform your Phone into\na Classroom",
    body: "Seize the moment and help shape the future by starting a career in blockchain now",
    illustration: "phone",
  },
] as const;

/**
 * Two-pane auth shell shared by Sign In / Sign Up / Forgot / Reset / Verify.
 * Left pane rotates through marketing illustrations; right pane hosts the form.
 */
export function AuthLayout({
  children,
  slide = 0,
}: {
  children: React.ReactNode;
  slide?: number;
}) {
  const [active, setActive] = useState(slide);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setActive(slide), [slide]);

  const current = SLIDES[active % SLIDES.length];

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white md:grid-cols-2">
      {/* Left pane */}
      <aside className="hidden flex-col items-center justify-center gap-8 bg-violet-50/40 p-12 text-center md:flex">
        <Illustration name={current.illustration} />
        <div className="flex flex-col gap-3">
          <h2 className="whitespace-pre-line text-[28px] font-bold leading-tight text-ink">
            {current.headline}
          </h2>
          <p className="mx-auto max-w-md text-[14px] text-slate-500">{current.body}</p>
        </div>
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-2 rounded-full transition",
                active === i ? "w-6 bg-primary" : "w-2 bg-violet-200 hover:bg-violet-300"
              )}
            />
          ))}
        </div>
      </aside>

      {/* Right pane */}
      <main className="flex flex-col">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <Footer />
      </main>
    </div>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col items-center gap-2 px-6 py-6 text-[12px] text-slate-500">
      <nav className="flex items-center gap-6">
        <Link to="#" className="hover:text-secondary">Terms & Condition</Link>
        <Link to="#" className="hover:text-secondary">Privacy Policy</Link>
        <Link to="#" className="hover:text-secondary">Help</Link>
        <button className="hover:text-secondary">English ▾</button>
      </nav>
      <span>@ {new Date().getFullYear()} UStudy. All Right Reserved.</span>
    </footer>
  );
}

/** Lightweight inline SVG illustrations (no external assets). */
function Illustration({ name }: { name: string }) {
  // Common backdrop — soft violet circle with the StudyQ "S" badge.
  return (
    <div className="relative grid h-[360px] w-[420px] place-items-center">
      <div className="absolute inset-0 rounded-[40%] bg-gradient-to-br from-violet-100/60 to-violet-200/30 blur-2xl" />
      <svg width="320" height="280" viewBox="0 0 320 280" className="relative" aria-hidden>
        {/* Plant left */}
        <g transform="translate(8 200)">
          <ellipse cx="20" cy="60" rx="20" ry="6" fill="#E2E8F0" />
          <rect x="6" y="40" width="28" height="22" rx="3" fill="#94A3B8" />
          <path d="M20 40 C 12 24, 6 14, 4 4 C 14 8, 22 18, 24 30 z" fill="#A78BFA" />
          <path d="M20 42 C 26 30, 32 22, 38 14 C 40 28, 32 36, 26 40 z" fill="#C4B5FD" />
        </g>
        {/* Center character with monitor */}
        <g transform="translate(80 80)">
          <rect x="20" y="100" width="120" height="14" rx="2" fill="#E2E8F0" />
          <rect x="40" y="40" width="80" height="60" rx="6" fill="#CBD5E1" />
          <rect x="46" y="46" width="68" height="48" rx="3" fill="#F1F5F9" />
          <circle cx="80" cy="34" r="22" fill="#FDE68A" />
          <rect x="62" y="50" width="36" height="46" rx="14" fill="#8247FF" />
          <circle cx="74" cy="32" r="3" fill="#28303F" />
          <circle cx="86" cy="32" r="3" fill="#28303F" />
        </g>
        {/* Speech bubble */}
        <g transform="translate(190 30)" opacity="0.9">
          <rect x="0" y="0" width="60" height="34" rx="8" fill="#8B5CF6" />
          <circle cx="14" cy="17" r="3" fill="#F5F3FF" />
          <circle cx="26" cy="17" r="3" fill="#F5F3FF" />
          <circle cx="38" cy="17" r="3" fill="#F5F3FF" />
          <path d="M30 34 L 24 44 L 42 34 z" fill="#8B5CF6" />
        </g>
        {/* Floating window */}
        <g transform="translate(220 90)" opacity={name === "knowledge" ? 0.4 : 0.9}>
          <rect x="0" y="0" width="80" height="60" rx="6" fill="#FFFFFF" stroke="#E2E8F0" />
          <circle cx="12" cy="12" r="3" fill="#EF4444" />
          <circle cx="22" cy="12" r="3" fill="#FCDD08" />
          <circle cx="32" cy="12" r="3" fill="#22C55E" />
          <rect x="8" y="24" width="64" height="6" rx="2" fill="#F1F5F9" />
          <rect x="8" y="36" width="48" height="6" rx="2" fill="#F1F5F9" />
        </g>
      </svg>
    </div>
  );
}
