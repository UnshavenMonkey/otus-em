"use client";

import { ArrowLeft, ImageOff, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/loading-state";
import { Button, ButtonVariants } from "@/components/ui/button";
import { FieldErrorText } from "@/components/category-form/field-error-text";
import {
  getInputClassName,
  validateCategoryForm,
} from "@/components/category-form/utils";
import {
  createCategory,
  getRequestFieldErrors,
  getRequestErrorMessage,
  updateCategory,
} from "@/lib/api";
import type { Category, CategoryBody, FieldErrors } from "@/lib/api/types";
import { AppRoutes } from "@/lib/routes";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const { token, isReady, isAuthorized } = useAuth();
  const [name, setName] = useState(category?.name ?? "");
  const [photo, setPhoto] = useState(category?.photo ?? "");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthorized) {
      router.replace(AppRoutes.SignIn);
    }
  }, [isAuthorized, isReady, router]);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Нужно войти в аккаунт");
      return;
    }

    const trimmedName = name.trim();
    const nextFieldErrors = validateCategoryForm({ name });

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      setError("Проверьте поля формы");
      return;
    }

    const body: CategoryBody = {
      name: trimmedName,
      photo: photo.trim() || undefined,
    };

    setIsSaving(true);
    setError("");
    setFieldErrors({});
    setMessage("");

    try {
      if (category) {
        await updateCategory(token, category.id, body);
        setMessage("Категория обновлена");
      } else {
        await createCategory(token, body);
        router.replace(AppRoutes.Categories);
        router.refresh();
      }
    } catch (caughtError) {
      setError(
        getRequestErrorMessage(caughtError, "Не удалось сохранить категорию")
      );
      setFieldErrors(getRequestFieldErrors(caughtError));
    } finally {
      setIsSaving(false);
    }
  };

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
      <section className="w-full max-w-2xl">
        <div className="border-b pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Категории
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            {category ? "Редактирование категории" : "Новая категория"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Название будет показываться в карточках товаров, а фото можно
            использовать как визуальную подсказку в справочнике.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              {photo.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="h-full w-full object-cover"
                  src={photo.trim()}
                  alt={name || "Фото категории"}
                />
              ) : (
                <ImageOff
                  className="size-7 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {name.trim() || "Категория без названия"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Предпросмотр карточки
              </p>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Название</span>
            <input
              className={getInputClassName(Boolean(fieldErrors.name))}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearFieldError("name");
              }}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "category-name-error" : undefined}
              required
            />
            <FieldErrorText id="category-name-error" message={fieldErrors.name} />
          </label>

          <label className="block space-y-2">
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
              aria-describedby={fieldErrors.photo ? "category-photo-error" : undefined}
            />
            <FieldErrorText id="category-photo-error" message={fieldErrors.photo} />
          </label>

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
              onClick={() => router.push(AppRoutes.Categories)}
            >
              <ArrowLeft aria-hidden="true" />
              К списку
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
