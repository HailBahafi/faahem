"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { dueSlugs } from "@/lib/review";

export default function ReviewLink() {
  const { progress } = useProgress();
  if (Object.keys(progress.review).length === 0) return null;
  const due = dueSlugs(progress).length;
  return (
    <Link href="/review" className="relative rounded-lg px-3 py-2 text-muted hover:bg-surface-2 hover:text-fg">
      مراجعة
      {due > 0 && (
        <span className="absolute -top-0.5 -left-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-bool px-1 text-[11px] font-bold text-white">
          {due}
        </span>
      )}
    </Link>
  );
}
