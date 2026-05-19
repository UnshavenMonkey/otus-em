"use client";

import { ShoppingCart } from "lucide-react";

import { Button, ButtonVariants } from "@/components/ui/button";
import type { CartSummary as CartSummaryData } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";

type CartSummaryProps = {
  summary: CartSummaryData;
  onCheckout: () => void;
  onClear: () => void;
};

export function CartSummary({
  summary,
  onCheckout,
  onClear,
}: CartSummaryProps) {
  return (
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
          <dd className="font-medium">{formatCurrency(summary.subtotal)}</dd>
        </div>
      </dl>

      <div className="mt-5 border-t pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-muted-foreground">К оплате</span>
          <strong className="text-2xl font-semibold">
            {formatCurrency(summary.subtotal)}
          </strong>
        </div>
        <Button className="mt-5 w-full" onClick={onCheckout}>
          Оформить заказ
        </Button>
        <Button
          className="mt-2 w-full"
          variant={ButtonVariants.Outline}
          onClick={onClear}
        >
          Очистить корзину
        </Button>
      </div>
    </aside>
  );
}
