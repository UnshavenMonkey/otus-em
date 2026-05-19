import type { FieldErrors } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function validateCategoryForm({ name }: { name: string }) {
  const errors: FieldErrors = {};

  if (!name.trim()) {
    errors.name = "Укажите название категории";
  }

  return errors;
}

export function getInputClassName(hasError: boolean) {
  return cn(
    "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    hasError &&
      "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
  );
}
