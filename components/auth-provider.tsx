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

type AuthContextValue = {
  token: string | null;
  profile: Profile | null;
  isReady: boolean;
  isAuthorized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
  changePassword: (password: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(
    subscribeToTokenChange,
    getStoredToken,
    () => null
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isReady, setIsReady] = useState(false);

  const signOut = useCallback(() => {
    removeStoredToken();
    setProfile(null);
  }, []);

  const loadProfile = useCallback(
    async (currentToken: string) => {
      try {
        const nextProfile = await getProfile(currentToken);
        setProfile(nextProfile);
      } catch (error) {
        signOut();
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
      setStoredToken(nextToken);
      await loadProfile(nextToken);
      setIsReady(true);
    },
    [loadProfile]
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
        throw new Error("Нужно войти в аккаунт");
      }

      const nextProfile = await updateProfileRequest(token, name);
      setProfile(nextProfile);
    },
    [token]
  );

  const changePassword = useCallback(
    async (password: string, newPassword: string) => {
      if (!token) {
        throw new Error("Нужно войти в аккаунт");
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
