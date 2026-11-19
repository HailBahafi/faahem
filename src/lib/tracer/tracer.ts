/* eslint-disable @typescript-eslint/no-explicit-any */
// A small step-by-step JavaScript interpreter. It runs a beginner subset of JS and
// records, after every statement, the call stack, the heap and an Arabic narration,
// so any program the learner writes can be played back as an animation.

import { parse } from "acorn";
import { explainError } from "../runJs.ts";
import type { Frame, HeapObj, Slot, Step } from "../types";

export const MAX_STEPS = 600;
const MAX_DEPTH = 60;

class Ref {
  id: number;
  constructor(id: number) {
    this.id = id;
  }
}
type Val = number | string | boolean | null | undefined | Ref;

type HeapEntry =
  | { kind: "array"; items: Val[] }
  | { kind: "object"; props: Map<string, Val> }
  | { kind: "function"; name: string; params: any[]; body: any; closure: Scope; arrow: boolean; line: number };

interface Binding {
  value: Val;
  kind: string;
}

class Scope {
  vars = new Map<string, Binding>();
  parent: Scope | null;
  constructor(parent: Scope | null) {
    this.parent = parent;
  }
}

interface FrameRec {
  id: number;
  name: string;
  /** The function-level scope. */
  base: Scope;
  /** The innermost block scope currently active. */
  cur: Scope;
}

class JsError extends Error {
  jsName: string;
  constructor(jsName: string, message: string) {
    super(message);
    this.jsName = jsName;
  }
}
class Unsupported extends Error {}
class LimitError extends Error {}
class BreakSig {}
class ContinueSig {}
/** A value thrown by the learner's own `throw`, travelling up to the nearest catch. */
class Thrown {
  value: Val;
  constructor(value: Val) {
    this.value = value;
  }
}
class ReturnSig {
  value: Val;
  constructor(value: Val) {
    this.value = value;
  }
}

export interface TraceResult {
  steps: Step[];
  output: string[];
  error?: string;
}

const NODE_NAMES: Record<string, string> = {
  ClassDeclaration: "الأصناف (class)",
  ForInStatement: "for...in",
  SpreadElement: "النشر (...)",
  ObjectPattern: "التفكيك {}",
  ArrayPattern: "التفكيك []",
  AwaitExpression: "await",
  NewExpression: "new",
};

export function trace(code: string): TraceResult {
  let ast: any;
  try {
    ast = parse(code, { ecmaVersion: 2022, locations: true });
  } catch (e) {
    const m = (e as Error).message;
    return { steps: [], output: [], error: `خطأ في كتابة الكود: ${m}` };
  }
  const it = new Interp(code);
  it.run(ast);
  return { steps: it.steps, output: it.output, error: it.error };
}

class Interp {
  src: string;
  heap = new Map<number, HeapEntry>();
  nextId = 1;
  frames: FrameRec[] = [];
  frameSeq = 0;
  output: string[] = [];
  steps: Step[] = [];
  reads = new Set<string>();
  writes = new Set<string>();
  heapWrites = new Set<number>();
  lastLine: number | null = null;
  /** Frames at the moment an uncaught error started unwinding. */
  unwound?: FrameRec[];
  error?: string;

  constructor(src: string) {
    this.src = src;
  }

  run(ast: any) {
    const global = new Scope(null);
    this.frames.push({ id: this.frameSeq++, name: "البرنامج", base: global, cur: global });
    this.record(null, "البرنامج جاهز. المكدّس فيه إطار واحد: إطار البرنامج الرئيسي.");
    try {
      this.hoist(ast.body, global);
      for (const s of ast.body) this.exec(s);
      this.record(null, "انتهى البرنامج.");
    } catch (e) {
      this.fail(e);
    }
  }

  fail(e: unknown) {
    let msg: string;
    if (e instanceof LimitError) msg = `توقف التتبّع بعد ${MAX_STEPS} خطوة. هل توجد حلقة لا تنتهي؟`;
    else if (e instanceof Unsupported) msg = `المتتبّع لا يدعم ${e.message} بعد.`;
    else if (e instanceof JsError) msg = explainError({ out: [], error: { name: e.jsName, message: e.message } }) ?? e.message;
    else if (e instanceof Thrown) msg = `خطأ لم يُلتقط: ${this.errorText(e.value)}`;
    else if (e instanceof ReturnSig) msg = "return خارج دالة.";
    else if (e instanceof BreakSig || e instanceof ContinueSig) msg = "break أو continue خارج حلقة.";
    else msg = String((e as Error)?.message ?? e);
    this.error = msg;
    if (this.unwound) this.frames = this.unwound;
    this.steps.push({ ...this.snapshot(this.lastLine, msg), error: msg });
  }

  // ---------- recording ----------

  get top() {
    return this.frames[this.frames.length - 1];
  }

  record(line: number | null, say: string) {
    if (this.steps.length >= MAX_STEPS) throw new LimitError();
    this.steps.push(this.snapshot(line, say));
    if (line !== null) this.lastLine = line;
    this.reads.clear();
    this.writes.clear();
    this.heapWrites.clear();
  }

  snapshot(line: number | null, say: string): Step {
    const frames: Frame[] = this.frames.map((f) => ({ id: f.id, name: f.name, vars: this.frameVars(f) }));
    const reach: number[] = [];
    const seen = new Set<number>();
    const visit = (v: Val) => {
      if (!(v instanceof Ref) || seen.has(v.id)) return;
      const h = this.heap.get(v.id)!;
      if (h.kind === "function") return;
      seen.add(v.id);
      reach.push(v.id);
      (h.kind === "array" ? h.items : [...h.props.values()]).forEach(visit);
    };
    for (const f of this.frames) for (const b of this.scopeChainVars(f)) visit(b[1].value);
    const heap: HeapObj[] = reach.map((id) => {
      const h = this.heap.get(id)! as Exclude<HeapEntry, { kind: "function" }>;
      return h.kind === "array"
        ? { id, kind: "array", items: h.items.map((v, k) => this.slot(String(k), v)) }
        : { id, kind: "object", items: [...h.props].map(([k, v]) => this.slot(k, v)) };
    });
    return {
      line,
      say,
      memory: [],
      frames,
      heap,
      changed: [...this.writes],
      read: [...this.reads].filter((r) => !this.writes.has(r)),
      changedHeap: [...this.heapWrites],
      output: [...this.output],
    };
  }

  snapshotFrames(): FrameRec[] {
    return this.frames.map((f) => ({ ...f }));
  }

  scopeChainVars(f: FrameRec): [string, Binding][] {
    const chain: Scope[] = [];
    for (let s: Scope | null = f.cur; s; s = s.parent) {
      chain.unshift(s);
      if (s === f.base) break;
    }
    const map = new Map<string, Binding>();
    for (const s of chain) for (const [k, b] of s.vars) map.set(k, b);
    return [...map];
  }

  frameVars(f: FrameRec): Slot[] {
    return this.scopeChainVars(f).map(([k, b]) => ({ ...this.slot(k, b.value), constant: b.kind === "const" || undefined }));
  }

  slot(name: string, v: Val): Slot {
    if (v instanceof Ref) {
      const h = this.heap.get(v.id)!;
      if (h.kind === "function") return { name, value: `ƒ ${h.name}`, type: "function" };
      return { name, value: "", type: "ref", ref: v.id };
    }
    if (typeof v === "number") return { name, value: String(v), type: "number" };
    if (typeof v === "string") return { name, value: JSON.stringify(v), type: "string" };
    if (typeof v === "boolean") return { name, value: String(v), type: "boolean" };
    return { name, value: String(v), type: "none" };
  }

  // ---------- formatting ----------

  show(v: Val, nested = false): string {
    if (v instanceof Ref) {
      const h = this.heap.get(v.id)!;
      if (h.kind === "function") return `ƒ ${h.name}`;
      if (h.kind === "array") return `[${h.items.map((x) => this.show(x, true)).join(", ")}]`;
      return `{ ${[...h.props].map(([k, x]) => `${k}: ${this.show(x, true)}`).join(", ")} }`;
    }
    if (typeof v === "string") return nested ? JSON.stringify(v) : v;
    return String(v);
  }
  q(v: Val) {
    return typeof v === "string" ? JSON.stringify(v) : this.show(v);
  }
  text(node: any) {
    return this.src.slice(node.start, node.end);
  }

  // ---------- scopes ----------

  hoist(body: any[], scope: Scope) {
    for (const s of body) {
      if (s.type === "FunctionDeclaration") {
        scope.vars.set(s.id.name, { value: this.makeFn(s, s.id.name, scope), kind: "function" });
      }
    }
  }

  lookup(name: string): Binding {
    for (let s: Scope | null = this.top.cur; s; s = s.parent) {
      const b = s.vars.get(name);
      if (b) return b;
    }
    // Function frames close over their defining scope; fall back to the global scope.
    const g = this.frames[0].base.vars.get(name);
    if (g) return g;
    throw new JsError("ReferenceError", `${name} is not defined`);
  }

  makeFn(node: any, name: string, closure: Scope): Ref {
    const id = this.nextId++;
    this.heap.set(id, {
      kind: "function",
      name,
      params: node.params,
      body: node.body,
      closure,
      arrow: node.type === "ArrowFunctionExpression" && node.body.type !== "BlockStatement",
      line: node.loc.start.line,
    });
    return new Ref(id);
  }

  alloc(e: HeapEntry): Ref {
    const id = this.nextId++;
    this.heap.set(id, e);
    return new Ref(id);
  }

  withScope<T>(fn: () => T): T {
    const f = this.top;
    const prev = f.cur;
    f.cur = new Scope(prev);
    try {
      return fn();
    } finally {
      f.cur = prev;
    }
  }

  // ---------- statements ----------

  exec(n: any): void {
    const line = n.loc.start.line;
    // Errors point at the statement being run, even before it records a step.
    this.lastLine = line;
    switch (n.type) {
      case "VariableDeclaration": {
        for (const d of n.declarations) {
          if (d.id.type !== "Identifier") throw new Unsupported(NODE_NAMES[d.id.type] ?? d.id.type);
          const name = d.id.name;
          const v = d.init ? this.eval(d.init, name) : undefined;
          if (this.top.cur.vars.has(name) && n.kind !== "var") throw new JsError("SyntaxError", `Identifier '${name}' has already been declared`);
          this.top.cur.vars.set(name, { value: v, kind: n.kind });
          this.writes.add(name);
          const what = v instanceof Ref && this.heap.get(v.id)!.kind !== "function" ? `يشير إلى ${this.heap.get(v.id)!.kind === "array" ? "مصفوفة" : "كائن"} في الكومة` : `= ${this.q(v)}`;
          this.record(line, `أُنشئ ${n.kind === "const" ? "الثابت" : "المتغير"} ${name} ${what}`);
        }
        return;
      }
      case "FunctionDeclaration":
      case "EmptyStatement":
        return;
      case "ExpressionStatement": {
        const e = n.expression;
        const v = this.eval(e);
        this.record(line, this.describe(e, v));
        return;
      }
      case "BlockStatement":
        this.withScope(() => {
          this.hoist(n.body, this.top.cur);
          for (const s of n.body) this.exec(s);
        });
        return;
      case "IfStatement": {
        const t = truthy(this.eval(n.test));
        this.record(line, `الشرط (${this.text(n.test)}) ${t ? "صحيح ← ندخل" : n.alternate ? "خاطئ ← نذهب إلى else" : "خاطئ ← نتجاوزه"}`);
        if (t) this.exec(n.consequent);
        else if (n.alternate) this.exec(n.alternate);
        return;
      }
      case "WhileStatement":
      case "DoWhileStatement": {
        let first = n.type === "DoWhileStatement";
        for (;;) {
          if (!first) {
            const t = truthy(this.eval(n.test));
            this.record(n.type === "WhileStatement" ? line : n.test.loc.start.line, `الشرط (${this.text(n.test)}) ${t ? "صحيح ← جولة جديدة" : "خاطئ ← نخرج من الحلقة"}`);
            if (!t) break;
          }
          first = false;
          const sig = this.loopBody(n.body);
          if (sig === "break") break;
        }
        return;
      }
      case "ForStatement":
        this.withScope(() => {
          if (n.init?.type === "VariableDeclaration") this.exec(n.init);
          else if (n.init) {
            const v = this.eval(n.init);
            this.record(line, this.describe(n.init, v));
          }
          for (;;) {
            if (n.test) {
              const t = truthy(this.eval(n.test));
              this.record(line, `الشرط (${this.text(n.test)}) ${t ? "صحيح ← جولة جديدة" : "خاطئ ← نخرج من الحلقة"}`);
              if (!t) break;
            }
            if (this.loopBody(n.body) === "break") break;
            if (n.update) {
              const v = this.eval(n.update);
              this.record(line, this.describe(n.update, v));
            }
          }
        });
        return;
      case "ForOfStatement": {
        const src = this.eval(n.right);
        const items = this.iterable(src);
        const decl = n.left.type === "VariableDeclaration" ? n.left : null;
        const name = decl ? decl.declarations[0].id.name : n.left.name;
        for (let k = 0; k < items.length; k++) {
          const stop = this.withScope(() => {
            if (decl) this.top.cur.vars.set(name, { value: items[k], kind: decl.kind });
            else this.assignName(name, items[k]);
            this.writes.add(name);
            this.record(line, `الجولة ${k + 1} من ${items.length}: ${name} = ${this.q(items[k])}`);
            return this.loopBody(n.body) === "break";
          });
          if (stop) break;
        }
        this.record(line, "انتهت العناصر ← نخرج من الحلقة");
        return;
      }
      case "ThrowStatement": {
        const v = this.eval(n.argument);
        this.record(line, `throw ← رُمي خطأ: ${this.errorText(v)}. التنفيذ يقفز إلى أقرب catch`);
        throw new Thrown(v);
      }
      case "TryStatement": {
        try {
          this.exec(n.block);
        } catch (e) {
          const caught = e instanceof Thrown ? e.value : e instanceof JsError ? this.errorObject(e.jsName, e.message) : null;
          if (caught === null || !n.handler) throw e;
          this.unwound = undefined;
          this.withScope(() => {
            const p = n.handler.param;
            if (p) {
              if (p.type !== "Identifier") throw new Unsupported(NODE_NAMES[p.type] ?? p.type);
              this.top.cur.vars.set(p.name, { value: caught, kind: "let" });
              this.writes.add(p.name);
            }
            this.record(n.handler.loc.start.line, `التُقط الخطأ (${this.errorText(caught)}) ← ندخل catch بدل أن يتوقف البرنامج`);
            for (const s of n.handler.body.body) this.exec(s);
          });
        } finally {
          if (n.finalizer) {
            this.record(n.finalizer.loc.start.line, "finally تعمل دائماً، حدث خطأ أم لا");
            this.exec(n.finalizer);
          }
        }
        return;
      }
      case "BreakStatement":
        this.record(line, "break ← خروج فوري");
        throw new BreakSig();
      case "ContinueStatement":
        this.record(line, "continue ← نتخطى باقي الجولة");
        throw new ContinueSig();
      case "ReturnStatement": {
        const v = n.argument ? this.eval(n.argument) : undefined;
        this.record(line, `${this.top.name} تُرجع ${this.q(v)}`);
        throw new ReturnSig(v);
      }
      case "SwitchStatement": {
        const d = this.eval(n.discriminant);
        let idx = n.cases.findIndex((c: any) => c.test && this.strictEq(this.eval(c.test), d));
        const matched = idx >= 0;
        if (!matched) idx = n.cases.findIndex((c: any) => !c.test);
        this.record(line, `switch: ${this.text(n.discriminant)} = ${this.q(d)}${idx < 0 ? " ← لا يطابق أي حالة" : ""}`);
        if (idx < 0) return;
        const c0 = n.cases[idx];
        this.record(c0.loc.start.line, matched ? `يطابق case ${this.text(c0.test)} ← نبدأ من هنا` : "لا يوجد تطابق ← default");
        try {
          this.withScope(() => {
            for (let k = idx; k < n.cases.length; k++) for (const s of n.cases[k].consequent) this.exec(s);
          });
        } catch (e) {
          if (!(e instanceof BreakSig)) throw e;
        }
        return;
      }
      default:
        throw new Unsupported(NODE_NAMES[n.type] ?? n.type);
    }
  }

  loopBody(body: any): "break" | "next" {
    try {
      this.exec(body);
    } catch (e) {
      if (e instanceof BreakSig) return "break";
      if (e instanceof ContinueSig) return "next";
      throw e;
    }
    return "next";
  }

  iterable(v: Val): Val[] {
    if (typeof v === "string") return [...v];
    if (v instanceof Ref) {
      const h = this.heap.get(v.id)!;
      if (h.kind === "array") return [...h.items];
    }
    throw new JsError("TypeError", `${this.show(v)} is not iterable`);
  }

  describe(e: any, v?: Val): string {
    if (e.type === "CallExpression") {
      const c = e.callee;
      if (c.type === "MemberExpression" && c.object.name === "console") return `طُبع على الشاشة: ${this.output[this.output.length - 1] ?? ""}`;
      if (c.type === "MemberExpression" && !c.computed && ["push", "pop", "shift", "unshift"].includes(c.property.name))
        return `${this.text(c.object)}.${c.property.name}() غيّرت المصفوفة في الكومة`;
      return `انتهى ${this.text(e)}${v !== undefined ? ` وأرجع ${this.q(v)}` : ""}`;
    }
    if (e.type === "AssignmentExpression" || e.type === "UpdateExpression") {
      const target = e.type === "AssignmentExpression" ? e.left : e.argument;
      return `${this.text(target)} صار ${this.q(this.eval(target, undefined, true))}`;
    }
    return `نُفّذ: ${this.text(e)}`;
  }

  // ---------- expressions ----------

  eval(n: any, nameHint?: string, silent = false): Val {
    switch (n.type) {
      case "Literal":
        if (n.regex) throw new Unsupported("التعابير النمطية");
        return n.value as Val;
      case "Identifier": {
        if (n.name === "undefined") return undefined;
        if (n.name === "NaN") return NaN;
        if (n.name === "Infinity") return Infinity;
        const b = this.lookup(n.name);
        if (!silent) this.reads.add(n.name);
        return b.value;
      }
      case "TemplateLiteral": {
        let s = "";
        n.quasis.forEach((q: any, k: number) => {
          s += q.value.cooked;
          if (k < n.expressions.length) s += this.show(this.eval(n.expressions[k]));
        });
        return s;
      }
      case "ArrayExpression":
        return this.alloc({
          kind: "array",
          items: n.elements.map((el: any) => {
            if (!el || el.type === "SpreadElement") throw new Unsupported(NODE_NAMES.SpreadElement);
            return this.eval(el);
          }),
        });
      case "ObjectExpression": {
        const props = new Map<string, Val>();
        for (const p of n.properties) {
          if (p.type !== "Property" || p.computed) throw new Unsupported(NODE_NAMES.SpreadElement);
          const key = p.key.type === "Identifier" ? p.key.name : String(p.key.value);
          props.set(key, this.eval(p.value, key));
        }
        return this.alloc({ kind: "object", props });
      }
      case "FunctionExpression":
      case "ArrowFunctionExpression":
        return this.makeFn(n, n.id?.name ?? nameHint ?? "دالة", this.top.cur);
      case "UnaryExpression": {
        if (n.operator === "typeof" && n.argument.type === "Identifier") {
          try {
            this.lookup(n.argument.name);
          } catch {
            return "undefined";
          }
        }
        const v = this.eval(n.argument);
        switch (n.operator) {
          case "!": return !truthy(v);
          case "-": return -(this.prim(v) as number);
          case "+": return +(this.prim(v) as number);
          case "typeof": return v instanceof Ref ? (this.heap.get(v.id)!.kind === "function" ? "function" : "object") : v === null ? "object" : typeof v;
        }
        throw new Unsupported(`العامل ${n.operator}`);
      }
      case "BinaryExpression":
        return this.binary(n.operator, this.eval(n.left), this.eval(n.right));
      case "LogicalExpression": {
        const l = this.eval(n.left);
        if (n.operator === "&&") return truthy(l) ? this.eval(n.right) : l;
        if (n.operator === "||") return truthy(l) ? l : this.eval(n.right);
        return l === null || l === undefined ? this.eval(n.right) : l;
      }
      case "ConditionalExpression":
        return truthy(this.eval(n.test)) ? this.eval(n.consequent) : this.eval(n.alternate);
      case "AssignmentExpression": {
        let v = this.eval(n.right, n.left.type === "Identifier" ? n.left.name : undefined);
        if (n.operator !== "=") v = this.binary(n.operator.slice(0, -1), this.eval(n.left, undefined, true), v);
        this.assign(n.left, v);
        return v;
      }
      case "UpdateExpression": {
        const old = this.prim(this.eval(n.argument, undefined, true)) as number;
        const nv = n.operator === "++" ? old + 1 : old - 1;
        this.assign(n.argument, nv);
        return n.prefix ? nv : old;
      }
      case "MemberExpression":
        return this.member(this.eval(n.object), this.propKey(n));
      case "CallExpression":
        return this.call(n);
      case "NewExpression": {
        if (n.callee.type === "Identifier" && /^(Error|TypeError|RangeError|SyntaxError|ReferenceError)$/.test(n.callee.name)) {
          const msg = n.arguments[0] ? this.show(this.eval(n.arguments[0])) : "";
          return this.errorObject(n.callee.name, msg);
        }
        throw new Unsupported(NODE_NAMES.NewExpression);
      }
      default:
        throw new Unsupported(NODE_NAMES[n.type] ?? n.type);
    }
  }

  errorObject(name: string, message: string): Ref {
    return this.alloc({ kind: "object", props: new Map<string, Val>([["name", name], ["message", message]]) });
  }

  /** "Error: message" for error objects, the plain value otherwise. */
  errorText(v: Val): string {
    if (v instanceof Ref) {
      const h = this.heap.get(v.id)!;
      if (h.kind === "object" && h.props.has("message")) return `${this.show(h.props.get("name") ?? "Error")}: ${this.show(h.props.get("message"))}`;
    }
    return this.show(v);
  }

  prim(v: Val): Exclude<Val, Ref> {
    return v instanceof Ref ? this.show(v) : v;
  }

  strictEq(a: Val, b: Val) {
    if (a instanceof Ref || b instanceof Ref) return a instanceof Ref && b instanceof Ref && a.id === b.id;
    return a === b;
  }

  binary(op: string, l: Val, r: Val): Val {
    if (op === "===") return this.strictEq(l, r);
    if (op === "!==") return !this.strictEq(l, r);
    if ((op === "==" || op === "!=") && l instanceof Ref && r instanceof Ref) return (op === "==") === (l.id === r.id);
    const a: any = this.prim(l);
    const b: any = this.prim(r);
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return a / b;
      case "%": return a % b;
      case "**": return a ** b;
      case "==": return a == b;
      case "!=": return a != b;
      case "<": return a < b;
      case "<=": return a <= b;
      case ">": return a > b;
      case ">=": return a >= b;
    }
    throw new Unsupported(`العامل ${op}`);
  }

  propKey(n: any): string | number {
    if (!n.computed) return n.property.name;
    const k = this.eval(n.property);
    return typeof k === "number" ? k : String(this.prim(k));
  }

  member(obj: Val, key: string | number): Val {
    if (typeof obj === "string") {
      if (key === "length") return obj.length;
      if (typeof key === "number") return obj[key];
      return undefined;
    }
    if (obj instanceof Ref) {
      const h = this.heap.get(obj.id)!;
      if (h.kind === "array") {
        if (key === "length") return h.items.length;
        const i = typeof key === "number" ? key : Number(key);
        return Number.isInteger(i) ? h.items[i] : undefined;
      }
      if (h.kind === "object") return h.props.get(String(key));
      return undefined;
    }
    if (obj === null || obj === undefined) throw new JsError("TypeError", `Cannot read properties of ${obj} (reading '${key}')`);
    return undefined;
  }

  assignName(name: string, v: Val) {
    const b = this.lookup(name);
    if (b.kind === "const") throw new JsError("TypeError", "Assignment to constant variable.");
    b.value = v;
    this.writes.add(name);
  }

  assign(target: any, v: Val) {
    if (target.type === "Identifier") return this.assignName(target.name, v);
    if (target.type === "MemberExpression") {
      const obj = this.eval(target.object);
      const key = this.propKey(target);
      if (!(obj instanceof Ref)) throw new JsError("TypeError", `Cannot set properties of ${this.show(obj)}`);
      const h = this.heap.get(obj.id)!;
      if (h.kind === "array") {
        if (key === "length") h.items.length = Number(v);
        else h.items[Number(key)] = v;
        for (let i = 0; i < h.items.length; i++) if (!(i in h.items)) h.items[i] = undefined;
      } else if (h.kind === "object") h.props.set(String(key), v);
      this.heapWrites.add(obj.id);
      return;
    }
    throw new Unsupported(NODE_NAMES[target.type] ?? target.type);
  }

  args(n: any): Val[] {
    return n.arguments.map((a: any) => {
      if (a.type === "SpreadElement") throw new Unsupported(NODE_NAMES.SpreadElement);
      return this.eval(a);
    });
  }

  call(n: any): Val {
    const c = n.callee;
    if (c.type === "MemberExpression" && c.object.type === "Identifier" && !c.computed) {
      const o = c.object.name;
      const m = c.property.name;
      if (o === "console" && ["log", "info", "warn", "error"].includes(m)) {
        this.output.push(this.args(n).map((v) => this.show(v)).join(" "));
        return undefined;
      }
      if (o === "Math") return mathCall(m, this.args(n).map((v) => this.prim(v) as number));
    }
    if (c.type === "Identifier" && ["String", "Number", "Boolean", "parseInt", "parseFloat"].includes(c.name)) {
      let shadow = false;
      try { this.lookup(c.name); shadow = true; } catch {}
      if (!shadow) {
        const a = this.prim(this.args(n)[0]);
        return c.name === "String" ? String(a) : c.name === "Number" ? Number(a) : c.name === "Boolean" ? Boolean(a) : c.name === "parseInt" ? parseInt(String(a)) : parseFloat(String(a));
      }
    }
    if (c.type === "MemberExpression") {
      const obj = this.eval(c.object);
      const m = c.computed ? String(this.propKey(c)) : c.property.name;
      const fnVal = obj instanceof Ref && this.heap.get(obj.id)!.kind === "object" ? (this.heap.get(obj.id) as any).props.get(m) : undefined;
      if (fnVal instanceof Ref) return this.invoke(fnVal, this.args(n), `${this.text(c.object)}.${m}`);
      return this.method(obj, m, this.args(n));
    }
    const fn = this.eval(c);
    return this.invoke(fn, this.args(n), this.text(c));
  }

  method(obj: Val, m: string, a: Val[]): Val {
    if (typeof obj === "string") {
      switch (m) {
        case "toUpperCase": return obj.toUpperCase();
        case "toLowerCase": return obj.toLowerCase();
        case "trim": return obj.trim();
        case "includes": return obj.includes(String(a[0]));
        case "indexOf": return obj.indexOf(String(a[0]));
        case "slice": return obj.slice(a[0] as number, a[1] as number | undefined);
        case "repeat": return obj.repeat(a[0] as number);
        case "split": return this.alloc({ kind: "array", items: obj.split(String(a[0] ?? "")) });
      }
    }
    if (typeof obj === "number" && m === "toFixed") return obj.toFixed(a[0] as number);
    if (obj instanceof Ref) {
      const h = this.heap.get(obj.id)!;
      if (h.kind === "array") {
        const mark = () => this.heapWrites.add(obj.id);
        switch (m) {
          case "push": mark(); return h.items.push(...a);
          case "pop": mark(); return h.items.pop();
          case "shift": mark(); return h.items.shift();
          case "unshift": mark(); return h.items.unshift(...a);
          case "includes": return h.items.some((x) => this.strictEq(x, a[0]));
          case "indexOf": return h.items.findIndex((x) => this.strictEq(x, a[0]));
          case "join": return h.items.map((x) => (x === null || x === undefined ? "" : this.show(x))).join(a[0] === undefined ? "," : String(a[0]));
          case "slice": return this.alloc({ kind: "array", items: h.items.slice(a[0] as number, a[1] as number | undefined) });
          case "reverse": mark(); h.items.reverse(); return obj;
        }
      }
    }
    throw new Unsupported(`الدالة .${m}()`);
  }

  invoke(fn: Val, args: Val[], label: string): Val {
    const h = fn instanceof Ref ? this.heap.get(fn.id) : undefined;
    if (!h || h.kind !== "function") throw new JsError("TypeError", `${label} is not a function`);
    if (this.frames.length >= MAX_DEPTH) throw new JsError("RangeError", "Maximum call stack size exceeded");
    const scope = new Scope(h.closure);
    h.params.forEach((p: any, k: number) => {
      if (p.type === "Identifier") scope.vars.set(p.name, { value: args[k], kind: "param" });
      else if (p.type === "AssignmentPattern" && p.left.type === "Identifier") {
        scope.vars.set(p.left.name, { value: args[k] === undefined ? this.eval(p.right) : args[k], kind: "param" });
      } else throw new Unsupported(NODE_NAMES[p.type] ?? p.type);
    });
    this.frames.push({ id: this.frameSeq++, name: h.name, base: scope, cur: scope });
    for (const p of h.params) this.writes.add(p.type === "Identifier" ? p.name : p.left.name);
    this.record(h.line, `استدعاء ${h.name}(${args.map((v) => this.q(v)).join(", ")}) ← إطار جديد فوق المكدّس`);
    let result: Val = undefined;
    try {
      if (h.arrow) {
        result = this.eval(h.body);
        this.record(h.line, `${h.name} تُرجع ${this.q(result)}`);
      } else {
        this.hoist(h.body.body, scope);
        for (const s of h.body.body) this.exec(s);
      }
    } catch (e) {
      if (!(e instanceof ReturnSig)) {
        // A thrown error unwinds this frame on its way to a catch; if nothing catches it,
        // the final step shows the frames as they were when it was thrown.
        if ((e instanceof Thrown || e instanceof JsError) && this.frames.length > 1) {
          this.unwound ??= this.snapshotFrames();
          this.frames.pop();
        }
        throw e;
      }
      result = e.value;
    }
    this.frames.pop();
    return result;
  }
}

function truthy(v: Val) {
  return v instanceof Ref ? true : !!v;
}

function mathCall(m: string, a: number[]): number {
  switch (m) {
    case "floor": return Math.floor(a[0]);
    case "ceil": return Math.ceil(a[0]);
    case "round": return Math.round(a[0]);
    case "abs": return Math.abs(a[0]);
    case "sqrt": return Math.sqrt(a[0]);
    case "pow": return Math.pow(a[0], a[1]);
    case "max": return Math.max(...a);
    case "min": return Math.min(...a);
    case "random": return Math.random();
  }
  throw new Unsupported(`Math.${m}`);
}
