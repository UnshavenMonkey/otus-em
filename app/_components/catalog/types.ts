import type { Sorting } from "@/lib/api/types";

export enum ProductSortValue {
  CreatedAtDesc = "createdAt-desc",
  CreatedAtAsc = "createdAt-asc",
  NameAsc = "name-asc",
  NameDesc = "name-desc",
  UpdatedAtDesc = "updatedAt-desc",
}

export type ProductSortOption = {
  value: ProductSortValue;
  label: string;
  sorting: Sorting;
};
