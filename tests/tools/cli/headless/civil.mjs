/* SPDX-License-Identifier: Apache-2.0 */
/**
 * civil.mjs — CivilCraft without a screen (0.7 AS.3; docs/AGENTS-SPEC.md §2): the app's own Project (project.js) and its
 * assistant tools (civil-agent.js), loaded from the build. Its libraries (delaunator, robust-predicates, proj4) resolve to
 * the vendor folders through apps.mjs, as the page's import map does.
 *
 *   const s = await CivilSession.open(bytes, 'Site.civilcraft.json');   // or a points file (.csv .txt .pnezd), or blank()
 *   s.project · s.notes · s.save() → bytes (.civilcraft.json)
 *
 * LandXML is not opened here: turning a LandXML file into a project is the CivilCraft window's (civilcraft.js
 * openLandXml), as is its DWG export (the drawing comes from its panels). Both are said in `cadcraft tools`.
 */
import { load } from './apps.mjs';

const APP = 'civilcraft';
export const extOf = (name) => (String(name).match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
export const POINT_EXTS = ['csv', 'txt', 'pnezd', 'penzd', 'xyz', 'pts'];

let M = null;
export async function civilModules() {
  if (M) return M;
  const [PJ, PTS, AG] = await Promise.all([load(APP, 'project.js'), load(APP, 'points.js'), load(APP, 'civil-agent.js')]);
  M = { Project: PJ.Project, parsePoints: PTS.parsePoints, civilTools: AG.civilTools, landXmlOf: AG.landXmlOf };
  return M;
}

export class CivilSession {
  constructor(project, notes = []) { this.project = project; this.notes = notes; }

  static async blank({ name = 'Site', units = 'ft' } = {}) {
    const m = await civilModules();
    const p = new m.Project();
    p.state.name = String(name).slice(0, 120);
    p.state.units = units === 'm' ? 'm' : 'ft';
    return new CivilSession(p);
  }

  static async open(bytes, name) {
    const m = await civilModules();
    const text = new TextDecoder('utf-8').decode(bytes).replace(/^﻿/, '');
    const base = String(name).replace(/^.*[\\/]/, '');
    if (/\.civilcraft\.json$/i.test(base) || (extOf(base) === 'json' && text.includes('"civilcraft-project"'))) {
      let obj;
      try { obj = JSON.parse(text); } catch (e) { throw new Error(base + ' is not a CivilCraft project (' + e.message + ').'); }
      const { project, notes } = m.Project.fromJSON(obj);
      return new CivilSession(project, notes || []);
    }
    if (POINT_EXTS.includes(extOf(base))) {
      const r = m.parsePoints(text);
      if (!r.points.length) throw new Error(base + ' has no survey points CivilCraft can read' + (r.bad.length ? ' (line ' + r.bad[0].line + ': ' + r.bad[0].why + ')' : '') + '.');
      const p = new m.Project();
      p.state.name = base.replace(/\.[^.]+$/, '').slice(0, 120);
      p.setPoints(r.points, base);
      const notes = ['Read as ' + r.format + (r.formatFrom ? ' (' + r.formatFrom + ')' : '') + '.'];
      if (r.badCount) notes.push(r.badCount + ' line(s) could not be read.');
      if (r.duplicates) notes.push(r.duplicates + ' duplicate point number(s) kept once.');
      return new CivilSession(p, notes);
    }
    if (extOf(base) === 'xml') throw new Error('LandXML is opened in the CivilCraft window for now (it builds the project there); open a .civilcraft.json project or a points file here.');
    throw new Error('CivilCraft opens .civilcraft.json projects and points files (.csv, .txt); "' + base + '" is neither.');
  }

  /** The project file, as the app's Save writes it. */
  save() { return new TextEncoder().encode(JSON.stringify(this.project.toJSON())); }
}
