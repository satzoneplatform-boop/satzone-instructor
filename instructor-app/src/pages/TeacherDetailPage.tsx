import { useEffect, useState } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { getInstructor } from "../api/admin";
import { TOP_COURSES_MOCK } from "../data/teachersMock";
import { cn } from "../lib/cn";
import type { AdminInstructorRead } from "../api/types";

const COL = ["Course Name", "Sale", "Date", "Price", "Status", "Action"];

export function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [data, setData] = useState<AdminInstructorRead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    getInstructor(id)
      .then((d) => mounted && setData(d))
      .catch(() => mounted && setData(null))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  // mock fallback so the design still renders end-to-end
  const fallback: AdminInstructorRead = {
    id: id ?? "—",
    user_id: null,
    slug: "osama-richard",
    name: "Osama Richard",
    title: "UX Designer",
    bio: null,
    avatar_url: "https://i.pravatar.cc/240?img=12",
    expertise: [
      "Coordinating with cross-functional teams.",
      "Expertise in UX, Wireframing, Prototyping.",
    ],
    linkedin_url: null,
    twitter_url: null,
    website_url: null,
    rating_avg: "4.9",
    students_count: 220,
    courses_count: 4.37 as unknown as number,
    created_at: new Date().toISOString(),
  };
  const t = data ?? fallback;

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-ink">{t.name}</h1>
          <p className="mt-1 text-[14px] text-slate-600">Let's check your update today</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav("/teachers")}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary"
          >
            <X size={16} /> Cancel
          </button>
          <button
            type="button"
            onClick={() => nav(`/teachers/${t.id}/edit`)}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-[14px] font-medium text-white hover:bg-secondary/90"
          >
            <Plus size={16} /> Add Teachers
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[420px_1fr] gap-6">
        <ProfileCard t={t} loading={loading} />
        <TopCoursesCard />
      </div>
    </AppShell>
  );
}

function ProfileCard({ t, loading }: { t: AdminInstructorRead; loading: boolean }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <img
          src={t.avatar_url ?? "https://i.pravatar.cc/240?img=12"}
          alt={t.name}
          className="h-[120px] w-[120px] rounded-full object-cover"
        />
        <h2 className="mt-4 text-[18px] font-semibold text-ink">{t.name}</h2>
        <span className="mt-1 text-[13px] text-slate-600">{t.title ?? "UX Designer"}</span>

        <div className="mt-5 grid w-full grid-cols-3 divide-x divide-violet-50 rounded-xl bg-violet-50/40 py-3">
          <Stat label="Earning" value="4.37" />
          <Stat label="Courses" value={String(t.courses_count ?? 220)} />
          <Stat label="Rating" value={String(t.rating_avg ?? "4.9")} />
        </div>
      </div>

      <Section title="Short Bio">
        <ul className="mt-2 space-y-1 text-[13px] text-slate-600">
          {(t.expertise ?? []).map((line, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Personal Information">
        <div className="mt-2 flex flex-col gap-2 text-[13px] text-slate-600">
          <Row icon={<Mail size={14} />} label="osamarichard@gmail.com" />
          <Row icon={<MapPin size={14} />} label="Mirpur-10, Dhaka 1231" />
          <Row icon={<Phone size={14} />} label="+1 707 797 0469" />
        </div>
      </Section>

      <Section title="Last Achievement">
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-violet-100 p-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-warn-50">
            <Trophy size={18} className="text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-ink">Top Instructor 2026</p>
            <p className="truncate text-[12px] text-slate-400">Awarded by StudyQ</p>
          </div>
        </div>
      </Section>

      {loading && <p className="mt-4 text-[12px] text-slate-400">Loading…</p>}
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[16px] font-bold text-ink">{value}</span>
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function TopCoursesCard() {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-[18px] font-semibold text-ink">Top Courses</h2>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-violet-100 px-3 py-2 text-[13px] font-medium text-secondary">
            Sort by: All Categories
          </button>
          <button className="rounded-md border border-violet-100 px-3 py-2 text-[13px] font-medium text-primary">
            View All
          </button>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-violet-50 text-left">
            {COL.map((c) => (
              <th key={c} className="py-2 text-[12px] font-medium text-slate-600">
                <span className="inline-flex items-center gap-1">
                  {c}
                  {c !== "Action" && <ArrowDownUp size={12} className="text-slate-400" />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TOP_COURSES_MOCK.map((c) => (
            <tr key={c.id} className="border-b border-violet-50 last:border-0">
              <td className="py-3">
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-ink">{c.title}</span>
                  <span className="text-[11px] text-slate-400">{c.code}</span>
                </div>
              </td>
              <td className="py-3 text-[13px] text-secondary">{c.sale}</td>
              <td className="py-3 text-[13px] text-secondary">{c.date}</td>
              <td className="py-3 text-[13px] font-medium text-ink">{c.price}</td>
              <td className="py-3">
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                    c.status === "active"
                      ? "bg-positive-50 text-positive-600"
                      : "bg-warn-50 text-amber-600"
                  )}
                >
                  {c.status === "active" ? "Active" : "Pending"}
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-1.5">
                  <button className="grid h-7 w-7 place-items-center rounded-md bg-positive-50 text-positive-600">
                    <Eye size={14} />
                  </button>
                  <button className="grid h-7 w-7 place-items-center rounded-md bg-violet-50 text-primary">
                    <Pencil size={14} />
                  </button>
                  <button className="grid h-7 w-7 place-items-center rounded-md bg-danger-50 text-danger-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-end pt-3">
        <nav className="flex items-center gap-1">
          <button className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-violet-50">
            <ChevronLeft size={16} />
          </button>
          {["1", "2", "3", "4", "...", "20"].map((p, i) => (
            <button
              key={i}
              className={cn(
                "grid h-7 min-w-[28px] place-items-center rounded px-2 text-[13px]",
                p === "2"
                  ? "bg-primary font-medium text-white"
                  : "text-slate-600 hover:bg-violet-50"
              )}
            >
              {p}
            </button>
          ))}
          <button className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-violet-50">
            <ChevronRight size={16} />
          </button>
        </nav>
      </div>
    </section>
  );
}
