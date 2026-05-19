"use client";

import type { Product } from "@/lib/api";

const CART_STORAGE_KEY = "market-diploma-cart";
const CART_CHANGE_EVENT = "market-diploma-cart-change";

export type CartItem = {
  productId: string;
  name: string;
  photo?: string;
  categoryName?: string;
  price: number;
  oldPrice?: number;
  quantity: number;
};

export type CartSummary = {
  quantity: number;
  subtotal: number;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeQuantity(quantity: number) {
  return Math.max(1, Math.min(99, Math.trunc(quantity)));
}

function notifyCartChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  }
}

function saveCartItems(items: CartItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  notifyCartChange();
}

export function getCartSnapshot() {
  if (!canUseStorage()) {
    return "";
  }

  try {
    return window.localStorage.getItem(CART_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function getCartItemsFromSnapshot(rawItems: string): CartItem[] {
  if (!rawItems) {
    return [];
  }

  try {
    const items = JSON.parse(rawItems) as CartItem[];

    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .filter((item) => item.productId && item.name && item.price >= 0)
      .map((item) => ({
        ...item,
        quantity: normalizeQuantity(item.quantity),
      }));
  } catch {
    return [];
  }
}

export function getCartItems(): CartItem[] {
  return getCartItemsFromSnapshot(getCartSnapshot());
}

export function addProductToCart(product: Product) {
  const items = getCartItems();
  const existingItem = items.find((item) => item.productId === product.id);

  if (existingItem) {
    saveCartItems(
      items.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: normalizeQuantity(item.quantity + 1) }
          : item
      )
    );
    return;
  }

  saveCartItems([
    ...items,
    {
      productId: product.id,
      name: product.name,
      photo: product.photo,
      categoryName: product.category?.name,
      price: product.price,
      oldPrice: product.oldPrice,
      quantity: 1,
    },
  ]);
}

export function updateCartItemQuantity(productId: string, quantity: number) {
  saveCartItems(
    getCartItems().map((item) =>
      item.productId === productId
        ? { ...item, quantity: normalizeQuantity(quantity) }
        : item
    )
  );
}

export function removeCartItem(productId: string) {
  saveCartItems(getCartItems().filter((item) => item.productId !== productId));
}

export function clearCart() {
  saveCartItems([]);
}

export function getCartSummary(items: CartItem[]): CartSummary {
  return items.reduce(
    (summary, item) => ({
      quantity: summary.quantity + item.quantity,
      subtotal: summary.subtotal + item.price * item.quantity,
    }),
    { quantity: 0, subtotal: 0 }
  );
}

export function subscribeToCartChange(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(CART_CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(CART_CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
