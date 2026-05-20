import { useEffect, useState } from "react";
import { listMyOrders } from "../api/payments";
import { listMyCourses } from "../api/instructor";
import { type Txn } from "../data/mock";

function brandToMethod(provider: string | null | undefined): Txn["method"] {
  if (!provider) return "mastercard";
  if (provider === "paypal") return "paypal";
  return "mastercard";
}

function fmtMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function useTransactions(): { rows: Txn[]; loading: boolean } {
  const [rows, setRows] = useState<Txn[]>([]);   // no mock initial state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [orders, coursePage] = await Promise.all([
          listMyOrders(),
          listMyCourses({ size: 100 }),
        ]);
        if (!mounted) return;

        const courseMap = new Map(coursePage.items.map((c) => [c.id, c.title]));

        const mapped: Txn[] = orders.slice(0, 10).map((o, i) => ({
          id: o.id,
          name: `Order #${o.id.slice(0, 8).toUpperCase()}`,
          avatar: `https://i.pravatar.cc/80?img=${20 + (i % 50)}`,
          course:
            o.item_kind === "course" && o.course_id
              ? (courseMap.get(o.course_id) ?? `Course …${o.course_id.slice(-6)}`)
              : `Program …${(o.program_id ?? "").slice(-6)}`,
          price: fmtMoney(o.amount_cents, o.currency || "USD"),
          method: brandToMethod(o.provider),
          cardLast4: "----",
          status: o.status === "paid" ? "completed" : "cancelled",
        }));

        if (mounted) setRows(mapped);
      } catch {
        // leave rows empty on error — table shows "No transactions found"
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { rows, loading };
}
