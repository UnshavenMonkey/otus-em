"use client";

import {
  ListTree,
  LoaderCircle,
  LogOut,
  Moon,
  PackageCheck,
  ShoppingBag,
  ShoppingCart,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { Button, buttonVariants } from "@/components/ui/button";

export function AppHeader() {
  const router = useRouter();
  const { isAuthorized, isReady, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="size-5" aria-hidden="true" />
          <span>Market Diploma</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          <Link className={buttonVariants({ variant: "ghost" })} href="/cart">
            <ShoppingCart aria-hidden="true" />
            Корзина
          </Link>
          <Link className={buttonVariants({ variant: "ghost" })} href="/orders">
            <PackageCheck aria-hidden="true" />
            Заказы
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Включить светлую тему"
                : "Включить темную тему"
            }
            title={
              theme === "dark"
                ? "Включить светлую тему"
                : "Включить темную тему"
            }
          >
            {theme === "dark" ? (
              <Sun aria-hidden="true" />
            ) : (
              <Moon aria-hidden="true" />
            )}
          </Button>

          {!isReady ? (
            <div className="flex h-9 items-center gap-2 px-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              <span>Проверяем сессию...</span>
            </div>
          ) : isAuthorized ? (
            <>
              <Link
                className={buttonVariants({ variant: "ghost" })}
                href="/categories"
              >
                <ListTree aria-hidden="true" />
                Категории
              </Link>
              <Link
                className={buttonVariants({ variant: "ghost" })}
                href="/profile"
              >
                <User aria-hidden="true" />
                {profile?.name || "Профиль"}
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut aria-hidden="true" />
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link
                className={buttonVariants({ variant: "ghost" })}
                href="/signin"
              >
                Войти
              </Link>
              <Link className={buttonVariants()} href="/signup">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
