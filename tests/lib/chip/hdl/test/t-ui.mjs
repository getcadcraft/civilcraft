/* SPDX-License-Identifier: Apache-2.0 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { makeDocument } from './fake-dom.mjs';
import { makeCtx } from './ctx.mjs';
const { ok, eq, section, fixture, mine, ROOT } = globalThis.__chipTest;
const S = await import(pathToFileURL(path.join(ROOT, 'lib/schematic/index.js')).href);
const IDX = await mine('index.js');
const US = await mine('ui-source.js');
const tick = () => new Promise((r) => setTimeout(r, 0));
const find = (el, pred) => el.all(pred)[0];
const texts = (el) => el.all(() => true).map((e) => e.textContent);

section('Panels contract');
{
  const { ctx } = makeCtx({});
  const ps = IDX.allPanels(ctx);
  eq(ps.map((p) => p.id), ['chip-source', 'chip-hierarchy', 'chip-netlist'], 'three panels in menu order');
  eq(ps.map((p) => p.title), ['Source', 'Hierarchy', 'Netlist'], 'English titles when ctx.t does not know the key');
  ok(ps.every((p) => typeof p.mount === 'function'), 'each has mount(el, ctx)');
  const es = IDX.allPanels({ ...ctx, t: (k) => ({ 'chip.src.title': 'Código fuente' }[k] || k) });
  eq(es[0].title, 'Código fuente', 'titles through ctx.t');
  eq([US.starter('cpu.v'), US.starter('x/core.vhd').split('\n')[0]], ['module cpu ();\nendmodule\n', 'entity core is'], 'new file starters');
}

section('Source and hierarchy panels on a stand-in DOM');
{
  const doc = makeDocument();
  const { ctx, sets, store } = makeCtx({ 'alu.v': fixture('alu.v'), 'two_stage.v': fixture('two_stage.v'), 'bad.v': fixture('bad.v') }, { schematic: S });
  const [src, hier, netp] = IDX.allPanels(ctx);
  const a = doc.createElement('div'), b = doc.createElement('div'), c = doc.createElement('div');
  doc.body.append(a, b, c);
  const ma = src.mount(a, ctx), mb = hier.mount(b, ctx), mc = netp.mount(c, ctx);
  await tick(); await tick();
  ok(doc.getElementById('chip-hdl-css'), 'styles added once');
  const ta = find(a, (e) => e.tagName === 'TEXTAREA');
  eq(ta.value, fixture('alu.v'), 'editor shows the first file');
  const fileSel = find(a, (e) => e.tagName === 'SELECT');
  eq(fileSel.children.map((o) => o.attrs.value), ['alu.v', 'bad.v', 'two_stage.v'], 'file list');
  fileSel.value = 'bad.v'; fileSel.dispatchEvent({ type: 'change' });
  eq(ta.value, fixture('bad.v'), 'switching file');
  const gut = find(a, (e) => e.tagName === 'PRE');
  const marked = gut.children.filter((s) => s.className === 'error').map((s) => s.textContent);
  eq(marked, ['● 1', '● 3', '● 4', '● 9'], 'gutter marks the four error lines');
  ok(gut.children[0].attrs.title.includes('after the module header'), 'marker title carries the message');
  const items = find(a, (e) => e.tagName === 'UL').children;
  eq(items.length, 7, 'problem list: four errors and three "not used" warnings');
  const third = items.find((li) => li.textContent.includes('bad.v:4:18'));
  third.click();
  eq(ta.selectionStart, fixture('bad.v').split('\n').slice(0, 3).join('\n').length + 1 + 17, 'clicking a row puts the cursor at line 4, column 18');
  ta.value = ta.value.replace('a & ;', 'a & b;'); ta.dispatchEvent({ type: 'input' });
  await new Promise((r) => setTimeout(r, 450));
  ok(!find(a, (e) => e.tagName === 'UL').textContent.includes('bad.v:3:18'), 're-checked after typing');
  ok(sets.length >= 2 && sets.every((x) => x.src === 'hdl' || x.src === 'netlist'), 'Problems store fed by both sources');
  find(a, (e) => e.tagName === 'BUTTON' && e.textContent === 'Save').click(); await tick();
  ok(store.get('bad.v').includes('a & b;'), 'Save writes the file');
  const tree = find(b, (e) => e.tagName === 'UL').children.map((li) => li.textContent);
  eq(tree.slice(0, 5), ['pipe2top', '└ ra : stage_reg', '└ rb : stage_reg', '└ u_alu : alu', '└ out_reg : stage_reg'], 'hierarchy tree under the top');
  ok(tree.some((t) => t.startsWith('spare_block') && t.endsWith('not used')), 'unused module tagged');
  find(b, (e) => e.tagName === 'UL').children[3].click();
  eq(fileSel.value, 'two_stage.v', 'clicking a tree row opens its file');

  // netlist panel
  const modSel = find(c, (e) => e.tagName === 'SELECT');
  eq(modSel.value, 'src|pipe2', 'netlist starts on the top');
  const view = find(c, (e) => e.className === 'chip-net-view');
  ok(view.innerHTML.startsWith('<svg') && view.innerHTML.includes('data-cell="C3"'), 'schematic drawn');
  ok(texts(c).some((t) => /4 cells, 28 nets, 6 ports/.test(t)), 'stats line');
  find(c, (e) => e.tagName === 'BUTTON' && e.textContent === 'Save picture (SVG)').click(); await tick();
  ok((store.get('pipe2.schematic.svg') || '').startsWith('<svg'), 'Save picture writes pipe2.schematic.svg');
  find(c, (e) => e.tagName === 'BUTTON' && e.textContent === 'Save netlist (JSON)').click(); await tick();
  eq(JSON.parse(store.get('pipe2.netlist.json')).format, 'cc-chip-netlist', 'Save netlist writes JSON');
  modSel.value = 'src|stage_reg'; modSel.dispatchEvent({ type: 'change' });
  ok(view.innerHTML.includes('always_ff'), 'another module drawn');
  ma.destroy(); mb.destroy(); mc.destroy();
  eq([a.childNodes.length, b.childNodes.length, c.childNodes.length], [0, 0, 0], 'destroy empties the panels');
}
{
  const doc = makeDocument();
  const { ctx } = makeCtx({ 'rtl.v': fixture('alu.v'), 'out/synth.v': fixture('yosys_netlist.v') }, { schematic: S });
  const el = doc.createElement('div');
  IDX.allPanels(ctx)[2].mount(el, ctx); await tick(); await tick();
  const sel = find(el, (e) => e.tagName === 'SELECT');
  eq(sel.children.map((o) => o.textContent), ['alu', 'cnt2 (out/synth.v)'], 'netlist list offers a synthesized netlist from out/');
  sel.value = 'out|out/synth.v|cnt2'; sel.dispatchEvent({ type: 'change' });
  ok(find(el, (e) => e.className === 'chip-net-view').innerHTML.includes('DFF_P'), 'and draws it');
}
{
  const doc = makeDocument();
  const { ctx } = makeCtx({});
  const el = doc.createElement('div');
  IDX.allPanels(ctx)[0].mount(el, ctx); await tick(); await tick();
  const ta = find(el, (e) => e.tagName === 'TEXTAREA');
  ok(ta.disabled && ta.placeholder.startsWith('No Verilog or VHDL files'), 'empty project says so');
  doc._promptAnswer = 'cpu.sv';
  find(el, (e) => e.tagName === 'BUTTON' && e.textContent === 'New file').click();
  eq(ta.value, 'module cpu ();\nendmodule\n', 'New file starts a module');
}
