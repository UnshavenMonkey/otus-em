import type { Profile } from "@/lib/api";

export type AuthContextValue = {
  token: string | null;
  profile: Profile | null;
  isReady: boolean;
  isAuthorized: boolean;
  authError: string;
  clearAuthError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
  changePassword: (password: string, newPassword: string) => Promise<void>;
};
