import { useCallback, useEffect, useState } from "react";
import { listMyOrders } from "../api/payments";
import { TXNS_MOCK, type TxnRow, type TxnStatus } from "../data/transactionsMock";

function mapStatus(s: string): TxnStatus {
  if (s === "paid") return "completed";
  if (s === "cancelled" || s === "refunded" || s === "failed") return "cancelled";
  return "pending";
}

function fmtMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function useAdminTransactions() {
  const [rows, setRows] = useState<TxnRow[]>(TXNS_MOCK);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listMyOrders()
      .then((orders) => {
        if (!mounted || !orders.length) return;
        const mapped: TxnRow[] = orders.slice(0, 50).map((o, i) => ({
          id: o.id,
          name: `Customer ${o.id.slice(0, 6)}`,
          userId: `#${o.id.slice(0, 6).toUpperCase()}`,
          avatar: `https://i.pravatar.cc/80?img=${20 + (i % 50)}`,
          course: o.item_kind === "course" ? `Course ${o.course_id?.slice(0, 6) ?? ""}` : `Program ${o.program_id?.slice(0, 6) ?? ""}`,
          price: fmtMoney(o.amount_cents, o.currency || "USD"),
          method: o.provider === "paypal" ? "paypal" : "mastercard",
          cardLast4: "----",
          status: mapStatus(o.status),
        }));
        setRows(mapped);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  return { rows, loading, reload };
}
