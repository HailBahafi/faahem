"use client";

import Link from "next/link";
import { useAccount } from "@/lib/account";

export default function AccountLink() {
  const account = useAccount();
  if (!account?.enabled) return null;
  return (
    <Link href="/account" className="rounded-lg px-3 py-2 text-muted hover:bg-surface-2 hover:text-fg">
      {account.user ? account.user.name.split(" ")[0] : "دخول"}
    </Link>
  );
}
