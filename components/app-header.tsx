"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShoppingBag, User } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";

export function AppHeader() {
  const router = useRouter();
  const { isAuthorized, profile, signOut } = useAuth();

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="size-5" aria-hidden="true" />
          <span>Market Diploma</span>
        </Link>

        <nav className="flex items-center gap-2">
          {isAuthorized ? (
            <>
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

