"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  changePassword as changePasswordRequest,
  getProfile,
  signIn as signInRequest,
  signUp as signUpRequest,
  updateProfile as updateProfileRequest,
  type Profile,
} from "@/lib/api";
import {
  getStoredToken,
  removeStoredToken,
  setStoredToken,
  subscribeToTokenChange,
} from "@/lib/auth-token";
import { SESSION_EXPIRED_MESSAGE } from "@/components/auth-provider/constants";
import type { AuthContextValue } from "@/components/auth-provider/types";
import { getAuthRequiredError } from "@/components/auth-provider/utils";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(
    subscribeToTokenChange,
    getStoredToken,
    () => null
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [authError, setAuthError] = useState("");

  const signOut = useCallback(() => {
    removeStoredToken();
    setProfile(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError("");
  }, []);

  const loadProfile = useCallback(
    async (currentToken: string) => {
      try {
        const nextProfile = await getProfile(currentToken);
        setProfile(nextProfile);
      } catch (error) {
        signOut();
        setAuthError(SESSION_EXPIRED_MESSAGE);
        throw error;
      }
    },
    [signOut]
  );

  useEffect(() => {
    let isIgnored = false;

    if (!token) {
      Promise.resolve().then(() => {
        if (!isIgnored) {
          setProfile(null);
          setIsReady(true);
        }
      });

      return () => {
        isIgnored = true;
      };
    }

    Promise.resolve().then(() => {
      if (!isIgnored) {
        setIsReady(false);
      }
    });

    Promise.resolve()
      .then(() => loadProfile(token))
      .catch(() => undefined)
      .finally(() => {
        if (!isIgnored) {
          setIsReady(true);
        }
      });

    return () => {
      isIgnored = true;
    };
  }, [loadProfile, token]);

  const authorize = useCallback(
    async (nextToken: string) => {
      setIsReady(false);

      try {
        setAuthError("");
        setStoredToken(nextToken);
        await loadProfile(nextToken);
      } catch (error) {
        signOut();
        throw error;
      } finally {
        setIsReady(true);
      }
    },
    [loadProfile, signOut]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await signInRequest(email, password);
      await authorize(result.token);
    },
    [authorize]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const result = await signUpRequest(email, password);
      await authorize(result.token);
    },
    [authorize]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return;
    }

    await loadProfile(token);
  }, [loadProfile, token]);

  const updateProfileName = useCallback(
    async (name: string) => {
      if (!token) {
        throw getAuthRequiredError();
      }

      const nextProfile = await updateProfileRequest(token, name);
      setProfile(nextProfile);
    },
    [token]
  );

  const changePassword = useCallback(
    async (password: string, newPassword: string) => {
      if (!token) {
        throw getAuthRequiredError();
      }

      await changePasswordRequest(token, password, newPassword);
    },
    [token]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      profile,
      isReady,
      isAuthorized: Boolean(token),
      authError,
      clearAuthError,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfileName,
      changePassword,
    }),
    [
      token,
      profile,
      isReady,
      authError,
      clearAuthError,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfileName,
      changePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }

  return context;
}
