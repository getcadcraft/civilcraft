/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-viewoverlays.js: the view overlays in the four corners of the drawing (UI.10): a view cube with a compass, a navigation bar, a
 * viewport label and an axes icon. The corners are the places view-tl, view-tr, view-bl, view-br (the format adds them in v2; the places
 * table is docs/INTERFACE-PATTERN.md section 1). A corner is a small stack that NEVER takes pointer events outside the boxes of its own
 * overlays (pointer-events: none on the corner, auto on each box), so the drawing keeps the pointer between them.
 *
 *   viewlabel  top left      "[-][Top][2D Wireframe]": the view name, the display mode and the scale; the [-] menu is the app's view commands
 *   viewcube   top right     the 3D view's orientation (host.view3d().orient() → { yaw, pitch }), the compass (N E S W) and the named views;
 *                            a click on a face or the compass goes to that view (host.view3d().go(name)); a "WCS" drop-down for the coordinate system
 *   navbar     right edge    pan, zoom extents, zoom window, orbit, walk, from the registry (host.nav(): { id: { label, run, pressed } })
 *   axes       bottom left   the app's UCS / axes drawing (host.axes(): an SVG node) or the shared one from the orientation
 * Each overlay is a block a layout turns on, so Drafting (UI.12) and Sketch have them and Toolbox does not. Apps keep their own where
 * they have more (BimCraft's display modes feed viewlabel through host.display()). 2D apps with no 3D view get label, navbar and axes.
 */
import { el, svgEl, words, mark, oneOf } from './app-block-core.js';

export const CORNERS = ['view-tl', 'view-tr', 'view-bl', 'view-br'];
export const NAMED = ['top', 'bottom', 'front', 'back', 'left', 'right'];
export const COMPASS = ['N', 'E', 'S', 'W'];
export const NAV_IDS = ['pan', 'extents', 'window', 'orbit', 'walk'];

/** DOM-free: the six cube faces, ordered back to front for the current yaw and pitch, each with its screen rectangle (a flat drawing of the cube). */
export function cubeFaces({ yaw = 0, pitch = 0 } = {}) {
  const rad = (d) => d * Math.PI / 180, cy = Math.cos(rad(yaw)), sy = Math.sin(rad(yaw)), cp = Math.cos(rad(pitch)), sp = Math.sin(rad(pitch));
  // face normals in world space (x east, y north, z up); the view direction is -z after yaw then pitch
  const N = { top: [0, 0, 1], bottom: [0, 0, -1], front: [0, -1, 0], back: [0, 1, 0], left: [-1, 0, 0], right: [1, 0, 0] };
  return NAMED.map((name) => {
    const [x, y, z] = N[name];
    const x1 = x * cy - y * sy, y1 = x * sy + y * cy;   // yaw about z
    const depth = -y1 * cp + z * sp;                     // toward the viewer: the viewer sits at (0, -cos p, sin p) before the yaw
    const sx = x1, sy2 = -(y1 * sp + z * cp);            // screen position of the face centre (up on the screen is (0, sin p, cos p))
    return { name, visible: depth > 1e-9, depth, x: sx, y: sy2 };
  }).filter((f) => f.visible).sort((a, b) => a.depth - b.depth);
}
/** Which named view a click on the cube's face or the compass asks for ('top' for the compass ring's centre; N/E/S/W turn the plan). */
export const cubeTarget = (what) => (NAMED.includes(what) ? { view: what } : COMPASS.includes(what) ? { turn: what } : null);
export const viewLabelText = (view, display, scale) => '[-][' + [view, display, scale].filter(Boolean).join('][') + ']';

const corner = (cls) => el('div', { className: 'blk-corner ' + cls, 'data-corner': cls });
function ensureCorners(region) {
  const out = {};
  for (const c of CORNERS) {
    let n = region.querySelector(':scope > [data-corner="' + c + '"]');
    if (!n) { n = corner(c); region.append(n); }
    out[c] = n;
  }
  return out;
}

const OVERLAYS = {
  viewlabel: {
    corner: 'view-tl',
    build(host, T) {
      const box = mark(el('div', { className: 'blk-ov blk-viewlabel' }), 'viewlabel');
      const menu = el('button', { type: 'button', className: 'blk-vl-menu', 'aria-label': T('shell.ov.menu'), title: T('shell.ov.menu') }, '[-]');
      const name = el('span', { className: 'blk-vl-name' });
      box.append(menu, name);
      const refresh = () => { const v = host.view3d?.() || {}; name.textContent = viewLabelText(v.name || host.viewName?.() || T('shell.ov.view.top'), host.display?.() || '', host.scaleText?.() || '').slice(3); };
      refresh();
      return { el: box, refresh };
    },
  },
  viewcube: {
    corner: 'view-tr', needs: 'view3d',
    build(host, T) {
      const box = mark(el('div', { className: 'blk-ov blk-viewcube' }), 'viewcube');
      const svg = svgEl('svg', { viewBox: '-50 -50 100 100', width: 96, height: 96, role: 'group', 'aria-label': T('shell.ov.cube') });
      const wcs = el('button', { type: 'button', className: 'blk-wcs', title: T('shell.ov.wcs'), 'aria-label': T('shell.ov.wcs') }, T('shell.ov.wcs.short'));
      box.append(svg, wcs);
      function draw() {
        const o = host.view3d?.().orient?.() || { yaw: 0, pitch: 0 };
        const faces = cubeFaces(o);
        const kids = [svgEl('circle', { class: 'blk-cube-ring', cx: 0, cy: 0, r: 46, fill: 'none' })];
        COMPASS.forEach((c, i) => { const a = (i * 90 - o.yaw) * Math.PI / 180; const g = svgEl('text', { class: 'blk-cube-compass', x: Math.sin(a) * 40, y: -Math.cos(a) * 40 + 3, 'text-anchor': 'middle', 'data-turn': c }); g.textContent = c; kids.push(g); });
        for (const f of faces) {
          const g = svgEl('g', { class: 'blk-cube-face', 'data-view': f.name, tabindex: 0, role: 'button', 'aria-label': T('shell.ov.cube.' + f.name) },
            svgEl('rect', { x: f.x * 14 - 12, y: f.y * 14 - 12, width: 24, height: 24, rx: 2 }));
          const t = svgEl('text', { x: f.x * 14, y: f.y * 14 + 3, 'text-anchor': 'middle' }); t.textContent = T('shell.ov.cube.' + f.name + '.short'); g.append(t); kids.push(g);
        }
        svg.replaceChildren(...kids);
      }
      const go = (t) => { const c = cubeTarget(t); if (!c) return; if (c.view) host.view3d?.().go?.(c.view); else host.view3d?.().turn?.(c.turn); };
      svg.addEventListener('click', (e) => { const n = e.target.closest('[data-view],[data-turn]'); if (n) go(n.getAttribute('data-view') || n.getAttribute('data-turn')); });
      svg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const n = e.target.closest('[data-view]'); if (n) { e.preventDefault(); go(n.getAttribute('data-view')); } } });
      draw();
      return { el: box, refresh: draw };
    },
  },
  navbar: {
    corner: 'view-br',
    build(host, T) {
      const box = mark(el('div', { className: 'blk-ov blk-navbar', role: 'toolbar', 'aria-orientation': 'vertical', 'aria-label': T('shell.ov.nav') }), 'navbar');
      function draw() {
        const nav = host.nav?.() || {};
        box.replaceChildren(...NAV_IDS.filter((id) => nav[id]).map((id) => {
          const n = nav[id], b = el('button', { type: 'button', className: 'blk-tool', 'data-nav': id, title: n.label || T('shell.ov.nav.' + id), 'aria-label': n.label || T('shell.ov.nav.' + id), 'aria-pressed': n.pressed ? 'true' : null }, n.icon instanceof Node ? n.icon.cloneNode(true) : T('shell.ov.nav.' + id + '.short'));
          b.addEventListener('click', () => { n.run?.(); draw(); }); return b;
        }));
        box.hidden = !box.children.length;
      }
      draw();
      return { el: box, refresh: draw };
    },
  },
  axes: {
    corner: 'view-bl',
    build(host, T) {
      const box = mark(el('div', { className: 'blk-ov blk-axes', 'aria-hidden': 'true' }), 'axes');
      function draw() {
        const own = host.axes?.();
        if (own instanceof Node) { box.replaceChildren(own); return; }
        const o = host.view3d?.().orient?.() || { yaw: 0, pitch: 90 };
        const a = o.yaw * Math.PI / 180, p = Math.sin((o.pitch || 0) * Math.PI / 180);
        const X = [Math.cos(a) * 26, -Math.sin(a) * 26 * p], Y = [Math.sin(a) * 26, -Math.cos(a) * 26 * p];
        const svg = svgEl('svg', { viewBox: '-6 -40 60 46', width: 52, height: 40 },
          svgEl('line', { class: 'blk-ax-x', x1: 0, y1: 0, x2: X[0], y2: X[1] }), svgEl('line', { class: 'blk-ax-y', x1: 0, y1: 0, x2: Y[0], y2: Y[1] }));
        const tx = svgEl('text', { x: X[0] + 3, y: X[1] + 3 }); tx.textContent = 'X'; const ty = svgEl('text', { x: Y[0] + 3, y: Y[1] - 2 }); ty.textContent = 'Y'; svg.append(tx, ty);
        box.replaceChildren(svg);
      }
      draw();
      return { el: box, refresh: draw };
    },
  },
};
export const OVERLAY_KINDS = Object.keys(OVERLAYS);

function overlayBlock(kind) {
  const spec = OVERLAYS[kind];
  return {
    kind, family: 'overlays', places: [spec.corner, ...CORNERS.filter((c) => c !== spec.corner)], needs: spec.needs ? [spec.needs] : [], opts: { corner: oneOf(CORNERS) },
    mount(host, region, o = {}) {
      const T = words(host), corners = ensureCorners(region);
      const part = spec.build(host, T), where = corners[o.corner || spec.corner];
      where.append(part.el);
      return { el: part.el, corner: where, refresh: part.refresh, destroy() { part.el.remove(); if (!where.children.length) where.remove(); } };
    },
  };
}
export const blocks = Object.fromEntries(OVERLAY_KINDS.map((k) => [k, overlayBlock(k)]));
