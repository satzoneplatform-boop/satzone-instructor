import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, ChevronDown, Plus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import {
  createInstructor,
  getInstructor,
  updateInstructor,
  uploadInstructorAvatar,
} from "../api/admin";
import { ApiError } from "../api/client";
import { cn } from "../lib/cn";

type Form = {
  name: string;
  designation: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  userId: string;
  status: "active" | "inactive" | "pending";
  avatarUrl: string;
};

const EMPTY: Form = {
  name: "",
  designation: "User Interface Designer",
  email: "",
  phone: "",
  country: "",
  city: "",
  address: "",
  postalCode: "",
  userId: "",
  status: "active",
  avatarUrl: "",
};

const COUNTRIES = ["Bangladesh", "United States", "United Kingdom", "India", "Pakistan", "Germany"];

export function TeacherFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [form, setForm] = useState<Form>(EMPTY);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = mode === "create" ? "Add Teachers" : form.name || "Edit Teacher";
  const submitLabel = mode === "create" ? "Add" : "Update";

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    let mounted = true;
    setLoading(true);
    getInstructor(id)
      .then((it) => {
        if (!mounted) return;
        setForm({
          name: it.name,
          designation: it.title ?? "",
          email: "",
          phone: "",
          country: "",
          city: "",
          address: "",
          postalCode: "",
          userId: `#${it.slug.slice(0, 8).toUpperCase()}`,
          status: "active",
          avatarUrl: it.avatar_url ?? "",
        });
      })
      .catch(() => {
        // mock fallback — pre-fill with Osama Richard for the visual reference
        setForm({
          ...EMPTY,
          name: "Osama Richard",
          designation: "User Interface Designer",
          email: "osamarichard@gmail.com",
          phone: "+1 707 797 0469",
          country: "Bangladesh",
          city: "Dhaka",
          address: "Mirpur-10, Dhaka 1231, Bangladesh",
          postalCode: "1231",
          userId: "#OS4524114",
          avatarUrl: "https://i.pravatar.cc/120?img=12",
        });
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id, mode]);

  const avatarPreview = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    return form.avatarUrl;
  }, [avatarFile, form.avatarUrl]);

  function update<K extends keyof Form>(key: K, val: Form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function onAvatarPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        title: form.designation || undefined,
        // Email/phone/address/etc. aren't part of AdminInstructorRead;
        // they'd map to a separate User record. For now we store designation only.
      };
      let savedId: string;
      if (mode === "create") {
        const created = await createInstructor(payload);
        savedId = created.id;
      } else if (id) {
        const upd = await updateInstructor(id, payload);
        savedId = upd.id;
      } else {
        throw new Error("Missing id");
      }
      if (avatarFile) {
        await uploadInstructorAvatar(savedId, avatarFile).catch(() => {});
      }
      nav("/teachers");
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError("Could not save. Is the backend running?");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <form onSubmit={onSubmit}>
        {/* Page header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-ink">{title}</h1>
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
              <Plus size={16} /> {submitting ? "Saving…" : "Add Teachers"}
            </button>
          </div>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-ink">General Information</h2>

          <div className="mt-4 flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-violet-50">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <Camera size={22} className="text-slate-400" />
              )}
            </div>
            <div className="flex flex-1 items-center gap-3">
              <label className="cursor-pointer rounded-lg bg-violet-50 px-4 py-2 text-[13px] font-medium text-primary hover:bg-violet-100">
                Upload Photo
                <input type="file" accept="image/*" hidden onChange={onAvatarPick} />
              </label>
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(null);
                  update("avatarUrl", "");
                }}
                className="text-[13px] font-medium text-danger-500"
              >
                Delete Photo
              </button>
              <span className="ml-auto text-[12px] text-slate-400">
                We only support .JPG, .JPEG, or .PNG file.
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Full Name" required>
              <Input
                value={form.name}
                onChange={(v) => update("name", v)}
                placeholder="Full Name"
                required
              />
            </Field>
            <Field label="Designation" required>
              <Input
                value={form.designation}
                onChange={(v) => update("designation", v)}
                placeholder="User Interface Designer"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                placeholder="Email"
              />
            </Field>
            <Field label="Phone Number">
              <Input
                value={form.phone}
                onChange={(v) => update("phone", v)}
                placeholder="Phone Number"
              />
            </Field>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-ink">Address</h2>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Country">
              <Select
                value={form.country}
                onChange={(v) => update("country", v)}
                options={COUNTRIES}
                placeholder="Select Country"
                withDot
              />
            </Field>
            <Field label="City">
              <Input value={form.city} onChange={(v) => update("city", v)} placeholder="City" />
            </Field>
            <Field label="Address">
              <Input
                value={form.address}
                onChange={(v) => update("address", v)}
                placeholder="Type your address"
              />
            </Field>
            <Field label="Postal Code">
              <Input
                value={form.postalCode}
                onChange={(v) => update("postalCode", v)}
                placeholder="Postal Code"
              />
            </Field>
            <Field label="User ID">
              <Input value={form.userId} onChange={(v) => update("userId", v)} placeholder="type id" />
            </Field>
            <Field label="User Status" required>
              <Select
                value={form.status}
                onChange={(v) => update("status", v as Form["status"])}
                options={["active", "inactive", "pending"]}
                renderLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
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
              {submitting ? "Saving…" : submitLabel}
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
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-lg border border-violet-100 bg-white px-3 text-[14px] outline-none placeholder:text-slate-300 focus:border-primary"
    />
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  renderLabel,
  withDot,
}: {
  value: T | "";
  onChange: (v: string) => void;
  options: readonly T[];
  placeholder?: string;
  renderLabel?: (v: T) => string;
  withDot?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 w-full appearance-none rounded-lg border border-violet-100 bg-white pr-9 text-[14px] outline-none focus:border-primary",
          withDot ? "pl-8" : "pl-3"
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {renderLabel ? renderLabel(o) : o}
          </option>
        ))}
      </select>
      {withDot && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <span className="block h-2.5 w-2.5 rounded-full bg-positive-500" />
        </span>
      )}
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}
