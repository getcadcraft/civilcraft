// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: the sentences here are the English fallback for a host with no catalog (keys audit.*, iface.*, verify.* in the host language file say the same) and file-format values */
/**
 * interfaces.js: LOD 350 interface rules between disciplines, host-free (0.10 booklet row BK.20, session bk-r3-checks-10).
 * No imports, no DOM. Synced byte-identical into <app>/dev/modelaudit/ (BimCraft, DetailCraft) by tools/modelaudit/sync.mjs; each
 * host has a thin adapter that reads ITS model into the plain shapes below. Millimetres.
 *
 * LOD 350 is where an element shows how it meets its neighbours. The rules here check the two interfaces a designer coordinates:
 *   1. a wall with its openings: every door / window sits in an opening (a void) of its wall, the opening fits inside the wall, two
 *      openings do not overlap, and an opening wider than a limit has a lintel / header over it: an element, or a note that says who
 *      provides it;
 *   2. service penetrations: a pipe, duct, cable tray or conduit that crosses a wall or slab has an opening or sleeve there.
 * Findings are reported per discipline pair (architecture | structure, plumbing | architecture …) as advisory Problems.
 *
 * THE LIMITS ARE DATA and CadCraft's own starting values, not taken from a standard (INTERFACE_LIMITS.note says so): a host or an
 * office overrides them (mergeInterfaceLimits).
 *
 *   openingRules(walls, openings, limits) → [finding]
 *       walls    = [{ id, label, length, height, discipline? ('architecture'), ref? (the host's own object kind for Problems: 'rc', 'panel') }]
 *       openings = [{ id, label, kind: 'door' | 'window' | 'opening', host (wall id | null), hasVoid (bool), offset (along the wall,
 *                     from its start to the opening's near edge), width, sill (above the wall's base), height,
 *                     lintel: { element?: id | true, note?: string } | null }]
 *   penetrationRules(crossings, sleeves, limits) → [finding]
 *       crossings = [{ service: { id, label, discipline, kind }, host: { id, label, discipline, kind }, at: [x, y, z] | null }]
 *       sleeves   = [{ host (id), box: [x0, y0, z0, x1, y1, z1] }]   openings / sleeves a host knows by their place (optional)
 *   finding = { code, pair ('architecture|structure'), severity, about: [{ id, label }], vars, req?, found? }
 *   interfaceProblems(findings, { t }) → [problem]      the shared Problems shape; code 'iface.*', part = the pair
 *   INTERFACE_CODES, interfaceWords(key, vars)
 */
export const INTERFACE_LIMITS = Object.freeze({
  note: 'CadCraft starting values, not a standard: set them to your project\'s rules.',
  lintelOver: 1000,       // an opening wider than this needs a lintel / header (element or note); a common single door is under it
  edge: 0,                // an opening may come this close to its wall's end
  head: 0,                // … and this close to its wall's top
  tolerance: 1,           // slack on every comparison
  sleeveReach: 50,        // a crossing this close to a known sleeve box counts as passing through it
});
export function mergeInterfaceLimits(over) {
  const out = { ...INTERFACE_LIMITS };
  for (const k of ['lintelOver', 'edge', 'head', 'tolerance', 'sleeveReach']) if (over && Number.isFinite(over[k]) && over[k] >= 0) out[k] = over[k];
  return out;
}
export const INTERFACE_CODES = ['iface.opening.novoid', 'iface.opening.nohost', 'iface.opening.fit', 'iface.opening.overlap', 'iface.lintel.missing', 'iface.penetration'];

const EN = {
  'iface.opening.novoid': '{label} has no opening in its wall.',
  'iface.opening.nohost': '{label} is not in a wall.',
  'iface.opening.fit': '{label} does not fit inside {wall}: {why}.',
  'iface.opening.overlap': '{label} and {other} overlap in {wall}.',
  'iface.lintel.missing': '{label} is {width} mm wide (over {limit} mm) and has no lintel or header, and none is noted.',
  'iface.penetration': '{service} crosses {host} with no opening or sleeve.',
  'iface.why.start': 'it starts {by} mm before the wall does', 'iface.why.end': 'it runs {by} mm past the wall\'s end',
  'iface.why.top': 'it is {by} mm taller than the wall allows', 'iface.why.base': 'it starts {by} mm below the wall\'s base', 'iface.why.size': 'it has no size',
};
export function interfaceWords(key, vars = {}) { return String(EN[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m)); }

const pair = (a, b) => [a || 'other', b || 'other'].sort().join('|');
const r1 = (v) => Math.round(v);

export function openingRules(walls, openings, limits = INTERFACE_LIMITS) {
  const L = mergeInterfaceLimits(limits), tol = L.tolerance, out = [];
  const byId = new Map((walls || []).map((w) => [w.id, w]));
  const inWall = new Map();
  for (const o of openings || []) {
    const me = { id: o.id, label: o.label || o.kind || 'Opening', ...(o.ref ? { kind: o.ref } : {}) };
    const w = o.host !== null && o.host !== undefined ? byId.get(o.host) : null;
    const wd = w?.discipline || 'architecture';
    if (!w) { out.push({ code: 'iface.opening.nohost', pair: pair('architecture', 'architecture'), severity: 'warning', about: [me], vars: { label: me.label } }); continue; }
    const wl = { id: w.id, label: w.label || 'Wall', ...(w.ref ? { kind: w.ref } : {}) };
    if (o.hasVoid === false) out.push({ code: 'iface.opening.novoid', pair: pair('architecture', wd), severity: 'warning', about: [me, wl], vars: { label: me.label } });
    const why = [];
    if (!(o.width > 0) || !(o.height > 0)) why.push(['size', 0]);
    else {
      if (o.offset < L.edge - tol) why.push(['start', r1(L.edge - o.offset)]);
      if (Number.isFinite(w.length) && o.offset + o.width > w.length - L.edge + tol) why.push(['end', r1(o.offset + o.width - (w.length - L.edge))]);
      if (Number.isFinite(o.sill) && o.sill < -tol) why.push(['base', r1(-o.sill)]);
      if (Number.isFinite(w.height) && w.height > 0 && Number.isFinite(o.sill) && o.sill + o.height > w.height - L.head + tol) why.push(['top', r1(o.sill + o.height - (w.height - L.head))]);
    }
    for (const [k, by] of why) out.push({ code: 'iface.opening.fit', pair: pair('architecture', wd), severity: 'warning', about: [me, wl], part: k,
      vars: { label: me.label, wall: wl.label, why: interfaceWords('iface.why.' + k, { by }), by, reason: k } });
    if (o.width > L.lintelOver + tol && !(o.lintel && (o.lintel.element || String(o.lintel.note || '').trim()))) {
      out.push({ code: 'iface.lintel.missing', pair: pair('architecture', 'structure'), severity: 'warning', about: [me, wl],
        vars: { label: me.label, width: r1(o.width), limit: r1(L.lintelOver) }, req: { op: '<=', value: r1(L.lintelOver), unit: 'mm' }, found: { value: r1(o.width), unit: 'mm' } });
    }
    if (o.width > 0) { if (!inWall.has(w.id)) inWall.set(w.id, []); inWall.get(w.id).push({ o, me, wl, wd }); }
  }
  for (const list of inWall.values()) {
    list.sort((a, b) => a.o.offset - b.o.offset);
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      if (b.o.offset >= a.o.offset + a.o.width - tol) break;
      const az0 = Number.isFinite(a.o.sill) ? a.o.sill : 0, bz0 = Number.isFinite(b.o.sill) ? b.o.sill : 0;
      if (Math.min(az0 + a.o.height, bz0 + b.o.height) - Math.max(az0, bz0) <= tol) continue;   // one above the other
      out.push({ code: 'iface.opening.overlap', pair: pair('architecture', a.wd), severity: 'warning', about: [a.me, b.me, a.wl], vars: { label: a.me.label, other: b.me.label, wall: a.wl.label } });
    }
  }
  return out;
}

const inBox = (p, b, reach) => p[0] >= b[0] - reach && p[0] <= b[3] + reach && p[1] >= b[1] - reach && p[1] <= b[4] + reach && p[2] >= b[2] - reach && p[2] <= b[5] + reach;
export function penetrationRules(crossings, sleeves = [], limits = INTERFACE_LIMITS) {
  const L = mergeInterfaceLimits(limits), out = [], seen = new Set();
  for (const c of crossings || []) {
    if (!c?.service || !c?.host) continue;
    const k = c.service.id + '|' + c.host.id;
    if (seen.has(k)) continue;
    seen.add(k);
    if (c.at && sleeves.some((s) => s.host === c.host.id && inBox(c.at, s.box, L.sleeveReach))) continue;
    out.push({ code: 'iface.penetration', pair: pair(c.service.discipline, c.host.discipline), severity: 'warning',
      about: [{ id: c.service.id, label: c.service.label || c.service.kind || 'Service' }, { id: c.host.id, label: c.host.label || c.host.kind || 'Element' }],
      vars: { service: c.service.label || c.service.kind || 'Service', host: c.host.label || c.host.kind || 'Element' } });
  }
  return out;
}

export function interfaceProblems(findings, { t = null, kind = 'element' } = {}) {
  const say = (key, vars) => { if (t) { const s = t(key, vars); if (s && s !== key) return s; } return interfaceWords(key, vars); };
  return (findings || []).map((f) => {
    const vars = { ...f.vars };
    if (f.code === 'iface.opening.fit' && t) { const w = t('iface.why.' + vars.reason, { by: vars.by }); if (w && w !== 'iface.why.' + vars.reason) vars.why = w; }
    const p = { code: f.code, severity: f.severity || 'warning', part: f.pair + (f.part ? '.' + f.part : ''), msg: { key: f.code, vars }, text: say(f.code, vars),
      about: f.about.map((a) => ({ kind: a.kind || kind, id: String(a.id), label: String(a.label || a.id) })), source: { name: 'interfaces ' + f.pair } };
    if (f.req) p.req = f.req;
    if (f.found) p.found = f.found;
    return p;
  });
}

/** How many findings each discipline pair has: [{ pair, n, codes: { code: n } }] sorted by pair. */
export function byPair(findings) {
  const m = new Map();
  for (const f of findings || []) { const e = m.get(f.pair) || { pair: f.pair, n: 0, codes: {} }; e.n++; e.codes[f.code] = (e.codes[f.code] || 0) + 1; m.set(f.pair, e); }
  return [...m.values()].sort((a, b) => (a.pair < b.pair ? -1 : 1));
}
