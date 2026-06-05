import { api } from "./client";
import type { OrderRead } from "./types";

export function listMyOrders() {
  return api<OrderRead[]>("/me/orders");
}
