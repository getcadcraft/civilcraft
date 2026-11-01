/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dexpi.js — DEXPI P&ID exchange files (ProteusXML, the DEXPI profile of ISO 15926-based Proteus 4.x). DOM-free; uses ./xml.js only.
 * Written from the DEXPI public test cases' structure (DEXPI/TestCases: C03, C04, C05, E01, E02, C02 read as DATA) and the
 * element names in them — no DEXPI/Proteus tool's source was read. The XSD is not published in that repo, so the writer follows
 * the child order seen in the samples; the reader accepts any order.
 *
 * ONE NEUTRAL MODEL, a tree of plant items (everything that has an ID in a plant model), kept so a file reads → writes → reads
 * to the same model:
 *   model = { format: 'cadcraft-dexpi', info: { schema, origin, date, time, units, discipline, is3d }, extent: { w, h } | null,
 *             drawing: { name, type, title } | null, items: [item], problems: [problem] }
 *   item  = { kind (element: Equipment | Nozzle | PipingNetworkSystem | PipingNetworkSegment | PipingComponent | PipeConnectorSymbol |
 *             ProcessInstrumentationFunction | InstrumentationLoopFunction | InformationFlow | …), id, cls (ComponentClass), name
 *             (ComponentName), tag (TagName), status, uri (ComponentClassURI), pid (PersistentID), x, y, z, rot (radians) | null,
 *             ga: [{ set, name, value, format, uri }], nodes: [{ id, name }], conns: [{ fromId, fromNode, toId, toNode }],
 *             center: [[x, y]], assoc: [{ type, itemId }], items: [item] }
 * Graphics (lines, circles, text, presentation) are NOT carried: a P&ID's symbols are drawn by the receiving tool.
 *
 *   readDexpi(text) → model              (throws XmlError; a file that is not a PlantModel → code 'not_dexpi')
 *   writeDexpi(model, {date}) → text
 *   attrOf(item, name…) → first GenericAttribute value that matches (case-insensitive)  ·  flatItems(model) → every item, depth first
 *   byKind(model, kind) · classMap: SYMBOL_OF_CLASS(cls) → pid symbol id | null  ·  CLASS_OF_SYMBOL[sym]
 *   summary(model) → counts per kind and class
 */
import { parseXml, XmlWriter, find, all, attr, XmlError } from './xml.js';

export { XmlError };
export const FORMAT = 'cadcraft-dexpi';
const SCHEMA = '4.0.1';

/** Elements that are plant items when they sit in a plant model (and their children). Anything else with an ID is kept too. */
const GRAPHICS = new Set(['Presentation', 'Extent', 'Position', 'Line', 'Circle', 'Text', 'TrimmedCurve', 'Scale', 'Shape', 'PolyLine', 'Polyline', 'Label', 'DrawingBorder', 'ShapeCatalogue', 'CenterLine', 'Coordinate', 'GenericAttributes', 'PersistentID', 'Association', 'ConnectionPoints', 'Connection', 'Description', 'UnitsOfMeasure', 'PlantInformation', 'Drawing']);

const num = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : null; };

function readItem(el) {
  const it = {
    kind: el.tag, id: attr(el, 'ID'), cls: attr(el, 'ComponentClass'), name: attr(el, 'ComponentName'), tag: attr(el, 'TagName'), status: attr(el, 'Status'),
    uri: attr(el, 'ComponentClassURI'), pid: '', x: null, y: null, z: null, rot: null, ga: [], nodes: [], conns: [], assoc: [], center: [], items: [],
  };
  if (attr(el, 'Type')) it.type = attr(el, 'Type');
  for (const c of el.children) {
    if (c.tag === 'GenericAttributes') {
      const set = attr(c, 'Set');
      for (const g of all(c, 'GenericAttribute')) it.ga.push({ set, name: attr(g, 'Name'), value: attr(g, 'Value'), format: attr(g, 'Format'), uri: attr(g, 'AttributeURI') });
    } else if (c.tag === 'PersistentID') it.pid = attr(c, 'Identifier') + (attr(c, 'Context') ? '|' + attr(c, 'Context') : '');
    else if (c.tag === 'Position') {
      const loc = find(c, 'Location'), ref = find(c, 'Reference');
      if (loc) { it.x = num(attr(loc, 'X')); it.y = num(attr(loc, 'Y')); it.z = num(attr(loc, 'Z')); }
      if (ref) { const rx = num(attr(ref, 'X')), ry = num(attr(ref, 'Y')); if (rx !== null && ry !== null) it.rot = Math.atan2(ry, rx); }
    } else if (c.tag === 'ConnectionPoints') {
      for (const n of all(c, 'Node')) it.nodes.push({ id: attr(n, 'ID'), name: attr(n, 'Name') });
    } else if (c.tag === 'Connection') {
      it.conns.push({ fromId: attr(c, 'FromID'), fromNode: attr(c, 'FromNode'), toId: attr(c, 'ToID'), toNode: attr(c, 'ToNode') });
    } else if (c.tag === 'CenterLine') {
      for (const p of all(c, 'Coordinate')) { const x = num(attr(p, 'X')), y = num(attr(p, 'Y')); if (x !== null && y !== null) it.center.push([x, y]); }
    } else if (c.tag === 'Association') it.assoc.push({ type: attr(c, 'Type'), itemId: attr(c, 'ItemID') });
    else if (!GRAPHICS.has(c.tag) && (attr(c, 'ID') || attr(c, 'ComponentClass'))) it.items.push(readItem(c));
  }
  return it;
}

export function readDexpi(text) {
  const root = parseXml(text);
  if (root.tag !== 'PlantModel') throw new XmlError('not_dexpi', 'The file is not a DEXPI plant model (the root element is <' + root.tag + '>)');
  const pi = find(root, 'PlantInformation'), dr = find(root, 'Drawing'), ex = find(root, 'Extent'), mx = find(ex, 'Max');
  const model = {
    format: FORMAT,
    info: { schema: attr(pi, 'SchemaVersion'), origin: attr(pi, 'OriginatingSystem'), date: attr(pi, 'Date'), time: attr(pi, 'Time'), units: attr(pi, 'Units') || attr(find(pi, 'UnitsOfMeasure'), 'Distance', 'mm'), discipline: attr(pi, 'Discipline'), is3d: attr(pi, 'Is3D') },
    extent: mx ? { w: num(attr(mx, 'X')), h: num(attr(mx, 'Y')) } : null,
    drawing: dr ? { name: attr(dr, 'Name'), type: attr(dr, 'Type'), title: attr(dr, 'Title') } : null,
    items: [], problems: [],
  };
  for (const c of root.children) if (!GRAPHICS.has(c.tag)) model.items.push(readItem(c));
  // a model whose ids repeat, or whose connections point nowhere, still opens: say so (rule 29: one problem per kind)
  const ids = new Map();
  let dup = 0, dangling = 0, noId = 0;
  const flat = flatItems(model);
  for (const it of flat) { if (!it.id) noId++; else if (ids.has(it.id)) dup++; else ids.set(it.id, it); }
  for (const it of flat) for (const cn of it.conns) for (const k of [cn.fromId, cn.toId]) if (k && !ids.has(k)) dangling++;
  if (dup) model.problems.push({ code: 'dexpi.id.dup', severity: 'warning', vars: { n: dup }, text: dup + ' plant item(s) share an ID with another; the later ones were kept apart by position only.' });
  if (noId) model.problems.push({ code: 'dexpi.id.missing', severity: 'note', vars: { n: noId }, text: noId + ' plant item(s) have no ID.' });
  if (dangling) model.problems.push({ code: 'dexpi.conn.dangling', severity: 'warning', vars: { n: dangling }, text: dangling + ' connection end(s) name an item that is not in the file.' });
  return model;
}

export function flatItems(model) {
  const out = [];
  const go = (list) => { for (const it of list) { out.push(it); go(it.items); } };
  go(model.items);
  return out;
}
export const byKind = (model, kind) => flatItems(model).filter((it) => it.kind === kind);
export function attrOf(item, ...names) {
  const want = names.map((n) => n.toLowerCase());
  for (const g of item.ga) if (want.includes(String(g.name).toLowerCase()) && g.value !== '') return g.value;
  return '';
}
export function summary(model) {
  const kinds = {}, classes = {};
  for (const it of flatItems(model)) { kinds[it.kind] = (kinds[it.kind] || 0) + 1; classes[it.cls || it.kind] = (classes[it.cls || it.kind] || 0) + 1; }
  return { kinds, classes, items: flatItems(model).length };
}

// ---------------------------------------------------------------------------------------------------- writing
const drop = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v !== undefined && v !== null));

function writeItem(w, it) {
  const a = drop({ ID: it.id, TagName: it.tag, ComponentClass: it.cls, ComponentClassURI: it.uri, ComponentName: it.name, Status: it.status, Type: it.type });
  w.open(it.kind, a);
  const sets = [];
  for (const g of it.ga) { let s = sets.find((x) => x.set === g.set); if (!s) sets.push(s = { set: g.set, list: [] }); s.list.push(g); }
  for (const s of sets) {
    w.open('GenericAttributes', { ...drop({ Set: s.set }), Number: s.list.length });
    for (const g of s.list) w.leaf('GenericAttribute', { Name: g.name, Value: g.value, Format: g.format || 'string', ...drop({ AttributeURI: g.uri }) });
    w.close();
  }
  if (it.pid) { const [id, ctx] = it.pid.split('|'); w.leaf('PersistentID', drop({ Identifier: id, Context: ctx })); }
  if (it.x !== null && it.y !== null) {
    w.open('Position');
    w.leaf('Location', { X: it.x, Y: it.y, Z: it.z ?? 0 }); w.leaf('Axis', { X: 0, Y: 0, Z: 1 });
    const r = it.rot || 0; w.leaf('Reference', { X: +Math.cos(r).toFixed(9), Y: +Math.sin(r).toFixed(9), Z: 0 });
    w.close();
  }
  for (const c of it.items) writeItem(w, c);
  if (it.nodes.length) { w.open('ConnectionPoints', { NumPoints: it.nodes.length }); for (const n of it.nodes) w.leaf('Node', drop({ ID: n.id, Name: n.name })); w.close(); }
  if (it.center.length) { w.open('CenterLine'); for (const p of it.center) w.leaf('Coordinate', { X: p[0], Y: p[1], Z: 0 }); w.close(); }
  for (const c of it.conns) w.leaf('Connection', drop({ FromID: c.fromId, FromNode: c.fromNode, ToID: c.toId, ToNode: c.toNode }));
  for (const s of it.assoc) w.leaf('Association', drop({ Type: s.type, ItemID: s.itemId }));
  w.close();
}

export function writeDexpi(model, { date = new Date() } = {}) {
  const w = new XmlWriter();
  const iso = date.toISOString();
  w.open('PlantModel', { 'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance', 'xsi:noNamespaceSchemaLocation': 'ProteusPIDSchema_' + SCHEMA + '.xsd' });
  const i = model.info || {};
  w.open('PlantInformation', { SchemaVersion: i.schema || SCHEMA, OriginatingSystem: i.origin || 'CadCraft', Date: iso.slice(0, 10), Time: iso.slice(11, 19), Is3D: i.is3d || 'no', Units: i.units || 'mm', Discipline: i.discipline || 'PID' });
  w.leaf('UnitsOfMeasure', { Distance: i.units || 'mm' });
  w.close();
  if (model.extent) { w.open('Extent'); w.leaf('Min', { X: 0, Y: 0, Z: 0 }); w.leaf('Max', { X: model.extent.w, Y: model.extent.h, Z: 0 }); w.close(); }
  if (model.drawing) w.leaf('Drawing', { Name: model.drawing.name, Type: model.drawing.type || 'PID', Title: model.drawing.title });
  for (const it of model.items) writeItem(w, it);
  return w.toString();
}

// ---------------------------------------------------------------------------------------------------- class names ↔ symbols
/** pid symbol → the DEXPI ComponentClass written. Names seen in the DEXPI test cases are marked (s). */
export const CLASS_OF_SYMBOL = {
  gate: 'GateValve', globe: 'GlobeValve' /* s */, ball: 'BallValve' /* s */, check: 'CheckValve' /* s */, butterfly: 'ButterflyValve' /* s */, plug: 'PlugValve', needle: 'NeedleValve',
  diaphragm: 'DiaphragmValve', angle: 'AngleValve', threeway: 'ThreeWayValve', relief: 'SpringLoadedGlobeSafetyValve', rupture: 'RuptureDisc',
  'vessel-v': 'Vessel', 'vessel-h': 'Vessel', tank: 'Tank' /* s */, sphere: 'Sphere', column: 'Column', reactor: 'Reactor', 'exch-shell': 'ShellAndTubeHeatExchanger',
  'exch-plate': 'PlateHeatExchanger', aircooler: 'AirCoolingSystem', heater: 'Heater', 'pump-cf': 'CentrifugalPump', 'pump-pd': 'DisplacementPump' /* s */,
  compressor: 'Compressor', fan: 'Fan', filter: 'Filter', agitator: 'Agitator',
  'inst-field': 'ProcessInstrumentationFunction' /* s */, 'inst-panel': 'ProcessInstrumentationFunction', 'inst-local': 'ProcessInstrumentationFunction', 'inst-shared': 'ProcessInstrumentationFunction',
  'inst-computer': 'ProcessInstrumentationFunction', 'inst-plc': 'ProcessInstrumentationFunction',
  reducer: 'PipeReducer' /* s */, cap: 'PipeCap', flange: 'PipeFlange', 'blind-flange': 'BlindFlange', spectacle: 'SpectacleBlind', union: 'PipeUnion', orifice: 'OrificePlate', strainer: 'Strainer',
  'sight-glass': 'SightGlass', 'expansion-joint': 'ExpansionJoint', 'flame-arrestor': 'FlameArrestor', 'spec-break': 'PropertyBreak' /* s */,
  'offpage-out': 'FlowOutPipeConnectorSymbol' /* s */, 'offpage-in': 'FlowInPipeConnectorSymbol', tiein: 'TieIn', vent: 'Vent', drain: 'Drain',
};
const INV = {};
for (const [s, c] of Object.entries(CLASS_OF_SYMBOL)) if (!(c in INV)) INV[c] = s;
/** The pid symbol for a DEXPI class: the exact class first, then the family by name (a "SpringLoadedAngleGlobeSafetyValve" is a relief valve). */
export function SYMBOL_OF_CLASS(cls) {
  const c = String(cls || '');
  if (INV[c]) return INV[c];
  const rules = [
    [/Safety|Relief/i, 'relief'], [/Rupture|Bursting/i, 'rupture'], [/ThreeWay|3Way/i, 'threeway'], [/Gate/i, 'gate'], [/Angle/i, 'angle'], [/Globe/i, 'globe'], [/Ball/i, 'ball'],
    [/Check|NonReturn/i, 'check'], [/Butterfly/i, 'butterfly'], [/Plug/i, 'plug'], [/Needle/i, 'needle'], [/Diaphragm.*Valve|Valve.*Diaphragm/i, 'diaphragm'],
    [/PlateHeatExchanger/i, 'exch-plate'], [/HeatExchanger|Exchanger/i, 'exch-shell'], [/AirCool/i, 'aircooler'], [/Heater|Furnace|Boiler/i, 'heater'],
    [/Displacement|Piston|Gear|Screw|Diaphragm.*Pump/i, 'pump-pd'], [/Pump/i, 'pump-cf'], [/Compressor|Blower/i, 'compressor'], [/\bFan\b|Fan$/i, 'fan'], [/Filter/i, 'filter'],
    [/Sphere|Spherical/i, 'sphere'], [/Tank|Vessel|Drum|Receiver|Separator|Chamber/i, 'vessel-v'], [/Agitator|Mixer|Stirrer/i, 'agitator'], [/Column|Tower/i, 'column'], [/Reactor/i, 'reactor'],
    [/Reducer/i, 'reducer'], [/Spectacle/i, 'spectacle'], [/BlindFlange/i, 'blind-flange'], [/Flange/i, 'flange'], [/Orifice/i, 'orifice'], [/Strainer|Sieve/i, 'strainer'],
    [/PropertyBreak/i, 'spec-break'], [/FlowIn/i, 'offpage-in'], [/FlowOut|OffPage/i, 'offpage-out'], [/ProcessInstrumentationFunction|Instrument/i, 'inst-field'],
  ];
  for (const [re, sym] of rules) if (re.test(c)) return sym;
  return null;
}

/** A piece of equipment inside a valve is its actuator: DEXPI class → the P&ID's actuator, or null. */
export function ACTUATOR_OF_CLASS(cls) {
  const c = String(cls || '');
  if (/Diaphragm/i.test(c)) return 'diaphragm';
  if (/Motor|Electric/i.test(c)) return 'motor';
  if (/Solenoid/i.test(c)) return 'solenoid';
  if (/Piston|Pneumatic|Cylinder/i.test(c)) return 'piston';
  if (/Hand|Manual/i.test(c)) return 'manual';
  return null;
}
/** Classes that are a join in the piping, not a symbol: the connection already says it (a tee is three lines meeting). */
export const isJunction = (cls) => /^Pipe(Tee|Cross|Bend|Elbow|Branch|Coupling|Olet)/i.test(String(cls || '')) || /^(Tee|Cross)$/i.test(String(cls || ''));
