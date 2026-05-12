import { ArrowDownUp, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { type Txn } from "../data/mock";
import { cn } from "../lib/cn";

const COLUMNS = [
  { label: "Customer Name", sortable: true, width: "w-[194px]" },
  { label: "Course", sortable: true, width: "w-[280px]" },
  { label: "Price", sortable: true, width: "w-[92px]" },
  { label: "Payment Methods", sortable: true, width: "w-[188px]" },
  { label: "Status", sortable: true, width: "w-[124px]" },
  { label: "Action", sortable: false, width: "w-[124px]" },
];

export function TransactionTable({ rows, loading }: { rows: Txn[]; loading?: boolean }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-[18px] font-semibold text-ink">
          Transaction {loading && <span className="ml-2 text-[12px] font-normal text-slate-400">loading…</span>}
        </h2>
        <button className="rounded-md border border-violet-100 px-3 py-2 text-[13px] font-medium text-primary">
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
                  col.width
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {col.label}
                  {col.sortable && <ArrowDownUp size={14} className="text-slate-400" />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <Row key={t.id} t={t} />
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between pt-4">
        <span className="text-[13px] text-slate-600">
          Showing 1 to 10 of 97 results
        </span>
        <nav className="flex items-center gap-1">
          <button className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-violet-50">
            <ChevronLeft size={16} />
          </button>
          {["1", "2", "3", "4", "...", "20", "21"].map((p, i) => (
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
