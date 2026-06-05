import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createAssessment,
  createQuestion,
  deleteAssessment,
  deleteQuestion,
  getAssessment,
  listCourseAssessments,
  updateAssessment,
} from "../api/instructor";
import type {
  AssessmentInstructorRead,
  QuestionType,
} from "../api/types";
import { ApiError } from "../api/client";
import { cn } from "../lib/cn";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "single_choice", label: "Single choice" },
  { value: "multi_choice", label: "Multiple choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Short answer" },
];

export function AssessmentsPanel({ courseId }: { courseId: string }) {
  const [list, setList] = useState<AssessmentInstructorRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await listCourseAssessments(courseId, { size: 50 });
      setList(page.items);
      if (!selectedId && page.items.length) setSelectedId(page.items[0].id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load assessments.");
    } finally {
      setLoading(false);
    }
  }, [courseId, selectedId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function onCreate() {
    if (!newTitle.trim()) return;
    try {
      const created = await createAssessment(courseId, { title: newTitle.trim(), pass_percent: 70 });
      setNewTitle("");
      setSelectedId(created.id);
      void reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create.");
    }
  }

  async function onDelete(assessmentId: string) {
    if (!confirm("Delete this assessment and all of its questions?")) return;
    try {
      await deleteAssessment(assessmentId);
      if (selectedId === assessmentId) setSelectedId(null);
      void reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete.");
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center gap-2 py-10 text-slate-400">
        <Loader2 size={20} className="animate-spin" /> Loading assessments…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[260px_1fr] gap-4">
      <aside>
        <ul className="space-y-1">
          {list.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setSelectedId(a.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-[13px] transition",
                  selectedId === a.id ? "bg-primary text-white" : "text-secondary hover:bg-violet-50"
                )}
              >
                <span className="truncate">{a.title}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void onDelete(a.id);
                  }}
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded",
                    selectedId === a.id ? "hover:bg-white/15" : "hover:bg-danger-50 text-danger-500"
                  )}
                >
                  <Trash2 size={12} />
                </button>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New assessment title…"
            className="h-9 flex-1 rounded-md border border-violet-100 bg-white px-3 text-[13px] outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={onCreate}
            disabled={!newTitle.trim()}
            className="inline-flex h-9 items-center gap-1 rounded-md bg-secondary px-3 text-[12px] font-medium text-white disabled:opacity-60"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-danger-50 px-3 py-2 text-[12px] text-danger-500">{error}</div>
        )}
      </aside>

      <section className="rounded-xl border border-violet-100 p-4">
        {selectedId ? (
          <AssessmentEditor key={selectedId} assessmentId={selectedId} onSaved={reload} />
        ) : (
          <p className="text-[13px] text-slate-500">Pick an assessment on the left, or create a new one.</p>
        )}
      </section>
    </div>
  );
}

function AssessmentEditor({ assessmentId, onSaved }: { assessmentId: string; onSaved: () => void }) {
  const [a, setA] = useState<AssessmentInstructorRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await getAssessment(assessmentId);
      setA(fresh);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load.");
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  async function onSave(patch: Partial<AssessmentInstructorRead>) {
    try {
      const next = await updateAssessment(assessmentId, {
        title: patch.title,
        description: patch.description ?? undefined,
        pass_percent: patch.pass_percent,
        status: patch.status,
      });
      setA(next);
      onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save.");
    }
  }

  async function onAddQuestion(type: QuestionType) {
    if (!a) return;
    try {
      await createQuestion(a.id, {
        type,
        title: "New question",
        points: 1,
        options:
          type === "single_choice" || type === "multi_choice"
            ? [
                { text: "Option A", is_correct: type === "single_choice" },
                { text: "Option B" },
              ]
            : type === "true_false"
              ? [
                  { text: "True", is_correct: true },
                  { text: "False" },
                ]
              : undefined,
      });
      void reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not add question.");
    }
  }

  async function onDeleteQuestion(qid: string) {
    if (!confirm("Delete this question?")) return;
    try {
      await deleteQuestion(qid);
      void reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete question.");
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center gap-2 py-10 text-slate-400">
        <Loader2 size={20} className="animate-spin" /> Loading…
      </div>
    );
  }
  if (!a) {
    return <p className="text-[13px] text-danger-500">{error ?? "Not found."}</p>;
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <input
            value={a.title}
            onChange={(e) => setA({ ...a, title: e.target.value })}
            onBlur={() => onSave({ title: a.title })}
            className="w-full rounded-md border border-violet-100 bg-white px-3 py-2 text-[15px] font-semibold text-ink outline-none focus:border-primary"
          />
        </div>
        <select
          value={a.status}
          onChange={(e) => onSave({ status: e.target.value as AssessmentInstructorRead["status"] })}
          className="h-9 rounded-md border border-violet-100 bg-white px-3 text-[13px] outline-none focus:border-primary"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </header>

      <textarea
        value={a.description ?? ""}
        onChange={(e) => setA({ ...a, description: e.target.value })}
        onBlur={() => onSave({ description: a.description ?? "" })}
        placeholder="Description (optional)"
        className="min-h-[60px] w-full resize-y rounded-md border border-violet-100 bg-white px-3 py-2 text-[13px] outline-none focus:border-primary"
      />

      <div className="flex items-center gap-3 text-[13px]">
        <label className="inline-flex items-center gap-2">
          <span className="text-secondary">Pass %</span>
          <input
            type="number"
            min={0}
            max={100}
            value={a.pass_percent}
            onChange={(e) => setA({ ...a, pass_percent: Number(e.target.value) })}
            onBlur={() => onSave({ pass_percent: a.pass_percent })}
            className="h-8 w-20 rounded-md border border-violet-100 bg-white px-2 text-right outline-none focus:border-primary"
          />
        </label>
      </div>

      <div>
        <h4 className="text-[14px] font-semibold text-ink">Questions ({a.questions.length})</h4>
        <ul className="mt-2 space-y-2">
          {a.questions.map((q, i) => (
            <li key={q.id} className="rounded-lg border border-violet-100 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Q{i + 1} · {q.type.replace("_", " ")}
                  </p>
                  <p className="mt-1 text-[14px] font-medium text-ink">{q.title}</p>
                  {q.options.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[12px]">
                      {q.options.map((o) => (
                        <li
                          key={o.id}
                          className={cn(
                            "flex items-center gap-2",
                            o.is_correct ? "text-positive-600" : "text-slate-500"
                          )}
                        >
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                          {o.text} {o.is_correct && <span className="text-[10px]">(correct)</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => alert("Inline question editing coming next — backend supports PATCH /instructor/questions/:id.")}
                    className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-violet-50"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(q.id)}
                    className="grid h-7 w-7 place-items-center rounded text-danger-500 hover:bg-danger-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {QUESTION_TYPES.map((qt) => (
            <button
              key={qt.value}
              type="button"
              onClick={() => onAddQuestion(qt.value)}
              className="inline-flex items-center gap-1 rounded-md border border-violet-100 bg-white px-3 py-1.5 text-[12px] font-medium text-secondary hover:border-primary hover:text-primary"
            >
              <Plus size={12} /> {qt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-md bg-danger-50 px-3 py-2 text-[12px] text-danger-500">{error}</div>}
    </div>
  );
}
