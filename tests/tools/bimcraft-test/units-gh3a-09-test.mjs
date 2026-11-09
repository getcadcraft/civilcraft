/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --units09` (0.9 GH.3-A, session units-gh3a-09): the last places that kept their own units.
 * DOM-free: the small-length and point helpers (lib/units/display-units.js), model-units.js lengthHooks (shown, typed, parsed in
 * all six units), and the shared frame panel (frame/frame-panel.js + frame-concrete-panel.js) drawn with a stand-in el():
 * with BimCraft's host.len the load positions, node points, floor heights and typed positions follow the unit; without it
 * (DetailCraft) every string is exactly what it was (millimetres).
 */
import fs from 'node:fs';
import path from 'node:path';

export async function units09Mode({ APP, ROOT }) {
  const U = await import(path.join(APP, 'model-units.js'));
  const FP = await import(path.join(APP, 'frame/frame-panel.js'));
  const EN = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
  const ES = JSON.parse(fs.readFileSync(path.join(APP, 'lang/es-MX.json'), 'utf8'));
  let bad = 0, good = 0;
  const ok = (c, m) => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
  const t = (k, v = {}) => String(EN[k] ?? k).replace(/\{(\w+)\}/g, (m, n) => (n in v ? String(v[n]) : m));

  console.log('== small lengths and points in the six units');
  const SMALL = { ftin: ['0.492', 'in'], in: ['0.492', 'in'], ftdec: ['0.492', 'in'], mm: ['12.50', 'mm'], cm: ['1.250', 'cm'], m: ['0.01250', 'm'] };
  for (const u of U.UNITS) ok(U.smallNumber(12.5, u) === SMALL[u][0] && U.smallMark(u) === SMALL[u][1], u + ': 12.5 mm deflection → ' + U.smallNumber(12.5, u) + ' ' + U.smallMark(u));
  ok(U.smallNumber(-0.0001, 'mm') === '0.00' && U.smallNumber(NaN, 'mm') === '', 'no -0.00, NaN → empty');
  const PT = { ftin: '(9.843, 0.000, 3.281) ft', in: '(118.11, 0.00, 39.37) in', ftdec: '(9.843, 0.000, 3.281) ft', mm: '(3000.0, 0.0, 1000.0) mm', cm: '(300.00, 0.00, 100.00) cm', m: '(3.000, 0.000, 1.000) m' };
  for (const u of U.UNITS) ok(U.pointText([3000, 0, 1000], u) === PT[u], u + ': point ' + U.pointText([3000, 0, 1000], u));

  console.log('== lengthHooks (the frame panel host.len) shown, typed and read back');
  const TEXT = { ftin: "4'-11 1/16\"", in: '59.055 in', ftdec: '4.92 ft', mm: '1500 mm', cm: '150 cm', m: '1.5 m' };
  const MARK = { ftin: 'ft-in', in: 'in', ftdec: 'ft', mm: 'mm', cm: 'cm', m: 'm' };
  for (const u of U.UNITS) {
    const L = U.lengthHooks(u);
    const back = L.parse(L.num(1500));
    ok(L.text(1500) === TEXT[u] && L.mark() === MARK[u] && Math.abs(back - 1500) < (u === 'ftin' ? 1.6 : 0.6), u + ': ' + L.text(1500) + ' · mark ' + L.mark() + ' · typed "' + L.num(1500) + '" reads ' + back.toFixed(2) + ' mm');
  }
  ok(U.lengthHooks('ftin').parse('1500 mm') === 1500 && U.lengthHooks('m').parse("5'") === 1524, 'a typed unit mark wins over the pick');
  ok(Number.isNaN(U.lengthHooks('m').parse('abc')), 'not a length → NaN');
  let pick = 'mm';
  const live = U.lengthHooks(() => pick);
  const before = live.text(1000); pick = 'ftin';
  ok(before === '1000 mm' && live.text(1000) === "3'-3 3/8\"", 'hooks read the unit again on every call (a unit change shows at the next draw)');

  console.log('== words: new -u keys in en and es-MX, old keys kept for DetailCraft');
  const KEYS = ['frame.ui.col-defl-u', 'frame.ui.f-from-u', 'frame.ui.f-to-u', 'frame.ui.f-at-u', 'frame.ui.load-range-u', 'frame.ui.load-point-u', 'frame.eq.allowed-u', 'fieldpts.cmp.units.u'];
  ok(KEYS.every((k) => EN[k] && ES[k]), 'en + es-MX have ' + KEYS.length + ' new keys');
  ok(['frame.ui.col-defl', 'frame.ui.f-from', 'frame.ui.load-range', 'frame.ui.load-point', 'frame.eq.allowed'].every((k) => EN[k] && /mm/.test(EN[k])), 'old mm keys unchanged');
  const DC = JSON.parse(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps/detailcraft/dev/lang/en.json'), 'utf8'));
  ok(KEYS.slice(0, 7).every((k) => DC[k] === EN[k]), 'DetailCraft carries the same frame words (tools/frame/sync.mjs)');

  console.log('== the frame panel with and without host.len');
  const el = (tag, props, ...kids) => ({ tag, props: props || {}, kids: kids.flat(Infinity).filter((x) => x !== null && x !== undefined && x !== false) });
  const text = (n) => (n == null ? '' : typeof n !== 'object' ? String(n) : [n.props?.value ?? '', ...(n.kids || []).map(text)].join(' '));
  const find = (n, pred, out = []) => { if (n && typeof n === 'object') { if (pred(n)) out.push(n); for (const k of n.kids || []) find(k, pred, out); } return out; };
  const settings = FP.defaultAnalysis(t);
  settings.cases[0].loads.push({ type: 'udl', member: 'B1', dir: 'Z', w: -2, a: 1500, b: 3000 }, { type: 'point', member: 'B1', dir: 'Z', P: -5000, a: 1500 }, { type: 'node', at: [3000, 0, 1000], F: [0, 0, -1000, 0, 0, 0] });
  settings.concrete = { floors: [{ id: 'F1', name: 'F1', z: 3500, w: 0 }] };
  const host = (len) => {
    const h = { el, t, cls: { block: 'b', note: 'n', head: 'h', table: 't', btn: 'x', primary: 'p', link: 'l', select: 's', input: 'i', error: 'e' },
      version: () => 1, analysis: () => h.saved || settings, setAnalysis: (label, next) => { h.saved = next; return true; },
      analyse: () => { throw new Error('not in this test'); }, selection: () => ['B1'],
      member: (id) => (id === 'B1' ? { label: 'Beam 1', type: 'beam', profile: 'W8X10', start: [0, 0, 3000], end: [6000, 0, 3000] } : null),
      select() {}, print: (s) => { h.printed = s; }, download() {}, fileName: () => 'x', show: () => ({ max: 0, scale: 0 }), hide() {},
      concrete: true, sections: () => [], problems() {} };
    if (len) h.len = len;
    return h;
  };
  const dcHost = host(null), dc = FP.framePanel(dcHost);
  const dcText = dc.panel().map(text).join(' ');
  ok(dcText.includes(', from 1500 to 3000 mm') && dcText.includes('at 1500 mm') && dcText.includes('(3000, 0, 1000)'), 'no host.len (DetailCraft): loads read "from 1500 to 3000 mm", "at 1500 mm", "(3000, 0, 1000)" as before');
  ok(dcText.includes(EN['frame.ui.f-from']) && dcText.includes('z (mm)'), 'no host.len: labels "From (mm, …)" and "z (mm)" as before');
  for (const u of U.UNITS) {
    const h = host(U.lengthHooks(u)), P = FP.framePanel(h);
    const nodes = P.panel(), s = nodes.map(text).join(' ');
    const L = U.lengthHooks(u);
    const want = [t('frame.ui.load-range-u', { a: L.text(1500), b: L.text(3000) }), 'at ' + L.text(1500), U.pointText([3000, 0, 1000], u), t('frame.ui.f-from-u', { u: L.mark() }), 'z (' + L.mark() + ')', L.num(3500)];
    const miss = want.filter((w) => !s.includes(w));
    ok(!miss.length && !/\d mm\b/.test(s.replace(/W8X10/, '')) === (u !== 'mm'), u + ': loads, node point, From label, floor z follow the unit' + (miss.length ? ' — missing ' + miss.join(' | ') : ''));
    // typing a load position in the pick: 1.5 m / 4'-11" / … → stored in mm
    const inA = find({ kids: nodes }, (n) => n.props?.['data-fa-load'] === 'a')[0];
    const inV = find({ kids: nodes }, (n) => n.props?.['data-fa-load'] === 'value')[0];
    const addB = find({ kids: nodes }, (n) => n.props?.['data-fa-load-add'] === '')[0];
    inV.props.oninput({ target: { value: '3' } });
    inA.props.oninput({ target: { value: L.num(2000) } });
    const inB = find({ kids: nodes }, (n) => n.props?.['data-fa-load'] === 'b')[0];
    inB.props.oninput({ target: { value: '' } });
    addB.props.onclick?.();
    const added = h.saved?.cases[0].loads.at(-1);
    ok(added && added.type === 'udl' && Math.abs(added.a - 2000) < 1.6, u + ': typed "' + L.num(2000) + '" is kept as ' + (added ? added.a.toFixed(1) : '?') + ' mm');
    // a floor height typed in the pick
    const zIn = find({ kids: nodes }, (n) => n.props?.['data-fa-eq-floor'] === 'F1:z')[0];
    zIn?.props.onchange({ target: { value: L.num(4000) } });
    ok(zIn && Math.abs((h.saved?.concrete?.floors?.[0]?.z ?? 0) - 4000) < 1.6, u + ': floor z typed "' + L.num(4000) + '" is kept as ' + (h.saved?.concrete?.floors?.[0]?.z ?? '?') + ' mm');
  }

  console.log('== copies are the library (byte-identical)');
  for (const f of ['display-units.js']) ok(fs.readFileSync(path.join(ROOT, 'lib/units', f), 'utf8') === fs.readFileSync(path.join(APP, f), 'utf8'), 'lib/units/' + f + ' = bimcraft/dev/' + f);
  for (const f of ['frame-panel.js', 'frame-concrete-panel.js']) for (const app of ['bimcraft', 'detailcraft', 'cadcraft'])
    ok(fs.readFileSync(path.join(ROOT, 'lib/frame', f), 'utf8') === fs.readFileSync(path.join(ROOT, 'public_html/assets/apps', app, 'dev/frame', f), 'utf8'), 'lib/frame/' + f + ' = ' + app + '/dev/frame/' + f);

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
