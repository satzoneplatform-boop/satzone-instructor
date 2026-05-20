import { useEffect, useState } from "react";
import {
  Globe,
  Mail,
  Star,
  Trophy,
  Users,
  BookOpen,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { getInstructor } from "../api/admin";
import { cn } from "../lib/cn";
import type { AdminInstructorRead } from "../api/types";

export function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [data, setData] = useState<AdminInstructorRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    getInstructor(id)
      .then((d) => { if (mounted) setData(d); })
      .catch(() => { if (mounted) setError("Could not load instructor profile."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="grid grid-cols-[420px_1fr] gap-6">
          <div className="h-[500px] animate-pulse rounded-2xl bg-white shadow-sm" />
          <div className="h-[500px] animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="rounded-lg bg-danger-50 p-4 text-[13px] text-danger-500">
          {error ?? "Instructor not found."}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-ink">{data.name}</h1>
          <p className="mt-1 text-[14px] text-slate-600">{data.title ?? "Instructor"}</p>
        </div>
        <button
          type="button"
          onClick={() => nav("/teachers")}
          className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary"
        >
          <X size={16} /> Back
        </button>
      </div>

      <div className="grid grid-cols-[420px_1fr] gap-6">
        <ProfileCard data={data} />
        <StatsAndBioCard data={data} />
      </div>
    </AppShell>
  );
}

function ProfileCard({ data }: { data: AdminInstructorRead }) {
  const ratingNum = Number(data.rating_avg);
  const joined = new Date(data.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <img
          src={data.avatar_url ?? `https://i.pravatar.cc/240?u=${data.id}`}
          alt={data.name}
          className="h-[120px] w-[120px] rounded-full object-cover"
        />
        <h2 className="mt-4 text-[18px] font-semibold text-ink">{data.name}</h2>
        {data.title && (
          <span className="mt-1 text-[13px] text-slate-600">{data.title}</span>
        )}

        <div className="mt-5 grid w-full grid-cols-3 divide-x divide-violet-50 rounded-xl bg-violet-50/40 py-3">
          <Stat label="Students" value={data.students_count.toLocaleString()} />
          <Stat label="Courses"  value={String(data.courses_count)} />
          <Stat label="Rating"   value={isNaN(ratingNum) ? "—" : ratingNum.toFixed(1)} />
        </div>
      </div>

      {/* Bio / expertise */}
      {data.bio || (data.expertise && data.expertise.length > 0) ? (
        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-ink">About</h3>
          {data.bio && (
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{data.bio}</p>
          )}
          {data.expertise && data.expertise.length > 0 && (
            <ul className="mt-2 space-y-1 text-[13px] text-slate-600">
              {data.expertise.map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {/* Social links — only show what the API actually returns */}
      {(data.linkedin_url || data.twitter_url || data.website_url) && (
        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-ink">Links</h3>
          <div className="mt-2 flex flex-col gap-2 text-[13px]">
            {data.linkedin_url && (
              <a
                href={data.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-primary"
              >
                <Globe size={14} className="text-slate-400" />
                LinkedIn
              </a>
            )}
            {data.twitter_url && (
              <a
                href={data.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-primary"
              >
                <Globe size={14} className="text-slate-400" />
                Twitter / X
              </a>
            )}
            {data.website_url && (
              <a
                href={data.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-primary"
              >
                <Globe size={14} className="text-slate-400" />
                Website
              </a>
            )}
          </div>
        </div>
      )}

      {/* Joined */}
      <div className="mt-6 border-t border-violet-50 pt-4">
        <p className="text-[12px] text-slate-400">
          Joined <span className="font-medium text-secondary">{joined}</span>
        </p>
      </div>
    </section>
  );
}

function StatsAndBioCard({ data }: { data: AdminInstructorRead }) {
  const ratingNum = Number(data.rating_avg);
  const stars = isNaN(ratingNum) ? 0 : Math.round(ratingNum);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-[18px] font-semibold text-ink">Instructor Overview</h2>
      <p className="mt-1 text-[13px] text-slate-500">
        Public profile data from the platform catalog
      </p>

      {/* Metric cards */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <MetricCard
          icon={<Users size={20} className="text-primary" />}
          label="Total Students"
          value={data.students_count.toLocaleString()}
          bg="bg-violet-50"
        />
        <MetricCard
          icon={<BookOpen size={20} className="text-blue-500" />}
          label="Courses Published"
          value={String(data.courses_count)}
          bg="bg-sky-50"
        />
        <MetricCard
          icon={<Star size={20} className="text-amber-500" />}
          label="Average Rating"
          value={isNaN(ratingNum) ? "—" : ratingNum.toFixed(2)}
          bg="bg-warn-50"
        />
        <MetricCard
          icon={<Trophy size={20} className="text-positive-600" />}
          label="Platform Profile"
          value={`/${data.slug}`}
          bg="bg-positive-50"
          mono
        />
      </div>

      {/* Star rating display */}
      {!isNaN(ratingNum) && ratingNum > 0 && (
        <div className="mt-6">
          <h3 className="text-[14px] font-semibold text-ink">Rating Breakdown</h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[40px] font-bold leading-none text-ink">
              {ratingNum.toFixed(1)}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={cn(
                      i < stars ? "fill-amber-400 text-amber-400" : "text-slate-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-[12px] text-slate-500">Instructor rating</span>
            </div>
          </div>
        </div>
      )}

      {/* Contact via email placeholder */}
      <div className="mt-6 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100">
            <Mail size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-secondary">
              Contact this instructor
            </p>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Email and contact details are private. Use the platform messaging
              system or instructor's public social links to get in touch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[16px] font-bold text-ink">{value}</span>
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  bg,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-violet-50 p-4">
      <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", bg)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-slate-500">{label}</p>
        <p className={cn("truncate text-[15px] font-semibold text-ink", mono && "font-mono text-[13px]")}>
          {value}
        </p>
      </div>
    </div>
  );
}
