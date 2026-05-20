import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronLeft as Back,
  Clock,
  DollarSign,
  Globe,
  Loader2,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { CircularProgress } from "../components/CircularProgress";
import { getInstructor, listInstructorCourses } from "../api/admin";
import { cn } from "../lib/cn";
import type { AdminInstructorRead, AdminCourseRead } from "../api/types";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function fmtPrice(cents: number, currency = "USD"): string {
  if (!cents) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [data, setData] = useState<AdminInstructorRead | null>(null);
  const [courses, setCourses] = useState<AdminCourseRead[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    getInstructor(id)
      .then(async (d) => {
        if (!mounted) return;
        setData(d);
        // Try to fetch their public courses via slug
        setCoursesLoading(true);
        try {
          const page = await listInstructorCourses(d.slug, { size: 20 });
          if (mounted) setCourses(page.items);
        } catch {
          // courses endpoint may not exist for this instructor
        } finally {
          if (mounted) setCoursesLoading(false);
        }
      })
      .catch(() => { if (mounted) setError("Could not load instructor profile."); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[14px]">Loading instructor profile…</span>
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

  const ratingNum = Number(data.rating_avg);
  const ratingStars = isNaN(ratingNum) ? 0 : Math.round(ratingNum);

  // Progress: completion ratio (students / (courses * typical_capacity))
  // We use rating as a quality proxy (0-5 → 0-100%)
  const ratingPct = isNaN(ratingNum) ? 0 : Math.round((ratingNum / 5) * 100);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => nav("/teachers")}
          className="grid h-9 w-9 place-items-center rounded-lg border border-violet-100 bg-white text-slate-400 hover:text-secondary transition"
        >
          <Back size={18} />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-ink">Instructor Profile</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">Public platform data</p>
        </div>
      </div>

      {/* Profile header card */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <img
            src={data.avatar_url ?? `https://i.pravatar.cc/120?u=${data.id}`}
            alt={data.name}
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />

          {/* Name / title / bio */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-ink">{data.name}</h2>
            {data.title && <p className="mt-0.5 text-[13px] text-slate-500">{data.title}</p>}
            {data.bio && (
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600 line-clamp-2">
                {data.bio}
              </p>
            )}
            {data.expertise && data.expertise.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.expertise.map((tag) => (
                  <span key={tag} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {/* Social links */}
            {(data.linkedin_url || data.twitter_url || data.website_url) && (
              <div className="mt-2 flex items-center gap-3">
                {[
                  { url: data.linkedin_url, label: "LinkedIn" },
                  { url: data.twitter_url, label: "Twitter" },
                  { url: data.website_url, label: "Website" },
                ].filter((l) => l.url).map((l) => (
                  <a
                    key={l.label}
                    href={l.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline"
                  >
                    <Globe size={11} /> {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Key stats */}
          <div className="shrink-0 grid grid-cols-2 gap-3">
            <StatChip icon={<Users size={16} className="text-primary" />} label="Students" value={data.students_count.toLocaleString()} bg="bg-violet-50" />
            <StatChip icon={<BookOpen size={16} className="text-blue-500" />} label="Courses" value={String(data.courses_count)} bg="bg-sky-50" />
            <StatChip
              icon={<Star size={16} className="text-amber-500" />}
              label="Rating"
              value={isNaN(ratingNum) ? "—" : ratingNum.toFixed(1)}
              bg="bg-warn-50"
              sub={isNaN(ratingNum) ? undefined : `${ratingStars}/5 stars`}
            />
            <StatChip
              icon={<DollarSign size={16} className="text-slate-400" />}
              label="Income"
              value="Private"
              bg="bg-slate-50"
              sub="Not in public API"
              muted
            />
          </div>
        </div>
      </div>

      {/* Rating progress visual */}
      {!isNaN(ratingNum) && ratingNum > 0 && (
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-[15px] font-semibold text-ink">Performance Overview</h3>
          <div className="mt-4 grid grid-cols-3 gap-6">
            {/* Rating circle */}
            <div className="flex flex-col items-center gap-2">
              <CircularProgress pct={ratingPct} size={80} strokeWidth={6} />
              <div className="text-center">
                <p className="text-[13px] font-medium text-ink">Rating Score</p>
                <div className="mt-1 flex items-center justify-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={cn(i < ratingStars ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                  ))}
                </div>
              </div>
            </div>

            {/* Students bar */}
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Total Students</span>
                  <span className="font-semibold text-ink">{data.students_count.toLocaleString()}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-violet-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, (data.students_count / Math.max(data.students_count, 1000)) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Courses Published</span>
                  <span className="font-semibold text-ink">{data.courses_count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sky-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min(100, (data.courses_count / Math.max(data.courses_count, 20)) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Avg students / course</span>
                  <span className="font-semibold text-ink">
                    {data.courses_count > 0 ? Math.round(data.students_count / data.courses_count).toLocaleString() : "—"}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-positive-50">
                  <div className="h-full w-1/2 rounded-full bg-positive-500" />
                </div>
              </div>
            </div>

            {/* Info panel */}
            <div className="flex flex-col gap-2 text-[13px]">
              <InfoRow label="Profile slug" value={`/${data.slug}`} mono />
              <InfoRow label="Joined" value={fmtDate(data.created_at)} />
              <InfoRow label="Income" value="Private — not exposed in public API" muted />
            </div>
          </div>
        </div>
      )}

      {/* Courses list */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-ink">
            Published Courses
            {courses.length > 0 && (
              <span className="ml-2 text-[13px] font-normal text-slate-400">{courses.length} course{courses.length !== 1 ? "s" : ""}</span>
            )}
          </h3>
          {coursesLoading && <Loader2 size={14} className="animate-spin text-slate-400" />}
        </div>

        {!coursesLoading && courses.length === 0 && (
          <p className="text-[13px] text-slate-400">
            No published courses found — the public courses endpoint may not be available for this instructor.
          </p>
        )}

        {courses.length > 0 && (
          <div className="space-y-3">
            {courses.map((c) => (
              <CourseRow key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

/* ─── Course row ──────────────────────────────────────────────────── */

function CourseRow({ course }: { course: AdminCourseRead }) {
  const price = fmtPrice(course.discount_price_cents ?? course.price_cents, course.currency);
  const rating = Number(course.rating_avg);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-violet-50 p-3 hover:bg-violet-50/30 transition">
      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-violet-50">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <BookOpen size={18} className="text-violet-300" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-[14px] font-medium text-ink">{course.title}</p>
        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="capitalize">{course.level?.replace("_", " ")}</span>
          <span>·</span>
          <span>{course.lectures_count} lessons</span>
          {course.duration_minutes > 0 && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5">
                <Clock size={10} /> {Math.round(course.duration_minutes / 60)}h
              </span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-6 text-[13px]">
        <div className="flex items-center gap-1 text-amber-500">
          <Star size={13} className="fill-amber-400" />
          <span className="font-medium text-ink">{isNaN(rating) ? "—" : rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Users size={13} />
          <span className="font-medium text-ink">{course.enrollments_count.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp size={13} className="text-positive-600" />
          <span className="font-semibold text-ink">{price}</span>
        </div>
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-medium",
          course.status === "published" ? "bg-positive-50 text-positive-600" : "bg-slate-100 text-slate-500"
        )}>
          {course.status}
        </span>
      </div>
    </div>
  );
}

/* ─── Shared atoms ────────────────────────────────────────────────── */

function StatChip({
  icon, label, value, bg, sub, muted
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  sub?: string;
  muted?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5 rounded-xl border border-violet-50 p-3", bg)}>
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/70">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className={cn("text-[14px] font-bold leading-tight", muted ? "text-slate-400" : "text-ink")}>
          {value}
        </p>
        {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, muted }: { label: string; value: string; mono?: boolean; muted?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className={cn("text-[13px] font-medium", muted ? "text-slate-400 italic" : "text-secondary", mono && "font-mono text-[12px]")}>
        {value}
      </span>
    </div>
  );
}
