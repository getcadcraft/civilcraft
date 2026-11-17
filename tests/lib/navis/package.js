// SPDX-License-Identifier: Apache-2.0
/**
 * package.js — the Navisworks exchange package (.ccnav.zip): what SuperCad reads from a Navisworks model. DOM-free.
 *   manifest.json  { format: 'cadcraft-navisworks-exchange', version, created, units: 'metre', counts, notes[] }
 *   model.json     { items[{id,parent,guid,name,cls,geometry,hidden,source,props[{c,n,v,t}]}], sets[{name,folder,search,guids[]}],
 *                    viewpoints[{guid,name,folder,position,direction,up,rotation_quaternion,fov_degrees,perspective,comments[{author,text,status,date}]}],
 *                    clashes[{guid,test,group,name,status,description,assigned_to,created,item1,item2,center,distance}] }
 *   model.obj      geometry in metres, Z up, one `o <ifc-guid>` group per item          issues.bcfzip  BCF 2.1 of commented viewpoints and clashes
 * Whatever writes it (the Windows companion exporter, or another tool) is untrusted: every field is checked and clipped here.
 *   const pkg = await readPackage(bytes) → { manifest, model, obj, bcf, notes[] }
 */
import { unzip } from './zip.js';

export const FORMAT = 'cadcraft-navisworks-exchange';
export const PKG_LIMITS = { items: 200000, props: 400, sets: 5000, setGuids: 100000, views: 5000, clashes: 100000, comments: 200, str: 500, long: 5000, json: 400 * 1024 * 1024, obj: 1024 * 1024 * 1024, bcf: 100 * 1024 * 1024 };
const s = (v, n = PKG_LIMITS.str) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, n);
const f = v => (Number.isFinite(Number(v)) && Math.abs(Number(v)) < 1e9 ? Number(v) : null);
const vec = (v, n = 3) => (Array.isArray(v) && v.length >= n && v.slice(0, n).every(x => f(x) !== null) ? v.slice(0, n).map(Number) : null);
const arr = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);
const GUID22 = /^[0-9A-Za-z_$]{22}$/;
export const isIfcGuid = x => GUID22.test(String(x));

export function shapeModel(m) {
  const notes = []; if (!m || typeof m !== 'object') throw Object.assign(new Error('navis.pkg.model'), { code: 'model' });
  const items = arr(m.items, PKG_LIMITS.items).map((i, k) => ({
    id: Number.isInteger(i.id) ? i.id : k, parent: Number.isInteger(i.parent) ? i.parent : -1, guid: s(i.guid, 64), name: s(i.name), cls: s(i.cls), geometry: !!i.geometry, hidden: !!i.hidden, source: s(i.source),
    props: arr(i.props, PKG_LIMITS.props).map(p => ({ c: s(p.c, 120), n: s(p.n, 120), v: s(p.v, 1000), t: s(p.t, 40) })) })).filter(i => i.guid);
  const known = new Set(items.map(i => i.guid));
  const sets = arr(m.sets, PKG_LIMITS.sets).map(x => ({ name: s(x.name), folder: s(x.folder), search: !!x.search, guids: arr(x.guids, PKG_LIMITS.setGuids).map(g => s(g, 64)).filter(g => known.has(g)) })).filter(x => x.name);
  const viewpoints = arr(m.viewpoints, PKG_LIMITS.views).map(v => ({ guid: s(v.guid, 64), name: s(v.name), folder: s(v.folder), position: vec(v.position), direction: vec(v.direction), up: vec(v.up) || [0, 0, 1],
    rotation: vec(v.rotation_quaternion, 4), fov: f(v.fov_degrees) ?? 60, perspective: v.perspective !== false,
    comments: arr(v.comments, PKG_LIMITS.comments).map(c => ({ author: s(c.author, 120), text: s(c.text, PKG_LIMITS.long), status: s(c.status, 40), date: s(c.date, 40) })).filter(c => c.text) })).filter(v => v.guid);
  const clashes = arr(m.clashes, PKG_LIMITS.clashes).map(c => ({ guid: s(c.guid, 64), test: s(c.test), group: s(c.group), name: s(c.name), status: s(c.status, 40), description: s(c.description, PKG_LIMITS.long), assignedTo: s(c.assigned_to, 120),
    created: s(c.created, 40), item1: known.has(s(c.item1, 64)) ? s(c.item1, 64) : '', item2: known.has(s(c.item2, 64)) ? s(c.item2, 64) : '', center: vec(c.center), distance: f(c.distance) })).filter(c => c.guid);
  if (items.length >= PKG_LIMITS.items) notes.push('items-capped');
  return { items, sets, viewpoints, clashes, notes };
}

export async function readPackage(bytes) {
  const z = await unzip(bytes, { maxEntry: PKG_LIMITS.obj, maxTotal: 2 * PKG_LIMITS.obj, maxEntries: 20 });
  const notes = [];
  if (!z.has('manifest.json') || !z.has('model.json')) throw Object.assign(new Error('navis.pkg.notpackage'), { code: 'notpackage' });
  let manifest;
  try { manifest = JSON.parse(await z.text('manifest.json')); } catch { throw Object.assign(new Error('navis.pkg.manifest'), { code: 'manifest' }); }
  if (!manifest || manifest.format !== FORMAT) throw Object.assign(new Error('navis.pkg.notpackage'), { code: 'notpackage' });
  if (!Number.isInteger(manifest.version) || manifest.version > 1) throw Object.assign(new Error('navis.pkg.newer'), { code: 'newer' });
  if (manifest.units !== 'metre') throw Object.assign(new Error('navis.pkg.units'), { code: 'units' });
  if (z.size('model.json') > PKG_LIMITS.json) throw Object.assign(new Error('navis.pkg.toolarge'), { code: 'toolarge' });
  let raw; try { raw = JSON.parse(await z.text('model.json')); } catch { throw Object.assign(new Error('navis.pkg.model'), { code: 'model' }); }
  const model = shapeModel(raw); notes.push(...model.notes);
  const obj = z.has('model.obj') ? await z.read('model.obj') : null;
  const bcf = z.has('issues.bcfzip') && z.size('issues.bcfzip') <= PKG_LIMITS.bcf ? await z.read('issues.bcfzip') : null;
  return { manifest: { created: s(manifest.created, 40), counts: manifest.counts && typeof manifest.counts === 'object' ? manifest.counts : {}, notes: arr(manifest.notes, 50).map(x => s(x, 300)) }, model, obj, bcf, notes };
}
