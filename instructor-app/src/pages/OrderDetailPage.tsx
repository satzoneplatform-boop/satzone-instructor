import { useState } from "react";
import { ChevronDown, ChevronUp, Download, Plus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ORDER_DETAIL_MOCK } from "../data/transactionsMock";
import { cn } from "../lib/cn";

type Tab = "details" | "course" | "invoice";

export function OrderDetailPage() {
  const { id: _id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("details");
  const data = ORDER_DETAIL_MOCK;

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-ink">Order Details</h1>
          <p className="mt-1 text-[14px] text-slate-600">Let's check your update today</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav("/transactions")}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-[14px] font-medium text-secondary"
          >
            <X size={16} /> Cancel
          </button>
          <button
            type="button"
            onClick={() => nav("/transactions/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-[14px] font-medium text-white hover:bg-secondary/90"
          >
            <Plus size={16} /> Add Transaction
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
          {tab === "details" && <DetailsTab data={data} />}
          {tab === "course" && <CourseTab data={data} />}
          {tab === "invoice" && <InvoiceTab data={data} />}
        </div>
      </section>
    </AppShell>
  );
}

function DetailsTab({ data }: { data: typeof ORDER_DETAIL_MOCK }) {
  const [billingOpen, setBillingOpen] = useState(true);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">Oder Details</h3>
        <button className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 py-1.5 text-[13px] font-medium text-secondary">
          <Download size={14} /> Expert
        </button>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr_1fr_1.4fr] gap-6 border-b border-violet-50 pb-5">
        <Col label="Name">
          <div className="flex items-center gap-2">
            <img src={data.customer.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
            <span className="text-[14px] font-medium text-ink">{data.customer.name}</span>
          </div>
        </Col>
        <Col label="Email">{data.customer.email}</Col>
        <Col label="Phone">{data.customer.phone}</Col>
        <Col label="Location">{data.customer.location}</Col>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-violet-50 pb-5">
        <div>
          <h4 className="text-[14px] font-semibold text-ink">Payment method</h4>
          <dl className="mt-2 flex flex-col gap-1 text-[13px] text-secondary">
            <Pair label="Credit Card" value="" />
            <Pair label="Transaction ID:" value={data.payment.transactionId} />
            <Pair label="Amount:" value={data.payment.amount} />
          </dl>
        </div>
        <div>
          <h4 className="text-[14px] font-semibold text-ink">Shipping method</h4>
          <dl className="mt-2 flex flex-col gap-1 text-[13px] text-secondary">
            <Pair label={data.shipping.carrier} value="" />
            <Pair label="Tracking Code:" value={data.shipping.trackingCode} />
            <Pair label="Date:" value={data.shipping.date} />
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-violet-100 p-5">
        <button
          type="button"
          onClick={() => setBillingOpen((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <h4 className="text-[15px] font-semibold text-ink">Billing address</h4>
          {billingOpen ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </button>
        {billingOpen && (
          <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-2 text-[13px] text-secondary">
            <Pair label="First name:" value={data.billing.firstName} />
            <Pair label="State/Region:" value={data.billing.state} />
            <Pair label="Phone:" value={data.billing.phone} />
            <Pair label="Last name:" value={data.billing.lastName} />
            <Pair label="City:" value={data.billing.city} />
            <Pair label="Email:" value={data.billing.email} />
            <Pair label="Address:" value={data.billing.address} />
            <Pair label="Country:" value={data.billing.country} />
            <Pair label="Postcode:" value={data.billing.postcode} />
          </div>
        )}
      </div>
    </div>
  );
}

function CourseTab({ data }: { data: typeof ORDER_DETAIL_MOCK }) {
  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-[15px] font-semibold text-ink">Courses</h3>
        <button className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 py-1.5 text-[13px] font-medium text-secondary">
          <Download size={14} /> Expert
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-y border-violet-50 text-left text-[13px] font-medium text-slate-600">
            <th className="py-3">Course</th>
            <th className="py-3">Price</th>
            <th className="py-3">Quantity</th>
            <th className="py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it) => (
            <tr key={it.id}>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <img src={it.thumb} alt="" className="h-10 w-10 rounded-md object-cover" />
                  <span className="text-[14px] font-medium text-ink">{it.title}</span>
                </div>
              </td>
              <td className="py-3 text-[14px] text-secondary">{fmt(it.price)}</td>
              <td className="py-3 text-[14px] text-secondary">{it.quantity}</td>
              <td className="py-3 text-right text-[14px] font-medium text-ink">{fmt(it.price * it.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceTab({ data }: { data: typeof ORDER_DETAIL_MOCK }) {
  const inv = data.invoice;
  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-[15px] font-semibold text-ink">Courses</h3>
        <button className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 py-1.5 text-[13px] font-medium text-secondary">
          <Download size={14} /> Expert
        </button>
      </div>

      <div className="rounded-xl bg-white p-5">
        <div className="flex items-start justify-between gap-6">
          <div className="grid h-[120px] w-[120px] place-items-center rounded-lg bg-primary text-center text-white">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-medium tracking-wide">INVOICE</span>
              <span className="text-[16px] font-bold">{inv.number}</span>
            </div>
          </div>

          <div className="flex-1 text-[13px] text-secondary">
            <p className="font-semibold text-ink">{inv.company.name}</p>
            <p>{inv.company.address}</p>
            <p>{inv.company.phone}</p>
            <p>{inv.company.email}</p>
            <p>{inv.company.site}</p>
          </div>

          <div className="flex flex-col items-end gap-2 text-[13px]">
            <span className="text-slate-500">{inv.date}</span>
            <div className="flex items-center gap-1.5">
              <div className="grid h-5 w-5 place-items-center rounded bg-primary text-[10px] font-bold text-white">U</div>
              <span className="font-semibold text-ink">UStudy</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <table className="w-full">
            <thead>
              <tr className="border-y border-violet-50 text-left text-[13px] font-medium text-slate-600">
                <th className="py-3">Course</th>
                <th className="py-3">Price</th>
                <th className="py-3">Quantity</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-3 text-[14px] text-ink">{it.title}</td>
                  <td className="py-3 text-[14px] text-secondary">{fmt(it.price)}</td>
                  <td className="py-3 text-[14px] text-secondary">{it.quantity}</td>
                  <td className="py-3 text-right text-[14px] font-medium text-ink">{fmt(it.price * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <dl className="w-[300px] space-y-2 text-[13px]">
            <Pair label="Subtotal" value={fmt(inv.subtotal)} />
            <Pair label={`TAX(${inv.taxPct}%)`} value={fmt(inv.subtotal * (inv.taxPct / 100))} />
            <Pair label="Discount" value={`-${fmt(inv.discount)}`} valueClass="text-danger-500" />
            <div className="my-1 border-t border-violet-100" />
            <Pair label="Total" value={fmt(inv.total)} bold />
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

function fmt(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
