"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  createCategory,
  updateCategory,
  type Category,
  type CategoryBody,
} from "@/lib/api";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const { token, isReady, isAuthorized } = useAuth();
  const [name, setName] = useState(category?.name ?? "");
  const [photo, setPhoto] = useState(category?.photo ?? "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthorized) {
      router.replace("/signin");
    }
  }, [isAuthorized, isReady, router]);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Нужно войти в аккаунт");
      return;
    }

    const body: CategoryBody = {
      name: name.trim(),
      photo: photo.trim() || undefined,
    };

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      if (category) {
        await updateCategory(token, category.id, body);
        setMessage("Категория обновлена");
      } else {
        const createdCategory = await createCategory(token, body);
        router.replace(`/categories/${createdCategory.id}/edit`);
        router.refresh();
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не удалось сохранить категорию"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isReady || !isAuthorized) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-sm text-muted-foreground">Проверяем авторизацию...</p>
      </main>
    );
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
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Название</span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Фото, URL</span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={photo}
              onChange={(event) => setPhoto(event.target.value)}
              placeholder="https://..."
            />
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
              variant="outline"
              onClick={() => router.push("/categories")}
            >
              Вернуться к списку
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
