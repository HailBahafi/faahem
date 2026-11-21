"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Student = { name: string; age: number; city: string };
const DATA: Student[] = [
  { name: "Sara", age: 22, city: "Riyadh" },
  { name: "Omar", age: 19, city: "Jeddah" },
  { name: "Lina", age: 25, city: "Abha" },
  { name: "Ali", age: 20, city: "Dammam" },
];
const TRUE_AGE = Object.fromEntries(DATA.map((s) => [s.name, s.age]));

/** Parallel slices fall apart when one is sorted; a slice of structs moves each record as one block. */
export default function GoStructsProblem() {
  const [structs, setStructs] = useState(false);
  const [sorted, setSorted] = useState(false);

  const names = DATA.map((s) => s.name);
  const cities = DATA.map((s) => s.city);
  const ages = DATA.map((s) => s.age);
  const rows: Student[] = structs
    ? sorted
      ? [...DATA].sort((a, b) => a.age - b.age)
      : DATA
    : names.map((name, i) => ({ name, city: cities[i], age: sorted ? [...ages].sort((a, b) => a - b)[i] : ages[i] }));
  const wrong = rows.filter((r) => TRUE_AGE[r.name] !== r.age).length;

  const switchMode = (s: boolean) => {
    setStructs(s);
    setSorted(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => switchMode(false)}
          className={`rounded-xl border px-4 py-2 text-sm ${!structs ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
        >
          ثلاث شرائح منفصلة
        </button>
        <button
          onClick={() => switchMode(true)}
          className={`rounded-xl border px-4 py-2 text-sm ${structs ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
        >
          شريحة من struct
        </button>
      </div>

      <div className="code mt-4 rounded-2xl bg-code p-4 text-sm leading-7" dir="ltr">
        {structs ? (
          <>
            <div>type Student struct {"{"} Name string; Age int; City string {"}"}</div>
            <div>students := []Student{"{"}...{"}"}</div>
          </>
        ) : (
          <>
            <div>names := []string{"{"}...{"}"}</div>
            <div>ages := []int{"{"}...{"}"}</div>
            <div>cities := []string{"{"}...{"}"}</div>
          </>
        )}
      </div>

      <div className="mt-4 grid gap-1.5" dir="ltr">
        {rows.map((r, i) => {
          const bad = TRUE_AGE[r.name] !== r.age;
          return (
            <motion.div
              key={structs ? r.name : i}
              layout
              className={`code grid grid-cols-[2rem_1fr_4rem_1fr] items-center gap-2 rounded-xl border px-3 py-2 text-sm ${bad ? "border-err/60 bg-err/10" : structs ? "border-accent/50 bg-accent-soft/20" : "border-line bg-surface"}`}
            >
              <span className="text-muted">{i}</span>
              <span>{r.name}</span>
              <motion.span key={`${r.age}-${sorted}`} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={bad ? "text-err font-bold" : "text-num"}>
                {r.age}
              </motion.span>
              <span className="text-str">{r.city}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={sorted}
          onClick={() => setSorted(true)}
          className="code rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
          dir="ltr"
        >
          {structs ? "sort students by Age" : "sort.Ints(ages)"}
        </motion.button>
        {sorted && (
          <button onClick={() => setSorted(false)} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {sorted && wrong > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            تحرّكت الأعمار وحدها، فصار {wrong} طلاب بأعمار غيرهم. لا شيء في الكود يقول إن ages[i] تخصّ names[i].
          </motion.p>
        )}
        {sorted && wrong === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            كل طالب كتلة واحدة: الاسم والعمر والمدينة <b className="text-fg">تتحرك معاً</b>. هذا هو struct.
          </motion.p>
        )}
      </div>
    </div>
  );
}
