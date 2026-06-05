import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronLeft as Back,
  Clock,
  FileText,
  Loader2,
  Paperclip,
  Video,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { CircularProgress } from "../components/CircularProgress";
import { getUser, listEnrollments } from "../api/users";
import { listSections, listLessons, listCourseAssessments } from "../api/instructor";
import { cn } from "../lib/cn";
import type { AdminUserRead, AdminEnrollmentRead, SectionAdminRead, LessonAdminRead, AssessmentInstructorRead, LessonType } from "../api/types";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function fmtRelative(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return fmtDate(iso);
}

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const LESSON_ICON: Record<LessonType, React.ComponentType<{ size?: number; className?: string }>> = {
  video:    Video,
  article:  FileText,
  resource: Paperclip,
  quiz:     BookOpen,
};

/* ─── Course progress card ─────────────────────────────────────────── */

type CourseData = {
  sections: (SectionAdminRead & { lessons: LessonAdminRead[] })[];
  assessments: AssessmentInstructorRead[];
  loaded: boolean;
};

function CourseCard({ enrollment }: { enrollment: AdminEnrollmentRead }) {
  const [expanded, setExpanded] = useState(false);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const c = enrollment.course;
  const pct = Math.round(enrollment.progress_percent);
  const isCompleted = enrollment.completed_at !== null;

  async function loadDetail() {
    if (courseData || !c) return;
    setLoadingDetail(true);
    try {
      const [secs, assessments] = await Promise.all([
        (async () => {
          const raw = await listSections(c.id);
          return Promise.all(
            raw.map(async (s) => {
              const lessons = await listLessons(s.id).catch(() => [] as LessonAdminRead[]);
              return { ...s, lessons };
            })
          );
        })(),
        listCourseAssessments(c.id, { size: 20 })
          .then((p) => p.items)
          .catch(() => [] as AssessmentInstructorRead[]),
      ]);
      setCourseData({ sections: secs, assessments, loaded: true });
    } catch {
      setCourseData({ sections: [], assessments: [], loaded: false });
    } finally {
      setLoadingDetail(false);
    }
  }

  function toggle() {
    setExpanded((v) => !v);
    if (!courseData) loadDetail();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex items-start gap-5 p-5">
        {/* Thumbnail */}
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-violet-50">
          {c?.thumbnail_url ? (
            <img src={c.thumbnail_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <BookOpen size={24} className="text-violet-300" />
            </div>
          )}
        </div>

        {/* Course info */}
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-ink">
              {c?.title ?? "Untitled course"}
            </h3>
            <span className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
              isCompleted ? "bg-positive-50 text-positive-600" : "bg-violet-50 text-primary"
            )}>
              {isCompleted ? "Completed" : "In Progress"}
            </span>
          </div>

          <span className="text-[12px] capitalize text-slate-500">
            {c?.level?.replace("_", " ") ?? "—"}
          </span>

          <div className="mt-2 grid grid-cols-3 gap-3 text-[12px] text-slate-500">
            <div>
              <p className="font-medium text-ink">Enrolled</p>
              <p>{fmtDate(enrollment.enrolled_at)}</p>
            </div>
            <div>
              <p className="font-medium text-ink">Last Active</p>
              <p>{fmtRelative(enrollment.last_accessed_at)}</p>
            </div>
            <div>
              <p className="font-medium text-ink">Completed</p>
              <p>{enrollment.completed_at ? fmtDate(enrollment.completed_at) : "—"}</p>
            </div>
          </div>
        </div>

        {/* Progress circle */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <CircularProgress pct={pct} size={72} strokeWidth={5} />
          <span className="text-[11px] text-slate-400">Progress</span>
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={toggle}
          className="shrink-0 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-violet-50 transition"
          title={expanded ? "Collapse" : "View course details"}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-violet-50 bg-slate-50/50 px-5 py-4 space-y-5">
          {loadingDetail && (
            <div className="flex items-center gap-2 text-[13px] text-slate-400">
              <Loader2 size={14} className="animate-spin" /> Loading course details…
            </div>
          )}

          {courseData && (
            <>
              {/* Course structure */}
              {courseData.sections.length > 0 && (
                <div>
                  <h4 className="mb-2 text-[13px] font-semibold text-ink">
                    Course Structure
                    <span className="ml-2 text-[11px] font-normal text-slate-400">
                      {courseData.sections.length} section{courseData.sections.length !== 1 ? "s" : ""} ·{" "}
                      {courseData.sections.reduce((n, s) => n + s.lessons.length, 0)} lessons
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {courseData.sections.map((sec, i) => (
                      <SectionRow key={sec.id} section={sec} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Assessments */}
              {courseData.assessments.length > 0 && (
                <div>
                  <h4 className="mb-2 text-[13px] font-semibold text-ink">
                    Assessments
                    <span className="ml-2 text-[11px] font-normal text-slate-400">
                      {courseData.assessments.length} quiz{courseData.assessments.length !== 1 ? "zes" : ""}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {courseData.assessments.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 rounded-lg border border-violet-100 bg-white px-3 py-2.5">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-warn-50">
                          <BookOpen size={14} className="text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[13px] font-medium text-ink">{a.title}</p>
                          <p className="text-[11px] text-slate-400">
                            {a.questions.length} question{a.questions.length !== 1 ? "s" : ""}
                            {a.pass_percent > 0 && ` · Pass: ${a.pass_percent}%`}
                            {a.time_limit_minutes && ` · ${a.time_limit_minutes} min`}
                          </p>
                        </div>
                        <span className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          a.status === "published" ? "bg-positive-50 text-positive-600" : "bg-slate-100 text-slate-500"
                        )}>
                          {a.status === "published" ? "Active" : a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 italic">
                    Individual student quiz scores are not available via the instructor API.
                  </p>
                </div>
              )}

              {courseData.loaded && courseData.sections.length === 0 && courseData.assessments.length === 0 && (
                <p className="text-[13px] text-slate-400">No sections or assessments in this course yet.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SectionRow({ section, index }: { section: SectionAdminRead & { lessons: LessonAdminRead[] }; index: number }) {
  const [open, setOpen] = useState(false);
  const totalSecs = section.lessons.reduce((n, l) => n + (l.duration_seconds || 0), 0);

  return (
    <div className="rounded-lg border border-violet-100 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-violet-50/60 transition"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-primary/10 text-[11px] font-bold text-primary">
          {index + 1}
        </span>
        <span className="flex-1 text-[13px] font-medium text-ink">{section.title}</span>
        <span className="text-[11px] text-slate-400">
          {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
          {totalSecs > 0 && ` · ${Math.round(totalSecs / 60)} min`}
        </span>
        {open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
      </button>

      {open && (
        <ul className="border-t border-violet-50 divide-y divide-violet-50">
          {section.lessons.map((l) => {
            const Icon = LESSON_ICON[l.type] ?? Video;
            return (
              <li key={l.id} className="flex items-center gap-2.5 px-4 py-2">
                <Icon size={13} className="shrink-0 text-slate-400" />
                <span className="flex-1 text-[12px] text-secondary truncate">{l.title}</span>
                {l.duration_seconds > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock size={10} /> {fmtDuration(l.duration_seconds)}
                  </span>
                )}
                {l.is_free_preview && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Free</span>
                )}
                {l.type === "video" && (
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    l.hls_status === "ready" ? "bg-positive-50 text-positive-600" :
                    l.hls_status === "pending" ? "bg-warn-50 text-amber-600" :
                    l.has_video ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-400"
                  )}>
                    {l.hls_status === "ready" ? "Ready" : l.hls_status === "pending" ? "Encoding" : l.has_video ? "Uploaded" : "No video"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────────── */

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [student, setStudent] = useState<AdminUserRead | null>(null);
  const [enrollments, setEnrollments] = useState<AdminEnrollmentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.allSettled([
      getUser(id),
      listEnrollments({ user_id: id, size: 100 }),
    ]).then(([userRes, enrollRes]) => {
      if (!mounted) return;
      if (userRes.status === "fulfilled") setStudent(userRes.value);
      else setError("Student not found in your courses.");
      if (enrollRes.status === "fulfilled") setEnrollments(enrollRes.value.items);
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.progress_percent, 0) / enrollments.length)
    : 0;

  const lastActive = enrollments.reduce((latest, e) => {
    if (!e.last_accessed_at) return latest;
    return !latest || new Date(e.last_accessed_at) > new Date(latest) ? e.last_accessed_at : latest;
  }, null as string | null);

  const completed = enrollments.filter((e) => e.completed_at !== null).length;

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[14px]">Loading student data…</span>
        </div>
      </AppShell>
    );
  }

  if (error || !student) {
    return (
      <AppShell>
        <div className="rounded-lg bg-danger-50 p-4 text-[13px] text-danger-500">
          {error ?? "Student not found."}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => nav("/students")}
          className="grid h-9 w-9 place-items-center rounded-lg border border-violet-100 bg-white text-slate-400 hover:text-secondary transition"
        >
          <Back size={18} />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-ink">Student Profile</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">Viewing progress across your courses</p>
        </div>
      </div>

      {/* Student info card */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <img
            src={student.avatar_url ?? `https://i.pravatar.cc/120?u=${student.id}`}
            alt={student.full_name}
            className="h-20 w-20 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-ink">{student.full_name}</h2>
            <p className="mt-0.5 text-[13px] text-slate-500">{student.email}</p>
            <p className="mt-1 text-[12px] text-slate-400">
              Last active: <span className="font-medium text-secondary">{fmtRelative(lastActive)}</span>
            </p>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-6 shrink-0">
            {[
              { label: "Courses", value: String(enrollments.length) },
              { label: "Completed", value: String(completed) },
              { label: "Avg Progress", value: `${avgProgress}%` },
              { label: "Status", value: student.is_active ? "Active" : "Inactive" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 rounded-xl bg-violet-50/50 px-4 py-3">
                <span className="text-[18px] font-bold text-ink">{s.value}</span>
                <span className="text-[11px] text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course progress list */}
      {enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-violet-200 py-12 text-center text-[14px] text-slate-400">
          This student has not enrolled in any of your courses.
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-[16px] font-semibold text-ink">
            Course Progress
            <span className="ml-2 text-[13px] font-normal text-slate-400">
              {enrollments.length} course{enrollments.length !== 1 ? "s" : ""}
            </span>
          </h2>
          {enrollments.map((e) => (
            <CourseCard key={e.id} enrollment={e} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
