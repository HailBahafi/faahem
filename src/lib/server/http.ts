import "server-only";
import { NextResponse } from "next/server";
import { hasDb } from "./db";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
export const fail = (error: string, status = 400) => json({ error }, status);

/** Accounts need a database; without DATABASE_URL the site runs in local-only mode. */
export function requireDb() {
  return hasDb ? null : fail("accounts-disabled", 503);
}

export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function clientKey(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}
