#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * connect-table.mjs — Studio's native file whitelist (desktop-shell/src-tauri/src/connect.rs TABLE, PROGRAMS, RUNS) is the same as
 * CLIENTS in tools/mcp/clients.mjs. CADCRAFT_SHELL = the desktop-shell folder (default /var/www/CADCRAFT/desktop-shell); skipped
 * when it is not there (the shell is a separate public repo).
 */
import fs from 'node:fs';
import path from 'node:path';
import { CLIENTS, ENTRY, SERVER_NAME } from '../clients.mjs';

const shell = process.env.CADCRAFT_SHELL || '/var/www/CADCRAFT/desktop-shell';
const file = path.join(shell, 'src-tauri/src/connect.rs');
if (!fs.existsSync(file)) { console.log('connect-table: skipped (no ' + file + ')'); process.exit(0); }
const src = fs.readFileSync(file, 'utf8');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m, x === undefined ? '' : JSON.stringify(x)); } };
const table = src.slice(src.indexOf('const TABLE'), src.indexOf('];', src.indexOf('const TABLE')));
const rows = [...table.matchAll(/\("([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"\)/g)].map((m) => ({ id: m[1], win32: m[2], darwin: m[3], linux: m[4], file: m[5] }));
const withDirs = CLIENTS.filter((c) => c.dirs);
ok(rows.length === withDirs.length, 'the same number of clients with a settings file', [rows.length, withDirs.length]);
for (const c of withDirs) {
  const r = rows.find((x) => x.id === c.id);
  ok(r && r.win32 === c.dirs.win32 && r.darwin === c.dirs.darwin && r.linux === c.dirs.linux && r.file === c.file, 'connect.rs has the same folders and file for ' + c.id, { rust: r, js: { dirs: c.dirs, file: c.file } });
}
const progs = [...src.slice(src.indexOf('const PROGRAMS'), src.indexOf('];', src.indexOf('const PROGRAMS'))).matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
const want = [...new Set(CLIENTS.map((c) => c.cmd).filter(Boolean).concat(['code']))].sort();
ok(JSON.stringify(progs.slice().sort()) === JSON.stringify(want), 'the programs Studio may look for', [progs, want]);
const runs = src.slice(src.indexOf('const RUNS'), src.indexOf('];', src.indexOf('const RUNS')));
const lines = [...runs.matchAll(/&\[([^\]]*)\]/g)].map((m) => [...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1])).filter((l) => l.length);
const cc = CLIENTS.find((c) => c.id === 'claude-code');
const jsRuns = [cc.addArgs(), cc.removeArgs(), cc.listArgs].map((a) => JSON.stringify(a));
ok(lines.length === 3 && lines.every((l, i) => JSON.stringify(l) === jsRuns[i]), 'the three claude command lines', [lines, jsRuns]);
ok(ENTRY.args.join(' ') === '-y @getcadcraft/mcp connect' && SERVER_NAME === 'cadcraft', 'the entry');
console.log(`connect-table: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
