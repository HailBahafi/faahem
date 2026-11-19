"use client";

import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useRef, useState, type ReactNode } from "react";

type Kind = "server" | "lb" | "cache" | "replica" | "queue" | "worker";

const LEVELS = [100, 1_000, 10_000, 100_000, 1_000_000];
const LEVEL_LABEL = ["100", "1K", "10K", "100K", "1M"];
/** Cheapest all-green design per level (for the "over-built" hint). */
const CHEAPEST = [100, 100, 100, 165, 655];

const PRICE: Record<Kind | "db", number> = { server: 40, lb: 20, cache: 30, replica: 60, queue: 10, worker: 25, db: 60 };
const MAX: Record<Kind, number> = { server: 12, lb: 1, cache: 1, replica: 4, queue: 1, worker: 6 };
const PALETTE: { kind: Kind; label: string; hint: string }[] = [
  { kind: "server", label: "+ خادم API", hint: "Node · Go · Python" },
  { kind: "lb", label: "موزّع حمل", hint: "load balancer" },
  { kind: "cache", label: "كاش", hint: "Redis" },
  { kind: "replica", label: "نسخة قراءة", hint: "Postgres replica" },
  { kind: "queue", label: "طابور", hint: "queue" },
  { kind: "worker", label: "عامل خلفي", hint: "worker" },
];

interface Design { server: number; lb: number; cache: number; replica: number; queue: number; worker: number }
interface Part { load: number; note: string }

/** A rough capacity model: requests per second flow through each piece; load above 1 means it is drowning. */
function model(users: number, d: Design) {
  const rps = users / 100;
  const async = d.queue > 0;
  const serverCap = async ? 1000 : 500;
  const active = d.lb ? d.server : 1;
  const reads = rps * 0.95;
  const writes = rps * 0.05;
  const dbReads = d.cache ? reads * 0.1 : reads;
  const jobs = rps * 0.05;
  const parts: Record<string, Part> = {
    server: { load: rps / (active * serverCap), note: async ? `${serverCap} طلب/ث لكل خادم` : "المهام البطيئة داخل الطلب: نصف السعة" },
    db: { load: (d.replica ? writes : dbReads + writes) / 800, note: d.replica ? "الكتابة فقط" : "قراءة + كتابة" },
  };
  if (d.lb) parts.lb = { load: rps / 100_000, note: "يوزّع بالتناوب" };
  if (d.cache) parts.cache = { load: reads / 50_000, note: "90% من القراءات" };
  if (d.replica) parts.replica = { load: dbReads / (d.replica * 1000), note: "القراءات" };
  if (d.queue) parts.queue = { load: d.worker ? jobs / (d.worker * 200) : jobs > 0 ? 9 : 0, note: d.worker ? `${Math.round(jobs)} مهمة/ث` : "لا عمّال: الطابور يكبر" };
  const cost = d.server * PRICE.server + PRICE.db + d.lb * PRICE.lb + d.cache * PRICE.cache + d.replica * PRICE.replica + d.queue * PRICE.queue + d.worker * PRICE.worker;
  return { rps, parts, cost, idle: d.lb ? 0 : d.server - 1 };
}

const tone = (load: number) => (load > 1 ? "red" : load > 0.75 ? "amber" : "green");
const RING = { red: "border-err bg-err/10", amber: "border-str bg-str/10", green: "border-ok bg-ok/5" };
const TEXT = { red: "text-err", amber: "text-str", green: "text-ok" };

/** An architecture board with a traffic slider: add pieces until no component is red, and watch the monthly bill. */
export default function SystemDesignProblem() {
  const [level, setLevel] = useState(0);
  const [d, setD] = useState<Design>({ server: 1, lb: 0, cache: 0, replica: 0, queue: 0, worker: 0 });
  const [maxSeen, setMaxSeen] = useState(0);
  const board = useRef<HTMLDivElement>(null);

  const users = LEVELS[level];
  const m = model(users, d);
  const loads = Object.values(m.parts).map((p) => p.load);
  const reds = loads.filter((l) => l > 1).length;
  const allGreen = reds === 0;
  const over = allGreen && m.cost > CHEAPEST[level] * 1.6;

  // Workers only make sense behind a queue: adding one brings the queue, removing the queue takes them.
  const add = (k: Kind) => setD((x) => ({ ...x, [k]: Math.min(MAX[k], x[k] + 1), ...(k === "worker" ? { queue: 1 } : {}) }));
  const remove = (k: Kind) => setD((x) => ({ ...x, [k]: Math.max(k === "server" ? 1 : 0, x[k] - 1), ...(k === "queue" ? { worker: 0 } : {}) }));

  function dropped(k: Kind, info: PanInfo) {
    const r = board.current?.getBoundingClientRect();
    if (!r) return;
    const x = info.point.x - window.scrollX;
    const y = info.point.y - window.scrollY;
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) add(k);
  }

  function slide(v: number) {
    setLevel(v);
    setMaxSeen((s) => Math.max(s, v));
  }

  const P = (key: string) => m.parts[key];

  return (
    <div>
      {/* Traffic */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-muted">المستخدمون: </span>
            <b className="code text-xl text-num">{users.toLocaleString("en-US")}</b>
            <span className="code ms-2 text-xs text-muted">≈ {m.rps.toLocaleString("en-US")} req/s</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.span key={m.cost} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="code rounded-xl bg-surface-2 px-3 py-1 font-bold">
              ${m.cost}<span className="text-xs font-normal text-muted">/month</span>
            </motion.span>
            <span className={`rounded-xl px-3 py-1 text-sm font-bold ${allGreen ? "bg-ok/15 text-ok" : "bg-err/15 text-err"}`}>
              {allGreen ? "كل شيء أخضر" : `${reds} مختنق`}
            </span>
          </div>
        </div>
        <input type="range" min={0} max={4} step={1} value={level} onChange={(e) => slide(Number(e.target.value))} dir="ltr" className="mt-3 w-full accent-[var(--accent)]" />
        <div className="code flex justify-between text-xs text-muted" dir="ltr">
          {LEVEL_LABEL.map((l, i) => <span key={l} className={i === level ? "font-bold text-fg" : ""}>{l}</span>)}
        </div>
      </div>

      {/* Palette */}
      <div className="mt-3 flex flex-wrap gap-2">
        {PALETTE.map((p) => {
          const full = d[p.kind] >= MAX[p.kind];
          return (
            <motion.div
              key={p.kind}
              drag={!full}
              dragSnapToOrigin
              whileDrag={{ scale: 1.1, zIndex: 50 }}
              onDragEnd={(_, info) => dropped(p.kind, info)}
              onTap={() => !full && add(p.kind)}
              className={`cursor-grab touch-none select-none rounded-xl border px-3 py-1.5 text-sm active:cursor-grabbing ${full ? "border-line bg-surface-2 text-muted/50" : "border-accent bg-accent-soft/50"}`}
            >
              <b>{p.label}</b> <span className="code text-xs text-muted">{p.hint} · ${PRICE[p.kind]}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Board */}
      <div ref={board} className="mt-3 overflow-x-auto rounded-2xl border border-dashed border-line bg-surface-2/40 p-3">
        <div dir="ltr" className="flex min-w-[40rem] items-stretch gap-2">
          <Col>
            <Box title="Clients" sub="web · Flutter" state="green" label={`${users.toLocaleString("en-US")} users`} />
          </Col>
          <Arrow />
          <Col>
            {d.lb ? (
              <Box title="Load balancer" sub="nginx" part={P("lb")} onRemove={() => remove("lb")} />
            ) : (
              <Slot text="لا موزّع: كل الطلبات إلى خادم واحد" />
            )}
          </Col>
          <Arrow />
          <Col>
            <Group part={P("server")} title={`API servers ×${d.server}`}>
              <div className="flex flex-wrap gap-1">
                <AnimatePresence>
                  {Array.from({ length: d.server }, (_, i) => (
                    <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className={`code rounded-md border px-1.5 py-0.5 text-[10px] ${i > 0 && !d.lb ? "border-dashed border-line text-muted/60" : "border-line bg-surface"}`}>
                      api{i + 1}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {m.idle > 0 && <p className="mt-1 text-[11px] text-str">{m.idle} نائم: لا أحد يرسل إليه</p>}
              {d.server > 1 && <Minus onClick={() => remove("server")} />}
            </Group>
            <div className="flex gap-2">
              {d.queue ? <Box title="Queue" sub="jobs" part={P("queue")} onRemove={() => remove("queue")} /> : <Slot text="المهام البطيئة داخل الطلب" />}
              {d.queue > 0 && (
                <Box title={`Workers ×${d.worker}`} sub="background" state={d.worker ? tone(P("queue").load) : "red"} label={d.worker ? "" : "0"} onRemove={d.worker ? () => remove("worker") : undefined} />
              )}
            </div>
          </Col>
          <Arrow />
          <Col>{d.cache ? <Box title="Cache" sub="Redis" part={P("cache")} onRemove={() => remove("cache")} /> : <Slot text="بلا كاش: كل قراءة تذهب إلى القاعدة" />}</Col>
          <Arrow />
          <Col>
            <Box title="Postgres primary" sub="indexes" part={P("db")} />
            {d.replica > 0 && <Box title={`Replicas ×${d.replica}`} sub="read only" part={P("replica")} onRemove={() => remove("replica")} />}
          </Col>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-lg border border-line bg-surface px-2 py-0.5">كل صندوق حاوية Docker</span>
          <span className="rounded-lg border border-line bg-surface px-2 py-0.5">ينشرها CI/CD</span>
          <span className={`rounded-lg border px-2 py-0.5 ${reds ? "border-err text-err" : "border-line bg-surface"}`}>المراقبة: {reds} تنبيه</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p key={`${level}-${allGreen}-${over}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-muted">
          {!allGreen
            ? "القطعة الحمراء هي عنق الزجاجة: الطلبات تنتظرها فيبطئ كل شيء. اسحب إلى اللوحة ما يخفف عنها."
            : over
              ? "أخضر، لكنك تدفع لقطع شبه نائمة. التصميم الجيد يكفي الحمل الحالي، ويكبر حين يكبر."
              : level < 4
                ? "أخضر. حرّك الشريط إلى عدد مستخدمين أكبر."
                : maxSeen === 4
                  ? "مليون مستخدم، وكل شيء أخضر: خوادم عديمة الحالة خلف موزّع، كاش، نسخة قراءة، وطابور بعمّال. هذه هي كل قطع الدورة، مرتّبة."
                  : ""}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function Col({ children }: { children: ReactNode }) {
  return <div className="flex min-w-[6.5rem] flex-1 flex-col justify-center gap-2">{children}</div>;
}

function Arrow() {
  return <div className="self-center text-lg text-muted">→</div>;
}

function Slot({ text }: { text: string }) {
  return <div dir="rtl" className="rounded-xl border border-dashed border-line p-2 text-center text-[11px] text-muted">{text}</div>;
}

function Minus({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="remove" className="absolute right-1 top-1 h-5 w-5 rounded-full border border-line bg-surface text-xs leading-none text-muted hover:text-err">
      −
    </button>
  );
}

function Meter({ load }: { load: number }) {
  const t = tone(load);
  return (
    <div className="mt-1">
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <motion.div animate={{ width: `${Math.min(100, load * 100)}%` }} className={`h-full ${t === "red" ? "bg-err" : t === "amber" ? "bg-str" : "bg-ok"}`} />
      </div>
      <div className={`code mt-0.5 text-[11px] font-bold ${TEXT[t]}`}>{load > 5 ? "∞" : `${Math.round(load * 100)}%`}</div>
    </div>
  );
}

function Box({ title, sub, part, state, label, onRemove }: { title: string; sub: string; part?: Part; state?: "red" | "amber" | "green"; label?: string; onRemove?: () => void }) {
  const t = part ? tone(part.load) : state ?? "green";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: t === "red" ? [1, 1.04, 1] : 1 }}
      transition={t === "red" ? { scale: { repeat: Infinity, duration: 1.2 } } : undefined}
      className={`relative rounded-xl border-2 p-2 ${RING[t]}`}
    >
      {onRemove && <Minus onClick={onRemove} />}
      <div className="pe-5 text-xs font-bold">{title}</div>
      <div className="code text-[10px] text-muted">{sub}</div>
      {part && <Meter load={part.load} />}
      {part && <div dir="rtl" className="text-[10px] text-muted">{part.note}</div>}
      {label && <div className={`code mt-1 text-[11px] ${TEXT[t]}`}>{label}</div>}
    </motion.div>
  );
}

function Group({ title, part, children }: { title: string; part: Part; children: ReactNode }) {
  const t = tone(part.load);
  return (
    <motion.div layout animate={{ scale: t === "red" ? [1, 1.03, 1] : 1 }} transition={t === "red" ? { scale: { repeat: Infinity, duration: 1.2 } } : undefined} className={`relative rounded-xl border-2 p-2 ${RING[t]}`}>
      <div className="pe-5 text-xs font-bold">{title}</div>
      <div className="mt-1">{children}</div>
      <Meter load={part.load} />
      <div dir="rtl" className="text-[10px] text-muted">{part.note}</div>
    </motion.div>
  );
}
