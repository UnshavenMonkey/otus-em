import { getRequestFieldErrors } from "@/lib/api";
import { FieldErrors } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function validateProductForm({
  name,
  price,
  oldPrice,
  categoryId,
}: {
  name: string;
  price: string;
  oldPrice: string;
  categoryId: string;
}) {
  const errors: FieldErrors = {};
  const nextPrice = Number(price);
  const nextOldPrice = oldPrice ? Number(oldPrice) : undefined;

  if (!name.trim()) {
    errors.name = "Укажите название товара";
  }

  if (!price || !Number.isFinite(nextPrice) || nextPrice <= 0) {
    errors.price = "Укажите цену больше 0";
  }

  if (
    oldPrice &&
    (!Number.isFinite(nextOldPrice) || Number(nextOldPrice) <= 0)
  ) {
    errors.oldPrice = "Старая цена должна быть больше 0";
  }

  if (!categoryId) {
    errors.categoryId = "Выберите категорию";
  }

  return errors;
}

export function normalizeProductFieldErrors(error: unknown): FieldErrors {
  const errors = getRequestFieldErrors(error);

  return {
    ...errors,
    categoryId: errors.categoryId ?? errors.category,
  };
}
