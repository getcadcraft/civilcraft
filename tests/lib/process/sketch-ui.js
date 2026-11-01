/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sketch-ui.js — the structure editor of the Structure calculator (0.8 CH.24, rule 41): a small SVG canvas where a person draws a molecule — atoms by clicking, bonds by
 * clicking two atoms (again to make a double or triple bond), rings from a button, erase, undo, clean up — and hands back a SMILES string and a MOL block. The model is
 * process/env/molsketch.js (DOM-free, tested in Node); this file is only the canvas. SVG nodes are made with createElementNS and textContent; nothing is assigned as HTML.
 *   mountSketch(el, { t, mol, onUse })  →  { sketch(), setSketch(s), click(x, y), tool(name), element(el), ring(n, aromatic), undo(), clear(), clean(), use() }
 *   `mol` is the molsketch module (the host's copy); onUse({ smiles, molblock, formula, problems }) gets the drawn structure.
 */
const SVG = 'http://www.w3.org/2000/svg', W = 320, H = 240;

export function mountSketch(el, { t, mol, onUse = () => {} }) {
  const d = el.ownerDocument, mk = (tag, cls, text) => { const n = d.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const sv = (tag, attrs = {}) => { const n = d.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); return n; };
  let s = mol.newSketch(), active = -1, tool = 'draw', elem = 'C', pendingRing = null; const undoStack = [];
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': t('sketch.canvas') }); svg.setAttribute('data-sketch-canvas', ''); svg.style.cssText = 'max-height:15rem;border:1px solid currentColor;touch-action:none;background:transparent';
  const bar = mk('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.25rem;margin:0.25rem 0';
  const note = mk('p', 'text-ink-2'); note.setAttribute('aria-live', 'polite'); note.style.cssText = 'font-size:0.75rem;margin:0.25rem 0';
  const smilesBox = mk('code'); smilesBox.setAttribute('data-sketch-smiles', ''); smilesBox.style.cssText = 'font-size:0.75rem;word-break:break-all';
  const btns = {};
  const btn = (key, label, fn, pressed) => { const b = mk('button', 'btn-line btn-sm-cc', label); b.type = 'button'; b.setAttribute('data-sketch', key); b.style.cssText = 'font-size:0.8125rem;padding:0.125rem 0.5rem'; if (pressed) b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', fn); bar.append(b); btns[key] = b; return b; };
  const mark = () => { for (const k of Object.keys(btns)) if (btns[k].hasAttribute('aria-pressed')) btns[k].setAttribute('aria-pressed', String(k === 'tool-' + tool || k === 'el-' + elem)); };
  const push = () => { undoStack.push(s); if (undoStack.length > 100) undoStack.shift(); };
  const set = (n, keepActive = false) => { if (n === s) return; push(); s = n; if (!keepActive) active = -1; draw(); };

  function draw() {
    svg.replaceChildren();
    const sum = s.atoms.map(() => 0); for (const b of s.bonds) { sum[b.a] += b.order; sum[b.b] += b.order; }
    for (const b of s.bonds) {
      const A = s.atoms[b.a], B = s.atoms[b.b], dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 2.5, ny = dx / L * 2.5;
      const offs = b.order === 1 ? [0] : b.order === 2 ? [-1, 1] : [-2, 0, 2];
      for (const o of offs) svg.append(sv('line', { x1: A.x + nx * o * (b.order === 2 ? 1 : 1), y1: A.y + ny * o, x2: B.x + nx * o, y2: B.y + ny * o, stroke: 'currentColor', 'stroke-width': 1.4 }));
    }
    s.atoms.forEach((a, i) => {
      const g = sv('g', { 'data-atom': i });
      if (i === active) g.append(sv('circle', { cx: a.x, cy: a.y, r: 11, fill: 'none', stroke: 'var(--action, currentColor)', 'stroke-width': 2 }));
      if (a.el !== 'C' || s.bonds.every((b) => b.a !== i && b.b !== i)) {
        g.append(sv('circle', { cx: a.x, cy: a.y, r: 8, fill: 'var(--sheet, #fff)', stroke: 'none' }));
        const tx = sv('text', { x: a.x, y: a.y + 4, 'text-anchor': 'middle', 'font-size': 12, fill: 'currentColor' }); tx.textContent = a.el; g.append(tx);
      }
      svg.append(g);
    });
    let smiles = '', formula = '';
    try { smiles = mol.toSmiles(s); formula = s.atoms.length ? mol.formulaOf(s) : ''; } catch { smiles = ''; }
    smilesBox.textContent = smiles || '—';
    const pr = mol.problems(s); note.textContent = pr.length ? pr.map((p) => p.text).join(' ') : (formula ? formula : t('sketch.hint'));
    mark();
  }
  function pointer(ev) { const r = svg.getBoundingClientRect(), k = Math.max(r.width, 1) / W; return [(ev.clientX - r.left) / k, (ev.clientY - r.top) / k]; }
  function click(x, y) {
    const i = mol.nearest(s, x, y);
    if (pendingRing && i < 0) { const r = pendingRing; pendingRing = null; set(mol.addRing(s, r.n, x, y, { aromatic: r.aromatic })); return; }
    if (tool === 'erase') {
      if (i >= 0) { set(mol.removeAtom(s, i)); return; }
      const k = mol.nearestBond(s, x, y); if (k >= 0) set(mol.removeBond(s, s.bonds[k].a, s.bonds[k].b)); return;
    }
    if (i >= 0) {
      if (active >= 0 && active !== i) { set(mol.bond(s, active, i)); active = i; draw(); return; }
      if (active === i) { set(mol.setElement(s, i, elem), true); return; }
      active = i; draw(); return;
    }
    const n = mol.addAtom(s, elem, x, y); const idx = n.atoms.length - 1;
    set(active >= 0 ? mol.bond(n, active, idx) : n, true); active = idx; draw();
  }
  svg.addEventListener('click', (ev) => { const [x, y] = pointer(ev); try { click(x, y); } catch (e) { note.textContent = e.message; } });
  svg.addEventListener('contextmenu', (ev) => { ev.preventDefault(); active = -1; draw(); });

  btn('tool-draw', t('sketch.draw'), () => { tool = 'draw'; mark(); }, true);
  btn('tool-erase', t('sketch.erase'), () => { tool = 'erase'; active = -1; draw(); }, true);
  for (const e of ['C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br']) btn('el-' + e, e, () => { elem = e; tool = 'draw'; mark(); }, true);
  btn('ring6', t('sketch.benzene'), () => { pendingRing = { n: 6, aromatic: true }; note.textContent = t('sketch.ringhint'); });
  btn('ring6s', t('sketch.cyclohexane'), () => { pendingRing = { n: 6, aromatic: false }; note.textContent = t('sketch.ringhint'); });
  btn('ring5', t('sketch.cyclopentane'), () => { pendingRing = { n: 5, aromatic: false }; note.textContent = t('sketch.ringhint'); });
  const undo = () => { if (undoStack.length) { s = undoStack.pop(); active = -1; draw(); } };
  const clear = () => { set(mol.newSketch()); };
  const clean = () => { if (!s.atoms.length) return; try { set(mol.fromMolecule(mol.toMolecule(s))); } catch (e) { note.textContent = e.message; } };
  const use = () => {
    const pr = mol.problems(s), bad = pr.filter((p) => p.severity === 'error');
    if (!s.atoms.length || bad.length) { note.textContent = bad.length ? bad[0].text : t('sketch.empty'); return null; }
    const out = { smiles: mol.toSmiles(s), molblock: mol.toMolblock(s), formula: mol.formulaOf(s), problems: pr }; onUse(out); return out;
  };
  btn('undo', t('sketch.undo'), undo); btn('clear', t('sketch.clear'), clear); btn('clean', t('sketch.clean'), clean); const useBtn = btn('use', t('sketch.use'), use);
  useBtn.classList.add('btn-plot'); useBtn.classList.remove('btn-line');
  el.replaceChildren(mk('p', 'text-ink-2', t('sketch.lede')), bar, svg, note, mk('div', '', ''), smilesBox);
  draw();
  return { sketch: () => s, setSketch: (n) => { push(); s = n; active = -1; draw(); }, click, tool: (n) => { tool = n; mark(); }, element: (e) => { elem = e; tool = 'draw'; mark(); }, ring: (n, aromatic) => { pendingRing = { n, aromatic }; }, undo, clear, clean, use, svg };
}
