"use client";

import { Edit, ImageOff } from "lucide-react";
import Link from "next/link";

import {
  ButtonSizes,
  ButtonVariants,
  buttonVariants,
} from "@/components/ui/button";
import type { Category } from "@/lib/api/types";
import { AppRoutes } from "@/lib/routes";

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {category.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="h-full w-full object-cover"
            src={category.photo}
            alt={category.name}
          />
        ) : (
          <ImageOff className="size-6 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-semibold">{category.name}</h2>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {category.id}
        </p>
      </div>
      <Link
        className={buttonVariants({
          variant: ButtonVariants.Outline,
          size: ButtonSizes.Icon,
        })}
        href={AppRoutes.CategoryEdit(category.id)}
        aria-label="Редактировать категорию"
        title="Редактировать"
      >
        <Edit aria-hidden="true" />
      </Link>
    </article>
  );
}
