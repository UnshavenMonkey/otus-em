"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Button,
  ButtonVariants,
} from "@/components/ui/button";

type CatalogPaginationProps = {
  page: number;
  pageSize: number;
  pageSizeOptions: readonly number[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function CatalogPagination({
  page,
  pageSize,
  pageSizeOptions,
  total,
  totalPages,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: CatalogPaginationProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Страница {page} из {totalPages}. Всего товаров: {total}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">На странице</span>
          <select
            className="h-9 cursor-pointer rounded-md border bg-background px-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            disabled={isLoading}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Страница</span>
          <input
            className="h-9 w-16 rounded-md border bg-background px-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            type="number"
            min="1"
            max={totalPages}
            value={page}
            onChange={(event) => onPageChange(Number(event.target.value))}
            disabled={isLoading}
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={ButtonVariants.Outline}
          onClick={() => onPageChange(page - 1)}
          disabled={isLoading || page <= 1}
        >
          <ChevronLeft aria-hidden="true" />
          Назад
        </Button>
        <Button
          variant={ButtonVariants.Outline}
          onClick={() => onPageChange(page + 1)}
          disabled={isLoading || page >= totalPages}
        >
          Вперед
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
