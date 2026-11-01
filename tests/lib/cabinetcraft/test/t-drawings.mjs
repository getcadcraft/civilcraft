/* SPDX-License-Identifier: Apache-2.0 */
// Shop drawings: plan, elevation, section, 3D view, and the printable sheet set.
const { ok, section, near, mine } = globalThis.__ccTest;
const P = await mine('lib/project.js');
const B = await mine('lib/build.js');
const W = await mine('lib/drawings.js');
const core = await mine('lib/core.js');

const tags = (svg) => { const open = (svg.match(/<(?!\/|\?|!)[a-zA-Z][^>]*[^/]>/g) || []).length, close = (svg.match(/<\/[a-zA-Z]+>/g) || []).length, self = (svg.match(/<[a-zA-Z][^>]*\/>/g) || []).length; return { open, close, self }; };

section('Drawings');
{
  const p = P.sampleProject();
  const b = B.buildJob(p);
  const plan = W.planSvg(b);
  ok(plan.svg.startsWith('<svg') && !/NaN|Infinity|undefined/.test(plan.svg) && tags(plan.svg).open === tags(plan.svg).close, 'the plan is well-formed SVG with no NaN');
  ok(plan.w === 3600 + 0 || plan.w > 3600, 'the plan is as wide as the room (and its dimension)', String(plan.w));
  ok((plan.svg.match(/<text/g) || []).length >= b.cells.filter((c) => c.kind === 'cab').length + 4, 'every cabinet number is written on the plan');
  for (const no of b.cells.filter((c) => c.kind === 'cab').map((c) => c.no)) if (!plan.svg.includes('>' + no + '<')) ok(false, 'cabinet ' + no + ' on the plan');
  const el = W.elevationSvg(b, 'A');
  ok(!/NaN|Infinity/.test(el.svg) && tags(el.svg).open === tags(el.svg).close && el.h > 2000, 'the elevation is well-formed, as tall as the tallest cabinet', String(el.h));
  ok(el.svg.includes('>3600 mm<') && el.svg.includes('>2120<'), 'it carries the run length (3600 mm) and the height (2120) as dimensions');
  ok(W.elevationSvg(b, 'ZZ').w === 0, 'an unknown run is an empty drawing');
  // seen from the room the wall's start is on the right: the first cabinet of run A (T01) is the right-most
  const m = [...el.svg.matchAll(/<text x="(-?[\d.]+)"[^>]*>(T01|B02)</g)].map((x) => [x[2], Number(x[1])]);
  const t01 = m.find((x) => x[0] === 'T01'), b02 = m.find((x) => x[0] === 'B02');
  ok(t01 && b02 && t01[1] > b02[1], 'elevation reads as seen from the room: T01 (the start of the wall) is to the right of B02');
  const sec = W.sectionSvg(b, 'B01');
  ok(!/NaN/.test(sec.svg) && sec.w > 500 && sec.h > 800, 'a section of B01 is as deep as the cabinet and as high', JSON.stringify([sec.w, sec.h]));
  ok(sec.svg.includes('>580') || sec.svg.includes('>578') || sec.svg.includes('>' + (560 + 18) + '<'), 'section dimension: the depth with the door (578)');
  const ffSec = W.sectionSvg(B.buildJob({ ...p, construction: 'faceframe' }), 'B01');
  ok(ffSec.svg.includes('>' + 'draw.frame' + '<') && ffSec.w > sec.w, 'a face-frame section is deeper by the frame and labels it');
  ok(W.sectionSvg(b, 'nope').w === 0, 'an unknown cabinet is an empty drawing');
  const iso = W.isoSvg(b);
  ok(!/NaN/.test(iso.svg) && (iso.svg.match(/<polygon/g) || []).length > 200, 'the 3D view draws every panel: ' + (iso.svg.match(/<polygon/g) || []).length + ' faces');
  const views = [0, 1, 2, 3].map((v) => W.isoSvg(b, { view: v }).svg);
  ok(new Set(views).size === 4, 'four views are four different drawings');
  const bv = W.bestView(b);
  ok(bv >= 0 && bv < 4 && W.isoSvg(b).svg === views[bv], 'the default view is the best one (fronts toward the viewer)', String(bv));
  ok(W.isoSvg(b, { view: 7 }).svg === views[3] && W.isoSvg(b, { view: -1 }).svg === views[3], 'a view number wraps round');
  const set = W.sheetSet(b, { title: 'Sample' });
  ok(set[0].id === 'plan' && set.at(-1).id === 'iso' && set.some((s) => s.id === 'elev-A') && set.some((s) => s.id === 'elev-B') && new Set(set.map((s) => s.id)).size === set.length, 'the set: plan, an elevation per run, sections, the 3D view', set.map((s) => s.id).join());
  ok(set.filter((s) => s.id.startsWith('section-')).length === new Set(b.cells.filter((c) => c.kind === 'cab').map((c) => c.cell.entry.tpl)).size, 'one section per distinct template');
  const html = W.sheetSetHtml(set, { title: 'Smith <script>alert(1)</script>', unit: 'mm', date: '2026-10-30' });
  ok(!html.includes('<script>') && html.includes('&lt;script&gt;') && (html.match(/<section class="sheet">/g) || []).length === set.length, 'the printable set has a page per drawing and escapes the job name');
  // a run name goes into the plan: escaped
  const q = P.sampleProject(); q.runs[0].name = '<img src=x onerror=1>';
  const pq = W.planSvg(B.buildJob(P.cleanProject(q)));
  ok(!pq.svg.includes('<img'), 'a run name is cleaned (no markup) before it reaches the drawing', pq.svg.match(/A [^<]*</)?.[0] || '');
  // inches
  const bi = B.buildJob(P.sampleProject('in'));
  ok(W.planSvg(bi).svg.includes('141.75 in') && !/NaN/.test(W.elevationSvg(bi, 'A').svg), 'an inch job: the room in inches');
  ok(W.planSvg(B.buildJob(P.newProject('mm'))).w > 0, 'an empty job still draws its room');
}
