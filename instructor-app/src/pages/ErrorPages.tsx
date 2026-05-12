import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";

/** Centered illustration + heading + body + CTA card used by 404 / generic / maintenance. */
function ErrorCard({
  illustration,
  title,
  body,
  ctaHref = "/",
  ctaLabel = "Back to Home",
}: {
  illustration: React.ReactNode;
  title: string;
  body?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      {illustration}
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-[24px] font-bold text-ink">{title}</h1>
        {body && <p className="text-[14px] text-slate-500">{body}</p>}
      </div>
      <Link
        to={ctaHref}
        className="rounded-lg bg-primary px-6 py-3 text-[14px] font-medium text-white shadow-sm hover:bg-violet-600"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <AppShell>
      <ErrorCard
        title=""
        illustration={<Illus404 />}
      />
    </AppShell>
  );
}

export function GenericErrorPage() {
  return (
    <AppShell>
      <ErrorCard
        title="Oops! Something is wrong."
        body="Can not find what you need? Take a moment and do a search below or start from your Homepage."
        illustration={<IllusError />}
      />
    </AppShell>
  );
}

export function MaintenancePage() {
  return (
    <AppShell>
      <ErrorCard
        title="Oops! Sorry Maintains."
        body="Can not find what you need? Take a moment and do a search below or start from your Homepage."
        illustration={<IllusMaintenance />}
      />
    </AppShell>
  );
}

/* ---------- Inline SVG illustrations (no asset deps) ---------- */

function Illus404() {
  return (
    <svg width="320" height="220" viewBox="0 0 320 220" aria-hidden>
      <text x="40" y="160" fontFamily="Inter, sans-serif" fontSize="160" fontWeight="800" fill="#EF4444">
        4
      </text>
      <text x="220" y="160" fontFamily="Inter, sans-serif" fontSize="160" fontWeight="800" fill="#EF4444">
        4
      </text>
      <g transform="translate(135 36)">
        <rect width="50" height="64" rx="6" fill="#FFFFFF" stroke="#100A55" strokeWidth="2.5" />
        <line x1="10" y1="20" x2="40" y2="20" stroke="#100A55" strokeWidth="2.5" />
        <line x1="10" y1="32" x2="40" y2="32" stroke="#100A55" strokeWidth="2.5" />
        <line x1="10" y1="44" x2="28" y2="44" stroke="#100A55" strokeWidth="2.5" />
      </g>
      <g transform="translate(124 76)">
        <rect x="0" y="20" width="72" height="46" rx="6" fill="#FCDD08" stroke="#100A55" strokeWidth="2.5" />
        <path d="M 0 26 L 36 0 L 72 26 z" fill="#FCDD08" stroke="#100A55" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="56" cy="56" r="10" fill="#FFFFFF" stroke="#8247FF" strokeWidth="2.5" />
        <line x1="63" y1="62" x2="72" y2="70" stroke="#8247FF" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g fill="#8247FF" opacity="0.6">
        <circle cx="20" cy="30" r="3" />
        <circle cx="300" cy="40" r="3" />
        <path d="M 305 90 l 0 8 m -4 -4 l 8 0" stroke="#8247FF" strokeWidth="2" />
        <path d="M 14 110 l 0 8 m -4 -4 l 8 0" stroke="#8247FF" strokeWidth="2" />
      </g>
    </svg>
  );
}

function IllusError() {
  return (
    <svg width="320" height="220" viewBox="0 0 320 220" aria-hidden>
      <text x="20" y="170" fontFamily="Inter, sans-serif" fontSize="170" fontWeight="800" fill="#8247FF">
        4
      </text>
      <text x="220" y="170" fontFamily="Inter, sans-serif" fontSize="170" fontWeight="800" fill="#8247FF">
        4
      </text>
      <g transform="translate(125 30)">
        <circle cx="35" cy="34" r="22" fill="#FDE68A" />
        <rect x="14" y="56" width="42" height="56" rx="14" fill="#8247FF" />
        <rect x="22" y="80" width="26" height="20" rx="2" fill="#FFFFFF" />
        <line x1="27" y1="86" x2="43" y2="86" stroke="#8247FF" strokeWidth="2" />
        <line x1="27" y1="92" x2="43" y2="92" stroke="#8247FF" strokeWidth="2" />
      </g>
      <g transform="translate(40 30)" fill="#FCDD08">
        <circle cx="0" cy="0" r="14" />
        <path d="M -20 30 q 60 -20 100 0 z" fill="#22C55E" opacity="0.55" />
      </g>
    </svg>
  );
}

function IllusMaintenance() {
  return (
    <svg width="320" height="220" viewBox="0 0 320 220" aria-hidden>
      <text x="30" y="180" fontFamily="Inter, sans-serif" fontSize="170" fontWeight="800" fill="#8247FF">
        4
      </text>
      <text x="220" y="180" fontFamily="Inter, sans-serif" fontSize="170" fontWeight="800" fill="#8247FF">
        4
      </text>
      <g transform="translate(130 30)">
        <path d="M 30 0 l 0 30 l -20 12 l 0 60 q 0 16 20 16 q 20 0 20 -16 l 0 -60 l -20 -12 z" fill="#8247FF" stroke="#100A55" strokeWidth="2" />
        <ellipse cx="30" cy="0" rx="14" ry="4" fill="#100A55" />
        <ellipse cx="30" cy="74" rx="20" ry="6" fill="#100A55" opacity="0.7" />
      </g>
      <g transform="translate(40 150)" fill="#8B5CF6">
        <path d="M 0 0 q 60 -16 240 0 v 30 h -240 z" />
        <path d="M 0 12 q 60 -16 240 0" stroke="#FFFFFF" fill="none" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
