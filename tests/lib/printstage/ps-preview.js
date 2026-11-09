/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ps-preview.js — a layer preview of G-code before anything is sent (roadmap PS.10). Reads what any engine wrote, draws with the 2D canvas. No DOM
 * of its own: the panel passes the canvas.
 *
 *   parseLayers(lines) → { layers: [{ z, segs: Float32Array [x0, y0, x1, y1, kind] ×n }], bridges: n }   kind 0 = print, 1 = bridge; travel moves are left out
 *   drawLayer(ctx, pv, index, { bed: [x, y], width, height, ink, bridge, ghost }) → draws the bed's outline, the two layers below faintly, and layer `index`
 */
export function parseLayers(lines) {
  const layers = []; let cur = null, x = 0, y = 0, z = 0, e = 0, rel = false, abs = true, kind = 0, bridges = 0, inBridge = false;
  const out = () => { if (!cur) { cur = { z, segs: [] }; layers.push(cur); } return cur; };
  for (const raw of lines) {
    const c = raw.indexOf(';'), cmt = c >= 0 ? raw.slice(c) : '', l = (c >= 0 ? raw.slice(0, c) : raw).trim().toUpperCase();
    if (cmt.startsWith(';LAYER:')) { cur = null; }
    if (cmt === ';TYPE:BRIDGE') { kind = 1; if (!inBridge) { bridges++; inBridge = true; } } else if (cmt.startsWith(';TYPE:')) { kind = 0; inBridge = false; }
    if (!l) continue;
    if (l === 'M83') rel = true; else if (l === 'M82') rel = false; else if (l === 'G90') abs = true; else if (l === 'G91') abs = false;
    else if (/^G92\b/.test(l)) { const m = /E(-?[\d.]+)/.exec(l); if (m) e = Number(m[1]); }
    if (!/^G[01]\b/.test(l) || !abs) continue;
    const g = (k) => { const m = new RegExp(k + '(-?[\\d.]+)').exec(l); return m ? Number(m[1]) : null; };
    const X = g('X'), Y = g('Y'), Z = g('Z'), E = g('E');
    const nx = X ?? x, ny = Y ?? y;
    if (Z != null) { z = Z; if (cur && Math.abs(cur.z - z) > 1e-6 && cur.segs.length) cur = null; if (cur) cur.z = z; }
    let de = 0; if (E != null) { de = rel ? E : E - e; e = rel ? e + E : E; }
    if (de > 0 && (nx !== x || ny !== y)) out().segs.push(x, y, nx, ny, kind);
    x = nx; y = ny;
  }
  return { layers: layers.filter((q) => q.segs.length).map((q) => ({ z: q.z, segs: Float32Array.from(q.segs) })), bridges };
}

export function drawLayer(ctx, pv, index, { bed, width, height, ink = '#223', bridge = '#d9822b', ghost = '#9aa' } = {}) {
  const [bx, by] = bed, pad = 6, k = Math.min((width - 2 * pad) / bx, (height - 2 * pad) / by);
  const X = (v) => pad + v * k, Y = (v) => height - pad - v * k;   // Y up, like the bed
  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = ghost; ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
  ctx.strokeRect(X(0), Y(by), bx * k, by * k); ctx.setLineDash([]);
  const draw = (layer, alpha, w) => {
    if (!layer) return;
    ctx.globalAlpha = alpha; ctx.lineWidth = w;
    for (const kind of [0, 1]) {
      ctx.strokeStyle = kind ? bridge : (alpha < 1 ? ghost : ink); ctx.beginPath();
      const s = layer.segs;
      for (let i = 0; i < s.length; i += 5) if (s[i + 4] === kind) { ctx.moveTo(X(s[i]), Y(s[i + 1])); ctx.lineTo(X(s[i + 2]), Y(s[i + 3])); }
      ctx.stroke();
    }
  };
  draw(pv.layers[index - 2], 0.18, 1); draw(pv.layers[index - 1], 0.3, 1);
  draw(pv.layers[index], 1, Math.max(1, 0.45 * k));
  ctx.globalAlpha = 1;
}
