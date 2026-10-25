/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCommands, shortcutCommand, createDrawingTabs } from '../../../../public_html/assets/apps/bimcraft/dev/workspace/commands.js';
import { availability } from '../../../../public_html/assets/apps/bimcraft/dev/workspace/availability.js';
import { init, t } from '../../../../public_html/assets/apps/bimcraft/dev/i18n.js';
import fs from 'node:fs';
// ours (2026-10-24): the workspace's words are text keys; the English file gives the sentences these tests read
init({ strings: JSON.parse(fs.readFileSync(new URL('../../../../public_html/assets/apps/bimcraft/dev/lang/en.json', import.meta.url), 'utf8')) });
const valid = () => ({ document: {}, busy: false, dirty: true, canUndo: true, canRedo: true, selection: [42], levels: [{ guid: 'storey-1' }], view: { id: 'plan:storey-1', kind: 'plan' }, settings: {} });
test('quick access, ribbon and shortcuts can share exactly one action and live enablement', () => {
  const s = valid(); let executions = 0, reason;
  const commands = createCommands({ t, state: () => s, actions: { save: () => ++executions }, explain: v => reason = v });
  assert.equal(commands.execute('save'), 1);
  s.busy = true; assert.equal(commands.execute('save'), false); assert.match(reason, /Wait/); assert.equal(executions, 1);
  s.busy = false; s.dirty = false; assert.equal(commands.describe('save').enabled, false);
  s.dirty = true; s.document = null; assert.equal(commands.execute('save'), false); assert.equal(executions, 1);
});
test('selection, view type, undo history and template restrictions have distinct reasons', () => {
  const s = valid(), actions = Object.fromEntries(['range','detail','scale','undo','redo','clear'].map(id => [id, () => {}]));
  const c = createCommands({ t, state: () => s, actions });
  assert.equal(c.describe('range').enabled, true); s.view.kind = '3d'; assert.match(c.describe('range').reason, /3D/);
  s.view.kind = 'plan'; s.settings.template = 'Plans'; assert.match(c.describe('detail').reason, /view template/);
  assert.equal(c.describe('range').enabled, true);
  s.canRedo = false; s.canUndo = false; s.selection = [];
  assert.match(c.describe('undo').reason, /nothing to undo/); assert.match(c.describe('redo').reason, /nothing to redo/); assert.match(c.describe('clear').reason, /No element/);
});
test('shortcuts respect typing, contenteditable, dialogs, modifiers and prior cancellation', () => {
  const e = { key: 'z', ctrlKey: true, target: { closest: () => null } };
  assert.equal(shortcutCommand(e), 'undo'); assert.equal(shortcutCommand({ ...e, shiftKey: true }), 'redo');
  assert.equal(shortcutCommand({ ...e, key: 's' }), 'save');
  for (const target of ['input','textarea','select','contenteditable','dialog']) assert.equal(shortcutCommand({ ...e, target: { closest: () => target } }), null);
  assert.equal(shortcutCommand({ ...e, defaultPrevented: true }), null); assert.equal(shortcutCommand({ ...e, altKey: true }), null);
  assert.equal(shortcutCommand({ ...e, key: 'c' }), null);
});
test('drawing closure and re-opening retain document ownership; a new editor resets tabs', () => {
  const t = createDrawingTabs(), doc = {}, other = {};
  assert.equal(t.reset(doc), true); t.open({ id: '3d', kind: '3d' }); t.open({ id: 'plan:g1', kind: 'plan', guid: 'g1' });
  assert.equal(t.all.length, 2); assert.equal(t.reset(doc), false); assert.equal(t.all.length, 2);
  assert.equal(t.close('plan:g1').id, '3d'); assert.equal(t.close('3d'), null); assert.equal(t.reset(doc), false);
  t.open({ id: '3d' }); assert.equal(t.reset(other), true); assert.equal(t.all.length, 0);
});
// ours (2026-10-24): Doc's review statuses (planned, audit, uncertain, his card numbers) stay in his fork. Here a ribbon tool works
// when BimCraft has it (workspace/engine.js: the app's own button) and otherwise says it is not built yet.
test('a tool BimCraft lacks says so; a tool it has runs its own button, with the same live reasons', () => {
  const s = valid(), c = createCommands({ t, state: () => s, actions: {} });
  const button = { disabled: false, getAttribute: () => null }, root = { querySelector: () => button }, ctx = { root, t };
  for (const id of ['curtain', 'modelline', 'attach', 'pin']) { const a = availability(id, c, s, ctx); assert.equal(a.enabled, false); assert.match(a.reason, /Not built in BimCraft yet/); }
  for (const id of ['roof', 'column', 'stair', 'clash', 'takeoff']) assert.equal(availability(id, c, s, ctx).enabled, true, id);
  button.disabled = true; assert.equal(availability('roof', c, s, ctx).enabled, false);
  button.disabled = false; s.document = null; assert.match(availability('roof', c, s, ctx).reason, /Open an IFC/);
  s.document = {}; assert.equal(availability('roof', c, s, { root: { querySelector: () => null }, t }).enabled, false);
});
