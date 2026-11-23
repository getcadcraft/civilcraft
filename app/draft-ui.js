/* SPDX-License-Identifier: Apache-2.0 */
/**
 * draft-ui.js: civilcraft.js's 1 bindings for this topic, moved out of init() unchanged (0.11 PERF.71 round two, perf-finish-11 r2 civil-detail; no behaviour change).
 * mountDraft(ctx) is called once by init(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables init() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { t } from './i18n.js';
import { fixed } from './units.js';
import { defaultNetwork, defaultStructDia, defaultPipeDia, autoInverts } from './pipes.js';

export function mountDraft(ctx) {
  const { ST, DEFAULT_R, view, refresh, setTool, measureText, fitRadius, say } = ctx;

  function finishDraft() {
    const pts = ST.draft.slice();
    ST.draft = [];
    const s = ST.project.state;
    if (ST.tool === 'measure') { if (pts.length >= 2) say(t('meas.done', { text: measureText(pts, ST.measClosed) })); ST.measClosed = false; view.invalidate(); return; }   // 0.7 PL.10: nothing is drawn
    if (ST.tool === 'alignment') {
      if (pts.length < 2) { say(t('cv.al.need2')); return; }
      const R = DEFAULT_R[s.units];
      const pis = pts.map((p, i) => ({ x: p.x, y: p.y, r: i === 0 || i === pts.length - 1 ? 0 : fitRadius(pts, i, R) }));
      const id = ST.project.nextId('a'), n = s.alignments.length + 1;
      ST.project.change(t('cv.undo.al.draw'), (st) => st.alignments.push({ id, name: t('cv.al.name', { n }), start: 0, pis, pvis: [] }));
      ST.sel = { kind: 'alignment', id }; ST.selPvi = -1;
      setTool('select'); refresh();
      const al = ST.project.alignment(ctx.findAl(id));
      say(t('cv.al.drawn', { n, len: fixed(al.length, 2), u: ctx.u().short, r: R }));
    } else if (ST.tool === 'pad') {
      if (pts.length < 3) { say(t('cv.pad.need3')); return; }
      const c = pts.reduce((m, p) => ({ x: m.x + p.x / pts.length, y: m.y + p.y / pts.length }), { x: 0, y: 0 });
      const z0 = ctx.eg().surface?.elevationAt(c.x, c.y);
      const id = ST.project.nextId('p'), n = s.pads.length + 1;
      ST.project.change(t('cv.undo.pad.draw'), (st) => st.pads.push({ id, name: t('cv.pad.name', { n }), pts, z: Number(((z0 ?? 0)).toFixed(1)), cut: 2, fill: 3 }));
      ST.sel = { kind: 'pad', id };
      setTool('select'); refresh();
      say(t('cv.pad.drawn', { n, z: fixed(z0 ?? 0, 1) }));
    } else if (ST.tool === 'pipe') {
      if (pts.length < 2) { say(t('cv.pp.need2')); return; }
      const newPipes = new Set();
      ST.project.change(t('cv.undo.pp.draw'), (st) => {
        if (!st.network) st.network = defaultNetwork(st.units);
        const N = st.network;
        const ids = pts.map((p) => {
          if (p.sid && N.structures.some((x) => x.id === p.sid)) return p.sid;
          const id = ST.project.nextId('s');
          N.structures.push({ id, name: t('cv.st.name', { n: N.structures.length + 1 }), x: p.x, y: p.y, rim: null, sumpDepth: 0, dia: defaultStructDia(st.units) });
          return id;
        });
        for (let i = 0; i + 1 < ids.length; i++) {
          if (ids[i] === ids[i + 1]) continue;
          const id = ST.project.nextId('q');
          N.pipes.push({ id, name: t('cv.pp.name', { n: N.pipes.length + 1 }), from: ids[i], to: ids[i + 1], dia: defaultPipeDia(st.units), invUp: null, invDn: null });
          newPipes.add(id);
        }
        const r = autoInverts(N, ST.project.pipeSurface(), st.units, { only: newPipes });
        N.pipes = r.pipes;
      });
      setTool('select'); ST.sel = null; refresh();
      const chk = ST.project.networkCheck();
      const drawn = { pipes: t('cv.net.pipes', { n: newPipes.size }), dia: ctx.diaU().perUnit === 12 ? defaultPipeDia('ft') + '"' : defaultPipeDia('m') + ' mm' };
      say(chk.problems.length ? t('cv.pp.drawn.bad', { ...drawn, problems: t('cv.problems.n', { n: chk.problems.length }) }) : t('cv.pp.drawn.ok', drawn));
    } else if (ST.tool === 'parcel') {   // 0.4 V21
      if (ctx.pcUi.finish(pts)) setTool('select');
      else ST.draft = pts;
    } else if (ST.tool === 'mass') {   // 0.7 LC.1
      if (ctx.msUi.finish(pts)) setTool('select');
      else ST.draft = pts;
    } else if (ctx.lsUi.ownsTool(ST.tool)) {   // 0.7 LD: a planting bed or a hedge
      if (ctx.lsUi.finish(ST.tool, pts)) setTool('select');
      else ST.draft = pts;
    } else if (ctx.egUi.ownsTool(ST.tool)) {   // 0.8 EG.71: the start and end of a best route
      if (ctx.egUi.finish(ST.tool, pts)) setTool('select');
      else ST.draft = pts;
    } else if (ctx.utUi.ownsTool(ST.tool)) {   // 0.11 SU.1810: a utility run drawn on the plan
      if (ctx.utUi.finish(ST.tool, pts)) setTool('select');
      else ST.draft = pts;
    } else if (ctx.pfUi.ownsTool(ST.tool)) {   // 0.8 SU.914: a free section line, a ramp
      if (ctx.pfUi.finish(ST.tool, pts)) setTool('select');
      else ST.draft = pts;
    } else if (ctx.rvUi.ownsTool(ST.tool)) {   // 0.8 SU.957: a river centreline, a section cut line
      if (ctx.rvUi.finish(ST.tool, pts)) setTool('select');
      else ST.draft = pts;
    } else if (ctx.plUi.ownsTool(ST.tool)) {   // 0.7 PL: an overhead line, an underground route, an obstacle
      if (ctx.plUi.finish(ST.tool, pts)) setTool('select');
      else ST.draft = pts;
    } else if (ST.tool === 'catchment') {   // 0.4 V19
      if (ctx.drUi.finish(pts)) setTool('select');
      else ST.draft = pts;
    } else if (ST.tool === 'feature') {   // 0.4 V14
      const closed = ST.draftClosed;
      ST.draftClosed = false;
      ST.flMid = null;   // 0.6 WL.24: a curve point with no end is dropped
      if (ctx.flUi.finish(pts, closed)) setTool('select');
      else ST.draft = pts;   // too few vertices: keep drawing
    } else if (ST.tool === 'breakline') {
      if (pts.length < 2) { say(t('cv.bl.need2')); return; }
      const n = s.surface.breaklines.length + 1;
      ST.project.change(t('cv.undo.bl.draw'), (st) => st.surface.breaklines.push({ name: t('cv.bl.name', { n }), pts: pts.map((p) => ({ x: p.x, y: p.y, z: p.z })) }));
      say(t('cv.bl.added', { n }));
    } else if (ST.tool === 'boundary') {
      if (pts.length < 3) { say(t('cv.bnd.need3')); return; }
      ST.project.change(t('cv.undo.bnd.draw'), (st) => { st.surface.boundary = pts.map((p) => ({ x: p.x, y: p.y })); });
      say(t('cv.bnd.set'));
    }
  }

  return { finishDraft };
}
