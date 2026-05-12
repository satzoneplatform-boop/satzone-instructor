import { useEffect, useState } from "react";
import { listMyOrders } from "../api/payments";
import { TRANSACTIONS as MOCK_TXNS, type Txn } from "../data/mock";

function brandToMethod(provider: string | null | undefined): Txn["method"] {
  if (!provider) return "mastercard";
  if (provider === "paypal") return "paypal";
  return "mastercard";
}

function fmtMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function useTransactions(): { rows: Txn[]; loading: boolean } {
  const [rows, setRows] = useState<Txn[]>(MOCK_TXNS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    listMyOrders()
      .then((orders) => {
        if (!mounted) return;
        if (!orders.length) return; // keep mocks for empty state
        const mapped: Txn[] = orders.slice(0, 10).map((o, i) => ({
          id: o.id,
          name: `Order ${o.id.slice(0, 6)}`,
          avatar: `https://i.pravatar.cc/80?img=${20 + (i % 50)}`,
          course: o.item_kind === "course" ? `Course ${o.course_id?.slice(0, 6) ?? ""}` : `Program ${o.program_id?.slice(0, 6) ?? ""}`,
          price: fmtMoney(o.amount_cents, o.currency || "USD"),
          method: brandToMethod(o.provider),
          cardLast4: "----",
          status: o.status === "paid" ? "completed" : "cancelled",
        }));
        setRows(mapped);
      })
      .catch(() => {
        // keep mocks
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { rows, loading };
}
