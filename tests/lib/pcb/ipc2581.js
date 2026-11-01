/* SPDX-License-Identifier: Apache-2.0 */
/**
 * IPC-2581 (Rev C layout) writer (0.8 XE.11): one XML file with Content (layer list and the standard-shape / line dictionaries), LogisticHeader,
 * HistoryRecord, Bom, and Ecad (layers, stackup, Step with Profile, PadStacks, Packages, Components, LogicalNets, PhyNets and one LayerFeature
 * per copper layer: pads, tracks, vias, zone contours). Written from the structure of the published standard as understood here; it has NOT
 * been validated against the consortium's XSD or opened in a second tool (see the session log). The file is plain XML 1.0, UTF-8, metric.
 */
import { problem } from './board.js';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n6 = (v) => String(+(+v).toFixed(6));

/** Returns {xml, problems, stats}. opts: date (ISO), revision, company. */
export function writeIpc2581(board, opts = {}) {
  const problems = [], date = opts.date || '1970-01-01T00:00:00+00:00', rev = opts.revision || 'A', copper = board.layers, items = board.items();
  const dictC = new Map(), dictLine = new Map(), padStacks = new Map(), packages = new Map(), o = [];
  const circle = (d) => { const id = 'C_' + n6(d); dictC.set(id, '<Circle diameter="' + n6(d) + '"/>'); return id; };
  const rect = (w, h) => { const id = 'R_' + n6(w) + 'x' + n6(h); dictC.set(id, '<RectCenter width="' + n6(w) + '" height="' + n6(h) + '"/>'); return id; };
  const oval = (w, h) => { const id = 'O_' + n6(w) + 'x' + n6(h); dictC.set(id, '<Oval width="' + n6(w) + '" height="' + n6(h) + '"/>'); return id; };
  const line = (w) => { const id = 'L_' + n6(w); dictLine.set(id, '<LineDesc lineEnd="ROUND" lineWidth="' + n6(w) + '"/>'); return id; };
  const shapeId = (shape, w, h) => (shape === 'circle' ? circle(w) : shape === 'oval' ? oval(w, h) : rect(w, h));
  const stackFor = (pad, isVia, via) => {
    const key = isVia ? 'VIA_' + n6(via.dia) + '_' + n6(via.drill) : 'PS_' + pad.shape + '_' + n6(pad.w) + 'x' + n6(pad.h) + '_' + n6(pad.drill || 0) + (pad.drill ? '' : pad.layers[0] === copper[0] ? '_T' : '_B');
    if (padStacks.has(key)) return key;
    const layers = isVia || pad.drill > 0 ? copper : pad.layers, hole = isVia ? via.drill : pad.drill;
    const prim = isVia ? circle(via.dia) : shapeId(pad.shape, pad.w, pad.h);
    padStacks.set(key, '  <PadStack name="' + esc(key) + '">\n' + (hole > 0 ? '   <PadstackHoleDef name="H_' + esc(key) + '" diameter="' + n6(hole) + '" platingStatus="' + (isVia || pad.plated !== false ? 'PLATED' : 'NONPLATED') + '" plusTol="0" minusTol="0" x="0" y="0"/>\n' : '') + layers.map((l) => '   <PadstackPadDef layerRef="' + esc(l) + '" padUse="REGULAR" xOffset="0" yOffset="0"><StandardPrimitiveRef id="' + prim + '"/></PadstackPadDef>').join('\n') + '\n  </PadStack>');
    return key;
  };
  // packages
  for (const p of board.parts) if (!packages.has(p.footprint)) {
    const cy = p.courtyard; const pinsXml = p.pads.map((q) => '    <Pin number="' + esc(q.num) + '"' + ' electricalType="ELECTRICAL"><Location x="' + n6(q.x) + '" y="' + n6(q.y) + '"/><StandardPrimitiveRef id="' + shapeId(q.shape, q.w, q.h) + '"/></Pin>').join('\n');
    packages.set(p.footprint, '  <Package name="' + esc(p.footprint) + '" type="OTHER" pinOne="' + esc(p.pads[0]?.num ?? '1') + '">\n   <Outline><Polygon><PolyBegin x="' + n6(cy[0]) + '" y="' + n6(cy[1]) + '"/><PolyStepSegment x="' + n6(cy[2]) + '" y="' + n6(cy[1]) + '"/><PolyStepSegment x="' + n6(cy[2]) + '" y="' + n6(cy[3]) + '"/><PolyStepSegment x="' + n6(cy[0]) + '" y="' + n6(cy[3]) + '"/><PolyStepSegment x="' + n6(cy[0]) + '" y="' + n6(cy[1]) + '"/></Polygon><LineDescRef id="' + line(0.1) + '"/></Outline>\n' + pinsXml + '\n  </Package>');
  }
  // layer features (build first so dictionaries are complete)
  const feat = copper.map((layer) => {
    const here = items.filter((i) => i.layers.includes(layer)), nets = new Map();
    for (const it of here) { const k = it.net || ''; if (!nets.has(k)) nets.set(k, []); nets.get(k).push(it); }
    const sets = [...nets.entries()].map(([net, list]) => '   <Set' + (net ? ' net="' + esc(net) + '"' : '') + '>\n' + list.map((it) => {
      if (it.kind === 'pad') return '    <Pad padstackDefRef="' + esc(stackFor(it.pad)) + '"><Xform rotation="' + n6(((it.pad.rot % 360) + 360) % 360) + '" mirror="false"/><Location x="' + n6(it.pad.x) + '" y="' + n6(it.pad.y) + '"/><PinRef componentRef="' + esc(it.ref) + '" pin="' + esc(it.num) + '"/></Pad>';
      if (it.kind === 'via') return '    <Pad padstackDefRef="' + esc(stackFor(null, true, board.vias[it.via])) + '"><Location x="' + n6(it.prim.a[0]) + '" y="' + n6(it.prim.a[1]) + '"/></Pad>';
      if (it.kind === 'track') return '    <Features><Polyline><PolyBegin x="' + n6(it.prim.a[0]) + '" y="' + n6(it.prim.a[1]) + '"/><PolyStepSegment x="' + n6(it.prim.b[0]) + '" y="' + n6(it.prim.b[1]) + '"/><LineDescRef id="' + line(it.width) + '"/></Polyline></Features>';
      const z = it.prim.pts; return '    <Features><Contour><Polygon><PolyBegin x="' + n6(z[0][0]) + '" y="' + n6(z[0][1]) + '"/>' + z.slice(1).map((q) => '<PolyStepSegment x="' + n6(q[0]) + '" y="' + n6(q[1]) + '"/>').join('') + '<PolyStepSegment x="' + n6(z[0][0]) + '" y="' + n6(z[0][1]) + '"/></Polygon></Contour></Features>';
    }).join('\n') + '\n   </Set>');
    return '  <LayerFeature layerRef="' + esc(layer) + '">\n' + sets.join('\n') + '\n  </LayerFeature>';
  });
  // logical nets
  const logical = new Map(); for (const p of board.parts) for (const q of p.pads) { const n = p.padNets[q.num]; if (!n) continue; if (!logical.has(n)) logical.set(n, []); logical.get(n).push(p.ref + '|' + q.num); }
  for (const n of board.nets) if (!logical.has(n)) logical.set(n, []);
  const phy = [...logical.keys()].map((n) => { const pts = []; for (const it of items) if (it.net === n && it.kind === 'pad') pts.push('<PhyNetPoint x="' + n6(it.pad.x) + '" y="' + n6(it.pad.y) + '" layerRef="' + esc(it.layers[0]) + '" netNode="END" exposure="CONDUCTOR_EXPOSED"/>'); return '   <PhyNet name="' + esc(n) + '">' + pts.join('') + '</PhyNet>'; });

  o.push('<?xml version="1.0" encoding="UTF-8"?>');
  o.push('<IPC-2581 revision="C" xmlns="http://webstds.ipc.org/2581" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://webstds.ipc.org/2581 http://webstds.ipc.org/2581/IPC-2581C.xsd">');
  o.push(' <Content roleRef="Owner">\n  <FunctionMode mode="FULL"/>\n  <StepRef name="' + esc(board.name) + '"/>\n' + [...copper, 'F.Mask', 'B.Mask', 'F.Paste', 'B.Paste', 'F.Silkscreen', 'B.Silkscreen', 'Board.Outline'].map((l) => '  <LayerRef name="' + l + '"/>').join('\n') + '\n  <BomRef name="bom"/>');
  o.push('  <DictionaryStandard units="MILLIMETER">\n' + [...dictC.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([id, x]) => '   <EntryStandard id="' + esc(id) + '">' + x + '</EntryStandard>').join('\n') + '\n  </DictionaryStandard>');
  o.push('  <DictionaryLineDesc units="MILLIMETER">\n' + [...dictLine.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([id, x]) => '   <EntryLineDesc id="' + esc(id) + '">' + x + '</EntryLineDesc>').join('\n') + '\n  </DictionaryLineDesc>\n </Content>');
  o.push(' <LogisticHeader>\n  <Role id="Owner" roleFunction="SENDER"/>\n  <Enterprise id="' + esc(opts.company || 'CadCraft') + '" code="NONE"/>\n  <Person name="CadCraft" enterpriseRef="' + esc(opts.company || 'CadCraft') + '" roleRef="Owner"/>\n </LogisticHeader>');
  o.push(' <HistoryRecord number="1" origination="' + esc(date) + '" software="CadCraft lib-pcb" lastChange="' + esc(date) + '">\n  <FileRevision fileRevisionId="1" comment="" label="' + esc(rev) + '">\n   <SoftwarePackage name="CadCraft lib-pcb" revision="1.0" vendor="CadCraft"/>\n  </FileRevision>\n </HistoryRecord>');
  const byPart = new Map(); for (const p of board.parts) { const k = p.footprint + '|' + p.value + '|' + p.part; if (!byPart.has(k)) byPart.set(k, []); byPart.get(k).push(p); }
  o.push(' <Bom name="bom">\n  <BomHeader assembly="' + esc(board.name) + '" revision="' + esc(rev) + '"><StepRef name="' + esc(board.name) + '"/></BomHeader>\n' + [...byPart.values()].map((list) => '  <BomItem OEMDesignNumberRef="' + esc(list[0].part || list[0].footprint + (list[0].value ? '_' + list[0].value : '')) + '" quantity="' + list.length + '" pinCount="' + list[0].pads.length + '" category="ELECTRICAL">\n' + list.map((p) => '   <RefDes name="' + esc(p.ref) + '" packageRef="' + esc(p.footprint) + '" populate="true" layerRef="' + esc(p.side === 'bottom' ? copper[copper.length - 1] : copper[0]) + '"/>').join('\n') + '\n   <Characteristics category="ELECTRICAL"/>\n  </BomItem>').join('\n') + '\n </Bom>');
  o.push(' <Ecad name="' + esc(board.name) + '">\n  <CadHeader units="MILLIMETER"/>\n  <CadData>');
  copper.forEach((l, i) => o.push('   <Layer name="' + esc(l) + '" layerFunction="' + (i > 0 && i < copper.length - 1 ? 'PLANE' : 'CONDUCTOR') + '" side="' + (i === 0 ? 'TOP' : i === copper.length - 1 ? 'BOTTOM' : 'INTERNAL') + '" polarity="POSITIVE"/>'));
  for (const [n, fn, side] of [['F.Mask', 'SOLDERMASK', 'TOP'], ['B.Mask', 'SOLDERMASK', 'BOTTOM'], ['F.Paste', 'SOLDERPASTE', 'TOP'], ['B.Paste', 'SOLDERPASTE', 'BOTTOM'], ['F.Silkscreen', 'SILKSCREEN', 'TOP'], ['B.Silkscreen', 'SILKSCREEN', 'BOTTOM'], ['Board.Outline', 'BOARD_OUTLINE', 'ALL']]) o.push('   <Layer name="' + n + '" layerFunction="' + fn + '" side="' + side + '" polarity="POSITIVE"/>');
  const cuT = 0.035, dielectric = (board.thickness - copper.length * cuT) / Math.max(1, copper.length - 1);
  o.push('   <Stackup name="stackup" overallThickness="' + n6(board.thickness) + '" tolPlus="0" tolMinus="0" whereMeasured="MASK">\n    <StackupGroup name="stackup_group" thickness="' + n6(board.thickness) + '" tolPlus="0" tolMinus="0">\n' + copper.map((l, i) => '     <StackupLayer layerOrGroupRef="' + esc(l) + '" thickness="' + cuT + '" tolPlus="0" tolMinus="0" sequence="' + (2 * i + 1) + '"/>' + (i < copper.length - 1 ? '\n     <StackupLayer layerOrGroupRef="DIEL_' + (i + 1) + '" thickness="' + n6(dielectric) + '" tolPlus="0" tolMinus="0" sequence="' + (2 * i + 2) + '"/>' : '')).join('\n') + '\n    </StackupGroup>\n   </Stackup>');
  o.push('   <Step name="' + esc(board.name) + '">\n    <Datum x="0" y="0"/>\n    <Profile><Polygon><PolyBegin x="' + n6(board.outline[0][0]) + '" y="' + n6(board.outline[0][1]) + '"/>' + board.outline.slice(1).map((q) => '<PolyStepSegment x="' + n6(q[0]) + '" y="' + n6(q[1]) + '"/>').join('') + '<PolyStepSegment x="' + n6(board.outline[0][0]) + '" y="' + n6(board.outline[0][1]) + '"/></Polygon></Profile>');
  for (const v of padStacks.values()) o.push(v); for (const v of packages.values()) o.push(v);
  for (const p of board.parts) o.push('    <Component refDes="' + esc(p.ref) + '" packageRef="' + esc(p.footprint) + '" layerRef="' + esc(p.side === 'bottom' ? copper[copper.length - 1] : copper[0]) + '" part="' + esc(p.part || p.footprint) + '" mountType="' + (p.pads.some((q) => q.drill > 0) ? 'THMT' : 'SMT') + '"><Xform rotation="' + n6(((p.rot % 360) + 360) % 360) + '" mirror="' + (p.side === 'bottom' ? 'true' : 'false') + '"/><Location x="' + n6(p.x) + '" y="' + n6(p.y) + '"/></Component>');
  for (const [n, pins] of logical) o.push('    <LogicalNet name="' + esc(n) + '">' + pins.map((q) => { const [r, pn] = q.split('|'); return '<PinRef componentRef="' + esc(r) + '" pin="' + esc(pn) + '"/>'; }).join('') + '</LogicalNet>');
  o.push('    <PhyNetGroup name="phy">\n' + phy.join('\n') + '\n    </PhyNetGroup>');
  for (const f of feat) o.push(f);
  o.push('   </Step>\n  </CadData>\n </Ecad>\n</IPC-2581>', '');
  if (!board.parts.length) problems.push(problem('ipc2581.empty', 'The board has no parts; the BOM and component list are empty.', { severity: 'warning' }));
  return { xml: o.join('\n'), problems, stats: { padStacks: padStacks.size, packages: packages.size, nets: logical.size, components: board.parts.length } };
}
