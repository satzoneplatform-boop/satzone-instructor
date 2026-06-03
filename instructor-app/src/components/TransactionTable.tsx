import { useState } from "react";
import { ArrowDownUp, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type Txn } from "../types/rows";
import { cn } from "../lib/cn";

const PAGE_SIZE = 10;

const COLUMNS = [
  { label: "Customer Name", sortable: true, width: "w-[194px]" },
  { label: "Course", sortable: true, width: "w-[280px]" },
  { label: "Price", sortable: true, width: "w-[92px]" },
  { label: "Payment Methods", sortable: true, width: "w-[188px]" },
  { label: "Status", sortable: true, width: "w-[124px]" },
  { label: "Action", sortable: false, width: "w-[124px]" },
];

export function TransactionTable({ rows, loading }: { rows: Txn[]; loading?: boolean }) {
  const nav = useNavigate();
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [page, setPage] = useState(1);

  function handleSort(label: string) {
    if (sortCol !== label) { setSortCol(label); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortCol(null); setSortDir(null); }
  }

  function getSortVal(t: Txn, col: string): string | number {
    switch (col) {
      case "Customer Name":   return t.name;
      case "Course":          return t.course;
      case "Price":           return parseFloat(String(t.price).replace(/[^0-9.]/g, "")) || 0;
      case "Payment Methods": return t.method;
      case "Status":          return t.status;
      default:                return "";
    }
  }

  const sorted = sortCol && sortDir
    ? [...rows].sort((a, b) => {
        const va = getSortVal(a, sortCol);
        const vb = getSortVal(b, sortCol);
        const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
        return sortDir === "asc" ? cmp : -cmp;
      })
    : rows;

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showFrom = sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showTo = Math.min(safePage * PAGE_SIZE, sorted.length);

  function changePage(p: number) {
    setPage(Math.max(1, Math.min(totalPages, p)));
  }

  const pages = makePageRange(safePage, totalPages);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-[18px] font-semibold text-ink">
          Transaction {loading && <span className="ml-2 text-[12px] font-normal text-slate-400">loading…</span>}
        </h2>
        <button
          onClick={() => nav("/transactions")}
          className="rounded-md border border-violet-100 px-3 py-2 text-[13px] font-medium text-primary hover:bg-violet-50 transition"
        >
          View All
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-violet-50 text-left">
            {COLUMNS.map((col) => (
              <th
                key={col.label}
                className={cn(
                  "py-3 text-[14px] font-medium text-slate-600",
                  col.width,
                  col.sortable && "cursor-pointer select-none"
                )}
                onClick={col.sortable ? () => handleSort(col.label) : undefined}
              >
                <span className="inline-flex items-center gap-2">
                  {col.label}
                  {col.sortable && (
                    <ArrowDownUp
                      size={14}
                      className={
                        sortCol === col.label && sortDir === "asc"
                          ? "text-blue-500"
                          : sortCol === col.label && sortDir === "desc"
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
          {pageRows.map((t) => (
            <Row key={t.id} t={t} />
          ))}
          {pageRows.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="py-10 text-center text-[13px] text-slate-400">
                {loading ? "Loading…" : "No transactions found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between pt-4">
        <span className="text-[13px] text-slate-600">
          Showing {showFrom} to {showTo} of {sorted.length} results
        </span>
        {totalPages > 1 && <nav className="flex items-center gap-1">
          <button
            onClick={() => changePage(safePage - 1)}
            disabled={safePage === 1}
            className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-violet-50 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={i} className="px-1 text-slate-400">…</span>
            ) : (
              <button
                key={i}
                onClick={() => changePage(p as number)}
                className={cn(
                  "grid h-7 min-w-[28px] place-items-center rounded px-2 text-[13px]",
                  p === safePage
                    ? "bg-primary font-medium text-white"
                    : "text-slate-600 hover:bg-violet-50"
                )}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => changePage(safePage + 1)}
            disabled={safePage === totalPages}
            className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-violet-50 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </nav>}
      </div>
    </section>
  );
}

function makePageRange(cur: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "...")[] = [1];
  if (cur > 3) out.push("...");
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) out.push(p);
  if (cur < total - 2) out.push("...");
  out.push(total);
  return out;
}

const CARD_LOGO: Record<Txn["method"], string> = {
  mastercard: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
  visa: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
  paypal: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
};

function Row({ t }: { t: Txn }) {
  return (
    <tr className="border-b border-violet-50 last:border-0">
      <td className="py-3">
        <div className="flex items-center gap-2">
          <img
            src={t.avatar}
            alt={t.name}
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="text-[14px] font-medium text-ink">{t.name}</span>
        </div>
      </td>
      <td className="py-3 text-[14px] text-secondary">{t.course}</td>
      <td className="py-3 text-[14px] font-medium text-ink">{t.price}</td>
      <td className="py-3">
        <div className="inline-flex items-center gap-2.5 text-[13px] text-ink">
          <img
            src={CARD_LOGO[t.method]}
            alt={t.method}
            className="h-4 w-7 object-contain"
          />
          <span>**** {t.cardLast4}</span>
        </div>
      </td>
      <td className="py-3">
        <StatusPill status={t.status} />
      </td>
      <td className="py-3">
        <div className="flex items-center gap-1.5">
          <ActionBtn>
            <Eye size={16} className="text-slate-600" />
          </ActionBtn>
          <ActionBtn>
            <Pencil size={16} className="text-slate-600" />
          </ActionBtn>
          <ActionBtn>
            <Trash2 size={16} className="text-danger-500" />
          </ActionBtn>
        </div>
      </td>
    </tr>
  );
}

function StatusPill({ status }: { status: Txn["status"] }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center justify-center rounded-md bg-positive-50 px-3 py-1.5 text-[13px] font-medium text-positive-600">
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded-md bg-danger-50 px-3 py-1.5 text-[13px] font-medium text-danger-500">
      Cancelled
    </span>
  );
}

function ActionBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="grid h-8 w-8 place-items-center rounded-md border border-violet-100 bg-white hover:bg-violet-50">
      {children}
    </button>
  );
}
