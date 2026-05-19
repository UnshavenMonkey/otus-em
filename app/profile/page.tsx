"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ProfileContent } from "@/app/profile/_components/profile-content";
import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/loading-state";
import { AppRoutes } from "@/lib/routes";

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
