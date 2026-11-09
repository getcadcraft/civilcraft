/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panels.js — the run panels of the Chip design add-on (0.9 HD.4–HD.9), in the shape every Chip design module uses:
 *   panels(ctx) → [{ id, title, mount(el, ctx) }]
 * ctx (from the add-on's main.js): files { list(), read(name), readBytes(name), write(name, data), remove(name) }, problems { set(source, rows) },
 * t(key, vars), and for the runners: project { get(), save(p) }, runner (Studio's, or null on the web), script() → Promise<bytes>,
 * fmt() → Promise<{ def, lef, stil } | {}> (chip-formats' modules when present), download(name, bytes, type), pick({ accept, multiple }) →
 * Promise<[{ name, bytes }]>, onChange(fn) → off, busy(on).
 *
 * Panels: Flow (stages, their tools and options, Run in Studio, Save the run package for the web or by hand, Open a result, each run's
 * input/output hashes and tool versions, the reports), Waves (VCD viewer; FST said plainly), Floorplan (DEF floorplan / placement / routing; the GDS layout is chip-formats' Layout tab).
 */
import { runStage, planStage, readStage, stilFrom } from './flow.js';
import { makePackage, resultOf } from './runner.js';
import { lastRun, repeatable, hashFiles, writeProject, toolsFor, recordRun } from './project.js';
import { readVcd, isFst } from './vcd.js';
import { mountWaves } from './wave-view.js';
import { mountLayout } from './layout-view.js';
import { probeSteps, parseVersion, TOOLS } from './tools.js';

const h = (d, tag, props = {}, ...kids) => { const e = d.createElement(tag); for (const [k, v] of Object.entries(props)) { if (k === 'class') e.className = v; else if (k.startsWith('data-') || k.startsWith('aria-') || k === 'role' || k === 'for') e.setAttribute(k, v); else e[k] = v; } for (const c of kids) if (c !== null && c !== undefined) e.append(c); return e; };
const short = (hex) => (hex ? hex.slice(0, 10) : '');
const dec = new TextDecoder();

/** Save a run's files into the project under out/<stage>/ (so a later stage can name them) and show its rows in Problems. */
async function keep(ctx, stage, res) {
  for (const [name, bytes] of Object.entries(res.files || {})) {
    if (/^out\/log-/.test(name) && bytes.length > 2e6) continue;
    await ctx.files.write('out/' + stage.id + '/' + name.replace(/^out\//, ''), bytes);
  }
  ctx.problems.set(stage.kind === 'stil' ? 'gls' : stage.kind, res.rows || []);
}

function summaryBlock(d, t, stage, res) {
  const box = h(d, 'div', { class: 'chip-summary', 'data-chip-summary': stage.id });
  const line = (k, vars) => box.append(h(d, 'div', {}, t(k, vars)));
  const s = res.summary || {};
  if (stage.kind === 'synth' && s.stat) {
    line('chip.sum.cells', { n: s.stat.cells, top: s.stat.top || '' });
    if (s.stat.area !== null && s.stat.area !== undefined) line('chip.sum.area', { area: s.stat.area });
    if (s.timing?.delayPs !== null && s.timing?.delayPs !== undefined) line('chip.sum.delay', { ps: s.timing.delayPs });
    const types = Object.entries(s.stat.modules?.[s.stat.top]?.types || {});
    if (types.length) box.append(h(d, 'div', { class: 'chip-muted' }, types.map(([k, v]) => k + ' ' + v).join(' · ')));
  }
  if (stage.kind === 'pnr') { if (s.area !== null) line('chip.sum.pnr', { area: s.area ?? '—', util: s.util ?? '—', wns: s.wns ?? s.worst ?? '—' }); if (s.layoutNote) line('chip.sum.nodef'); }
  if (stage.kind === 'drc') line(s.count === null ? 'chip.sum.drc.none' : 'chip.sum.drc', { n: s.count });
  if (stage.kind === 'lvs' && s.circuits) line(s.match ? 'chip.sum.lvs.ok' : 'chip.sum.lvs.bad', { n: s.circuits.length });
  if (stage.kind === 'sim' || stage.kind === 'gls') line(res.waves ? 'chip.sum.waves' : 'chip.sum.nowaves');
  const errs = (res.rows || []).filter((r) => r.severity === 'error').length, warns = (res.rows || []).filter((r) => r.severity === 'warning').length;
  line('chip.sum.rows', { errors: errs, warnings: warns });
  return box;
}

function flowPanel(el, ctx) {
  const d = el.ownerDocument, t = ctx.t;
  const shown = new Map();   // stage id → the last result shown, kept across redraws (a run writes files, which redraws the panel)
  let gen = 0;
  const draw = async () => {
    const my = ++gen;   // a newer draw wins; this one builds off-page and is dropped
    const p = ctx.project.get();
    const box = d.createElement('div');
    const names = ctx.files.list();
    const where = ctx.runner ? t('chip.flow.studio') : t('chip.flow.web');
    box.append(h(d, 'p', { class: 'chip-note', 'data-chip-where': ctx.runner ? 'studio' : 'web' }, where));
    const tools = h(d, 'div', { class: 'chip-row' });
    const probe = h(d, 'button', { type: 'button', class: 'chip-btn', textContent: t('chip.flow.probe'), disabled: !ctx.runner, 'data-chip-probe': '1' });
    probe.addEventListener('click', async () => {
      ctx.busy(true);
      try {
        const res = await ctx.runner.run(makePackage({ files: {}, steps: probeSteps(), collect: ['out/'], toolsDir: p.tools.folder, pdkDir: p.tools.pdk, script: await ctx.script() }));
        for (const id of Object.keys(TOOLS)) { const f = res.files['out/version-' + id + '.txt']; const st = res.record?.steps.find((s) => s.label === 'version ' + id); p.tools.versions[id] = st && st.code === 0 && f ? parseVersion(id, dec.decode(f)) || 'found' : ''; }
        ctx.project.save(p);
      } catch (e) { ctx.say?.(t('chip.flow.failed', { why: e.code || e.message })); }
      ctx.busy(false); draw();
    });
    tools.append(probe, h(d, 'span', { class: 'chip-muted' }, Object.entries(p.tools.versions).filter(([, v]) => v).map(([k, v]) => k + ': ' + v).join(' · ') || t('chip.flow.noversions')));
    box.append(tools);
    for (const st of p.stages) {
      const card = h(d, 'section', { class: 'chip-stage' + (st.enabled ? '' : ' is-off'), 'data-chip-stage': st.id });
      const head = h(d, 'div', { class: 'chip-row' });
      const on = h(d, 'input', { type: 'checkbox', checked: st.enabled });
      on.setAttribute('aria-label', t('chip.flow.use', { stage: t('chip.stage.' + st.kind) }));
      on.addEventListener('change', () => { st.enabled = on.checked; ctx.project.save(p); draw(); });
      const tool = h(d, 'select', { class: 'chip-input' });
      tool.setAttribute('aria-label', t('chip.flow.tool'));
      for (const x of toolsFor(st.kind)) tool.append(h(d, 'option', { value: x, textContent: t('chip.tool.' + x), selected: x === st.tool }));
      tool.addEventListener('change', () => { st.tool = tool.value; ctx.project.save(p); });
      head.append(on, h(d, 'strong', {}, t('chip.stage.' + st.kind)), tool);
      card.append(head);
      if (st.enabled) {
        const opts = h(d, 'textarea', { class: 'chip-input chip-opts', rows: 3, spellcheck: false, value: JSON.stringify(st.options || {}, null, 1) });
        opts.setAttribute('aria-label', t('chip.flow.options'));
        opts.addEventListener('change', () => { try { st.options = JSON.parse(opts.value || '{}'); opts.classList.remove('is-bad'); ctx.project.save(p); } catch { opts.classList.add('is-bad'); } });
        card.append(h(d, 'details', {}, h(d, 'summary', {}, t('chip.flow.options')), h(d, 'p', { class: 'chip-muted' }, t('chip.opts.' + st.kind)), opts));
        const files = Object.fromEntries(await Promise.all(names.map(async (n) => [n, await ctx.files.readBytes(n)])));
        const plan = planStage(p, st, files);
        const acts = h(d, 'div', { class: 'chip-row' });
        const run = h(d, 'button', { type: 'button', class: 'chip-btn is-primary', textContent: t('chip.flow.run'), disabled: !ctx.runner || plan.problems.length > 0, 'data-chip-run': st.id });
        const save = h(d, 'button', { type: 'button', class: 'chip-btn', textContent: t('chip.flow.package'), disabled: plan.problems.length > 0, 'data-chip-package': st.id });
        const open = h(d, 'button', { type: 'button', class: 'chip-btn', textContent: t('chip.flow.open'), 'data-chip-open': st.id });
        acts.append(run, save, open);
        card.append(acts);
        for (const pr of plan.problems) card.append(h(d, 'div', { class: 'chip-warn' }, pr));
        if (!plan.problems.length) card.append(h(d, 'pre', { class: 'chip-cmd' }, plan.steps.map((s) => '$ ' + [s.tool, ...s.args].join(' ')).join('\n')));
        const hashes = await hashFiles(Object.fromEntries([...plan.inputs.map((n) => [n, files[n]]), ...Object.entries(plan.extra)]));
        const rep = repeatable(p, st.id, hashes), last = lastRun(p, st.id);
        if (last) card.append(h(d, 'div', { class: 'chip-muted', 'data-chip-last': st.id }, t(last.ok ? 'chip.flow.last.ok' : 'chip.flow.last.bad', { at: last.at.replace('T', ' ').slice(0, 19), tool: last.version || last.tool, n: Object.keys(last.inputs).length }) + ' ' + (rep.same ? t('chip.flow.same') : t('chip.flow.changed', { files: [...rep.changed, ...rep.added, ...rep.removed].slice(0, 4).join(', ') }))));
        if (last) card.append(h(d, 'details', {}, h(d, 'summary', {}, t('chip.flow.hashes')), h(d, 'pre', { class: 'chip-cmd' }, ['in:', ...Object.entries(last.inputs).map(([k, v]) => '  ' + short(v) + '  ' + k), 'out:', ...Object.entries(last.outputs).map(([k, v]) => '  ' + short(v) + '  ' + k)].join('\n'))));
        const out = h(d, 'div', { class: 'chip-out' });
        card.append(out);
        const show = async (res, again = false) => {
          shown.set(st.id, res);
          out.textContent = '';
          if (again) { out.append(summaryBlock(d, t, st, res)); return; }
          out.append(summaryBlock(d, t, st, res));
          if (res.waves) ctx.showWaves?.(res.waves, 'out/' + st.id);
          if (res.layout) ctx.showLayout?.(res.layout);
          if (st.kind === 'stil' && res.waves) {
            const o = st.options || {};
            try {
              const { plan: sp, stil, unknownDrives } = stilFrom(res.waves, { scope: o.scope || p.testbench || '', inputs: o.inputs || null, outputs: o.outputs || null, clock: o.clock || [], period: Number(o.period) || 10000, strobe: o.strobe ?? null, title: p.name }, await ctx.fmt());
              if (stil) {
                await ctx.files.write('out/stil/patterns.stil', stil.text);
                out.append(h(d, 'div', {}, t('chip.stil.written', { n: sp.vectors.length, s: sp.signals.length })));
                if (unknownDrives) out.append(h(d, 'div', { class: 'chip-warn' }, t('chip.stil.unknown', { n: unknownDrives })));
                for (const pr of stil.problems || []) out.append(h(d, 'div', { class: 'chip-warn' }, pr.message || pr.text || String(pr.code || pr)));
              }
              else { await ctx.files.write('out/stil/patterns.json', JSON.stringify(sp)); out.append(h(d, 'div', { class: 'chip-warn' }, t('chip.stil.nowriter', { n: sp.vectors.length }))); }
            } catch (e) { out.append(h(d, 'div', { class: 'chip-warn' }, String(e.message || e))); }
          }
        };
        if (shown.has(st.id)) show(shown.get(st.id), true);
        run.addEventListener('click', async () => {
          ctx.busy(true); run.disabled = true; out.textContent = t('chip.flow.running');
          try {
            const fmt = await ctx.fmt();
            const lefTexts = [].concat(st.options?.lefs || []).filter((n) => files[n]).map((n) => dec.decode(files[n]));
            const res = await runStage({ project: p, stage: st, files, runner: ctx.runner, script: await ctx.script(), fmt: { ...fmt, lefTexts }, onProgress: (f) => { out.textContent = t('chip.flow.running') + ' ' + Math.round(f * 100) + '%'; } });
            ctx.project.save(p);
            await keep(ctx, st, res);
            await show(res);
          } catch (e) { out.textContent = t('chip.flow.failed', { why: e.code || e.message }); }
          ctx.busy(false); run.disabled = false;
        });
        save.addEventListener('click', async () => {
          const ins = Object.fromEntries(plan.inputs.map((n) => [n, files[n]]));
          ctx.download('chip-' + st.id + '-run.zip', makePackage({ files: { ...ins, ...plan.extra }, steps: plan.steps, collect: plan.collect, toolsDir: p.tools.folder, pdkDir: p.tools.pdk, script: await ctx.script() }), 'application/zip');
        });
        open.addEventListener('click', async () => {
          const [f] = await ctx.pick({ accept: '.zip', multiple: false });
          if (!f) return;
          try {
            const { files: of, record } = resultOf(f.bytes);
            const fmt = await ctx.fmt();
            const lefTexts = [].concat(st.options?.lefs || []).filter((n) => files[n]).map((n) => dec.decode(files[n]));
            const res = { files: of, record, ...readStage(st, of, record, { fmt: { ...fmt, lefTexts } }) };
            recordRun(p, { stage: st.id, tool: st.tool, ok: !!record?.ok && !res.rows.some((r) => r.severity === 'error'), cmd: (record?.steps || []).map((s) => [s.tool, ...s.args]), inputs: hashes, outputs: await hashFiles(of) });
            ctx.project.save(p);
            await keep(ctx, st, res);
            await show(res);
          } catch (e) { out.textContent = t('chip.flow.badresult', { why: e.message }); }
        });
      }
      box.append(card);
    }
    const exp = h(d, 'button', { type: 'button', class: 'chip-btn', textContent: t('chip.flow.saveproject') });
    exp.addEventListener('click', () => ctx.download('chip-project.json', writeProject(ctx.project.get()), 'application/json'));
    box.append(h(d, 'div', { class: 'chip-row' }, exp));
    if (my === gen) el.replaceChildren(...box.childNodes);
  };
  draw();
  const off = ctx.onChange(() => draw());
  return () => off && off();
}

function wavesPanel(el, ctx) {
  const d = el.ownerDocument, t = ctx.t;
  const top = h(d, 'div', { class: 'chip-row' });
  const pick = h(d, 'select', { class: 'chip-input', 'data-chip-vcd': '1' });
  pick.setAttribute('aria-label', t('chip.wave.file'));
  const note = h(d, 'div', { class: 'chip-muted' });
  const host = h(d, 'div');
  el.append(top, note, host);
  top.append(pick);
  let viewer = null;
  const showText = (text, label) => {
    const v = readVcd(text);
    note.textContent = v.ok ? t('chip.wave.read', { n: v.signals.length, end: v.end, unit: v.timescale.n + v.timescale.unit, label }) + (v.truncated ? ' ' + t('chip.wave.cut') : '') : t('chip.wave.bad');
    if (!viewer) viewer = mountWaves(host, v, { t }); else viewer.setVcd(v);
  };
  const refill = () => {
    const names = ctx.files.list().filter((n) => /\.(vcd|fst)$/i.test(n));
    pick.textContent = '';
    pick.append(h(d, 'option', { value: '', textContent: names.length ? t('chip.wave.choose') : t('chip.wave.none') }));
    for (const n of names) pick.append(h(d, 'option', { value: n, textContent: n }));
  };
  pick.addEventListener('change', async () => {
    const n = pick.value; if (!n) return;
    const b = await ctx.files.readBytes(n);
    if (/\.fst$/i.test(n) || isFst(b)) { note.textContent = t('chip.wave.fst'); return; }
    showText(dec.decode(b), n);
  });
  refill();
  ctx.showWaves = (text, label) => { refill(); showText(text, label); ctx.focus?.('waves'); };
  const off = ctx.onChange(refill);
  return () => { off && off(); viewer?.destroy(); };
}

function layoutPanel(el, ctx) {
  const d = el.ownerDocument, t = ctx.t;
  const top = h(d, 'div', { class: 'chip-row' });
  const pick = h(d, 'select', { class: 'chip-input', 'data-chip-def': '1' });
  pick.setAttribute('aria-label', t('chip.layout.file'));
  const note = h(d, 'div', { class: 'chip-muted' });
  const host = h(d, 'div');
  top.append(pick);
  el.append(top, note, host);
  let view = null;
  const show = (shapes) => { note.textContent = ''; if (!view) view = mountLayout(host, shapes, { t }); else view.set(shapes); };
  const refill = () => {
    const names = ctx.files.list().filter((n) => /\.def$/i.test(n));
    pick.textContent = '';
    pick.append(h(d, 'option', { value: '', textContent: names.length ? t('chip.layout.choose') : t('chip.layout.none') }));
    for (const n of names) pick.append(h(d, 'option', { value: n, textContent: n }));
  };
  pick.addEventListener('change', async () => {
    if (!pick.value) return;
    const fmt = await ctx.fmt();
    if (!fmt.def?.readDef || !fmt.def?.defShapes) { note.textContent = t('chip.layout.noreader'); return; }
    const lefs = ctx.files.list().filter((n) => /\.lef$/i.test(n));
    let lef;
    if (lefs.length && fmt.lef?.readLef) { try { lef = fmt.lef.lefModel((await Promise.all(lefs.map((n) => ctx.files.read(n)))).flatMap((x) => fmt.lef.readLef(x).tree)); } catch { lef = undefined; } }
    const r = fmt.def.readDef(await ctx.files.read(pick.value));
    show(fmt.def.defShapes(r.def, lef));
    if (r.problems?.length) note.textContent = t('chip.layout.problems', { n: r.problems.length });
  });
  refill();
  ctx.showLayout = (shapes) => { refill(); show(shapes); ctx.focus?.('floorplan'); };
  const off = ctx.onChange(refill);
  return () => { off && off(); view?.destroy(); };
}

export function panels(ctx) {
  const t = ctx.t;
  return [
    { id: 'flow', title: t('chip.tab.flow'), mount: (el, c) => flowPanel(el, c || ctx) },
    { id: 'waves', title: t('chip.tab.waves'), mount: (el, c) => wavesPanel(el, c || ctx) },
    { id: 'floorplan', title: t('chip.tab.floorplan'), mount: (el, c) => layoutPanel(el, c || ctx) },
  ];
}
