import type { OrderStatus } from "@/lib/api/types";

export const ALL_STATUSES_FILTER = "Все";

export const ORDERS_PAGE_SIZE = 100;

export const ORDERS_SEARCH_PARAMS = {
  Status: "status",
} as const;

export const orderDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirmation: "Ожидает подтверждения",
};
