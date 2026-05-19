"use client";

import { Edit, ImageOff, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCategories, getRequestErrorMessage, type Category } from "@/lib/api";

export default function CategoriesPage() {
  const { token, isReady, isAuthorized } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    const currentToken = token;
    let isIgnored = false;

    async function loadCategories() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getCategories(
          {
            pagination: {
              pageNumber: 1,
              pageSize: 100,
            },
            sorting: {
              field: "name",
              type: "ASC",
            },
          },
          currentToken
        );

        if (!isIgnored) {
          setCategories(result.data);
        }
      } catch (caughtError) {
        if (!isIgnored) {
          setError(
            getRequestErrorMessage(
              caughtError,
              "Не удалось загрузить категории"
            )
          );
        }
      } finally {
        if (!isIgnored) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      isIgnored = true;
    };
  }, [isReady, reloadKey, token]);

  if (isReady && !isAuthorized) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Нужен вход</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Категории создаются и редактируются только в аккаунте.
          </p>
          <Link className={buttonVariants({ className: "mt-4" })} href="/signin">
            Войти
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <section className="w-full max-w-6xl">
        <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Справочник
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Категории</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Добавляйте новые категории и обновляйте существующие, чтобы
              товары было проще группировать в каталоге.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setReloadKey((currentKey) => currentKey + 1)}
              disabled={isLoading}
            >
              <RefreshCw aria-hidden="true" />
              Обновить
            </Button>
            <Link className={buttonVariants()} href="/categories/new">
              <Plus aria-hidden="true" />
              Добавить
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="h-28 animate-pulse rounded-lg border bg-muted"
                key={index}
              />
            ))}
          </div>
        ) : categories.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <article
                className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm"
                key={category.id}
              >
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {category.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="h-full w-full object-cover"
                      src={category.photo}
                      alt={category.name}
                    />
                  ) : (
                    <ImageOff
                      className="size-6 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{category.name}</h2>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {category.id}
                  </p>
                </div>
                <Link
                  className={buttonVariants({ variant: "outline", size: "icon" })}
                  href={`/categories/${category.id}/edit`}
                  aria-label="Редактировать категорию"
                  title="Редактировать"
                >
                  <Edit aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border bg-card p-10 text-center">
            <h2 className="text-lg font-semibold">Категорий пока нет</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Создайте первую категорию, чтобы использовать ее в товарах.
            </p>
            <Link className={buttonVariants({ className: "mt-4" })} href="/categories/new">
              <Plus aria-hidden="true" />
              Добавить категорию
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
