import { useEffect, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import {
  Bell,
  Briefcase,
  Camera,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Settings,
  ShieldCheck,
  User,
  X,
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
  updateMe,
  updateNotificationPrefs,
} from "../api/me";
import { CircularProgress } from "../components/CircularProgress";
import {
  deleteMyInstructorAvatar,
  getMyInstructorProfile,
  updateMyInstructorProfile,
  uploadMyInstructorAvatarWithProgress,
} from "../api/instructor";
import type { InstructorProfileRead } from "../api/types";
import { ApiError } from "../api/client";
import { cn } from "../lib/cn";

type TabKey = "general" | "security" | "notifications";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; sub: string }[] = [
  { key: "general",       label: "General",       icon: Settings,    sub: "Profile, info & social links" },
  { key: "security",      label: "Security",      icon: ShieldCheck, sub: "Change your password" },
  { key: "notifications", label: "Notifications", icon: Bell,        sub: "Email & push preferences" },
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
          {tab === "general"       && <CombinedGeneralTab />}
          {tab === "security"      && <SecurityTab />}
          {tab === "notifications" && <NotificationsTab />}
        </section>
      </div>
    </AppShell>
  );
}

/* ============ Unified Profile tab ============ */

function CombinedGeneralTab() {
  return <UnifiedProfileTab />;
}

function UnifiedProfileTab() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<InstructorProfileRead | null>(null);

  // Identity
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Instructor info
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);

  // Address (stored locally — no backend support yet)
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postal, setPostal] = useState("");

  // Social links
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPct, setAvatarPct] = useState<number | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  // Form state
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

  useEffect(() => {
    getMyInstructorProfile()
      .then((p) => {
        setProfile(p);
        setTitle(p.title ?? "");
        setBio(p.bio ?? "");
        setExpertise(p.expertise ?? []);
        setLinkedin(p.linkedin_url ?? "");
        setTwitter(p.twitter_url ?? "");
        setWebsite(p.website_url ?? "");
        setAvatarUrl(p.avatar_url ?? "");
      })
      .catch(() => {});
    try {
      const raw = localStorage.getItem("studyq.local");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.facebook)  setFacebook(saved.facebook);
        if (saved.instagram) setInstagram(saved.instagram);
        if (saved.youtube)   setYoutube(saved.youtube);
        if (saved.country)   setCountry(saved.country);
        if (saved.city)      setCity(saved.city);
        if (saved.address)   setAddress(saved.address);
        if (saved.postal)    setPostal(saved.postal);
      }
    } catch { /* ignore */ }
  }, []);

  async function onPickAvatar(file: File) {
    setAvatarBusy(true);
    setAvatarPct(0);
    setMsg(null);
    try {
      const r = await uploadMyInstructorAvatarWithProgress(file, setAvatarPct);
      setAvatarUrl(r.url);
      setMsg({ kind: "ok", text: "Photo updated." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : "Upload failed." });
    } finally {
      setAvatarBusy(false);
      setAvatarPct(null);
    }
  }

  async function onDeleteAvatar() {
    setAvatarBusy(true);
    setMsg(null);
    try {
      await deleteMyInstructorAvatar();
      setAvatarUrl("");
      setMsg({ kind: "ok", text: "Photo removed." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : "Could not delete." });
    } finally {
      setAvatarBusy(false);
    }
  }

  function addExpertiseTag() {
    const tag = expertiseInput.trim();
    if (!tag || expertise.includes(tag)) return;
    setExpertise((prev) => [...prev, tag]);
    setExpertiseInput("");
  }

  function removeExpertiseTag(tag: string) {
    setExpertise((prev) => prev.filter((t) => t !== tag));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const full_name = [firstName, lastName].filter(Boolean).join(" ").trim();
      await Promise.all([
        updateMe({ full_name }),
        updateMyInstructorProfile({
          name: full_name || undefined,
          title: title.trim() || undefined,
          bio: bio.trim() || undefined,
          expertise: expertise.length ? expertise : undefined,
          linkedin_url: linkedin.trim() || undefined,
          twitter_url: twitter.trim() || undefined,
          website_url: website.trim() || undefined,
        }),
      ]);
      localStorage.setItem("studyq.local", JSON.stringify({ facebook, instagram, youtube, country, city, address, postal }));
      await refreshUser();
      setMsg({ kind: "ok", text: "Profile saved." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <TabHeader title="Profile" subtitle="Your public instructor page visible to students" />

      {/* Avatar */}
      <div className="mt-5 flex items-center gap-4 border-b border-violet-50 pb-5">
        <div className="relative">
          <div className="grid h-16 w-16 overflow-hidden rounded-full bg-violet-50">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Camera size={22} className="m-auto text-slate-400" />
            )}
          </div>
          {avatarPct !== null && (
            <div className="absolute inset-0 grid place-items-center rounded-full bg-black/40">
              <CircularProgress pct={avatarPct} size={52} strokeWidth={3} trackColor="rgba(255,255,255,0.3)" progressColor="#fff" />
            </div>
          )}
          {profile && !avatarBusy && avatarUrl && (
            <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-positive-500 text-white">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 3.5L4 6.5L9 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
        <div className="flex flex-1 items-center gap-3">
          <span className="text-[12px] text-slate-500">
            {profile
              ? `${profile.students_count.toLocaleString()} students · ${profile.courses_count} courses · ${Number(profile.rating_avg).toFixed(1)}★`
              : "Upload a professional photo for your public profile"}
          </span>
          <label className="ml-auto cursor-pointer rounded-lg bg-violet-50 px-4 py-2 text-[13px] font-medium text-primary hover:bg-violet-100">
            {avatarBusy && avatarPct !== null ? "Uploading…" : "Upload Photo"}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={avatarBusy}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files?.[0];
                if (f) void onPickAvatar(f);
                e.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={onDeleteAvatar}
            disabled={avatarBusy || !avatarUrl}
            className="text-[13px] font-medium text-danger-500 disabled:opacity-50"
          >
            Delete Photo
          </button>
        </div>
      </div>

      {/* Identity */}
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
          <InputWithIcon icon={<Phone size={14} />} value={phone} onChange={setPhone} disabled />
        </Field>
      </div>

      {/* Instructor info */}
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Title / Role">
          <InputWithIcon icon={<Briefcase size={14} />} value={title} onChange={setTitle} placeholder="e.g. Senior Web Developer" />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Tell students about your background and teaching style…"
            className="w-full resize-none rounded-lg border border-violet-100 bg-white px-3 py-2.5 text-[14px] text-ink placeholder:text-slate-300 focus:border-primary focus:outline-none"
          />
          <span className="mt-1 block text-right text-[11px] text-slate-400">{bio.length}/1000</span>
        </Field>
      </div>

      {/* Expertise tags */}
      <div className="mt-4">
        <Field label="Expertise">
          <div className="flex gap-2">
            <InputWithIcon
              icon={null}
              value={expertiseInput}
              onChange={setExpertiseInput}
              placeholder="e.g. React, Node.js, Python"
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") { e.preventDefault(); addExpertiseTag(); }
              }}
            />
            <button
              type="button"
              onClick={addExpertiseTag}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-primary hover:bg-violet-100"
            >
              <Plus size={16} />
            </button>
          </div>
          {expertise.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {expertise.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-[12px] font-medium text-primary">
                  {tag}
                  <button type="button" onClick={() => removeExpertiseTag(tag)} className="text-primary/60 hover:text-danger-500" aria-label={`Remove ${tag}`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>
      </div>

      {/* Address */}
      <h3 className="mt-6 text-[15px] font-semibold text-ink">Personal Address</h3>
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

      {/* Social links */}
      <h3 className="mt-6 text-[15px] font-semibold text-ink">Social Links</h3>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="LinkedIn">
          <InputWithIcon icon={<Globe size={14} />} value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/yourname" />
        </Field>
        <Field label="Twitter / X">
          <InputWithIcon icon={<Globe size={14} />} value={twitter} onChange={setTwitter} placeholder="https://twitter.com/yourname" />
        </Field>
        <Field label="Website">
          <InputWithIcon icon={<Globe size={14} />} value={website} onChange={setWebsite} placeholder="https://yourwebsite.com" />
        </Field>
        <Field label="Facebook">
          <InputWithIcon icon={<Facebook size={14} />} value={facebook} onChange={setFacebook} placeholder="https://facebook.com/yourname" />
        </Field>
        <Field label="Instagram">
          <InputWithIcon icon={<Instagram size={14} />} value={instagram} onChange={setInstagram} placeholder="https://instagram.com/yourname" />
        </Field>
        <Field label="YouTube">
          <InputWithIcon icon={<Youtube size={14} />} value={youtube} onChange={setYoutube} placeholder="https://youtube.com/yourchannel" />
        </Field>
      </div>

      <ActionRow msg={msg} busy={busy} saveLabel="Save Profile" />
    </form>
  );
}



/* ============ Security (Password + Notifications) ============ */

function SecurityTab() {
  return (
    <div>
      <TabHeader title="Change Password" subtitle="Update your password to keep your account secure" />
      <PasswordForm />
    </div>
  );
}

function NotificationsTab() {
  return (
    <div>
      <TabHeader title="Notifications" subtitle="Choose which emails and alerts you receive" />
      <NotificationsForm />
    </div>
  );
}

function PasswordForm() {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setMsg({ kind: "err", text: "New passwords do not match." });
      return;
    }
    if (newPw.length < 8) {
      setMsg({ kind: "err", text: "New password must be at least 8 characters." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await changePassword({ current_password: oldPw, new_password: newPw });
      setMsg({ kind: "ok", text: "Password updated." });
      setOldPw("");
      setNewPw("");
      setConfirmPw("");
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
    <form onSubmit={onSubmit} className="mt-5">
      <div className="grid grid-cols-[1fr_220px] items-start gap-8">
        <div className="flex flex-col gap-4">
          <Field label="Current Password">
            <PasswordInput value={oldPw} onChange={setOldPw} show={showOld} onToggle={() => setShowOld((v) => !v)} />
          </Field>
          <Field label="New Password">
            <PasswordInput value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew((v) => !v)} />
          </Field>
          <Field label="Confirm New Password">
            <PasswordInput value={confirmPw} onChange={setConfirmPw} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
          </Field>
          {newPw && confirmPw && newPw !== confirmPw && (
            <p className="text-[12px] text-danger-500">Passwords do not match.</p>
          )}
        </div>
        <div className="relative grid h-[220px] place-items-center">
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
      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={busy || !oldPw || !newPw || !confirmPw}
          className="rounded-lg bg-primary px-6 py-2.5 text-[14px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Update Password"}
        </button>
        {msg && <FormMessage msg={msg} />}
      </div>
    </form>
  );
}

type NotifPrefs2 = {
  email_marketing: boolean;
  email_announcements: boolean;
  email_course_updates: boolean;
  push_enabled: boolean;
};

const NOTIF_ITEMS2: { key: keyof NotifPrefs2; label: string; sub: string }[] = [
  { key: "email_course_updates", label: "Course Updates",     sub: "Enrollment confirmations, lesson updates, and course changes." },
  { key: "email_announcements",  label: "Announcements",      sub: "Platform news, new features, and important account notices." },
  { key: "email_marketing",      label: "Marketing Emails",   sub: "Promotional offers and tips to grow your course catalogue." },
  { key: "push_enabled",         label: "Push Notifications", sub: "Real-time alerts for enrollments, payments, and student activity." },
];

function NotificationsForm() {
  const [prefs, setPrefs] = useState<NotifPrefs2>({
    email_marketing: true,
    email_announcements: true,
    email_course_updates: true,
    push_enabled: false,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    getNotificationPrefs()
      .then((p) => setPrefs({
        email_marketing:     p.email_marketing,
        email_announcements: p.email_announcements,
        email_course_updates: p.email_course_updates,
        push_enabled:        p.push_enabled,
      }))
      .catch(() => {});
  }, []);

  function toggle(k: keyof NotifPrefs2) {
    setPrefs((p) => ({ ...p, [k]: !p[k] }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await updateNotificationPrefs(prefs);
      setMsg({ kind: "ok", text: "Notification preferences saved." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="mt-4">
      <ul className="flex flex-col divide-y divide-violet-50">
        {NOTIF_ITEMS2.map((it) => (
          <li key={it.key} className="flex items-start justify-between gap-4 py-4">
            <div className="flex-1">
              <p className="text-[14px] font-medium text-secondary">{it.label}</p>
              <p className="mt-0.5 text-[12px] text-slate-500">{it.sub}</p>
            </div>
            <Toggle on={prefs[it.key]} onToggle={() => toggle(it.key)} />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-primary px-6 py-2.5 text-[14px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save Preferences"}
        </button>
        {msg && <FormMessage msg={msg} />}
      </div>
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
  onKeyDown,
}: {
  icon: React.ReactNode | null;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
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
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-300 disabled:text-slate-500"
      />
    </div>
  );
}

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Azerbaijan",
  "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina", "Brazil",
  "Cambodia", "Canada", "Chile", "China", "Colombia", "Croatia", "Czech Republic",
  "Denmark", "Ecuador", "Egypt", "Ethiopia", "Finland", "France",
  "Georgia", "Germany", "Ghana", "Greece", "Guatemala",
  "Hungary", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait",
  "Lebanon", "Libya", "Lithuania", "Malaysia", "Mexico", "Morocco",
  "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway",
  "Pakistan", "Palestine", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Saudi Arabia", "Senegal", "Serbia",
  "Singapore", "Slovakia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tanzania", "Thailand", "Tunisia", "Turkey",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zimbabwe",
];

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-amber-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-lg border border-violet-100 bg-white pl-7 pr-9 text-[14px] outline-none focus:border-primary"
      >
        <option value="" disabled>Select country</option>
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
        Cancel
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
