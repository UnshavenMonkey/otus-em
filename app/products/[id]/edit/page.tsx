"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ProductForm } from "@/components/product-form";
import { getProduct, type Product } from "@/lib/api";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, isReady, isAuthorized } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
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

    let isIgnored = false;

    async function loadProduct() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getProduct(params.id, token ?? undefined);

        if (!isIgnored) {
          setProduct(result);
        }
      } catch (caughtError) {
        if (!isIgnored) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Не удалось загрузить товар"
          );
        }
      } finally {
        if (!isIgnored) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isIgnored = true;
    };
  }, [isReady, params.id, token]);

  if (!isReady || !isAuthorized || isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-sm text-muted-foreground">Загружаем товар...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Товар не найден</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "Не удалось открыть товар для редактирования."}
          </p>
        </div>
      </main>
    );
  }

  return <ProductForm product={product} />;
}
