"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface Product { id: number; name: string; price: number }
interface Res { status: number; body: string; note?: string }

const BODIES: { label: string; value: Record<string, unknown> }[] = [
  { label: '{"name":"Bag","price":40}', value: { name: "Bag", price: 40 } },
  { label: '{"price":20}', value: { price: 20 } },
  { label: '{"name":"Novel"}', value: { name: "Novel" } },
  { label: "{}", value: {} },
];

const STATUS_TEXT: Record<number, string> = { 200: "OK", 201: "Created", 204: "No Content", 400: "Bad Request", 404: "Not Found", 405: "Method Not Allowed" };
const GOALS: { code: number; label: string }[] = [
  { code: 200, label: "قرأت" },
  { code: 201, label: "أنشأت" },
  { code: 204, label: "حذفت" },
  { code: 404, label: "مورد غير موجود" },
  { code: 400, label: "مدخل خاطئ" },
  { code: 405, label: "طريقة لا تناسب" },
];

const j = (v: unknown) => JSON.stringify(v);

/** The fake REST server: resources named by the path, the method says what to do with them. */
function handle(store: Product[], nextId: number, method: Method, path: string, body: Record<string, unknown>): { res: Res; store: Product[]; nextId: number } {
  const keep = (res: Res) => ({ res, store, nextId });
  const parts = path.split("?")[0].split("/");
  if (parts[1] !== "products") {
    const verb = /get|delete|create|update|add|remove/i.test(path);
    return keep({ status: 404, body: j({ error: "no such resource" }), note: verb ? "في REST العنوان اسم شيء، والفعل هو الطريقة." : undefined });
  }
  const hasName = typeof body.name === "string" && body.name !== "";
  const hasPrice = typeof body.price === "number";
  if (parts.length === 2) {
    if (method === "GET") return keep({ status: 200, body: j(store) });
    if (method === "POST") {
      if (!hasName) return keep({ status: 400, body: j({ error: "name is required" }) });
      const p: Product = { id: nextId, name: body.name as string, price: hasPrice ? (body.price as number) : 0 };
      return { res: { status: 201, body: j(p), note: `صار له عنوان: /products/${p.id}` }, store: [...store, p], nextId: nextId + 1 };
    }
    return keep({ status: 405, body: j({ error: "use GET or POST on the collection" }) });
  }
  const id = Number(parts[2]);
  const item = store.find((p) => p.id === id);
  if (!item) return keep({ status: 404, body: j({ error: "not found" }) });
  if (method === "GET") return keep({ status: 200, body: j(item) });
  if (method === "DELETE") return { res: { status: 204, body: "" }, store: store.filter((p) => p.id !== id), nextId };
  if (method === "PATCH") {
    const p = { ...item, ...(hasName ? { name: body.name as string } : {}), ...(hasPrice ? { price: body.price as number } : {}) };
    return { res: { status: 200, body: j(p) }, store: store.map((x) => (x.id === id ? p : x)), nextId };
  }
  if (method === "PUT") {
    if (!hasName || !hasPrice) return keep({ status: 400, body: j({ error: "PUT needs the whole product: name and price" }) });
    const p = { id, name: body.name as string, price: body.price as number };
    return { res: { status: 200, body: j(p) }, store: store.map((x) => (x.id === id ? p : x)), nextId };
  }
  return keep({ status: 405, body: j({ error: "POST goes to /products" }) });
}

/** An API explorer: send method + URL to a fake products store, watch the store change and the JSON come back. */
export default function RestProblem() {
  const [store, setStore] = useState<Product[]>([
    { id: 1, name: "Pen", price: 3 },
    { id: 2, name: "Book", price: 25 },
  ]);
  const [nextId, setNextId] = useState(3);
  const [method, setMethod] = useState<Method>("GET");
  const [path, setPath] = useState("/products");
  const [bodyIdx, setBodyIdx] = useState(0);
  const [res, setRes] = useState<Res | null>(null);
  const [sent, setSent] = useState(0);
  const [touched, setTouched] = useState<number | null>(null);
  const [seen, setSeen] = useState<number[]>([]);

  const hasBody = method === "POST" || method === "PUT" || method === "PATCH";
  const paths = ["/products", ...store.map((p) => `/products/${p.id}`), "/products/99", "/deleteProduct?id=1"];

  function send() {
    const body = hasBody ? BODIES[bodyIdx].value : {};
    const r = handle(store, nextId, method, path, body);
    setStore(r.store);
    setNextId(r.nextId);
    setRes(r.res);
    setSent((k) => k + 1);
    const id = Number(path.split("/")[2]);
    setTouched(r.res.status === 201 ? nextId : r.res.status < 300 && method !== "GET" ? id : null);
    setSeen((s) => (s.includes(r.res.status) ? s : [...s, r.res.status]));
  }

  const tone = (c: number) => (c < 300 ? "text-ok" : c < 500 ? "text-str" : "text-err");

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap gap-2" dir="ltr">
          {METHODS.map((m) => (
            <button key={m} onClick={() => setMethod(m)} className={`code rounded-xl px-3 py-1.5 text-sm font-bold ${m === method ? "bg-accent text-accent-fg" : "border border-line bg-surface-2"}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
          {paths.map((p) => (
            <button key={p} onClick={() => setPath(p)} className={`code rounded-lg px-2.5 py-1 text-sm ${p === path ? "bg-accent-soft/60 font-bold ring-1 ring-accent" : "bg-surface-2 text-muted"}`}>
              {p}
            </button>
          ))}
        </div>
        {hasBody && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span>الجسم:</span>
            <div className="flex flex-wrap gap-2" dir="ltr">
              {BODIES.map((b, k) => (
                <button key={b.label} onClick={() => setBodyIdx(k)} className={`code rounded-lg px-2 py-1 text-xs ${k === bodyIdx ? "bg-code text-code-fg ring-1 ring-accent" : "bg-surface-2 text-muted"}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <motion.button whileTap={{ scale: 0.92 }} onClick={send} className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20">
            أرسل
          </motion.button>
          <code dir="ltr" className="code text-sm text-muted">
            {method} {path} {hasBody ? BODIES[bodyIdx].label : ""}
          </code>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Store */}
        <div>
          <div className="mb-1 text-sm font-semibold">المخزن على الخادم</div>
          <div className="min-h-[9rem] rounded-2xl border border-line bg-surface p-3" dir="ltr">
            <AnimatePresence initial={false}>
              {store.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, scale: touched === p.id ? [1.05, 1] : 1 }}
                  exit={{ opacity: 0, x: 30, transition: { duration: 0.3 } }}
                  className={`code mb-2 flex items-center justify-between rounded-xl px-3 py-2 text-sm ${touched === p.id ? "bg-accent-soft/60 ring-1 ring-accent" : "bg-surface-2"}`}
                >
                  <span className="text-muted">/products/{p.id}</span>
                  <span>
                    <span className="text-str">{p.name}</span> · <span className="text-num">{p.price}</span>
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {store.length === 0 && <div className="text-center text-sm text-muted">فارغ</div>}
          </div>
        </div>

        {/* Response */}
        <div>
          <div className="mb-1 text-sm font-semibold">الرد</div>
          {res ? (
            <motion.div key={sent} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <pre dir="ltr" className="code min-h-[9rem] overflow-x-auto whitespace-pre-wrap break-all rounded-2xl bg-code p-3 text-xs leading-6 text-code-fg">
                <div className={`font-bold ${tone(res.status)}`}>HTTP/1.1 {res.status} {STATUS_TEXT[res.status]}</div>
                {res.body && <div className="text-code-fg/70">Content-Type: application/json</div>}
                <div> </div>
                <div>{res.body || " "}</div>
              </pre>
              {res.note && <p className="mt-2 text-sm text-muted">{res.note}</p>}
            </motion.div>
          ) : (
            <div className="flex min-h-[9rem] items-center justify-center rounded-2xl border border-dashed border-line text-sm text-muted">الخادم ينتظر طلباً</div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {GOALS.map((g) => (
          <motion.span key={g.code} animate={{ scale: seen.includes(g.code) ? [1.25, 1] : 1 }} className={`rounded-lg px-2 py-1 text-xs font-bold ${seen.includes(g.code) ? `bg-surface ${tone(g.code)} ring-1 ring-current` : "bg-surface-2 text-muted/50"}`}>
            <span className="code">{g.code}</span> {g.label}
          </motion.span>
        ))}
      </div>

      {seen.length >= 4 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          لاحظت؟ العنوان يسمّي <b className="text-fg">الشيء</b> (المجموعة أو منتجاً واحداً)، والطريقة تقول <b className="text-fg">ماذا تفعل به</b>. العنوان نفسه مع طرق مختلفة أعطاك القراءة والتعديل والحذف.
        </motion.p>
      )}
    </div>
  );
}
