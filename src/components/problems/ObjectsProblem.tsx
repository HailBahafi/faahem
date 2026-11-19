"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Person = { name: string; phone: string; city: string };
type Mode = "arrays" | "cards";

const PEOPLE: Person[] = [
  { name: "Sara", phone: "0551", city: "Riyadh" },
  { name: "Omar", phone: "0552", city: "Jeddah" },
  { name: "Huda", phone: "0553", city: "Abha" },
  { name: "Ali", phone: "0554", city: "Dammam" },
];
const truth = (name: string) => PEOPLE.find((p) => p.name === name)!;

/** Three parallel arrays fall out of step when one is sorted or trimmed; one card per person never does. */
export default function ObjectsProblem() {
  const [mode, setMode] = useState<Mode>("arrays");
  const [names, setNames] = useState(PEOPLE.map((p) => p.name));
  const [phones] = useState(PEOPLE.map((p) => p.phone));
  const [cities] = useState(PEOPLE.map((p) => p.city));
  const [cards, setCards] = useState(PEOPLE);
  const [touched, setTouched] = useState(false);

  const sort = () => {
    setTouched(true);
    if (mode === "arrays") setNames((ns) => [...ns].sort()); // only the names array moves
    else setCards((cs) => [...cs].sort((a, b) => a.name.localeCompare(b.name)));
  };
  const removeFirst = () => {
    setTouched(true);
    if (mode === "arrays") setNames((ns) => ns.slice(1));
    else setCards((cs) => cs.slice(1));
  };
  const reset = (m: Mode) => {
    setMode(m);
    setNames(PEOPLE.map((p) => p.name));
    setCards(PEOPLE);
    setTouched(false);
  };

  const broken = mode === "arrays" && names.some((n, i) => truth(n).phone !== phones[i]);
  const cell = "code rounded-lg border border-line bg-surface px-2 py-1.5 text-center";

  return (
    <div>
      <div className="code rounded-2xl bg-code p-4 text-sm" dir="ltr">
        {mode === "arrays" ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "names", items: names, color: "text-str" },
              { label: "phones", items: phones, color: "text-num" },
              { label: "cities", items: cities, color: "text-str" },
            ].map((col) => (
              <div key={col.label} className="flex flex-col gap-1.5">
                <div className="text-muted">{col.label}</div>
                {col.items.map((v, i) => {
                  const bad = col.label !== "names" && names[i] !== undefined && v !== (col.label === "phones" ? truth(names[i]).phone : truth(names[i]).city);
                  const orphan = col.label !== "names" && names[i] === undefined;
                  return (
                    <motion.div
                      key={v}
                      layout
                      className={`${cell} ${bad || orphan ? "border-err text-err" : col.color}`}
                    >
                      <span className="text-muted">[{i}] </span>
                      {v}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {cards.map((c) => (
              <motion.div key={c.name} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-line bg-surface p-3">
                <div><span className="text-muted">name: </span><span className="text-str">{c.name}</span></div>
                <div><span className="text-muted">phone: </span><span className="text-num">{c.phone}</span></div>
                <div><span className="text-muted">city: </span><span className="text-str">{c.city}</span></div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={sort} className="rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20">
          رتّب بالاسم
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={removeFirst} className="rounded-2xl border border-line px-5 py-3 font-bold">
          احذف الأول
        </motion.button>
        {mode === "arrays" && touched && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => reset("cards")} className="rounded-2xl border border-accent px-4 py-3 font-bold">
            اجعل لكل شخص بطاقة
          </motion.button>
        )}
        {touched && (
          <button onClick={() => reset(mode)} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {!touched && <p className="text-muted">{mode === "arrays" ? "الصف رقم 0 في القوائم الثلاث هو شخص واحد. اضغط أحد الزرين." : "جرّب الزرين نفسيهما الآن."}</p>}
        {touched && broken && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            تحرّكت الأسماء وحدها. صار رقم {phones[0]} لـ {names[0] ?? "لا أحد"}، وهو ليس رقمه.
          </motion.p>
        )}
        {touched && mode === "arrays" && !broken && (
          <p className="text-muted">لم يتغيّر شيء بعد. جرّب الزر الآخر.</p>
        )}
        {touched && mode === "cards" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            كل بطاقة تتحرك كاملة: الاسم والرقم والمدينة معاً. هذه هي <b className="text-fg">الكائنات</b>.
          </motion.p>
        )}
      </div>
    </div>
  );
}
