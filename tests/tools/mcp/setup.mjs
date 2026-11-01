/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — set-up messages for a terminal. */
/**
 * setup.mjs — `cadcraft-mcp setup` / `unsetup`: connect CadCraft to the AI apps on this computer from a terminal, the way
 * Studio › Connect your AI does it (docs/AI-CONNECT-SPEC.md § 6): detect, show exactly what will be written, write only after a
 * yes (or --yes), back the settings file up first, never touch another server's entry. `--dry-run` writes nothing.
 *
 *   cadcraft-mcp setup [--client claude-desktop,cursor …] [--yes] [--dry-run] [--list]
 *   cadcraft-mcp unsetup [--client …] [--yes]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { spawnSync } from 'node:child_process';
import { CLIENTS, byId, detect, plan, apply, remove, card, TEST_PROMPT } from './clients.mjs';

export function nodeEnv(env = process.env) {
  const home = os.homedir();
  return { platform: process.platform, home, appdata: env.APPDATA || path.join(home, 'AppData', 'Roaming'), xdgConfig: env.XDG_CONFIG_HOME || path.join(home, '.config'), now: () => Date.now() };
}

export function nodeIo(env = process.env) {
  const exts = process.platform === 'win32' ? (env.PATHEXT || '.EXE;.CMD;.BAT').split(';') : [''];
  return {
    exists: async (p) => fs.existsSync(p),
    read: async (p) => fs.readFileSync(p, 'utf8'),
    write: async (p, t) => fs.writeFileSync(p, t, { mode: 0o600 }),
    rename: async (p, q) => fs.renameSync(p, q),
    mkdirp: async (d) => fs.mkdirSync(d, { recursive: true }),
    which: async (cmd) => { for (const dir of String(env.PATH || '').split(path.delimiter)) for (const x of exts) { const f = path.join(dir, cmd + x.toLowerCase()), g = path.join(dir, cmd + x); for (const q of [f, g]) { try { if (fs.statSync(q).isFile()) return q; } catch { /* next */ } } } return null; },
    run: async (cmd, args) => { const r = spawnSync(cmd, args, { encoding: 'utf8', shell: process.platform === 'win32' }); return { code: r.status === null ? 1 : r.status, out: (r.stdout || '') + (r.stderr || '') }; },
  };
}

const ask = (q) => new Promise((res) => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); rl.question(q, (a) => { rl.close(); res(/^y(es)?$/i.test(a.trim())); }); });

export async function main(argv, { env = nodeEnv(), io = nodeIo(), out = (s) => process.stdout.write(s + '\n'), confirm = ask } = {}) {
  const undo = argv[0] === 'unsetup';
  const o = { yes: false, dry: false, list: false, clients: [] };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--yes' || a === '-y') o.yes = true;
    else if (a === '--dry-run') o.dry = true;
    else if (a === '--list') o.list = true;
    else if (a === '--client') o.clients.push(...String(argv[++i] || '').split(',').filter(Boolean));
    else if (a.startsWith('--client=')) o.clients.push(...a.slice(9).split(',').filter(Boolean));
    else { out('Unknown option ' + a); return 2; }
  }
  for (const id of o.clients) if (!byId(id)) { out('Unknown client "' + id + '". Clients: ' + CLIENTS.map((c) => c.id).join(', ') + '.'); return 2; }
  const list = o.clients.length ? o.clients.map(byId) : CLIENTS;
  let code = 0, did = 0;
  for (const c of list) {
    const d = await detect(c, env, io);
    if (o.list) { out(c.name.padEnd(20) + (d.found ? (d.configured ? 'connected' : 'found, not connected') : 'not found') + (c.unverified ? '  (settings location not yet verified on a real install)' : '')); continue; }
    if (!d.found) { if (o.clients.length) out(c.name + ': not found on this computer. Install it from ' + c.install + ', or paste this by hand:\n' + JSON.stringify(card(c, env), null, 1)); continue; }
    if (undo) {
      if (!d.configured) continue;
      if (!o.yes && !o.dry && !(await confirm('Remove CadCraft from ' + c.name + '? [y/N] '))) continue;
      if (o.dry) { out(c.name + ': would remove the "cadcraft" entry from ' + d.path); continue; }
      const r = await remove(c, env, io); out(c.name + (r.removed ? ': removed.' + (r.backup ? ' Backup: ' + r.backup : '') : ': nothing to remove.')); did++;
      continue;
    }
    let p;
    try { p = await plan(c, env, io); } catch (e) { out(c.name + ': left alone — ' + e.message); code = 1; continue; }
    out('\n' + c.name + (d.configured ? ' (CadCraft is already there; it will be replaced with this)' : ''));
    if (p.cli) out('  will run: ' + p.command); else { out('  file: ' + p.path); out('  adds: ' + (c.format === 'toml' ? p.after.slice(p.before.length).trim() : '"cadcraft": ' + JSON.stringify(JSON.parse(p.after)[c.key].cadcraft))); if (p.backup) out('  backup: ' + p.backup); }
    if (o.dry) continue;
    if (!o.yes && !(await confirm('Connect CadCraft to ' + c.name + '? [y/N] '))) { out('  skipped.'); continue; }
    try { const r = await apply(c, env, io); out('  done.' + (c.restart ? ' Restart ' + c.name + ' completely.' : '')); did++; } catch (e) { out('  failed: ' + e.message); code = 1; }
  }
  if (!o.list && !o.dry && did && !undo) out('\nOpen CadCraft Studio, then ask your AI:\n  ' + TEST_PROMPT);
  if (!o.list && !did && !o.dry && !o.clients.length) out(undo ? 'Nothing to remove.' : 'No AI app was found that is not connected yet. Use --list to see what was looked for.');
  return code;
}
