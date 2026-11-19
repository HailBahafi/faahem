"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** Choices for the three editable spots. `js` is the runtime value, `src` how it is written. */
const PRICES = [
  { src: "15", js: 15 as unknown },
  { src: '"15"', js: "15" as unknown },
  { src: "", js: undefined as unknown },
];
const DELIVERIES = [
  { src: "5", js: 5 as unknown },
  { src: '"5"', js: "5" as unknown },
  { src: "true", js: true as unknown },
];
const PROPS = ["price", "prise", "name"];

interface Problem {
  line: number;
  spot: "price" | "delivery" | "prop";
  msg: string;
  ar: string;
}

/** A tiny checker that knows exactly these lines and these mistakes. */
function checkCode(p: number, d: number, k: number): Problem[] {
  const out: Problem[] = [];
  if (p === 1) out.push({ line: 5, spot: "price", msg: "Type 'string' is not assignable to type 'number'.", ar: "حسب Drink يجب أن يكون price رقماً، وهذا نص." });
  if (p === 2) out.push({ line: 5, spot: "price", msg: "Property 'price' is missing in type '{ name: string; }' but required in type 'Drink'.", ar: "Drink يَعِد بأن فيه price، والكائن بدونه." });
  if (d === 1) out.push({ line: 6, spot: "delivery", msg: "Type 'string' is not assignable to type 'number'.", ar: "الدرج delivery عليه ملصق number، وهذا نص." });
  if (d === 2) out.push({ line: 6, spot: "delivery", msg: "Type 'boolean' is not assignable to type 'number'.", ar: "true قيمة منطقية، ليست رقماً." });
  if (k === 1) out.push({ line: 7, spot: "prop", msg: "Property 'prise' does not exist on type 'Drink'. Did you mean 'price'?", ar: "لا توجد خاصية بهذا الاسم في Drink: خطأ إملائي." });
  return out;
}

function show(v: unknown) {
  return typeof v === "string" ? v : String(v);
}

/** An editor: click a value to change it, the checker underlines mistakes before anything runs. */
export default function TypeScriptProblem() {
  const [p, setP] = useState(0);
  const [d, setD] = useState(0);
  const [k, setK] = useState(0);
  const [ran, setRan] = useState(false);

  const problems = checkCode(p, d, k);
  const bad = (spot: Problem["spot"]) => problems.some((x) => x.spot === spot);
  const obj: Record<string, unknown> = { name: "latte" };
  if (p !== 2) obj.price = PRICES[p].js;
  // What plain JavaScript does with these values: + glues strings, adds numbers, undefined + 5 is NaN.
  const jsResult = show((obj[PROPS[k]] as number) + (DELIVERIES[d].js as number));

  const chip = (text: string, isBad: boolean, onClick: () => void, cls: string) => (
    <button
      onClick={() => {
        onClick();
        setRan(false);
      }}
      className={`rounded px-1 ring-1 ring-accent/40 hover:bg-accent/15 ${cls} ${isBad ? "underline decoration-err decoration-wavy underline-offset-4" : ""}`}
    >
      {text || "‸"}
    </button>
  );

  const lineCls = (n: number) => (problems.some((x) => x.line === n) ? "bg-err/10" : "");

  return (
    <div>
      <div dir="ltr" className="code rounded-2xl border border-line bg-code p-4 text-sm leading-7 md:text-base">
        <div><span className="text-muted">1 </span>interface Drink {"{"}</div>
        <div><span className="text-muted">2 </span>  name: string;</div>
        <div><span className="text-muted">3 </span>  price: number;</div>
        <div><span className="text-muted">4 </span>{"}"}</div>
        <div className={lineCls(5)}>
          <span className="text-muted">5 </span>
          const <span className={p === 2 ? "underline decoration-err decoration-wavy underline-offset-4" : ""}>latte</span>: Drink = {"{"} name: <span className="text-str">&quot;latte&quot;</span>
          {p !== 2 && <>, price: </>}
          {chip(PRICES[p].src, p === 1, () => setP((x) => (x + 1) % 3), p === 1 ? "text-str" : "text-num")} {"}"};
        </div>
        <div className={lineCls(6)}>
          <span className="text-muted">6 </span>
          const delivery: number = {chip(DELIVERIES[d].src, bad("delivery"), () => setD((x) => (x + 1) % 3), d === 0 ? "text-num" : d === 1 ? "text-str" : "text-bool")};
        </div>
        <div className={lineCls(7)}>
          <span className="text-muted">7 </span>
          console.log(latte.{chip(PROPS[k], bad("prop"), () => setK((x) => (x + 1) % 3), "")} + delivery);
        </div>
      </div>

      <div className="mt-3 min-h-[64px] rounded-2xl border border-line bg-surface p-3 text-sm">
        <AnimatePresence mode="popLayout" initial={false}>
          {problems.length === 0 ? (
            <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ok">
              ✓ المدقّق لم يجد خطأ في الأنواع.
              {k === 2 && <span className="text-muted"> (لكن هل قصدت name فعلاً؟ المدقّق يفحص الأنواع، لا ما في رأسك.)</span>}
            </motion.div>
          ) : (
            problems.map((x) => (
              <motion.div key={x.msg + x.line} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-1.5">
                <div dir="ltr" className="code text-err">
                  line {x.line}: {x.msg}
                </div>
                <div className="text-muted">{x.ar}</div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setRan(true)}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20"
        >
          شغّل
        </motion.button>
        {ran && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3">
            {problems.length ? (
              <>
                <span className="text-err">TypeScript رفض التشغيل: أصلح الخطوط الحمراء أولاً.</span>
                <span className="text-muted">
                  JavaScript بلا مدقّق كانت ستطبع بصمت: <b dir="ltr" className="code text-fg">{jsResult}</b>
                </span>
              </>
            ) : (
              <span>
                تُمحى الأنواع ويعمل JavaScript، فيُطبع: <b dir="ltr" className={`code ${jsResult === "20" ? "text-ok" : "text-err"}`}>{jsResult}</b>
              </span>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
