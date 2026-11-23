/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the Swept path tab (0.10 SW.4-SW.8): folds for Vehicle, Run, Clearance, Roundabout, Parking and Notes, over the alignments, lines and
 * parcels already in the project. Results are drawn into the project as plain feature lines on request (Stamp), one undo step each.
 */
import { writeDxf } from '../../dxf.js';
import { el, field, numInput, select, table, download, runPicture } from './ui.js';

const fx = (v, d = 2) => (Number.isFinite(v) ? Number(v).toLocaleString('en-US', { maximumFractionDigits: d }) : '–');
const MAX_STAMP = 600;
const thin = (P, n = 600) => { const k = Math.max(1, Math.ceil(P.length / n)); return P.filter((_, i) => i % k === 0 || i === P.length - 1); };

export function mountPanel(ctx, root) {
  const { t, SP, core, feat } = ctx;
  const U = () => ctx.units();
  const u = () => (U() === 'm' ? 'm' : 'ft');
  const status = el('p', { className: 'sp-note', role: 'status' });
  const say = (m) => { status.textContent = m || ''; };
  const P = () => ctx.project();
  const fold = (title, ...kids) => el('details', {}, el('summary', {}, title), ...kids);

  // ---------------- vehicles: the packs, and the person's own
  const mine = () => { try { return (ctx.api.storage.get('vehicles') || []).map((v) => SP.cleanVehicle(v)).filter((v) => !v.error); } catch { return []; } };
  const allVehicles = () => [...ctx.packs.flatMap((p) => p.vehicles.map((v) => ({ ...v, pack: p.name }))), ...mine().map((v) => ({ ...v, pack: t('sp.mine') }))];
  const vehSel = el('select', {}), vehNote = el('p', { className: 'sp-note' }), vehJson = el('textarea', { rows: 9, spellcheck: 'false' });
  const vehicle = () => allVehicles().find((v) => v.key === vehSel.value) || null;
  const fillVeh = () => {
    const keep = vehSel.value;
    vehSel.replaceChildren(...allVehicles().map((v) => el('option', { value: v.key }, `${v.name} — ${v.kind}${v.verified ? '' : ' · ' + t('sp.unverified')}`)));
    if (keep && allVehicles().some((x) => x.key === keep)) vehSel.value = keep;   // rebuilding the list must not throw the choice away
    const v = vehicle();
    vehNote.replaceChildren(v ? el('span', { className: v.verified ? '' : 'sp-warn' }, v.verified ? t('sp.verified', { src: v.source }) : t('sp.placeholder') + (v.uncited?.length ? ' ' + t('sp.uncited', { list: v.uncited.join(', ') }) : '')) : '');
    if (v) { const { pack, ...rest } = v; vehJson.value = JSON.stringify(rest, null, 1); }
  };
  vehSel.onchange = fillVeh;
  const vehOut = el('p', { className: 'sp-note' });
  const saveVeh = () => {
    let raw; try { raw = JSON.parse(vehJson.value); } catch { vehOut.textContent = t('sp.err.json'); return; }
    raw.verified = false; raw.key = String(raw.key || '').startsWith('my-') ? raw.key : 'my-' + String(raw.key || 'vehicle').replace(/^my-/, '');
    const v = SP.cleanVehicle(raw); if (v.error) { vehOut.textContent = t('sp.err.vehicle', { why: v.error }); return; }
    const list = mine().filter((x) => x.key !== v.key); list.push(v); ctx.api.storage.set('vehicles', list);
    fillVeh(); vehSel.value = v.key; fillVeh(); vehOut.textContent = t('sp.veh.saved', { name: v.name });
  };
  const vehicles = fold(t('sp.sec.vehicle'), field(t('sp.vehicle'), vehSel), vehNote,
    el('p', { className: 'sp-note' }, t('sp.veh.help')), field(t('sp.veh.json'), vehJson),
    el('div', { className: 'sp-row' }, el('button', { type: 'button', className: 'btn-line', onclick: saveVeh }, t('sp.veh.save')),
      el('button', { type: 'button', className: 'btn-line', onclick: () => download('vehicle.json', vehJson.value, 'application/json') }, t('sp.veh.export'))), vehOut);

  // ---------------- paths and obstacles from the project
  const pathSources = () => {
    const p = P(), s = p?.state; if (!s) return [];
    const out = [];
    for (const a of s.alignments || []) out.push({ id: 'a:' + a.id, label: t('sp.src.alignment', { name: a.name || a.id }), get: () => { const al = p.alignment(a); return al?.ok ? core.alignmentPath(al) : []; } });
    for (const f of s.features || []) if (!/^Swept path/.test(f.name || '')) out.push({ id: 'f:' + f.id, label: t('sp.src.line', { name: f.name || f.id }), get: () => (f.closed ? [...f.pts, { x: f.pts[0].x, y: f.pts[0].y }] : f.pts) });
    return out;
  };
  const flatLine = (pts, closed) => feat.flatten({ pts, closed }, { tol: 0.01 }).map((q) => ({ x: q.x, y: q.y }));
  const obstacleSources = () => {
    const s = P()?.state; if (!s) return [];
    return [...(s.features || []).filter((f) => !/^Swept path/.test(f.name || '')).map((f) => ({ id: 'f:' + f.id, name: f.name || f.id, pts: flatLine(f.pts, f.closed), closed: !!f.closed })),
      ...(s.parcels || []).filter((x) => Array.isArray(x.pts) && x.pts.length >= 3).map((x) => ({ id: 'p:' + x.id, name: x.name || x.id, pts: x.pts.map((q) => ({ x: q.x, y: q.y })), closed: true }))];
  };
  const pathSel = el('select', {}), modeSel = select([['forward', t('sp.forward')], ['reverse', t('sp.reverse')]], 'forward');
  const syncUnits = () => {
    if (unitsSeen === U()) return; unitsSeen = U(); const m = U() === 'm';
    for (const [inp, ft, mm] of [[rb.r, 80, 25], [rb.w, 22, 7], [rb.ap, 5, 1.5], [rb.lw, 26, 8], [pk.bw, 9, 2.5], [pk.bl, 18, 5], [pk.aisle, 24, 6]]) inp.value = String(m ? mm : ft);
    lastRb = null; lastPk = null;
  };
  const refreshSources = () => { const cur = pathSel.value; pathSel.replaceChildren(...pathSources().map((s) => el('option', { value: s.id }, s.label))); if (cur) pathSel.value = cur; };

  // ---------------- run
  const runOut = el('div'), range = el('input', { type: 'range', min: 0, max: 0, value: 0, hidden: true });
  const pic = el('div');
  const showPic = () => {
    if (!ctx.last) return;
    pic.replaceChildren(runPicture(ctx.last.res, { path: ctx.last.path, obstacles: ctx.last.obstacles || [], conflicts: ctx.last.clear?.conflicts || [], index: Number(range.value) }));
  };
  range.oninput = showPic;
  const doRun = () => {
    const v = vehicle(); const src = pathSources().find((x) => x.id === pathSel.value);
    if (!v || !src) return say(t('sp.err.nopath'));
    let path = src.get(); if (path.length < 2) return say(t('sp.err.nopath'));
    const railPath = v.kind === 'rail' ? SP.flattenBulge(path, 0.01) : path;
    const res = SP.run(v, v.kind === 'rail' ? railPath : path, { units: U(), mode: modeSel.value });
    if (!res.ok) return say(res.error || t('sp.err.other'));
    ctx.last = { v, res, path: SP.flattenBulge(path, 0.05), units: U(), mode: modeSel.value, obstacles: null, clear: null, srcId: src.id };
    range.max = String(res.frames.length - 1); range.value = '0'; range.hidden = false;
    renderRun(); say(t('sp.run.done', { n: res.frames.length }));
  };
  const renderRun = () => {
    const { v, res } = ctx.last, s = SP.summary(res, ctx.last.clear, { vehicle: v, units: U(), margin: ctx.last.margin || 0 });
    runOut.replaceChildren(
      !v.verified ? el('p', { className: 'sp-warn' }, t('sp.placeholder') + (v.uncited?.length ? ' ' + t('sp.uncited', { list: v.uncited.join(', ') }) : '')) : '',
      table([t('sp.item'), t('sp.value')], [
        { cells: [t('sp.r.length'), `${fx(s.length)} ${u()}`] },
        { cells: [t('sp.r.steer'), s.maxSteer == null ? '–' : `${fx(s.maxSteer, 1)}° / ${fx(s.steerLimit, 0)}°`] },
        ...(s.maxArticulation != null ? [{ cells: [t('sp.r.art'), `${fx(s.maxArticulation, 1)}° / ${fx(s.articulationLimit, 0)}°`] }] : []),
        ...(s.swath != null ? [{ cells: [t('sp.r.swath'), `${fx(s.swath)} ${u()}`] }] : []),
        ...(res.swing ? [{ cells: [t('sp.r.swing'), `${fx(res.swing.middle)} ${u()}`] }] : []),
        ...s.problems.map((p) => ({ cls: 'bad', cells: [t('sp.prob.' + p.kind), `${fx(p.value, 1)} > ${fx(p.limit, 1)} @ ${fx(p.s)} ${u()}`] })),
      ]),
      el('div', { className: 'sp-row' }, el('button', { type: 'button', className: 'btn-line', onclick: stampRun }, t('sp.stamp')),
        el('button', { type: 'button', className: 'btn-line', onclick: () => download('swept-path-report.csv', SP.csv(s)) }, t('sp.csv')),
        el('button', { type: 'button', className: 'btn-line', onclick: () => reportPdf(s) }, t('sp.pdf')),
        el('button', { type: 'button', className: 'btn-line', onclick: exportDxf }, t('sp.dxf'))));
    showPic();
  };

  // the report page: Markdown from the engine, flowed to a PDF by the shared report kit (one text kit, loaded when asked for)
  async function reportPdf(s) {
    try {
      const [{ parseMarkdown }, { docPdf }] = await Promise.all([import('./report/md-blocks.js'), import('./report/doc-pdf.js')]);
      const r = docPdf(parseMarkdown(SP.markdown(s, { title: t('sp.pdf.title') })), { title: t('sp.pdf.title'), paper: 'a4', footer: ctx.last?.v?.name || '' });
      const url = URL.createObjectURL(new Blob([r.bytes], { type: 'application/pdf' }));
      const a = el('a', { href: url, download: 'swept-path-report.pdf' }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) { say(String(err && err.message || err)); }
  }
  // exchange (SW.8): the run on named layers as DXF; DWG comes from CivilCraft's own writer after Draw into the project
  function exportDxf() {
    if (!ctx.last) return say(t('sp.err.norun'));
    const plan = SP.layerPlan(ctx.last.res, { clear: ctx.last.clear });
    const r = writeDxf({ units: U() === 'm' ? 'm' : 'ft', layers: plan.layers, entities: plan.items.map((x) => ({ type: 'poly', layer: x.layer, pts: x.pts, closed: x.closed, elev: 0 })) });
    download('swept-path.dxf', r.text, 'application/dxf'); say(t('sp.dxf.done', { n: plan.items.length }));
  }
  // ---------------- stamp: plain feature lines (use "off"), one undo step
  function stamp(lines, label) {
    const p = P(); if (!p || !lines.length) return 0;
    const made = lines.slice(0, MAX_STAMP).map((l) => feat.cleanFeature({ name: 'Swept path: ' + l.name, pts: l.pts.map((q) => ({ x: q.x, y: q.y, z: 0 })), closed: !!l.closed, use: 'off' }, U())).filter(Boolean);
    const ids = made.map(() => p.nextId('f'));
    p.change(label, (s) => { s.features = s.features || []; made.forEach((f, i) => s.features.push({ ...f, id: ids[i] })); });
    return made.length;
  }
  function runLines(L) {
    const { v, res } = L, lines = [];
    if (res.envelope?.loops) res.envelope.loops.forEach((lp, i) => lp.length >= 3 && lines.push({ name: `${v.name} envelope ${i + 1}`, pts: lp, closed: true }));
    const want = v.kind === 'road' ? (n) => /^wheel-(1|2)$/.test(n) || n === 'wheel-' + (res.traces.length - 1) || n === 'wheel-' + res.traces.length : (n) => !/^gear-|^bogie-/.test(n);
    for (const tr of res.traces) if (want(tr.name) && tr.pts.length >= 2) lines.push({ name: `${v.name} ${tr.name}`, pts: thin(tr.pts) });
    for (const i of [0, res.frames.length - 1]) for (const [j, B] of res.frames[i].bodies.entries()) lines.push({ name: `${v.name} ${i === 0 ? 'start' : 'end'} ${j + 1}`, pts: B, closed: true });
    return lines;
  }
  function stampRun() { if (!ctx.last) return say(t('sp.err.norun')); const n = stamp(runLines(ctx.last), t('sp.undo.run')); say(t('sp.stamped', { n })); }

  const run = fold(t('sp.sec.run'), field(t('sp.path'), pathSel), field(t('sp.mode'), modeSel), el('p', { className: 'sp-note' }, t('sp.run.help')),
    el('button', { type: 'button', className: 'btn-line', onclick: () => { refreshSources(); doRun(); } }, t('sp.run')), pic, range, runOut);

  // ---------------- clearance → Problems
  const margin = numInput(0.3, { min: 0 }), obsBox = el('div'), clrOut = el('div');
  let obsList = [];
  const refreshObs = () => { obsList = obstacleSources(); obsBox.replaceChildren(...obsList.map((o, i) => el('label', { className: 'sp-row' }, el('input', { type: 'checkbox', value: String(i), checked: true }), ' ' + o.name))); if (!obsList.length) obsBox.textContent = t('sp.obs.none'); };
  const doClear = () => {
    if (!ctx.last) return say(t('sp.err.norun'));
    const picked = [...obsBox.querySelectorAll('input:checked')].map((i) => obsList[Number(i.value)]).filter((o) => o.id !== ctx.last.srcId);   // the path itself is never an obstacle
    const m = Number(margin.value) || 0;
    const c = SP.check(ctx.last.res, picked, { margin: m });
    ctx.last.obstacles = picked; ctx.last.clear = c; ctx.last.margin = m;
    const list = [...c.conflicts.map((x) => ({ code: 'swept.conflict', part: 'conflict:' + x.id, severity: 'warning', msg: { key: 'sp.issue.conflict', vars: { name: x.name, s: fx(x.s), u: u(), d: fx(x.distance), v: ctx.last.v.name } }, text: t('sp.issue.conflict', { name: x.name, s: fx(x.s), u: u(), d: fx(x.distance), v: ctx.last.v.name }), about: [], ...(x.at ? { where: { space: '2d', at: [x.at.x, x.at.y] } } : {}) })),
      ...ctx.last.res.problems.map((p) => ({ code: 'swept.' + p.kind, part: 'run:' + p.kind, severity: 'warning', msg: { key: 'sp.issue.' + p.kind, vars: { v: ctx.last.v.name, value: fx(p.value, 1), limit: fx(p.limit, 1) } }, text: t('sp.issue.' + p.kind, { v: ctx.last.v.name, value: fx(p.value, 1), limit: fx(p.limit, 1) }), about: [], ...(SP.positionAt(ctx.last.res, p.s) ? { where: { space: '2d', at: [SP.positionAt(ctx.last.res, p.s).x, SP.positionAt(ctx.last.res, p.s).y] } } : {}) }))];
    try { ctx.problemsSource.set(list); } catch { /* a build without Problems */ }
    clrOut.replaceChildren(el('p', { className: c.ok ? '' : 'sp-warn' }, c.ok ? t('sp.clr.ok', { n: picked.length }) : t('sp.clr.hit', { n: c.conflicts.length })),
      table([t('sp.obstacle'), t('sp.at'), t('sp.dist')], [...c.conflicts.map((x) => ({ cls: 'bad', cells: [x.name, `${fx(x.s)} ${u()}`, fx(x.distance)] })), ...c.clear.map((x) => ({ cells: [x.name, '–', x.closest == null ? t('sp.far') : fx(x.closest)] }))]));
    renderRun();
  };
  const clearance = fold(t('sp.sec.clearance'), el('p', { className: 'sp-note' }, t('sp.clr.help')), obsBox, field(t('sp.margin', { u: u() }), margin),
    el('button', { type: 'button', className: 'btn-line', onclick: () => { syncUnits(); refreshObs(); } }, t('sp.refresh')), ' ', el('button', { type: 'button', className: 'btn-line', onclick: doClear }, t('sp.check')), clrOut);

  // ---------------- roundabout
  const rb = { x: numInput(0), y: numInput(0), r: numInput(U() === 'm' ? 25 : 80, { min: 1 }), w: numInput(U() === 'm' ? 7 : 22, { min: 0.1 }), ap: numInput(U() === 'm' ? 1.5 : 5, { min: 0 }),
    legs: el('input', { type: 'text', value: '0, 90, 180, 270' }), lw: numInput(U() === 'm' ? 8 : 26, { min: 0.1 }), drive: select([['right', t('sp.right')], ['left', t('sp.left')]], 'right') };
  const rbOut = el('div'); let lastRb = null;
  let unitsSeen = U();   // the sizes below are typed in the project's units: when the units change, they follow (a person's own edits after that stay)
  const rbArgs = () => ({ centre: { x: Number(rb.x.value), y: Number(rb.y.value) }, radius: Number(rb.r.value), width: Number(rb.w.value), apron: Number(rb.ap.value) || 0, drive: rb.drive.value,
    legs: rb.legs.value.split(/[,;\s]+/).filter(Boolean).map((a) => ({ angle: Number(a), width: Number(rb.lw.value) })).filter((l) => Number.isFinite(l.angle)) });
  const rbMake = () => { syncUnits(); const r = SP.roundabout(rbArgs()); if (!r.ok) { say(r.error); return null; } lastRb = r; return r; };
  const rbDraw = () => { const r = rbMake(); if (!r) return; const lines = [{ name: 'roundabout outer', pts: r.outer, closed: true }, { name: 'roundabout island', pts: r.island, closed: true }, ...(r.apron ? [{ name: 'roundabout apron', pts: r.apron, closed: true }] : []),
    ...r.legs.flatMap((l) => l.edges.map((e, i) => ({ name: `leg ${l.angle}° edge ${i + 1}`, pts: e })))]; say(t('sp.stamped', { n: stamp(lines, t('sp.undo.roundabout')) })); };
  const rbRun = async () => {
    const v = vehicle(); const r = lastRb || rbMake(); if (!r || !v) return;
    if (v.kind !== 'road') return say(t('sp.err.roadonly'));
    const obstacles = [{ id: 'island', name: t('sp.island'), pts: r.island, closed: true }, ...r.legs.flatMap((l) => l.edges.map((e, i) => ({ id: `leg${l.index}-${i}`, name: `leg ${l.angle}°`, pts: e })))];
    const rows = [];
    for (const mv of r.movements) {
      const res = SP.run(v, mv.path, { units: U(), envelope: false });
      const c = res.ok ? SP.check(res, obstacles.filter((o) => o.id === 'island'), { margin: 0 }) : null;
      rows.push({ cls: !res.ok || res.problems.length || (c && !c.ok) ? 'bad' : '', cells: [`${mv.from + 1} → ${mv.to + 1}${mv.uturn ? ' (U)' : ''}`, res.ok ? fx(res.maxSteer, 1) + '°' : '–', res.problems.length ? res.problems.map((p) => t('sp.prob.' + p.kind)).join(', ') : t('sp.none'), c && !c.ok ? t('sp.island.hit') : t('sp.none'), Number.isFinite(mv.minRadius) ? fx(mv.minRadius, 1) + ' ' + u() : '–'] });
      await new Promise((rs) => setTimeout(rs, 0));
    }
    rbOut.replaceChildren(el('p', { className: 'sp-note' }, t('sp.rb.note')), table([t('sp.movement'), t('sp.r.steer'), t('sp.problems'), t('sp.island'), t('sp.rb.tight')], rows));
  };
  const roundabout = fold(t('sp.sec.roundabout'), el('p', { className: 'sp-note' }, t('sp.rb.help')),
    el('div', { className: 'sp-row' }, field('x', rb.x), field('y', rb.y)), field(t('sp.rb.radius', { u: u() }), rb.r), field(t('sp.rb.lane', { u: u() }), rb.w), field(t('sp.rb.apron', { u: u() }), rb.ap),
    field(t('sp.rb.legs'), rb.legs), field(t('sp.rb.legw', { u: u() }), rb.lw), field(t('sp.rb.drive'), rb.drive),
    el('div', { className: 'sp-row' }, el('button', { type: 'button', className: 'btn-line', onclick: rbDraw }, t('sp.draw')), el('button', { type: 'button', className: 'btn-line', onclick: rbRun }, t('sp.rb.run'))), rbOut);

  // ---------------- parking
  const pk = { src: el('select', {}), ang: numInput(0), bw: numInput(U() === 'm' ? 2.5 : 9, { min: 0.1 }), bl: numInput(U() === 'm' ? 5 : 18, { min: 0.1 }), aisle: numInput(U() === 'm' ? 6 : 24, { min: 0.1 }), loaded: select([['2', t('sp.pk.double')], ['1', t('sp.pk.single')]], '2') };
  const pkOut = el('div'); let lastPk = null;
  const closedLines = () => (P()?.state?.features || []).filter((f) => f.closed && !/^Swept path/.test(f.name || ''));
  const refreshPk = () => pk.src.replaceChildren(...closedLines().map((f) => el('option', { value: f.id }, f.name || f.id)));
  const pkMake = () => {
    syncUnits();
    const f = closedLines().find((x) => x.id === pk.src.value); if (!f) { say(t('sp.err.noboundary')); return null; }
    const r = SP.parking({ boundary: flatLine(f.pts, true), angle: Number(pk.ang.value) || 0, bay: { width: Number(pk.bw.value), length: Number(pk.bl.value) }, aisle: Number(pk.aisle.value), loaded: Number(pk.loaded.value) });
    if (!r.ok) { say(r.error); return null; } lastPk = r; return r;
  };
  const pkDraw = () => { const r = pkMake(); if (!r) return; const lines = r.bays.slice(0, MAX_STAMP).map((b, i) => ({ name: 'bay ' + (i + 1), pts: b.poly, closed: true }));
    pkOut.replaceChildren(el('p', {}, t('sp.pk.count', { n: r.count, rows: r.rows })), r.count > MAX_STAMP ? el('p', { className: 'sp-warn' }, t('sp.pk.cap', { n: MAX_STAMP })) : ''); say(t('sp.stamped', { n: stamp(lines, t('sp.undo.parking')) })); };
  const pkCheck = () => {
    const v = vehicle(); const r = lastPk || pkMake(); if (!r || !v) return; if (v.kind !== 'road') return say(t('sp.err.roadonly'));
    const w = SP.worstBay(r); if (!w) return say(t('sp.pk.nobays'));
    const th = (r.angle || 0) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th), to = (p) => ({ x: p.x * c + p.y * s, y: -p.x * s + p.y * c }), back = (p) => ({ x: p.x * c - p.y * s, y: p.x * s + p.y * c });
    const ctr = to(w.centre), bl = Number(pk.bl.value), aisleDir = ctr.y < w.aisleY ? 1 : -1, ay = w.aisleY + aisleDir * Number(pk.aisle.value) / 2;
    // in the lot's own frame: along the aisle, then into the bay (the front axle ends two thirds of the way in); smoothed, then turned back
    const path = SP.chaikinPath([{ x: ctr.x - 3 * bl, y: ay }, { x: ctr.x, y: ay }, { x: ctr.x, y: w.aisleY - aisleDir * bl * 0.65 }], 4).map(back);
    const near = r.bays.filter((b) => b !== w && Math.hypot(b.centre.x - w.centre.x, b.centre.y - w.centre.y) < 4 * Math.max(Number(pk.bw.value), bl)).map((b, i) => ({ id: 'bay' + i, name: 'bay', pts: b.poly, closed: true }));
    const res = SP.run(v, path, { units: U(), envelope: false });
    if (!res.ok) return say(res.error);
    const cl = SP.check(res, near, { margin: 0.2 });
    ctx.last = { v, res, path, units: U(), mode: 'forward', obstacles: near, clear: cl, margin: 0.2 };
    range.max = String(res.frames.length - 1); range.value = '0'; range.hidden = false; renderRun();
    pkOut.replaceChildren(el('p', { className: cl.ok && !res.problems.length ? '' : 'sp-warn' }, cl.ok && !res.problems.length ? t('sp.pk.fine') : t('sp.pk.trouble', { n: cl.conflicts.length, p: res.problems.length })), el('p', { className: 'sp-note' }, t('sp.pk.note')));
  };
  const parking = fold(t('sp.sec.parking'), el('p', { className: 'sp-note' }, t('sp.pk.help')), field(t('sp.pk.boundary'), pk.src), field(t('sp.pk.angle'), pk.ang),
    field(t('sp.pk.bw', { u: u() }), pk.bw), field(t('sp.pk.bl', { u: u() }), pk.bl), field(t('sp.pk.aisle', { u: u() }), pk.aisle), field(t('sp.pk.loaded'), pk.loaded),
    el('div', { className: 'sp-row' }, el('button', { type: 'button', className: 'btn-line', onclick: () => { syncUnits(); refreshPk(); } }, t('sp.refresh')), el('button', { type: 'button', className: 'btn-line', onclick: pkDraw }, t('sp.pk.lay')),
      el('button', { type: 'button', className: 'btn-line', onclick: pkCheck }, t('sp.pk.check'))), pkOut);

  // ---------------- notes
  const notes = fold(t('sp.sec.notes'), el('p', { className: 'sp-note' }, t('sp.numbers')), el('p', { className: 'sp-note' }, t('sp.privacy')), ctx.packProblems.length ? el('p', { className: 'sp-warn' }, ctx.packProblems.join('; ')) : '');

  root.append(status, vehicles, run, clearance, roundabout, parking, notes);
  fillVeh(); refreshSources(); refreshObs(); refreshPk();
  // the tests and the lab pass drive the panel through this
  ctx.ui = { syncUnits, run: doRun, clear: doClear, stamp: stampRun, rbDraw, rbRun, pkDraw, pkCheck, vehSel, pathSel, modeSel, margin, rb, pk, status, range, refresh: () => { syncUnits(); refreshSources(); refreshObs(); refreshPk(); }, fillVeh };
}
