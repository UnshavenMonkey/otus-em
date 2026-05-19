import type { Order, OrderStatus, Product } from "@/lib/api/types";

import { ALL_STATUSES_FILTER } from "@/app/orders/_components/constants";

export type StatusFilter = OrderStatus | typeof ALL_STATUSES_FILTER;

export type NormalizedOrderProduct = Product & {
  quantity: number;
};

export type OrderCardProps = {
  order: Order;
  statusOptions: OrderStatus[];
  canUpdateStatus: boolean;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
};
