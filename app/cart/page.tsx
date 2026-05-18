"use client";

import {
  ImageOff,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  clearCart,
  getCartItems,
  getCartSummary,
  removeCartItem,
  subscribeToCartChange,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/cart";

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
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

          <Link className={buttonVariants({ variant: "outline" })} href="/">
            <ShoppingBag aria-hidden="true" />
            В каталог
          </Link>
        </div>

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

            <aside className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <ShoppingCart className="size-5" aria-hidden="true" />
                Итого
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Товаров</dt>
                  <dd className="font-medium">{summary.quantity}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Стоимость</dt>
                  <dd className="font-medium">
                    {currencyFormatter.format(summary.subtotal)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm text-muted-foreground">К оплате</span>
                  <strong className="text-2xl font-semibold">
                    {currencyFormatter.format(summary.subtotal)}
                  </strong>
                </div>
                <Button className="mt-5 w-full" disabled>
                  Оформить заказ
                </Button>
                <Button
                  className="mt-2 w-full"
                  variant="outline"
                  onClick={handleClear}
                >
                  Очистить корзину
                </Button>
              </div>
            </aside>
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
            <Link className={buttonVariants({ className: "mt-5" })} href="/">
              <ShoppingBag aria-hidden="true" />
              Перейти в каталог
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function CartRow({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  const itemTotal = item.price * item.quantity;

  return (
    <article className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_150px_140px_48px] md:items-center">
      <div className="flex min-w-0 gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
          {item.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="h-full w-full object-cover"
              src={item.photo}
              alt={item.name}
            />
          ) : (
            <ImageOff className="size-6 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {item.categoryName ?? "Без категории"}
          </p>
          <h2 className="mt-1 line-clamp-2 font-semibold">{item.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {currencyFormatter.format(item.price)} за шт.
          </p>
        </div>
      </div>

      <div className="flex w-fit items-center rounded-lg border bg-background">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label="Уменьшить количество"
        >
          <Minus aria-hidden="true" />
        </Button>
        <span className="min-w-10 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
          disabled={item.quantity >= 99}
          aria-label="Увеличить количество"
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>

      <div className="text-left font-semibold md:text-right">
        {currencyFormatter.format(itemTotal)}
      </div>

      <Button
        className="justify-self-start md:justify-self-end"
        size="icon-sm"
        variant="outline"
        onClick={() => onRemove(item.productId)}
        aria-label="Удалить товар"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </article>
  );
}
