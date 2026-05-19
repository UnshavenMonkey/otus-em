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
import { useMemo, useSyncExternalStore } from "react";

import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import {
  Button,
  ButtonSizes,
  ButtonVariants,
  buttonVariants,
} from "@/components/ui/button";
import {
  getCartItemsFromSnapshot,
  getCartSnapshot,
  getCartSummary,
  subscribeToCartChange,
} from "@/lib/cart";
import { AppRoutes } from "@/lib/routes";

export function AppHeader() {
  const router = useRouter();
  const { isAuthorized, isReady, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const cartSnapshot = useSyncExternalStore(
    subscribeToCartChange,
    getCartSnapshot,
    () => ""
  );
  const cartItems = useMemo(
    () => getCartItemsFromSnapshot(cartSnapshot),
    [cartSnapshot]
  );
  const cartQuantity = useMemo(
    () => getCartSummary(cartItems).quantity,
    [cartItems]
  );

  function handleSignOut() {
    signOut();
    router.push(AppRoutes.Home);
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={AppRoutes.Home} className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="size-5" aria-hidden="true" />
          <span>Market Diploma</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          <Link
            className={buttonVariants({ variant: ButtonVariants.Ghost })}
            href={AppRoutes.Cart}
          >
            <ShoppingCart aria-hidden="true" />
            Корзина
            {cartQuantity ? (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold leading-none text-primary-foreground">
                {cartQuantity}
              </span>
            ) : null}
          </Link>
          <Link
            className={buttonVariants({ variant: ButtonVariants.Ghost })}
            href={AppRoutes.Orders}
          >
            <PackageCheck aria-hidden="true" />
            Заказы
          </Link>
          <Button
            variant={ButtonVariants.Ghost}
            size={ButtonSizes.Icon}
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
                className={buttonVariants({ variant: ButtonVariants.Ghost })}
                href={AppRoutes.Categories}
              >
                <ListTree aria-hidden="true" />
                Категории
              </Link>
              <Link
                className={buttonVariants({ variant: ButtonVariants.Ghost })}
                href={AppRoutes.Profile}
              >
                <User aria-hidden="true" />
                {profile?.name || "Профиль"}
              </Link>
              <Button variant={ButtonVariants.Outline} onClick={handleSignOut}>
                <LogOut aria-hidden="true" />
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link
                className={buttonVariants({ variant: ButtonVariants.Ghost })}
                href={AppRoutes.SignIn}
              >
                Войти
              </Link>
              <Link className={buttonVariants()} href={AppRoutes.SignUp}>
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
