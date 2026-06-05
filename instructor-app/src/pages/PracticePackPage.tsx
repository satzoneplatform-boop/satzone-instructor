import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useToast } from "../components/Toast";
import { ApiError } from "../api/client";
import { cn } from "../lib/cn";
import {
  createPracticeQuiz,
  deletePracticeQuiz,
  getPracticePack,
  updatePracticePack,
  updatePracticeQuiz,
} from "../api/practice";
import type {
  PracticePackInstructorRead,
  PracticeQuizSummary,
} from "../api/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        published
          ? "bg-positive-50 text-positive-600"
          : "bg-slate-100 text-slate-500"
      )}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Add-quiz modal
// ---------------------------------------------------------------------------

type AddQuizForm = {
  title: string;
  description: string;
  is_published: boolean;
};

function AddQuizModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (quiz: PracticeQuizSummary) => void;
}) {
  const { id: courseId } = useParams<{ id: string }>();
  const [form, setForm] = useState<AddQuizForm>({
    title: "",
    description: "",
    is_published: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof AddQuizForm>(k: K, v: AddQuizForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return;
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const quiz = await createPracticeQuiz(courseId, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        is_published: form.is_published,
      });
      onSaved({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        order: quiz.order,
        is_published: quiz.is_published,
        item_count: quiz.item_count,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create quiz.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-dropdown">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-ink">New practice quiz</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-danger-50 px-3 py-2 text-[13px] text-danger-500">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[13px] font-medium text-slate-700">
              Title <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              maxLength={200}
              placeholder="e.g. Expressions & equations"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[14px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              placeholder="Optional short description…"
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[14px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-[14px] text-secondary">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => update("is_published", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-primary"
            />
            Publish immediately
          </label>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-[14px] font-medium text-secondary hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-primary px-4 py-2 text-[14px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pack meta inline editor
// ---------------------------------------------------------------------------

function PackMetaEditor({
  pack,
  onSaved,
}: {
  pack: PracticePackInstructorRead;
  onSaved: (next: PracticePackInstructorRead) => void;
}) {
  const { id: courseId } = useParams<{ id: string }>();
  const { notify } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: pack.title ?? "", description: pack.description ?? "" });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!courseId) return;
    setBusy(true);
    try {
      const next = await updatePracticePack(courseId, {
        title: form.title.trim() || undefined,
        description: form.description.trim() || undefined,
      });
      onSaved(next);
      setEditing(false);
      notify("Pack updated.", "success");
    } catch (e) {
      notify(e instanceof ApiError ? e.message : "Could not save.", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-[16px] font-semibold text-ink">
            {pack.title ?? <span className="italic text-slate-400">No title set</span>}
          </p>
          {pack.description && (
            <p className="mt-1 text-[13px] text-slate-500">{pack.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setForm({ title: pack.title ?? "", description: pack.description ?? "" });
            setEditing(true);
          }}
          className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
        >
          <Pencil size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-[12px] font-medium text-slate-600">Pack title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          maxLength={200}
          placeholder="e.g. SAT Math practice"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[14px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-[12px] font-medium text-slate-600">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
          placeholder="Optional…"
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[14px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-secondary hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete confirm modal
// ---------------------------------------------------------------------------

function ConfirmDeleteModal({
  title,
  onClose,
  onConfirm,
}: {
  title: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-dropdown">
        <h2 className="text-[15px] font-semibold text-ink">Delete quiz?</h2>
        <p className="mt-2 text-[13px] text-slate-500">
          "<span className="font-medium text-secondary">{title}</span>" and all its items will be permanently deleted.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-[14px] font-medium text-secondary hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={go}
            disabled={busy}
            className="rounded-lg bg-danger-500 px-4 py-2 text-[14px] font-medium text-white hover:bg-red-600 disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function PracticePackPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { notify } = useToast();

  const [pack, setPack] = useState<PracticePackInstructorRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [toDelete, setToDelete] = useState<PracticeQuizSummary | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    setLoading(true);
    getPracticePack(courseId)
      .then((p) => mounted && setPack(p))
      .catch((e) => mounted && setError(e instanceof ApiError ? e.message : "Could not load practice pack."))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [courseId]);

  async function onTogglePublish(quiz: PracticeQuizSummary) {
    if (!pack) return;
    setToggling(quiz.id);
    try {
      const next = await updatePracticeQuiz(quiz.id, { is_published: !quiz.is_published });
      setPack((p) =>
        p
          ? {
              ...p,
              quizzes: p.quizzes.map((q) =>
                q.id === quiz.id ? { ...q, is_published: next.is_published } : q
              ),
            }
          : p
      );
    } catch (e) {
      notify(e instanceof ApiError ? e.message : "Could not update.", "error");
    } finally {
      setToggling(null);
    }
  }

  async function onMove(quiz: PracticeQuizSummary, direction: "up" | "down") {
    if (!pack) return;
    const quizzes = [...pack.quizzes].sort((a, b) => a.order - b.order);
    const idx = quizzes.findIndex((q) => q.id === quiz.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= quizzes.length) return;

    const swapWith = quizzes[swapIdx];
    const newOrder = swapWith.order;
    const oldOrder = quiz.order;

    // Optimistic update
    setPack((p) =>
      p
        ? {
            ...p,
            quizzes: p.quizzes.map((q) => {
              if (q.id === quiz.id) return { ...q, order: newOrder };
              if (q.id === swapWith.id) return { ...q, order: oldOrder };
              return q;
            }),
          }
        : p
    );

    setReordering(quiz.id);
    try {
      await updatePracticeQuiz(quiz.id, { order: newOrder });
      await updatePracticeQuiz(swapWith.id, { order: oldOrder });
    } catch (e) {
      // Rollback
      setPack((p) =>
        p
          ? {
              ...p,
              quizzes: p.quizzes.map((q) => {
                if (q.id === quiz.id) return { ...q, order: oldOrder };
                if (q.id === swapWith.id) return { ...q, order: newOrder };
                return q;
              }),
            }
          : p
      );
      notify(e instanceof ApiError ? e.message : "Could not reorder.", "error");
    } finally {
      setReordering(null);
    }
  }

  async function onDelete(quiz: PracticeQuizSummary) {
    await deletePracticeQuiz(quiz.id);
    setPack((p) =>
      p ? { ...p, quizzes: p.quizzes.filter((q) => q.id !== quiz.id) } : p
    );
    notify(`Deleted "${quiz.title}".`, "success");
    setToDelete(null);
  }

  if (loading) {
    return (
      <AppShell>
        <p className="text-[14px] text-slate-500">Loading…</p>
      </AppShell>
    );
  }

  if (error || !pack) {
    return (
      <AppShell>
        <div className="rounded-lg bg-danger-50 p-4 text-[13px] text-danger-500">
          {error ?? "Practice pack not found."}
        </div>
      </AppShell>
    );
  }

  const sorted = [...pack.quizzes].sort((a, b) => a.order - b.order);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <button
            type="button"
            onClick={() => nav(`/courses/${courseId}`)}
            className="mb-2 inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-secondary"
          >
            <ArrowLeft size={14} /> Back to course
          </button>
          <h1 className="text-[20px] font-bold text-ink">Practice Pack</h1>
          <p className="mt-0.5 text-[14px] text-slate-500">
            Duolingo-style drill quizzes for enrolled students
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[14px] font-medium text-white hover:bg-violet-600"
        >
          <Plus size={15} /> Add quiz
        </button>
      </div>

      {/* Pack meta */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-slate-400">
          Pack info
        </p>
        <PackMetaEditor pack={pack} onSaved={setPack} />
      </div>

      {/* Quizzes */}
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-[14px] font-semibold text-ink">
            Quizzes
            <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-500">
              {sorted.length}
            </span>
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[14px] text-slate-400">No quizzes yet. Add one to get started.</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[12px] font-medium text-slate-400">
                <th className="w-16 px-5 py-3">Order</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((quiz, idx) => (
                <tr
                  key={quiz.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                >
                  {/* Order controls */}
                  <td className="px-5 py-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0 || reordering !== null}
                        onClick={() => onMove(quiz, "up")}
                        className="rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <span className="text-[11px] font-medium text-slate-400">{idx + 1}</span>
                      <button
                        type="button"
                        disabled={idx === sorted.length - 1 || reordering !== null}
                        onClick={() => onMove(quiz, "down")}
                        className="rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{quiz.title}</p>
                    {quiz.description && (
                      <p className="mt-0.5 line-clamp-1 text-[12px] text-slate-400">
                        {quiz.description}
                      </p>
                    )}
                  </td>

                  {/* Item count */}
                  <td className="px-5 py-3 text-slate-500">
                    {quiz.item_count} item{quiz.item_count !== 1 ? "s" : ""}
                  </td>

                  {/* Status toggle */}
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      disabled={toggling === quiz.id}
                      onClick={() => onTogglePublish(quiz)}
                      title={quiz.is_published ? "Click to unpublish" : "Click to publish"}
                      className="cursor-pointer disabled:opacity-60"
                    >
                      <StatusPill published={quiz.is_published} />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => nav(`/practice/quizzes/${quiz.id}`)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-secondary hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(quiz)}
                        className="rounded-lg border border-red-100 p-1.5 text-danger-500 hover:bg-danger-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <AddQuizModal
          onClose={() => setShowAdd(false)}
          onSaved={(quiz) => {
            setPack((p) => (p ? { ...p, quizzes: [...p.quizzes, quiz] } : p));
            setShowAdd(false);
            notify(`Quiz "${quiz.title}" created.`, "success");
          }}
        />
      )}

      {toDelete && (
        <ConfirmDeleteModal
          title={toDelete.title}
          onClose={() => setToDelete(null)}
          onConfirm={() => onDelete(toDelete)}
        />
      )}
    </AppShell>
  );
}
