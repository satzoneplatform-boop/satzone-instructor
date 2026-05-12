import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Camera,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Key,
  Languages as LangIcon,
  Link2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";

function Facebook({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 8h2.5l.5-3H14V3.5C14 2.7 14.3 2 15.6 2H17V0h-2.6C12.2 0 11 1.3 11 3.5V5H8v3h3v8h3V8z" />
    </svg>
  );
}
function Twitter({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 5.8c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1A4.1 4.1 0 0 0 11.7 9c0 .3 0 .6.1.9A11.6 11.6 0 0 1 3 4.7a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4-.4.1-.8.2-1.2.2-.3 0-.6 0-.8-.1.6 1.6 2.1 2.8 4 2.9A8.2 8.2 0 0 1 2 18.5 11.6 11.6 0 0 0 8.3 20c7.5 0 11.6-6.2 11.6-11.5v-.5c.8-.6 1.5-1.3 2.1-2.2z" />
    </svg>
  );
}
function Instagram({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function Youtube({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.6 7.2s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C15.7 4 12 4 12 4s-3.7 0-6.7.3c-.4 0-1.3 0-2.1.9-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.4v1.5C2.2 13.4 2.4 15 2.4 15s.2 1.4.8 2c.8.8 1.8.8 2.3.9 1.7.2 7.1.3 7.1.3s3.7 0 6.7-.3c.4 0 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.6.2-3.1v-1.5c0-1.6-.2-3.2-.2-3.2zM9.9 13.6V7.7l4.8 3-4.8 2.9z" />
    </svg>
  );
}
import { useSearchParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAuth } from "../auth/AuthContext";
import {
  changePassword,
  getNotificationPrefs,
  getOnboarding,
  updateMe,
  updateNotificationPrefs,
  updateOnboarding,
} from "../api/me";
import { ApiError } from "../api/client";
import { cn } from "../lib/cn";

type TabKey = "general" | "account" | "link" | "languages" | "password" | "push";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; sub: string }[] = [
  { key: "general",   label: "General",           icon: Settings,    sub: "Est arcu pharetra pellentesque" },
  { key: "account",   label: "Account",           icon: User,        sub: "Est arcu pharetra pellentesque" },
  { key: "link",      label: "Link Account",      icon: Link2,       sub: "Est arcu pharetra pellentesque" },
  { key: "languages", label: "Languages",         icon: LangIcon,    sub: "Est arcu pharetra pellentesque" },
  { key: "password",  label: "Password",          icon: Key,         sub: "Est arcu pharetra pellentesque" },
  { key: "push",      label: "Push Notification", icon: ShieldCheck, sub: "Est arcu pharetra pellentesque" },
];

export function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const tabParam = (params.get("tab") as TabKey) ?? "general";
  const tab = TABS.find((t) => t.key === tabParam) ? tabParam : "general";

  function setTab(t: TabKey) {
    setParams((p) => {
      p.set("tab", t);
      return p;
    });
  }

  return (
    <AppShell>
      <div className="grid grid-cols-[260px_1fr] gap-6">
        <aside className="rounded-2xl bg-white p-3 shadow-sm">
          <ul className="flex flex-col gap-1">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <li key={t.key}>
                  <button
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition",
                      active ? "bg-primary text-white" : "text-secondary hover:bg-violet-50"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-lg",
                        active ? "bg-white/15" : "bg-violet-50 text-primary"
                      )}
                    >
                      <t.icon size={16} className={active ? "text-white" : "text-primary"} />
                    </span>
                    <span className="flex flex-1 flex-col leading-tight">
                      <span className="text-[14px] font-medium">{t.label}</span>
                      <span className={cn("text-[11px]", active ? "text-white/80" : "text-slate-400")}>
                        {t.sub}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          {tab === "general"   && <GeneralTab />}
          {tab === "account"   && <AccountTab />}
          {tab === "link"      && <LinkAccountTab />}
          {tab === "languages" && <LanguagesTab />}
          {tab === "password"  && <PasswordTab />}
          {tab === "push"      && <PushNotificationTab />}
        </section>
      </div>
    </AppShell>
  );
}

/* ============ General ============ */

function GeneralTab() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Bangladesh");
  const [city, setCity] = useState("Dhaka");
  const [address, setAddress] = useState("Mirpur-11, Dhaka 1214, Bangladesh");
  const [postal, setPostal] = useState("1214");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const [fn, ...rest] = user.full_name.split(" ");
    setFirstName(fn ?? "");
    setLastName(rest.join(" "));
    setEmail(user.email);
    setPhone(user.phone_number ?? "");
    setAvatarUrl(user.avatar_url ?? "");
  }, [user]);

  const avatarPreview = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    return avatarUrl;
  }, [avatarFile, avatarUrl]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const full_name = [firstName, lastName].filter(Boolean).join(" ").trim();
      await updateMe({ full_name });
      setMsg({ kind: "ok", text: "Saved." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <TabHeader title="General Setting" />

      <div className="mt-4 flex items-center gap-4 border-b border-violet-50 pb-5">
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-violet-50">
          {avatarPreview ? (
            <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
          ) : (
            <Camera size={20} className="text-slate-400" />
          )}
        </div>
        <div className="flex flex-1 items-center gap-3">
          <span className="text-[12px] text-slate-500">
            We only support .JPG, .JPEG, or .PNG file.
          </span>
          <label className="ml-auto cursor-pointer rounded-lg bg-violet-50 px-4 py-2 text-[13px] font-medium text-primary hover:bg-violet-100">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setAvatarFile(e.target.files?.[0] ?? null)
              }
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setAvatarFile(null);
              setAvatarUrl("");
            }}
            className="text-[13px] font-medium text-danger-500"
          >
            Delete Photo
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="First Name">
          <InputWithIcon icon={<User size={14} />} value={firstName} onChange={setFirstName} />
        </Field>
        <Field label="Last Name">
          <InputWithIcon icon={<User size={14} />} value={lastName} onChange={setLastName} />
        </Field>
        <Field label="Email">
          <InputWithIcon icon={<Mail size={14} />} value={email} onChange={setEmail} disabled />
        </Field>
        <Field label="Phone Number">
          <InputWithIcon icon={<Phone size={14} />} value={phone} onChange={setPhone} />
        </Field>
      </div>

      <h3 className="mt-6 text-[16px] font-semibold text-ink">Personal Address</h3>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Country">
          <CountrySelect value={country} onChange={setCountry} />
        </Field>
        <Field label="City">
          <InputWithIcon icon={null} value={city} onChange={setCity} />
        </Field>
        <Field label="Address">
          <InputWithIcon icon={<MapPin size={14} />} value={address} onChange={setAddress} />
        </Field>
        <Field label="Postal Code">
          <InputWithIcon icon={<Globe size={14} />} value={postal} onChange={setPostal} />
        </Field>
      </div>

      <ActionRow msg={msg} busy={busy} saveLabel="Public" />
    </form>
  );
}

/* ============ Account ============ */

function AccountTab() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const [fn, ...rest] = user.full_name.split(" ");
    setFirstName(fn ?? "");
    setLastName(rest.join(" "));
    setEmail(user.email);
    setPhone(user.phone_number ?? "");
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await updateMe({ full_name: [firstName, lastName].filter(Boolean).join(" ").trim() });
      setMsg({ kind: "ok", text: "Saved." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <TabHeader title="Account Setting" />

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="First Name">
          <InputWithIcon icon={<User size={14} />} value={firstName} onChange={setFirstName} />
        </Field>
        <Field label="Last Name">
          <InputWithIcon icon={<User size={14} />} value={lastName} onChange={setLastName} />
        </Field>
        <Field label="Email">
          <InputWithIcon icon={<Mail size={14} />} value={email} onChange={setEmail} disabled />
        </Field>
        <Field label="Phone Number">
          <InputWithIcon icon={<Phone size={14} />} value={phone} onChange={setPhone} />
        </Field>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-primary px-6 py-2.5 text-[14px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save Change"}
        </button>
        {msg && <FormMessage msg={msg} />}
      </div>
    </form>
  );
}

/* ============ Link Account ============ */

const SOCIAL_FIELDS: { key: keyof SocialState; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; placeholder: string }[] = [
  { key: "facebook",  label: "Facebook",  icon: Facebook,  placeholder: "https://facebook.com/Taildo" },
  { key: "twitter",   label: "Twitter",   icon: Twitter,   placeholder: "https://twitter.com/Taildo" },
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/Taildo" },
  { key: "youtube",   label: "YouTube",   icon: Youtube,   placeholder: "https://youtube.com/Taildo" },
];

type SocialState = { facebook: string; twitter: string; instagram: string; youtube: string };

function LinkAccountTab() {
  const [links, setLinks] = useState<SocialState>({
    facebook: "https://facebook.com/Taildo",
    twitter: "https://twitter.com/Taildo",
    instagram: "https://instagram.com/Taildo",
    youtube: "https://youtube.com/Taildo",
  });
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Backend has no social-links field; store locally and surface that.
    try {
      localStorage.setItem("studyq.social", JSON.stringify(links));
      setMsg({ kind: "ok", text: "Saved locally — backend doesn't store social profiles yet." });
    } catch {
      setMsg({ kind: "err", text: "Could not save." });
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("studyq.social");
      if (raw) setLinks(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  return (
    <form onSubmit={onSubmit}>
      <TabHeader
        title="Link Account"
        subtitle="These social profiles will appear on your website"
      />

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
        {SOCIAL_FIELDS.map((f) => (
          <Field key={f.key} label={f.label}>
            <InputWithIcon
              icon={<f.icon size={14} />}
              value={links[f.key]}
              onChange={(v) => setLinks((s) => ({ ...s, [f.key]: v }))}
              placeholder={f.placeholder}
            />
          </Field>
        ))}
      </div>

      <ActionRow msg={msg} busy={false} saveLabel="Save Change" />
    </form>
  );
}

/* ============ Languages ============ */

const LANGUAGES = [
  { code: "en-US", label: "English (USA)", flag: "🇺🇸" },
  { code: "en-GB", label: "English (GBR)", flag: "🇬🇧" },
  { code: "fr",    label: "France (FR)",   flag: "🇫🇷" },
  { code: "es",    label: "Spain (ES)",    flag: "🇪🇸" },
  { code: "it",    label: "Italy (IT)",    flag: "🇮🇹" },
  { code: "gr",    label: "Greece (GR)",   flag: "🇬🇷" },
  { code: "sg",    label: "Singapore (SG)", flag: "🇸🇬" },
  { code: "nl",    label: "Netherlands (NL)", flag: "🇳🇱" },
  { code: "in",    label: "India (IN)",    flag: "🇮🇳" },
];

function LanguagesTab() {
  const [selected, setSelected] = useState("en-US");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    getOnboarding()
      .then((o) => {
        const locale = o.profile?.locale;
        if (!locale) return;
        const hit = LANGUAGES.find((l) => l.code === locale || l.code.startsWith(locale));
        if (hit) setSelected(hit.code);
      })
      .catch(() => {});
  }, []);

  const filtered = LANGUAGES.filter((l) =>
    l.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await updateOnboarding({ locale: selected.split("-")[0] || selected });
      setMsg({ kind: "ok", text: "Language saved." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <TabHeader title="Languages" subtitle="These social profiles will appear on your website" />

      <div className="mt-5 flex items-center gap-2 rounded-full border-[1.5px] border-violet-50 bg-white px-3 py-2.5">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search your country based languages"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-slate-300 focus:outline-none"
        />
      </div>

      <ul className="mt-3 max-h-[360px] overflow-y-auto divide-y divide-violet-50">
        {filtered.map((l) => {
          const active = selected === l.code;
          return (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => setSelected(l.code)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition",
                  active ? "bg-violet-50 rounded-lg" : "hover:bg-violet-50/60"
                )}
              >
                <span className="inline-flex items-center gap-3">
                  <span className="text-[18px] leading-none">{l.flag}</span>
                  <span className="text-[14px] text-secondary">{l.label}</span>
                </span>
                {active ? (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-white">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 3.5L4 6.5L9 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : (
                  <ChevronRight size={14} className="text-slate-300" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <ActionRow msg={msg} busy={busy} saveLabel="Save Change" />
    </form>
  );
}

/* ============ Password ============ */

function PasswordTab() {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await changePassword({ current_password: oldPw, new_password: newPw });
      setMsg({ kind: "ok", text: "Password updated." });
      setOldPw("");
      setNewPw("");
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === "invalid_credentials") setMsg({ kind: "err", text: "Current password is wrong." });
        else setMsg({ kind: "err", text: e.message });
      } else {
        setMsg({ kind: "err", text: "Could not update password." });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <TabHeader title="Password" subtitle="Give me correct password and change password" />

      <div className="mt-5 grid grid-cols-[1fr_220px] items-start gap-8">
        <div className="flex flex-col gap-4">
          <Field label="Old Password">
            <PasswordInput
              value={oldPw}
              onChange={setOldPw}
              show={showOld}
              onToggle={() => setShowOld((v) => !v)}
            />
          </Field>
          <Field label="New Password">
            <PasswordInput
              value={newPw}
              onChange={setNewPw}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
            />
          </Field>
        </div>

        <div className="relative grid h-[180px] place-items-center">
          <div className="absolute inset-x-12 top-4 grid h-10 place-items-center rounded-md bg-primary text-white">
            <span className="font-bold tracking-[8px]">***</span>
          </div>
          <div className="absolute right-2 top-12 grid h-[120px] w-[120px] place-items-center rounded-full bg-violet-50">
            <Lock size={36} className="text-slate-400" />
          </div>
          <div className="absolute -bottom-1 right-0 grid h-8 w-8 place-items-center rounded-full bg-primary text-white">
            <ShieldCheck size={16} />
          </div>
        </div>
      </div>

      <ActionRow msg={msg} busy={busy} saveLabel="Yes! Update" />
    </form>
  );
}

/* ============ Push Notification ============ */

type NotifKey =
  | "orderConfirmation"
  | "orderEdited"
  | "orderCancelled"
  | "paymentError"
  | "customerInvite"
  | "contactCustomer"
  | "accountPasswordReset"
  | "emailMarketing";

const NOTIF_SECTIONS: { title: string; items: { key: NotifKey; label: string; sub: string }[] }[] = [
  {
    title: "Order",
    items: [
      { key: "orderConfirmation", label: "Order Confirmation", sub: "Sent automatically to the customer after they place their order." },
      { key: "orderEdited",       label: "Order Edited",       sub: "Sent to the customer after their order is edited (if you select this option)." },
      { key: "orderCancelled",    label: "Order Cancelled",    sub: "Sent automatically to the customer after their order is cancelled (if you select this option)." },
      { key: "paymentError",      label: "Payment Error",      sub: "Sent automatically to the customer if their payment can't be processed during checkout." },
    ],
  },
  {
    title: "Customer",
    items: [
      { key: "customerInvite",        label: "Customer Account Invite", sub: "Sent automatically to the customer after they place their order." },
      { key: "contactCustomer",       label: "Contact Customer",        sub: "Sent to the customer after their order is edited (if you select this option)." },
      { key: "accountPasswordReset",  label: "Account Password Reset",  sub: "Sent automatically to the customer if their payment can't be processed during checkout." },
    ],
  },
  {
    title: "Email Marketing",
    items: [
      { key: "emailMarketing", label: "Email Marketing", sub: "Sent automatically to the customer after they place their order." },
    ],
  },
];

function PushNotificationTab() {
  const [prefs, setPrefs] = useState<Record<NotifKey, boolean>>({
    orderConfirmation: true,
    orderEdited: false,
    orderCancelled: false,
    paymentError: true,
    customerInvite: true,
    contactCustomer: false,
    accountPasswordReset: true,
    emailMarketing: true,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    getNotificationPrefs()
      .then((p) => {
        setPrefs((s) => ({
          ...s,
          emailMarketing: p.email_marketing,
          // Map the only two that have direct backend equivalents
          orderConfirmation: p.email_course_updates,
        }));
      })
      .catch(() => {});
  }, []);

  function toggle(k: NotifKey) {
    setPrefs((p) => ({ ...p, [k]: !p[k] }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      // Only email_marketing has a stable backend mapping; persist what we can.
      await updateNotificationPrefs({
        email_marketing: prefs.emailMarketing,
        email_course_updates: prefs.orderConfirmation,
      });
      setMsg({
        kind: "ok",
        text: "Saved (only marketing + course-updates persist to backend yet).",
      });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="-m-6 p-6">
      {NOTIF_SECTIONS.map((sec, idx) => (
        <div key={sec.title} className={cn("flex flex-col gap-4", idx > 0 && "mt-6 border-t border-violet-50 pt-6")}>
          <h3 className="text-[15px] font-semibold text-ink">{sec.title}</h3>
          <ul className="flex flex-col gap-4">
            {sec.items.map((it) => (
              <li key={it.key} className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-secondary">{it.label}</p>
                  <p className="mt-0.5 text-[12px] text-slate-500">{it.sub}</p>
                </div>
                <Toggle on={prefs[it.key]} onToggle={() => toggle(it.key)} />
              </li>
            ))}
          </ul>
        </div>
      ))}

      <ActionRow msg={msg} busy={busy} saveLabel="Yes! Update" />
    </form>
  );
}

/* ============ Shared atoms ============ */

function TabHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-violet-50 pb-4">
      <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-secondary">{label}</span>
      {children}
    </label>
  );
}

function InputWithIcon({
  icon,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  icon: React.ReactNode | null;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 focus-within:border-primary",
        disabled && "bg-slate-50"
      )}
    >
      {icon && <span className="text-slate-400">{icon}</span>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-300 disabled:text-slate-500"
      />
    </div>
  );
}

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const COUNTRIES = ["Bangladesh", "United States", "United Kingdom", "India", "Pakistan", "Germany"];
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-amber-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-lg border border-violet-100 bg-white pl-7 pr-9 text-[14px] outline-none focus:border-primary"
      >
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 focus-within:border-primary">
      <Lock size={14} className="text-slate-400" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-300"
        placeholder="••••••••••••"
      />
      <button
        type="button"
        onClick={onToggle}
        className="text-slate-500"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition",
        on ? "bg-primary" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
          on ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function ActionRow({
  msg,
  busy,
  saveLabel,
}: {
  msg: { kind: "ok" | "err"; text: string } | null;
  busy: boolean;
  saveLabel: string;
}) {
  return (
    <div className="mt-6 flex items-center gap-4">
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-primary px-6 py-2.5 text-[14px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {busy ? "Saving…" : saveLabel}
      </button>
      <button
        type="reset"
        className="text-[14px] font-medium text-danger-500 hover:underline"
      >
        No! Cancel
      </button>
      {msg && <FormMessage msg={msg} />}
    </div>
  );
}

function FormMessage({ msg }: { msg: { kind: "ok" | "err"; text: string } }) {
  return (
    <span
      className={cn(
        "rounded-md px-3 py-1.5 text-[12px]",
        msg.kind === "ok" ? "bg-positive-50 text-positive-600" : "bg-danger-50 text-danger-500"
      )}
    >
      {msg.text}
    </span>
  );
}
