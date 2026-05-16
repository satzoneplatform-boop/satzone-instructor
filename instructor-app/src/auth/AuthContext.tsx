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

const DEMO_KEY = "studyq.demo";

const DEMO_USER: UserMe = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "demo@studyq.local",
  full_name: "Neurotic Spy",
  phone_number: "+1 707 797 0462",
  avatar_url: null,
  role: "admin",
  is_active: true,
  is_verified: true,
  is_phone_verified: true,
  email_verified_at: new Date().toISOString(),
  phone_verified_at: new Date().toISOString(),
  onboarding_completed_at: new Date().toISOString(),
  last_login_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

type AuthState = {
  user: UserMe | null;
  status: "loading" | "anon" | "authed";
  isDemo: boolean;
  needsPhoneVerify: boolean;
  login: (email: string, password: string) => Promise<UserMe>;
  loginDemo: () => Promise<UserMe>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null);
  const [status, setStatus] = useState<"loading" | "anon" | "authed">("loading");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      // Demo session survives reloads via localStorage but bypasses the API.
      if (localStorage.getItem(DEMO_KEY) === "1") {
        if (mounted) {
          setUser(DEMO_USER);
          setStatus("authed");
          setIsDemo(true);
        }
        return;
      }

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
        setIsDemo(false);
      }
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const needsPhoneVerify = !!user && !isDemo && !user.is_phone_verified;

  const value = useMemo<AuthState>(
    () => ({
      user,
      status,
      isDemo,
      needsPhoneVerify,
      async login(email, password) {
        const me = await apiLogin(email, password);
        setUser(me);
        setStatus("authed");
        setIsDemo(false);
        localStorage.removeItem(DEMO_KEY);
        return me;
      },
      async loginDemo() {
        localStorage.setItem(DEMO_KEY, "1");
        setUser(DEMO_USER);
        setStatus("authed");
        setIsDemo(true);
        return DEMO_USER;
      },
      async logout() {
        if (isDemo) {
          localStorage.removeItem(DEMO_KEY);
        } else {
          await apiLogout();
        }
        setUser(null);
        setStatus("anon");
        setIsDemo(false);
      },
      async refreshUser() {
        if (isDemo) return;
        try {
          const me = await getMe();
          setUser(me);
        } catch {
          /* ignore */
        }
      },
    }),
    [user, status, isDemo, needsPhoneVerify]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
