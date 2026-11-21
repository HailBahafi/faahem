// Python source run inside Pyodide (and by the lesson validator with local Python).
// __faahem_run(code) runs a program and captures what it prints.
// __faahem_trace(code) records, after every line, the call stack, the heap and an Arabic
// narration, in the same Step shape as the JavaScript tracer, so the same player draws both.
export const PY_TRACER = String.raw`
import sys, io, json, types, traceback

_FILE = "<faahem>"
_MAX = 600

def _err_text(e):
    return f"{type(e).__name__}: {e}"

def __faahem_run(src):
    out = io.StringIO()
    old = sys.stdout
    sys.stdout = out
    error = None
    try:
        exec(compile(src, _FILE, "exec"), {"__name__": "__main__"})
    except SystemExit:
        pass
    except BaseException as e:
        error = {"name": type(e).__name__, "message": str(e)}
    finally:
        sys.stdout = old
    text = out.getvalue()
    lines = text.split("\n")
    if lines and lines[-1] == "":
        lines.pop()
    return json.dumps({"out": lines, "error": error}, ensure_ascii=False)

class _Limit(Exception):
    pass

def __faahem_trace(src):
    steps = []
    out = io.StringIO()
    ids = {}
    src_lines = src.split("\n")
    state = {"pending": None, "stack": [], "prev": {}, "raising": {}}

    def ref_id(o):
        k = id(o)
        if k not in ids:
            ids[k] = len(ids) + 1
        return ids[k]

    def is_heap(v):
        return isinstance(v, (list, tuple, dict, set)) or (
            hasattr(v, "__dict__") and not callable(v) and not isinstance(v, types.ModuleType)
        )

    def slot(name, v):
        if isinstance(v, bool):
            return {"name": name, "value": str(v), "type": "boolean"}
        if isinstance(v, (int, float)):
            return {"name": name, "value": repr(v), "type": "number"}
        if isinstance(v, str):
            return {"name": name, "value": json.dumps(v, ensure_ascii=False), "type": "string"}
        if v is None:
            return {"name": name, "value": "None", "type": "none"}
        if is_heap(v):
            return {"name": name, "value": "", "type": "ref", "ref": ref_id(v)}
        if callable(v):
            return {"name": name, "value": "ƒ " + getattr(v, "__name__", "?"), "type": "function"}
        return {"name": name, "value": repr(v)[:40], "type": "none"}

    def user_frames(f):
        chain = []
        while f is not None:
            if f.f_code.co_filename == _FILE:
                chain.append(f)
            f = f.f_back
        chain.reverse()
        return chain

    def frame_vars(f):
        items = []
        for k, v in f.f_locals.items():
            if k.startswith("__") or isinstance(v, types.ModuleType):
                continue
            items.append(slot(k, v))
        return items

    def snapshot(f, line, say, error=None):
        if len(steps) >= _MAX:
            raise _Limit()
        frames = []
        roots = []
        for i, fr in enumerate(user_frames(f)):
            name = "البرنامج" if fr.f_code.co_name == "<module>" else fr.f_code.co_name
            vs = frame_vars(fr)
            frames.append({"id": id(fr) % 100000, "name": name, "vars": vs})
            roots.extend(v for k, v in fr.f_locals.items() if not k.startswith("__"))
        heap = []
        seen = set()
        def visit(v):
            if not is_heap(v) or id(v) in seen:
                return
            seen.add(id(v))
            r = ref_id(v)
            if isinstance(v, dict):
                items = [slot(str(k), x) for k, x in v.items()]
                kind = "object"
                kids = list(v.values())
            elif isinstance(v, (list, tuple, set)):
                seq = list(v)
                items = [slot(str(i), x) for i, x in enumerate(seq)]
                kind = "array"
                kids = seq
            else:
                d = {k: x for k, x in vars(v).items() if not k.startswith("__")}
                items = [slot(k, x) for k, x in d.items()]
                kind = "object"
                kids = list(d.values())
            heap.append({"id": r, "kind": kind, "items": items})
            for k in kids:
                visit(k)
        for v in roots:
            visit(v)
        top = frames[-1]["vars"] if frames else []
        top_key = frames[-1]["id"] if frames else None
        prev = state["prev"].get(top_key, {})
        cur = {s["name"]: (s["value"], s.get("ref")) for s in top}
        changed = [k for k, val in cur.items() if prev.get(k) != val]
        if top_key is not None:
            state["prev"][top_key] = cur
        text = out.getvalue().split("\n")
        if text and text[-1] == "":
            text.pop()
        step = {"line": line, "say": say, "memory": [], "frames": frames, "heap": heap,
                "changed": changed, "read": [], "changedHeap": [], "output": text}
        if error:
            step["error"] = error
        steps.append(step)

    def describe(f, line):
        code = src_lines[line - 1].strip() if line and line <= len(src_lines) else ""
        top = {s["name"]: s for s in frame_vars(f)}
        prev = state["prev"].get(id(f) % 100000, {})
        changes = []
        for k, s in top.items():
            if prev.get(k) != (s["value"], s.get("ref")):
                changes.append(f"{k} صار {s['value']}" if s["type"] != "ref" else f"{k} يشير إلى قائمة/كائن في الكومة")
        printed_before = state.get("printed", 0)
        printed_now = len(out.getvalue())
        msg = f"نُفّذ: {code}"
        if changes:
            msg += " ← " + "، ".join(changes[:3])
        if printed_now > printed_before:
            new = out.getvalue()[printed_before:].strip()
            msg += f" ← طُبع: {new}"
            state["printed"] = printed_now
        return msg

    def tracer(f, event, arg):
        if f.f_code.co_filename != _FILE:
            return None
        if event == "call":
            if f.f_code.co_name != "<module>":
                state["stack"].append(state["pending"])
                state["pending"] = None
                args = ", ".join(f"{k}={slot(k, v)['value'] or '…'}" for k, v in f.f_locals.items())
                snapshot(f, f.f_code.co_firstlineno, f"استدعاء {f.f_code.co_name}({args}) ← إطار جديد فوق المكدّس")
            return tracer
        if event == "line":
            state["raising"].pop(id(f), None)
            if state["pending"] is not None:
                pf, pl = state["pending"]
                snapshot(f, pl, describe(f, pl))
            state["pending"] = (f, f.f_lineno)
        elif event == "exception":
            # The frame may still catch it; a later "line" event in this frame clears the mark.
            state["raising"][id(f)] = arg[0].__name__
        elif event == "return":
            if state["pending"] is not None:
                pf, pl = state["pending"]
                snapshot(f, pl, describe(f, pl))
                state["pending"] = None
            raised = state["raising"].pop(id(f), None)
            if f.f_code.co_name != "<module>":
                if raised:
                    snapshot(f, f.f_lineno, f"{f.f_code.co_name} توقفت بخطأ {raised} ولم تُرجع شيئاً ← يُزال إطارها والخطأ يصعد إلى من استدعاها")
                else:
                    snapshot(f, f.f_lineno, f"{f.f_code.co_name} تُرجع {slot('r', arg)['value'] or 'قائمة/كائن'} ويُزال إطارها")
                state["pending"] = state["stack"].pop() if state["stack"] else None
        return tracer

    old = sys.stdout
    sys.stdout = out
    error = None
    g = {"__name__": "__main__"}
    try:
        code = compile(src, _FILE, "exec")
    except SyntaxError as e:
        sys.stdout = old
        return json.dumps({"steps": [], "output": [], "error": f"خطأ في كتابة الكود (السطر {e.lineno}): {e.msg}"}, ensure_ascii=False)
    steps.append({"line": None, "say": "البرنامج جاهز. المكدّس فيه إطار واحد: إطار البرنامج الرئيسي.", "memory": [],
                  "frames": [{"id": 0, "name": "البرنامج", "vars": []}], "heap": [], "output": []})
    sys.settrace(tracer)
    try:
        exec(code, g)
    except _Limit:
        error = f"توقف التتبّع بعد {_MAX} خطوة. هل توجد حلقة لا تنتهي؟"
    except BaseException as e:
        error = "توقف البرنامج بخطأ: " + _err_text(e)
    finally:
        sys.settrace(None)
        sys.stdout = old
    if error:
        last = dict(steps[-1]) if steps else {"frames": [], "heap": [], "memory": []}
        tb = sys.exc_info()
        last.update({"say": error, "error": error})
        steps.append(last)
    else:
        text = out.getvalue().split("\n")
        if text and text[-1] == "":
            text.pop()
        last = dict(steps[-1])
        last.update({"line": None, "say": "انتهى البرنامج.", "output": text, "changed": []})
        steps.append(last)
    text = out.getvalue().split("\n")
    if text and text[-1] == "":
        text.pop()
    return json.dumps({"steps": steps, "output": text, "error": error}, ensure_ascii=False)
`;
