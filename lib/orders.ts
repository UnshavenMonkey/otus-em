"use client";

import type { CartItem } from "@/lib/cart";

const ORDERS_STORAGE_KEY = "market-diploma-orders";
const ORDERS_CHANGE_EVENT = "market-diploma-orders-change";

export const ORDER_STATUSES = [
  "Новый",
  "В обработке",
  "Передан в доставку",
  "Выполнен",
  "Отменен",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = CartItem;

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  quantity: number;
  total: number;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyOrdersChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ORDERS_CHANGE_EVENT));
  }
}

function saveOrders(orders: Order[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  notifyOrdersChange();
}

function createOrderId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrders(): Order[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);

    if (!rawOrders) {
      return [];
    }

    const orders = JSON.parse(rawOrders) as Order[];

    if (!Array.isArray(orders)) {
      return [];
    }

    return orders
      .filter((order) => order.id && Array.isArray(order.items))
      .sort(
        (firstOrder, secondOrder) =>
          new Date(secondOrder.createdAt).getTime() -
          new Date(firstOrder.createdAt).getTime()
      );
  } catch {
    return [];
  }
}

export function createOrder(items: CartItem[]) {
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order: Order = {
    id: createOrderId(),
    createdAt: new Date().toISOString(),
    status: "Новый",
    items,
    quantity,
    total,
  };

  saveOrders([order, ...getOrders()]);

  return order;
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  saveOrders(
    getOrders().map((order) =>
      order.id === orderId ? { ...order, status } : order
    )
  );
}

export function subscribeToOrdersChange(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(ORDERS_CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(ORDERS_CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
