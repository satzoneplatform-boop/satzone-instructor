import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Play,
  Plus,
  Send,
  Star,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { getCourse, getCurriculum } from "../api/courses";
import {
  COURSE_FEATURES,
  COURSE_OVERVIEW,
  CURRICULUM_MOCK,
  FAQS_MOCK,
  RATING_BREAKDOWN,
  REVIEWS_MOCK,
} from "../data/coursesMock";
import { cn } from "../lib/cn";
import type { AdminCourseRead, CurriculumRead } from "../api/types";

type Tab = "overview" | "faq" | "review";

const TAB_HEADINGS: Record<Tab, string> = {
  overview: "Course Overview",
  faq: "Course FAQ",
  review: "Course Review",
};

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [course, setCourse] = useState<AdminCourseRead | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumRead | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getCourse(id)
      .then((c) => {
        if (!mounted) return;
        setCourse(c);
        return getCurriculum(c.slug);
      })
      .then((c) => mounted && c && setCurriculum(c))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [id]);

  const title = course?.title ?? "Mastering Excel: From Basics to Advanced Formulas";
  const thumb =
    course?.thumbnail_url ?? "https://picsum.photos/seed/excel-cover/960/360";
  const instructorName = course?.instructor?.name ?? "AJOY Sarkar";
  const instructorAvatar =
    course?.instructor?.avatar_url ?? "https://i.pravatar.cc/80?img=12";

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-ink">{TAB_HEADINGS[tab]}</h1>
          <p className="mt-1 text-[14px] text-slate-600">Let's check your update today</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav("/courses")}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary"
          >
            <X size={16} /> Cancel
          </button>
          <button
            type="button"
            onClick={() => nav("/courses/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-[14px] font-medium text-white hover:bg-secondary/90"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="relative overflow-hidden rounded-xl">
            <img src={thumb} alt={title} className="h-[360px] w-full object-cover" />
            <button
              type="button"
              className="absolute inset-0 grid place-items-center"
              aria-label="Play preview"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 shadow-lg">
                <Play size={26} className="ml-1 fill-primary text-primary" />
              </span>
            </button>
          </div>

          <h2 className="mt-5 text-[20px] font-semibold text-ink">{title}</h2>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <img src={instructorAvatar} alt={instructorName} className="h-7 w-7 rounded-full object-cover" />
              <span className="text-[13px] font-medium text-secondary">{instructorName}</span>
              <span className="text-[11px] text-slate-400">Instructor</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[13px] text-secondary">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="font-medium">4.5</span>
              <span className="text-slate-400">(13 reviews)</span>
            </span>
          </div>

          <nav className="mt-5 flex items-center gap-6 border-b border-violet-100">
            {(["overview", "faq", "review"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "relative pb-3 text-[13px] font-medium capitalize transition",
                  tab === t ? "text-primary" : "text-slate-500 hover:text-secondary"
                )}
              >
                {t === "overview" ? "Overview" : t === "faq" ? "FAQ" : "Review"}
                {tab === t && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-5">
            {tab === "overview" && <OverviewPanel />}
            {tab === "faq" && <FaqPanel />}
            {tab === "review" && <ReviewPanel />}
          </div>
        </section>

        <CourseContentSidebar curriculum={curriculum} />
      </div>
    </AppShell>
  );
}

function OverviewPanel() {
  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-6 text-secondary">{COURSE_OVERVIEW}</p>

      <div>
        <h3 className="text-[14px] font-semibold text-ink">What You'll Learn:</h3>
        <ul className="mt-2 space-y-2 text-[14px] leading-6 text-secondary">
          {COURSE_FEATURES.map((f) => (
            <li key={f.title} className="flex items-start gap-2">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              <span>
                <span className="font-semibold text-ink">{f.title}</span> {f.body}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-[14px] font-semibold text-ink">Why Take This Course:</h3>
        <ul className="mt-2 space-y-2 text-[14px] leading-6 text-secondary">
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>
              <span className="font-semibold text-ink">Practical Application:</span> Gain hands-on
              experience applicable across industries.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>
              <span className="font-semibold text-ink">Career Advancement:</span> Boost your
              employability with sought-after Excel skills.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>
              <span className="font-semibold text-ink">Flexibility:</span> Study at your own pace,
              anytime, anywhere.
            </span>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-[14px] font-semibold text-ink">Who Should Enroll:</h3>
        <ul className="mt-2 space-y-2 text-[14px] leading-6 text-secondary">
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            Beginners and intermediates users seeking to excel in Excel.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            Professionals aiming to enhance productivity with data analysis.
          </li>
        </ul>
      </div>
    </div>
  );
}

function FaqPanel() {
  const [openIdx, setOpenIdx] = useState<number | null>(
    FAQS_MOCK.findIndex((f) => "open" in f && f.open) === -1
      ? null
      : FAQS_MOCK.findIndex((f) => "open" in f && f.open)
  );
  return (
    <ul className="divide-y divide-violet-50">
      {FAQS_MOCK.map((f, i) => (
        <li key={i}>
          <button
            type="button"
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 py-4 text-left"
          >
            <span className="text-[14px] font-medium text-secondary">{f.q}</span>
            {openIdx === i ? (
              <ChevronUp size={16} className="shrink-0 text-slate-400" />
            ) : (
              <ChevronDown size={16} className="shrink-0 text-slate-400" />
            )}
          </button>
          {openIdx === i && (
            <p className="pb-4 text-[13px] leading-6 text-slate-600">
              Risus pulvinar bibendum in repetendum in iulpuptatibus velit ius dolorize au fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt.
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function ReviewPanel() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[180px_1fr] gap-6 rounded-xl border border-violet-50 p-5">
        <div className="flex flex-col items-center justify-center gap-2 border-r border-violet-50 pr-6">
          <span className="text-[11px] font-medium text-slate-500">Average Review</span>
          <span className="text-[40px] font-bold leading-none text-ink">4.7</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={14} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[11px] text-slate-400">Rating</span>
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500">Detailed Rating</span>
          {RATING_BREAKDOWN.map((r) => (
            <div key={r.star} className="flex items-center gap-3">
              <span className="w-3 text-[12px] text-slate-500">{r.star}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-violet-50">
                <div className="h-full bg-primary" style={{ width: `${r.pct}%` }} />
              </div>
              <span className="w-8 text-right text-[11px] text-slate-500">{r.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-4">
        {REVIEWS_MOCK.map((r) => (
          <li key={r.id} className="flex gap-3 rounded-lg border border-violet-50 p-4">
            <img src={r.avatar} alt={r.name} className="h-10 w-10 rounded-full object-cover" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-ink">{r.name}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="mt-1 text-[13px] leading-5 text-secondary">{r.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 rounded-lg border border-violet-100 bg-white p-3">
        <input
          type="text"
          placeholder="Write feedback here..."
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-300"
        />
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-violet-600"
        >
          <Send size={14} /> Submit Now
        </button>
      </div>
    </div>
  );
}

function CourseContentSidebar({ curriculum }: { curriculum: CurriculumRead | null }) {
  const sections = useMemo(() => {
    if (curriculum && curriculum.sections.length) {
      return curriculum.sections.map((s, i) => ({
        id: s.id,
        title: `Section ${i + 1} | ${s.title}`,
        completed: false,
        lessons: s.lessons.map((l) => ({
          id: l.id,
          title:
            l.type === "video" && l.duration_seconds
              ? `1 video | ${Math.round(l.duration_seconds / 60)} min`
              : l.title,
        })),
      }));
    }
    return CURRICULUM_MOCK;
  }, [curriculum]);

  const [open, setOpen] = useState<Set<string>>(new Set([sections[1]?.id].filter(Boolean) as string[]));

  return (
    <aside className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-[15px] font-semibold text-ink">Course Content</h3>
        <span className="text-[10px] text-slate-400">Lecture (15) | Total: 03 hrs</span>
      </div>

      <ul className="divide-y divide-violet-50">
        {sections.map((s) => {
          const isOpen = open.has(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  const next = new Set(open);
                  if (isOpen) next.delete(s.id);
                  else next.add(s.id);
                  setOpen(next);
                }}
                className="flex w-full items-center justify-between gap-2 py-3 text-left"
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className={cn(
                      "grid h-4 w-4 place-items-center rounded-full",
                      s.completed ? "bg-positive-500 text-white" : "border border-violet-200 text-transparent"
                    )}
                  >
                    {s.completed && <Check size={10} />}
                  </span>
                  <span className="text-[13px] font-medium text-secondary">{s.title}</span>
                </span>
                {isOpen ? (
                  <ChevronUp size={14} className="text-slate-400" />
                ) : (
                  <ChevronDown size={14} className="text-slate-400" />
                )}
              </button>
              {isOpen && (
                <ul className="mb-3 ml-6 space-y-1 text-[12px] text-slate-500">
                  {s.lessons.map((l) => (
                    <li key={l.id} className="flex items-center gap-2">
                      <span className="inline-block h-1 w-1 rounded-full bg-slate-300" />
                      {l.title}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <button className="mt-3 w-full rounded-lg border border-violet-100 py-2 text-[13px] font-medium text-primary hover:bg-violet-50">
        Load More Courses
      </button>
    </aside>
  );
}
