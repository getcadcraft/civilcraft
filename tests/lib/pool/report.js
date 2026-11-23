/* SPDX-License-Identifier: Apache-2.0 */
/**
 * report.js — a pool's figures as a CSV file (0.11 POOL.1). Host-free. Every figure a spec governs says where it came from (your own figure, the
 * spec, or a starting figure that is not from any standard) and, when from a spec, the standard, the clause and how we read it.
 * t(key, vars) = the host's translator (lang keys pool.*); with none, the keys print.
 */
import { citation } from './spec.js';

const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s; return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const line = (...c) => c.map(cell).join(',');
const n = (v, dp = 2) => (Number.isFinite(v) ? String(Number(v.toFixed(dp))) : '');

export function reportCsv(result, t = (k) => k) {
  const d = result.design, c = result.circ, q = result.quantities, out = [];
  out.push(line(t('pool.report.title'), d.name));
  out.push(line(t('pool.notice')));
  out.push(line(t('pool.report.spec'), result.spec ? result.spec.name : t('pool.spec.none')));
  out.push('');
  out.push(line(t('pool.report.figure'), t('pool.report.value'), t('pool.report.unit'), t('pool.report.from'), t('pool.report.source'), t('pool.report.read')));
  for (const [k, b] of Object.entries(result.basis)) {
    const src = b.from === 'spec' && b.source ? citation(result.spec, b.source) : '';
    out.push(line(t('pool.f.' + k), n(b.value, 4), t('pool.unit.' + k), t('pool.from.' + b.from), src, b.from === 'spec' && b.source ? t('pool.read.' + b.source.read) : ''));
  }
  out.push('');
  out.push(line(t('pool.report.circulation')));
  out.push(line(t('pool.q.water'), n(c.volume), 'm3'));
  out.push(line(t('pool.c.flow'), n(c.flow), 'm3/h'));
  out.push(line(t('pool.c.turnover'), n(c.turnoverH), 'h'));
  out.push(line(t('pool.c.filter'), c.filter.count + ' x ' + c.filter.diameter + ' mm', '', c.filter.fits ? '' : t('pool.c.nofit')));
  out.push(line(t('pool.c.filterRate'), n(c.filter.rate), 'm/h'));
  out.push(line(t('pool.c.pump'), c.pump.count + ' x ' + n(c.pump.flowEach) + ' m3/h', '', n(c.pump.head) + ' m, ' + n(c.pump.shaftKw) + ' kW, ' + c.pump.motorKw + ' kW'));
  out.push(line(t('pool.c.loop'), n(c.loop.total), 'm', n(c.loop.suction) + ' + ' + n(c.loop.ret) + ' + ' + n(c.loop.equip) + ' (' + t('pool.c.loopNote') + ')'));
  for (const [k, l] of Object.entries(c.lines)) if (l.flow > 0) out.push(line(t('pool.line.' + k), 'DN' + l.dn, '', n(l.flow) + ' m3/h, ' + n(l.velocity) + ' m/s'));
  out.push('');
  out.push(line(t('pool.report.quantities')));
  for (const r of q.rows) out.push(line(t('pool.q.' + r.id), n(r.value, r.unit === 'n' ? 0 : 2), r.unit === 'n' ? '' : r.unit, r.note ? t('pool.q.estimate') : ''));
  for (const p of q.pipes) out.push(line(t('pool.line.' + p.system) + ' DN' + p.dn, n(p.length), 'm', p.bends + ' ' + t('pool.q.bends') + (p.junctions ? ', ' + p.junctions + ' ' + t('pool.q.junctions') : '')));
  if (result.rebar) {
    out.push('');
    out.push(line(t('pool.report.bars')));
    out.push(line(t('pool.bar.mark'), t('pool.bar.where'), t('pool.bar.dia'), t('pool.bar.spacing'), t('pool.bar.count'), t('pool.bar.total'), t('pool.bar.mass')));
    for (const m of result.rebar.marks) out.push(line(m.mark, t('pool.bar.w.' + m.where), m.dia, m.spacing, m.count, n(m.total), n(m.mass, 1)));
    out.push(line(t('pool.bar.note')));
  }
  out.push('');
  out.push(line(t('pool.report.checks')));
  if (!result.spec) out.push(line(t('pool.spec.nonecheck')));
  else if (!result.checks.length) out.push(line(t('pool.check.none')));
  for (const r of result.checks) out.push(line(t('pool.sev.' + r.severity), t(r.key, { ...r.vars, what: r.vars.what ? t('pool.f.' + r.vars.what) : '' }), r.cite, r.read ? t('pool.read.' + r.read) : ''));
  for (const p of result.problems) out.push(line(t('pool.sev.warning'), t('pool.problem.' + p.code, p.vars || {})));
  return out.join('\n') + '\n';
}

const esc = (v) => String(v ?? '').replace(/[\\*_`|#[\]{}+!>~]/g, (c) => '\\' + c).replace(/[\r\n]+/g, ' ').trim();
const mdRow = (cells) => '| ' + cells.map((c) => esc(c) || '-').join(' | ') + ' |';
const mdTable = (head, rows) => [mdRow(head), '|' + head.map(() => ' --- |').join(''), ...rows.map(mdRow)].join('\n');

/**
 * The pool as one calculation page in Markdown (0.11 POOL.8): what a report binder sets in type. Every figure a spec governs says where it came
 * from; the notice stays at the top. fmt = { len(mm) → text } prints lengths in the person's units (millimetres when absent).
 */
export function reportMd(result, t = (k) => k, fmt = {}) {
  const d = result.design, c = result.circ, q = result.quantities, L = fmt.len || ((mm) => Math.round(mm) + ' mm'), out = [];
  out.push('# ' + esc(t('pool.report.title')) + ': ' + esc(d.name), '');
  out.push('> ' + esc(t('pool.notice')), '');
  out.push(esc(t('pool.report.spec')) + ': ' + esc(result.spec ? result.spec.name : t('pool.spec.none')), '');
  out.push('## ' + esc(t('pool.sec.shape')), '');
  out.push(mdTable([t('pool.report.figure'), t('pool.report.value')], [
    [t('pool.f.shape'), t('pool.opt.shape.' + d.shape)], [t('pool.f.length'), L(d.length)], [t('pool.f.width'), L(d.width)],
    [t('pool.f.depthShallow'), L(d.depthShallow)], [t('pool.f.depthDeep'), L(d.depthDeep)],
    [t('pool.r.area'), n(result.shape ? result.shape.area : c.surface) + ' m²'], [t('pool.r.perimeter'), n(result.shape ? result.shape.perimeter : 0) + ' m'],
    ...(result.steps && !result.steps.nofit ? [[t('pool.r.steps'), result.steps.risers + ' × ' + L(result.steps.riser) + ' / ' + L(result.steps.tread) + ' · ' + t('pool.r.side', { side: result.steps.edge })]] : []),
    ...(result.benches || []).filter((b) => b.fits).map((b, i) => [t('pool.r.bench', { n: i + 1 }), L(b.length) + ' · ' + t('pool.r.side', { side: b.side })]),
    ...(result.built.layout.gate ? [[t('pool.r.gate'), L(result.built.layout.gate.width) + ' · ' + t('pool.r.side', { side: result.built.layout.gate.side })]] : []),
  ]), '');
  out.push('## ' + esc(t('pool.report.governed')), '');
  out.push(mdTable([t('pool.report.figure'), t('pool.report.value'), t('pool.report.unit'), t('pool.report.from'), t('pool.report.source')],
    Object.entries(result.basis).map(([k, b]) => [t('pool.f.' + k), n(b.value, 4), t('pool.unit.' + k), t('pool.from.' + b.from), b.from === 'spec' && b.source ? citation(result.spec, b.source) + ' (' + t('pool.read.' + b.source.read) + ')' : ''])), '');
  out.push('## ' + esc(t('pool.report.circulation')), '');
  out.push(mdTable([t('pool.report.figure'), t('pool.report.value')], [
    [t('pool.q.water'), n(c.volume) + ' m³'], [t('pool.c.flow'), n(c.flow) + ' m³/h'], [t('pool.c.turnover'), n(c.turnoverH) + ' h'],
    [t('pool.c.filter'), c.filter.count + ' × ' + c.filter.diameter + ' mm, ' + n(c.filter.rate) + ' m/h'],
    [t('pool.c.pump'), c.pump.count + ' × ' + n(c.pump.flowEach) + ' m³/h, ' + n(c.pump.head) + ' m, ' + c.pump.motorKw + ' kW'],
    [t('pool.c.loop'), n(c.loop.total) + ' m = ' + n(c.loop.suction) + ' + ' + n(c.loop.ret) + ' + ' + n(c.loop.equip)],
    ...Object.entries(c.lines).filter(([, l]) => l.flow > 0).map(([k, l]) => [t('pool.line.' + k), 'DN' + l.dn + ', ' + n(l.flow) + ' m³/h, ' + n(l.velocity) + ' m/s']),
  ]), '');
  out.push(esc(t('pool.c.loopNote')), '', esc(t('pool.series.note')), '');
  out.push('## ' + esc(t('pool.report.quantities')), '');
  out.push(mdTable([t('pool.report.figure'), t('pool.report.value'), t('pool.report.unit')], [
    ...q.rows.map((r) => [t('pool.q.' + r.id) + (r.note ? ' (' + t('pool.q.estimate') + ')' : ''), n(r.value, r.unit === 'n' ? 0 : 2), r.unit === 'n' ? '' : r.unit.replace('m2', 'm²').replace('m3', 'm³')]),
    ...q.pipes.map((p) => [t('pool.line.' + p.system) + ' DN' + p.dn, n(p.length), 'm']),
  ]), '');
  if (result.rebar && result.rebar.marks.length) {
    out.push('## ' + esc(t('pool.report.bars')), '');
    out.push(mdTable([t('pool.bar.mark'), t('pool.bar.where'), t('pool.bar.dia'), t('pool.bar.spacing'), t('pool.bar.count'), t('pool.bar.total'), t('pool.bar.mass')],
      result.rebar.marks.map((m) => [m.mark, t('pool.bar.w.' + m.where), m.dia + ' mm', m.spacing + ' mm', m.count, n(m.total) + ' m', n(m.mass, 1) + ' kg'])), '');
    out.push(esc(t('pool.bar.note')), '');
  }
  out.push('## ' + esc(t('pool.report.checks')), '');
  const issues = [...result.checks.map((r) => '- ' + esc(t('pool.sev.' + r.severity)) + ': ' + esc(t(r.key, { ...r.vars, what: r.vars.what ? t('pool.f.' + r.vars.what) : '' })) + (r.cite ? ' (' + esc(r.cite) + ')' : '')),
    ...result.problems.map((p) => '- ' + esc(t('pool.sev.warning')) + ': ' + esc(t('pool.problem.' + p.code, p.vars || {})))];
  out.push(issues.length ? issues.join('\n') : esc(result.spec ? t('pool.check.none') : t('pool.spec.nonecheck')), '');
  return out.join('\n');
}

/**
 * The report binder page (SuperCad Studio's report binder, plugin `report-binder`): an add-on offers a page with
 *   (globalThis.ccBinderPages ||= []).push({ id, title(), md() }); dispatchEvent(new Event('cc-binder-pages'))
 * and the binder sets every offered page in type under Calculations when it is made. → a function that takes the page off again.
 */
export function offerBinderPage(page) {
  const g = globalThis, list = (g.ccBinderPages ||= []);
  const old = list.findIndex((p) => p && p.id === page.id);
  if (old >= 0) list.splice(old, 1);
  list.push(page);
  const say = () => { try { if (typeof g.dispatchEvent === 'function' && typeof g.Event === 'function') g.dispatchEvent(new g.Event('cc-binder-pages')); } catch { /* no page */ } };
  say();
  return () => { const i = list.indexOf(page); if (i >= 0) list.splice(i, 1); say(); };
}
