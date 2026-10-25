#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-script-editor.mjs — the script editor's find and replace, folding and autocomplete (0.4 P7) in headless Chromium,
 * by keys in the real textarea: Ctrl+F finds (count, Enter / Shift+Enter, whole word, regex, a bad regex said in words),
 * Ctrl+H + Replace all is one Ctrl+Z; Ctrl+Shift+[ folds a function (the textarea loses its lines, the gutter keeps the true
 * numbers, getText and Run still see everything, copy puts the whole block on the clipboard), typing on a folded line or
 * Backspace into it unfolds first and loses nothing, Ctrl+Z after a fold puts the lines back without doubling them, an error
 * on a folded line opens the fold; typing two letters lists completions (a workspace variable, a function with its
 * arguments), arrows + Enter take one, Esc closes. No console errors.
 *   node tools/partcraft-test/browser-script-editor.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, pc, ok, shot } = h;
  const TA = '[data-cs-editor]';
  const ed = (fn, arg) => page.evaluate(([src, a]) => { const e = document.querySelector('.cs-ed').csEditor; return new Function('e', 'a', src)(e, a); }, [fn, arg]);
  const value = () => page.inputValue(TA);
  const full = () => ed('return e.getText()');
  const caretTo = (pos) => page.evaluate((p) => { const t = document.querySelector('[data-cs-editor]'); t.focus(); t.setSelectionRange(p, p); }, pos);
  const waitIdle = async () => { await page.waitForFunction(() => !document.querySelector('[data-cs-panel]')?.classList.contains('is-busy'), null, { timeout: 20000 }); await page.waitForTimeout(150); };
  const gutter = () => page.evaluate(() => [...document.querySelectorAll('.cs-gutter-in > div')].map((d) => d.textContent));

  console.log('\n== script editor: find and replace');
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'script') {
    await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(h.F.flange().part));
    await pc(() => window.partcraft.exactReady());
    await page.selectOption('[data-workspace]', 'script');
    await page.waitForSelector('[data-cs-panel]');
    await page.waitForTimeout(400);
  }
  if ((await page.inputValue('[data-cs-lang]')) !== 'craft') { await page.selectOption('[data-cs-lang]', 'craft'); await page.waitForTimeout(150); }   // a test before may leave a Lua tab
  const SRC = ['function y = sq(x)', '  y = x .* x;', '  y = y + 0;', 'end', 'xs = 1:4;', 'x = sq(xs);', 'disp(sum(x))'].join('\n');
  await page.fill(TA, SRC);
  await caretTo(0);
  await page.keyboard.press('Control+f');
  await page.waitForSelector('[data-cs-find]:visible');
  await page.keyboard.type('x');
  await page.waitForFunction(() => document.querySelectorAll('.cs-hit').length > 0);   // drawn on the next frame
  const nX = [...SRC].filter((c) => c === 'x' || c === 'X').length;
  ok((await page.textContent('[data-cs-find-count]')) === `1 of ${nX}` && (await page.$$('.cs-hit')).length === nX, `Ctrl+F, "x": 1 of ${nX} (every x, counted letter by letter), each highlighted`);
  await page.keyboard.press('Enter');
  const s1 = await page.evaluate(() => document.querySelector('[data-cs-editor]').selectionStart);
  await page.keyboard.press('Shift+Enter');
  const s0 = await page.evaluate(() => document.querySelector('[data-cs-editor]').selectionStart);
  ok(s1 > s0 && (await page.textContent('[data-cs-find-count]')).startsWith('1 of'), 'Enter goes to the next match (the selection moves), Shift+Enter back');
  await page.click('[data-cs-find-opt="wholeWord"]');
  const wordN = [...SRC.matchAll(/\bx\b/g)].length;
  ok((await page.textContent('[data-cs-find-count]')).endsWith(`of ${wordN}`), `Whole words: ${wordN} matches (as /\\bx\\b/)`);
  await page.click('[data-cs-find-opt="regex"]');
  await page.fill('[data-cs-find]', 'x(');
  ok(/Not a valid expression/.test(await page.textContent('[data-cs-find-count]')), `a broken regular expression is said in words: "${await page.textContent('[data-cs-find-count]')}"`);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+h');   // opens with the selected match as the query (like other editors): set ours
  await page.waitForSelector('[data-cs-replace]:visible');
  await page.fill('[data-cs-find]', 'x(s?)');
  await page.fill('[data-cs-replace]', 'v$1');
  await page.click('[data-cs-replace-all]');
  const replaced = await value();
  ok(replaced === SRC.replace(/\bx(s?)\b/g, 'v$1') && /Replaced/.test(await page.textContent('[data-cs-find-count]')), `Replace all with a group: x → v, xs → vs (the same as String.replace) — "${(await page.textContent('[data-cs-find-count]'))}"`);
  await page.keyboard.press('Escape');
  await page.focus(TA);
  await page.keyboard.press('Control+z');
  const undone = await value();
  ok(undone === SRC, 'one Ctrl+Z takes the whole Replace all back' + (undone === SRC ? '' : ` (got ${JSON.stringify(undone)})`));
  await shot('script-find');

  console.log('\n== script editor: folding');
  await caretTo(0);
  await page.keyboard.press('Control+Shift+BracketLeft');
  await page.waitForTimeout(100);
  const v1 = await value();
  ok(v1.split('\n').length === 5 && (await full()) === SRC && (await ed('return e.folds')) === 1, `Ctrl+Shift+[ on "function": its two inner lines leave the textarea (${v1.split('\n').length} lines shown), getText still has all ${SRC.split('\n').length}`);
  const g = await gutter();
  ok(g[0].startsWith('▸') && g[0].endsWith('1') && g[1] === '4' && g[2] === '5', `the gutter keeps the true line numbers (${g.slice(0, 4).join(' | ')}), ▸ marks the fold`);
  ok(await page.evaluate(() => /2 lines/.test(document.querySelector('[data-cs-folded]')?.textContent || '')), 'the folded line says "⋯ 2 lines"');
  // copy the folded block: the clipboard gets every line
  const copied = await page.evaluate(() => { const t = document.querySelector('[data-cs-editor]'); t.focus(); t.setSelectionRange(0, t.value.indexOf('end') + 3); const dt = new DataTransfer(); const e = new ClipboardEvent('copy', { clipboardData: dt, bubbles: true, cancelable: true }); t.dispatchEvent(e); return dt.getData('text/plain'); });
  ok(copied === SRC.split('\n').slice(0, 4).join('\n'), 'copying the folded block puts all its lines on the clipboard');
  // Run sees the whole script
  await page.keyboard.press('F5'); await waitIdle();
  ok(/30/.test(await page.evaluate(() => document.querySelector('[data-cs-console]').textContent)), 'F5 runs the whole script, folded lines included (sum of squares 30)');
  // typing at the end of the folded line unfolds it first, nothing lost
  await page.evaluate(() => { const t = document.querySelector('[data-cs-editor]'); const e = t.value.indexOf('\n'); t.focus(); t.setSelectionRange(e, e); });
  await page.keyboard.type(' % sq');
  ok((await full()) === SRC.replace('function y = sq(x)', 'function y = sq(x) % sq') && (await ed('return e.folds')) === 0, 'typing on the folded line opens the fold first and puts the text where it was typed');
  // fold again, then Backspace at the start of the next visible line (would join it into the folded line): unfolds, deletes the newline before "end"
  await caretTo(0); await page.keyboard.press('Control+Shift+BracketLeft'); await page.waitForTimeout(60);
  await page.evaluate(() => { const t = document.querySelector('[data-cs-editor]'); const e = t.value.indexOf('\n') + 1; t.focus(); t.setSelectionRange(e, e); });
  await page.keyboard.press('Backspace');
  const afterBs = await full();
  ok(afterBs === SRC.replace('function y = sq(x)', 'function y = sq(x) % sq').replace('  y = y + 0;\nend', '  y = y + 0;end') && (await ed('return e.folds')) === 0, 'Backspace into a folded line opens the fold first: the newline before "end" goes, every folded line stays');
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(60);
  // Undo of a fold: the lines come back once, not twice
  await page.fill(TA, SRC); await caretTo(0);
  await page.keyboard.press('Control+Shift+BracketLeft'); await page.waitForTimeout(60);
  await page.keyboard.press('Control+z'); await page.waitForTimeout(60);
  ok((await value()) === SRC && (await full()) === SRC, 'Ctrl+Z right after folding: the lines are back in the textarea, and getText has them once');
  await page.keyboard.press('Control+Shift+BracketLeft'); await page.waitForTimeout(60);
  await ed('e.markError(3); return 0');
  ok((await ed('return e.folds')) === 0 && (await value()) === SRC, 'an error reported on line 3, inside the fold, opens it');
  await shot('script-fold');

  console.log('\n== script editor: autocomplete');
  // an empty workspace first: variables left by earlier tests (lin…) would crowd linspace out of the list
  await page.fill(TA, 'clear\nvalue_one = 3;\n');
  await page.keyboard.press('F5'); await waitIdle();
  await page.fill(TA, 'value_one = 3;\n');
  await page.focus(TA);
  await page.keyboard.press('Control+End');
  await page.keyboard.type('va');
  await page.waitForFunction(() => (document.querySelector('.cs-ed')?.csEditor?.completionsShown || []).length > 0, null, { timeout: 5000 }).catch(() => {});
  let shown = await ed('return e.completionsShown');
  ok(shown[0] === 'value_one', `typing "va" lists the workspace variable first (${shown.join(', ')})`);
  await page.keyboard.press('Enter');
  ok((await value()).endsWith('value_one') && !(await ed('return e.completionsShown')).length, 'Enter takes it and closes the list');
  await page.keyboard.type(' + lin');
  // the list comes up a frame or two later; on a busy page longer
  await page.waitForFunction(() => (document.querySelector('.cs-ed')?.csEditor?.completionsShown || []).includes('linspace'), null, { timeout: 5000 }).catch(() => {});
  shown = await ed('return e.completionsShown');
  const detail = await page.evaluate(() => document.querySelector('[data-cs-ac-item="linspace"] .cs-ac-detail')?.textContent || '');
  ok(shown.includes('linspace') && /linspace\(/.test(detail), `functions come with their arguments ("${detail.slice(0, 60)}"; shown: ${shown.slice(0, 12).join(', ')}; lang ${await page.inputValue('[data-cs-lang]')}; text …${JSON.stringify((await value()).slice(-24))}; focus ${await page.evaluate(() => (document.activeElement?.tagName || '') + '.' + (document.activeElement?.className || ''))})`);
  const idx = shown.indexOf('linspace');
  for (let i = 0; i < idx; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  ok((await value()).endsWith('value_one + linspace'), 'arrows choose, Tab takes it');
  await page.keyboard.type(' + val');
  await page.waitForTimeout(60);
  await page.keyboard.press('Escape');
  ok(!(await ed('return e.completionsShown')).length && (await value()).endsWith('+ val'), 'Esc closes the list and keeps what was typed');
  await shot('script-autocomplete');

  console.log('\n== script editor: undo after the auto-save');
  await page.fill(TA, 'a = 1;');
  await page.focus(TA); await page.keyboard.press('Control+End');
  await page.keyboard.type('\nb = 2;');
  await page.waitForTimeout(3200);   // the script is saved into the part 2.5 s after the last key; the panel re-renders
  await page.keyboard.press('Control+z');
  ok((await value()) !== 'a = 1;\nb = 2;' && (await page.evaluate(() => document.activeElement === document.querySelector('[data-cs-editor]'))), `Ctrl+Z still works after the auto-save re-rendered the panel (the editor is kept in place; it used to be moved, which wipes a textarea's undo): "${(await value()).replace(/\n/g, '⏎')}"`);
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/craftscript');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
