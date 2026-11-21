// Runs Go, Rust and Dart programs with the local toolchains, for the lesson and project validators.
// Each program runs in a fresh temp folder; returns { out, error } like the other runners.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

export const NATIVE = ["go", "rust", "dart"];

// On Windows, Smart App Control blocks the freshly built Go/Rust programs, so local checks skip running
// them; CI (.github/workflows/check.yml, Linux) runs everything. FAAHEM_NATIVE=1 forces local runs.
export const SKIP_NATIVE = process.platform === "win32" && !process.env.FAAHEM_NATIVE ? ["go", "rust"] : [];
if (SKIP_NATIVE.length) console.log("(Go and Rust programs are not run on Windows; CI runs them. FAAHEM_NATIVE=1 to force.)");

// Where winget/rustup put the toolchains, in case this shell's PATH predates the install.
const sep = process.platform === "win32" ? ";" : ":";
const extra = process.platform === "win32" ? ["C:\\Program Files\\Go\\bin", join(homedir(), ".cargo", "bin"), "C:\\flutter\\bin\\cache\\dart-sdk\\bin"] : [join(homedir(), ".cargo", "bin"), "/usr/local/go/bin"];
const env = { ...process.env, PATH: [...extra, process.env.PATH ?? process.env.Path ?? ""].join(sep) };
delete env.Path;

function exec(cmd, args, cwd) {
  try {
    return { out: execFileSync(cmd, args, { cwd, env, encoding: "utf8", timeout: 60_000, stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    return { out: e.stdout ?? "", error: (e.stderr || e.message || "").toString().trim().split("\n").slice(0, 6).join("\n") };
  }
}

// Windows Smart App Control sometimes blocks a freshly built temp .exe; a second try usually passes.
// It shows up as "Application Control policy" or as spawnSync failing with UNKNOWN.
const BLOCKED = /Application Control policy|blocked this file|spawnSync .* UNKNOWN/i;

export function runNative(lang, code) {
  let r;
  for (let attempt = 0; attempt < 6; attempt++) {
    r = runOnce(lang, code);
    if (!r.error || !BLOCKED.test(r.error)) break;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500 * (attempt + 1));
  }
  return r;
}

/** Compiles without running (no Smart App Control prompt). Returns the compiler's error, or null. */
export function compileNative(lang, code) {
  const dir = mkdtempSync(join(tmpdir(), "faahem-"));
  try {
    if (lang === "go") {
      writeFileSync(join(dir, "main.go"), code);
      return exec("go", ["vet", "main.go"], dir).error || null;
    }
    if (lang === "rust") {
      writeFileSync(join(dir, "main.rs"), code);
      return exec("rustc", ["--edition", "2021", "-A", "warnings", "--emit=metadata", "main.rs"], dir).error || null;
    }
    return runOnce(lang, code).error || null;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function runOnce(lang, code) {
  const dir = mkdtempSync(join(tmpdir(), "faahem-"));
  try {
    let r;
    if (lang === "go") {
      writeFileSync(join(dir, "main.go"), code);
      r = exec("go", ["run", "main.go"], dir);
    } else if (lang === "rust") {
      writeFileSync(join(dir, "main.rs"), code);
      const c = exec("rustc", ["--edition", "2021", "-A", "warnings", "main.rs", "-o", "main.exe"], dir);
      r = c.error ? c : exec(join(dir, "main.exe"), [], dir);
    } else {
      writeFileSync(join(dir, "main.dart"), code);
      r = exec("dart", ["run", "main.dart"], dir);
    }
    return { out: r.out.replace(/\r/g, "").trim(), error: r.error || undefined };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
