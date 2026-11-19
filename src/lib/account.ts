"use client";

import { useCallback, useEffect, useState } from "react";

export interface Account {
  /** False when the server has no database: the site is local-only and hides account UI. */
  enabled: boolean;
  user: { id: string; email: string; name: string } | null;
}

export const ACCOUNT_EVENT = "faahem:account";
let cached: Promise<Account> | null = null;

export function fetchAccount(force = false): Promise<Account> {
  if (!cached || force) {
    cached = fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { enabled: false, user: null }))
      .catch(() => ({ enabled: false, user: null }));
  }
  return cached;
}

/** Call after login, register or logout so the header and sync pick up the change. */
export function accountChanged() {
  cached = null;
  window.dispatchEvent(new Event(ACCOUNT_EVENT));
}

export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  const load = useCallback(() => {
    fetchAccount().then(setAccount);
  }, []);
  useEffect(() => {
    load();
    window.addEventListener(ACCOUNT_EVENT, load);
    return () => window.removeEventListener(ACCOUNT_EVENT, load);
  }, [load]);
  return account;
}

export async function postJson(url: string, body?: unknown) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}
