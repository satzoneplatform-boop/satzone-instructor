import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Pencil,
  Plus,
  Shuffle,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useToast } from "../components/Toast";
import { ApiError } from "../api/client";
import { cn } from "../lib/cn";
import {
  createPracticeItem,
  deletePracticeItem,
  getPracticeQuiz,
  updatePracticeItem,
  updatePracticeQuiz,
} from "../api/practice";
import type {
  MCQDataRead,
  MatchingDataRead,
  PracticeItemInstructorRead,
  PracticeItemWrite,
  PracticeQuizInstructorRead,
} from "../api/types";

// ---------------------------------------------------------------------------
// Local draft types for forms
// ---------------------------------------------------------------------------

type DraftOption = { id: string; text: string; is_correct: boolean };
type DraftPair = { id: string; left: string; right: string };

type MCQDraft = {
  type: "mcq";
  prompt: string;
  points: number;
  options: DraftOption[];
};

type MatchingDraft = {
  type: "matching";
  prompt: string;
  points: number;
  pairs: DraftPair[];
};

type ItemDraft = MCQDraft | MatchingDraft;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const OPTION_IDS = "abcdefgh".split("");

function nextOptionId(options: DraftOption[]): string {
  const used = new Set(options.map((o) => o.id));
  return OPTION_IDS.find((id) => !used.has(id)) ?? `opt_${options.length + 1}`;
}

function nextPairId(pairs: DraftPair[]): string {
  const used = new Set(pairs.map((p) => p.id));
  for (let i = 1; i <= 10; i++) {
    const id = `p${i}`;
    if (!used.has(id)) return id;
  }
  return `p${pairs.length + 1}`;
}

function blankMCQ(): MCQDraft {
  return {
    type: "mcq",
    prompt: "",
    points: 1,
    options: [
      { id: "a", text: "", is_correct: false },
      { id: "b", text: "", is_correct: false },
    ],
  };
}

function blankMatching(): MatchingDraft {
  return {
    type: "matching",
    prompt: "",
    points: 1,
    pairs: [
      { id: "p1", left: "", right: "" },
      { id: "p2", left: "", right: "" },
    ],
  };
}

function draftFromItem(item: PracticeItemInstructorRead): ItemDraft {
  if (item.data.type === "mcq") {
    const d = item.data as MCQDataRead;
    return {
      type: "mcq",
      prompt: d.prompt,
      points: item.points,
      options: d.options.map((o) => ({
        id: o.id,
        text: o.text,
        is_correct: o.is_correct,
      })),
    };
  } else {
    const d = item.data as MatchingDataRead;
    return {
      type: "matching",
      prompt: d.prompt,
      points: item.points,
      pairs: d.pairs.map((p) => ({ id: p.id, left: p.left, right: p.right })),
    };
  }
}

function draftToWrite(draft: ItemDraft, order: number): PracticeItemWrite {
  if (draft.type === "mcq") {
    return {
      type: "mcq",
      points: draft.points,
      order,
      data: {
        type: "mcq",
        prompt: draft.prompt,
        options: draft.options.map((o) => ({
          id: o.id,
          text: o.text,
          is_correct: o.is_correct,
        })),
      },
    };
  } else {
    return {
      type: "matching",
      points: draft.points,
      order,
      data: {
        type: "matching",
        prompt: draft.prompt,
        pairs: draft.pairs.map((p) => ({ id: p.id, left: p.left, right: p.right })),
      },
    };
  }
}

function validateDraft(draft: ItemDraft): string | null {
  if (!draft.prompt.trim()) return "Prompt is required.";
  if (draft.type === "mcq") {
    if (draft.options.length < 2) return "At least 2 options required.";
    if (draft.options.length > 8) return "Maximum 8 options allowed.";
    const blanks = draft.options.filter((o) => !o.text.trim());
    if (blanks.length > 0) return "All option texts must be filled in.";
    const correct = draft.options.filter((o) => o.is_correct);
    if (correct.length !== 1) return "Exactly one option must be marked correct.";
  } else {
    if (draft.pairs.length < 2) return "At least 2 pairs required.";
    if (draft.pairs.length > 10) return "Maximum 10 pairs allowed.";
    for (const p of draft.pairs) {
      if (!p.left.trim() || !p.right.trim()) return "All pair fields must be filled in.";
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// MCQ form
// ---------------------------------------------------------------------------

function MCQForm({
  initial,
  onSave,
  onCancel,
  busy,
  error,
}: {
  initial: MCQDraft;
  onSave: (draft: MCQDraft) => void;
  onCancel: () => void;
  busy: boolean;
  error: string | null;
}) {
  const [draft, setDraft] = useState<MCQDraft>(initial);

  function setPrompt(v: string) {
    setDraft((d) => ({ ...d, prompt: v }));
  }

  function setPoints(v: number) {
    setDraft((d) => ({ ...d, points: Math.max(0, v) }));
  }

  function setOptionText(id: string, text: string) {
    setDraft((d) => ({
      ...d,
      options: d.options.map((o) => (o.id === id ? { ...o, text } : o)),
    }));
  }

  function setCorrect(id: string) {
    setDraft((d) => ({
      ...d,
      options: d.options.map((o) => ({ ...o, is_correct: o.id === id })),
    }));
  }

  function addOption() {
    if (draft.options.length >= 8) return;
    const id = nextOptionId(draft.options);
    setDraft((d) => ({ ...d, options: [...d.options, { id, text: "", is_correct: false }] }));
  }

  function removeOption(id: string) {
    if (draft.options.length <= 2) return;
    setDraft((d) => ({ ...d, options: d.options.filter((o) => o.id !== id) }));
  }

  const correctCount = draft.options.filter((o) => o.is_correct).length;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-danger-50 px-3 py-2 text-[13px] text-danger-500">{error}</div>
      )}

      {/* Prompt */}
      <div>
        <label className="mb-1 block text-[12px] font-medium text-slate-600">
          Question prompt <span className="text-danger-500">*</span>
        </label>
        <textarea
          value={draft.prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder="What is an algebraic expression?"
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[14px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
        />
      </div>

      {/* Options */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[12px] font-medium text-slate-600">
            Options — mark exactly one correct
          </label>
          {correctCount !== 1 && (
            <span className="text-[11px] text-danger-500">
              {correctCount === 0 ? "Select a correct answer" : "Only one correct answer allowed"}
            </span>
          )}
        </div>
        <div className="space-y-2">
          {draft.options.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${draft.options.map((o) => o.id).join("")}`}
                checked={opt.is_correct}
                onChange={() => setCorrect(opt.id)}
                className="h-4 w-4 accent-primary"
                title="Mark as correct"
              />
              <span className="w-5 text-[12px] font-semibold text-slate-400 uppercase">
                {opt.id}
              </span>
              <input
                type="text"
                value={opt.text}
                onChange={(e) => setOptionText(opt.id, e.target.value)}
                placeholder={`Option ${opt.id.toUpperCase()}`}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-1.5 text-[13px] text-ink outline-none focus:ring-2 focus:ring-violet-100",
                  opt.is_correct
                    ? "border-positive-500 bg-positive-50 focus:border-positive-500"
                    : "border-slate-200 focus:border-primary"
                )}
              />
              <button
                type="button"
                onClick={() => removeOption(opt.id)}
                disabled={draft.options.length <= 2}
                className="rounded p-1 text-slate-300 hover:text-danger-500 disabled:cursor-not-allowed disabled:opacity-30"
                title="Remove option"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        {draft.options.length < 8 && (
          <button
            type="button"
            onClick={addOption}
            className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:text-violet-700"
          >
            <Plus size={13} /> Add option
          </button>
        )}
      </div>

      {/* Points */}
      <div className="flex items-center gap-2">
        <label className="text-[12px] font-medium text-slate-600">Points:</label>
        <input
          type="number"
          min={0}
          value={draft.points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="w-20 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSave(draft)}
          disabled={busy}
          className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-medium text-secondary hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Matching form
// ---------------------------------------------------------------------------

function MatchingForm({
  initial,
  onSave,
  onCancel,
  busy,
  error,
}: {
  initial: MatchingDraft;
  onSave: (draft: MatchingDraft) => void;
  onCancel: () => void;
  busy: boolean;
  error: string | null;
}) {
  const [draft, setDraft] = useState<MatchingDraft>(initial);

  function setPrompt(v: string) {
    setDraft((d) => ({ ...d, prompt: v }));
  }

  function setPoints(v: number) {
    setDraft((d) => ({ ...d, points: Math.max(0, v) }));
  }

  function setPairField(id: string, side: "left" | "right", value: string) {
    setDraft((d) => ({
      ...d,
      pairs: d.pairs.map((p) => (p.id === id ? { ...p, [side]: value } : p)),
    }));
  }

  function addPair() {
    if (draft.pairs.length >= 10) return;
    const id = nextPairId(draft.pairs);
    setDraft((d) => ({ ...d, pairs: [...d.pairs, { id, left: "", right: "" }] }));
  }

  function removePair(id: string) {
    if (draft.pairs.length <= 2) return;
    setDraft((d) => ({ ...d, pairs: d.pairs.filter((p) => p.id !== id) }));
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-danger-50 px-3 py-2 text-[13px] text-danger-500">{error}</div>
      )}

      {/* Prompt */}
      <div>
        <label className="mb-1 block text-[12px] font-medium text-slate-600">
          Instruction prompt <span className="text-danger-500">*</span>
        </label>
        <textarea
          value={draft.prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder="Match each term with its definition."
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[14px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
        />
      </div>

      {/* Pairs */}
      <div>
        <div className="mb-2 grid grid-cols-[1fr_1fr_28px] gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Left (term)</span>
          <span>Right (match)</span>
          <span />
        </div>
        <div className="space-y-2">
          {draft.pairs.map((pair) => (
            <div key={pair.id} className="grid grid-cols-[1fr_1fr_28px] items-center gap-2">
              <input
                type="text"
                value={pair.left}
                onChange={(e) => setPairField(pair.id, "left", e.target.value)}
                placeholder="Term"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
              />
              <input
                type="text"
                value={pair.right}
                onChange={(e) => setPairField(pair.id, "right", e.target.value)}
                placeholder="Match"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
              />
              <button
                type="button"
                onClick={() => removePair(pair.id)}
                disabled={draft.pairs.length <= 2}
                className="rounded p-1 text-slate-300 hover:text-danger-500 disabled:cursor-not-allowed disabled:opacity-30"
                title="Remove pair"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        {draft.pairs.length < 10 && (
          <button
            type="button"
            onClick={addPair}
            className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:text-violet-700"
          >
            <Plus size={13} /> Add pair
          </button>
        )}
      </div>

      {/* Points */}
      <div className="flex items-center gap-2">
        <label className="text-[12px] font-medium text-slate-600">Points:</label>
        <input
          type="number"
          min={0}
          value={draft.points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="w-20 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSave(draft)}
          disabled={busy}
          className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-medium text-secondary hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Item card (read view)
// ---------------------------------------------------------------------------

function MCQCard({ item }: { item: PracticeItemInstructorRead }) {
  const data = item.data as MCQDataRead;
  return (
    <div>
      <p className="text-[13px] font-medium text-ink">{data.prompt}</p>
      <ul className="mt-2 space-y-1">
        {data.options.map((opt) => (
          <li
            key={opt.id}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1 text-[12px]",
              opt.is_correct ? "bg-positive-50 text-positive-600" : "text-slate-500"
            )}
          >
            <span className="font-semibold uppercase">{opt.id}.</span>
            <span>{opt.text}</span>
            {opt.is_correct && <span className="ml-auto text-[10px] font-semibold">✓ correct</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MatchingCard({ item }: { item: PracticeItemInstructorRead }) {
  const data = item.data as MatchingDataRead;
  return (
    <div>
      <p className="text-[13px] font-medium text-ink">{data.prompt}</p>
      <div className="mt-2 space-y-1">
        {data.pairs.map((pair) => (
          <div
            key={pair.id}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[12px] text-slate-600"
          >
            <span className="rounded-md bg-violet-50 px-2 py-1 font-medium text-secondary">
              {pair.left}
            </span>
            <span className="text-slate-300">→</span>
            <span className="rounded-md bg-slate-50 px-2 py-1">{pair.right}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete confirm modal
// ---------------------------------------------------------------------------

function ConfirmDeleteModal({
  onClose,
  onConfirm,
}: {
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
        <h2 className="text-[15px] font-semibold text-ink">Delete item?</h2>
        <p className="mt-2 text-[13px] text-slate-500">
          This item will be permanently removed from the quiz.
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
// Quiz meta inline editor
// ---------------------------------------------------------------------------

function QuizMetaEditor({
  quiz,
  onSaved,
}: {
  quiz: PracticeQuizInstructorRead;
  onSaved: (next: PracticeQuizInstructorRead) => void;
}) {
  const { notify } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: quiz.title, description: quiz.description ?? "" });
  const [busy, setBusy] = useState(false);
  const [togglingPublish, setTogglingPublish] = useState(false);

  async function save() {
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      const next = await updatePracticeQuiz(quiz.id, {
        title: form.title.trim(),
        description: form.description.trim() || null,
      });
      onSaved(next);
      setEditing(false);
      notify("Quiz updated.", "success");
    } catch (e) {
      notify(e instanceof ApiError ? e.message : "Could not save.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish() {
    setTogglingPublish(true);
    try {
      const next = await updatePracticeQuiz(quiz.id, { is_published: !quiz.is_published });
      onSaved(next);
      notify(next.is_published ? "Quiz published." : "Quiz unpublished.", "success");
    } catch (e) {
      notify(e instanceof ApiError ? e.message : "Could not update.", "error");
    } finally {
      setTogglingPublish(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                maxLength={200}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Optional description…"
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-violet-100"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={busy || !form.title.trim()}
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
          ) : (
            <>
              <h2 className="text-[18px] font-semibold text-ink">{quiz.title}</h2>
              {quiz.description && (
                <p className="mt-1 text-[13px] text-slate-500">{quiz.description}</p>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Publish toggle */}
          <button
            type="button"
            disabled={togglingPublish}
            onClick={togglePublish}
            className={cn(
              "inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-60",
              quiz.is_published
                ? "bg-positive-50 text-positive-600 hover:bg-green-100"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            {quiz.is_published ? "Published" : "Draft"}
          </button>

          {!editing && (
            <button
              type="button"
              onClick={() => {
                setForm({ title: quiz.title, description: quiz.description ?? "" });
                setEditing(true);
              }}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[12px] text-slate-400">
        <span>{quiz.item_count} item{quiz.item_count !== 1 ? "s" : ""}</span>
        {quiz.item_count >= 50 && (
          <span className="font-medium text-amber-500">Items cap reached (50 max)</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add item type picker (inline dropdown)
// ---------------------------------------------------------------------------

function AddItemDropdown({
  onSelect,
  onClose,
}: {
  onSelect: (type: "mcq" | "matching") => void;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-2 z-20 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-dropdown">
        <button
          type="button"
          onClick={() => { onSelect("mcq"); onClose(); }}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-secondary hover:bg-slate-50"
        >
          <ListChecks size={15} className="text-primary" /> Multiple choice
        </button>
        <button
          type="button"
          onClick={() => { onSelect("matching"); onClose(); }}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-secondary hover:bg-slate-50"
        >
          <Shuffle size={15} className="text-violet-400" /> Matching
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function PracticeQuizEditorPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const nav = useNavigate();
  const { notify } = useToast();

  const [quiz, setQuiz] = useState<PracticeQuizInstructorRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add item state
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [addingType, setAddingType] = useState<"mcq" | "matching" | null>(null);
  const [addDraft, setAddDraft] = useState<ItemDraft | null>(null);
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit item state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ItemDraft | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete item state
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  // Reorder state
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) return;
    let mounted = true;
    setLoading(true);
    getPracticeQuiz(quizId)
      .then((q) => mounted && setQuiz(q))
      .catch((e) =>
        mounted && setError(e instanceof ApiError ? e.message : "Could not load quiz.")
      )
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [quizId]);

  // ---------------------------------------------------------------------------
  // Add item
  // ---------------------------------------------------------------------------

  function startAdd(type: "mcq" | "matching") {
    setAddingType(type);
    setAddDraft(type === "mcq" ? blankMCQ() : blankMatching());
    setAddError(null);
  }

  async function onAddSave(draft: ItemDraft) {
    if (!quiz) return;

    if (quiz.items.length >= 50) {
      setAddError("Items cap reached — remove an item first (max 50 per quiz).");
      return;
    }

    const err = validateDraft(draft);
    if (err) { setAddError(err); return; }

    const nextOrder = quiz.items.length > 0
      ? Math.max(...quiz.items.map((i) => i.order)) + 1
      : 0;

    setAddBusy(true);
    setAddError(null);
    try {
      const item = await createPracticeItem(quiz.id, draftToWrite(draft, nextOrder));
      setQuiz((q) =>
        q
          ? { ...q, item_count: q.item_count + 1, items: [...q.items, item] }
          : q
      );
      setAddingType(null);
      setAddDraft(null);
      notify("Item added.", "success");
    } catch (e) {
      if (e instanceof ApiError) {
        const msg = e.message;
        if (msg.includes("quiz_item_limit")) {
          setAddError("Items cap reached — remove an item first (max 50 per quiz).");
        } else {
          setAddError(msg);
        }
      } else {
        setAddError("Could not save item.");
      }
    } finally {
      setAddBusy(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Edit item
  // ---------------------------------------------------------------------------

  function startEdit(item: PracticeItemInstructorRead) {
    setEditingId(item.id);
    setEditDraft(draftFromItem(item));
    setEditError(null);
  }

  async function onEditSave(draft: ItemDraft) {
    if (!quiz || !editingId) return;

    const err = validateDraft(draft);
    if (err) { setEditError(err); return; }

    const item = quiz.items.find((i) => i.id === editingId);
    if (!item) return;

    setEditBusy(true);
    setEditError(null);
    try {
      const updated = await updatePracticeItem(editingId, draftToWrite(draft, item.order));
      setQuiz((q) =>
        q
          ? { ...q, items: q.items.map((i) => (i.id === editingId ? updated : i)) }
          : q
      );
      setEditingId(null);
      setEditDraft(null);
      notify("Item saved.", "success");
    } catch (e) {
      setEditError(e instanceof ApiError ? e.message : "Could not save item.");
    } finally {
      setEditBusy(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Delete item
  // ---------------------------------------------------------------------------

  async function onDeleteItem() {
    if (!toDeleteId || !quiz) return;
    await deletePracticeItem(toDeleteId);
    setQuiz((q) =>
      q
        ? {
            ...q,
            item_count: q.item_count - 1,
            items: q.items.filter((i) => i.id !== toDeleteId),
          }
        : q
    );
    notify("Item deleted.", "success");
    setToDeleteId(null);
  }

  // ---------------------------------------------------------------------------
  // Reorder items
  // ---------------------------------------------------------------------------

  async function onMove(item: PracticeItemInstructorRead, direction: "up" | "down") {
    if (!quiz) return;
    const sorted = [...quiz.items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const swapWith = sorted[swapIdx];
    const newOrder = swapWith.order;
    const oldOrder = item.order;

    // Optimistic
    setQuiz((q) =>
      q
        ? {
            ...q,
            items: q.items.map((i) => {
              if (i.id === item.id) return { ...i, order: newOrder };
              if (i.id === swapWith.id) return { ...i, order: oldOrder };
              return i;
            }),
          }
        : q
    );

    setReordering(item.id);
    try {
      await updatePracticeItem(item.id, draftToWrite(draftFromItem({ ...item, order: newOrder }), newOrder));
      await updatePracticeItem(swapWith.id, draftToWrite(draftFromItem({ ...swapWith, order: oldOrder }), oldOrder));
    } catch (e) {
      // Rollback
      setQuiz((q) =>
        q
          ? {
              ...q,
              items: q.items.map((i) => {
                if (i.id === item.id) return { ...i, order: oldOrder };
                if (i.id === swapWith.id) return { ...i, order: newOrder };
                return i;
              }),
            }
          : q
      );
      notify(e instanceof ApiError ? e.message : "Could not reorder.", "error");
    } finally {
      setReordering(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <AppShell>
        <p className="text-[14px] text-slate-500">Loading…</p>
      </AppShell>
    );
  }

  if (error || !quiz) {
    return (
      <AppShell>
        <div className="rounded-lg bg-danger-50 p-4 text-[13px] text-danger-500">
          {error ?? "Quiz not found."}
        </div>
      </AppShell>
    );
  }

  const sortedItems = [...quiz.items].sort((a, b) => a.order - b.order);
  const atCap = quiz.items.length >= 50;

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-secondary"
        >
          <ArrowLeft size={14} /> Back to pack
        </button>
      </div>

      {/* Quiz meta */}
      <div className="mb-6">
        <QuizMetaEditor quiz={quiz} onSaved={setQuiz} />
      </div>

      {/* Items section */}
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-[14px] font-semibold text-ink">
            Items
            <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-500">
              {sortedItems.length} / 50
            </span>
          </p>

          <div className="relative">
            <button
              type="button"
              disabled={atCap || addingType !== null}
              onClick={() => setShowTypeMenu((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[13px] font-medium text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} /> Add item
            </button>

            {showTypeMenu && (
              <AddItemDropdown
                onSelect={(type) => {
                  startAdd(type);
                  setShowTypeMenu(false);
                }}
                onClose={() => setShowTypeMenu(false)}
              />
            )}
          </div>
        </div>

        {atCap && (
          <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-[13px] text-amber-600">
            Items cap reached. Remove an item before adding more (max 50 per quiz).
          </div>
        )}

        {/* New item form */}
        {addingType && addDraft && (
          <div
            className={cn(
              "border-b border-slate-100 p-5",
              addingType === "mcq" ? "bg-violet-50/40" : "bg-sky-50/30"
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              {addingType === "mcq" ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <ListChecks size={11} /> MCQ
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                  <Shuffle size={11} /> Matching
                </span>
              )}
              <span className="text-[12px] text-slate-400">New item</span>
            </div>
            {addingType === "mcq" ? (
              <MCQForm
                initial={addDraft as MCQDraft}
                onSave={(d) => onAddSave(d)}
                onCancel={() => { setAddingType(null); setAddDraft(null); setAddError(null); }}
                busy={addBusy}
                error={addError}
              />
            ) : (
              <MatchingForm
                initial={addDraft as MatchingDraft}
                onSave={(d) => onAddSave(d)}
                onCancel={() => { setAddingType(null); setAddDraft(null); setAddError(null); }}
                busy={addBusy}
                error={addError}
              />
            )}
          </div>
        )}

        {/* Items list */}
        {sortedItems.length === 0 && !addingType ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[14px] text-slate-400">No items yet. Add an MCQ or matching item to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sortedItems.map((item, idx) => (
              <div key={item.id} className="flex gap-4 p-5">
                {/* Order controls */}
                <div className="flex shrink-0 flex-col items-center gap-0.5 pt-1">
                  <button
                    type="button"
                    disabled={idx === 0 || reordering !== null || editingId !== null}
                    onClick={() => onMove(item, "up")}
                    className="rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <span className="text-[10px] font-medium text-slate-300">{idx + 1}</span>
                  <button
                    type="button"
                    disabled={idx === sortedItems.length - 1 || reordering !== null || editingId !== null}
                    onClick={() => onMove(item, "down")}
                    className="rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>

                {/* Item content */}
                <div className="flex-1 min-w-0">
                  {/* Type badge */}
                  <div className="mb-2 flex items-center gap-2">
                    {item.type === "mcq" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        <ListChecks size={11} /> MCQ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-500">
                        <Shuffle size={11} /> Matching
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">{item.points} pt{item.points !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Read view or edit form */}
                  {editingId === item.id && editDraft ? (
                    item.type === "mcq" ? (
                      <MCQForm
                        initial={editDraft as MCQDraft}
                        onSave={(d) => onEditSave(d)}
                        onCancel={() => { setEditingId(null); setEditDraft(null); setEditError(null); }}
                        busy={editBusy}
                        error={editError}
                      />
                    ) : (
                      <MatchingForm
                        initial={editDraft as MatchingDraft}
                        onSave={(d) => onEditSave(d)}
                        onCancel={() => { setEditingId(null); setEditDraft(null); setEditError(null); }}
                        busy={editBusy}
                        error={editError}
                      />
                    )
                  ) : item.type === "mcq" ? (
                    <MCQCard item={item} />
                  ) : (
                    <MatchingCard item={item} />
                  )}
                </div>

                {/* Actions (only in read view) */}
                {editingId !== item.id && (
                  <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      disabled={editingId !== null || addingType !== null}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-[12px] font-medium text-secondary hover:bg-slate-50 disabled:opacity-40"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDeleteId(item.id)}
                      disabled={editingId !== null}
                      className="rounded-lg border border-red-100 p-1.5 text-danger-500 hover:bg-danger-50 disabled:opacity-40"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete item modal */}
      {toDeleteId && (
        <ConfirmDeleteModal
          onClose={() => setToDeleteId(null)}
          onConfirm={onDeleteItem}
        />
      )}
    </AppShell>
  );
}
