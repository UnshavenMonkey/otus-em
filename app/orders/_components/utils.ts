import {
  ALL_STATUSES_FILTER,
  ORDER_STATUS_LABELS,
} from "@/app/orders/_components/constants";
import type {
  NormalizedOrderProduct,
  StatusFilter,
} from "@/app/orders/_components/types";
import type { Order, OrderStatus } from "@/lib/api/types";

export function getOrderItems(order: Order): NormalizedOrderProduct[] {
  return (order.products ?? [])
    .map((item) => {
      if ("product" in item) {
        return {
          ...item.product,
          quantity: item.quantity ?? 1,
        };
      }

      return {
        ...item,
        quantity: item.quantity ?? 1,
      };
    })
    .filter((item) => item.id);
}

export function getOrderProductQuantity(product: NormalizedOrderProduct) {
  return product.quantity;
}

export function getOrderQuantity(order: Order) {
  return getOrderItems(order).reduce(
    (quantity, product) => quantity + getOrderProductQuantity(product),
    0
  );
}

export function getOrderTotal(order: Order) {
  return getOrderItems(order).reduce(
    (total, product) => total + product.price * getOrderProductQuantity(product),
    0
  );
}

export function getOrderStatusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getStatusFilterValue(status: string | null): StatusFilter {
  return status || ALL_STATUSES_FILTER;
}
