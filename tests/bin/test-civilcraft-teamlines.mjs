#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Feature lines shared between the drawings of a team (0.8 WL.26, app side): team-lines.js (the client), the Team section of a feature line's
 * Properties (features-ui.js), and the site's /api/v1/team/lines over real HTTP (a child `php -S` as www-data on the live database, fixtures
 * tlinetest+cadcraft-<n>@projectz.xyz removed at the end; Stripe, mail and the live Apache are never touched).
 *   node bin/test-civilcraft-teamlines.mjs [--verbose]       (run as root: it starts the server with sudo -u www-data)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
const EN = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
I18N.init({ strings: EN });
const TL = await mod('team-lines.js');
const FL = await mod('featureline.js');
const PJ = await mod('project.js');
const FUI = await mod('features-ui.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const section = (s) => console.log('\n== ' + s);
const F = (pts, extra = {}) => ({ id: 'f1', name: 'Curb', pts: pts.map(([x, y, z, b]) => (b ? { x, y, z, b } : { x, y, z })), closed: false, use: 'eg', daylight: false, cut: 2, fill: 3, ...extra });

section('geometry: what goes to the site and what comes back');
{
  const f = F([[0, 0, 100], [100, 0, 101], [100, 50, 99]]);
  const g = TL.toGeometry(f, 'ft');
  ok(JSON.stringify(g.geometry) === '{"points":[[0,0,100],[100,0,101],[100,50,99]],"closed":false,"style":"units=ft"}' && g.chords === false, 'a straight line goes as its points, closed flag and its units');
  const arc = F([[0, 0, 100, 0.5], [40, 0, 101], [40, 30, 101]]);
  const ga = TL.toGeometry(arc, 'm');
  ok(ga.chords === true && ga.geometry.points.length > 3 && ga.geometry.style === 'units=m' && ga.geometry.points[0][2] === 100, 'an arc is sent as chords (more points than vertices), said, units m');
  const back = TL.fromGeometry({ points: [[0, 0, 0], [10, 0, 1], [10, 10, 2]], closed: false, style: 'units=m' }, 'ft');
  ok(Math.abs(back.pts[1].x - 32.8084) < 1e-4 && Math.abs(back.pts[2].z - 6.5617) < 1e-4, 'a line made in metres is scaled to feet (10 m = 32.8084 ft)');
  const same = TL.fromGeometry({ points: [[1, 2, 3], [4, 5, 6]], style: 'units=ft' }, 'ft');
  ok(same.pts[0].x === 1 && same.closed === false, 'the same units are not touched');
  ok(TL.fromGeometry({ points: [[1, 2]] }, 'ft') === null && TL.fromGeometry({ points: [[1, 2, 3], [NaN, 1, 1]] }, 'ft') === null && TL.fromGeometry(null) === null, 'too few or non-finite points: null');
  ok(TL.fromGeometry({ points: [[0, 0], [1, 1], [1, 0]], closed: true }, 'ft').closed === true && TL.fromGeometry({ points: [[0, 0], [1, 1]], closed: true }, 'ft').closed === false, 'closed needs three points');
  const u = '5e62e57c-6057-4a98-938c-c0fe22dacf50';
  ok(TL.cleanShared({ uuid: u.toUpperCase(), revision: 3 }).uuid === u && TL.cleanShared({ uuid: u, revision: -2 }).revision === 1 && TL.cleanShared({ uuid: 'x' }) === null && TL.cleanShared(null) === null, 'cleanShared: lower-case uuid, revision from 1, junk is null');
  const c = FL.cleanFeature({ ...f, shared: { uuid: u, revision: 4 } }, 'ft');
  ok(c.shared.uuid === u && c.shared.revision === 4 && FL.cleanFeature({ ...f, shared: { uuid: '../../x' } }, 'ft').shared === undefined, 'the project file keeps the link; a bad one is dropped');
}

section('without a site: no sign-in, no cloud file, a refusal from the server');
{
  const none = TL.createTeamLines({ request: null, drawing: 'not-a-uuid' });
  ok((await none.list()).code === 'no_file' && (await none.share(F([[0, 0, 0], [1, 1, 1]]))).code === 'no_file', 'a drawing that is not a cloud file: no_file, nothing sent');
  const calls = [];
  const closed = TL.createTeamLines({ request: async (a) => { calls.push(a.path); return { status: 403, json: () => ({ code: 'teamwork_closed', message: 'closed' }) }; }, drawing: '5e62e57c-6057-4a98-938c-c0fe22dacf50' });
  const r = await closed.list();
  ok(r.ok === false && r.code === 'teamwork_closed' && calls.length === 1 && /sync\/versions/.test(calls[0]), 'the switch closed on the site: the code comes back, one call made');
  const off = TL.createTeamLines({ request: async () => { throw Object.assign(new Error('x'), { code: 'not_allowed' }); }, drawing: '5e62e57c-6057-4a98-938c-c0fe22dacf50' });
  ok((await off.list()).code === 'not_allowed', "Studio's refusal of the path is reported as not_allowed");
}

// ------------------------------------------------------------------ real HTTP
const helper = path.join(REPO, 'tools/civilcraft-test/teamlines-helper.php');
const wwwdata = (args) => execFileSync('sudo', ['-u', 'www-data', ...args], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 24 });
let server = null, fx = null;
const cleanup = () => { try { server?.kill(); } catch { /* gone */ } try { wwwdata(['php', helper, 'down']); } catch { /* nothing to remove */ } };
process.on('exit', cleanup);
try {
  fx = JSON.parse(wwwdata(['php', helper, 'up']));
  const PORT = 18000 + Math.floor(Math.random() * 1500);
  server = spawn('sudo', ['-u', 'www-data', 'php', '-S', '127.0.0.1:' + PORT, '-t', path.join(REPO, 'public_html'), path.join(REPO, 'tools/civilcraft-test/teamlines-router.php')], { cwd: REPO, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${PORT}/api/v1/team/lines`); break; } catch { await new Promise((r) => setTimeout(r, 100)); } }
  const as = (token) => async ({ method, path: p, body, contentType }) => {
    const res = await fetch(`http://127.0.0.1:${PORT}${p}`, { method, headers: { Authorization: 'Bearer ' + token, ...(contentType ? { 'Content-Type': contentType } : {}) }, body });
    const json = await res.json().catch(() => null);
    return { status: res.status, json: () => json };
  };
  const client = (who, drawing, units = 'ft') => TL.createTeamLines({ request: as(fx.tokens[who]), drawing: fx.drawings[drawing], units });

  section('over HTTP: share, place, change, behind, pull');
  const curb = F([[1000, 2000, 100], [1100, 2000, 101], [1100, 2050, 99.5]], { name: 'Main curb' });
  const own = client('own', 'a', 'ft');
  const c = await own.context();
  ok(c.ok && c.project === fx.projects.p1 && c.canEdit === true, 'the file says which project it is in and that this person can edit (' + (c.code || '') + ')');
  const sh = await own.share(curb);
  ok(sh.ok && sh.shared.revision === 1 && /^[0-9a-f-]{36}$/.test(sh.shared.uuid), 'share: a line with a uuid, revision 1 (' + (sh.code || '') + ' ' + (sh.message || '') + ')');
  const L = sh.shared.uuid;
  const l1 = await own.list();
  ok(l1.ok && l1.lines.length === 1 && l1.lines[0].name === 'Main curb' && l1.lines[0].following === true && l1.lines[0].behind === false, 'the project lists it; the drawing that shared it follows it');
  const ed = client('ed', 'b', 'm');
  const l2 = await ed.list();
  ok(l2.ok && l2.lines.length === 1 && l2.lines[0].following === false, "another file of the project sees the line and is not following it yet");
  const pl = await ed.place(L);
  ok(pl.ok && pl.feature.name === 'Main curb' && pl.feature.pts.length === 3 && Math.abs(pl.feature.pts[1].x - 1100 * 0.3048) < 1e-6 && Math.abs(pl.feature.pts[2].z - 99.5 * 0.3048) < 1e-9 && pl.shared.revision === 1, 'place: the line follows, its feet become metres in a metric drawing (' + (pl.code || '') + ')');
  const behind0 = (await ed.list()).lines[0];
  ok(behind0.following === true && behind0.behind === false, 'right after placing it is not behind');
  const edited = F([[1000, 2000, 100], [1100, 2000, 101.25], [1100, 2050, 99.5], [1200, 2100, 99]], { name: 'Main curb', shared: sh.shared });
  const pu = await own.push(edited);
  ok(pu.ok && pu.shared.revision === 2 && pu.notified >= 1, 'push: revision 2, the other drawing was told (' + pu.notified + ')');
  const own2 = (await own.list()).lines[0];
  ok(own2.behind === false && own2.revision === 2, 'the sender stays up to date with what it just sent');
  const bh = (await ed.list()).lines[0];
  ok(bh.behind === true && bh.revision === 2, 'the follower is behind');
  const same = await own.push(edited);
  ok(same.ok && same.shared.revision === 2, 'sending the same geometry again does not make a revision');
  const pulled = await ed.pull({ ...pl.feature, shared: pl.shared });
  ok(pulled.ok && pulled.feature.pts.length === 4 && pulled.shared.revision === 2 && Math.abs(pulled.feature.pts[1].z - 101.25 * 0.3048) < 1e-9, 'pull: four vertices now, revision 2, still in metres');
  ok((await ed.list()).lines[0].behind === false, 'after the pull it is no longer behind');

  section('over HTTP: who may, and other projects of the team');
  const vw = client('vw', 'a');
  const vl = await vw.list();
  ok(vl.ok && vl.lines.length === 1, 'a project viewer can read the list');
  const vs = await vw.share(curb);
  ok(!vs.ok && vs.code === 'forbidden', 'a project viewer cannot share (forbidden, answered before any request)');
  const other = client('ed', 'c', 'ft');
  const pl2 = await other.place(L);
  ok(pl2.ok, "a file in the team's other project can follow the line too (" + (pl2.code || '') + ')');
  const ol = await other.list();
  ok(ol.ok && ol.lines.some((x) => x.uuid === L && x.following), "the followed line of the other project shows in that file's list");
  const st = await other.stop({ shared: pl2.shared });
  ok(st.ok && !(await other.list()).lines.some((x) => x.uuid === L), 'stop following: it leaves the list');
  const bad = TL.createTeamLines({ request: as('ccu_' + 'x'.repeat(40)), drawing: fx.drawings.a });
  const br = await bad.list();
  ok(!br.ok && /invalid_token|unauthor|error/i.test(br.code), 'a wrong token is refused (' + br.code + ')');
  const missing = await ed.place('00000000-0000-4000-8000-000000000000');
  ok(!missing.ok && missing.code === 'not_found', 'a line that does not exist: not_found');
  const notShared = await own.push(F([[0, 0, 0], [1, 1, 1]]));
  ok(notShared.code === 'invalid', 'send on a line that was never shared: invalid, nothing sent');

  section('the Team section in Properties (features-ui.js)');
  // a tiny element factory: enough to find the buttons and press them
  const el = (tag, attrs = {}, ...kids) => ({ tag, attrs, onclick: attrs?.onclick, kids: kids.flat().filter((k) => k !== null && k !== undefined && k !== false), replaceChildren(...k) { this.kids = k.flat(); } });
  const walk = (n, fn) => { if (!n || typeof n !== 'object') return; fn(n); (n.kids || []).forEach((k) => walk(k, fn)); };
  const find = (nodes, attr) => { let hit = null; for (const n of [].concat(nodes)) walk(n, (x) => { if (!hit && x.attrs && attr in x.attrs) hit = x; }); return hit; };
  const textAll = (n) => { let s = ''; const w = (x) => { if (typeof x === 'string') s += x + ' '; else if (Array.isArray(x)) x.forEach(w); else if (x && x.kids) x.kids.forEach(w); }; w(n); return s; };
  const said = [];
  const project = new PJ.Project();
  project.change('seed', (s) => { s.features = [F([[0, 0, 10], [50, 0, 11], [50, 50, 12]], { id: 'f1', name: 'Swale' })]; });
  let selected = null;
  const ui = FUI.createFeatures({ el, project: () => project, units: () => 'ft', say: (m) => said.push(m), numInput: () => el('input'), row: () => [], select: (x) => { selected = x; }, command: () => {}, eg: () => null });
  const f0 = () => project.state.features.find((x) => x.id === 'f1');
  globalThis.location = { search: '' };
  let nodes = ui.teamBlock(f0());
  ok(find(nodes, 'data-fl-team-off') && /Studio/.test(textAll(nodes)) && !find(nodes, 'data-fl-share'), 'outside a cloud file the section says what it needs and offers nothing');
  globalThis.location = { search: '?cloud=' + fx.drawings.c };
  globalThis.ccTeamRequest = as(fx.tokens.own);
  nodes = ui.teamBlock(f0());
  ok(find(nodes, 'data-fl-share') && find(nodes, 'data-fl-team-show') && !find(nodes, 'data-fl-push'), 'in a cloud file: Share and Team lines… are there, Send/Get are not');
  await find(nodes, 'data-fl-share').onclick();
  ok(f0().shared && f0().shared.revision === 1 && said.at(-1).includes('Swale') && /shared with the team/.test(said.at(-1)), 'Share: the line carries its link now and says so (' + said.at(-1) + ')');
  nodes = ui.teamBlock(f0());
  ok(find(nodes, 'data-fl-push') && find(nodes, 'data-fl-pull') && find(nodes, 'data-fl-stop') && !find(nodes, 'data-fl-share') && /revision 1/.test(textAll(nodes)), 'then Send, Get and Stop following are offered and the status names the revision');
  await project.undo?.();
  ok(project.state.features.find((x) => x.id === 'f1') && !f0().shared, 'Share is one undo step (the link goes, the line stays)');
  project.redo?.();
  await own.share(F([[5, 5, 1], [9, 9, 2]], { name: 'Ditch' }));   // a second line in project 1 (file a)
  globalThis.location = { search: '?cloud=' + fx.drawings.b };     // now the editor's file b, in project 1
  globalThis.ccTeamRequest = as(fx.tokens.ed);
  nodes = ui.teamBlock(f0());
  await find(nodes, 'data-fl-team-show').onclick();
  const rows = []; walk(find(nodes, 'data-fl-team-list'), (x) => { if (x.attrs && 'data-fl-team-row' in x.attrs) rows.push(x); });
  ok(rows.length === 2 && rows.every((r) => find(r, 'data-fl-place')) && rows.some((r) => /Main curb/.test(textAll(r)) && /revision 2/.test(textAll(r))) && rows.some((r) => /Ditch/.test(textAll(r))), "Team lines…: the project's two lines, each with Place (Main curb at revision 2)");
  const place = rows.find((r) => /Main curb/.test(textAll(r)));
  await find(place, 'data-fl-place').onclick();
  const placed = project.state.features.find((x) => x.name === 'Main curb');
  ok(placed && placed.pts.length === 4 && placed.shared.uuid === L && selected?.id === placed.id && /placed from the team/.test(said.at(-1)), 'Place: a new feature line from the team, linked and selected (' + said.at(-1) + ')');
  // 0.8 teamwork_PART_4: the project-level entry (no feature line selected)
  globalThis.location = { search: '' };
  nodes = ui.teamProject();
  ok(find(nodes, 'data-fl-team-off') && !find(nodes, 'data-fl-team-show'), 'project level, outside a cloud file: says what it needs, offers nothing');
  globalThis.location = { search: '?cloud=' + fx.drawings.b }; globalThis.ccTeamRequest = as(fx.tokens.ed);
  nodes = ui.teamProject();
  ok(find(nodes, 'data-fl-team-show') && !find(nodes, 'data-fl-share'), 'project level, in a cloud file: only "Team lines…" (nothing to share without a line)');
  await find(nodes, 'data-fl-team-show').onclick();
  const prow = []; walk(find(nodes, 'data-fl-team-list'), (x) => { if (x.attrs && 'data-fl-team-row' in x.attrs) prow.push(x); });
  ok(prow.length >= 2, 'project level: the team lines list (' + prow.length + ')');
  const ditch = prow.find((r) => /Ditch/.test(textAll(r)) && find(r, 'data-fl-place'));
  const before = project.state.features.length;
  if (ditch) await find(ditch, 'data-fl-place').onclick();
  ok(ditch && project.state.features.length === before + 1 && project.state.features.some((x) => x.name === 'Ditch' && x.shared) && /placed from the team/.test(said.at(-1)), 'project level: Place adds the line, linked, from the list');
  globalThis.ccTeamRequest = as('ccu_' + 'y'.repeat(40));
  nodes = ui.teamBlock(f0());
  await find(nodes, 'data-fl-push').onclick();
  ok(!/undefined|fl\.team/.test(said.at(-1)) && said.at(-1).length > 10, 'a refused request is said in words, never a key or "undefined" (' + said.at(-1) + ')');
  const missingKeys = I18N.missing ? I18N.missing() : [];
  if (VERBOSE) console.log(missingKeys);
  ok(missingKeys.filter((k) => k.startsWith('fl.team') || k.startsWith('fl.undo.')).length === 0, 'every word the section uses is in the language file');
  const keys = Object.keys(EN).filter((k) => k.startsWith('fl.team.err.'));
  ok(['offline', 'not_allowed', 'invalid_token', 'token_revoked', 'token_expired', 'account_inactive', 'insufficient_scope', 'sync_closed', 'teamwork_closed', 'forbidden', 'not_found', 'throttled', 'invalid', 'no_file', 'other'].every((c) => keys.includes('fl.team.err.' + c)), 'every code the client can answer has its words');
} finally {
  cleanup();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
