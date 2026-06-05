import { useEffect, useState } from "react";
import { BookOpen, Eye, Pencil, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { CurriculumEditor } from "../components/CurriculumEditor";
import { getMyCourse } from "../api/instructor";
import { ApiError } from "../api/client";
import type { InstructorCourseRead } from "../api/types";
import { cn } from "../lib/cn";

export function CourseContentPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [course, setCourse] = useState<InstructorCourseRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getMyCourse(id)
      .then((c) => mounted && setCourse(c))
      .catch((e) => mounted && setError(e instanceof ApiError ? e.message : "Could not load course."))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

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

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-ink">Course Content</h1>
          <p className="mt-1 text-[14px] text-slate-600">{course.title}</p>
          <p className="mt-0.5 text-[12px] text-slate-400">
            Add sections and lessons to build your curriculum. Drag &amp; drop video files directly onto a section.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav(`/courses/${course.id}/edit`)}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary hover:bg-violet-50"
          >
            <Pencil size={14} /> Edit details
          </button>
          <button
            type="button"
            onClick={() => nav(`/courses/${course.id}`)}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary hover:bg-violet-50"
          >
            <Eye size={14} /> View course
          </button>
          <StatusPill status={course.status} />
          <button
            type="button"
            onClick={() => nav("/courses")}
            className="grid h-10 w-10 place-items-center rounded-lg border border-violet-100 bg-white text-secondary hover:bg-violet-50"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Curriculum workspace */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          <h2 className="text-[16px] font-semibold text-ink">Curriculum</h2>
        </div>
        <CurriculumEditor courseId={course.id} />

        <div className="mt-8 flex items-center justify-between border-t border-violet-100 pt-5">
          <p className="text-[13px] text-slate-400">Changes are saved automatically as you add sections and lessons.</p>
          <button
            type="button"
            onClick={() => nav(`/courses/${course.id}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[14px] font-medium text-white hover:bg-violet-600"
          >
            Done — Go to course
          </button>
        </div>
      </div>
    </AppShell>
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
    <span className={cn("inline-flex items-center justify-center rounded-md px-3 py-2 text-[13px] font-medium", m.bg, m.text)}>
      {m.label}
    </span>
  );
}
