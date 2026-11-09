/* SPDX-License-Identifier: Apache-2.0 */
/**
 * PLCopen XML (TC6 v2.01, namespace http://www.plcopen.org/xml/tc6_0201) reader and writer. Written from the published schema structure.
 * Bodies: ST and LD are read and written; FBD, IL and SFC bodies are named as problems and the POU keeps an empty body.
 * Not validated against the XSD here (no copy of it in the repo): a round trip through this reader/writer and the structure checks in the test are what is covered.
 */
import { parseXml, esc, kids, kid } from './xml.js';
import { parseBody, problem, parseTime, ELEMENTARY } from './st.js';
import { exprText, stmtsText } from './print.js';

export const NS = 'http://www.plcopen.org/xml/tc6_0201';
const BASIC = ['BOOL', 'BYTE', 'WORD', 'DWORD', 'LWORD', 'SINT', 'INT', 'DINT', 'LINT', 'USINT', 'UINT', 'UDINT', 'ULINT', 'REAL', 'LREAL', 'TIME', 'DATE', 'DT', 'TOD'];
const typeXml = (t) => (BASIC.includes(t) ? '<' + t + '/>' : t === 'STRING' ? '<string/>' : t === 'WSTRING' ? '<wstring/>' : '<derived name="' + esc(t) + '"/>');
const GROUPS = { input: 'inputVars', output: 'outputVars', inout: 'inOutVars', local: 'localVars', temp: 'tempVars', external: 'externalVars', global: 'globalVars' };
const GROUP_KIND = Object.fromEntries(Object.entries(GROUPS).map(([k, v]) => [v, k]));

function initXml(init) {
  if (!init) return '';
  return '<initialValue><simpleValue value="' + esc(exprText(init)) + '"/></initialValue>';
}
function varsXml(vars, ind) {
  let out = '';
  for (const kind of ['input', 'output', 'inout', 'local', 'temp', 'external']) {
    const vs = vars.filter((v) => v.kind === kind); if (!vs.length) continue;
    out += ind + '<' + GROUPS[kind] + (vs.every((v) => v.constant) ? ' constant="true"' : '') + (vs.every((v) => v.retain) && kind === 'local' ? ' retain="true"' : '') + '>\n';
    for (const v of vs) out += ind + '  <variable name="' + esc(v.name) + '"' + (v.addr ? ' address="' + esc(v.addr) + '"' : '') + '><type>' + typeXml(v.type) + '</type>' + initXml(v.init) + '</variable>\n';
    out += ind + '</' + GROUPS[kind] + '>\n';
  }
  return out;
}

function ldXml(body) {
  let out = '', gid = 0;
  const pos = (x, y) => '<position x="' + x + '" y="' + y + '"/>';
  body.rungs.forEach((r, ri) => {
    const map = new Map(); for (const n of r.nodes) map.set(n.id, ++gid);
    const depth = new Map(), d = (id, seen = new Set()) => { if (depth.has(id)) return depth.get(id); if (seen.has(id)) return 0; seen.add(id); const n = r.nodes.find((q) => q.id === id); const v = !n || !(n.in || []).length ? 0 : 1 + Math.max(...(n.in || []).map((x) => d(x, seen))); depth.set(id, v); return v; };
    const conn = (ids) => ids.map((id) => { const src = r.nodes.find((q) => q.id === id); return '<connection refLocalId="' + map.get(id) + '"' + (src && src.t === 'box' ? ' formalParameter="' + esc(src.out) + '"' : '') + '/>'; }).join('');
    const y = ri * 80;
    if (r.comment) out += '      <comment localId="' + (++gid) + '" height="20" width="200">' + pos(0, y - 25) + '<content><xhtml xmlns="http://www.w3.org/1999/xhtml">' + esc(r.comment) + '</xhtml></content></comment>\n';
    for (const n of r.nodes) {
      const id = map.get(n.id), x = 40 + d(n.id) * 90, p = pos(x, y);
      if (n.t === 'left') out += '      <leftPowerRail localId="' + id + '">' + pos(0, y) + '<connectionPointOut/></leftPowerRail>\n';
      else if (n.t === 'right') out += '      <rightPowerRail localId="' + id + '">' + pos(x + 90, y) + '<connectionPointIn>' + conn(n.in) + '</connectionPointIn></rightPowerRail>\n';
      else if (n.t === 'contact') out += '      <contact localId="' + id + '" negated="' + (n.kind === 'NC') + '" edge="' + (n.kind === 'P' ? 'rising' : n.kind === 'N' ? 'falling' : 'none') + '">' + p + '<connectionPointIn>' + conn(n.in) + '</connectionPointIn><connectionPointOut/><variable>' + esc(n.var) + '</variable></contact>\n';
      else if (n.t === 'coil') out += '      <coil localId="' + id + '" negated="' + (n.kind === 'neg') + '" storage="' + (n.kind === 'set' ? 'set' : n.kind === 'reset' ? 'reset' : 'none') + '">' + p + '<connectionPointIn>' + conn(n.in) + '</connectionPointIn><connectionPointOut/><variable>' + esc(n.var) + '</variable></coil>\n';
      else if (n.t === 'box') {
        let inv = '<variable formalParameter="' + esc(n.pin) + '"><connectionPointIn>' + conn(n.in) + '</connectionPointIn></variable>';
        for (const [a, ids] of Object.entries(n.ins || {})) inv += '<variable formalParameter="' + esc(a) + '"><connectionPointIn>' + conn(ids) + '</connectionPointIn></variable>';
        for (const [a, txt] of Object.entries(n.args || {})) {
          const cid = ++gid;
          out += '      <inVariable localId="' + cid + '">' + pos(x - 60, y + 20) + '<connectionPointOut/><expression>' + esc(txt) + '</expression></inVariable>\n';
          inv += '<variable formalParameter="' + esc(a) + '"><connectionPointIn><connection refLocalId="' + cid + '"/></connectionPointIn></variable>';
        }
        out += '      <block localId="' + id + '" typeName="' + esc(n.fb) + '" instanceName="' + esc(n.inst) + '">' + p + '<inputVariables>' + inv + '</inputVariables><inOutVariables/><outputVariables><variable formalParameter="' + esc(n.out) + '"><connectionPointOut/></variable></outputVariables></block>\n';
      }
    }
  });
  return '    <LD>\n' + out + '    </LD>\n';
}

/** project: {name, company, pous: Map|Array, globals?, tasks?: [{name, interval (ms), priority, program}]} → XML text. */
export function writePlcopen(project, opts = {}) {
  const pous = project.pous instanceof Map ? [...project.pous.values()] : project.pous;
  const date = opts.date || '1970-01-01T00:00:00';
  let x = '<?xml version="1.0" encoding="utf-8"?>\n<project xmlns="' + NS + '">\n';
  x += '  <fileHeader companyName="' + esc(opts.company || project.company || '') + '" productName="' + esc(opts.productName || 'CadCraft') + '" productVersion="' + esc(opts.productVersion || '1') + '" creationDateTime="' + esc(date) + '"/>\n';
  x += '  <contentHeader name="' + esc(project.name || 'Project') + '"><coordinateInfo><fbd><scaling x="1" y="1"/></fbd><ld><scaling x="1" y="1"/></ld><sfc><scaling x="1" y="1"/></sfc></coordinateInfo></contentHeader>\n';
  x += '  <types>\n    <dataTypes/>\n    <pous>\n';
  for (const p of pous) {
    x += '      <pou name="' + esc(p.name) + '" pouType="' + p.type + '">\n        <interface>\n';
    if (p.type === 'function') x += '          <returnType>' + typeXml(p.ret) + '</returnType>\n';
    x += varsXml(p.vars, '          ') + '        </interface>\n        <body>\n';
    if (p.body.kind === 'LD') x += ldXml(p.body);
    else x += '    <ST><xhtml xmlns="http://www.w3.org/1999/xhtml">' + esc(stmtsText(p.body.stmts || [])) + '</xhtml></ST>\n';
    x += '        </body>\n      </pou>\n';
  }
  x += '    </pous>\n  </types>\n  <instances>\n    <configurations>\n      <configuration name="Config0">\n';
  const gl = (project.globals || []);
  if (gl.length) x += varsXml(gl.map((g) => ({ ...g, kind: 'local' })), '        ').replace(/localVars/g, 'globalVars');
  x += '        <resource name="Res0">\n';
  for (const t of project.tasks || []) x += '          <task name="' + esc(t.name) + '" interval="T#' + t.interval + 'ms" priority="' + (t.priority ?? 1) + '"><pouInstance name="' + esc(t.program) + '_inst" typeName="' + esc(t.program) + '"/></task>\n';
  x += '        </resource>\n      </configuration>\n    </configurations>\n  </instances>\n</project>\n';
  return x;
}

// ---- reading --------------------------------------------------------------------------------------------------------------------
function readType(el, problems, where) {
  const c = el.children[0]; if (!c) return 'INT';
  if (c.name === 'derived') return String(c.attrs.name || '').toUpperCase();
  if (c.name === 'string') return 'STRING'; if (c.name === 'wstring') return 'WSTRING';
  if (BASIC.includes(c.name)) return c.name;
  problems.push(problem('plcopen-type', 'error', where + ': the data type <' + c.name + '> is not supported yet')); return 'INT';
}
function simpleInit(el) {
  const iv = kid(el, 'initialValue'), sv = iv && kid(iv, 'simpleValue');
  if (!sv || sv.attrs.value === undefined) return null;
  const b = parseBody('x := ' + sv.attrs.value + ';'); return b.stmts[0] ? b.stmts[0].value : null;
}
function readVars(group, kind, vars, problems, where) {
  for (const v of kids(group, 'variable')) {
    const name = v.attrs.name; if (!name) continue;
    vars.push({ name, key: name.toUpperCase(), type: readType(kid(v, 'type') || { children: [] }, problems, where), kind, retain: group.attrs.retain === 'true', constant: group.attrs.constant === 'true', addr: v.attrs.address ? v.attrs.address.toUpperCase() : null, init: simpleInit(v), line: 0 });
  }
}
function readLd(ld, problems, where) {
  const els = new Map(), pos = (e) => { const p = kid(e, 'position'); return p ? [Number(p.attrs.x) || 0, Number(p.attrs.y) || 0] : [0, 0]; };
  for (const e of ld.children) {
    if (['leftPowerRail', 'rightPowerRail', 'contact', 'coil', 'block', 'inVariable'].includes(e.name)) els.set(e.attrs.localId, e);
    else if (e.name === 'comment') continue;
    else problems.push(problem('plcopen-ld-element', 'error', where + ': the ladder element <' + e.name + '> is not supported yet (jumps, connectors and outputs to variables)'));
  }
  const inRefs = (e) => { const cp = kid(e, 'connectionPointIn'); return cp ? kids(cp, 'connection').map((c) => c.attrs.refLocalId) : []; };
  const boxInputs = (e) => { const iv = kid(e, 'inputVariables'); return iv ? kids(iv, 'variable').map((v) => ({ param: v.attrs.formalParameter, refs: inRefs(v) })) : []; };
  // union by connection → one component per rung
  const parent = new Map(); const find = (a) => { while (parent.get(a) !== a) { parent.set(a, parent.get(parent.get(a))); a = parent.get(a); } return a; };
  for (const id of els.keys()) parent.set(id, id);
  const link = (a, b) => { if (els.has(a) && els.has(b)) parent.set(find(a), find(b)); };
  for (const [id, e] of els) { if (e.name === 'block') for (const bi of boxInputs(e)) for (const r of bi.refs) link(id, r); else for (const r of inRefs(e)) link(id, r); }
  const comps = new Map(); for (const id of els.keys()) { const r = find(id); if (!comps.has(r)) comps.set(r, []); comps.get(r).push(id); }
  const rungs = [];
  for (const ids of comps.values()) {
    ids.sort((a, b) => { const pa = pos(els.get(a)), pb = pos(els.get(b)); return pa[1] - pb[1] || pa[0] - pb[0] || Number(a) - Number(b); });
    const num = new Map(ids.map((id, i) => [id, i + 1])), nodes = [], skip = new Set();
    const argOf = new Map();   // inVariable id → expression text
    for (const id of ids) { const e = els.get(id); if (e.name === 'inVariable') { argOf.set(id, (kid(e, 'expression') || { text: '' }).text.trim()); skip.add(id); } }
    for (const id of ids) {
      const e = els.get(id), n = num.get(id);
      const mapIn = (refs) => refs.filter((r) => els.has(r) && !skip.has(r)).map((r) => num.get(r));
      if (e.name === 'leftPowerRail') nodes.push({ id: n, t: 'left' });
      else if (e.name === 'rightPowerRail') nodes.push({ id: n, t: 'right', in: mapIn(inRefs(e)) });
      else if (e.name === 'contact') {
        const neg = e.attrs.negated === 'true', edge = e.attrs.edge || 'none';
        if (neg && edge !== 'none') problems.push(problem('plcopen-ld-combo', 'error', where + ': a negated contact with an edge is not supported'));
        nodes.push({ id: n, t: 'contact', kind: edge === 'rising' ? 'P' : edge === 'falling' ? 'N' : neg ? 'NC' : 'NO', var: (kid(e, 'variable') || { text: '' }).text.trim(), in: mapIn(inRefs(e)) });
      } else if (e.name === 'coil') {
        const neg = e.attrs.negated === 'true', st = e.attrs.storage || 'none';
        if (st !== 'none' && st !== 'set' && st !== 'reset') problems.push(problem('plcopen-ld-combo', 'error', where + ': coil storage ' + st + ' is not supported'));
        nodes.push({ id: n, t: 'coil', kind: st === 'set' ? 'set' : st === 'reset' ? 'reset' : neg ? 'neg' : 'out', var: (kid(e, 'variable') || { text: '' }).text.trim(), in: mapIn(inRefs(e)) });
      } else if (e.name === 'block') {
        const ins = boxInputs(e), args = {}, power = []; 
        for (const bi of ins) { const arg = bi.refs.find((r) => argOf.has(r)); if (arg) args[bi.param] = argOf.get(arg); else power.push(bi); }
        const out = (kid(kid(e, 'outputVariables') || { children: [] }, 'variable') || { attrs: {} }).attrs.formalParameter;
        if (!power.length) { problems.push(problem('plcopen-ld-box', 'error', where + ': block ' + e.attrs.instanceName + ' has no power input')); continue; }
        const box = { id: n, t: 'box', fb: String(e.attrs.typeName).toUpperCase(), inst: e.attrs.instanceName, args, pin: power[0].param, out: out || 'Q', in: mapIn(power[0].refs) };
        if (power.length > 1) box.ins = Object.fromEntries(power.slice(1).map((b) => [b.param, mapIn(b.refs)]));
        nodes.push(box);
      }
    }
    if (nodes.some((q) => q.t === 'coil' || q.t === 'box')) rungs.push({ comment: '', nodes, y: Math.min(...ids.map((i) => pos(els.get(i))[1])) });
  }
  rungs.sort((a, b) => a.y - b.y); for (const r of rungs) delete r.y;
  return { kind: 'LD', rungs };
}

/** Read PLCopen XML text → {name, company, pous: Map, globals, tasks, problems}. A file that cannot be parsed is one problem and an empty project. */
export function readPlcopen(text) {
  const problems = [], project = { name: '', company: '', pous: new Map(), globals: [], tasks: [], problems };
  let root; try { root = parseXml(text); } catch (e) { problems.push(problem('plcopen-xml', 'error', 'Not readable XML: ' + e.message)); return project; }
  if (root.name !== 'project') { problems.push(problem('plcopen-root', 'error', 'This is not a PLCopen project (root is <' + root.name + '>)')); return project; }
  const fh = kid(root, 'fileHeader'), ch = kid(root, 'contentHeader');
  project.company = fh ? fh.attrs.companyName || '' : ''; project.name = ch ? ch.attrs.name || '' : '';
  const types = kid(root, 'types'), dt = types && kid(types, 'dataTypes');
  if (dt && dt.children.length) problems.push(problem('plcopen-datatypes', 'error', 'The file defines its own data types (' + dt.children.length + '); user data types are not supported yet'));
  const pl = types && kid(types, 'pous');
  for (const p of pl ? kids(pl, 'pou') : []) {
    const name = p.attrs.name, type = p.attrs.pouType; if (!name) continue;
    const where = 'POU ' + name;
    if (!['program', 'functionBlock', 'function'].includes(type)) { problems.push(problem('plcopen-pou-type', 'error', where + ': pouType ' + type + ' is not supported')); continue; }
    const vars = [], itf = kid(p, 'interface'); let ret = null;
    if (itf) { const rt = kid(itf, 'returnType'); if (rt) ret = readType(rt, problems, where); for (const g of itf.children) if (GROUP_KIND[g.name]) readVars(g, GROUP_KIND[g.name], vars, problems, where); }
    const body = kid(p, 'body') || { children: [] }, b = body.children[0];
    let out = { kind: 'ST', stmts: [] };
    if (!b) problems.push(problem('plcopen-no-body', 'warning', where + ' has no body'));
    else if (b.name === 'ST') {
      const x = kid(b, 'xhtml'), txt = x ? x.text : b.text, r = parseBody(txt);
      for (const q of r.problems) problems.push({ ...q, message: where + ': ' + q.message, pou: name }); out = { kind: 'ST', stmts: r.stmts };
    } else if (b.name === 'LD') out = readLd(b, problems, where);
    else problems.push(problem('plcopen-body', 'error', where + ': the ' + b.name + ' body language is not supported yet (ST and LD are)'));
    project.pous.set(name.toUpperCase(), { type, name, ret, vars, body: out, line: 0 });
  }
  const inst = kid(root, 'instances'), cfgs = inst && kid(inst, 'configurations');
  for (const c of cfgs ? kids(cfgs, 'configuration') : []) {
    for (const g of kids(c, 'globalVars')) readVars(g, 'global', project.globals, problems, 'configuration');
    for (const r of kids(c, 'resource')) {
      for (const g of kids(r, 'globalVars')) readVars(g, 'global', project.globals, problems, 'resource');
      for (const t of kids(r, 'task')) { const pi = kid(t, 'pouInstance'), iv = parseTime(String(t.attrs.interval || '')); project.tasks.push({ name: t.attrs.name, interval: iv ?? 0, priority: Number(t.attrs.priority) || 0, program: pi ? pi.attrs.typeName : '' }); }
    }
  }
  return project;
}
void ELEMENTARY;
