"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Method = "GET" | "POST" | "PUT" | "DELETE";
const METHODS: Method[] = ["GET", "POST", "PUT", "DELETE"];
const PATHS = ["/", "/products", "/products/7", "/old-shop", "/admin", "/crash", "/blog"];
const CODES: { code: number; label: string }[] = [
  { code: 200, label: "OK" },
  { code: 201, label: "Created" },
  { code: 301, label: "Moved" },
  { code: 401, label: "Unauthorized" },
  { code: 404, label: "Not Found" },
  { code: 405, label: "Method Not Allowed" },
  { code: 500, label: "Server Error" },
];
const MEANING: Record<number, string> = {
  200: "تمام، هذا ما طلبت.",
  201: "تمام، أنشأت الشيء الجديد.",
  301: "انتقلت. اطلبني من العنوان في Location.",
  401: "من أنت؟ لا أعرفك بلا بطاقة دخول (كوكي).",
  404: "لا شيء عندي بهذا المسار.",
  405: "هذا المسار لا يقبل هذه الطريقة.",
  500: "تعثّرت أنا وأنا أجهّز الرد. المشكلة عندي لا عندك.",
};

interface Res { status: number; headers: [string, string][]; body: string }

const json = (status: number, body: string): Res => ({ status, headers: [["Content-Type", "application/json"]], body });
const page = (status: number, body: string): Res => ({ status, headers: [["Content-Type", "text/html"]], body });

/** The fake server: a pure function of the request. It remembers nothing between requests. */
function handle(method: Method, path: string, cookie: boolean, body: string): Res {
  if (path === "/crash") return page(500, "<h1>Internal Server Error</h1>");
  if (path === "/old-shop") return { status: 301, headers: [["Location", "/products"]], body: "" };
  if (path === "/") return method === "GET" ? page(200, "<h1>Welcome to the shop</h1>") : json(405, '{"error":"GET only"}');
  if (path === "/admin") return cookie ? page(200, "<h1>Admin panel</h1>") : json(401, '{"error":"who are you?"}');
  if (path === "/products") {
    if (method === "GET") return json(200, '[{"id":7,"name":"Pen"},{"id":9,"name":"Book"}]');
    if (method === "POST") return cookie ? json(201, `{"id":12,"name":${JSON.stringify(body || "Bag")}}`) : json(401, '{"error":"who are you?"}');
    return json(405, '{"error":"GET or POST"}');
  }
  if (path === "/products/7") {
    if (method === "GET") return json(200, '{"id":7,"name":"Pen","price":3}');
    if (!cookie) return json(401, '{"error":"who are you?"}');
    if (method === "PUT") return json(200, `{"id":7,"name":${JSON.stringify(body || "Pen")},"price":3}`);
    if (method === "DELETE") return json(200, '{"deleted":7}');
    return json(405, '{"error":"not allowed"}');
  }
  return page(404, "<h1>Not Found</h1>");
}

function statusText(code: number) {
  return CODES.find((c) => c.code === code)?.label ?? "";
}

/** A request builder talking to a fake server: build the text, send it, read the text that comes back. */
export default function HttpProblem() {
  const [method, setMethod] = useState<Method>("GET");
  const [path, setPath] = useState("/products");
  const [cookie, setCookie] = useState(false);
  const [body, setBody] = useState("Bag");
  const [phase, setPhase] = useState<"idle" | "going" | "back">("idle");
  const [res, setRes] = useState<Res | null>(null);
  const [seen, setSeen] = useState<number[]>([]);
  const [sent, setSent] = useState(0);

  const hasBody = method === "POST" || method === "PUT";
  const reqLines = [
    `${method} ${path} HTTP/1.1`,
    "Host: shop.com",
    ...(cookie ? ["Cookie: session=a91f"] : []),
    ...(hasBody ? ["Content-Type: text/plain"] : []),
    "",
    ...(hasBody ? [body] : []),
  ];

  function send() {
    if (phase !== "idle" && phase !== "back") return;
    setRes(null);
    setPhase("going");
    setSent((k) => k + 1);
    setTimeout(() => {
      const r = handle(method, path, cookie, body);
      setRes(r);
      setPhase("back");
      setSeen((s) => (s.includes(r.status) ? s : [...s, r.status]));
    }, 900);
  }
  const edit = (f: () => void) => { f(); if (phase === "back") setPhase("idle"); };

  const resLines = res ? [`HTTP/1.1 ${res.status} ${statusText(res.status)}`, ...res.headers.map(([k, v]) => `${k}: ${v}`), "", ...(res.body ? [res.body] : [])] : [];
  const tone = (c: number) => (c < 300 ? "text-ok" : c < 400 ? "text-bool" : c < 500 ? "text-str" : "text-err");

  return (
    <div>
      {/* Builder */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap gap-2" dir="ltr">
          {METHODS.map((m) => (
            <button key={m} onClick={() => edit(() => setMethod(m))} className={`code rounded-xl px-3 py-1.5 text-sm font-bold ${m === method ? "bg-accent text-accent-fg" : "border border-line bg-surface-2"}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
          {PATHS.map((p) => (
            <button key={p} onClick={() => edit(() => setPath(p))} className={`code rounded-lg px-2.5 py-1 text-sm ${p === path ? "bg-accent-soft/60 font-bold ring-1 ring-accent" : "bg-surface-2 text-muted"}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={cookie} onChange={(e) => edit(() => setCookie(e.target.checked))} className="accent-[var(--accent)]" />
            أرفق بطاقة الدخول (الكوكي)
          </label>
          {hasBody && (
            <label className="flex items-center gap-2">
              الجسم:
              <input value={body} onChange={(e) => edit(() => setBody(e.target.value))} dir="ltr" className="code w-28 rounded-lg border border-line bg-surface-2 px-2 py-1" />
            </label>
          )}
        </div>
      </div>

      {/* Wire */}
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr]" dir="ltr">
        <Raw title="الطلب (من المتصفح)" lines={reqLines} highlight={0} />
        <div className="relative flex h-10 items-center self-center md:w-24">
          <div className="h-0.5 w-full rounded bg-line" />
          <AnimatePresence>
            {phase === "going" && (
              <motion.div key={`go${sent}`} initial={{ left: "0%", opacity: 0 }} animate={{ left: "85%", opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-accent shadow-lg shadow-accent/40" />
            )}
          </AnimatePresence>
        </div>
        <div>
          {res ? (
            <motion.div key={sent} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Raw title="الرد (من الخادم)" lines={resLines} highlight={0} tone={tone(res.status)} />
              <p dir="rtl" className="mt-2 text-sm"><b className={`code ${tone(res.status)}`}>{res.status}</b> — {MEANING[res.status]}</p>
            </motion.div>
          ) : (
            <div className="flex h-full min-h-[8rem] items-center justify-center rounded-2xl border border-dashed border-line text-sm text-muted">
              {phase === "going" ? "الطلب في الطريق…" : "الخادم ينتظر طلباً"}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={send} disabled={phase === "going"} className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40">
          أرسل الطلب
        </motion.button>
        <div className="flex flex-wrap gap-1.5" dir="ltr">
          {CODES.map((c) => (
            <motion.span key={c.code} animate={{ scale: seen.includes(c.code) ? [1.3, 1] : 1 }} title={c.label} className={`code rounded-lg px-2 py-1 text-xs font-bold ${seen.includes(c.code) ? `bg-surface ${tone(c.code)} ring-1 ring-current` : "bg-surface-2 text-muted/50"}`}>
              {c.code}
            </motion.span>
          ))}
        </div>
      </div>

      {seen.length >= 4 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          لاحظت؟ كل ما جرى <b className="text-fg">نص</b>: طلب واحد ثم ردّ واحد يبدأ برقم حالة. والخادم لا يتذكّرك بين طلب وآخر: من غير الكوكي هو لا يعرف من أنت في كل مرة.
        </motion.p>
      )}
    </div>
  );
}

function Raw({ title, lines, highlight, tone }: { title: string; lines: string[]; highlight: number; tone?: string }) {
  return (
    <div>
      <div dir="rtl" className="mb-1 text-start text-sm font-semibold">{title}</div>
      <pre dir="ltr" className="code min-h-[8rem] overflow-x-auto rounded-2xl bg-code p-3 text-xs leading-6 text-code-fg">
        {lines.map((l, k) => (
          <div key={k} className={k === highlight ? `font-bold ${tone ?? "text-[var(--accent)]"}` : l.includes(":") && !l.startsWith("{") && !l.startsWith("[") ? "text-code-fg/70" : ""}>
            {l || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}
