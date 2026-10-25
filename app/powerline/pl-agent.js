/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: tool definitions and results are read by the assistant (MCP), not shown on the page (AGENTS-SPEC §5) */
/**
 * pl-agent.js — the Power lines workspace's tools for AI assistants and scripts (0.7 PL.8), in the shape civil-agent.js uses
 * (host.control.tool(def)); civilcraft.js registers them beside civilTools. No DOM: bin/test-powerline.mjs runs them on a Project.
 * Coordinates and heights in the project's units (easting x, northing y); forces in N, lengths inside results in metres where the
 * field name says _m. A design aid: every result says so; an engineer checks it.
 *
 *   powerlineTools(app) → [tool definitions]   app.project(), app.lib() → Map key → library item, app.groundAt(x, y), app.changed()
 *
 *   powerline_library_find  read  find library items (starter, the project's, the person's own) by kind and words → [{key, name, category, …}]
 *   powerline_line          edit  draw an overhead line (supports at points, a conductor, voltage, phases), or change one: add, move or
 *                                 remove supports, set the conductor or a support's item / role / height — one undo step → its checks
 *   powerline_route         edit  draw an underground cable route (points, cable, trench; ends attach to a support or equipment within
 *                                 2 m / 6 ft) — one undo step
 *   powerline_results       read  one line's sections (ruling span, governing case, tension per case), supports (role, loads, sizing,
 *                                 suggestion, foundation) and spans (length, sag per case, lowest clearance)
 *   powerline_checks        read  every problem in the project's power lines: codes, where, values
 *   powerline_stringing     read  one line's stringing tables (tension and sag at each temperature, per section)
 *   powerline_quantities    read  conductor, supports, equipment, cable, trench, joints
 */
import { emptyPowerlines } from './model.js';
import { analyzeLine } from './checks.js';
import { liveChecks } from './network.js';
import { stringingRows, quantities } from './outputs.js';
import { unitM } from './units.js';

const XY = { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } }, required: ['x', 'y'], additionalProperties: false };
const AID = 'A design aid: an engineer checks every result against the standard that applies.';
const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const KINDS = ['conductor', 'cable', 'support', 'equipment', 'trench'];

export function powerlineTools(app) {
  const P = () => app.project();
  const S = () => P().state.powerlines || emptyPowerlines();
  const units = () => (P().state.units === 'm' ? 'm' : 'ft');
  const nid = () => P().nextId('e');
  const edit = (label, fn) => { const r = P().change(label, (s) => { if (!s.powerlines) s.powerlines = emptyPowerlines(); fn(s.powerlines); }); app.changed?.(); return r; };
  const item = (kind, ref) => {
    if (ref == null || ref === '') return null;
    const m = app.lib();
    if (m.has(ref) && m.get(ref).kind === kind) return ref;
    const q = String(ref).toLowerCase();
    const hit = [...m.values()].filter((x) => x.kind === kind && x.name.toLowerCase().includes(q));
    const exact = hit.find((x) => x.name.toLowerCase() === q);
    if (exact) return exact.key;
    if (hit.length === 1) return hit[0].key;
    throw new Error(hit.length ? `"${ref}" matches ${hit.length} ${kind} items: ${hit.slice(0, 8).map((x) => x.key).join(', ')}. Give a key.` : `No ${kind} "${ref}". Use powerline_library_find.`);
  };
  const copyIn = (s, keys) => { s.items = s.items || []; const m = app.lib(); for (const k of keys) if (k && m.has(k) && !s.items.some((x) => x.key === k)) s.items.push(JSON.parse(JSON.stringify(m.get(k)))); };
  const analyse = (l) => analyzeLine(S(), l, { lib: app.lib(), groundAt: app.groundAt, units: units() });
  const findLine = (id) => { const l = S().lines.find((x) => x.id === id || x.name === id); if (!l) throw new Error(`No line "${id}".`); return l; };
  const brief = (l) => { const a = analyse(l); return { line: l.id, name: l.name, supports: l.supports.length, solved: a.ok, problems: a.issues.filter((x) => x.sev === 'error').map((x) => ({ code: x.code, support: x.support ?? null, span: x.span ?? null, vals: x.vals })), note: AID }; };
  const SUP = { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' }, name: { type: 'string' }, support: { type: 'string' }, role: { type: 'string', enum: ['auto', 'suspension', 'angle', 'deadend'] }, h: { type: 'number', exclusiveMinimum: 0 }, equip: { type: 'array', items: { type: 'string' }, maxItems: 20 } }, required: ['x', 'y'], additionalProperties: false };
  const supportOf = (q, base) => ({ id: nid(), x: q.x, y: q.y, name: String(q.name || '').slice(0, 40), support: item('support', q.support) || base.support, equip: (q.equip || []).map((e) => item('equipment', e)), role: q.role || 'auto', ground: null, h: q.h ?? null, existing: false });
  return [
    {
      name: 'powerline_library_find', group: 'read', title: 'Find power-line library items',
      description: 'Find conductors, underground cables, supports, equipment (crossarms, insulators, fittings, stays, transformers, cabinets, joints) or trench types in the library: the starter examples, the project\'s copy and the person\'s own items.',
      inputSchema: { type: 'object', properties: { kind: { type: 'string', enum: KINDS }, query: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 200 } }, additionalProperties: false },
      run: (a) => {
        const q = String(a.query || '').toLowerCase();
        const hit = [...app.lib().values()].filter((x) => (!a.kind || x.kind === a.kind) && (!q || (x.name + ' ' + (x.category || '') + ' ' + (x.maker || '')).toLowerCase().includes(q)));
        return { total: hit.length, items: hit.slice(0, a.limit || 25) };
      },
    },
    {
      name: 'powerline_line', group: 'edit', title: 'Draw or change an overhead line',
      description: 'Draw an overhead line through support points (at least two), or change an existing one: add supports (inserted on the nearest span), move or remove supports, set the conductor, a support\'s library item, role or height above ground. One undo step. Returns the line\'s problems.',
      inputSchema: { type: 'object', properties: {
        line: { type: 'string', description: 'An existing line id or name; leave out to draw a new line.' },
        name: { type: 'string' }, conductor: { type: 'string', description: 'A conductor key or name.' }, voltage_kV: { type: 'number', minimum: 0 }, phases: { type: 'integer', minimum: 1, maximum: 12 }, circuits: { type: 'integer', minimum: 1, maximum: 4 },
        supports: { type: 'array', items: SUP, maxItems: 2000, description: 'New line: its supports in order. Existing line: supports to add.' },
        move: { type: 'array', items: { type: 'object', properties: { support: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' }, h: { type: 'number' }, role: { type: 'string', enum: ['auto', 'suspension', 'angle', 'deadend'] }, item: { type: 'string' } }, required: ['support'], additionalProperties: false }, maxItems: 2000 },
        remove: { type: 'array', items: { type: 'string' }, maxItems: 2000 },
      }, additionalProperties: false },
      run: (a) => {
        if (!a.line) {
          if (!a.supports || a.supports.length < 2) throw new Error('A new line needs at least two supports.');
          const conductor = item('conductor', a.conductor) || 's-aluminium-alloy-19-3-15-mm', base = { support: 's-pole-concrete-12-6500' };
          const id = nid(), sup = a.supports.map((q, i) => ({ ...supportOf(q, base), name: String(q.name || `P${i + 1}`).slice(0, 40) }));
          edit('Draw a power line', (s) => { s.lines.push({ id, name: String(a.name || `Line ${s.lines.length + 1}`).slice(0, 120), conductor, phases: a.phases ?? 3, circuits: a.circuits ?? 1, voltage_kV: a.voltage_kV ?? 20, equip: [], clearance: 'ground', supports: sup }); copyIn(s, [conductor, ...sup.flatMap((p) => [p.support, ...p.equip])]); });
          return brief(findLine(id));
        }
        const l0 = findLine(a.line);
        const conductor = a.conductor ? item('conductor', a.conductor) : null;
        const add = (a.supports || []).map((q) => supportOf(q, { support: l0.supports[0]?.support }));
        const moves = (a.move || []).map((m) => ({ ...m, item: m.item ? item('support', m.item) : null }));
        // checked before the project changes: nothing is half done when a request is wrong
        for (const m of moves) if (!l0.supports.some((x) => x.id === m.support || x.name === m.support)) throw new Error(`No support "${m.support}" on ${l0.name}.`);
        const left = l0.supports.filter((p) => !(a.remove || []).includes(p.id) && !(a.remove || []).includes(p.name)).length + add.length;
        if (left < 2) throw new Error('A line keeps at least two supports.');
        edit('Change a power line', (s) => {
          const l = s.lines.find((x) => x.id === l0.id);
          if (a.name) l.name = String(a.name).slice(0, 120);
          if (conductor) l.conductor = conductor;
          if (a.voltage_kV != null) l.voltage_kV = a.voltage_kV;
          if (a.phases != null) l.phases = a.phases;
          if (a.circuits != null) l.circuits = a.circuits;
          for (const p of add) {
            let best = l.supports.length - 1, bd = Infinity;
            for (let i = 0; i < l.supports.length - 1; i++) {
              const A = l.supports[i], B = l.supports[i + 1], dx = B.x - A.x, dy = B.y - A.y, L2 = dx * dx + dy * dy, t = L2 > 0 ? Math.max(0, Math.min(1, ((p.x - A.x) * dx + (p.y - A.y) * dy) / L2)) : 0;
              const d = Math.hypot(p.x - A.x - dx * t, p.y - A.y - dy * t);
              if (d < bd) { bd = d; best = i; }
            }
            if (!p.name) p.name = `P${l.supports.length + 1}`;
            l.supports.splice(best + 1, 0, p);
          }
          for (const m of moves) {
            const p = l.supports.find((x) => x.id === m.support || x.name === m.support);
            if (m.x != null) p.x = m.x; if (m.y != null) p.y = m.y; if (m.h != null) p.h = m.h > 0 ? m.h : null; if (m.role) p.role = m.role; if (m.item) p.support = m.item;
          }
          if (a.remove?.length) l.supports = l.supports.filter((p) => !a.remove.includes(p.id) && !a.remove.includes(p.name));
          copyIn(s, [l.conductor, ...l.supports.flatMap((p) => [p.support, ...p.equip])]);
        });
        return brief(findLine(l0.id));
      },
    },
    {
      name: 'powerline_route', group: 'edit', title: 'Draw an underground cable route',
      description: 'Draw an underground cable route (points in order) with a cable and a trench type (keys or names). An end within 2 m (6 ft) of a support or equipment attaches to it. One undo step.',
      inputSchema: { type: 'object', properties: { points: { type: 'array', items: XY, minItems: 2, maxItems: 5000 }, cable: { type: 'string' }, trench: { type: 'string' }, count: { type: 'integer', minimum: 1, maximum: 64 }, name: { type: 'string' } }, required: ['points'], additionalProperties: false },
      run: (a) => {
        const cable = item('cable', a.cable) || 's-aluminium-4-150-mm-lv', trench = item('trench', a.trench) || 's-trench-footway-direct-burial';
        const tol = units() === 'm' ? 2 : 6, st = S();
        const end = (q) => {
          for (const e of st.equipment) if (Math.hypot(e.x - q.x, e.y - q.y) <= tol) return { equipment: e.id };
          for (const l of st.lines) for (const p of l.supports) if (Math.hypot(p.x - q.x, p.y - q.y) <= tol) return { line: l.id, support: p.id };
          return null;
        };
        const id = nid(), pts = a.points.map((q) => ({ x: q.x, y: q.y }));
        edit('Draw a cable route', (s) => { s.routes.push({ id, name: String(a.name || `Cable ${s.routes.length + 1}`).slice(0, 120), pts, cable, trench, count: a.count ?? 1, slack_pct: 3, from: end(pts[0]), to: end(pts[pts.length - 1]) }); copyIn(s, [cable, trench]); });
        const r = S().routes.find((x) => x.id === id);
        return { route: id, from: r.from, to: r.to, note: AID };
      },
    },
    {
      name: 'powerline_results', group: 'read', title: 'An overhead line\'s results',
      description: 'One line\'s sections (ruling span, governing load case, horizontal tension per case in N), supports (role, loads per case in N, largest equivalent load, strong enough, suggested item, foundation) and spans (length, sag per case, lowest clearance and what it needs), all in metres and N.',
      inputSchema: { type: 'object', properties: { line: { type: 'string' } }, required: ['line'], additionalProperties: false },
      run: (a) => {
        const l = findLine(a.line), r = analyse(l), um = unitM(units());
        return {
          line: l.id, solved: r.ok, note: AID,
          sections: r.sections.map((s) => ({ supports: [s.from + 1, s.to + 1], ruling_span_m: r3(s.Lr), governing: s.solve?.governing ?? null, H_N: s.solve?.ok ? Object.fromEntries(Object.entries(s.solve.cases).map(([k, v]) => [k, r3(v.H)])) : null })),
          supports: r.supports.map((s, i) => ({ name: l.supports[i].name, role: s.role, ground: r3(s.groundZ), attach: r3(s.attachZ), largest_N: r3(s.worstFeq), case: s.worstCase, strong_enough: s.sizeOk, suggest: s.suggest, foundation_m: s.foundation ? { depth: r3(s.foundation.depth_m), diameter: r3(s.foundation.dia_m) } : null })),
          spans: r.spans.map((sp) => { const sec = r.sections[sp.section], k = sec ? sec.spans.findIndex((x) => x.i === sp.i) : -1; return { span: sp.i + 1, length_m: r3(sp.L_m), sag_m: Object.fromEntries(S().rules.cases.map((c) => [c.id, r3(sec?.solve?.cases?.[c.id]?.spans?.[k]?.sag)])), lowest_clearance_m: sp.worst ? r3(sp.worst.margin_m + (sp.clear[sp.worst.caseId]?.need_m || 0)) : null, needs_m: sp.worst ? r3(sp.clear[sp.worst.caseId]?.need_m) : null }; }),
          units: { plan: units(), per_unit_m: um },
        };
      },
    },
    {
      name: 'powerline_checks', group: 'read', title: 'Power-line checks',
      description: 'Every problem in the project\'s power lines, cables and equipment: missing library data, items not in the library, disconnected cable ends, overloads, voltage drop, tension, clearance, spacing, swing, uplift and strength failures. Values in N, metres, A, %.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      run: () => {
        const analyses = new Map(S().lines.map((l) => [l.id, analyse(l)]));
        const issues = liveChecks(S(), app.lib(), { analyses, units: units() });
        return { total: issues.length, errors: issues.filter((x) => x.sev === 'error').length, issues, note: AID };
      },
    },
    {
      name: 'powerline_stringing', group: 'read', title: 'Stringing tables',
      description: 'One line\'s stringing tables: horizontal tension and sag of every span at each temperature, per section, in still air (project lengths; daN for a metres project, lbf for feet).',
      inputSchema: { type: 'object', properties: { line: { type: 'string' } }, required: ['line'], additionalProperties: false },
      run: (a) => ({ rows: stringingRows(analyse(findLine(a.line)), { units: units() }), note: AID }),
    },
    {
      name: 'powerline_quantities', group: 'read', title: 'Power-line quantities',
      description: 'Conductor length (catenary, all phases, + 2 %), supports and equipment by library item, underground cable, trench, excavation, ducts and joints.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      run: () => ({ rows: quantities(S(), new Map(S().lines.map((l) => [l.id, analyse(l)])), app.lib(), { units: units(), groundAt: app.groundAt }) }),
    },
  ];
}
