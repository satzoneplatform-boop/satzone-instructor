import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMe, login as apiLogin, logout as apiLogout } from "../api/auth";
import { getAccessToken, getRefreshToken, subscribeAuth, wipeTokens } from "../api/tokens";
import { ApiError } from "../api/client";
import type { UserMe } from "../api/types";

type AuthState = {
  user: UserMe | null;
  status: "loading" | "anon" | "authed";
  needsPhoneVerify: boolean;
  login: (email: string, password: string) => Promise<UserMe>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null);
  const [status, setStatus] = useState<"loading" | "anon" | "authed">("loading");

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const access = getAccessToken();
      const refresh = getRefreshToken();
      if (!access && !refresh) {
        if (mounted) setStatus("anon");
        return;
      }
      try {
        const me = await getMe();
        if (mounted) {
          setUser(me);
          setStatus("authed");
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          wipeTokens();
        }
        if (mounted) setStatus("anon");
      }
    }

    bootstrap();
    const unsub = subscribeAuth((has) => {
      if (!has) {
        setUser(null);
        setStatus("anon");
      }
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const needsPhoneVerify = !!user && !user.is_phone_verified;

  const value = useMemo<AuthState>(
    () => ({
      user,
      status,
      needsPhoneVerify,
      async login(email, password) {
        const me = await apiLogin(email, password);
        setUser(me);
        setStatus("authed");
        return me;
      },
      async logout() {
        await apiLogout();
        setUser(null);
        setStatus("anon");
      },
      async refreshUser() {
        try {
          const me = await getMe();
          setUser(me);
        } catch {
          /* ignore */
        }
      },
    }),
    [user, status, needsPhoneVerify]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
