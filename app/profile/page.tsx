"use client";

import { PackageCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/loading-state";
import { Button, ButtonVariants, buttonVariants } from "@/components/ui/button";
import { getRequestErrorMessage, type Profile } from "@/lib/api";
import { AppRoutes } from "@/lib/routes";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export default function ProfilePage() {
  const router = useRouter();
  const { profile, isReady, isAuthorized, updateProfileName, changePassword } =
    useAuth();

  useEffect(() => {
    if (isReady && !isAuthorized) {
      router.replace(AppRoutes.SignIn);
    }
  }, [isAuthorized, isReady, router]);

  if (!isReady || !isAuthorized || !profile) {
    return <LoadingState text="Проверяем авторизацию..." />;
  }

  return (
    <ProfileContent
      key={profile.id}
      profile={profile}
      updateProfileName={updateProfileName}
      changePassword={changePassword}
    />
  );
}

function ProfileContent({
  profile,
  updateProfileName,
  changePassword,
}: {
  profile: Profile;
  updateProfileName: (name: string) => Promise<void>;
  changePassword: (password: string, newPassword: string) => Promise<void>;
}) {
  const [name, setName] = useState(profile.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const signUpDate = profile.signUpDate
    ? new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(profile.signUpDate))
    : "Не указана";

  const handleProfileSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setProfileMessage("");
    setIsSavingProfile(true);

    try {
      await updateProfileName(name);
      setProfileMessage("Профиль обновлен");
    } catch (caughtError) {
      setError(
        getRequestErrorMessage(caughtError, "Не удалось обновить профиль")
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setPasswordMessage("");
    setIsChangingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Пароль изменен");
    } catch (caughtError) {
      setError(
        getRequestErrorMessage(caughtError, "Не удалось изменить пароль")
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Личный кабинет
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Профиль покупателя</h1>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border bg-background p-4">
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="mt-1 font-medium">{profile?.email}</dd>
            </div>
            <div className="rounded-md border bg-background p-4">
              <dt className="text-sm text-muted-foreground">Дата регистрации</dt>
              <dd className="mt-1 font-medium">{signUpDate}</dd>
            </div>
            <div className="rounded-md border bg-background p-4">
              <dt className="text-sm text-muted-foreground">ID профиля</dt>
              <dd className="mt-1 break-all font-medium">{profile?.id}</dd>
            </div>
            <div className="rounded-md border bg-background p-4">
              <dt className="text-sm text-muted-foreground">Команда</dt>
              <dd className="mt-1 font-medium">{profile?.commandId}</dd>
            </div>
          </dl>
          <Link
            className={buttonVariants({ className: "mt-6" })}
            href={AppRoutes.Orders}
          >
            <PackageCheck aria-hidden="true" />
            Мои заказы
          </Link>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Данные профиля</h2>
            <form className="mt-4 space-y-4" onSubmit={handleProfileSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Имя</span>
                <input
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ваше имя"
                  required
                />
              </label>

              {profileMessage ? (
                <p className="text-sm text-muted-foreground">{profileMessage}</p>
              ) : null}

              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? "Сохраняем..." : "Сохранить"}
              </Button>
            </form>
          </section>

          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Смена пароля</h2>
            <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Текущий пароль</span>
                <input
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Новый пароль</span>
                <input
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={6}
                  required
                />
              </label>

              {passwordMessage ? (
                <p className="text-sm text-muted-foreground">{passwordMessage}</p>
              ) : null}

              <Button
                variant={ButtonVariants.Outline}
                type="submit"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Меняем..." : "Изменить пароль"}
              </Button>
            </form>
          </section>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
