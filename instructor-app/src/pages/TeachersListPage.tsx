import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  ArrowDownUp,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { useToast } from "../components/Toast";
import { deleteInstructor } from "../api/admin";
import { useTeachers } from "../hooks/useTeachers";
import type { TeacherRow, TeacherStatus } from "../data/teachersMock";
import { cn } from "../lib/cn";

const COLS = [
  { label: "Name", sortable: true },
  { label: "Course", sortable: true },
  { label: "Join Date", sortable: true },
  { label: "Earning", sortable: true },
  { label: "Balance", sortable: true },
  { label: "Status", sortable: true },
  { label: "Action", sortable: false },
];

export function TeachersListPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<TeacherRow | null>(null);
  const { rows, total, loading, reload } = useTeachers(page, 20);
  const nav = useNavigate();
  const { notify } = useToast();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.userId.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-ink">Teachers</h1>
          <p className="mt-1 text-[14px] text-slate-600">
            Let's check your update today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary">
            <Download size={16} /> Export
          </button>
          <Link
            to="/teachers/new"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-[14px] font-medium text-white hover:bg-secondary/90"
          >
            <Plus size={16} /> Add Teachers
          </Link>
        </div>
      </div>

      {/* Card with toolbar + table */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 pb-4">
          <div className="flex w-[420px] items-center gap-2 rounded-full border-[1.5px] border-violet-50 bg-white py-2.5 pl-3 pr-4">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-slate-300 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 py-2 text-[13px] font-medium text-secondary">
              <SlidersHorizontal size={16} /> Filters
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 py-2 text-[13px] font-medium text-secondary">
              <ArrowDownUp size={16} /> Apr 11, Apr 24
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-violet-50 text-left">
              {COLS.map((c) => (
                <th key={c.label} className="py-3 text-[13px] font-medium text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    {c.label}
                    {c.sortable && <ArrowDownUp size={12} className="text-slate-400" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <Row
                key={r.id}
                r={r}
                onView={() => nav(`/teachers/${r.id}`)}
                onEdit={() => nav(`/teachers/${r.id}/edit`)}
                onDelete={() => setToDelete(r)}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={COLS.length} className="py-10 text-center text-[13px] text-slate-400">
                  {loading ? "Loading…" : "No teachers found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between pt-4">
          <span className="text-[13px] text-slate-600">
            Showing 1 to {Math.min(filtered.length, 10)} of {total} results
          </span>
          <Pager page={page} totalPages={Math.max(1, Math.ceil(total / 20))} onChange={setPage} />
        </div>
      </section>

      {toDelete && (
        <ConfirmDeleteModal
          title="Delete Teachers"
          entityName={toDelete.name}
          onClose={() => setToDelete(null)}
          onConfirm={() => deleteInstructor(toDelete.id)}
          onDeleted={() => {
            notify(`Removed ${toDelete.name}.`, "success");
            setToDelete(null);
            reload();
          }}
        />
      )}
    </AppShell>
  );
}

function Row({
  r,
  onView,
  onEdit,
  onDelete,
}: {
  r: TeacherRow;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-violet-50 last:border-0">
      <td className="py-3">
        <div className="flex items-center gap-3">
          <img src={r.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div className="flex flex-col">
            <span className="text-[14px] font-medium text-ink">{r.name}</span>
            <span className="text-[12px] text-slate-400">{r.userId}</span>
          </div>
        </div>
      </td>
      <td className="py-3 text-[14px] text-secondary">{r.course}</td>
      <td className="py-3 text-[14px] text-secondary">{r.joinDate}</td>
      <td className="py-3 text-[14px] text-ink">{r.earning}</td>
      <td className="py-3 text-[14px] text-ink">{r.balance}</td>
      <td className="py-3">
        <StatusPill status={r.status} />
      </td>
      <td className="py-3">
        <div className="flex items-center gap-1.5">
          <ActionBtn onClick={onView} className="bg-positive-50 text-positive-600">
            <Eye size={16} />
          </ActionBtn>
          <ActionBtn onClick={onEdit} className="bg-violet-50 text-primary">
            <Pencil size={16} />
          </ActionBtn>
          <ActionBtn onClick={onDelete} className="bg-danger-50 text-danger-500">
            <Trash2 size={16} />
          </ActionBtn>
        </div>
      </td>
    </tr>
  );
}

function StatusPill({ status }: { status: TeacherStatus }) {
  const map: Record<TeacherStatus, { bg: string; text: string; label: string }> = {
    active: { bg: "bg-positive-50", text: "text-positive-600", label: "Active" },
    pending: { bg: "bg-warn-50", text: "text-amber-600", label: "Pending" },
    suspend: { bg: "bg-danger-50", text: "text-danger-500", label: "Suspend" },
  };
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center justify-center rounded-md px-3 py-1 text-[12px] font-medium", m.bg, m.text)}>
      {m.label}
    </span>
  );
}

function ActionBtn({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn("grid h-8 w-8 place-items-center rounded-md hover:opacity-80", className)}
    >
      {children}
    </button>
  );
}

function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = makeRange(page, totalPages);
  return (
    <nav className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-violet-50"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="px-1 text-slate-400">…</span>
        ) : (
          <button
            key={i}
            onClick={() => onChange(p)}
            className={cn(
              "grid h-7 min-w-[28px] place-items-center rounded px-2 text-[13px]",
              p === page ? "bg-primary font-medium text-white" : "text-slate-600 hover:bg-violet-50"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-violet-50"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

function makeRange(cur: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "...")[] = [1];
  if (cur > 3) out.push("...");
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) out.push(p);
  if (cur < total - 2) out.push("...");
  out.push(total);
  return out;
}
