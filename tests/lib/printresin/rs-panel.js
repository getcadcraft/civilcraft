/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-panel.js — the resin card inside the print stage (roadmap RSN.1-RSN.5): printer, resin, hollowing, supports, layer preview, Save. The stage, the Library and the
 * bed belong to the 3D Print add-on; this is the block it shows while "Printing with: Resin" is chosen (ps-panel.js hands it ctx, see the header there).
 *
 *   createResinPanel({ t, formats, tools }) → { build(ctx) → [nodes] }
 *     t(key, fills): the add-on's own words (keys rs.*)    formats() → [{ id, name, ext, mime, write(sliced, meta), options?, t? }]  (window.ccResinFormats: one add-on each)
 *     a format's `options` [{ id, values: [...], default }] are shown as selects under the format list (labels from the format add-on's own `t`: opt.<id>, opt.<id>.<value>)
 *     and arrive in write()'s meta.options: the choices a file format leaves open are the person's to flip when a printer refuses a file.
 *     tools() → [{ id, build(rctx) → node }]  extra blocks inside this card (window.ccResinTools: the calibration add-on)
 *   A tool's rctx: { job() → the settings, set(patch), say(text, error), plate(), el, C, t, ctx,
 *     file(patch, tris?) → Promise<{ name, ext, mime, bytes, stats }>  slices `tris` (default: the bed) with the settings plus `patch`, in the format chosen above }.
 * Nothing is sent or saved until a button is pressed. The slicing runs on the page, in turns, so a large plate on a 12K screen takes minutes (RSN.8: on a worker thread when the page can start one, rs-run.js).
 */
import { PRINTERS, RESINS, DENSITIES, cleanResin } from './rs-profiles.js';
import { runResin } from './rs-run.js';

export function createResinPanel({ t, formats = () => [], tools = () => [] }) {
  let job = null, result = null, resultSig = '', busy = null, progress = null, abort = null, message = null, layer = 0;
  const rerender = [];   // the current ctx's host.rerender, set on each build
  const plateSig = (ctx) => { const tr = ctx.host.plate(); let a = 0; for (const tri of tr) for (const p of tri) a += p[0] * 1.3 + p[1] * 1.7 + p[2] * 2.3; return tr.length + ':' + Math.round(a * 100) + ':' + JSON.stringify(job); };

  function build(ctx) {
    const { host, el, C } = ctx;
    rerender[0] = () => host.rerender();
    if (!job) job = cleanResin(host.load('resin'));
    const P = job.printerSpec;
    if (Math.abs(ctx.bed()[0] - P.mm[0]) > 0.01 || Math.abs(ctx.bed()[1] - P.mm[1]) > 0.01 || Math.abs(ctx.bed()[2] - P.mm[2]) > 0.01) queueMicrotask(() => ctx.useBed(P.mm.slice()));
    const set = (patch) => {
      const drop = patch.resin && patch.resin !== job.resin ? { exposure: undefined, bottomExposure: undefined, bottomLayers: undefined, liftHeight: undefined, liftSpeed: undefined, retractSpeed: undefined, lightOff: undefined, price: undefined } : {};
      job = cleanResin({ ...job, ...drop, ...patch });
      host.save('resin', Object.fromEntries(Object.entries(job).filter(([k]) => k !== 'printerSpec')));
      host.rerender();
    };
    const say = (text, error = false) => { message = { text, error }; host.print?.(text); host.rerender(); };
    const duration = (s) => { const all = Math.max(1, Math.round(s / 60)), h = Math.floor(all / 60), m = all % 60; return h ? t('rs.time.hm', { h, m }) : t('rs.time.m', { m }); };
    const field = (label, control) => el('label', { className: C.field }, label, ' ', control);
    const number = (key, label, { min, max, step, data, digits = 3 } = {}) => field(label, el('input', { type: 'number', className: C.input, min: String(min), max: String(max), step: String(step), value: String(Math.round(job[key] * 10 ** digits) / 10 ** digits), dataset: { [data]: '' }, onchange: (e) => set({ [key]: e.target.value }) }));
    const check = (key, label, data) => el('label', { className: C.check }, el('input', { type: 'checkbox', checked: job[key], dataset: { [data]: '' }, onchange: (e) => set({ [key]: e.target.checked }) }), ' ', label);

    // ---- the work
    // every format that is added, the ones this printer is said to read first (which printer reads what is partly the makers' word, so none is hidden)
    const available = () => { const all = formats(); return [...all.filter((f) => P.formats.includes(f.id)), ...all.filter((f) => !P.formats.includes(f.id))]; };
    const chosenFmt = () => { const a = available(); return a.find((f) => f.id === host.load('resin-format')) || a[0]; };
    const optsOf = (f) => ({ ...Object.fromEntries((f.options || []).map((o) => [o.id, o.default])), ...((host.load('resin-format-opts') || {})[f.id] || {}) });
    const run = async () => {
      const objs = host.objects();
      if (!objs.length && !host.plate().length) { say(t('rs.empty'), true); return null; }
      const off = ctx.checkPlate(objs, P.mm).off;
      if (off.length) { say(t('rs.off', { names: off.map((i) => objs[i].name).slice(0, 3).join(', ') }), true); return null; }
      abort = new AbortController(); busy = 'slice'; progress = { layer: 0, layers: 1 }; message = null; host.rerender();
      try {
        const r = await runResin(host, host.plate(), job, { plateSolid: ctx.plateSolid, signal: abort.signal, onProgress: (p) => { progress = p; host.rerender(); } });
        if (!r.ok) { say(t('rs.fail.' + (r.error || 'failed')), true); return null; }
        result = r; resultSig = plateSig(ctx); layer = Math.min(layer, r.sliced.count - 1);
        return r;
      } catch (e) {
        if (e?.name !== 'AbortError') { console.error(e); say(t('rs.fail.failed'), true); }
        return null;
      } finally { busy = null; progress = null; abort = null; host.rerender(); }
    };
    const warnText = (w) => (w.kind === 'skipped' ? t(w.n === 1 ? 'rs.warn.skipped_one' : 'rs.warn.skipped', { n: w.n, share: w.share }) : w.kind === 'sheets' ? t('rs.warn.sheets', { n: w.n }) : w.kind === 'floating' ? t('rs.warn.floating') : w.kind === 'islands' ? t('rs.warn.islands', { n: w.n }) : w.kind === 'overhangs' ? t('rs.warn.overhangs', { n: w.n }) : w.kind === 'nodrain' ? t('rs.warn.nodrain', { n: w.n }) : '');
    const baseName = () => (String(host.fileName?.() || 'plate').replace(/\.[a-z0-9]+$/i, '') || 'plate');
    const metaOf = (j, r, fmt) => ({ name: baseName(), printer: { id: j.printer, ...j.printerSpec }, resin: { name: t('rs.resin.' + j.resin), exposure: j.exposure, bottomExposure: j.bottomExposure, bottomLayers: j.bottomLayers, liftHeight: j.liftHeight, liftSpeed: j.liftSpeed, retractSpeed: j.retractSpeed, lightOff: j.lightOff, density: j.density_g, price: j.price },
      layerHeight: j.layerHeight, volumeMl: r.stats.volumeMl, seconds: r.stats.seconds, options: fmt ? optsOf(fmt) : {} });
    async function save() {
      const chosen = chosenFmt();
      if (!chosen) { say(t('rs.noformat'), true); return; }
      const fresh = result && resultSig === plateSig(ctx) ? result : await run();
      if (!fresh) return;
      const lines = [t('rs.confirm', { time: duration(fresh.stats.seconds), ml: fresh.stats.volumeMl, layers: fresh.stats.layers, format: chosen.name }), ...fresh.warnings.map(warnText).filter(Boolean), t('rs.confirm.untested')];
      if (!(await host.confirm(lines, { title: t('rs.save'), yes: t('rs.save.yes') }))) { say(t('rs.cancelled')); return; }
      try {
        const bytes = await chosen.write(fresh.sliced, metaOf(job, fresh, chosen));
        host.download(baseName() + '.' + chosen.ext, bytes, chosen.mime);
        say(t('rs.saved', { name: baseName() + '.' + chosen.ext, time: duration(fresh.stats.seconds), ml: fresh.stats.volumeMl }));
      } catch (e) { console.error(e); say(t('rs.fail.write', { why: String(e?.message || e).slice(0, 160) }), true); }
    }

    /** A file from the bed (or from `tris`) with some settings changed: what the calibration ladder is made of. */
    async function file(patch = {}, tris = null) {
      const chosen = chosenFmt();
      if (!chosen) throw new Error(t('rs.noformat'));
      const j = cleanResin({ ...job, ...patch });
      const r = await runResin(host, tris || host.plate(), j, { plateSolid: ctx.plateSolid, signal: abort?.signal });
      if (!r.ok) throw new Error(t('rs.fail.' + (r.error || 'failed')));
      return { name: baseName(), ext: chosen.ext, mime: chosen.mime, stats: r.stats, bytes: await chosen.write(r.sliced, metaOf(j, r, chosen)) };
    }

    // ---- the card
    const tecs = tools();
    const MOREFORMATS = [{ addon: 'printer-resin-goo', ids: ['goo'], name: 'Elegoo GOO' }, { addon: 'printer-resin-sl1', ids: ['sl1'], name: 'SL1' }, { addon: 'printer-resin-chitu', ids: ['cbddlp', 'ctb', 'ctb3'], name: 'Chitubox CBDDLP and CTB' }, { addon: 'printer-resin-anycubic', ids: ['pwmx', 'pws'], name: 'Anycubic PWMX and PWS' }];
    const have = new Set(formats().map((f) => f.id)), loader = globalThis.ccAddons?.loader;
    const missing = MOREFORMATS.filter((m) => !m.ids.some((i) => have.has(i))).sort((a, b) => Number(b.ids.some((i) => P.formats.includes(i))) - Number(a.ids.some((i) => P.formats.includes(i))));
    const pct = progress && progress.layers ? Math.round(progress.layer / progress.layers * 100) : 0;
    const fmts = available(), chosen = chosenFmt();

    const settings = el('div', { className: C.block, dataset: { rsSettings: '' } },
      el('h3', { className: C.head }, t('rs.h.settings')),
      field(t('rs.field.printer'), el('select', { className: C.select, dataset: { rsPrinter: '' }, onchange: (e) => set({ printer: e.target.value }) }, ...Object.entries(PRINTERS).map(([id, p]) => el('option', { value: id, selected: id === job.printer }, p.name)))),
      PRINTERS[job.printer].custom ? el('div', { className: C.row, dataset: { rsScreen: '' } },
        ...[['px', 0, 'rs.screen.w', 320, 20000, 1], ['px', 1, 'rs.screen.h', 200, 12000, 1], ['mm', 0, 'rs.screen.x', 20, 600, 0.01], ['mm', 1, 'rs.screen.y', 20, 400, 0.01], ['mm', 2, 'rs.screen.z', 20, 600, 1]].map(([k, i, label, min, max, step]) =>
          field(t(label), el('input', { type: 'number', className: C.input, min: String(min), max: String(max), step: String(step), value: String(P[k][i]), onchange: (e) => { const s = { px: P.px.slice(), mm: P.mm.slice() }; s[k][i] = e.target.value; set({ screen: s }); } })))) : null,
      el('p', { className: C.note }, t('rs.printer.note', { w: P.px[0], h: P.px[1], x: Math.round(P.mm[0] * 10) / 10, y: Math.round(P.mm[1] * 10) / 10 })),
      field(t('rs.field.resin'), el('select', { className: C.select, dataset: { rsResin: '' }, onchange: (e) => set({ resin: e.target.value }) }, ...Object.keys(RESINS).map((id) => el('option', { value: id, selected: id === job.resin }, t('rs.resin.' + id))))),
      el('p', { className: C.note }, t('rs.resin.note')),
      number('layerHeight', t('rs.field.layer'), { min: 0.01, max: 0.2, step: 0.01, data: 'rsLayer' }),
      number('exposure', t('rs.field.exposure'), { min: 0.2, max: 60, step: 0.1, data: 'rsExposure' }),
      number('bottomExposure', t('rs.field.bottom'), { min: 1, max: 300, step: 1, data: 'rsBottom' }),
      el('details', {}, el('summary', {}, t('rs.field.motion')),
        number('bottomLayers', t('rs.field.bottomlayers'), { min: 1, max: 30, step: 1, data: 'rsBottomLayers', digits: 0 }),
        number('liftHeight', t('rs.field.lift'), { min: 1, max: 30, step: 0.5, data: 'rsLiftHeight' }),
        number('liftSpeed', t('rs.field.liftspeed'), { min: 10, max: 600, step: 10, data: 'rsLiftSpeed' }),
        number('retractSpeed', t('rs.field.retractspeed'), { min: 10, max: 900, step: 10, data: 'rsRetractSpeed' }),
        number('lightOff', t('rs.field.lightoff'), { min: 0, max: 20, step: 0.5, data: 'rsLightOff' }),
        number('price', t('rs.field.price'), { min: 0, max: 1000, step: 1, data: 'rsPrice', digits: 0 })),
      number('tilt', t('rs.field.tilt'), { min: 0, max: 60, step: 1, data: 'rsTilt', digits: 0 }),
      check('hollow', t('rs.field.hollow'), 'rsHollow'),
      job.hollow ? el('div', { className: C.row }, number('wall', t('rs.field.wall'), { min: 0.8, max: 6, step: 0.1, data: 'rsWall' }), number('drain', t('rs.field.drain'), { min: 1.5, max: 6, step: 0.5, data: 'rsDrain' })) : null,
      check('supports', t('rs.field.supports'), 'rsSupports'),
      job.supports ? el('div', {},
        field(t('rs.field.density'), el('select', { className: C.select, dataset: { rsDensity: '' }, onchange: (e) => set({ density: e.target.value }) }, ...Object.keys(DENSITIES).map((k) => el('option', { value: k, selected: k === job.density }, t('rs.density.' + k))))),
        el('div', { className: C.row }, number('lift', t('rs.field.liftpart'), { min: 1, max: 10, step: 0.5, data: 'rsLiftPart' }), number('overhang', t('rs.field.overhang'), { min: 10, max: 70, step: 1, data: 'rsOverhang', digits: 0 })),
        el('p', { className: C.note }, t('rs.supports.note'))) : null,
      fmts.length ? field(t('rs.field.format'), el('select', { className: C.select, dataset: { rsFormat: '' }, onchange: (e) => { host.save('resin-format', e.target.value); host.rerender(); } }, ...fmts.map((f) => el('option', { value: f.id, selected: f === chosen }, f.name)))) : el('p', { className: C.note, dataset: { rsNoFormat: '' } }, t('rs.noformat')),
      chosen && !P.formats.includes(chosen.id) ? el('p', { className: C.note, dataset: { rsUnlisted: '' } }, t('rs.format.unlisted', { printer: P.name })) : null,
      ...(chosen?.options || []).map((o) => { const ft = chosen.t || t, cur = optsOf(chosen)[o.id]; return el('label', { className: C.field, dataset: { rsOption: o.id } }, ft('opt.' + o.id), ' ', el('select', { className: C.select, dataset: { rsOptionSelect: o.id }, onchange: (e) => { host.save('resin-format-opts', { ...(host.load('resin-format-opts') || {}), [chosen.id]: { ...optsOf(chosen), [o.id]: e.target.value } }); host.rerender(); } }, ...o.values.map((v) => el('option', { value: v, selected: v === cur }, ft('opt.' + o.id + '.' + v))))); }),
      chosen?.options?.length ? el('p', { className: C.note }, t('rs.format.options')) : null,
      missing.length && loader?.setEnabled ? el('div', { className: C.row, dataset: { rsMore: '' } }, ...missing.map((m) => el('button', { type: 'button', className: C.link, dataset: { rsAddFormat: m.addon }, onclick: async () => { await loader.setEnabled(m.addon, true); host.rerender(); } }, t('rs.format.add', { name: m.name })))) : null);

    const stale = result && resultSig !== plateSig(ctx);
    const out = [settings];
    for (const tool of tecs) {
      try { const n = tool.build({ ctx, job: () => job, set, say, plate: () => host.plate(), file, el, C, t: tool.t || t }); if (n) out.push(n); } catch (e) { console.error(e); }
    }
    if (result && !stale) {
      const r = result, n = r.sliced.count, W = 300, H = Math.max(120, Math.round(W * r.sliced.h / r.sliced.w));
      const canvas = el('canvas', { width: W, height: H, className: 'ps-preview', role: 'img', dataset: { rsCanvas: '' }, 'aria-label': t('rs.preview.canvas') });
      const label = el('p', { className: C.note, dataset: { rsLayerLabel: '' } });
      const paint = () => {
        const ctx2 = canvas.getContext('2d'); if (!ctx2) return;
        const g = r.sliced.layer(layer), img = ctx2.createImageData(W, H), sw = r.sliced.w / W, sh = r.sliced.h / H;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = g[Math.min(r.sliced.h - 1, Math.floor((y + 0.5) * sh)) * r.sliced.w + Math.min(r.sliced.w - 1, Math.floor((x + 0.5) * sw))], o = (y * W + x) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = 30 + Math.round(v * 0.85); img.data[o + 3] = 255; }
        ctx2.putImageData(img, 0, 0);
        const mmx = r.sliced.mm[0], mmy = r.sliced.mm[1];
        for (const isl of r.islands) if (isl.layer === layer) { ctx2.strokeStyle = '#e03131'; ctx2.lineWidth = 2; ctx2.beginPath(); ctx2.arc(isl.x / mmx * W, H - isl.y / mmy * H, 6, 0, 7); ctx2.stroke(); }
        label.textContent = t('rs.preview.layer', { n: layer + 1, total: n, z: Math.round(((layer + 1) * r.sliced.layerHeight - r.sliced.zLift) * 100) / 100 });
      };
      const range = el('input', { type: 'range', min: '1', max: String(n), step: '1', value: String(layer + 1), className: C.input, 'aria-label': t('rs.preview.slider'), dataset: { rsRange: '' } });
      range.addEventListener('input', () => { layer = Number(range.value) - 1; paint(); });
      queueMicrotask(paint);
      const s = r.stats;
      out.push(el('div', { className: C.block, dataset: { rsPreview: 'ok' } }, el('h3', { className: C.head }, t('rs.h.preview')), canvas, range, label,
        el('p', { className: C.note, dataset: { rsStats: '' } }, t('rs.stats', { layers: s.layers, time: duration(s.seconds), ml: s.volumeMl, g: s.grams, cost: s.cost })),
        s.supports ? el('p', { className: C.note }, t('rs.stats.supports', { n: s.supports, raft: s.onRaft, model: s.onModel })) : null,
        ...r.warnings.map(warnText).filter(Boolean).map((x) => el('p', { className: C.error, role: 'status' }, x))));
    } else if (result) out.push(el('div', { className: C.block, dataset: { rsPreview: 'stale' } }, el('h3', { className: C.head }, t('rs.h.preview')), el('p', { className: C.note }, t('rs.preview.stale'))));

    out.push(el('div', { className: C.block + ' ' + C.send },
      el('div', { className: C.row },
        el('button', { type: 'button', className: C.primary, disabled: !!busy, dataset: { rsSave: '' }, onclick: save }, el('i', { className: 'bi bi-save', 'aria-hidden': 'true' }), ' ', t('rs.save')),
        el('button', { type: 'button', className: C.btn, disabled: !!busy, dataset: { rsPreviewGo: '' }, onclick: async () => { const r = await run(); if (r) say(t('rs.preview.ready', { n: r.sliced.count })); } }, t('rs.preview.button')),
        busy ? el('button', { type: 'button', className: C.btn, dataset: { rsCancel: '' }, onclick: () => abort?.abort() }, t('rs.cancel')) : null),
      busy ? el('p', { className: C.note, dataset: { rsProgress: '' } }, t('rs.progress', { n: pct })) : null,
      message ? el('p', { className: message.error ? C.error : C.note, role: message.error ? 'alert' : 'status', dataset: { rsMessage: '' } }, message.text) : null,
      el('p', { className: C.note }, t('rs.untested'))));
    return out;
  }
  return { build, job: () => job, run: () => result };
}
