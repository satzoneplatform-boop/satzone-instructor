import { useEffect, useState, type FormEvent } from "react";
import {
  Bold,
  ChevronDown,
  HelpCircle,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Plus,
  Smile,
  Underline,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import {
  createCourseAsInstructor,
  getCourse,
  listCategories,
  updateCourse,
} from "../api/courses";
import { listInstructors } from "../api/admin";
import type { CategoryRead } from "../api/types";
import { ApiError } from "../api/client";
import { cn } from "../lib/cn";

type Form = {
  title: string;
  description: string;
  categoryId: string;
  subCategory: string;
  sellingType: "online_live" | "recorded" | "both";
  instructorId: string;
  basePrice: string;
  discountPct: string;
};

const EMPTY: Form = {
  title: "",
  description: "",
  categoryId: "",
  subCategory: "active",
  sellingType: "online_live",
  instructorId: "",
  basePrice: "",
  discountPct: "",
};

export function CourseFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [form, setForm] = useState<Form>(EMPTY);
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [instructors, setInstructors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = mode === "create" ? "Add Course" : "Edit Course";

  // Load categories + instructors for the selects (best-effort)
  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
    listInstructors({ size: 100 })
      .then((p) => setInstructors(p.items.map((i) => ({ id: i.id, name: i.name }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    let mounted = true;
    setLoading(true);
    getCourse(id)
      .then((c) => {
        if (!mounted) return;
        setForm({
          title: c.title,
          description: c.description ?? "",
          categoryId: c.category?.id ?? "",
          subCategory: "active",
          sellingType: "online_live",
          instructorId: c.instructor?.id ?? "",
          basePrice: c.price_cents ? String(c.price_cents / 100) : "",
          discountPct: "",
        });
      })
      .catch(() => {
        // Mock fallback per the Figma reference
        setForm({
          ...EMPTY,
          title: "Mastering Excel: From Basics to Advanced Formulas",
          description:
            'From Basics to Advanced Formulas" is an excellent course title that suggests a comprehensive learning journey through Excel proficiency. This title effectively communicates the course\'s scope, from foundational concepts to advanced techniques in using Excel formulas.',
          subCategory: "active",
          basePrice: "400",
          discountPct: "25",
        });
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
      if (mode === "create") {
        if (!form.categoryId) throw new ApiError(400, "validation_error", "Pick a category.");
        await createCourseAsInstructor({
          title: form.title,
          description: form.description,
          category_id: form.categoryId,
          price_cents: form.basePrice ? Math.round(parseFloat(form.basePrice) * 100) : 0,
          discount_price_cents: form.discountPct
            ? Math.round(
                parseFloat(form.basePrice || "0") *
                  100 *
                  (1 - parseFloat(form.discountPct) / 100)
              )
            : undefined,
        });
      } else if (id) {
        await updateCourse(id, {
          title: form.title,
          description: form.description,
          category_id: form.categoryId || undefined,
          instructor_id: form.instructorId || undefined,
          price_cents: form.basePrice ? Math.round(parseFloat(form.basePrice) * 100) : undefined,
        });
      }
      nav("/courses");
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("Could not save. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <form onSubmit={onSubmit}>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-ink">{heading}</h1>
            <p className="mt-1 text-[14px] text-slate-600">Let's check your update today</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nav(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary"
            >
              <X size={16} /> Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-[14px] font-medium text-white hover:bg-secondary/90 disabled:opacity-60"
            >
              <Plus size={16} /> Add Course
            </button>
          </div>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-ink">Description</h2>

          <div className="mt-4 flex flex-col gap-4">
            <Field label="Course Name" required>
              <Input value={form.title} onChange={(v) => update("title", v)} placeholder="type your product name" />
            </Field>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-secondary">
                  Course Description <span className="text-danger-500">*</span>
                </span>
                <button type="button" className="inline-flex items-center gap-1 text-[12px] font-medium text-primary">
                  <Upload size={12} /> Upload .txt file
                </button>
              </div>
              <div className="rounded-lg border border-violet-100 bg-white">
                <div className="flex items-center gap-3 border-b border-violet-50 px-3 py-2 text-slate-500">
                  <Bold size={14} /> <Italic size={14} /> <Underline size={14} />{" "}
                  <LinkIcon size={14} /> <Smile size={14} />
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Tell us about your home here"
                  className="min-h-[120px] w-full resize-y bg-transparent px-3 py-2 text-[14px] outline-none placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-ink">Course & Video</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <UploadTile icon={<ImageIcon size={20} className="text-primary" />} />
            <UploadTile icon={<Video size={20} className="text-slate-400" />} />
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-ink">Category</h2>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <Field label="Category" required>
              <Select
                value={form.categoryId}
                onChange={(v) => update("categoryId", v)}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="Select"
              />
            </Field>
            <Field label="Sub Category" required>
              <Select
                value={form.subCategory}
                onChange={(v) => update("subCategory", v)}
                options={[
                  { value: "active", label: "Active" },
                  { value: "multimedia", label: "Multimedia" },
                ]}
              />
            </Field>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-ink">Selling Type</h2>
          <div className="mt-4 flex flex-col gap-3">
            <Radio
              label="In- Online Live Selling only"
              checked={form.sellingType === "online_live"}
              onChange={() => update("sellingType", "online_live")}
            />
            <Radio
              label="Available in- Recorded"
              checked={form.sellingType === "recorded"}
              onChange={() => update("sellingType", "recorded")}
            />
            <Radio
              label="Available both in-Online Live & Recorded"
              checked={form.sellingType === "both"}
              onChange={() => update("sellingType", "both")}
            />
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-ink">Instructor</h2>
          <div className="mt-4">
            <Field label="Select Instructor">
              <Select
                value={form.instructorId}
                onChange={(v) => update("instructorId", v)}
                options={instructors.map((i) => ({ value: i.id, label: i.name }))}
                placeholder="Select"
              />
            </Field>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="inline-flex items-center gap-1.5 text-[16px] font-semibold text-ink">
            Pricing <HelpCircle size={14} className="text-slate-400" />
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field label="Base Price" required>
              <PrefixInput
                prefix="$"
                value={form.basePrice}
                onChange={(v) => update("basePrice", v)}
              />
            </Field>
            <Field label="Discount Percent">
              <PrefixInput
                prefix="%"
                value={form.discountPct}
                onChange={(v) => update("discountPct", v)}
                trailing={<ChevronDown size={16} className="text-slate-400" />}
              />
            </Field>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-danger-50 px-3 py-2 text-[13px] text-danger-500">
              {error}
            </div>
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
              disabled={submitting || loading}
              className="rounded-lg bg-primary px-8 py-2.5 text-[14px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Public"}
            </button>
          </div>
        </section>
      </form>
    </AppShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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

function PrefixInput({
  prefix,
  value,
  onChange,
  trailing,
}: {
  prefix: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
}) {
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
      {trailing && <div className="px-3">{trailing}</div>}
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

function Radio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded border-2 transition",
          checked ? "border-primary bg-primary" : "border-violet-200 bg-white"
        )}
        onClick={onChange}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 3.5L4 6.5L9 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-[14px] text-secondary">{label}</span>
    </label>
  );
}

function UploadTile({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="flex h-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-violet-200 bg-violet-50/30 text-center hover:bg-violet-50/60">
      {icon}
      <p className="text-[12px] text-slate-600">
        <span className="font-medium text-primary underline">Click to upload</span> or
      </p>
      <p className="text-[12px] text-slate-600">drag & drop</p>
    </div>
  );
}
