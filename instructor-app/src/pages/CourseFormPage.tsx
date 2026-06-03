import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bold,
  ChevronDown,
  HelpCircle,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Save,
  Smile,
  Underline,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import {
  createMyCourse,
  getMyCourse,
  updateMyCourse,
  uploadCoursePreviewVideoWithProgress,
  uploadCourseThumbnail,
} from "../api/instructor";
import { CircularProgress } from "../components/CircularProgress";
import { listCategories } from "../api/courses";
import { useToast } from "../components/Toast";
import type { CategoryRead, CourseLevel } from "../api/types";
import { ApiError } from "../api/client";
import { cn } from "../lib/cn";

type Form = {
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  level: CourseLevel;
  language: string;
  basePrice: string;
  discountPct: string;
  tags: string;
};

const EMPTY: Form = {
  title: "",
  subtitle: "",
  description: "",
  categoryId: "",
  level: "all_levels",
  language: "en",
  basePrice: "",
  discountPct: "",
  tags: "",
};

export function CourseFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { notify } = useToast();
  const [form, setForm] = useState<Form>(EMPTY);
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewVideo, setPreviewVideo] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [previewVideoPct, setPreviewVideoPct] = useState<number | null>(null);
  const previewAbort = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = mode === "create" ? "Add Course" : "Edit Course";

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    let mounted = true;
    setLoading(true);
    getMyCourse(id)
      .then((c) => {
        if (!mounted) return;
        const list = c.price_cents;
        const disc = c.discount_price_cents;
        const pct = list && disc !== null && disc !== undefined ? Math.max(0, Math.round((1 - disc / list) * 100)) : 0;
        setForm({
          title: c.title,
          subtitle: c.subtitle ?? "",
          description: c.description ?? "",
          categoryId: c.category_id,
          level: c.level,
          language: c.language,
          basePrice: list ? String(list / 100) : "",
          discountPct: pct ? String(pct) : "",
          tags: c.tags?.join(", ") ?? "",
        });
        setThumbnailUrl(c.thumbnail_url);
      })
      .catch((e) => {
        setError(e instanceof ApiError ? e.message : "Could not load course.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id, mode]);

  function update<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("Course name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const baseCents = form.basePrice ? Math.round(parseFloat(form.basePrice) * 100) : 0;
      const discountCents =
        form.discountPct && baseCents
          ? Math.max(0, Math.round(baseCents * (1 - parseFloat(form.discountPct) / 100)))
          : undefined;
      const tagList = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      let courseId = id ?? "";
      if (mode === "create") {
        if (!form.categoryId) throw new ApiError(400, "validation_error", "Pick a category.");
        const created = await createMyCourse({
          title: form.title,
          subtitle: form.subtitle || undefined,
          description: form.description || undefined,
          category_id: form.categoryId,
          level: form.level,
          language: form.language || "en",
          price_cents: baseCents,
          discount_price_cents: discountCents,
          tags: tagList.length ? tagList : undefined,
        });
        courseId = created.id;
      } else if (courseId) {
        await updateMyCourse(courseId, {
          title: form.title,
          subtitle: form.subtitle || undefined,
          description: form.description || undefined,
          category_id: form.categoryId || undefined,
          level: form.level,
          language: form.language || undefined,
          price_cents: baseCents,
          discount_price_cents: discountCents,
          tags: tagList.length ? tagList : undefined,
        });
      }

      if (thumbnail && courseId) {
        await uploadCourseThumbnail(courseId, thumbnail);
      }
      if (previewVideo && courseId) {
        setPreviewVideoPct(0);
        previewAbort.current = new AbortController();
        await uploadCoursePreviewVideoWithProgress(
          courseId,
          previewVideo,
          setPreviewVideoPct,
          previewAbort.current.signal
        );
        setPreviewVideoPct(null);
      }

      notify(mode === "create" ? "Course created." : "Course updated.", "success");
      nav(mode === "create" && courseId ? `/courses/${courseId}/content` : courseId ? `/courses/${courseId}` : "/courses");
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p className="text-[14px] text-slate-500">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <form onSubmit={onSubmit}>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-ink">{heading}</h1>
            <p className="mt-1 text-[14px] text-slate-600">{mode === "create" ? "Fill in the details to create a new course" : "Update your course information"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nav(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary"
            >
              <X size={16} /> Cancel
            </button>
            {mode === "edit" && (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[14px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
              >
                <Save size={16} /> Save Changes
              </button>
            )}
          </div>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-ink">Description</h2>

          <div className="mt-4 flex flex-col gap-4">
            <Field label="Course Name" required>
              <Input value={form.title} onChange={(v) => update("title", v)} placeholder="e.g. Mastering Excel" />
            </Field>
            <Field label="Subtitle">
              <Input value={form.subtitle} onChange={(v) => update("subtitle", v)} placeholder="A one-line summary" />
            </Field>

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-secondary">
                Course Description <span className="text-danger-500">*</span>
              </span>
              <DescriptionEditor
                value={form.description}
                onChange={(v) => update("description", v)}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-ink">Course & Video</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <UploadTile
              icon={<ImageIcon size={20} className="text-primary" />}
              accept="image/*"
              file={thumbnail}
              previewUrl={thumbnail ? URL.createObjectURL(thumbnail) : thumbnailUrl}
              label="Course thumbnail"
              sizeLimit="Max 5 MB · JPG, PNG, WebP"
              onFile={setThumbnail}
            />
            <UploadTile
              icon={<Video size={20} className="text-slate-400" />}
              accept="video/*"
              file={previewVideo}
              label="Preview video"
              sizeLimit="Max 50 MB · MP4, MOV, AVI"
              uploadProgress={previewVideoPct}
              onFile={setPreviewVideo}
            />
          </div>
          <p className="mt-2 text-[12px] text-slate-400">Files are uploaded after Save.</p>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-ink">Category & Level</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field label="Category" required>
              <Select
                value={form.categoryId}
                onChange={(v) => update("categoryId", v)}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="Select"
              />
            </Field>
            <Field label="Level">
              <Select
                value={form.level}
                onChange={(v) => update("level", v as CourseLevel)}
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                  { value: "all_levels", label: "All levels" },
                ]}
              />
            </Field>
            <Field label="Language">
              <Input value={form.language} onChange={(v) => update("language", v)} placeholder="en" />
            </Field>
            <Field label="Tags (comma-separated)">
              <Input value={form.tags} onChange={(v) => update("tags", v)} placeholder="python, data" />
            </Field>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="inline-flex items-center gap-1.5 text-[16px] font-semibold text-ink">
            Pricing <HelpCircle size={14} className="text-slate-400" />
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field label="Base price">
              <PrefixInput prefix="$" value={form.basePrice} onChange={(v) => update("basePrice", v)} />
            </Field>
            <Field label="Discount %">
              <PrefixInput prefix="%" value={form.discountPct} onChange={(v) => update("discountPct", v)} />
            </Field>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-danger-50 px-3 py-2 text-[13px] text-danger-500">{error}</div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => nav(-1)}
              className="rounded-lg border border-violet-100 bg-white px-6 py-2.5 text-[14px] font-medium text-danger-500 hover:bg-danger-50"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={submitting || loading || previewVideoPct !== null}
              className="rounded-lg bg-primary px-8 py-2.5 text-[14px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
            >
              {previewVideoPct !== null ? `Uploading video ${previewVideoPct}%…` : submitting ? "Saving…" : mode === "create" ? "Create course" : "Save changes"}
            </button>
          </div>
        </section>
      </form>
    </AppShell>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-secondary">
        {label} {required && <span className="text-danger-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-lg border border-violet-100 bg-white px-3 text-[14px] outline-none placeholder:text-slate-300 focus:border-primary"
    />
  );
}

function PrefixInput({ prefix, value, onChange }: { prefix: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex h-11 items-center overflow-hidden rounded-lg border border-violet-100 bg-white focus-within:border-primary">
      <span className="grid h-full w-10 place-items-center border-r border-violet-100 text-[14px] text-slate-500">
        {prefix}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full flex-1 bg-transparent px-3 text-[14px] outline-none placeholder:text-slate-300"
      />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-lg border border-violet-100 bg-white pl-3 pr-9 text-[14px] outline-none focus:border-primary"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function UploadTile({
  icon,
  accept,
  file,
  previewUrl,
  label,
  sizeLimit,
  uploadProgress,
  onFile,
}: {
  icon: React.ReactNode;
  accept: string;
  file: File | null;
  previewUrl?: string | null;
  label: string;
  sizeLimit?: string;
  uploadProgress?: number | null;
  onFile: (f: File | null) => void;
}) {
  const isUploading = uploadProgress !== null && uploadProgress !== undefined;

  return (
    <label
      className={cn(
        "flex h-[120px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-center transition",
        isUploading ? "cursor-default border-primary bg-violet-50/60" :
        file ? "border-primary bg-violet-50/60" : "border-violet-200 bg-violet-50/30 hover:bg-violet-50/60"
      )}
    >
      {previewUrl && accept.startsWith("image/") ? (
        <img src={previewUrl} alt={label} className="h-full w-full rounded-md object-cover" />
      ) : isUploading ? (
        <div className="flex flex-col items-center gap-1.5">
          <CircularProgress pct={uploadProgress!} size={52} strokeWidth={4} trackColor="#e2e8f0" progressColor="#615fff" />
          <p className="text-[11px] text-slate-500">
            {uploadProgress! < 100 ? "Uploading…" : "Processing…"}
          </p>
        </div>
      ) : (
        <>
          {icon}
          <p className="text-[12px] text-slate-600">
            <span className="font-medium text-primary underline">Click to upload</span> {label}
          </p>
          {file
            ? <p className="text-[11px] text-slate-500">{file.name}</p>
            : sizeLimit && <p className="text-[11px] text-slate-400">{sizeLimit}</p>
          }
          <Upload size={12} className="text-slate-400" />
        </>
      )}
      <input
        type="file"
        accept={accept}
        hidden
        disabled={isUploading}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

const EMOJIS = [
  "😀","😊","😂","🤣","😍","🥰","😎","🤓","🤔","😅",
  "🎉","🎊","👍","👎","❤️","🔥","✅","❌","⭐","🌟",
  "💡","📚","🎓","💪","🚀","🎯","📝","💻","🏆","🎁",
  "🌍","💰","📈","🙌","✨","🤝","💬","📣","🛠️","⚡",
];

function DescriptionEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  function wrap(prefix: string, suffix: string) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const newVal = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(newVal);
    requestAnimationFrame(() => {
      ta.focus();
      if (selected) {
        ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      } else {
        ta.setSelectionRange(start + prefix.length, start + prefix.length);
      }
    });
  }

  function insertEmoji(emoji: string) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const newVal = value.slice(0, start) + emoji + value.slice(start);
    onChange(newVal);
    setShowEmoji(false);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  return (
    <div className="rounded-lg border border-violet-100 bg-white focus-within:border-primary">
      <div className="flex items-center gap-0.5 border-b border-violet-50 px-2 py-1.5">
        <ToolBtn onClick={() => wrap("**", "**")} title="Bold"><Bold size={14} /></ToolBtn>
        <ToolBtn onClick={() => wrap("_", "_")} title="Italic"><Italic size={14} /></ToolBtn>
        <ToolBtn onClick={() => wrap("<u>", "</u>")} title="Underline"><Underline size={14} /></ToolBtn>
        <ToolBtn onClick={() => wrap("[", "](https://)")} title="Link"><LinkIcon size={14} /></ToolBtn>
        <div className="relative">
          <ToolBtn onClick={() => setShowEmoji((v) => !v)} title="Emoji"><Smile size={14} /></ToolBtn>
          {showEmoji && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowEmoji(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 grid w-[220px] grid-cols-8 gap-0.5 rounded-lg border border-violet-100 bg-white p-2 shadow-lg">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); insertEmoji(emoji); }}
                    className="grid h-7 w-7 place-items-center rounded text-[16px] hover:bg-violet-50"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tell students what this course covers."
        className="min-h-[120px] w-full resize-y bg-transparent px-3 py-2 text-[14px] outline-none placeholder:text-slate-300"
      />
    </div>
  );
}

function ToolBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-violet-50 hover:text-primary"
    >
      {children}
    </button>
  );
}
