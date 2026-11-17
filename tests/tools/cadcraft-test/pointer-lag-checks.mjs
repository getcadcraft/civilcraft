/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pointer-lag-checks.mjs — the checks of browser-pointer-lag.mjs for the lab build (0.9.1, suggestion #1504): a pointer move
 * changes no nodes of the page and asks for one frame, what is under the pointer is found the same way as before on a big
 * drawing, and the "Smoother pointer on slower computers" setting (Automatic / On / Off) with its one-time note.
 * These count things; they do not depend on how fast the server is.
 */
export async function checks({ page, ok, fresh, typeCmd, shot }) {
  const over = () => page.evaluate(() => { const r = document.querySelector('.cc-over').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  /** Screen position of a world point. */
  const screenOf = (p) => page.evaluate((q) => { const v = window.cadcraft.view, r = document.querySelector('.cc-over').getBoundingClientRect(), s = v.toScreen(q.x, q.y); return { x: r.left + v.x0 + s.x, y: r.top + v.y0 + s.y }; }, p);
  /** Count what the page does during fn(): nodes added or removed, attributes written, frames asked for. */
  const counted = async (fn) => {
    await page.evaluate(() => {
      const c = (window.__count = { child: 0, attr: 0, text: 0, frames: 0, who: {} });
      c.mo = new MutationObserver((recs) => { for (const r of recs) { if (r.type === 'childList') { c.child++; const k = (r.target.className || r.target.nodeName) + ''; c.who[k] = (c.who[k] || 0) + 1; } else if (r.type === 'attributes') { c.attr++; const k = '@' + r.attributeName + ' ' + (r.target.className || r.target.nodeName); c.who[k] = (c.who[k] || 0) + 1; } else c.text++; } });
      c.mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
      c.raf = window.requestAnimationFrame;
      window.requestAnimationFrame = (cb) => { if (!cb.__lagLoop) c.frames++; return c.raf(cb); };
    });
    await fn();
    await page.waitForTimeout(250);
    return page.evaluate(() => { const c = window.__count; c.mo.disconnect(); window.requestAnimationFrame = c.raf; return { child: c.child, attr: c.attr, text: c.text, frames: c.frames, who: c.who }; });
  };
  const sweep = async (n) => {
    const b = await over();
    for (let i = 1; i <= n; i++) { const a = (i / n) * Math.PI * 2; await page.mouse.move(b.x + b.w * (0.5 + 0.4 * Math.sin(3 * a)), b.y + b.h * (0.5 + 0.4 * Math.sin(2 * a))); await page.waitForTimeout(18); }
  };
  const setPointer = (v) => page.evaluate((val) => { const r = document.querySelector('input[name="ccPointer"][value="' + val + '"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }, v);
  const state = () => page.evaluate(() => { const o = document.querySelector('.cc-over'), p = window.cadcraft.host.pointerPerf; return { light: p.light, mode: p.mode, stepped: p.stepped, cls: o.classList.contains('cc-ptr-light'), cursor: getComputedStyle(o).cursor, sys: window.cadcraft.view.systemCursor, root: document.querySelector('.cc').dataset.pointerLight, note: !document.querySelector('.cc-ptr-note').hidden, saved: JSON.parse(localStorage.getItem('cadcraft.pointer') || '{}'), set: JSON.parse(localStorage.getItem('cadcraft.settings') || '{}').pointer }; });

  console.log('\n== a pointer move changes no nodes and asks for one frame');
  await fresh(null);
  await page.mouse.move(600, 500); await sweep(10); await page.waitForTimeout(1500);   // the page settles (bars measure themselves once)
  let c = await counted(() => sweep(120));
  ok(c.child <= 2, 'no command: 120 moves add or remove no node of the page (the observers of the page stay asleep)', c.child + ' ' + JSON.stringify(c.who));
  ok(c.attr <= 12, 'and write no attribute on each move', c.attr + ' ' + JSON.stringify(c.who));
  ok(c.text >= 100, 'the coordinate readout still follows every move (its words change in place)', String(c.text));
  ok(c.frames <= 130, 'one frame a move at most', String(c.frames));
  const read = await page.evaluate(() => document.querySelector('[data-coords]').textContent);
  const at = await page.evaluate(() => { const c = window.cadcraft.view.state.cursor; return c ? [c.x, c.y] : null; });
  ok(at && /^-?[\d.,'" /-]+, -?[\d.,'" /-]+$/.test(read), 'the readout shows the pointer\'s coordinates', read);
  if ((await page.getAttribute('[data-toggle="dyn"]', 'aria-pressed')) !== 'true') await page.click('[data-toggle="dyn"]');
  await typeCmd('LINE'); await typeCmd('0,0');
  await page.mouse.move(700, 500); await sweep(10); await page.waitForTimeout(800);
  c = await counted(() => sweep(120));
  ok(c.child <= 2, 'inside LINE (rubber band, snaps, dynamic input): still no node added or removed', c.child + ' ' + JSON.stringify(c.who));
  ok(c.attr <= 250, 'the dynamic-input box only moves (its position, nothing else)', c.attr + ' ' + JSON.stringify(c.who));
  ok(c.frames <= 130, 'one frame a move at most', String(c.frames));
  const dyn = await page.evaluate(() => { const b = document.querySelector('.cc-dyn'); return { hidden: b.hidden, fields: [...b.querySelectorAll('.cc-dyn-f')].map((f) => f.textContent), prompt: b.querySelector('.cc-dyn-p')?.textContent || '' }; });
  ok(!dyn.hidden && dyn.fields.length === 2 && dyn.fields.every((f) => f.length) && dyn.prompt.length > 3, 'dynamic input shows its prompt and two live fields', JSON.stringify(dyn));
  const delta = await page.evaluate(() => document.querySelector('[data-coords]').textContent);
  ok(/Δ/.test(delta), 'the readout carries the distance and angle from the first point', delta);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.click('[data-toggle="dyn"]');

  console.log('\n== moves that come faster than frames are folded into one update');
  await page.evaluate(() => localStorage.setItem('cadcraft.pointer', JSON.stringify({ auto: true })));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host?.pointerPerf);
  await page.mouse.move(640, 480); await page.waitForTimeout(200);
  const burst = await page.evaluate(async () => {
    const o = document.querySelector('.cc-over'), r = o.getBoundingClientRect(), v = window.cadcraft.view;
    const seen = [];
    const send = (dx) => { o.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r.left + 300 + dx, clientY: r.top + 300, pointerType: 'mouse' })); seen.push(v.state.cursor.x); };
    await new Promise((f) => setTimeout(f, 60));
    send(0); send(10); send(20); send(30); send(40);
    const waiting = window.cadcraft.host.pointerPerf.gate.waiting;
    await new Promise((f) => requestAnimationFrame(() => requestAnimationFrame(f)));
    return { seen, after: v.state.cursor.x, waiting, want: v.toWorld(300 + 40 - v.x0, 300 - v.y0).x };
  });
  ok(burst.seen[0] === burst.seen[4] && burst.waiting, 'five moves in one frame: the first is applied at once, the rest wait', JSON.stringify(burst));
  ok(Math.abs(burst.after - burst.want) < 1e-6, 'the frame then applies the newest position', JSON.stringify(burst));
  const clickAt = await page.evaluate(async () => {
    const o = document.querySelector('.cc-over'), r = o.getBoundingClientRect(), v = window.cadcraft.view;
    await new Promise((f) => setTimeout(f, 60));
    const mv = (x) => o.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r.left + x, clientY: r.top + 200, pointerType: 'mouse', pointerId: 1 }));
    mv(200); mv(260);
    o.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + 260, clientY: r.top + 200, pointerType: 'mouse', pointerId: 1, button: 0 }));
    const x = v.state.cursor.x;
    o.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: r.left + 260, clientY: r.top + 200, pointerType: 'mouse', pointerId: 1, button: 0 }));
    return { x, want: v.toWorld(260 - v.x0, 200 - v.y0).x };
  });
  ok(Math.abs(clickAt.x - clickAt.want) < 1e-6, 'a press applies a waiting move first: the click lands where the pointer is', JSON.stringify(clickAt));

  console.log('\n== Smoother pointer on slower computers: Automatic');
  let s = await state();
  ok(s.mode === 'auto' && !s.light && s.cursor !== 'crosshair', 'starts on Automatic with the drawn crosshair', JSON.stringify(s));
  ok(await page.$('[data-cc-pointer-set] input[name="ccPointer"][value="auto"]:checked'), 'Settings has the choice, on Automatic');
  await page.evaluate(() => { const p = window.cadcraft.host.pointerPerf; for (let i = 0; i < 59; i++) p.feed(70); });
  ok(!(await state()).light, 'two slow stretches while the pointer moves: nothing changes yet');
  await page.evaluate(() => { const p = window.cadcraft.host.pointerPerf; for (let i = 0; i < 31; i++) p.feed(70); });
  s = await state();
  ok(s.light && s.stepped && s.cls && s.cursor === 'crosshair' && s.sys && s.root === 'on', 'frames stay slow: the light pointer turns on (the system\'s crosshair pointer)', JSON.stringify(s));
  ok(s.note && s.saved.stepped && s.saved.noted, 'a note says what was turned down, and it is remembered', JSON.stringify(s.saved));
  const noteText = await page.evaluate(() => document.querySelector('.cc-ptr-note').textContent);
  ok(/Smoother pointer/.test(noteText) && /Settings/.test(noteText), 'the note names the setting', noteText);
  await page.mouse.move(700, 520); await page.waitForTimeout(150);
  await shot('pointer-note');
  await page.click('[data-ptr-note-close]');
  ok(!(await state()).note, 'the note closes');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host?.pointerPerf);
  s = await state();
  ok(s.light && !s.note, 'after a reload it is still on, and the note does not come back', JSON.stringify(s));

  console.log('\n== the light pointer');
  await page.setInputFiles('[data-file]', new URL('../../fixtures/showcase/cadcraft-sample-house.dwg', import.meta.url).pathname);
  await page.waitForFunction(() => window.cadcraft.doc.all().length > 0, null, { timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.mouse.move(650, 500); await page.waitForTimeout(300);
  c = await counted(() => sweep(100));
  ok(c.frames <= 34, 'no command: a moving pointer asks for few frames, under a third of the moves (nothing is drawn for it)', String(c.frames));
  ok(c.text >= 80, 'the coordinate readout still follows', String(c.text));
  const line = await page.evaluate(() => { const e = window.cadcraft.doc.all().find((x) => x.type === 'line' && window.cadcraft.doc.editable(x) && Math.hypot(x.x2 - x.x1, x.y2 - x.y1) > 0); return e ? { id: e.id, mx: (e.x1 + e.x2) / 2, my: (e.y1 + e.y2) / 2, x1: e.x1, y1: e.y1 } : null; });
  ok(!!line, 'the sample house has a line to point at');
  if (line) {
    const m = await screenOf({ x: line.mx, y: line.my });
    await page.mouse.move(m.x - 60, m.y - 40); await page.waitForTimeout(30);
    await page.mouse.move(m.x, m.y);
    const moving = await page.evaluate(() => window.cadcraft.view.state.hover);
    await page.waitForTimeout(260);
    const rested = await page.evaluate(() => window.cadcraft.view.state.hover);
    ok(moving == null && rested != null, 'the object under the pointer lights up when the pointer rests', JSON.stringify({ moving, rested }));
    await page.mouse.click(m.x, m.y); await page.waitForTimeout(150);
    ok(await page.evaluate(() => window.cadcraft.host.selection.size === 1), 'a click still selects it');
    await page.keyboard.press('Escape');
    await typeCmd('LINE');
    const e1 = await screenOf({ x: line.x1, y: line.y1 });
    await page.mouse.move(e1.x + 30, e1.y + 30); await page.mouse.move(e1.x + 3, e1.y + 2); await page.waitForTimeout(120);
    const sn = await page.evaluate(() => window.cadcraft.view.state.snap);
    ok(sn && Math.abs(sn.x - line.x1) < 1e-6 && Math.abs(sn.y - line.y1) < 1e-6, 'inside a command the object snap answers on the move, as before', JSON.stringify(sn));
    await shot('pointer-light-snap');
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  }

  console.log('\n== On / Off');
  await setPointer('off');
  s = await state();
  ok(!s.light && !s.cls && s.set === 'off' && !s.saved.stepped, 'Off: the drawn crosshair is back and Automatic\'s memory is cleared', JSON.stringify(s));
  await page.mouse.move(660, 510); await page.mouse.move(680, 520); await page.waitForTimeout(120);
  ok((await state()).cursor === 'none', 'the drawn crosshair stands in for the pointer again (cursor none)');
  await page.evaluate(() => { const p = window.cadcraft.host.pointerPerf; for (let i = 0; i < 200; i++) p.feed(70); });
  ok(!(await state()).light, 'Off never turns it on, however slow the frames');
  await setPointer('on');
  s = await state();
  ok(s.light && s.cursor === 'crosshair' && s.set === 'on' && !s.note, 'On: light at once, no note', JSON.stringify(s));
  await page.click('[data-settings-open] >> visible=true').catch(() => {});
  await page.waitForTimeout(500);
  await page.click('[data-settings-tab="app"] >> visible=true').catch(() => {});
  await page.click('dialog[data-app-settings] >> text="Smoother pointer on slower computers" >> visible=true').catch(() => {});
  await page.evaluate(() => document.querySelector('[data-cc-pointer-set]')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => { const f = document.querySelector('[data-cc-pointer-set]'); const r = f?.getBoundingClientRect(); return !!r && r.width > 100 && r.height > 20; }), 'the setting shows in the Settings dialog');
  await shot('pointer-setting');
  await page.keyboard.press('Escape');
  await setPointer('auto');
  s = await state();
  ok(s.mode === 'auto' && !s.light, 'back on Automatic the watching starts again', JSON.stringify(s));

  console.log('\n== tests and films: Automatic never steps down under automation');
  await page.evaluate(() => localStorage.removeItem('cadcraft.pointer'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host?.pointerPerf);
  await page.evaluate(() => { const p = window.cadcraft.host.pointerPerf; for (let i = 0; i < 300; i++) p.feed(70); });
  s = await state();
  ok(!s.light && !s.note, 'a driven browser keeps the drawn crosshair (screenshots and films stay as they were)', JSON.stringify(s));

  console.log('\n== a big drawing: what is under the pointer is found through the grid, with the same answers');
  const n = await fresh('cadcraft-chip-sky130.dwg');
  const cmp = await page.evaluate(() => {
    const v = window.cadcraft.view, doc = window.cadcraft.doc;
    const ext = v.extents(), kinds = new Set(['end', 'mid', 'cen', 'quad', 'int', 'perp', 'node', 'ins']);
    let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const ids = [...doc.entities.keys()], pts = [];
    for (let i = 0; i < 150; i++) {
      if (i % 3 === 0) pts.push({ x: ext.minX + rnd() * (ext.maxX - ext.minX), y: ext.minY + rnd() * (ext.maxY - ext.minY) });
      else { const b = v.boundsOf(doc.get(ids[Math.floor(rnd() * ids.length)])); pts.push({ x: b.minX + (rnd() - 0.5) * 4 / v.zoom, y: b.minY + (rnd() - 0.5) * 4 / v.zoom }); }
    }
    const fast = pts.map((p) => [v.pick(p), v.pickAll(p).join(), JSON.stringify(v.snap(p, { kinds }))]);
    const grid = !!v.ensureCache().grid;
    const near = v.nearEntities;
    let tested = 0;
    v.nearEntities = function (p, r) { const got = near.call(this, p, r); tested += got.length ?? 0; return got; };
    pts.forEach((p) => v.pick(p));
    v.nearEntities = () => doc.entities.values();   // the walk over every object, as it was
    const slow = pts.map((p) => [v.pick(p), v.pickAll(p).join(), JSON.stringify(v.snap(p, { kinds }))]);
    v.nearEntities = near;
    const bad = fast.findIndex((f, i) => f.join('|') !== slow[i].join('|'));
    return { grid, bad, hits: fast.filter((f) => f[0] != null).length, snaps: fast.filter((f) => f[2] !== 'null').length, per: tested / pts.length, example: bad >= 0 ? [fast[bad], slow[bad]] : null };
  });
  ok(cmp.grid, n + ' objects: the grid is in use');
  ok(cmp.bad < 0, 'pick, pick-all and object snap give the same answers as walking every object (150 points)', JSON.stringify(cmp.example));
  ok(cmp.hits >= 20 && cmp.snaps >= 20, 'and the points did hit objects and snaps', JSON.stringify({ hits: cmp.hits, snaps: cmp.snaps }));
  ok(cmp.per < n / 50, 'a pick tests a small share of the drawing', cmp.per.toFixed(1) + ' objects a pick, of ' + n);
}
