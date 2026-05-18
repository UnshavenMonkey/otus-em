"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { CategoryForm } from "@/components/category-form";
import { LoadingState } from "@/components/loading-state";
import { getCategory, type Category } from "@/lib/api";

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, isReady, isAuthorized } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

    async function loadCategory() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getCategory(params.id, currentToken);

        if (!isIgnored) {
          setCategory(result);
        }
      } catch (caughtError) {
        if (!isIgnored) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Не удалось загрузить категорию"
          );
        }
      } finally {
        if (!isIgnored) {
          setIsLoading(false);
        }
      }
    }

    loadCategory();

    return () => {
      isIgnored = true;
    };
  }, [isReady, params.id, token]);

  if (!isReady || !isAuthorized || isLoading) {
    return <LoadingState text="Загружаем категорию..." />;
  }

  if (error || !category) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Категория не найдена</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "Не удалось открыть категорию для редактирования."}
          </p>
        </div>
      </main>
    );
  }

  return <CategoryForm category={category} />;
}
