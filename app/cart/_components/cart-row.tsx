"use client";

import { ImageOff, Minus, Plus, Trash2 } from "lucide-react";

import {
  Button,
  ButtonSizes,
  ButtonVariants,
} from "@/components/ui/button";
import type { CartItem } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";

type CartRowProps = {
  item: CartItem;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartRow({
  item,
  onQuantityChange,
  onRemove,
}: CartRowProps) {
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
            {formatCurrency(item.price)} за шт.
          </p>
        </div>
      </div>

      <div className="flex w-fit items-center rounded-lg border bg-background">
        <Button
          size={ButtonSizes.IconSm}
          variant={ButtonVariants.Ghost}
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
          size={ButtonSizes.IconSm}
          variant={ButtonVariants.Ghost}
          onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
          disabled={item.quantity >= 99}
          aria-label="Увеличить количество"
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>

      <div className="text-left font-semibold md:text-right">
        {formatCurrency(itemTotal)}
      </div>

      <Button
        className="justify-self-start md:justify-self-end"
        size={ButtonSizes.IconSm}
        variant={ButtonVariants.Outline}
        onClick={() => onRemove(item.productId)}
        aria-label="Удалить товар"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </article>
  );
}
