import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  FolderOpen,
  Loader2,
  Paperclip,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import {
  createLesson,
  createSection,
  deleteLesson,
  deleteSection,
  listLessons,
  listSections,
  reorderLessons,
  reorderSections,
  updateLesson,
  updateSection,
  uploadLessonResource,
  uploadLessonVideoWithProgress,
} from "../api/instructor";
import { mintLessonPlayback } from "../api/playback";
import type { LessonAdminRead, LessonType, SectionAdminRead } from "../api/types";
import { ApiError } from "../api/client";
import { HLSPlayer } from "./HLSPlayer";
import { CircularProgress } from "./CircularProgress";
import { cn } from "../lib/cn";

type SectionWithLessons = SectionAdminRead & { lessons: LessonAdminRead[]; loaded: boolean };

function fmtDuration(secs: number): string {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(video.duration) || 0);
    };
    video.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    video.src = url;
  });
}

const TYPE_META: Record<LessonType, { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; color: string }> = {
  video:    { icon: Video,     label: "Video",    color: "text-primary bg-violet-50" },
  article:  { icon: FileText,  label: "Article",  color: "text-blue-600 bg-sky-50" },
  resource: { icon: Paperclip, label: "Resource", color: "text-positive-600 bg-positive-50" },
  quiz:     { icon: BookOpen,  label: "Quiz",     color: "text-amber-600 bg-warn-50" },
};

export function CurriculumEditor({ courseId }: { courseId: string }) {
  const [sections, setSections] = useState<SectionWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [creatingSection, setCreatingSection] = useState(false);
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const secs = await listSections(courseId);
      const enriched = await Promise.all(
        secs.map(async (s) => {
          try {
            const lessons = await listLessons(s.id);
            return { ...s, lessons, loaded: true };
          } catch {
            return { ...s, lessons: [], loaded: false };
          }
        })
      );
      setSections(enriched);
      if (enriched.length > 0) {
        setOpenSections(new Set([enriched[0].id]));
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load curriculum.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { void load(); }, [courseId]); // eslint-disable-line

  /* ─── Sections ─────────────────────────────────────────── */

  async function onCreateSection() {
    const title = newSectionTitle.trim();
    if (!title) return;
    setCreatingSection(true);
    try {
      const next = await createSection(courseId, { title });
      const newSec: SectionWithLessons = { ...next, lessons: [], loaded: true };
      setSections((cur) => [...cur, newSec]);
      setOpenSections((s) => new Set([...s, next.id]));
      setNewSectionTitle("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create section.");
    } finally {
      setCreatingSection(false);
    }
  }

  async function onRenameSection(sectionId: string, title: string) {
    try {
      const next = await updateSection(sectionId, { title });
      setSections((cur) => cur.map((s) => s.id === sectionId ? { ...s, title: next.title } : s));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not rename section.");
    }
  }

  async function onDeleteSection(sectionId: string) {
    if (!confirm("Delete this section and all its lessons?")) return;
    try {
      await deleteSection(sectionId);
      setSections((cur) => cur.filter((s) => s.id !== sectionId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete section.");
    }
  }

  async function onMoveSectionUp(idx: number) {
    if (idx === 0) return;
    const next = [...sections];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setSections(next);
    try {
      await reorderSections(courseId, { items: next.map((s, i) => ({ id: s.id, order: i + 1 })) });
    } catch { void load(); }
  }

  async function onMoveSectionDown(idx: number) {
    if (idx === sections.length - 1) return;
    const next = [...sections];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setSections(next);
    try {
      await reorderSections(courseId, { items: next.map((s, i) => ({ id: s.id, order: i + 1 })) });
    } catch { void load(); }
  }

  /* ─── Lessons ───────────────────────────────────────────── */

  async function onCreateLesson(sectionId: string, title: string, type: LessonType = "video") {
    if (!title.trim()) return;
    try {
      const lesson = await createLesson(sectionId, { title: title.trim(), type });
      setSections((cur) => cur.map((s) =>
        s.id === sectionId ? { ...s, lessons: [...s.lessons, lesson] } : s
      ));
      setExpandedLessons((e) => new Set([...e, lesson.id]));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create lesson.");
    }
  }

  async function onDeleteLesson(sectionId: string, lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    try {
      await deleteLesson(lessonId);
      setSections((cur) => cur.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
      ));
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
        type: patch.type,
        article_content: patch.article_content ?? undefined,
      });
      setSections((cur) => cur.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? next : l) } : s
      ));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not update lesson.");
    }
  }

  async function onUploadVideo(sectionId: string, lessonId: string, file: File) {
    const duration = await getVideoDuration(file);
    setUploadProgress((p) => ({ ...p, [lessonId]: 0 }));
    try {
      const next = await uploadLessonVideoWithProgress(
        lessonId, file,
        (pct) => setUploadProgress((p) => ({ ...p, [lessonId]: pct })),
        duration || undefined
      );
      setSections((cur) => cur.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? next : l) } : s
      ));
      pollHls(sectionId, lessonId);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed.");
    } finally {
      setUploadProgress((p) => { const n = { ...p }; delete n[lessonId]; return n; });
    }
  }

  async function onUploadResource(sectionId: string, lessonId: string, file: File) {
    try {
      const next = await uploadLessonResource(lessonId, file);
      setSections((cur) => cur.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? next : l) } : s
      ));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed.");
    }
  }

  /** Drop a video file directly onto a section → auto-create lesson + upload */
  async function onDropOnSection(sectionId: string, file: File) {
    const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    const lesson = await createLesson(sectionId, { title: name, type: "video" }).catch(() => null);
    if (!lesson) return;
    setSections((cur) => cur.map((s) =>
      s.id === sectionId ? { ...s, lessons: [...s.lessons, lesson] } : s
    ));
    setExpandedLessons((e) => new Set([...e, lesson.id]));
    await onUploadVideo(sectionId, lesson.id, file);
  }

  async function onMoveLessonUp(sectionId: string, idx: number) {
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec || idx === 0) return;
    const next = [...sec.lessons];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setSections((cur) => cur.map((s) => s.id === sectionId ? { ...s, lessons: next } : s));
    try {
      await reorderLessons(sectionId, { items: next.map((l, i) => ({ id: l.id, order: i + 1 })) });
    } catch { void load(); }
  }

  async function onMoveLessonDown(sectionId: string, idx: number) {
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec || idx === sec.lessons.length - 1) return;
    const next = [...sec.lessons];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setSections((cur) => cur.map((s) => s.id === sectionId ? { ...s, lessons: next } : s));
    try {
      await reorderLessons(sectionId, { items: next.map((l, i) => ({ id: l.id, order: i + 1 })) });
    } catch { void load(); }
  }

  function pollHls(sectionId: string, lessonId: string, tries = 0) {
    if (tries > 60) return;
    setTimeout(async () => {
      try {
        const r = await mintLessonPlayback(lessonId);
        setSections((cur) => cur.map((s) =>
          s.id === sectionId ? {
            ...s,
            lessons: s.lessons.map((l) =>
              l.id === lessonId ? { ...l, hls_status: r.hls_status, has_video: true } : l
            ),
          } : s
        ));
        if (r.hls_status === "pending") pollHls(sectionId, lessonId, tries + 1);
      } catch {
        pollHls(sectionId, lessonId, tries + 1);
      }
    }, 5000);
  }

  /* ─── Stats ─────────────────────────────────────────────── */

  const totalLessons = sections.reduce((n, s) => n + s.lessons.length, 0);
  const totalSecs = sections.reduce(
    (n, s) => n + s.lessons.reduce((m, l) => m + (l.duration_seconds || 0), 0), 0
  );
  const totalMin = Math.round(totalSecs / 60);

  /* ─── Render ─────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px]">Loading curriculum…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {sections.length > 0 && (
        <div className="flex items-center gap-6 rounded-xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-[13px] text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <FolderOpen size={14} className="text-primary" />
            <strong className="text-ink">{sections.length}</strong> section{sections.length !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Play size={14} className="text-primary" />
            <strong className="text-ink">{totalLessons}</strong> lesson{totalLessons !== 1 ? "s" : ""}
          </span>
          {totalMin > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-primary" />
              <strong className="text-ink">{totalMin}</strong> min total
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-danger-50 px-3 py-2.5 text-[13px] text-danger-500">
          <AlertCircle size={14} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="hover:opacity-70"><X size={14} /></button>
        </div>
      )}

      {sections.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-violet-200 p-10 text-center">
          <FolderOpen size={36} className="mx-auto mb-3 text-violet-300" />
          <p className="text-[14px] font-medium text-secondary">No sections yet</p>
          <p className="mt-1 text-[13px] text-slate-400">
            Add your first section below to start building your course curriculum.
          </p>
        </div>
      )}

      {/* Section list */}
      <div className="space-y-3">
        {sections.map((sec, sIdx) => {
          const isOpen = openSections.has(sec.id);
          const secDurationSecs = sec.lessons.reduce((n, l) => n + (l.duration_seconds || 0), 0);

          return (
            <div
              key={sec.id}
              className={cn(
                "rounded-xl border transition-colors",
                dragOverSection === sec.id
                  ? "border-primary bg-violet-50/60 ring-2 ring-primary/20"
                  : "border-violet-100 bg-white"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOverSection(sec.id); }}
              onDragLeave={() => setDragOverSection(null)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOverSection(null);
                const file = e.dataTransfer.files[0];
                if (file?.type.startsWith("video/")) {
                  setOpenSections((s) => new Set([...s, sec.id]));
                  await onDropOnSection(sec.id, file);
                }
              }}
            >
              {/* Section header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setOpenSections((prev) => {
                    const next = new Set(prev);
                    isOpen ? next.delete(sec.id) : next.add(sec.id);
                    return next;
                  })}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-violet-50"
                >
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-[12px] font-bold text-primary">
                  {sIdx + 1}
                </div>

                <SectionTitleEditor
                  title={sec.title}
                  onSave={(t) => onRenameSection(sec.id, t)}
                />

                <div className="flex shrink-0 items-center gap-3 text-[12px] text-slate-400">
                  <span>{sec.lessons.length} lesson{sec.lessons.length !== 1 ? "s" : ""}</span>
                  {secDurationSecs > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} /> {Math.round(secDurationSecs / 60)} min
                    </span>
                  )}
                </div>

                {dragOverSection === sec.id && (
                  <span className="animate-pulse text-[11px] font-medium text-primary">
                    Drop to add video lesson
                  </span>
                )}

                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveSectionUp(sIdx)}
                    disabled={sIdx === 0}
                    className="grid h-7 w-7 place-items-center rounded text-slate-400 hover:bg-violet-50 disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSectionDown(sIdx)}
                    disabled={sIdx === sections.length - 1}
                    className="grid h-7 w-7 place-items-center rounded text-slate-400 hover:bg-violet-50 disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSection(sec.id)}
                    className="grid h-7 w-7 place-items-center rounded text-danger-500 hover:bg-danger-50"
                    title="Delete section"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Section body */}
              {isOpen && (
                <div className="border-t border-violet-50 px-4 pb-4 pt-2">
                  {sec.lessons.length === 0 && (
                    <div className="mb-3 rounded-lg border border-dashed border-violet-200 py-6 text-center text-[12px] text-slate-400">
                      No lessons yet — drag a video here or add one below
                    </div>
                  )}

                  <div className="space-y-2">
                    {sec.lessons.map((lesson, lIdx) => {
                      const isExpanded = expandedLessons.has(lesson.id);
                      const progress = uploadProgress[lesson.id];

                      return (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          index={lIdx}
                          total={sec.lessons.length}
                          isExpanded={isExpanded}
                          uploadProgress={progress}
                          onToggleExpand={() => setExpandedLessons((prev) => {
                            const next = new Set(prev);
                            isExpanded ? next.delete(lesson.id) : next.add(lesson.id);
                            return next;
                          })}
                          onDelete={() => onDeleteLesson(sec.id, lesson.id)}
                          onUpdate={(patch) => onUpdateLesson(sec.id, lesson.id, patch)}
                          onUploadVideo={(file) => onUploadVideo(sec.id, lesson.id, file)}
                          onUploadResource={(file) => onUploadResource(sec.id, lesson.id, file)}
                          onPreview={() => setPreviewLessonId(lesson.id)}
                          onMoveUp={() => onMoveLessonUp(sec.id, lIdx)}
                          onMoveDown={() => onMoveLessonDown(sec.id, lIdx)}
                        />
                      );
                    })}
                  </div>

                  <AddLessonRow onAdd={(title, type) => onCreateLesson(sec.id, title, type)} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add section */}
      <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white p-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-50">
          <Plus size={16} className="text-primary" />
        </div>
        <input
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onCreateSection()}
          placeholder="New section title — press Enter or click Add"
          className="h-10 flex-1 rounded-lg border border-violet-100 bg-white px-3 text-[14px] outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={onCreateSection}
          disabled={creatingSection || !newSectionTitle.trim()}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
        >
          {creatingSection ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add section
        </button>
      </div>

      {/* Video preview modal */}
      {previewLessonId && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-6"
          onClick={() => setPreviewLessonId(null)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <HLSPlayer source={{ kind: "lesson", lessonId: previewLessonId }} />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewLessonId(null)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[13px] font-medium text-secondary"
              >
                <X size={14} /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Section title inline editor ─────────────────────────────── */

function SectionTitleEditor({ title, onSave }: { title: string; onSave: (t: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  if (editing) {
    return (
      <div className="flex flex-1 items-center gap-2">
        <input
          ref={inputRef}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { onSave(val); setEditing(false); }
            if (e.key === "Escape") { setVal(title); setEditing(false); }
          }}
          className="h-8 flex-1 rounded-md border border-primary bg-white px-2 text-[14px] font-medium outline-none"
        />
        <button
          type="button"
          onClick={() => { onSave(val); setEditing(false); }}
          className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-white"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => { setVal(title); setEditing(false); }}
          className="rounded-md border border-violet-100 px-2.5 py-1 text-[11px] text-secondary"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group flex flex-1 items-center gap-2 text-left"
      title="Click to rename"
    >
      <span className="text-[14px] font-semibold text-ink">{title}</span>
      <Pencil size={12} className="text-slate-300 opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}

/* ─── Add lesson row ───────────────────────────────────────────── */

function AddLessonRow({ onAdd }: { onAdd: (title: string, type: LessonType) => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LessonType>("video");

  const TYPES: { t: LessonType; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { t: "video",    label: "Video",    icon: Video },
    { t: "article",  label: "Article",  icon: FileText },
    { t: "resource", label: "Resource", icon: Paperclip },
  ];

  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="flex rounded-lg border border-violet-100 bg-violet-50/40">
        {TYPES.map(({ t, label, icon: Icon }) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 px-3 text-[12px] font-medium transition first:rounded-l-lg last:rounded-r-lg",
              type === t ? "bg-primary text-white" : "text-secondary hover:bg-violet-100"
            )}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && title.trim()) { onAdd(title, type); setTitle(""); }
        }}
        placeholder={`New ${type} lesson title…`}
        className="h-9 flex-1 rounded-lg border border-violet-100 bg-white px-3 text-[13px] outline-none focus:border-primary"
      />
      <button
        type="button"
        onClick={() => { if (title.trim()) { onAdd(title, type); setTitle(""); } }}
        disabled={!title.trim()}
        className="inline-flex h-9 items-center gap-1 rounded-lg bg-secondary px-3 text-[12px] font-medium text-white disabled:opacity-50"
      >
        <Plus size={12} /> Add
      </button>
    </div>
  );
}

/* ─── Lesson card ──────────────────────────────────────────────── */

function LessonCard({
  lesson,
  index,
  total,
  isExpanded,
  uploadProgress,
  onToggleExpand,
  onDelete,
  onUpdate,
  onUploadVideo,
  onUploadResource,
  onPreview,
  onMoveUp,
  onMoveDown,
}: {
  lesson: LessonAdminRead;
  index: number;
  total: number;
  isExpanded: boolean;
  uploadProgress?: number;
  onToggleExpand: () => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<LessonAdminRead>) => void;
  onUploadVideo: (file: File) => void;
  onUploadResource: (file: File) => void;
  onPreview: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const meta = TYPE_META[lesson.type] ?? TYPE_META.video;
  const Icon = meta.icon;

  const statusBadge = (() => {
    if (uploadProgress !== undefined) {
      return { label: `${uploadProgress}%`, cls: "bg-violet-100 text-primary" };
    }
    if (lesson.type === "video") {
      if (!lesson.has_video) return { label: "No video", cls: "bg-slate-100 text-slate-500" };
      if (lesson.hls_status === "ready")   return { label: "Ready", cls: "bg-positive-50 text-positive-600" };
      if (lesson.hls_status === "pending") return { label: "Encoding…", cls: "bg-warn-50 text-amber-600" };
      if (lesson.hls_status === "failed")  return { label: "Failed", cls: "bg-danger-50 text-danger-500" };
      return { label: "Uploaded", cls: "bg-sky-50 text-sky-700" };
    }
    if (lesson.type === "article") {
      return lesson.article_content
        ? { label: "Has content", cls: "bg-positive-50 text-positive-600" }
        : { label: "Empty", cls: "bg-slate-100 text-slate-500" };
    }
    if (lesson.type === "resource") {
      return lesson.resource_url
        ? { label: "Uploaded", cls: "bg-positive-50 text-positive-600" }
        : { label: "No file", cls: "bg-slate-100 text-slate-500" };
    }
    return { label: lesson.type, cls: "bg-slate-100 text-slate-500" };
  })();

  return (
    <div className={cn(
      "rounded-lg border transition-colors",
      isExpanded ? "border-primary/30 bg-white shadow-sm" : "border-violet-100 bg-violet-50/20 hover:bg-white"
    )}>
      {/* Lesson header row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={onToggleExpand}
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-md transition",
            meta.color
          )}
          title={meta.label}
        >
          <Icon size={14} />
        </button>

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className="flex-1 truncate text-[13px] font-medium text-secondary">{lesson.title}</span>
          {lesson.duration_seconds > 0 && (
            <span className="text-[11px] text-slate-400">{fmtDuration(lesson.duration_seconds)}</span>
          )}
          {lesson.is_free_preview && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              Free preview
            </span>
          )}
          <span className={cn("rounded px-2 py-0.5 text-[10px] font-medium", statusBadge.cls)}>
            {statusBadge.label}
          </span>
        </button>

        {uploadProgress !== undefined && (
          <CircularProgress pct={uploadProgress} size={32} strokeWidth={3} />
        )}

        {lesson.type === "video" && lesson.has_video && lesson.hls_status === "pending" && (
          <RefreshCw size={12} className="shrink-0 animate-spin text-amber-500" />
        )}
        {lesson.type === "video" && lesson.hls_status === "ready" && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="grid h-7 w-7 shrink-0 place-items-center rounded text-slate-400 hover:bg-violet-100"
            title="Preview"
          >
            <Play size={12} />
          </button>
        )}

        <div className="flex shrink-0 items-center gap-0.5">
          <button onClick={onMoveUp} disabled={index === 0} className="grid h-6 w-6 place-items-center rounded text-slate-300 hover:text-slate-500 disabled:opacity-0">
            <ArrowUp size={11} />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="grid h-6 w-6 place-items-center rounded text-slate-300 hover:text-slate-500 disabled:opacity-0">
            <ArrowDown size={11} />
          </button>
          <button onClick={onDelete} className="grid h-6 w-6 place-items-center rounded text-slate-300 hover:text-danger-500">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Lesson expand panel */}
      {isExpanded && (
        <LessonExpandPanel
          lesson={lesson}
          uploadProgress={uploadProgress}
          onUpdate={onUpdate}
          onUploadVideo={onUploadVideo}
          onUploadResource={onUploadResource}
        />
      )}
    </div>
  );
}

/* ─── Lesson expanded editor ───────────────────────────────────── */

function LessonExpandPanel({
  lesson,
  uploadProgress,
  onUpdate,
  onUploadVideo,
  onUploadResource,
}: {
  lesson: LessonAdminRead;
  uploadProgress?: number;
  onUpdate: (patch: Partial<LessonAdminRead>) => void;
  onUploadVideo: (file: File) => void;
  onUploadResource: (file: File) => void;
}) {
  const [desc, setDesc] = useState(lesson.description ?? "");
  const [article, setArticle] = useState(lesson.article_content ?? "");
  const [saving, setSaving] = useState(false);

  async function saveText() {
    setSaving(true);
    await onUpdate({ description: desc, article_content: lesson.type === "article" ? article : undefined });
    setSaving(false);
  }

  return (
    <div className="border-t border-violet-50 px-4 pb-4 pt-3 space-y-4">
      {/* Description */}
      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-slate-500">Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          placeholder="Short description shown to students…"
          className="w-full resize-none rounded-lg border border-violet-100 bg-white px-3 py-2 text-[13px] text-ink placeholder:text-slate-300 outline-none focus:border-primary"
        />
      </div>

      {/* Free preview toggle */}
      <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-secondary">
        <span className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition",
          lesson.is_free_preview ? "bg-primary" : "bg-slate-200"
        )}>
          <span className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
            lesson.is_free_preview ? "translate-x-4" : "translate-x-0.5"
          )} />
          <input
            type="checkbox"
            className="sr-only"
            checked={lesson.is_free_preview}
            onChange={(e) => onUpdate({ is_free_preview: e.target.checked })}
          />
        </span>
        Free preview — visible without enrollment
      </label>

      {/* Content area by type */}
      {lesson.type === "video" && (
        <VideoDropZone
          lesson={lesson}
          uploadProgress={uploadProgress}
          onFile={onUploadVideo}
        />
      )}

      {lesson.type === "article" && (
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-slate-500">Article content</label>
          <textarea
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            rows={8}
            placeholder="Write your article content here. Markdown is supported."
            className="w-full resize-y rounded-lg border border-violet-100 bg-white px-3 py-2.5 font-mono text-[13px] text-ink placeholder:text-slate-300 outline-none focus:border-primary"
          />
        </div>
      )}

      {lesson.type === "resource" && (
        <ResourceDropZone lesson={lesson} onFile={onUploadResource} />
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={saveText}
          disabled={saving}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-[12px] font-medium text-white disabled:opacity-60"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          Save changes
        </button>
      </div>
    </div>
  );
}

/* ─── Video drop zone ──────────────────────────────────────────── */

function VideoDropZone({
  lesson,
  uploadProgress,
  onFile,
}: {
  lesson: LessonAdminRead;
  uploadProgress?: number;
  onFile: (file: File) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const isUploading = uploadProgress !== undefined;

  function handleFile(file: File) {
    if (!file.type.startsWith("video/")) return;
    setPendingFile(file);
    onFile(file);
  }

  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-slate-500">
        Video {lesson.has_video ? "(replace)" : "upload"}
      </label>

      {/* Current video status */}
      {lesson.has_video && !isUploading && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-violet-100 bg-violet-50/40 px-3 py-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10">
            {lesson.hls_status === "ready"   && <CheckCircle2 size={16} className="text-positive-600" />}
            {lesson.hls_status === "pending" && <RefreshCw size={16} className="animate-spin text-amber-500" />}
            {lesson.hls_status === "failed"  && <AlertCircle size={16} className="text-danger-500" />}
            {!lesson.hls_status              && <Video size={16} className="text-primary" />}
          </div>
          <div className="flex-1 text-[13px]">
            {lesson.hls_status === "ready"   && <span className="text-positive-600 font-medium">Video ready for playback</span>}
            {lesson.hls_status === "pending" && <span className="text-amber-600 font-medium">Encoding in progress…</span>}
            {lesson.hls_status === "failed"  && <span className="text-danger-500 font-medium">Encoding failed — re-upload to retry</span>}
            {!lesson.hls_status              && <span className="text-slate-500">Video uploaded</span>}
            {lesson.duration_seconds > 0 && (
              <span className="ml-2 text-slate-400">({fmtDuration(lesson.duration_seconds)})</span>
            )}
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mb-3 flex items-center gap-4 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
          <CircularProgress pct={uploadProgress!} size={64} strokeWidth={5} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold text-ink">
              {uploadProgress! < 100 ? "Uploading video…" : "Processing…"}
            </span>
            {pendingFile && (
              <span className="truncate text-[11px] text-slate-400">
                {pendingFile.name} · {fmtSize(pendingFile.size)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Drop zone */}
      {!isUploading && (
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors",
            dragOver
              ? "border-primary bg-violet-50 text-primary"
              : "border-violet-200 text-slate-400 hover:border-primary hover:bg-violet-50/40"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
        >
          <Upload size={24} className={dragOver ? "text-primary" : "text-slate-300"} />
          <div className="text-center">
            <p className="text-[13px] font-medium">
              {dragOver ? "Drop video here" : "Drag & drop video or click to browse"}
            </p>
            <p className="mt-0.5 text-[11px]">MP4, MOV, AVI, MKV — up to 2 GB</p>
          </div>
          <input
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

/* ─── Resource drop zone ───────────────────────────────────────── */

function ResourceDropZone({
  lesson,
  onFile,
}: {
  lesson: LessonAdminRead;
  onFile: (file: File) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-slate-500">
        Attachment {lesson.resource_url ? "(replace)" : "upload"}
      </label>
      {lesson.resource_url && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50/40 px-3 py-2">
          <Paperclip size={14} className="text-positive-600" />
          <a
            href={lesson.resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 truncate text-[13px] text-primary hover:underline"
          >
            {lesson.resource_url.split("/").pop() ?? "Download file"}
          </a>
          <CheckCircle2 size={14} className="text-positive-600" />
        </div>
      )}
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition-colors",
          dragOver
            ? "border-positive-500 bg-positive-50 text-positive-600"
            : "border-violet-200 text-slate-400 hover:border-positive-500 hover:bg-positive-50/40"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) onFile(file);
        }}
      >
        <Paperclip size={20} className={dragOver ? "text-positive-600" : "text-slate-300"} />
        <p className="text-[13px] font-medium">
          {dragOver ? "Drop file here" : "Drag & drop or click to browse"}
        </p>
        <p className="text-[11px]">PDF, ZIP, DOCX, XLSX and more</p>
        <input
          type="file"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
