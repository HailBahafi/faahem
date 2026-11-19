"use client";

import { motion } from "motion/react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

/** A simulated SSH session: a laptop, a far-away server, three services and one file with the wrong permissions. */

type SvcName = "shop" | "nginx" | "postgresql";
interface Svc {
  user: string;
  cmd: string;
  status: "active" | "failed" | "inactive";
  pid: number | null;
}
interface Line {
  kind: "cmd" | "out" | "err" | "note";
  text: string;
  prompt?: string;
}
interface State {
  remote: boolean;
  cwd: string;
  svcs: Record<SvcName, Svc>;
  mode: string;
  logs: string[];
  nextPid: number;
  clock: number;
  lines: Line[];
  readLogs: boolean;
}

const CONFIG = "/srv/shop/config.json";
const DIRS = ["/", "/home", "/home/sara", "/srv", "/srv/shop", "/var", "/var/log"];
const FILES: Record<string, string> = { [CONFIG]: '{ "port": 3000, "db": "postgres://db/shop" }', "/srv/shop/server.js": "// the shop", "/var/log/shop.log": "" };

const fresh = (): State => ({
  remote: false,
  cwd: "/home/sara",
  svcs: {
    shop: { user: "www", cmd: "node server.js", status: "failed", pid: null },
    nginx: { user: "www", cmd: "nginx", status: "active", pid: 812 },
    postgresql: { user: "postgres", cmd: "postgres", status: "active", pid: 977 },
  },
  mode: "rw-------",
  logs: [
    "09:12:01 shop[4301]: starting shop",
    `09:12:01 shop[4301]: Error: EACCES: permission denied, open '${CONFIG}'`,
    "09:12:01 systemd: shop.service: Main process exited, status=1",
    "09:12:06 systemd: shop.service: restarted 5 times, giving up",
    "09:12:06 systemd: shop.service: Failed with result 'exit-code'",
  ],
  nextPid: 4377,
  clock: 40,
  lines: [],
  readLogs: false,
});

const wwwCanRead = (mode: string) => mode[6] === "r";
const othersWrite = (mode: string) => mode[7] === "w";
const digit = (d: number) => (d & 4 ? "r" : "-") + (d & 2 ? "w" : "-") + (d & 1 ? "x" : "-");

/** Applies a chmod mode ("644" or "o+r", "a-w", "u=rw") to a 9-letter permission string. */
function chmod(mode: string, spec: string): string | null {
  if (/^[0-7]{3}$/.test(spec)) return spec.split("").map((c) => digit(Number(c))).join("");
  const m = /^([ugoa]*)([+\-=])([rwx]+)$/.exec(spec);
  if (!m) return null;
  const who = (m[1] || "a").replace("a", "ugo");
  const out = mode.split("");
  ["u", "g", "o"].forEach((w, k) => {
    if (!who.includes(w)) return;
    "rwx".split("").forEach((p, i) => {
      const on = m[3].includes(p);
      if (m[2] === "+" && on) out[k * 3 + i] = p;
      if (m[2] === "-" && on) out[k * 3 + i] = "-";
      if (m[2] === "=") out[k * 3 + i] = on ? p : "-";
    });
  });
  return out.join("");
}

function resolve(cwd: string, p: string) {
  const parts = (p.startsWith("/") ? p : `${cwd}/${p}`).split("/");
  const stack: string[] = [];
  for (const x of parts) {
    if (!x || x === ".") continue;
    if (x === "..") stack.pop();
    else stack.push(x);
  }
  return "/" + stack.join("/");
}

const time = (c: number) => `09:${String(c).padStart(2, "0")}:00`;

function exec(st: State, input: string): State {
  const prompt = st.remote ? `sara@shop-server:${st.cwd.replace("/home/sara", "~")}$` : "sara@laptop:~$";
  const lines: Line[] = [...st.lines, { kind: "cmd", text: input.trim(), prompt }];
  const out = (text: string) => lines.push({ kind: "out", text });
  const err = (text: string) => lines.push({ kind: "err", text });
  const note = (text: string) => lines.push({ kind: "note", text });
  let words = input.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return { ...st, lines };
  const root = words[0] === "sudo";
  if (root) words = words.slice(1);
  const [prog, ...args] = words;
  const s: State = { ...st, svcs: { ...st.svcs }, logs: [...st.logs], lines };
  const log = (t: string) => { s.logs.push(`${time(s.clock)} ${t}`); s.clock++; };

  /** systemd starts a service: a new process with a new PID, if it can read what it needs. */
  const start = (name: SvcName) => {
    const pid = s.nextPid;
    s.nextPid += 7;
    if (name === "shop" && !wwwCanRead(s.mode)) {
      log(`shop[${pid}]: Error: EACCES: permission denied, open '${CONFIG}'`);
      log("systemd: shop.service: Failed with result 'exit-code'");
      s.svcs.shop = { ...s.svcs.shop, status: "failed", pid: null };
      return false;
    }
    if (name === "shop") log(`shop[${pid}]: listening on :3000`);
    s.svcs[name] = { ...s.svcs[name], status: "active", pid };
    return true;
  };

  if (prog === "clear") return { ...st, lines: [] };
  if (prog === "help") {
    out(st.remote ? "ps  kill PID  systemctl status|restart|stop NAME  journalctl -u NAME  tail FILE  ls -l PATH  cat FILE  chmod MODE FILE  cd  pwd  whoami  sudo CMD  exit" : "ssh sara@shop-server  (connect to the server)");
    return s;
  }
  if (!st.remote) {
    if (prog === "ssh") {
      if (!args[0] || !args[0].includes("@")) { err("usage: ssh user@host"); return s; }
      out("Welcome to Ubuntu 24.04 LTS (shop-server)");
      note("from now on every command runs on the server, not on your laptop");
      return { ...s, remote: true, cwd: "/home/sara" };
    }
    if (prog === "whoami") { out("sara"); return s; }
    if (prog === "pwd") { out("/home/sara"); return s; }
    err(`${prog}: this is your laptop. The shop runs on the server: ssh sara@shop-server`);
    return s;
  }

  const svcArg = (a?: string) => (a ?? "").replace(/\.service$/, "") as SvcName;
  switch (prog) {
    case "exit":
      out("Connection to shop-server closed.");
      return { ...s, remote: false, cwd: "/home/sara" };
    case "whoami":
      out(root ? "root" : "sara");
      break;
    case "pwd":
      out(s.cwd);
      break;
    case "cd": {
      const p = resolve(s.cwd, args[0] ?? "/home/sara");
      if (DIRS.includes(p)) s.cwd = p;
      else err(`cd: ${args[0]}: No such file or directory`);
      break;
    }
    case "ps":
    case "top":
      out("USER      PID  COMMAND");
      out("root        1  systemd");
      for (const v of Object.values(s.svcs)) if (v.pid) out(`${v.user.padEnd(9)}${String(v.pid).padStart(4)}  ${v.cmd}`);
      out(`sara     ${String(s.nextPid - 3).padStart(4)}  ${prog}`);
      break;
    case "kill": {
      const pid = Number(args.find((a) => !a.startsWith("-")));
      if (pid === 1) { err("kill: (1) - Operation not permitted"); break; }
      const entry = (Object.entries(s.svcs) as [SvcName, Svc][]).find(([, v]) => v.pid === pid);
      if (!entry) { err(`kill: (${args[0] ?? ""}) - No such process`); break; }
      if (!root) { err(`kill: (${pid}) - Operation not permitted (it belongs to ${entry[1].user}; try sudo)`); break; }
      log(`systemd: ${entry[0]}.service: Main process ${pid} killed, restarting`);
      if (start(entry[0])) note(`systemd restarted ${entry[0]} right away: new PID ${s.svcs[entry[0]].pid}`);
      break;
    }
    case "systemctl": {
      const [verb, name0] = args;
      const name = svcArg(name0);
      if (!s.svcs[name]) { err(`Unit ${name0 ?? ""}.service could not be found.`); break; }
      const v = s.svcs[name];
      if (verb === "status") {
        out(`● ${name}.service - ${v.status === "active" ? "active (running)" : v.status}`);
        if (v.pid) out(`   Main PID: ${v.pid} (${v.cmd})`);
        if (name === "shop") s.logs.slice(-2).forEach((l) => out("   " + l));
      } else if (["restart", "start", "stop"].includes(verb)) {
        if (!root) { err(`Failed to ${verb} ${name}.service: Access denied (try sudo)`); break; }
        if (verb === "stop") { s.svcs[name] = { ...v, status: "inactive", pid: null }; log(`systemd: Stopped ${name}.service`); }
        else if (!start(name)) err(`Job for ${name}.service failed. See "journalctl -u ${name}" for details.`);
      } else err(`systemctl: unknown command ${verb ?? ""}`);
      break;
    }
    case "journalctl": {
      const u = args.indexOf("-u");
      const name = svcArg(u >= 0 ? args[u + 1] : "shop");
      const n = args.indexOf("-n") >= 0 ? Number(args[args.indexOf("-n") + 1]) || 5 : 5;
      if (name !== "shop") { out(`${time(1)} ${name}: running normally`); break; }
      s.logs.slice(-n).forEach(out);
      s.readLogs = true;
      break;
    }
    case "tail": {
      const f = resolve(s.cwd, args.find((a) => !a.startsWith("-")) ?? "");
      if (f !== "/var/log/shop.log") { err(`tail: cannot open '${f}'`); break; }
      s.logs.slice(-5).forEach(out);
      if (args.includes("-f")) note("tail -f keeps following: new lines appear as they are written");
      s.readLogs = true;
      break;
    }
    case "ls": {
      const long = args.includes("-l");
      const p = resolve(s.cwd, args.find((a) => !a.startsWith("-")) ?? ".");
      const row = (f: string) => (f === CONFIG ? `-${s.mode} 1 root root config.json` : `-rw-r--r-- 1 root root ${f.slice(f.lastIndexOf("/") + 1)}`);
      if (p in FILES) out(long ? row(p) : p.slice(p.lastIndexOf("/") + 1));
      else if (DIRS.includes(p)) {
        const up = (x: string) => x.slice(0, x.lastIndexOf("/")) || "/";
        const kids = [...DIRS.filter((d) => d !== "/" && up(d) === p), ...Object.keys(FILES).filter((f) => up(f) === p)];
        if (long) kids.forEach((k) => out(k in FILES ? row(k) : `drwxr-xr-x 2 root root ${k.slice(k.lastIndexOf("/") + 1)}`));
        else out(kids.map((k) => k.slice(k.lastIndexOf("/") + 1)).join("  "));
      } else err(`ls: cannot access '${args.find((a) => !a.startsWith("-"))}': No such file or directory`);
      break;
    }
    case "cat": {
      const p = resolve(s.cwd, args[0] ?? "");
      if (!(p in FILES)) { err(`cat: ${args[0] ?? ""}: No such file or directory`); break; }
      if (p === CONFIG && !root && !wwwCanRead(s.mode)) { err(`cat: ${args[0]}: Permission denied`); break; }
      out(p === "/var/log/shop.log" ? s.logs.slice(-3).join("\n") : FILES[p]);
      break;
    }
    case "chmod": {
      const [spec, file] = args;
      const p = resolve(s.cwd, file ?? "");
      if (!spec || !file) { err("usage: chmod MODE FILE   (e.g. chmod 644 config.json)"); break; }
      if (!(p in FILES)) { err(`chmod: cannot access '${file}': No such file or directory`); break; }
      if (!root) { err(`chmod: changing permissions of '${file}': Operation not permitted (owner is root; try sudo)`); break; }
      if (p !== CONFIG) break;
      const m = chmod(s.mode, spec);
      if (!m) { err(`chmod: invalid mode: '${spec}'`); break; }
      s.mode = m;
      break;
    }
    default:
      err(`${prog}: command not found`);
  }
  return s;
}

const CHIPS_LOCAL = ["ssh sara@shop-server"];
const CHIPS_REMOTE = ["ps", "systemctl status shop", "journalctl -u shop", "ls -l /srv/shop", "sudo chmod 644 /srv/shop/config.json", "sudo systemctl restart shop", "sudo kill 812", "exit"];

export default function LinuxProblem() {
  const [st, setSt] = useState<State>(fresh);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }); }, [st.lines]);

  function submit() {
    setSt((s) => exec(s, input));
    if (input.trim()) setHist((h) => [...h, input.trim()]);
    setInput("");
    setHi(-1);
  }
  function key(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
    else if (e.key === "ArrowUp" && hist.length) {
      e.preventDefault();
      const k = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1);
      setHi(k);
      setInput(hist[k]);
    } else if (e.key === "ArrowDown" && hi >= 0) {
      e.preventDefault();
      const k = hi + 1;
      if (k >= hist.length) { setHi(-1); setInput(""); } else { setHi(k); setInput(hist[k]); }
    }
  }

  const tasks = [
    { label: "ادخل إلى الخادم بـ ssh", done: st.remote || st.readLogs },
    { label: "اقرأ سجل الخدمة shop", done: st.readLogs },
    { label: "اجعل www يقرأ config.json", done: wwwCanRead(st.mode) },
    { label: "أعد تشغيل shop حتى تعمل", done: st.svcs.shop.status === "active" },
  ];
  const prompt = st.remote ? `sara@shop-server:${st.cwd.replace("/home/sara", "~")}$` : "sara@laptop:~$";

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-code" dir="ltr" onClick={() => field.current?.focus()}>
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-err/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-num/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-ok/70" />
            <motion.span key={String(st.remote)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`code ms-2 text-xs ${st.remote ? "text-ok" : "text-code-fg/50"}`}>
              {st.remote ? "ssh: connected to shop-server (203.0.113.10)" : "your laptop"}
            </motion.span>
          </div>
          <div ref={box} className="code h-80 overflow-y-auto p-3 text-sm leading-6 text-code-fg">
            {st.lines.length === 0 && <div className="text-code-fg/40">you are on your laptop. Connect: ssh sara@shop-server</div>}
            {st.lines.map((l, k) => (
              <div key={k} className={l.kind === "err" ? "text-err" : l.kind === "note" ? "text-num" : l.kind === "out" ? "text-code-fg/80" : ""}>
                {l.kind === "cmd" ? (
                  <><span className="text-ok">{l.prompt}</span> {l.text}</>
                ) : (
                  <span className="whitespace-pre-wrap">{l.kind === "note" ? "# " : ""}{l.text}</span>
                )}
              </div>
            ))}
            <div className="flex">
              <span className="text-ok">{prompt}</span>&nbsp;
              <input ref={field} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={key} spellCheck={false} autoCapitalize="off" autoComplete="off" aria-label="command" className="flex-1 bg-transparent text-code-fg outline-none" />
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border border-line bg-surface p-4 transition-opacity ${st.remote ? "" : "opacity-50"}`}>
          <div className="font-semibold">الخادم <span className="text-sm font-normal text-muted">(ما يعرفه systemd)</span></div>
          <div className="code mt-3 space-y-1.5 text-sm" dir="ltr">
            {(Object.entries(st.svcs) as [SvcName, Svc][]).map(([n, v]) => (
              <div key={n} className="flex items-center gap-2 rounded-lg bg-surface-2 px-2 py-1">
                <motion.span animate={{ scale: v.status === "active" ? [1, 1.4, 1] : 1 }} transition={{ repeat: v.status === "active" ? Infinity : 0, duration: 1.6 }} className={`h-2.5 w-2.5 rounded-full ${v.status === "active" ? "bg-ok" : v.status === "failed" ? "bg-err" : "bg-muted"}`} />
                <span className="font-semibold">{n}</span>
                <span className="text-muted">{v.user}</span>
                <motion.span key={v.pid ?? "none"} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="ms-auto text-num">{v.pid ? `PID ${v.pid}` : v.status}</motion.span>
              </div>
            ))}
          </div>

          <div className="mt-4 font-semibold">config.json <span className="text-sm font-normal text-muted">(المالك root)</span></div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs" dir="ltr">
            {["owner: root", "group: root", "others"].map((who, k) => (
              <div key={who} className={`rounded-lg border p-1.5 ${k === 2 ? "border-accent" : "border-line"}`}>
                <div className="text-muted">{who}</div>
                <div className="code mt-1 flex justify-center gap-1">
                  {st.mode.slice(k * 3, k * 3 + 3).split("").map((c, i) => (
                    <motion.span key={i + c} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className={`w-5 rounded ${c === "-" ? "bg-surface-2 text-muted" : i === 1 && k > 0 ? "bg-err/20 text-err" : "bg-ok/20 text-ok"}`}>{c}</motion.span>
                  ))}
                </div>
                {k === 2 && <div className="mt-1 text-accent">www</div>}
              </div>
            ))}
          </div>
          {othersWrite(st.mode) && <p className="mt-2 text-xs text-err">كل مستخدم على الخادم يستطيع الآن تعديل هذا الملف!</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
        {(st.remote ? CHIPS_REMOTE : CHIPS_LOCAL).map((c) => (
          <button key={c} onClick={() => { setInput(c); field.current?.focus(); }} className="code rounded-lg border border-line bg-surface px-2.5 py-1 text-xs hover:border-accent">{c}</button>
        ))}
        <button onClick={() => { setSt(fresh()); setHist([]); }} className="ms-auto text-sm text-muted hover:text-fg" dir="rtl">ابدأ من جديد</button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {tasks.map((t, k) => (
          <motion.div key={k} animate={{ scale: t.done ? [1, 1.04, 1] : 1 }} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${t.done ? "border-ok/50 bg-ok/10" : "border-line bg-surface"}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${t.done ? "bg-ok text-white" : "bg-surface-2 text-muted"}`}>{t.done ? "✓" : k + 1}</span>
            {t.label}
          </motion.div>
        ))}
      </div>

      {tasks.every((t) => t.done) && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          الخدمة تعمل كمستخدم <b className="text-fg">www</b>، وهو من «البقية» في صلاحيات الملف، فلم يكن يقرؤه. جرّب الآن <span className="code" dir="ltr">sudo kill</span> على رقم shop: سيعيدها systemd برقم جديد.
        </motion.p>
      )}
    </div>
  );
}
