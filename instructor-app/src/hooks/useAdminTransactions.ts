import { useCallback, useEffect, useState } from "react";
import { listMyOrders } from "../api/payments";
import { listMyCourses } from "../api/instructor";
import { type TxnRow, type TxnStatus } from "../types/rows";

function mapStatus(s: string): TxnStatus {
  if (s === "paid") return "completed";
  if (s === "cancelled" || s === "refunded" || s === "failed") return "cancelled";
  return "pending";
}

function fmtMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function useAdminTransactions() {
  const [rows, setRows] = useState<TxnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      try {
        const [orders, coursePage] = await Promise.all([
          listMyOrders(),
          listMyCourses({ size: 100 }),
        ]);
        if (!mounted) return;

        const courseMap = new Map(coursePage.items.map((c) => [c.id, c.title]));

        const mapped: TxnRow[] = orders.slice(0, 50).map((o, i) => {
          const courseTitle =
            o.item_kind === "course" && o.course_id
              ? (courseMap.get(o.course_id) ?? `Course …${o.course_id.slice(-6)}`)
              : o.item_kind === "program" && o.program_id
              ? `Program …${o.program_id.slice(-6)}`
              : "Unknown";

          return {
            id: o.id,
            name: `Order #${o.id.slice(0, 8).toUpperCase()}`,
            userId: `#${o.id.slice(0, 6).toUpperCase()}`,
            avatar: `https://i.pravatar.cc/80?img=${20 + (i % 50)}`,
            course: courseTitle,
            price: fmtMoney(o.amount_cents, o.currency || "USD"),
            method: o.provider === "paypal" ? "paypal" : "mastercard",
            cardLast4: "----",
            status: mapStatus(o.status),
          };
        });

        if (mounted) setRows(mapped);
      } catch {
        // leave rows as-is on error
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  return { rows, loading, reload };
}
