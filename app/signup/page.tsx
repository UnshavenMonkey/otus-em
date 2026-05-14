"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthorized, isReady, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && isAuthorized) {
      router.replace("/profile");
    }
  }, [isAuthorized, isReady, router]);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signUp(email, password);
      router.push("/profile");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не удалось зарегистрироваться"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Регистрация"
      description="Создайте аккаунт. Командный идентификатор добавится автоматически."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Пароль</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Создаем аккаунт..." : "Создать аккаунт"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <Link className="font-medium text-foreground underline" href="/signin">
          Войти
        </Link>
      </p>
    </AuthCard>
  );
}
