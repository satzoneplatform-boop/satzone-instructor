import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Video,
  Eye,
} from "lucide-react";
import {
  createLesson,
  createSection,
  deleteLesson,
  deleteSection,
  listLessons,
  listSections,
  updateLesson,
  updateSection,
  uploadLessonVideo,
} from "../api/instructor";
import { mintLessonPlayback } from "../api/playback";
import type { LessonAdminRead, SectionAdminRead } from "../api/types";
import { ApiError } from "../api/client";
import { HLSPlayer } from "./HLSPlayer";
import { cn } from "../lib/cn";

type SectionWithLessons = SectionAdminRead & { lessons: LessonAdminRead[]; lessonsLoaded: boolean };

export function CurriculumEditor({ courseId }: { courseId: string }) {
  const [sections, setSections] = useState<SectionWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [creatingSection, setCreatingSection] = useState(false);
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const secs = await listSections(courseId);
      const enriched = await Promise.all(
        secs.map(async (s) => {
          try {
            const lessons = await listLessons(s.id);
            return { ...s, lessons, lessonsLoaded: true };
          } catch {
            return { ...s, lessons: [], lessonsLoaded: false };
          }
        })
      );
      setSections(enriched);
      if (enriched.length && !openSection) setOpenSection(enriched[0].id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load curriculum.");
    } finally {
      setLoading(false);
    }
  }, [courseId, openSection]);

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function onCreateSection() {
    if (!newSectionTitle.trim()) return;
    setCreatingSection(true);
    try {
      const next = await createSection(courseId, { title: newSectionTitle.trim() });
      setSections((cur) => [...cur, { ...next, lessons: [], lessonsLoaded: true }]);
      setNewSectionTitle("");
      setOpenSection(next.id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create section.");
    } finally {
      setCreatingSection(false);
    }
  }

  async function onDeleteSection(sectionId: string) {
    if (!confirm("Delete this section and all of its lessons?")) return;
    try {
      await deleteSection(sectionId);
      setSections((cur) => cur.filter((s) => s.id !== sectionId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete section.");
    }
  }

  async function onRenameSection(sectionId: string, title: string) {
    try {
      const next = await updateSection(sectionId, { title });
      setSections((cur) =>
        cur.map((s) => (s.id === sectionId ? { ...s, title: next.title, order: next.order } : s))
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not rename section.");
    }
  }

  async function onAddLesson(sectionId: string, title: string) {
    if (!title.trim()) return;
    try {
      const lesson = await createLesson(sectionId, { title: title.trim() });
      setSections((cur) =>
        cur.map((s) => (s.id === sectionId ? { ...s, lessons: [...s.lessons, lesson] } : s))
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create lesson.");
    }
  }

  async function onDeleteLesson(sectionId: string, lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    try {
      await deleteLesson(lessonId);
      setSections((cur) =>
        cur.map((s) => (s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s))
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete lesson.");
    }
  }

  async function onUpdateLesson(sectionId: string, lessonId: string, patch: Partial<LessonAdminRead>) {
    try {
      const next = await updateLesson(lessonId, {
        title: patch.title,
        description: patch.description ?? undefined,
        is_free_preview: patch.is_free_preview,
      });
      setSections((cur) =>
        cur.map((s) =>
          s.id === sectionId
            ? { ...s, lessons: s.lessons.map((l) => (l.id === lessonId ? next : l)) }
            : s
        )
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not update lesson.");
    }
  }

  async function onUploadVideo(sectionId: string, lessonId: string, file: File) {
    try {
      const next = await uploadLessonVideo(lessonId, file);
      setSections((cur) =>
        cur.map((s) =>
          s.id === sectionId
            ? { ...s, lessons: s.lessons.map((l) => (l.id === lessonId ? next : l)) }
            : s
        )
      );
      // Poll the playback endpoint until hls_status becomes ready/failed.
      pollHls(sectionId, lessonId);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed.");
    }
  }

  function pollHls(sectionId: string, lessonId: string, tries = 0) {
    if (tries > 60) return; // ~5 minutes max
    setTimeout(async () => {
      try {
        const r = await mintLessonPlayback(lessonId);
        setSections((cur) =>
          cur.map((s) =>
            s.id === sectionId
              ? {
                  ...s,
                  lessons: s.lessons.map((l) =>
                    l.id === lessonId ? { ...l, hls_status: r.hls_status, has_video: true } : l
                  ),
                }
              : s
          )
        );
        if (r.hls_status === "pending") pollHls(sectionId, lessonId, tries + 1);
      } catch {
        pollHls(sectionId, lessonId, tries + 1);
      }
    }, 5000);
  }

  if (loading) {
    return (
      <div className="grid place-items-center gap-2 py-10 text-slate-400">
        <Loader2 size={20} className="animate-spin" /> Loading curriculum…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-danger-50 px-3 py-2 text-[13px] text-danger-500">{error}</div>
      )}

      {sections.length === 0 && (
        <div className="rounded-lg border border-dashed border-violet-200 p-6 text-center text-[13px] text-slate-500">
          No sections yet. Add the first one below.
        </div>
      )}

      <ul className="space-y-3">
        {sections.map((s) => {
          const isOpen = openSection === s.id;
          return (
            <li key={s.id} className="rounded-xl border border-violet-100">
              <SectionHeader
                section={s}
                isOpen={isOpen}
                onToggle={() => setOpenSection(isOpen ? null : s.id)}
                onRename={(t) => onRenameSection(s.id, t)}
                onDelete={() => onDeleteSection(s.id)}
              />
              {isOpen && (
                <SectionBody
                  section={s}
                  onAddLesson={(t) => onAddLesson(s.id, t)}
                  onDeleteLesson={(lid) => onDeleteLesson(s.id, lid)}
                  onUpdateLesson={(lid, patch) => onUpdateLesson(s.id, lid, patch)}
                  onUploadVideo={(lid, f) => onUploadVideo(s.id, lid, f)}
                  onPreview={(lid) => setPreviewLessonId(lid)}
                />
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-2 rounded-lg border border-violet-100 bg-white p-3">
        <input
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          placeholder="New section title…"
          className="h-10 flex-1 rounded-md border border-violet-100 bg-white px-3 text-[14px] outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={onCreateSection}
          disabled={creatingSection || !newSectionTitle.trim()}
          className="inline-flex h-10 items-center gap-1 rounded-md bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
        >
          <Plus size={14} /> Add section
        </button>
      </div>

      {previewLessonId && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6"
          onClick={() => setPreviewLessonId(null)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <HLSPlayer source={{ kind: "lesson", lessonId: previewLessonId }} />
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={() => setPreviewLessonId(null)}
                className="rounded-md bg-white px-4 py-2 text-[13px] font-medium text-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  section,
  isOpen,
  onToggle,
  onRename,
  onDelete,
}: {
  section: SectionWithLessons;
  isOpen: boolean;
  onToggle: () => void;
  onRename: (t: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-violet-50"
      >
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {editing ? (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 flex-1 rounded-md border border-violet-100 bg-white px-3 text-[14px] outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => {
              onRename(title);
              setEditing(false);
            }}
            className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-white"
          >
            Save
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-[14px] font-medium text-ink">{section.title}</span>
          <span className="text-[12px] text-slate-400">
            {section.lessons.length} lesson{section.lessons.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-violet-50"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="grid h-7 w-7 place-items-center rounded text-danger-500 hover:bg-danger-50"
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
    </div>
  );
}

function SectionBody({
  section,
  onAddLesson,
  onDeleteLesson,
  onUpdateLesson,
  onUploadVideo,
  onPreview,
}: {
  section: SectionWithLessons;
  onAddLesson: (title: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onUpdateLesson: (lessonId: string, patch: Partial<LessonAdminRead>) => void;
  onUploadVideo: (lessonId: string, file: File) => void;
  onPreview: (lessonId: string) => void;
}) {
  const [newLessonTitle, setNewLessonTitle] = useState("");

  return (
    <div className="border-t border-violet-50 px-4 pb-3">
      <ul className="space-y-2 py-2">
        {section.lessons.map((l) => (
          <LessonRow
            key={l.id}
            lesson={l}
            onDelete={() => onDeleteLesson(l.id)}
            onUpdate={(patch) => onUpdateLesson(l.id, patch)}
            onUploadVideo={(file) => onUploadVideo(l.id, file)}
            onPreview={() => onPreview(l.id)}
          />
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <input
          value={newLessonTitle}
          onChange={(e) => setNewLessonTitle(e.target.value)}
          placeholder="New lesson title…"
          className="h-9 flex-1 rounded-md border border-violet-100 bg-white px-3 text-[13px] outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => {
            onAddLesson(newLessonTitle);
            setNewLessonTitle("");
          }}
          disabled={!newLessonTitle.trim()}
          className="inline-flex h-9 items-center gap-1 rounded-md bg-secondary px-3 text-[12px] font-medium text-white disabled:opacity-60"
        >
          <Plus size={12} /> Lesson
        </button>
      </div>
    </div>
  );
}

function LessonRow({
  lesson,
  onDelete,
  onUpdate,
  onUploadVideo,
  onPreview,
}: {
  lesson: LessonAdminRead;
  onDelete: () => void;
  onUpdate: (patch: Partial<LessonAdminRead>) => void;
  onUploadVideo: (file: File) => void;
  onPreview: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [uploading, setUploading] = useState(false);

  const statusLabel = (() => {
    if (!lesson.has_video) return "No video";
    if (lesson.hls_status === "ready") return "Ready";
    if (lesson.hls_status === "pending") return "Encoding…";
    if (lesson.hls_status === "failed") return "Encoding failed";
    return "Uploaded";
  })();
  const statusClass = lesson.has_video
    ? lesson.hls_status === "ready"
      ? "bg-positive-50 text-positive-600"
      : lesson.hls_status === "failed"
        ? "bg-danger-50 text-danger-500"
        : "bg-warn-50 text-amber-600"
    : "bg-slate-100 text-slate-500";

  return (
    <li className="flex items-center gap-2 rounded-md border border-violet-50 bg-violet-50/30 px-3 py-2">
      <Video size={14} className="text-slate-400" />
      {editing ? (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 flex-1 rounded-md border border-violet-100 bg-white px-2 text-[13px] outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => {
              onUpdate({ title });
              setEditing(false);
            }}
            className="rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-white"
          >
            Save
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 truncate text-[13px] text-secondary">{lesson.title}</span>
          <span className={cn("rounded px-2 py-0.5 text-[10px] font-medium", statusClass)}>
            {statusLabel}
          </span>
          <label className="ml-auto cursor-pointer text-[11px] font-medium text-primary hover:underline">
            <span className="inline-flex items-center gap-1">
              <Upload size={12} /> {uploading ? "Uploading…" : lesson.has_video ? "Replace" : "Video"}
            </span>
            <input
              type="file"
              accept="video/*"
              hidden
              disabled={uploading}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setUploading(true);
                try {
                  await onUploadVideo(f);
                } finally {
                  setUploading(false);
                }
                e.target.value = "";
              }}
            />
          </label>
          <label className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <input
              type="checkbox"
              checked={lesson.is_free_preview}
              onChange={(e) => onUpdate({ is_free_preview: e.target.checked })}
            />
            Free preview
          </label>
          {lesson.has_video && lesson.hls_status === "ready" && (
            <button
              type="button"
              onClick={onPreview}
              className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-violet-100"
              title="Play"
            >
              <Eye size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-violet-100"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="grid h-7 w-7 place-items-center rounded text-danger-500 hover:bg-danger-50"
          >
            <Trash2 size={13} />
          </button>
        </>
      )}
    </li>
  );
}
