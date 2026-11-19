"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { LANGS, type Lang } from "@/lib/types";

export default function LangSwitch({ value, onChange, langs }: { value: Lang; onChange: (l: Lang) => void; langs?: Lang[] }) {
  const id = useId();
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1" dir="ltr">
      {LANGS.filter((l) => !langs || langs.includes(l.id)).map((l) => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          className={`relative shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${value === l.id ? "text-accent-fg" : "text-muted hover:text-fg"}`}
        >
          {value === l.id && (
            <motion.span layoutId={id} className="absolute inset-0 rounded-lg bg-accent" transition={{ type: "spring", stiffness: 500, damping: 36 }} />
          )}
          <span className="relative">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
