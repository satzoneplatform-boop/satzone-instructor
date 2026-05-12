import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setTokens } from "../api/tokens";

export function GoogleCallback() {
  const nav = useNavigate();
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    if (access && refresh) {
      setTokens(access, refresh);
      history.replaceState(null, "", window.location.pathname);
      nav("/", { replace: true });
    } else {
      nav("/login", { replace: true });
    }
  }, [nav]);
  return <div className="grid min-h-screen place-items-center text-slate-600">Signing you in…</div>;
}
