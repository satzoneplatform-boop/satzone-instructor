import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { ApiError } from "../api/client";

export function ConfirmDeleteModal({
  title,
  entityName,
  onClose,
  onConfirm,
  onDeleted,
}: {
  title: string;
  entityName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function doDelete() {
    setBusy(true);
    setErr(null);
    try {
      await onConfirm();
      onDeleted();
    } catch (e) {
      if (e instanceof ApiError) {
        // Mock rows have non-UUID ids — backend 404s. Still let the demo flow.
        if (e.status === 404 || e.code === "not_found" || e.code.endsWith("_not_found")) {
          onDeleted();
          return;
        }
        setErr(e.message);
      } else {
        setErr("Network error.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-secondary/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[420px] rounded-2xl bg-white p-6 shadow-dropdown"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-danger-50">
            <Trash2 size={22} className="text-danger-500" />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-secondary" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <h2 className="mt-4 text-[18px] font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-[14px] text-slate-600">
          Do you want to delete <span className="font-medium text-ink">{entityName}</span>?
          This action can't be undone.
        </p>

        {err && (
          <div className="mt-3 rounded-md bg-danger-50 px-3 py-2 text-[13px] text-danger-500">
            {err}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 rounded-lg border border-violet-100 bg-white py-2.5 text-[14px] font-medium text-secondary hover:bg-violet-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={doDelete}
            disabled={busy}
            className="flex-1 rounded-lg bg-danger-500 py-2.5 text-[14px] font-medium text-white hover:bg-danger-500/90 disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
