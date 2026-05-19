"use client";

import { ArrowDownUp, ImageOff, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  CATALOG_SEARCH_PARAMS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from "@/app/_components/catalog/constants";
import { CatalogPagination } from "@/app/_components/catalog/catalog-pagination";
import { ProductCard } from "@/app/_components/catalog/product-card";
import { ProductsSkeleton } from "@/app/_components/catalog/products-skeleton";
import { ProductSortValue } from "@/app/_components/catalog/types";
import { getProductSortValue } from "@/app/_components/catalog/utils";
import { useAuth } from "@/components/auth-provider";
import { Button, ButtonVariants, buttonVariants } from "@/components/ui/button";
import { getProducts, getRequestErrorMessage } from "@/lib/api";
import type { Pagination, Product } from "@/lib/api/types";
import { AppRoutes } from "@/lib/routes";

export default function PageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, isReady } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const sortValue = useMemo(
    () => getProductSortValue(searchParams.get(CATALOG_SEARCH_PARAMS.Sort)),
    [searchParams],
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const activeSorting = useMemo(
    () =>
      SORT_OPTIONS.find((option) => option.value === sortValue)?.sorting ??
      SORT_OPTIONS[0].sorting,
    [sortValue],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(pagination.total / pagination.pageSize)),
    [pagination.pageSize, pagination.total],
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
              pageSize,
            },
            sorting: activeSorting,
          },
          token ?? undefined,
        );

        if (!isIgnored) {
          setProducts(result.data);
          setPagination(result.pagination);
        }
      } catch (caughtError) {
        if (!isIgnored) {
          setProducts([]);
          setError(
            getRequestErrorMessage(caughtError, "Не удалось загрузить товары"),
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
  }, [activeSorting, isReady, page, pageSize, reloadKey, token]);

  function handleReload() {
    setReloadKey((currentKey) => currentKey + 1);
  }

  function handleSortChange(nextSortValue: ProductSortValue) {
    setPage(1);

    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextSortValue === ProductSortValue.CreatedAtDesc) {
      nextSearchParams.delete(CATALOG_SEARCH_PARAMS.Sort);
    } else {
      nextSearchParams.set(CATALOG_SEARCH_PARAMS.Sort, nextSortValue);
    }

    const search = nextSearchParams.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, {
      scroll: false,
    });
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
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
          </div>

          <div className="flex gap-2">
            <Button
              variant={ButtonVariants.Outline}
              onClick={handleReload}
              disabled={isLoading}
            >
              <RefreshCw aria-hidden="true" />
              Обновить
            </Button>
            {token ? (
              <Link className={buttonVariants()} href={AppRoutes.ProductsNew}>
                <Plus aria-hidden="true" />
                Добавить
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ArrowDownUp
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
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
          <ProductsSkeleton count={pageSize} />
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

        <CatalogPagination
          page={pagination.pageNumber}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          total={pagination.total}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </section>
    </main>
  );
}
