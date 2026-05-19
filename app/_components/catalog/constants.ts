import {
  ProductSortValue,
  type ProductSortOption,
} from "@/app/_components/catalog/types";

export const PAGE_SIZE_OPTIONS = [4, 8, 12, 16] as const;
export const DEFAULT_PAGE_SIZE = 8;
export const CATALOG_SEARCH_PARAMS = {
  Sort: "sort",
} as const;

export const SORT_OPTIONS: ProductSortOption[] = [
  {
    value: ProductSortValue.CreatedAtDesc,
    label: "Сначала новые",
    sorting: { field: "createdAt", type: "DESC" },
  },
  {
    value: ProductSortValue.CreatedAtAsc,
    label: "Сначала старые",
    sorting: { field: "createdAt", type: "ASC" },
  },
  {
    value: ProductSortValue.NameAsc,
    label: "Название: А-Я",
    sorting: { field: "name", type: "ASC" },
  },
  {
    value: ProductSortValue.NameDesc,
    label: "Название: Я-А",
    sorting: { field: "name", type: "DESC" },
  },
  {
    value: ProductSortValue.UpdatedAtDesc,
    label: "Недавно обновленные",
    sorting: { field: "updatedAt", type: "DESC" },
  },
];
