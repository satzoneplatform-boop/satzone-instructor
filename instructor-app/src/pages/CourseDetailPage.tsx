import { useEffect, useRef, useState } from "react";
import { Archive, Globe2, Pencil, Plus, Send, Star, Tag, Trash2, Upload, X, Zap } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { AssessmentsPanel } from "../components/AssessmentsPanel";
import { CurriculumEditor } from "../components/CurriculumEditor";
import { HLSPlayer } from "../components/HLSPlayer";
import {
  archiveMyCourse,
  deleteCourseThumbnail,
  deleteCoursePreviewVideo,
  getMyCourse,
  publishMyCourse,
  unpublishMyCourse,
  uploadCoursePreviewVideoWithProgress,
  uploadCourseThumbnailWithProgress,
} from "../api/instructor";
import { CircularProgress } from "../components/CircularProgress";
import { useToast } from "../components/Toast";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { InstructorCourseRead } from "../api/types";
import { cn } from "../lib/cn";

type Tab = "overview" | "curriculum" | "assessments" | "media";

const TAB_HEADINGS: Record<Tab, string> = {
  overview: "Course Overview",
  curriculum: "Curriculum",
  assessments: "Assessments",
  media: "Media",
};

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user } = useAuth();
  const { notify } = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [course, setCourse] = useState<InstructorCourseRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [thumbPct, setThumbPct] = useState<number | null>(null);
  const [videoPct, setVideoPct] = useState<number | null>(null);
  const thumbAbort = useRef<AbortController | null>(null);
  const videoAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    getMyCourse(id)
      .then((c) => mounted && setCourse(c))
      .catch((e) => mounted && setError(e instanceof ApiError ? e.message : "Could not load."))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);


  async function onArchive() {
    if (!course) return;
    if (!window.confirm(`Archive "${course.title}"? It will be hidden from new students.`)) return;
    setBusy(true);
    try {
      const next = await archiveMyCourse(course.id);
      setCourse(next);
      notify("Course archived.", "success");
    } catch (e) {
      notify(e instanceof ApiError ? e.message : "Could not archive.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onTogglePublish() {
    if (!course) return;
    setBusy(true);
    try {
      const next =
        course.status === "published"
          ? await unpublishMyCourse(course.id)
          : await publishMyCourse(course.id);
      setCourse(next);
      notify(next.status === "published" ? "Published." : "Unpublished.", "success");
    } catch (e) {
      notify(e instanceof ApiError ? e.message : "Could not change status.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onThumbnail(file: File) {
    if (!course) return;
    const controller = new AbortController();
    thumbAbort.current = controller;
    setThumbPct(0);
    try {
      await uploadCourseThumbnailWithProgress(course.id, file, setThumbPct, controller.signal);
      const fresh = await getMyCourse(course.id);
      setCourse(fresh);
      notify("Thumbnail updated.", "success");
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        notify(e instanceof ApiError ? e.message : "Upload failed.", "error");
    } finally {
      thumbAbort.current = null;
      setThumbPct(null);
    }
  }

  async function onPreviewVideo(file: File) {
    if (!course) return;
    const controller = new AbortController();
    videoAbort.current = controller;
    setVideoPct(0);
    try {
      await uploadCoursePreviewVideoWithProgress(course.id, file, setVideoPct, controller.signal);
      const fresh = await getMyCourse(course.id);
      setCourse(fresh);
      notify("Preview video uploaded.", "success");
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        notify(e instanceof ApiError ? e.message : "Upload failed.", "error");
    } finally {
      videoAbort.current = null;
      setVideoPct(null);
    }
  }

  async function onDeleteThumbnail() {
    if (!course) return;
    try {
      await deleteCourseThumbnail(course.id);
      const fresh = await getMyCourse(course.id);
      setCourse(fresh);
      notify("Thumbnail removed.", "success");
    } catch (e) {
      notify(e instanceof ApiError ? e.message : "Could not delete.", "error");
    }
  }

  async function onDeletePreviewVideo() {
    if (!course) return;
    try {
      await deleteCoursePreviewVideo(course.id);
      const fresh = await getMyCourse(course.id);
      setCourse(fresh);
      notify("Preview video removed.", "success");
    } catch (e) {
      notify(e instanceof ApiError ? e.message : "Could not delete.", "error");
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p className="text-[14px] text-slate-500">Loading…</p>
      </AppShell>
    );
  }

  if (error || !course) {
    return (
      <AppShell>
        <div className="rounded-lg bg-danger-50 p-4 text-[13px] text-danger-500">
          {error ?? "Course not found."}
        </div>
      </AppShell>
    );
  }

  const instructorName = user?.full_name ?? "—";
  const instructorAvatar = user?.avatar_url ?? `https://i.pravatar.cc/80?u=${user?.id ?? "me"}`;
  const thumb = course.thumbnail_url ?? "https://picsum.photos/seed/course-cover/960/360";

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-ink">{TAB_HEADINGS[tab]}</h1>
          <p className="mt-1 text-[14px] text-slate-600">{course.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav(`/courses/${course.id}/practice`)}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary"
          >
            <Zap size={14} /> Practice quizzes
          </button>
          <button
            type="button"
            onClick={() => nav(`/courses/${course.id}/edit`)}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary"
          >
            <Pencil size={14} /> Edit details
          </button>
          {course.status !== "archived" && (
            <button
              type="button"
              disabled={busy}
              onClick={onTogglePublish}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium text-white disabled:opacity-60",
                course.status === "published" ? "bg-amber-500 hover:bg-amber-600" : "bg-positive-600 hover:bg-positive-500"
              )}
            >
              {course.status === "published" ? "Unpublish" : "Publish"}
            </button>
          )}
          {course.status !== "archived" && (
            <button
              type="button"
              disabled={busy}
              onClick={onArchive}
              className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2.5 text-[14px] font-medium text-amber-600 hover:bg-amber-50 disabled:opacity-60"
            >
              <Archive size={14} /> Archive
            </button>
          )}
          <button
            type="button"
            onClick={() => nav("/courses")}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 py-2.5 text-[14px] font-medium text-secondary"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="relative overflow-hidden rounded-xl bg-black">
            {course.has_preview_video ? (
              <HLSPlayer source={{ kind: "preview", slug: course.slug }} posterUrl={course.thumbnail_url ?? undefined} />
            ) : (
              <img src={thumb} alt={course.title} className="h-[360px] w-full object-cover" />
            )}
          </div>

          <h2 className="mt-5 text-[20px] font-semibold text-ink">{course.title}</h2>
          {course.subtitle && <p className="mt-1 text-[14px] text-slate-600">{course.subtitle}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <img src={instructorAvatar} alt={instructorName} className="h-7 w-7 rounded-full object-cover" />
              <span className="text-[13px] font-medium text-secondary">{instructorName}</span>
              <span className="text-[11px] text-slate-400">Instructor</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[13px] text-secondary">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="font-medium">{Number(course.rating_avg).toFixed(1)}</span>
              <span className="text-slate-400">({course.ratings_count} reviews)</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[13px] text-secondary">
              <Globe2 size={14} className="text-slate-400" /> {course.language.toUpperCase()}
            </span>
            <StatusPill status={course.status} />
          </div>

          <nav className="mt-5 flex items-center gap-6 border-b border-violet-100">
            {(["overview", "curriculum", "assessments", "media"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "relative pb-3 text-[13px] font-medium capitalize transition",
                  tab === t ? "text-primary" : "text-slate-500 hover:text-secondary"
                )}
              >
                {t}
                {tab === t && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-5">
            {tab === "overview" && <OverviewPanel course={course} />}
            {tab === "curriculum" && <CurriculumEditor courseId={course.id} />}
            {tab === "assessments" && <AssessmentsPanel courseId={course.id} />}
            {tab === "media" && (
              <MediaPanel
                course={course}
                onThumbnail={onThumbnail}
                onPreviewVideo={onPreviewVideo}
                onDeleteThumbnail={onDeleteThumbnail}
                onDeletePreviewVideo={onDeletePreviewVideo}
                thumbPct={thumbPct}
                videoPct={videoPct}
                onCancelThumb={() => thumbAbort.current?.abort()}
                onCancelVideo={() => videoAbort.current?.abort()}
              />
            )}
          </div>
        </section>

        <CourseSidePanel course={course} />
      </div>
    </AppShell>
  );
}

function OverviewPanel({ course }: { course: InstructorCourseRead }) {
  return (
    <div className="space-y-4 text-[14px] leading-6 text-secondary">
      {course.description ? (
        <p>{course.description}</p>
      ) : (
        <p className="text-slate-400">No description yet — add one in Edit details.</p>
      )}

      {course.learning_outcomes && course.learning_outcomes.length > 0 && (
        <BulletList title="What you'll learn" items={course.learning_outcomes} />
      )}
      {course.requirements && course.requirements.length > 0 && (
        <BulletList title="Requirements" items={course.requirements} />
      )}
      {course.target_audience && course.target_audience.length > 0 && (
        <BulletList title="Who should enroll" items={course.target_audience} />
      )}
      {course.tags && course.tags.length > 0 && (
        <div>
          <h3 className="text-[14px] font-semibold text-ink">Tags</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {course.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-[12px] text-primary">
                <Tag size={12} /> {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
      <ul className="mt-2 space-y-1">
        {items.map((s, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MediaPanel({
  course,
  onThumbnail,
  onPreviewVideo,
  onDeleteThumbnail,
  onDeletePreviewVideo,
  thumbPct,
  videoPct,
  onCancelThumb,
  onCancelVideo,
}: {
  course: InstructorCourseRead;
  onThumbnail: (f: File) => void;
  onPreviewVideo: (f: File) => void;
  onDeleteThumbnail: () => void;
  onDeletePreviewVideo: () => void;
  thumbPct: number | null;
  videoPct: number | null;
  onCancelThumb: () => void;
  onCancelVideo: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Thumbnail */}
      <div className="rounded-xl border border-violet-100 p-4">
        <h3 className="text-[14px] font-semibold text-ink">Thumbnail</h3>
        <div className="relative mt-3 overflow-hidden rounded-lg bg-violet-50/50">
          {course.thumbnail_url ? (
            <img src={course.thumbnail_url} alt="" className="h-[160px] w-full object-cover" />
          ) : (
            <div className="grid h-[160px] place-items-center text-[13px] text-slate-400">No image</div>
          )}
          {thumbPct !== null && (
            <div className="absolute inset-0 grid place-items-center bg-black/45 rounded-lg">
              <CircularProgress pct={thumbPct} size={72} strokeWidth={5} trackColor="rgba(255,255,255,0.25)" progressColor="#fff" />
            </div>
          )}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Max 5 MB · JPG, PNG, WebP</p>
        <div className="mt-2 flex items-center gap-2">
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-md bg-violet-50 px-3 py-2 text-[13px] font-medium text-primary hover:bg-violet-100 ${thumbPct !== null ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload size={14} /> {thumbPct !== null ? `${thumbPct}%…` : course.thumbnail_url ? "Replace" : "Upload image"}
            <input type="file" accept="image/*" hidden disabled={thumbPct !== null}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onThumbnail(f); e.target.value = ""; }}
            />
          </label>
          {thumbPct !== null && (
            <button type="button" onClick={onCancelThumb}
              className="inline-flex items-center gap-1.5 rounded-md border border-danger-200 px-3 py-2 text-[13px] font-medium text-danger-500 hover:bg-danger-50">
              <X size={13} /> Cancel
            </button>
          )}
          {course.thumbnail_url && thumbPct === null && (
            <button type="button" onClick={onDeleteThumbnail}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium text-danger-500 hover:bg-danger-50">
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Preview video */}
      <div className="rounded-xl border border-violet-100 p-4">
        <h3 className="text-[14px] font-semibold text-ink">Preview video</h3>
        <div className="relative mt-3 overflow-hidden rounded-lg">
          {course.has_preview_video ? (
            <HLSPlayer
              source={{ kind: "preview", slug: course.slug }}
              posterUrl={course.thumbnail_url ?? undefined}
            />
          ) : (
            <div className="grid h-[160px] place-items-center rounded-lg bg-violet-50/50 text-[13px] text-slate-400">
              No preview video
            </div>
          )}
          {videoPct !== null && (
            <div className="absolute inset-0 grid place-items-center bg-black/45 rounded-lg">
              <CircularProgress pct={videoPct} size={72} strokeWidth={5} trackColor="rgba(255,255,255,0.25)" progressColor="#fff" />
            </div>
          )}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Max 50 MB · MP4, MOV, AVI</p>
        <div className="mt-2 flex items-center gap-2">
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-md bg-violet-50 px-3 py-2 text-[13px] font-medium text-primary hover:bg-violet-100 ${videoPct !== null ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload size={14} /> {videoPct !== null ? `${videoPct}%…` : course.has_preview_video ? "Replace" : "Upload video"}
            <input type="file" accept="video/*" hidden disabled={videoPct !== null}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onPreviewVideo(f); e.target.value = ""; }}
            />
          </label>
          {videoPct !== null && (
            <button type="button" onClick={onCancelVideo}
              className="inline-flex items-center gap-1.5 rounded-md border border-danger-200 px-3 py-2 text-[13px] font-medium text-danger-500 hover:bg-danger-50">
              <X size={13} /> Cancel
            </button>
          )}
          {course.has_preview_video && videoPct === null && (
            <button type="button" onClick={onDeletePreviewVideo}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium text-danger-500 hover:bg-danger-50">
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseSidePanel({ course }: { course: InstructorCourseRead }) {
  return (
    <aside className="space-y-4">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-[15px] font-semibold text-ink">At a glance</h3>
        <dl className="mt-3 divide-y divide-violet-50 text-[13px]">
          <Row label="Enrollments" value={String(course.enrollments_count)} />
          <Row label="Lessons" value={String(course.lectures_count)} />
          <Row label="Duration" value={`${course.duration_minutes} min`} />
          <Row label="Level" value={course.level} />
          <Row label="Price" value={formatPrice(course)} />
          <Row label="Status" value={course.status} />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-ink">Quick links</h3>
        </div>
        <ul className="mt-3 space-y-2 text-[13px]">
          <li>
            <a
              className="inline-flex items-center gap-1 text-primary hover:underline"
              href={`/courses/${course.id}/edit`}
            >
              <Pencil size={12} /> Edit details
            </a>
          </li>
          <li className="text-slate-500">
            <Plus size={12} className="mr-1 inline" /> Use the Assessments tab to build quizzes
          </li>
          <li className="text-slate-400">
            <Send size={12} className="mr-1 inline" /> Share preview link after publish
          </li>
        </ul>
      </section>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-secondary">{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: InstructorCourseRead["status"] }) {
  const map: Record<InstructorCourseRead["status"], { bg: string; text: string; label: string }> = {
    published: { bg: "bg-positive-50", text: "text-positive-600", label: "Published" },
    draft:     { bg: "bg-warn-50",     text: "text-amber-600",   label: "Draft" },
    archived:  { bg: "bg-slate-100",   text: "text-slate-500",   label: "Archived" },
  };
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[11px] font-medium", m.bg, m.text)}>
      {m.label}
    </span>
  );
}

function formatPrice(c: InstructorCourseRead): string {
  const cents = c.discount_price_cents ?? c.price_cents;
  if (!cents) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c.currency }).format(cents / 100);
}
