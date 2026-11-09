/* SPDX-License-Identifier: Apache-2.0 */
/**
 * The soft-PLC runtime: a project (POUs + globals), a static check, and a scan-cycle interpreter for ST and LD bodies.
 * Time is simulated: `rt.now` (ms) advances by the cycle each scan, so every timer test is exact and repeatable.
 * Run-time faults (divide by zero, loop guard, unknown name) are Problems, never exceptions; the scan carries on with 0 for the bad value.
 */
import { parseST, parseBody, problem, parseTime, INT_TYPES, ELEMENTARY } from './st.js';
import { STD_FB, STD_FN, kindOf, defaultOf, wrapInt, conversion, runStdFb } from './std.js';
import { execLadder, ladderToST } from './ladder.js';

export const LOOP_LIMIT = 1_000_000;

/** A project from ST source text: {pous: Map(UPPER → pou), globals: [...], problems}. */
export function projectFromST(src) {
  const r = parseST(src), pous = new Map(), problems = [...r.problems];
  for (const p of r.pous) { if (pous.has(p.name.toUpperCase())) problems.push(problem('dup-pou', 'error', 'Two POUs are named ' + p.name, { line: p.line })); pous.set(p.name.toUpperCase(), p); }
  return { pous, globals: r.globals, problems, tasks: [] };
}
/** Add (or replace) a POU on a project. */
export function addPou(project, pou) { project.pous.set(pou.name.toUpperCase(), pou); return project; }

// --------------------------------------------------------------------------------------------------------------------------------
// static check
// --------------------------------------------------------------------------------------------------------------------------------
const isFbType = (project, t) => t in STD_FB || (project.pous.has(t) && project.pous.get(t).type === 'functionBlock');
function fbIface(project, t) {
  if (t in STD_FB) return STD_FB[t];
  const p = project.pous.get(t); if (!p) return null;
  const o = { in: {}, out: {} };
  for (const v of p.vars) { if (v.kind === 'input' || v.kind === 'inout') o.in[v.key] = v.type; if (v.kind === 'output') o.out[v.key] = v.type; }
  return o;
}
const widen = (a, b) => (a === 'REAL' || b === 'REAL' || a === 'LREAL' || b === 'LREAL') ? 'REAL' : (a === 'ANY_INT' ? b : a);

export function analyze(project) {
  const out = [...project.problems];
  const gl = new Map(project.globals.map((g) => [g.key, g]));
  for (const p of project.pous.values()) {
    const scope = new Map(gl); for (const v of p.vars) scope.set(v.key, v);
    if (p.type === 'function') scope.set(p.name.toUpperCase(), { key: p.name.toUpperCase(), type: p.ret, kind: 'output', name: p.name });
    for (const v of p.vars) if (v.type !== 'STRING' && v.type !== 'WSTRING' && !ELEMENTARY.includes(v.type) && !isFbType(project, v.type)) out.push(problem('unknown-type', 'error', p.name + ': ' + v.name + ' has the type ' + v.type + ', which is not known', { pou: p.name, line: v.line }));
    if (p.type === 'function' && p.vars.some((v) => isFbType(project, v.type))) out.push(problem('fb-in-function', 'error', p.name + ': a function cannot hold function block instances', { pou: p.name }));
    const at = (n, msg, id, sev = 'error', extra = {}) => out.push(problem(id, sev, p.name + ' line ' + n.line + ': ' + msg, { pou: p.name, line: n.line, col: n.col, ...extra }));
    const ty = (e) => {   // → type string or null (unknown, already reported)
      switch (e.k) {
        case 'num': return e.type || (e.int ? 'ANY_INT' : 'REAL');
        case 'bool': return 'BOOL'; case 'time': return 'TIME'; case 'str': return 'STRING'; case 'addr': return null;
        case 'var': { const v = scope.get(e.name); if (!v) { at(e, 'the name ' + e.raw + ' is not declared', 'undeclared'); return null; } return v.type; }
        case 'mem': {
          if (e.obj.k !== 'var') { at(e, 'only instance.member is supported', 'member'); return null; }
          const v = scope.get(e.obj.name); if (!v) { at(e, 'the name ' + e.obj.raw + ' is not declared', 'undeclared'); return null; }
          const f = fbIface(project, v.type); if (!f) { at(e, e.obj.raw + ' is not a function block instance', 'member'); return null; }
          const t = f.out[e.name] ?? f.in[e.name]; if (!t) { at(e, v.type + ' has no member ' + e.raw, 'member'); return null; } return t;
        }
        case 'un': { const t = ty(e.a); if (e.op === 'NOT') { if (t && kindOf(t) !== 'bool' && kindOf(t) !== 'int') at(e, 'NOT needs a BOOL or integer', 'type'); return t; } return t; }
        case 'bin': {
          const a = ty(e.a), b = ty(e.b), ka = kindOf(a), kb = kindOf(b);
          if (!a || !b) return ['<', '>', '<=', '>=', '=', '<>'].includes(e.op) ? 'BOOL' : (a || b);
          if (['AND', 'OR', 'XOR'].includes(e.op)) { if (ka !== kb || (ka !== 'bool' && ka !== 'int')) at(e, e.op + ' needs two BOOLs or two integers', 'type'); return a; }
          if (['<', '>', '<=', '>=', '=', '<>'].includes(e.op)) { const num = (k) => k === 'int' || k === 'real'; if (!(ka === kb || (num(ka) && num(kb)))) at(e, 'cannot compare ' + a + ' with ' + b, 'type'); return 'BOOL'; }
          if (e.op === 'MOD') { if (ka !== 'int' || kb !== 'int') at(e, 'MOD needs integers', 'type'); return widen(a, b); }
          if (e.op === 'ADD' || e.op === '+' || e.op === '-') { if (ka === 'time' && kb === 'time') return 'TIME'; }
          if (e.op === '*' || e.op === '/') { if (ka === 'time' && (kb === 'int' || kb === 'real')) return 'TIME'; if (e.op === '/' && ka === 'time' && kb === 'time') { at(e, 'TIME / TIME is not defined', 'type'); return null; } }
          const num = (k) => k === 'int' || k === 'real';
          if (!(num(ka) && num(kb))) { at(e, 'cannot use ' + e.op + ' on ' + a + ' and ' + b, 'type'); return null; }
          return widen(a, b);
        }
        case 'call': {
          const v = scope.get(e.name);
          if (v && fbIface(project, v.type)) { at(e, e.raw + ' is a function block: call it as a statement, then read ' + e.raw + '.output', 'fb-in-expr'); return null; }
          const a = e.args.map((x) => ty(x.value));
          if (project.pous.has(e.name) && project.pous.get(e.name).type === 'function') {
            const f = project.pous.get(e.name), ins = f.vars.filter((x) => x.kind === 'input');
            if (e.args.length !== ins.length) at(e, e.raw + ' takes ' + ins.length + ' argument(s), not ' + e.args.length, 'arity');
            e.args.forEach((x, i) => { const pv = x.name ? ins.find((q) => q.key === x.name) : ins[i]; if (!pv) at(e, e.raw + ' has no input ' + x.name, 'arg'); else if (a[i] && !assignOk(pv.type, a[i])) at(e, 'argument ' + pv.name + ' of ' + e.raw + ' expects ' + pv.type + ', got ' + a[i], 'type'); });
            return f.ret;
          }
          const s = STD_FN[e.name]; if (s) { if (e.args.length < s.n[0] || e.args.length > s.n[1]) at(e, e.raw + ' takes ' + (s.n[0] === s.n[1] ? s.n[0] : s.n[0] + ' to ' + s.n[1]) + ' argument(s)', 'arity'); return s.t(a.map((x) => x === 'ANY_INT' ? 'INT' : x)); }
          const cv = conversion(e.name); if (cv) { if (e.args.length !== 1) at(e, e.raw + ' takes one argument', 'arity'); return cv.to; }
          at(e, 'the function ' + e.raw + ' is not known', 'unknown-fn'); return null;
        }
      }
      return null;
    };
    const assignOk = (dst, src) => { const kd = kindOf(dst), ks = kindOf(src); if (!kd || !ks) return true; if (kd === ks) return true; return kd === 'real' && ks === 'int'; };
    const writable = (target, n) => {
      const nm = target.k === 'var' ? target.name : target.k === 'mem' && target.obj.k === 'var' ? target.obj.name : null;
      const v = nm && scope.get(nm);
      if (!v) return;   // reported by ty()
      if (v.constant) at(n, v.name + ' is CONSTANT and cannot be written', 'write-constant');
      if (target.k === 'mem') { at(n, 'writing a function block member directly is not allowed; pass it as a call argument', 'write-member'); return; }
      if (v.kind === 'input' && p.type !== 'program') at(n, v.name + ' is an input of ' + p.name + ' and is read-only inside it', 'write-input');
    };
    const walk = (list) => { for (const s of list) {
      switch (s.k) {
        case 'assign': { const td = ty(s.target), ts = ty(s.value); writable(s.target, s);
          { const tv = s.target.k === 'var' && scope.get(s.target.name); if (tv && tv.addr && /^%I/.test(tv.addr)) at(s, tv.name + ' is at the input address ' + tv.addr + ' and cannot be written by the program', 'write-input-address'); } if (td && ts && !assignOk(td, ts)) at(s, 'cannot assign ' + ts + ' to ' + td + (kindOf(td) === 'int' && kindOf(ts) === 'real' ? ' (use REAL_TO_' + td + ')' : ''), 'type'); break; }
        case 'callstmt': {
          const c = s.call, v = scope.get(c.name);
          if (v && fbIface(project, v.type)) {
            const f = fbIface(project, v.type);
            for (const a of c.args) { const t = ty(a.value); if (!a.name) { at(s, 'function block calls take named arguments (IN := …)', 'arg'); continue; } const want = a.out ? f.out[a.name] : f.in[a.name]; if (!want) at(s, v.type + ' has no ' + (a.out ? 'output ' : 'input ') + a.name, 'arg'); else if (!a.out && t && !assignOk(want, t)) at(s, 'input ' + a.name + ' of ' + v.type + ' expects ' + want + ', got ' + t, 'type'); }
          } else if (!v) { if (project.pous.has(c.name) || STD_FN[c.name] || conversion(c.name)) ty(c); else at(s, 'the name ' + c.raw + ' is not declared', 'undeclared'); }
          else at(s, c.raw + ' is not a function block', 'call');
          break;
        }
        case 'if': for (const a of s.arms) { const t = ty(a.cond); if (t && kindOf(t) !== 'bool') at(s, 'an IF condition must be BOOL, not ' + t, 'type'); walk(a.body); } if (s.els) walk(s.els); break;
        case 'while': { const t = ty(s.cond); if (t && kindOf(t) !== 'bool') at(s, 'a WHILE condition must be BOOL', 'type'); walk(s.body); break; }
        case 'repeat': { const t = ty(s.cond); if (t && kindOf(t) !== 'bool') at(s, 'an UNTIL condition must be BOOL', 'type'); walk(s.body); break; }
        case 'for': { const v = scope.get(s.v); if (!v) at(s, 'the loop variable ' + s.v + ' is not declared', 'undeclared'); else if (kindOf(v.type) !== 'int') at(s, 'the FOR variable ' + v.name + ' must be an integer', 'type'); ty(s.from); ty(s.to); if (s.by) ty(s.by); walk(s.body); break; }
        case 'case': { const t = ty(s.sel); if (t && kindOf(t) !== 'int') at(s, 'CASE selects on an integer', 'type'); for (const a of s.arms) walk(a.body); if (s.els) walk(s.els); break; }
        default: break;
      }
    } };
    if (p.body.kind === 'ST') walk(p.body.stmts);
    else if (p.body.kind === 'LD') {
      const lt = ladderToST(p.body), parsed = parseBody(lt.text);
      for (const v of lt.vars) if (v.name.startsWith('_ldEdge')) scope.set(v.name.toUpperCase(), { key: v.name.toUpperCase(), type: v.type, name: v.name, kind: 'local' });
      if (parsed.problems.length) for (const q of parsed.problems) out.push({ ...q, pou: p.name, message: p.name + ' (ladder as ST): ' + q.message });
      else walk(parsed.stmts);
    }
  }
  return out;
}

// --------------------------------------------------------------------------------------------------------------------------------
// runtime
// --------------------------------------------------------------------------------------------------------------------------------
class Instance { constructor(type, std) { this.type = type; this.std = std; this.vars = new Map(); this.decl = new Map(); this.st = {}; this.mem = new Map(); } }

export class Runtime {
  /** @param project {pous, globals, problems}  @param opts {program: name of the PROGRAM, cycleMs, opsBudget} */
  constructor(project, opts = {}) {
    this.project = project; this.cycleMs = opts.cycleMs ?? 10; this.opsBudget = opts.opsBudget ?? 0;
    this.now = 0; this.scans = 0; this.ops = 0; this.maxOps = 0; this.problems = []; this._seen = new Set();
    this.io = new Map();   // %address → value (the process image)
    this.globals = new Map(); this.globalDecl = new Map();
    for (const g of project.globals) this.declare(this.globals, this.globalDecl, g, null);
    const name = (opts.program || [...project.pous.values()].find((p) => p.type === 'program')?.name || '').toUpperCase();
    const pou = project.pous.get(name);
    if (!pou || pou.type !== 'program') { this.main = null; this.fault('no-program', 'error', 'There is no PROGRAM to run' + (opts.program ? ' named ' + opts.program : '')); return; }
    this.main = this.instantiate(pou);
  }
  fault(id, severity, message, extra = {}) {
    const key = id + '|' + message; if (this._seen.has(key)) return; this._seen.add(key);
    this.problems.push(problem(id, severity, message, extra));
  }
  declare(vars, decls, v, inst) {
    decls.set(v.key, v);
    const k = kindOf(v.type);
    if (k === 'other' || (!k && v.type)) {
      if (v.type in STD_FB) { vars.set(v.key, this.instantiateStd(v.type)); return; }
      const p = this.project.pous.get(v.type);
      if (p && p.type === 'functionBlock') { vars.set(v.key, this.instantiate(p)); return; }
    }
    let val = defaultOf(v.type);
    if (v.init) val = this.coerce(v.type, this.eval(v.init, { inst: inst || { vars: new Map(), decl: new Map() }, fn: null }));
    vars.set(v.key, val);
  }
  instantiateStd(type) {
    const i = new Instance(type, true), f = STD_FB[type];
    for (const [k, t] of Object.entries(f.in)) { i.vars.set(k, defaultOf(t)); i.decl.set(k, { key: k, type: t, kind: 'input' }); }
    for (const [k, t] of Object.entries(f.out)) { i.vars.set(k, defaultOf(t)); i.decl.set(k, { key: k, type: t, kind: 'output' }); }
    return i;
  }
  instantiate(pou) {
    const i = new Instance(pou.name, false); i.pou = pou;
    this._depth = (this._depth || 0) + 1;
    if (this._depth > 32) { this.fault('recursive-type', 'error', pou.name + ' contains itself (directly or through other function blocks); it cannot be instantiated'); this._depth--; return i; }
    for (const v of pou.vars) this.declare(i.vars, i.decl, v, i);
    this._depth--;
    if (pou.type === 'function') { i.vars.set(pou.name.toUpperCase(), defaultOf(pou.ret)); i.decl.set(pou.name.toUpperCase(), { key: pou.name.toUpperCase(), type: pou.ret, kind: 'output' }); }
    return i;
  }
  coerce(type, v) {
    const k = kindOf(type);
    if (k === 'int') { if (typeof v === 'boolean') v = v ? 1 : 0; return type in INT_TYPES ? wrapInt(type, v) : Math.trunc(v); }
    if (k === 'bool') return !!v;
    if (k === 'real') return typeof v === 'boolean' ? (v ? 1 : 0) : Number(v);
    return v;
  }
  // ---- variables --------------------------------------------------------------------------------------------------------------
  slot(name, inst) { if (inst.vars.has(name)) return inst; if (this.globals.has(name)) return { vars: this.globals, decl: this.globalDecl }; return null; }
  /** Read `name` or `inst.member` from the program (used by tests, the plant binding and the ladder). */
  get(path, inst = this.main) {
    const [a, b] = String(path).toUpperCase().split('.'); const s = this.slot(a, inst); if (!s) return undefined;
    const v = s.vars.get(a); if (b === undefined) return v;
    return v instanceof Instance ? v.vars.get(b) : undefined;
  }
  set(path, val, inst = this.main) {
    const [a, b] = String(path).toUpperCase().split('.'); const s = this.slot(a, inst);
    if (!s) { this.fault('undeclared', 'error', 'Writing ' + path + ': that name does not exist'); return false; }
    if (b !== undefined) { const f = s.vars.get(a); if (f instanceof Instance && f.vars.has(b)) { f.vars.set(b, val); return true; } return false; }
    s.vars.set(a, this.coerce(s.decl.get(a)?.type, val)); return true;
  }
  // ---- expressions ------------------------------------------------------------------------------------------------------------
  eval(e, ctx) {
    this.ops++;
    switch (e.k) {
      case 'num': return e.type in INT_TYPES ? wrapInt(e.type, e.v) : e.v;
      case 'bool': case 'time': case 'str': return e.v;
      case 'addr': return this.io.get(e.v) ?? 0;
      case 'var': { const s = this.slot(e.name, ctx.inst); if (!s) { this.fault('undeclared', 'error', 'The name ' + e.raw + ' is not declared', { line: e.line }); return 0; } const v = s.vars.get(e.name); return v instanceof Instance ? 0 : v; }
      case 'mem': { const o = e.obj.k === 'var' ? this.get(e.obj.name, ctx.inst) : undefined; if (o instanceof Instance && o.vars.has(e.name)) return o.vars.get(e.name); this.fault('member', 'error', 'No member ' + e.raw, { line: e.line }); return 0; }
      case 'un': { const a = this.eval(e.a, ctx); if (e.op === '-') return -a; return typeof a === 'boolean' ? !a : ~a; }
      case 'bin': return this.binary(e, ctx);
      case 'call': return this.callFn(e, ctx);
      default: return 0;
    }
  }
  binary(e, ctx) {
    let a, b;
    if (e.op === 'AND' || e.op === 'OR') { a = this.eval(e.a, ctx); b = this.eval(e.b, ctx); }   // both sides always evaluated (the standard does not promise short circuit)
    else { a = this.eval(e.a, ctx); b = this.eval(e.b, ctx); }
    const isInt = (x, n) => Number.isInteger(x) && !(n.k === 'num' && !n.int);
    switch (e.op) {
      case 'AND': return typeof a === 'boolean' ? a && b : a & b;
      case 'OR': return typeof a === 'boolean' ? a || b : a | b;
      case 'XOR': return typeof a === 'boolean' ? a !== b : a ^ b;
      case '+': return a + b; case '-': return a - b; case '*': return a * b;
      case '/': if (b === 0) { this.fault('div-zero', 'error', 'Division by zero at line ' + e.line, { line: e.line }); return 0; }
        return this.isIntExpr(e, ctx) && isInt(a, e.a) && isInt(b, e.b) ? Math.trunc(a / b) : a / b;
      case 'MOD': if (b === 0) { this.fault('div-zero', 'error', 'MOD by zero at line ' + e.line, { line: e.line }); return 0; } return a % b;
      case '**': return a ** b;
      case '=': return a === b; case '<>': return a !== b; case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b;
      default: return 0;
    }
  }
  /** Integer division truncates only when both operands are of integer type; a REAL variable holding 3 is still REAL. */
  isIntExpr(e, ctx) { return this.kindOfExpr(e.a, ctx) === 'int' && this.kindOfExpr(e.b, ctx) === 'int'; }
  kindOfExpr(e, ctx) {
    switch (e.k) {
      case 'num': return e.type ? kindOf(e.type) : e.int ? 'int' : 'real';
      case 'var': { const s = this.slot(e.name, ctx.inst); const d = s && s.decl.get(e.name); return d ? kindOf(d.type) : null; }
      case 'mem': { const o = e.obj.k === 'var' ? this.get(e.obj.name, ctx.inst) : null; const d = o instanceof Instance ? o.decl.get(e.name) : null; return d ? kindOf(d.type) : null; }
      case 'bin': { if (['<', '>', '<=', '>=', '=', '<>'].includes(e.op)) return 'bool'; const a = this.kindOfExpr(e.a, ctx), b = this.kindOfExpr(e.b, ctx); return a === 'real' || b === 'real' ? 'real' : a; }
      case 'un': return this.kindOfExpr(e.a, ctx);
      case 'call': { const p = this.project.pous.get(e.name); if (p) return kindOf(p.ret); const c = conversion(e.name); if (c) return kindOf(c.to); return 'real'; }
      default: return null;
    }
  }
  callFn(e, ctx) {
    const args = e.args.map((a) => this.eval(a.value, ctx));
    const p = this.project.pous.get(e.name);
    if (p && p.type === 'function') {
      const inst = this.instantiate(p), ins = p.vars.filter((v) => v.kind === 'input');
      e.args.forEach((a, i) => { const pv = a.name ? ins.find((q) => q.key === a.name) : ins[i]; if (pv) inst.vars.set(pv.key, this.coerce(pv.type, args[i])); });
      this.execBody(inst, { depth: (ctx.depth || 0) + 1 });
      return inst.vars.get(p.name.toUpperCase());
    }
    if (STD_FN[e.name]) return STD_FN[e.name].f(...args);
    const cv = conversion(e.name); if (cv) return cv.f(args[0]);
    this.fault('unknown-fn', 'error', 'The function ' + e.raw + ' is not known', { line: e.line }); return 0;
  }
  // ---- statements -------------------------------------------------------------------------------------------------------------
  assign(target, val, ctx) {
    if (target.k === 'var') {
      const s = this.slot(target.name, ctx.inst); if (!s) { this.fault('undeclared', 'error', 'The name ' + target.raw + ' is not declared', { line: target.line }); return; }
      s.vars.set(target.name, this.coerce(s.decl.get(target.name)?.type, val));
    }
  }
  callFb(inst, args, ctx) {
    for (const a of args) {
      if (a.out) continue;
      const d = inst.decl.get(a.name); inst.vars.set(a.name, this.coerce(d ? d.type : null, this.eval(a.value, ctx)));
    }
    if (inst.std) runStdFb(inst.type, inst.vars, inst.st, this.now); else this.execBody(inst, { depth: (ctx.depth || 0) + 1 });
    for (const a of args) if (a.out && a.value.k === 'var') this.assign(a.value, inst.vars.get(a.name), ctx);
  }
  exec(list, ctx) {
    for (const s of list) {
      this.ops++;
      switch (s.k) {
        case 'assign': this.assign(s.target, this.eval(s.value, ctx), ctx); break;
        case 'callstmt': {
          const c = s.call, o = this.get(c.name, ctx.inst);
          if (o instanceof Instance) this.callFb(o, c.args, ctx); else this.callFn(c, ctx);
          break;
        }
        case 'if': { let done = false; for (const a of s.arms) if (this.eval(a.cond, ctx)) { const r = this.exec(a.body, ctx); if (r) return r; done = true; break; } if (!done && s.els) { const r = this.exec(s.els, ctx); if (r) return r; } break; }
        case 'case': {
          const v = this.eval(s.sel, ctx); let hit = null;
          for (const a of s.arms) if (a.labels.some((l) => l.to ? v >= this.eval(l.from, ctx) && v <= this.eval(l.to, ctx) : v === this.eval(l.from, ctx))) { hit = a.body; break; }
          if (hit === null && s.els) hit = s.els; if (hit) { const r = this.exec(hit, ctx); if (r) return r; } break;
        }
        case 'for': {
          const from = this.eval(s.from, ctx), to = this.eval(s.to, ctx), by = s.by ? this.eval(s.by, ctx) : 1; let n = 0;
          if (by === 0) { this.fault('for-by-zero', 'error', 'FOR ... BY 0 at line ' + s.line, { line: s.line }); break; }
          for (let i = from; by > 0 ? i <= to : i >= to; i += by) {
            if (++n > LOOP_LIMIT) { this.fault('loop-limit', 'error', 'Loop at line ' + s.line + ' ran more than ' + LOOP_LIMIT + ' times in one scan and was cut', { line: s.line }); break; }
            this.assign({ k: 'var', name: s.v, raw: s.v, line: s.line }, i, ctx);
            const r = this.exec(s.body, ctx); if (r === 'exit') break; if (r === 'return') return r;
          }
          break;
        }
        case 'while': { let n = 0; while (this.eval(s.cond, ctx)) { if (++n > LOOP_LIMIT) { this.fault('loop-limit', 'error', 'Loop at line ' + s.line + ' ran more than ' + LOOP_LIMIT + ' times in one scan and was cut', { line: s.line }); break; } const r = this.exec(s.body, ctx); if (r === 'exit') break; if (r === 'return') return r; } break; }
        case 'repeat': { let n = 0; do { if (++n > LOOP_LIMIT) { this.fault('loop-limit', 'error', 'Loop at line ' + s.line + ' ran more than ' + LOOP_LIMIT + ' times in one scan and was cut', { line: s.line }); break; } const r = this.exec(s.body, ctx); if (r === 'exit') break; if (r === 'return') return r; } while (!this.eval(s.cond, ctx)); break; }
        case 'exit': return 'exit';
        case 'return': return 'return';
        default: break;
      }
    }
    return null;
  }
  execBody(inst, ctx = {}) {
    const body = inst.pou.body, c = { inst, depth: ctx.depth || 0 };
    if (c.depth > 64) { this.fault('recursion', 'error', 'Calls nested more than 64 deep in ' + inst.type + ' (recursion is not allowed)'); return; }
    if (body.kind === 'ST') { this.exec(body.stmts, c); return; }
    if (body.kind === 'LD') {
      const env = {
        mem: inst.mem, get: (n) => this.get(n, inst), set: (n, v) => this.set(n, v, inst),
        box: (n, pin, extra = {}) => {
          const o = this.get(n.inst, inst); if (!(o instanceof Instance)) { this.fault('undeclared', 'error', 'Box instance ' + n.inst + ' is not declared'); return false; }
          const args = [{ name: n.pin, out: false, value: { k: 'bool', v: pin } }, ...Object.entries(extra).map(([a, v]) => ({ name: a, out: false, value: { k: 'bool', v } }))];
          for (const [a, txt] of Object.entries(n.args || {})) { const b = parseBody('x := ' + txt + ';'); args.push({ name: a, out: false, value: b.stmts[0] ? b.stmts[0].value : { k: 'num', v: 0, int: true } }); }
          this.callFb(o, args, { inst, depth: c.depth }); return !!o.vars.get(n.out);
        },
      };
      for (const q of execLadder(body, env)) this.fault(q.id.slice(4), q.severity, q.message, q);
    }
  }
  // ---- the scan ---------------------------------------------------------------------------------------------------------------
  /** One scan: inputs from the I/O image, program body, outputs to the image; then the clock advances by `dt` (default the cycle). */
  scan(dt = this.cycleMs) {
    if (!this.main) return;
    const inst = this.main;
    for (const [k, d] of inst.decl) if (d.addr && /^%[IM]/.test(d.addr) && this.io.has(d.addr)) inst.vars.set(k, this.coerce(d.type, this.io.get(d.addr)));
    this.ops = 0;
    this.execBody(inst);
    for (const [k, d] of inst.decl) if (d.addr && /^%[QM]/.test(d.addr)) this.io.set(d.addr, inst.vars.get(k));
    this.maxOps = Math.max(this.maxOps, this.ops); this.scans++;
    if (this.opsBudget && this.ops > this.opsBudget) this.fault('scan-budget', 'warning', 'A scan used ' + this.ops + ' operations; the budget is ' + this.opsBudget, { req: this.opsBudget, found: this.ops });
    this.now += dt;
  }
  /** Addresses the program declares with AT, split into inputs and outputs/memory. */
  addresses() { const out = []; for (const d of this.main ? this.main.decl.values() : []) if (d.addr) out.push({ address: d.addr, name: d.name, type: d.type, direction: /^%I/.test(d.addr) ? 'input' : /^%Q/.test(d.addr) ? 'output' : 'memory' }); return out; }
}
