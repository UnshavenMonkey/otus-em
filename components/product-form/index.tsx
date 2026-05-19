"use client";

import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/loading-state";
import { Button, ButtonVariants } from "@/components/ui/button";
import {
  createCategory,
  createProduct,
  getCategories,
  getRequestFieldErrors,
  getRequestErrorMessage,
  updateProduct,
} from "@/lib/api";
import type {
  Category,
  FieldErrors,
  Product,
  ProductBody,
} from "@/lib/api/types";
import { AppRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { normalizeProductFieldErrors, validateProductForm } from "./utils";
import { getInputClassName } from "../category-form/utils";
import { FieldErrorText } from "../category-form/field-error-text";

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
    product?.oldPrice ? String(product.oldPrice) : "",
  );
  const [categoryId, setCategoryId] = useState(product?.category?.id ?? "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthorized) {
      router.replace(AppRoutes.SignIn);
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
          currentToken,
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
            getRequestErrorMessage(
              caughtError,
              "Не удалось загрузить категории",
            ),
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
    const nextFieldErrors = validateProductForm({
      name,
      price,
      oldPrice,
      categoryId,
    });

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      setError("Проверьте поля формы");
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
    setFieldErrors({});
    setMessage("");

    try {
      if (product) {
        await updateProduct(token, product.id, body);
      } else {
        await createProduct(token, body);
      }

      router.replace(AppRoutes.Home);
      router.refresh();
    } catch (caughtError) {
      setError(
        getRequestErrorMessage(caughtError, "Не удалось сохранить товар"),
      );
      setFieldErrors(normalizeProductFieldErrors(caughtError));
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
    clearFieldError("newCategoryName");

    try {
      const category = await createCategory(token, {
        name: newCategoryName.trim(),
      });
      setCategories((currentCategories) => [...currentCategories, category]);
      setCategoryId(category.id);
      setNewCategoryName("");
    } catch (caughtError) {
      setError(
        getRequestErrorMessage(caughtError, "Не удалось создать категорию"),
      );
      const categoryFieldErrors = getRequestFieldErrors(caughtError);

      if (categoryFieldErrors.name) {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          newCategoryName: categoryFieldErrors.name,
        }));
      }
    } finally {
      setIsCreatingCategory(false);
    }
  }

  function clearFieldError(fieldName: string) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[fieldName]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldName];
      return nextErrors;
    });
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
                className={getInputClassName(Boolean(fieldErrors.name))}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearFieldError("name");
                }}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={
                  fieldErrors.name ? "product-name-error" : undefined
                }
                required
              />
              <FieldErrorText
                id="product-name-error"
                message={fieldErrors.name}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Цена</span>
              <input
                className={getInputClassName(Boolean(fieldErrors.price))}
                type="number"
                min="1"
                step="1"
                value={price}
                onChange={(event) => {
                  setPrice(event.target.value);
                  clearFieldError("price");
                }}
                aria-invalid={Boolean(fieldErrors.price)}
                aria-describedby={
                  fieldErrors.price ? "product-price-error" : undefined
                }
                required
              />
              <FieldErrorText
                id="product-price-error"
                message={fieldErrors.price}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Старая цена</span>
              <input
                className={getInputClassName(Boolean(fieldErrors.oldPrice))}
                type="number"
                min="1"
                step="1"
                value={oldPrice}
                onChange={(event) => {
                  setOldPrice(event.target.value);
                  clearFieldError("oldPrice");
                }}
                aria-invalid={Boolean(fieldErrors.oldPrice)}
                aria-describedby={
                  fieldErrors.oldPrice ? "product-old-price-error" : undefined
                }
              />
              <FieldErrorText
                id="product-old-price-error"
                message={fieldErrors.oldPrice}
              />
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium">Фото, URL</span>
              <input
                className={getInputClassName(Boolean(fieldErrors.photo))}
                value={photo}
                onChange={(event) => {
                  setPhoto(event.target.value);
                  clearFieldError("photo");
                }}
                placeholder="https://..."
                aria-invalid={Boolean(fieldErrors.photo)}
                aria-describedby={
                  fieldErrors.photo ? "product-photo-error" : undefined
                }
              />
              <FieldErrorText
                id="product-photo-error"
                message={fieldErrors.photo}
              />
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium">Описание</span>
              <textarea
                className={cn(
                  "min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  fieldErrors.desc &&
                    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                )}
                value={desc}
                onChange={(event) => {
                  setDesc(event.target.value);
                  clearFieldError("desc");
                }}
                aria-invalid={Boolean(fieldErrors.desc)}
                aria-describedby={
                  fieldErrors.desc ? "product-desc-error" : undefined
                }
              />
              <FieldErrorText
                id="product-desc-error"
                message={fieldErrors.desc}
              />
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium">Категория</span>
              <select
                className={getInputClassName(Boolean(fieldErrors.categoryId))}
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  clearFieldError("categoryId");
                }}
                disabled={isLoadingCategories}
                aria-invalid={Boolean(fieldErrors.categoryId)}
                aria-describedby={
                  fieldErrors.categoryId ? "product-category-error" : undefined
                }
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
              <FieldErrorText
                id="product-category-error"
                message={fieldErrors.categoryId}
              />
            </label>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-base font-semibold">Быстрая категория</h2>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                className={cn(
                  getInputClassName(Boolean(fieldErrors.newCategoryName)),
                  "flex-1",
                )}
                value={newCategoryName}
                onChange={(event) => {
                  setNewCategoryName(event.target.value);
                  clearFieldError("newCategoryName");
                }}
                placeholder="Название категории"
                aria-invalid={Boolean(fieldErrors.newCategoryName)}
                aria-describedby={
                  fieldErrors.newCategoryName
                    ? "new-category-name-error"
                    : undefined
                }
              />
              <Button
                type="button"
                variant={ButtonVariants.Outline}
                onClick={handleCreateCategory}
                disabled={isCreatingCategory || !newCategoryName.trim()}
              >
                <Plus aria-hidden="true" />
                Добавить
              </Button>
            </div>
            <FieldErrorText
              id="new-category-name-error"
              message={fieldErrors.newCategoryName}
            />
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
            <Button
              type="button"
              variant={ButtonVariants.Outline}
              onClick={() => router.push(AppRoutes.Home)}
            >
              Вернуться к списку
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
