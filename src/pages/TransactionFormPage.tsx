import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, ChevronDown, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { listCourses } from "../api/courses";
import { cn } from "../lib/cn";

type Form = {
  courseId: string;
  courseName: string;
  fullName: string;
  designation: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  userId: string;
  status: "active" | "inactive" | "pending";
  transactionId: string;
  paymentMethod: "PayPal" | "Credit Card" | "Visa" | "Mastercard";
  basePrice: string;
  discountPct: string;
  avatarUrl: string;
};

const PRE_FILLED: Form = {
  courseId: "",
  courseName: "Language Learning Bootcamp: Mastering a New Language",
  fullName: "Onam Sarker",
  designation: "User Interface Designer",
  email: "onamsarker@gmail.com",
  phone: "+1 707 797 0462",
  country: "Bangladesh",
  city: "Dhaka",
  address: "Mirpur 10, Dhaka, Bangladesh",
  postalCode: "1214",
  userId: "#4454147",
  status: "active",
  transactionId: "dfd54181269641",
  paymentMethod: "PayPal",
  basePrice: "400",
  discountPct: "25",
  avatarUrl: "https://i.pravatar.cc/120?img=15",
};

const EMPTY: Form = {
  courseId: "",
  courseName: "",
  fullName: "",
  designation: "User Interface Designer",
  email: "",
  phone: "",
  country: "",
  city: "",
  address: "",
  postalCode: "",
  userId: "",
  status: "active",
  transactionId: "",
  paymentMethod: "PayPal",
  basePrice: "",
  discountPct: "",
  avatarUrl: "",
};

const COUNTRIES = ["Bangladesh", "United States", "United Kingdom", "India", "Pakistan", "Germany"];

export function TransactionFormPage({ prefill = false }: { prefill?: boolean }) {
  const nav = useNavigate();
  const [form, setForm] = useState<Form>(prefill ? PRE_FILLED : EMPTY);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    listCourses({ size: 100 })
      .then((p) => setCourses(p.items.map((c) => ({ id: c.id, title: c.title }))))
      .catch(() => {});
  }, []);

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
    setSubmitting(true);
    // Backend exposes no admin "create order" endpoint — UI-only for now.
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    setInfo(
      "Saved locally — backend has no admin create-order endpoint, so this transaction isn't persisted."
    );
    setTimeout(() => nav("/transactions"), 1200);
  }

  return (
    <AppShell>
      <form onSubmit={onSubmit}>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-ink">Add Transaction</h1>
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
              <Plus size={16} /> {submitting ? "Saving…" : "Add Transaction"}
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

          <div className="mt-6">
            <Field label="Course Name" required>
              {courses.length ? (
                <Select
                  value={form.courseId}
                  onChange={(v) => {
                    const c = courses.find((x) => x.id === v);
                    update("courseId", v);
                    update("courseName", c?.title ?? "");
                  }}
                  options={courses.map((c) => ({ value: c.id, label: c.title }))}
                  placeholder="type your product name"
                />
              ) : (
                <Input
                  value={form.courseName}
                  onChange={(v) => update("courseName", v)}
                  placeholder="type your product name"
                  trailing={<ChevronDown size={16} className="text-slate-400" />}
                />
              )}
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Full Name" required>
              <Input value={form.fullName} onChange={(v) => update("fullName", v)} placeholder="Full Name" />
            </Field>
            <Field label="Designation" required>
              <Input value={form.designation} onChange={(v) => update("designation", v)} placeholder="User Interface Designer" />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="Email" />
            </Field>
            <Field label="Phone Number">
              <Input value={form.phone} onChange={(v) => update("phone", v)} placeholder="Phone Number" />
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
                options={COUNTRIES.map((c) => ({ value: c, label: c }))}
                placeholder="Select Country"
                withDot
              />
            </Field>
            <Field label="City">
              <Input value={form.city} onChange={(v) => update("city", v)} placeholder="City" />
            </Field>
            <Field label="Address">
              <Input value={form.address} onChange={(v) => update("address", v)} placeholder="Type your address" />
            </Field>
            <Field label="Postal Code">
              <Input value={form.postalCode} onChange={(v) => update("postalCode", v)} placeholder="Postal Code" />
            </Field>
            <Field label="User ID">
              <Input value={form.userId} onChange={(v) => update("userId", v)} placeholder="type id" />
            </Field>
            <Field label="User Status" required>
              <Select
                value={form.status}
                onChange={(v) => update("status", v as Form["status"])}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "pending", label: "Pending" },
                ]}
              />
            </Field>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-ink">Payment</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Transaction">
              <Input
                value={form.transactionId}
                onChange={(v) => update("transactionId", v)}
                placeholder="type id"
              />
            </Field>
            <Field label="Payment Method" required>
              <Select
                value={form.paymentMethod}
                onChange={(v) => update("paymentMethod", v as Form["paymentMethod"])}
                options={[
                  { value: "PayPal", label: "PayPal" },
                  { value: "Credit Card", label: "Credit Card" },
                  { value: "Visa", label: "Visa" },
                  { value: "Mastercard", label: "Mastercard" },
                ]}
              />
            </Field>
            <Field label="Base Price" required>
              <PrefixInput prefix="$" value={form.basePrice} onChange={(v) => update("basePrice", v)} />
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

          {info && (
            <div className="mt-4 rounded-md bg-warn-50 px-3 py-2 text-[13px] text-amber-700">{info}</div>
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
              disabled={submitting}
              className="rounded-lg bg-primary px-8 py-2.5 text-[14px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Add"}
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
  trailing,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex h-11 items-center overflow-hidden rounded-lg border border-violet-100 bg-white focus-within:border-primary">
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-full flex-1 bg-transparent px-3 text-[14px] outline-none placeholder:text-slate-300"
      />
      {trailing && <div className="px-3">{trailing}</div>}
    </div>
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

function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  withDot,
}: {
  value: T | "";
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
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
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {withDot && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <span className="block h-2.5 w-2.5 rounded-full bg-positive-500" />
        </span>
      )}
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
