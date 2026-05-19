"use client";

import { Edit, ImageOff, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import {
  Button,
  ButtonSizes,
  ButtonVariants,
  buttonVariants,
} from "@/components/ui/button";
import type { Product } from "@/lib/api";
import {
  addProductToCart,
  getCartItemsFromSnapshot,
  getCartSnapshot,
  subscribeToCartChange,
} from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";
import { AppRoutes } from "@/lib/routes";

type ProductCardProps = {
  product: Product;
  canEdit: boolean;
};

export function ProductCard({ product, canEdit }: ProductCardProps) {
  const cartSnapshot = useSyncExternalStore(
    subscribeToCartChange,
    getCartSnapshot,
    () => ""
  );
  const isAdded = useMemo(
    () =>
      getCartItemsFromSnapshot(cartSnapshot).some(
        (item) => item.productId === product.id
      ),
    [cartSnapshot, product.id]
  );
  const price = formatCurrency(product.price);
  const oldPrice =
    typeof product.oldPrice === "number"
      ? formatCurrency(product.oldPrice)
      : null;

  function handleAddToCart() {
    addProductToCart(product);
  }

  return (
    <article className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex aspect-[4/3] items-center justify-center bg-muted">
        {product.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="h-full w-full object-cover"
            src={product.photo}
            alt={product.name}
          />
        ) : (
          <ImageOff className="size-8 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              {product.category?.name ?? "Без категории"}
            </p>
            <h2 className="mt-1 line-clamp-2 min-h-10 text-base font-semibold">
              {product.name}
            </h2>
          </div>
          {canEdit ? (
            <Link
              className={buttonVariants({
                variant: ButtonVariants.Outline,
                size: ButtonSizes.IconSm,
              })}
              href={AppRoutes.ProductEdit(product.id)}
              aria-label="Редактировать товар"
            >
              <Edit aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        {product.desc ? (
          <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
            {product.desc}
          </p>
        ) : (
          <p className="min-h-10 text-sm leading-5 text-muted-foreground">
            Описание не указано
          </p>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold">{price}</span>
          {oldPrice ? (
            <span className="text-sm text-muted-foreground line-through">
              {oldPrice}
            </span>
          ) : null}
        </div>

        <Button className="w-full" onClick={handleAddToCart}>
          <ShoppingCart aria-hidden="true" />
          {isAdded ? "Добавлено" : "В корзину"}
        </Button>
      </div>
    </article>
  );
}
