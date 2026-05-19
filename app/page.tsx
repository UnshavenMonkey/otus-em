"use client";

import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Edit,
  ImageOff,
  Plus,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  getProducts,
  getRequestErrorMessage,
  type Pagination,
  type Product,
  type Sorting,
} from "@/lib/api";
import { addProductToCart } from "@/lib/cart";

const PAGE_SIZE = 8;

type ProductSortValue =
  | "createdAt-desc"
  | "createdAt-asc"
  | "name-asc"
  | "name-desc"
  | "updatedAt-desc";

const SORT_OPTIONS: Array<{
  value: ProductSortValue;
  label: string;
  sorting: Sorting;
}> = [
  {
    value: "createdAt-desc",
    label: "Сначала новые",
    sorting: { field: "createdAt", type: "DESC" },
  },
  {
    value: "createdAt-asc",
    label: "Сначала старые",
    sorting: { field: "createdAt", type: "ASC" },
  },
  {
    value: "name-asc",
    label: "Название: А-Я",
    sorting: { field: "name", type: "ASC" },
  },
  {
    value: "name-desc",
    label: "Название: Я-А",
    sorting: { field: "name", type: "DESC" },
  },
  {
    value: "updatedAt-desc",
    label: "Недавно обновленные",
    sorting: { field: "updatedAt", type: "DESC" },
  },
];

export default function Home() {
  const { token, isReady } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    pageNumber: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [sortValue, setSortValue] =
    useState<ProductSortValue>("createdAt-desc");
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const activeSorting = useMemo(
    () =>
      SORT_OPTIONS.find((option) => option.value === sortValue)?.sorting ??
      SORT_OPTIONS[0].sorting,
    [sortValue]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(pagination.total / pagination.pageSize)),
    [pagination.pageSize, pagination.total]
  );

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let isIgnored = false;

    async function loadProducts() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getProducts(
          {
            pagination: {
              pageNumber: page,
              pageSize: PAGE_SIZE,
            },
            sorting: activeSorting,
          },
          token ?? undefined
        );

        if (!isIgnored) {
          setProducts(result.data);
          setPagination(result.pagination);
        }
      } catch (caughtError) {
        if (!isIgnored) {
          setProducts([]);
          setError(
            getRequestErrorMessage(caughtError, "Не удалось загрузить товары")
          );
        }
      } finally {
        if (!isIgnored) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isIgnored = true;
    };
  }, [activeSorting, isReady, page, reloadKey, token]);

  function handleReload() {
    setReloadKey((currentKey) => currentKey + 1);
  }

  function handleSortChange(nextSortValue: ProductSortValue) {
    setSortValue(nextSortValue);
    setPage(1);
  }

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <section className="w-full max-w-6xl">
        <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Каталог
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Список товаров
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Главный экран показывает товары из API. После входа будут
              отображаться данные вашей команды.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReload} disabled={isLoading}>
              <RefreshCw aria-hidden="true" />
              Обновить
            </Button>
            {token ? (
              <Link className={buttonVariants()} href="/products/new">
                <Plus aria-hidden="true" />
                Добавить
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ArrowDownUp className="size-4 text-muted-foreground" aria-hidden="true" />
            Сортировка
          </div>
          <label className="flex flex-col gap-2 text-sm sm:w-72">
            <span className="sr-only">Сортировка товаров</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={sortValue}
              onChange={(event) =>
                handleSortChange(event.target.value as ProductSortValue)
              }
              disabled={isLoading}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <ProductsSkeleton />
        ) : products.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                canEdit={Boolean(token)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border bg-card p-10 text-center">
            <ImageOff
              className="mx-auto size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold">Товаров пока нет</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Когда товары появятся в API, они будут показаны на этой странице.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Страница {pagination.pageNumber} из {totalPages}. Всего товаров:{" "}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setPage((currentPage) => Math.max(1, currentPage - 1))
              }
              disabled={isLoading || page <= 1}
            >
              <ChevronLeft aria-hidden="true" />
              Назад
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setPage((currentPage) => Math.min(totalPages, currentPage + 1))
              }
              disabled={isLoading || page >= totalPages}
            >
              Вперед
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductCard({
  product,
  canEdit,
}: {
  product: Product;
  canEdit: boolean;
}) {
  const [isAdded, setIsAdded] = useState(false);
  const price = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(product.price);
  const oldPrice =
    typeof product.oldPrice === "number"
      ? new Intl.NumberFormat("ru-RU", {
          style: "currency",
          currency: "RUB",
          maximumFractionDigits: 0,
        }).format(product.oldPrice)
      : null;

  function handleAddToCart() {
    addProductToCart(product);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1200);
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
              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
              href={`/products/${product.id}/edit`}
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

function ProductsSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <div
          className="overflow-hidden rounded-lg border bg-card shadow-sm"
          key={index}
        >
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
