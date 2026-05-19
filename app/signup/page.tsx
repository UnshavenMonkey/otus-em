"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { getSignUpErrorMessage } from "@/app/signup/_components/utils";
import { AppRoutes } from "@/lib/routes";

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
      router.replace(AppRoutes.Home);
    }
  }, [isAuthorized, isReady, router]);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signUp(email.trim(), password);
      router.push(AppRoutes.Home);
    } catch (caughtError) {
      setError(getSignUpErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return <LoadingState text="Проверяем сессию..." />;
  }

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
            aria-invalid={Boolean(error)}
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
            minLength={8}
            aria-invalid={Boolean(error)}
            required
          />
        </label>

        {error ? (
          <div
            className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : null}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Создаем аккаунт..." : "Создать аккаунт"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <Link
          className="font-medium text-foreground underline"
          href={AppRoutes.SignIn}
        >
          Войти
        </Link>
      </p>
    </AuthCard>
  );
}


