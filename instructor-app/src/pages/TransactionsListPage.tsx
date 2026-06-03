import { useState } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { exportExcel } from "../lib/exportExcel";
import { useAdminTransactions } from "../hooks/useAdminTransactions";
import type { TxnRow, TxnStatus, TxnMethod } from "../types/rows";
import { cn } from "../lib/cn";

const COLS = [
  { label: "Customer Name", sortable: true },
  { label: "Course", sortable: true },
  { label: "Price", sortable: true },
  { label: "Payment Methods", sortable: true },
  { label: "Status", sortable: true },
  { label: "Action", sortable: false },
];

const CARD_LOGO: Record<TxnMethod, string> = {
  mastercard: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
  visa: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
  paypal: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
};

export function TransactionsListPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<TxnRow | null>(null);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const { rows, loading, reload } = useAdminTransactions();
  const nav = useNavigate();

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      r.course.toLowerCase().includes(query.trim().toLowerCase())
  );

  function handleSort(label: string) {
    if (sortCol !== label) { setSortCol(label); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortCol(null); setSortDir(null); }
  }

  function getSortVal(r: TxnRow, col: string): string | number {
    switch (col) {
      case "Customer Name":   return r.name;
      case "Course":          return r.course;
      case "Price":           return parseFloat(String(r.price).replace(/[^0-9.]/g, "")) || 0;
      case "Payment Methods": return r.method;
      case "Status":          return r.status;
      default:                return "";
    }
  }

  const displayed = sortCol && sortDir
    ? [...filtered].sort((a, b) => {
        const va = getSortVal(a, sortCol);
        const vb = getSortVal(b, sortCol);
        const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-ink">Transactions</h1>
          <p className="mt-1 text-[14px] text-slate-600">View and track all student payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              exportExcel(
                rows.map((r) => ({
                  "Order ID":       r.id,
                  Customer:         r.name,
                  Course:           r.course,
                  Price:            r.price,
                  "Payment Method": r.method,
                  Status:           r.status,
                })),
                `transactions_${new Date().toISOString().slice(0, 10)}`
              )
            }
            className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary hover:bg-violet-50 transition"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 pb-4">
          <div className="flex w-[420px] items-center gap-2 rounded-full border-[1.5px] border-violet-50 bg-white py-2.5 pl-3 pr-4">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-slate-300 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 py-2 text-[13px] font-medium text-secondary">
              <ArrowDownUp size={16} />
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-violet-50 text-left">
              {COLS.map((c) => (
                <th
                  key={c.label}
                  className={cn("py-3 text-[13px] font-medium text-slate-600", c.sortable && "cursor-pointer select-none")}
                  onClick={c.sortable ? () => handleSort(c.label) : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {c.label}
                    {c.sortable && (
                      <ArrowDownUp
                        size={12}
                        className={
                          sortCol === c.label && sortDir === "asc"
                            ? "text-blue-500"
                            : sortCol === c.label && sortDir === "desc"
                            ? "text-amber-500"
                            : "text-slate-400"
                        }
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((t) => (
              <Row
                key={t.id}
                t={t}
                onView={() => nav(`/transactions/${t.id}`)}
                onEdit={() => nav(`/transactions/${t.id}/edit`)}
                onDelete={() => setToDelete(t)}
              />
            ))}
            {displayed.length === 0 && (
              <tr>
                <td colSpan={COLS.length} className="py-10 text-center text-[13px] text-slate-400">
                  {loading ? "Loading…" : "No transactions found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between pt-4">
          <span className="text-[13px] text-slate-600">
            Showing {displayed.length} of {filtered.length} results
          </span>
          <Pager page={page} totalPages={Math.max(1, Math.ceil(filtered.length / 20))} onChange={setPage} />
        </div>
      </section>

      {toDelete && (
        <ConfirmDeleteModal
          title="Delete Transaction"
          entityName={toDelete.name}
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            // No admin delete-order endpoint; treat as local-only.
          }}
          onDeleted={() => {
            setToDelete(null);
            reload();
          }}
        />
      )}
    </AppShell>
  );
}

function Row({
  t,
  onView,
  onEdit,
  onDelete,
}: {
  t: TxnRow;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-violet-50 last:border-0">
      <td className="py-3">
        <div className="flex items-center gap-3">
          <img src={t.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div className="flex flex-col">
            <span className="text-[14px] font-medium text-ink">{t.name}</span>
            <span className="text-[12px] text-slate-400">{t.userId}</span>
          </div>
        </div>
      </td>
      <td className="py-3 text-[13px] text-secondary">{t.course}</td>
      <td className="py-3 text-[14px] font-medium text-ink">{t.price}</td>
      <td className="py-3">
        <div className="inline-flex items-center gap-2.5 text-[13px] text-ink">
          <img src={CARD_LOGO[t.method]} alt={t.method} className="h-4 w-7 object-contain" />
          <span>**** {t.cardLast4}</span>
        </div>
      </td>
      <td className="py-3">
        <StatusPill status={t.status} />
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

function StatusPill({ status }: { status: TxnStatus }) {
  const map: Record<TxnStatus, { bg: string; text: string; label: string }> = {
    completed: { bg: "bg-positive-50", text: "text-positive-600", label: "Completed" },
    cancelled: { bg: "bg-danger-50",   text: "text-danger-500",   label: "Cancelled" },
    pending:   { bg: "bg-warn-50",     text: "text-amber-600",    label: "Pending"   },
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
    <button onClick={onClick} className={cn("grid h-8 w-8 place-items-center rounded-md hover:opacity-80", className)}>
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
      <button onClick={() => onChange(Math.max(1, page - 1))} className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-violet-50">
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
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-violet-50">
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
