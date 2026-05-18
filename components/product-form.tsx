"use client";

import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import {
  createCategory,
  createProduct,
  getCategories,
  updateProduct,
  type Category,
  type Product,
  type ProductBody,
} from "@/lib/api";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

type ProductFormProps = {
  product?: Product;
};

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { token, isReady, isAuthorized } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(product?.name ?? "");
  const [desc, setDesc] = useState(product?.desc ?? "");
  const [photo, setPhoto] = useState(product?.photo ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [oldPrice, setOldPrice] = useState(
    product?.oldPrice ? String(product.oldPrice) : ""
  );
  const [categoryId, setCategoryId] = useState(product?.category?.id ?? "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthorized) {
      router.replace("/signin");
    }
  }, [isAuthorized, isReady, router]);

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    const currentToken = token;
    let isIgnored = false;

    async function loadCategories() {
      setIsLoadingCategories(true);

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

          if (!categoryId && result.data[0]) {
            setCategoryId(result.data[0].id);
          }
        }
      } catch (caughtError) {
        if (!isIgnored) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Не удалось загрузить категории"
          );
        }
      } finally {
        if (!isIgnored) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isIgnored = true;
    };
  }, [categoryId, isReady, token]);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Нужно войти в аккаунт");
      return;
    }

    const nextPrice = Number(price);
    const nextOldPrice = oldPrice ? Number(oldPrice) : undefined;

    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      setError("Укажите корректную цену");
      return;
    }

    if (!categoryId) {
      setError("Выберите категорию");
      return;
    }

    const body: ProductBody = {
      name: name.trim(),
      desc: desc.trim() || undefined,
      photo: photo.trim() || undefined,
      price: nextPrice,
      oldPrice: nextOldPrice,
      categoryId,
    };

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      if (product) {
        await updateProduct(token, product.id, body);
        setMessage("Товар обновлен");
      } else {
        const createdProduct = await createProduct(token, body);
        router.replace(`/products/${createdProduct.id}/edit`);
        router.refresh();
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не удалось сохранить товар"
      );
    } finally {
      setIsSaving(false);
    }
  };

  async function handleCreateCategory() {
    if (!token || !newCategoryName.trim()) {
      return;
    }

    setIsCreatingCategory(true);
    setError("");

    try {
      const category = await createCategory(token, {
        name: newCategoryName.trim(),
      });
      setCategories((currentCategories) => [...currentCategories, category]);
      setCategoryId(category.id);
      setNewCategoryName("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не удалось создать категорию"
      );
    } finally {
      setIsCreatingCategory(false);
    }
  }

  if (!isReady || !isAuthorized) {
    return <LoadingState text="Проверяем авторизацию..." />;
  }

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <section className="w-full max-w-3xl">
        <div className="border-b pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Товары
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            {product ? "Редактирование товара" : "Новый товар"}
          </h1>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium">Название</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Цена</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                type="number"
                min="1"
                step="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Старая цена</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                type="number"
                min="1"
                step="1"
                value={oldPrice}
                onChange={(event) => setOldPrice(event.target.value)}
              />
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium">Фото, URL</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={photo}
                onChange={(event) => setPhoto(event.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium">Описание</span>
              <textarea
                className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={desc}
                onChange={(event) => setDesc(event.target.value)}
              />
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium">Категория</span>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={isLoadingCategories}
                required
              >
                <option value="">
                  {isLoadingCategories ? "Загружаем..." : "Выберите категорию"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-base font-semibold">Быстрая категория</h2>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                className="h-10 flex-1 rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="Название категории"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateCategory}
                disabled={isCreatingCategory || !newCategoryName.trim()}
              >
                <Plus aria-hidden="true" />
                Добавить
              </Button>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? (
            <p className="text-sm text-muted-foreground">{message}</p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={isSaving}>
              <Save aria-hidden="true" />
              {isSaving ? "Сохраняем..." : "Сохранить"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              Вернуться к списку
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
