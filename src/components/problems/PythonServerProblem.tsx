"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

type Stage = "listen" | "route" | "read" | "check" | "logic" | "respond";
type ReqId = "get" | "post" | "bad";
type Hit = { lines: number[]; note: string };

const STAGES: { id: Stage; label: string }[] = [
  { id: "listen", label: "يستمع" },
  { id: "route", label: "يطابق المسار" },
  { id: "read", label: "يقرأ الجسم" },
  { id: "check", label: "يفحص النوع" },
  { id: "logic", label: "ينفّذ المنطق" },
  { id: "respond", label: "يرد" },
];

const REQS: { id: ReqId; label: string; body?: string }[] = [
  { id: "get", label: "GET /products" },
  { id: "post", label: "POST /products", body: '{"name":"Book","price":5}' },
  { id: "bad", label: "POST /products", body: '{"name":"Bag","price":"cheap"}' },
];

const NO: Hit = { lines: [], note: "" };
const h = (lines: number[], note = ""): Hit => ({ lines, note });

interface LangDef {
  name: string;
  code: string[];
  flow: Record<ReqId, Partial<Record<Stage, Hit>>>;
  result: Record<ReqId, string>;
}

const LANGS: LangDef[] = [
  {
    name: "Node · Express",
    code: [
      "const app = express();",
      "app.use(express.json());",
      'const products = [{ name: "Pen", price: 3 }];',
      'app.get("/products", (req, res) => {',
      "  res.json(products);",
      "});",
      'app.post("/products", (req, res) => {',
      "  const p = req.body;",
      "  products.push(p);",
      "  res.status(201).json(p);",
      "});",
      "app.listen(3000);",
    ],
    flow: {
      get: { listen: h([11]), route: h([3]), respond: h([4], "res.json يحوّل القائمة إلى JSON") },
      post: { listen: h([11]), route: h([6]), read: h([1, 7], "express.json قرأ الجسم"), check: h([], "لا فحص: Express لا يعرف شكل المنتج"), logic: h([8]), respond: h([9]) },
      bad: { listen: h([11]), route: h([6]), read: h([1, 7]), check: h([], "لا فحص! السعر النصي يمر"), logic: h([8], "حُفظ منتج سعره cheap"), respond: h([9]) },
    },
    result: { get: '200 [{"name":"Pen","price":3}]', post: '201 {"name":"Book","price":5}', bad: '201 {"name":"Bag","price":"cheap"}' },
  },
  {
    name: "Go · net/http",
    code: [
      'type Product struct{ Name string `json:"name"`; Price int `json:"price"` }',
      'products := []Product{{"Pen", 3}}',
      'http.HandleFunc("GET /products", func(w http.ResponseWriter, r *http.Request) {',
      "\tjson.NewEncoder(w).Encode(products)",
      "})",
      'http.HandleFunc("POST /products", func(w http.ResponseWriter, r *http.Request) {',
      "\tvar p Product",
      "\terr := json.NewDecoder(r.Body).Decode(&p)",
      "\tif err != nil {",
      '\t\thttp.Error(w, "bad json", 400)',
      "\t\treturn",
      "\t}",
      "\tproducts = append(products, p)",
      "\tw.WriteHeader(201)",
      "\tjson.NewEncoder(w).Encode(p)",
      "})",
      'http.ListenAndServe(":8080", nil)',
    ],
    flow: {
      get: { listen: h([16]), route: h([2]), respond: h([3], "Encode يكتب JSON في w") },
      post: { listen: h([16]), route: h([5]), read: h([6, 7], "Decode يملأ p"), check: h([0, 8], "النوع Product يفحص، err = nil"), logic: h([12]), respond: h([13, 14]) },
      bad: { listen: h([16]), route: h([5]), read: h([6, 7], "Decode يرجع خطأ في err"), check: h([8], "err != nil صحيح"), logic: h([], "تُخطّى"), respond: h([9, 10]) },
    },
    result: { get: '200 [{"name":"Pen","price":3}]', post: '201 {"name":"Book","price":5}', bad: "400 bad json" },
  },
  {
    name: "Python · FastAPI",
    code: [
      "app = FastAPI()",
      'products = [{"name": "Pen", "price": 3}]',
      "class Product(BaseModel):",
      "    name: str",
      "    price: int",
      '@app.get("/products")',
      "def list_products():",
      "    return products",
      '@app.post("/products", status_code=201)',
      "def add_product(p: Product):",
      "    products.append(p)",
      "    return p",
      "# uvicorn main:app --port 8000",
    ],
    flow: {
      get: { listen: h([12]), route: h([5, 6]), respond: h([7], "FastAPI يحوّل القائمة إلى JSON") },
      post: { listen: h([12]), route: h([8]), read: h([9], "التلميح p: Product"), check: h([3, 4], "FastAPI يفحص قبل الدالة"), logic: h([10]), respond: h([11]) },
      bad: { listen: h([12]), route: h([8]), read: h([9]), check: h([4], "price ليس int"), logic: h([], "الدالة لا تُستدعى"), respond: h([], "FastAPI يرد 422 بنفسه") },
    },
    result: { get: '200 [{"name":"Pen","price":3}]', post: '201 {"name":"Book","price":5}', bad: '422 {"detail":[{"loc":["body","price"],...}]}' },
  },
];

const tone = (r: string) => (r.startsWith("2") ? "text-ok" : "text-err");

/** One API in three languages: the same request lights the same stage in each. */
export default function PythonServerProblem() {
  const [req, setReq] = useState<ReqId>("get");
  const [k, setK] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [tried, setTried] = useState<ReqId[]>([]);

  const stages = STAGES.filter((s) => LANGS.some((l) => l.flow[req][s.id] !== undefined));
  const done = k >= stages.length - 1 && k >= 0;

  useEffect(() => {
    if (!playing) return;
    if (k >= stages.length - 1) {
      setPlaying(false);
      setTried((t) => (t.includes(req) ? t : [...t, req]));
      return;
    }
    const id = setTimeout(() => setK((v) => v + 1), k < 0 ? 200 : 1300);
    return () => clearTimeout(id);
  }, [playing, k, stages.length, req]);

  function send() {
    setK(-1);
    setPlaying(true);
  }
  function pick(id: ReqId) {
    setReq(id);
    setK(-1);
    setPlaying(false);
  }

  const cur = k >= 0 ? stages[k]?.id : undefined;
  const r = REQS.find((q) => q.id === req)!;

  return (
    <div>
      <div className="flex flex-wrap gap-2" dir="ltr">
        {REQS.map((q) => (
          <button key={q.id} onClick={() => pick(q.id)} className={`code rounded-xl px-3 py-1.5 text-start text-xs ${q.id === req ? "bg-accent font-bold text-accent-fg" : "border border-line bg-surface-2"}`}>
            {q.label}
            {q.body && <span className="block opacity-80">{q.body}</span>}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {stages.map((s, i) => (
          <span key={s.id} className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${i === k ? "bg-accent text-accent-fg" : i < k ? "bg-accent-soft/60" : "bg-surface-2 text-muted"}`}>
            {s.label}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {LANGS.map((l) => {
          const hit: Hit = cur ? l.flow[req][cur] ?? NO : NO;
          return (
            <div key={l.name} className="flex flex-col rounded-2xl border border-line bg-surface p-3">
              <div className="mb-2 text-sm font-bold" dir="ltr">{l.name}</div>
              <pre dir="ltr" className="code flex-1 overflow-x-auto rounded-xl bg-code p-2 text-[11px] leading-5 text-code-fg">
                {l.code.map((line, i) => (
                  <motion.div key={i} animate={{ opacity: cur && !hit.lines.includes(i) ? 0.45 : 1 }} className={`whitespace-pre rounded px-1 ${hit.lines.includes(i) ? "bg-accent/25 font-bold ring-1 ring-accent" : ""}`}>
                    {line.replace(/\t/g, "  ") || " "}
                  </motion.div>
                ))}
              </pre>
              <div className="mt-2 min-h-[1.25rem] text-xs text-muted">{hit.note}</div>
              <div dir="ltr" className={`code mt-1 min-h-[1.5rem] truncate rounded-lg bg-surface-2 px-2 py-1 text-xs ${done ? tone(l.result[req]) : "text-muted/40"}`}>
                {done ? l.result[req] : "…"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={send} disabled={playing} className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40">
          أرسل <span className="code text-base" dir="ltr">{r.label}</span>
        </motion.button>
      </div>

      {tried.includes("bad") && tried.length >= 2 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          الشكل واحد في الثلاث: <b className="text-fg">مسار ← دالة ← رد</b>. الفرق في الفحص: Express حفظ سعراً نصياً بلا اعتراض، و Go رفضه لأن النوع int، و FastAPI رفضه قبل أن تبدأ دالتك لأنه قرأ تلميح النوع.
        </motion.p>
      )}
    </div>
  );
}
