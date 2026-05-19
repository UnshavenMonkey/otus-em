import { ProductSortValue } from "@/app/_components/catalog/types";

export function getProductSortValue(value: string | null): ProductSortValue {
  if (
    value &&
    Object.values(ProductSortValue).includes(value as ProductSortValue)
  ) {
    return value as ProductSortValue;
  }

  return ProductSortValue.CreatedAtDesc;
}
