/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site3d-lines.js: site3d.js's 0 bindings for this topic, moved out of buildSite3D() unchanged (0.11 PERF.78 one builder per feature family, perf-finish-11 r2 civil-detail; same scene).
 * buildLines3D(ctx) is called once by buildSite3D(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables buildSite3D() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { t } from './i18n.js';
import { formatStation } from './units.js';

export function buildLines3D(ctx) {
  const { show, C, units, L, scene, label, owned, input, polySegs } = ctx;

  // breaklines (they shape the existing ground)
  if (show.breaklines && input.breaklines?.length) {
    const o = owned();
    for (const b of input.breaklines) o.add(b.owner || { kind: 'breakline', id: b.name, name: b.name }, (seg) => polySegs(seg, b.pts.filter((p) => Number.isFinite(p.z)).map((p) => L(p.x, p.y, p.z)), false));
    if (o.seg.length) scene.lines.push(o.done({ key: 'breaklines', name: t('scene.layer.brkl'), color: C.breakline }));
  }
  // feature lines (0.4 V14/V5), shown with the breaklines
  if (show.breaklines && input.features?.length) {
    const o = owned();
    for (const f of input.features) {
      o.add({ kind: 'feature', id: f.id, name: f.name }, (seg) => polySegs(seg, f.pts.filter((p) => Number.isFinite(p.z)).map((p) => L(p.x, p.y, p.z)), false));
      const m = f.pts[Math.floor((f.pts.length - 1) / 2)];
      if (m) label('feature', f.name, m.x, m.y, m.z, C['gis:green']);
    }
    if (o.seg.length) scene.lines.push(o.done({ key: 'features', name: t('scene.layer.feat'), color: C['gis:green'] }));
  }

  // alignments at the design profile (or on the existing ground where there is none), with station ticks
  if (show.alignments) {
    const o = owned(), tick = [];
    for (const a of input.alignments || []) {
      const al = a.alignment;
      if (!al?.ok) continue;
      const zAt = (sta, x, y) => {
        const z = a.profile?.ok ? a.profile.elevationAt(sta) : null;
        return z ?? input.eg?.elevationAt(x, y, 1e-6) ?? null;
      };
      o.add({ kind: 'alignment', id: a.id, name: a.name }, (seg) => {
      const stas = new Set(al.polyline(Math.max(al.length / 400, 0.5)).map((p) => p.sta));
      const step = Math.max(al.length / 400, 0.5);
      for (let s = al.start; s < al.end; s += step) stas.add(s);
      stas.add(al.end);
      if (a.profile?.ok) for (const c of a.profile.curves || []) for (let k = 0; k <= 16; k++) { const s = c.bvc + (c.L * k) / 16; if (s >= al.start && s <= al.end) stas.add(s); }
      let run = [];
      for (const sta of [...stas].sort((p, q) => p - q)) {
        const p = al.pointAt(sta), z = p ? zAt(sta, p.x, p.y) : null;
        if (z === null) { polySegs(seg, run, false); run = []; continue; }
        run.push(L(p.x, p.y, z));
      }
      polySegs(seg, run, false);
      });
      const p0 = al.pointAt(al.start);
      if (p0) label('alignment', a.name, p0.x, p0.y, zAt(al.start, p0.x, p0.y), C.alignment);
      const minor = units === 'm' ? 20 : 50, major = 100;
      for (const t of al.ticks(minor)) {
        const z = zAt(t.sta, t.x, t.y);
        if (z === null) continue;
        const isMaj = Math.abs(t.sta / major - Math.round(t.sta / major)) < 1e-9;
        const k = (units === 'm' ? 1.5 : 5) * (isMaj ? 1.6 : 1);
        const nx = Math.sin(t.dir), ny = -Math.cos(t.dir);
        tick.push(...L(t.x - nx * k, t.y - ny * k, z), ...L(t.x + nx * k, t.y + ny * k, z));
        if (isMaj) label('station', formatStation(t.sta, units, 0), t.x, t.y, z, C.alignment);
      }
    }
    if (o.seg.length) scene.lines.push(o.done({ key: 'alignments', name: t('s3.alignments'), color: C.alignment }));
    if (tick.length) scene.lines.push({ key: 'stations', name: t('s3.stations'), color: C.alignment, positions: new Float32Array(tick) });
  }

  // corridor feature lines
  if (show.corridors) {
    const seg = [];
    for (const c of input.corridors || []) for (const [name, pts] of Object.entries(c.lines || {})) {
      if (name === 'CL') continue;   // the alignment is drawn on the profile already
      polySegs(seg, (pts || []).filter((p) => Number.isFinite(p.z)).map((p) => L(p.x, p.y, p.z)), false);
    }
    if (seg.length) scene.lines.push({ key: 'corridors', name: t('s3.corridors'), color: C.corridor, positions: new Float32Array(seg) });
  }
}
