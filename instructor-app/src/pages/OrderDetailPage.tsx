import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Download, X } from "lucide-react";
import { exportExcel } from "../lib/exportExcel";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { listMyOrders } from "../api/payments";
import { getMyCourse } from "../api/instructor";
import { ApiError } from "../api/client";
import type { OrderRead, InstructorCourseRead } from "../api/types";
import { cn } from "../lib/cn";

type Tab = "details" | "course" | "invoice";

function fmtMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  paid:      { bg: "bg-positive-50", text: "text-positive-600", label: "Paid" },
  pending:   { bg: "bg-warn-50",     text: "text-amber-600",    label: "Pending" },
  cancelled: { bg: "bg-danger-50",   text: "text-danger-500",   label: "Cancelled" },
  refunded:  { bg: "bg-slate-100",   text: "text-slate-500",    label: "Refunded" },
  failed:    { bg: "bg-danger-50",   text: "text-danger-500",   label: "Failed" },
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("details");
  const [order, setOrder] = useState<OrderRead | null>(null);
  const [course, setCourse] = useState<InstructorCourseRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const orders = await listMyOrders();
        if (!mounted) return;
        const found = orders.find((o) => o.id === id);
        if (!found) {
          setError("Order not found.");
          return;
        }
        setOrder(found);

        if (found.course_id) {
          try {
            const c = await getMyCourse(found.course_id);
            if (mounted) setCourse(c);
          } catch {
            // course lookup optional — don't fail the page
          }
        }
      } catch (e) {
        if (mounted) setError(e instanceof ApiError ? e.message : "Could not load order.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <p className="text-[14px] text-slate-500">Loading order…</p>
      </AppShell>
    );
  }

  if (error || !order) {
    return (
      <AppShell>
        <div className="rounded-lg bg-danger-50 p-4 text-[13px] text-danger-500">
          {error ?? "Order not found."}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-ink">Order Details</h1>
          <p className="mt-1 text-[14px] text-slate-600">
            #{order.id.slice(0, 16).toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav("/transactions")}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary"
          >
            <X size={16} /> Back
          </button>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <nav className="flex items-center gap-8 border-b border-violet-100">
          {(["details", "course", "invoice"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "relative pb-3 text-[14px] font-medium capitalize transition",
                tab === t ? "text-primary" : "text-slate-500 hover:text-secondary"
              )}
            >
              {t === "details" ? "Order Details" : t === "course" ? "Course" : "Invoice"}
              {tab === t && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        <div className="pt-5">
          {tab === "details" && <DetailsTab order={order} />}
          {tab === "course" && <CourseTab order={order} course={course} />}
          {tab === "invoice" && <InvoiceTab order={order} course={course} />}
        </div>
      </section>
    </AppShell>
  );
}

function DetailsTab({ order }: { order: OrderRead }) {
  const [billingOpen, setBillingOpen] = useState(true);
  const st = STATUS_MAP[order.status] ?? STATUS_MAP["pending"];

  function onExport() {
    exportExcel(
      [{
        "Order ID":   order.id,
        Type:         order.item_kind,
        Status:       order.status,
        Amount:       fmtMoney(order.amount_cents, order.currency),
        Currency:     order.currency.toUpperCase(),
        Provider:     order.provider ?? "—",
        "Paid At":    order.paid_at ? new Date(order.paid_at).toLocaleString() : "—",
        "Created At": new Date(order.created_at).toLocaleString(),
      }],
      `order_${order.id.slice(0, 12)}`
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">Order Details</h3>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 py-1.5 text-[13px] font-medium text-secondary hover:bg-violet-50 transition"
        >
          <Download size={14} /> Export
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 border-b border-violet-50 pb-5">
        <Col label="Order ID">
          <span className="font-mono text-[13px]">#{order.id.slice(0, 12).toUpperCase()}</span>
        </Col>
        <Col label="Status">
          <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium", st.bg, st.text)}>
            {st.label}
          </span>
        </Col>
        <Col label="Amount">
          <span className="text-[15px] font-semibold text-ink">
            {fmtMoney(order.amount_cents, order.currency)}
          </span>
        </Col>
        <Col label="Provider">
          <span className="capitalize">{order.provider ?? "—"}</span>
        </Col>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-violet-50 pb-5">
        <div>
          <h4 className="text-[14px] font-semibold text-ink">Payment details</h4>
          <dl className="mt-2 flex flex-col gap-1.5 text-[13px] text-secondary">
            <Pair label="Provider:" value={<span className="capitalize">{order.provider ?? "—"}</span>} />
            <Pair label="Currency:" value={order.currency.toUpperCase()} />
            <Pair label="Amount paid:" value={fmtMoney(order.amount_cents, order.currency)} />
          </dl>
        </div>
        <div>
          <h4 className="text-[14px] font-semibold text-ink">Timeline</h4>
          <dl className="mt-2 flex flex-col gap-1.5 text-[13px] text-secondary">
            <Pair label="Created:"   value={fmtDate(order.created_at)} />
            <Pair label="Paid:"      value={fmtDate(order.paid_at)} />
            <Pair label="Cancelled:" value={fmtDate(order.cancelled_at)} />
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-violet-100 p-5">
        <button
          type="button"
          onClick={() => setBillingOpen((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <h4 className="text-[15px] font-semibold text-ink">Item</h4>
          {billingOpen ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </button>
        {billingOpen && (
          <div className="mt-3 text-[13px] text-secondary">
            <Pair label="Type:"    value={<span className="capitalize">{order.item_kind}</span>} />
            {order.course_id   && <Pair label="Course ID:"  value={<span className="font-mono">{order.course_id}</span>} />}
            {order.program_id  && <Pair label="Program ID:" value={<span className="font-mono">{order.program_id}</span>} />}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseTab({ order, course }: { order: OrderRead; course: InstructorCourseRead | null }) {
  if (!order.course_id) {
    return (
      <div className="py-8 text-center text-[14px] text-slate-400">
        This order is not linked to a course.
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-8 text-center text-[14px] text-slate-400">
        Course details unavailable.
      </div>
    );
  }

  const price = fmtMoney(course.discount_price_cents ?? course.price_cents, course.currency);

  function onExport() {
    const c = course!;
    exportExcel(
      [{
        "Course Title":   c.title,
        Subtitle:         c.subtitle ?? "",
        Level:            c.level,
        Language:         c.language.toUpperCase(),
        Lessons:          c.lectures_count,
        "Duration (min)": c.duration_minutes,
        Price:            price,
        Status:           c.status,
      }],
      `order_course_${c.id.slice(0, 10)}`
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-[15px] font-semibold text-ink">Course</h3>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 py-1.5 text-[13px] font-medium text-secondary hover:bg-violet-50 transition"
        >
          <Download size={14} /> Export
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-y border-violet-50 text-left text-[13px] font-medium text-slate-600">
            <th className="py-3">Course</th>
            <th className="py-3">Level</th>
            <th className="py-3">Lessons</th>
            <th className="py-3 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-3">
              <div className="flex items-center gap-3">
                <img
                  src={course.thumbnail_url ?? `https://picsum.photos/seed/${course.id}/48/48`}
                  alt=""
                  className="h-10 w-10 rounded-md object-cover"
                />
                <div>
                  <p className="text-[14px] font-medium text-ink">{course.title}</p>
                  {course.subtitle && <p className="text-[12px] text-slate-400">{course.subtitle}</p>}
                </div>
              </div>
            </td>
            <td className="py-3 text-[13px] capitalize text-secondary">{course.level.replace("_", " ")}</td>
            <td className="py-3 text-[13px] text-secondary">{course.lectures_count}</td>
            <td className="py-3 text-right text-[14px] font-medium text-ink">{price}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function InvoiceTab({ order, course }: { order: OrderRead; course: InstructorCourseRead | null }) {
  const amount = fmtMoney(order.amount_cents, order.currency);
  const amountNum = order.amount_cents / 100;
  const tax = 0;
  const discount = 0;

  function onExport() {
    exportExcel(
      [{
        "Invoice #":    order.id.slice(0, 12).toUpperCase(),
        Item:           course ? course.title : order.item_kind,
        Status:         order.status,
        Subtotal:       fmtMoney(order.amount_cents, order.currency),
        "Tax":          fmtMoney(tax, order.currency),
        Discount:       fmtMoney(discount, order.currency),
        Total:          fmtMoney(order.amount_cents, order.currency),
        Provider:       order.provider ?? "—",
        "Paid At":      order.paid_at ? new Date(order.paid_at).toLocaleString() : "—",
      }],
      `invoice_${order.id.slice(0, 12).toUpperCase()}`
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-[15px] font-semibold text-ink">Invoice</h3>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 py-1.5 text-[13px] font-medium text-secondary hover:bg-violet-50 transition"
        >
          <Download size={14} /> Export to Excel
        </button>
      </div>

      <div className="rounded-xl border border-violet-100 p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="grid h-[100px] w-[100px] place-items-center rounded-lg bg-primary text-center text-white">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium tracking-wide">INVOICE</span>
              <span className="text-[13px] font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          <div className="flex-1 text-[13px] text-secondary">
            <p className="font-semibold text-ink">IdrokHub Platform</p>
            <p>{order.provider ? `Paid via ${order.provider}` : "Payment processor"}</p>
          </div>

          <div className="flex flex-col items-end gap-1.5 text-[13px]">
            <span className="text-slate-500">{fmtDate(order.paid_at ?? order.created_at)}</span>
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                (STATUS_MAP[order.status] ?? STATUS_MAP["pending"]).bg,
                (STATUS_MAP[order.status] ?? STATUS_MAP["pending"]).text
              )}
            >
              {(STATUS_MAP[order.status] ?? STATUS_MAP["pending"]).label}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <table className="w-full">
            <thead>
              <tr className="border-y border-violet-50 text-left text-[13px] font-medium text-slate-600">
                <th className="py-3">Item</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 text-[14px] text-ink">
                  {course ? course.title : `${order.item_kind} purchase`}
                </td>
                <td className="py-3 text-right text-[14px] font-medium text-ink">{amount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <dl className="w-[280px] space-y-2 text-[13px]">
            <Pair label="Subtotal" value={amount} />
            <Pair label="Tax (0%)" value={fmtMoney(tax, order.currency)} />
            <Pair label="Discount" value={`-${fmtMoney(discount, order.currency)}`} valueClass="text-danger-500" />
            <div className="my-1 border-t border-violet-100" />
            <Pair label="Total" value={fmtMoney(amountNum * 100, order.currency)} bold />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Col({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-slate-500">{label}</span>
      <span className="text-[14px] text-secondary">{children}</span>
    </div>
  );
}

function Pair({
  label,
  value,
  bold,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={cn("text-slate-500", bold && "font-semibold text-ink")}>{label}</span>
      <span className={cn("font-medium text-ink", bold && "text-[15px]", valueClass)}>{value}</span>
    </div>
  );
}
