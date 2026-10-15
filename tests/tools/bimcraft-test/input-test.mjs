/* SPDX-License-Identifier: Apache-2.0 */
/**
 * input-test.mjs — BimCraft's menu styles, keys and mouse without a browser (0.5 part 4, track IP.1).
 *   node bin/test-bimcraft.mjs --input [--build dev|x.y] [--verbose]
 * The engine (the shell's assets/js/app-input.js since IP.2: keys, sequences, matching, validation of imported files, moving commands), the
 * registry and built-in styles (input-bimcraft.js) against the build's own ui.inc, settings.inc and en.json: every
 * toolbar button is a command, every selector names something that exists, every built-in style places every command,
 * has no clashing keys, and survives export → import; every label is in the language file.
 * Browser side: tools/bimcraft-test/browser-input.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function inputMode({ APP, ROOT }) {
  const IP = await import(path.join(ROOT, 'public_html/assets/js/app-input.js'));   // the shell's engine (IP.2)
  const { COMMANDS, STYLES, STYLE_ORDER, GROUPS } = await import(path.join(APP, 'input-bimcraft.js'));
  const M = await import(path.join(APP, 'input-mouse.js'));
  const en = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
  const ui = fs.readFileSync(path.join(APP, 'ui.inc'), 'utf8');
  const bar = fs.readFileSync(path.join(ROOT, 'public_html/core/components/app-bar.inc'), 'utf8');
  let good = 0, bad = 0;
  const ok = (c, m) => { if (c) good++; else bad++; if (!c || process.argv.includes('--verbose')) console.log((c ? '  ok   ' : '  FAIL ') + m); };
  const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), m + (JSON.stringify(a) === JSON.stringify(b) ? '' : ' — got ' + JSON.stringify(a)));

  console.log('== keys');
  eq(['ctrl+shift+v', 'Shift+Ctrl+V', 'cmd+z', 'f9', 'esc', 'w', 'Ctrl+,', 'Alt+Shift+3', 'del'].map(IP.normCombo), ['Ctrl+Shift+V', 'Ctrl+Shift+V', 'Ctrl+Z', 'F9', 'Escape', 'W', 'Ctrl+,', 'Alt+Shift+3', 'Delete'], 'normCombo writes each key one way');
  eq(['Ctrl+Z+X', 'Ctrl+', 'Hyper+Q', 'Ctrl', 'F13', '', 12].map(IP.normCombo), [null, null, null, null, null, null, null], 'normCombo refuses two keys, modifiers alone, unknown names');
  eq(['wa', 'W A', 'Ctrl+K Ctrl+S', 'F9', 'abcde', 'a b c d e'].map(IP.normSeq), ['W A', 'W A', 'Ctrl+K Ctrl+S', 'F9', null, null], 'normSeq: two to four letters together are a sequence; at most four keys');
  eq(['W A', 'Ctrl+Z', '3 D', 'Ctrl+K Ctrl+S'].map(IP.showSeq), ['WA', 'Ctrl+Z', '3D', 'Ctrl+K Ctrl+S'], 'showSeq');
  const ev = (key, code, mods = {}) => IP.eventCombo({ key, code, ...mods });
  eq([ev('w', 'KeyW'), ev('W', 'KeyW', { shiftKey: true }), ev('z', 'KeyZ', { metaKey: true }), ev('F9', 'F9'), ev(' ', 'Space'), ev('Control', 'ControlLeft', { ctrlKey: true }), ev('3', 'Digit3'), ev('ü', 'BracketLeft')],
    ['W', 'Shift+W', 'Ctrl+Z', 'F9', 'Space', null, '3', null], 'eventCombo (Cmd = Ctrl; a lone modifier is no key; letters by their place, not their character)');
  ok(IP.isTyping('W') && IP.isTyping('Shift+W') && !IP.isTyping('Ctrl+W') && !IP.isTyping('F9'), 'isTyping');

  console.log('== registry');
  const ids = COMMANDS.map((c) => c.id);
  ok(new Set(ids).size === ids.length, 'command ids are unique (' + ids.length + ')');
  ok(COMMANDS.every((c) => GROUPS.includes(c.group)), 'every command is in a group');
  ok(COMMANDS.every((c) => typeof en[c.label] === 'string'), 'every command has its name in en.json');
  ok(GROUPS.every((g) => typeof en['input.grp.' + g] === 'string'), 'every group has its name in en.json');
  // every selector names an attribute the page has (ui.inc, the app bar, or settings.inc)
  const attr = (sel) => [...sel.matchAll(/\[(data-[\w-]+)(?:="([^"]*)")?\]/g)].map((m) => m[2] ? `${m[1]}="${m[2]}"` : m[1]);
  const missing = COMMANDS.filter((c) => !attr(c.sel).every((a) => ui.includes(a) || bar.includes(a)));
  ok(!missing.length, 'every command\'s button is in ui.inc or the app bar' + (missing.length ? ': ' + missing.map((c) => c.id).join(', ') : ''));
  // every button of the toolbar does something a command does (else a style would lose it)
  const tbStart = ui.indexOf('data-toolbar hidden>'), tbEnd = ui.indexOf('data-sectionbar', tbStart);
  const tb = ui.slice(tbStart, tbEnd);
  const acts = [...tb.matchAll(/<button[^>]*?\s(data-(?:act|view|toggle|vis|lib-tool|model-toggle|cloud-open|map-open|handoff-ifc)(?:="([^"]*)")?)/g)].map((m) => m[1]);
  const covered = new Set(COMMANDS.flatMap((c) => attr(c.sel)));
  const uncovered = [...new Set(acts)].filter((a) => !covered.has(a));
  ok(acts.length > 30 && !uncovered.length, 'every toolbar button (' + new Set(acts).size + ') is a command' + (uncovered.length ? ': missing ' + uncovered.join(', ') : ''));
  const fixed = COMMANDS.filter((c) => c.fixed).map((c) => c.id);
  eq(fixed, ['edit.delete', 'edit.select-none'], 'Delete and Esc are fixed');

  console.log('== built-in styles');
  eq(STYLE_ORDER, ['cadcraft', 'home', 'ribbon', 'drafting', 'viewer'], 'five styles in order (Viewer since 0.5 IP.3)');
  for (const id of STYLE_ORDER) {
    const s = IP.resolve(STYLES[id], STYLES);
    ok(typeof en[s.name] === 'string' && typeof en['input.style.' + id + '.hint'] === 'string', id + ': name and hint in en.json');
    const keys = [...(s.menus || []).map((m) => m.label), ...(s.tabs || []).flatMap((t) => [t.label, ...t.panels.map((p) => p.label)]), ...Object.values(s.labels || {})];
    const lost = keys.filter((k) => typeof en[k] !== 'string');
    ok(!lost.length, id + ': every menu, tab, panel and label in en.json' + (lost.length ? ': ' + lost.join(', ') : ''));
    eq(IP.conflicts(s, COMMANDS), [], id + ': no clashing keys');
    eq(IP.unplaced(s, COMMANDS), [], id + ': every command has a place');
    const all = [...(s.menus || []).flatMap((m) => m.items), ...(s.bar || []), ...(s.quick || []), ...(s.tabs || []).flatMap((t) => t.panels.flatMap((p) => p.items))].filter((x) => x !== '-');
    ok(all.every((x) => ids.includes(x)), id + ': only known commands');
    const r = IP.importProfile(IP.exportProfile({ ...s, name: id, base: id }), COMMANDS, STYLES);
    ok(r.ok && !r.problems.length && JSON.stringify(IP.resolve(r.profile, STYLES).keys) === JSON.stringify(s.keys), id + ': export → import gives the same keys');
    ok(Object.values(s.keys || {}).flat().every((k) => IP.normSeq(k) === k), id + ': keys written the one way');
  }
  eq(STYLES.cadcraft.mouse.orbit3d, null, 'CadCraft leaves each 3D view its own buttons');
  const typedAll = Object.values(STYLES.drafting.typed).flat();
  ok(new Set(typedAll).size === typedAll.length, 'Drafting classic: no word on two commands');

  console.log('== matching keys');
  const rib = IP.resolve(STYLES.ribbon, STYLES), km = new IP.KeyMatcher(rib, COMMANDS);
  eq([km.press('W'), km.press('A')], [{ wait: 'W' }, { run: 'model.wall' }], 'ribbon: W A = Wall');
  eq([km.press('W'), km.press('N')], [{ wait: 'W' }, { run: 'model.window' }], 'ribbon: W N = Window');
  eq(km.press('Ctrl+Z'), { native: 'edit.undo' }, 'Ctrl+Z is the app\'s own: passed through');
  eq(km.press('X'), { blocked: 'view.section' }, 'X (the app\'s Section) is held back in the ribbon');
  eq([km.press('Q'), km.press('W'), km.press('Q')], [null, { wait: 'W' }, null], 'unknown keys pass; a wrong second key ends the sequence');
  eq([km.press('W'), km.press('D'), km.press('R')], [{ wait: 'W' }, { wait: 'D' }, { run: 'model.door' }], 'a wrong second key starts its own sequence');
  ok(km.keysOf('view.section')[0] === 'S C', 'keysOf');
  const home = new IP.KeyMatcher(IP.resolve(STYLES.home, STYLES), COMMANDS);
  eq([home.press('W'), home.press('F9'), home.press('Ctrl+L')], [{ native: 'model.wall' }, { run: 'view.3d' }, { run: 'library.open' }], 'Home design: W is the app\'s own, F9 and Ctrl+L are the style\'s');
  eq([IP.matchTyped(STYLES.drafting, 'win'), IP.matchTyped(STYLES.drafting, 'u'), IP.matchTyped(STYLES.drafting, 'w'), IP.matchTyped(STYLES.drafting, 'zzz')], ['model.window', 'edit.undo', null, null], 'typed words: exact, a unique start, ambiguous, unknown');

  console.log('== changing a style');
  let p = IP.resolve(STYLES.home, STYLES);
  p = IP.setKeys(p, 'model.roof', ['q', 'ctrl+shift+r', 'nonsense!', 'Q']);
  eq(p.keys['model.roof'], ['Q', 'Ctrl+Shift+R'], 'setKeys: normalised, bad and repeated keys dropped');
  p = IP.moveCommand(p, 'model.roof', '6');
  ok(p.menus[6].items.includes('model.roof') && !p.menus[2].items.includes('model.roof'), 'moveCommand: Roof from Build to Tools');
  p = IP.moveCommand(p, 'model.roof', null);
  eq(IP.unplaced(p, COMMANDS), ['model.roof'], 'no place: keys only');
  let r2 = IP.moveCommand(IP.resolve(STYLES.ribbon, STYLES), 'model.roof', '4/3');
  ok(r2.tabs[4].panels[3].items.includes('model.roof'), 'moveCommand on a ribbon: tab/panel');
  p = IP.setKeys(p, 'model.floor', ['W']);
  eq(IP.conflicts(p, COMMANDS).map((c) => c.kind + ':' + c.seq), ['same:W'], 'a key on two commands is a clash');
  p = IP.setKeys(IP.resolve(STYLES.home, STYLES), 'model.floor', ['W F']);
  eq(IP.conflicts(p, COMMANDS).map((c) => c.kind + ':' + c.seq), ['prefix:W'], 'W and W F: W would run first');
  p = IP.setKeys(IP.resolve(STYLES.home, STYLES), 'model.floor', ['Delete']);
  ok(IP.conflicts(p, COMMANDS).some((c) => c.kind === 'fixed'), 'Delete on another command clashes with the fixed key');

  console.log('== imported files are untrusted');
  const v = (o) => IP.validateProfile(o, COMMANDS, STYLES);
  ok(!v(null).ok && !v([]).ok && !v({ format: 'x', version: 1 }).ok && !v({ format: IP.FORMAT, version: 2 }).ok, 'wrong shape, format or version: refused');
  const r = v({ format: IP.FORMAT, version: 1, name: 'A\u0000 <b>style</b>' + 'x'.repeat(80), base: 'home', layout: 'evil', labels: { 'model.wall': 'input.cmd.file.save' },
    keys: { 'model.wall': ['Ctrl+W', 'Ctrl+Nope'], 'edit.delete': ['X'], 'no.such': ['Q'] }, typed: { 'model.wall': ['wa ll', 'WALL', 'w@'] },
    menus: [{ label: 'Mine', items: ['model.wall', 'no.such', 'model.wall', '-'] }], mouse: { wheel: 7, zoomSpeed: 99, pan2d: ['left', 'nose'], orbit3d: { left: 'fly' } } });
  ok(r.ok, 'a messy file is still read');
  eq([r.profile.name.length <= 40, r.profile.name.includes('\u0000'), r.profile.layout, r.profile.labels], [true, false, 'menubar', undefined], 'name cut and cleaned, layout from the base, labels never from a file');
  eq(r.profile.keys, { 'model.wall': ['Ctrl+W'] }, 'bad keys, fixed commands and unknown commands dropped');
  eq(r.profile.typed, { 'model.wall': ['WALL'] }, 'only plain command words');
  eq(r.profile.menus, [{ label: 'Mine', items: ['model.wall', '-'] }], 'menus: unknown and repeated commands dropped');
  eq(r.profile.mouse, { wheel: 1, zoomSpeed: 4, pan2d: ['left'], orbit3d: { left: 'orbit', middle: 'zoom', right: 'pan' } }, 'mouse: every value in range');
  ok(r.problems.includes('unknown:no.such') && r.problems.includes('key:model.wall') && r.problems.includes('base') === false, 'the problems are listed');
  eq(IP.importProfile('{', COMMANDS, STYLES).problems, ['json'], 'not JSON');
  eq(IP.importProfile('x'.repeat(IP.LIMITS.bytes + 1), COMMANDS, STYLES).problems, ['size'], 'too big');
  ok(v({ format: IP.FORMAT, version: 1, base: '__proto__' }).problems.includes('base'), 'an unknown base is said');

  console.log('== mouse');
  eq([M.wheelFactor(), M.panButton(1), M.panButton(2), M.panButton(0), M.action3d(0)], [1, true, true, false, null], 'before any style: BimCraft\'s own');
  M.setMouse(IP.resolve(STYLES.ribbon, STYLES).mouse);
  eq([M.panButton(1), M.panButton(2), M.action3d(0), M.action3d(1)], [true, false, 'none', 'pan'], 'BIM ribbon: middle pans the plan, middle pans in 3D, left does nothing');
  let seen = null;
  const off = M.onMouse((m) => { seen = m.wheel; });
  M.setMouse(IP.cleanMouse({ wheel: -1, zoomSpeed: 2 }));
  eq([seen, M.wheelFactor()], [-1, -2], 'onMouse follows; wheel turned round and faster');
  off();
  M.setMouse(IP.resolve(STYLES.cadcraft, STYLES).mouse);

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
