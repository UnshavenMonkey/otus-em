"use client";

import {
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CartSummary } from "@/app/cart/_components/cart-summary";
import { CartRow } from "@/app/cart/_components/cart-row";
import {
  ButtonVariants,
  buttonVariants,
} from "@/components/ui/button";
import {
  clearCart,
  getCartItems,
  getCartSummary,
  removeCartItem,
  subscribeToCartChange,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/cart";
import { useAuth } from "@/components/auth-provider";
import { createOrder, getRequestErrorMessage } from "@/lib/api";
import { AppRoutes } from "@/lib/routes";

export default function CartPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState("");
  const summary = useMemo(() => getCartSummary(items), [items]);

  useEffect(() => {
    function syncCart() {
      setItems(getCartItems());
    }

    syncCart();

    return subscribeToCartChange(syncCart);
  }, []);

  function handleQuantityChange(productId: string, quantity: number) {
    updateCartItemQuantity(productId, quantity);
    setItems(getCartItems());
  }

  function handleRemove(productId: string) {
    removeCartItem(productId);
    setItems(getCartItems());
  }

  function handleClear() {
    clearCart();
    setItems([]);
    setError("");
  }

  async function handleCheckout() {
    if (!items.length) {
      return;
    }

    if (!token) {
      router.push(AppRoutes.SignIn);
      return;
    }

    setError("");

    try {
      await createOrder(token, {
        products: items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
        })),
      });
      clearCart();
      setItems([]);
      router.push(AppRoutes.Orders);
    } catch (caughtError) {
      setError(
        getRequestErrorMessage(caughtError, "Не удалось оформить заказ")
      );
    }
  }

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <section className="w-full max-w-6xl">
        <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Покупки
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Корзина
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Проверьте список товаров, количество и итоговую стоимость заказа.
            </p>
          </div>

          <Link
            className={buttonVariants({ variant: ButtonVariants.Outline })}
            href={AppRoutes.Home}
          >
            <ShoppingBag aria-hidden="true" />
            В каталог
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {items.length ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="hidden grid-cols-[minmax(0,1fr)_150px_140px_48px] gap-4 border-b bg-muted/40 px-4 py-3 text-sm font-medium text-muted-foreground md:grid">
                <span>Товар</span>
                <span className="text-center">Количество</span>
                <span className="text-right">Стоимость</span>
                <span className="sr-only">Удалить</span>
              </div>

              <div className="divide-y">
                {items.map((item) => (
                  <CartRow
                    item={item}
                    key={item.productId}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>

            <CartSummary
              summary={summary}
              onCheckout={handleCheckout}
              onClear={handleClear}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-lg border bg-card p-10 text-center">
            <ShoppingCart
              className="mx-auto size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold">Корзина пуста</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Добавьте товары из каталога, чтобы увидеть их количество и
              стоимость здесь.
            </p>
            <Link
              className={buttonVariants({ className: "mt-5" })}
              href={AppRoutes.Home}
            >
              <ShoppingBag aria-hidden="true" />
              Перейти в каталог
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
