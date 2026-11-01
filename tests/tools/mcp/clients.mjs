/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer and set-up messages. */
/**
 * clients.mjs — the AI apps CadCraft can be connected to, and how (docs/AI-CONNECT-SPEC.md § 5, § 6.1). Data + pure functions;
 * the file system is passed in (`io`), so the same code runs in `cadcraft-mcp setup` (Node), in Studio's Connect your AI (its web
 * view, with `io` backed by Studio's native file commands, which only touch the paths listed here) and in the tests (a fake home).
 *
 *   CLIENTS                              [{id, name, kind, detect(env), config(env) → path|null, format, entry(entry), ...}]
 *   ENTRY                                the one `cadcraft` entry every client gets: the stdio bridge, no secret in it
 *   detect(client, env, io)              → { found: bool, why, path, configured: bool }
 *   plan(client, env, io, entry?)        → { path, before, after, text(diff), backup } — what would be written, nothing written
 *   apply(client, env, io, entry?)       → { path, backup }   (backs up, writes atomically, reads back)
 *   remove(client, env, io)              → { path, removed: bool }
 *   card(client, env)                    → { title, steps[], paste, test } the copy-paste set-up card
 *   TEST_PROMPT
 *
 * env = { platform: 'win32'|'darwin'|'linux', home, appdata, xdgConfig, path: [dirs on PATH], now }.
 * io  = { exists(p), read(p) → text, write(p, text), rename(p, q), mkdirp(dir), which(cmd) → path|null, run(cmd, args) → {code, out} }.
 * A client's config file is changed only by adding, replacing or deleting the single `cadcraft` entry; everything else in the
 * file is kept as it was (JSON is parsed and written back with the same indentation; TOML is edited as text, one table).
 */

export const SERVER_NAME = 'cadcraft';
export const ENTRY = { command: 'npx', args: ['-y', '@getcadcraft/mcp', 'connect'] };
export const TEST_PROMPT = 'Use the CadCraft tools: list the apps you can reach, then open the sample drawing in my CadCraft folder and tell me how many objects it has, by layer.';

const join = (env, ...p) => p.join(env.platform === 'win32' ? '\\' : '/');

/** The AI apps. `unverified: true` = the path comes from third-party guides and the real-client matrix has not seen it (spec § 8). */
export const CLIENTS = [
  { id: 'claude-desktop', name: 'Claude Desktop', kind: 'chat', format: 'json', key: 'mcpServers', unverified: false,
    dirs: { win32: '{appdata}/Claude', darwin: '{home}/Library/Application Support/Claude', linux: '{xdgConfig}/Claude' },
    file: 'claude_desktop_config.json', restart: true, install: 'https://claude.ai/download' },
  { id: 'claude-code', name: 'Claude Code', kind: 'cli', format: 'cli', cmd: 'claude', unverified: false,
    addArgs: () => ['mcp', 'add', SERVER_NAME, '--scope', 'user', '--', ...[ENTRY.command, ...ENTRY.args]], removeArgs: () => ['mcp', 'remove', SERVER_NAME, '--scope', 'user'], listArgs: ['mcp', 'list'], install: 'https://claude.com/product/claude-code' },
  { id: 'cursor', name: 'Cursor', kind: 'editor', format: 'json', key: 'mcpServers', unverified: true,
    dirs: { win32: '{home}/.cursor', darwin: '{home}/.cursor', linux: '{home}/.cursor' }, file: 'mcp.json', install: 'https://cursor.com/downloads' },
  { id: 'windsurf', name: 'Windsurf', kind: 'editor', format: 'json', key: 'mcpServers', unverified: true,
    dirs: { win32: '{home}/.codeium/windsurf', darwin: '{home}/.codeium/windsurf', linux: '{home}/.codeium/windsurf' }, file: 'mcp_config.json', install: 'https://windsurf.com' },
  { id: 'vscode', name: 'Visual Studio Code', kind: 'editor', format: 'json', key: 'servers', typed: true, unverified: true,
    dirs: { win32: '{appdata}/Code/User', darwin: '{home}/Library/Application Support/Code/User', linux: '{xdgConfig}/Code/User' },
    file: 'mcp.json', install: 'https://code.visualstudio.com' },
  { id: 'codex', name: 'Codex CLI', kind: 'cli', format: 'toml', unverified: true,
    dirs: { win32: '{home}/.codex', darwin: '{home}/.codex', linux: '{home}/.codex' }, file: 'config.toml', cmd: 'codex', install: 'https://github.com/openai/codex' },
  { id: 'gemini', name: 'Gemini CLI', kind: 'cli', format: 'json', key: 'mcpServers', unverified: true,
    dirs: { win32: '{home}/.gemini', darwin: '{home}/.gemini', linux: '{home}/.gemini' }, file: 'settings.json', cmd: 'gemini', install: 'https://github.com/google-gemini/gemini-cli' },
];

/** A path template ({home}, {appdata}, {xdgConfig}) on this OS: the folder separators of that OS. Studio's native side holds the same templates (a test compares them). */
export const resolveDir = (c, env) => {
  const t = c.dirs && (c.dirs[env.platform] || c.dirs.linux);
  if (!t) return null;
  const p = t.replace(/\{(home|appdata|xdgConfig)\}/g, (m, k) => env[k]);
  return env.platform === 'win32' ? p.replace(/\//g, '\\') : p;
};

export const byId = (id) => CLIENTS.find((c) => c.id === id) || null;
export const configPath = (c, env) => (c.dirs ? join(env, resolveDir(c, env), c.file) : null);

const entryFor = (c, entry) => (c.typed ? { type: 'stdio', ...entry } : { ...entry });
const indentOf = (text) => { const m = /\n([ \t]+)"/.exec(text); return m ? m[1] : '  '; };

/** Is the app on this computer, and is CadCraft already in its settings? */
export async function detect(c, env, io) {
  if (c.format === 'cli' && !c.dirs) {
    const p = await io.which(c.cmd);
    if (!p) return { found: false, why: c.name + ' was not found on this computer.', path: null, configured: false };
    let configured = false;
    try { const r = await io.run(c.cmd, c.listArgs); configured = r.code === 0 && new RegExp('(^|\\s)' + SERVER_NAME + '[:\\s]', 'm').test(r.out); } catch { /* old version */ }
    return { found: true, why: 'Found at ' + p + '.', path: p, configured };
  }
  const file = configPath(c, env), dir = resolveDir(c, env);
  const hasFile = await io.exists(file);
  const hasDir = hasFile || await io.exists(dir);
  const hasCmd = c.cmd ? !!(await io.which(c.cmd)) : false;
  if (!hasDir && !hasCmd) return { found: false, why: c.name + ' was not found on this computer.', path: file, configured: false };
  let configured = false;
  if (hasFile) { try { configured = await has(c, await io.read(file)); } catch { /* unreadable: treated as not configured */ } }
  return { found: true, why: hasFile ? 'Its settings file is ' + file + '.' : 'Its settings folder exists; the file will be made.', path: file, configured };
}

async function has(c, text) {
  if (c.format === 'toml') return new RegExp('^\\[mcp_servers\\.' + SERVER_NAME + '\\]', 'm').test(text);
  if (!text.trim()) return false;
  const j = JSON.parse(text);
  return !!(j && j[c.key] && j[c.key][SERVER_NAME]);
}

/** The new text of the settings file with CadCraft added or replaced. Throws when the file is not valid (nothing is guessed). */
export function withEntry(c, text, entry = ENTRY) {
  if (c.format === 'toml') {
    const block = '[mcp_servers.' + SERVER_NAME + ']\ncommand = ' + JSON.stringify(entry.command) + '\nargs = ' + JSON.stringify(entry.args) + '\n';
    const re = new RegExp('^\\[mcp_servers\\.' + SERVER_NAME + '\\][\\s\\S]*?(?=^\\[|(?![\\s\\S]))', 'm');
    if (re.test(text)) return text.replace(re, block + '\n').replace(/\n{3,}/g, '\n\n');
    return (text && !text.endsWith('\n') ? text + '\n' : text) + (text.trim() ? '\n' : '') + block;
  }
  const ind = indentOf(text || '');
  const j = text.trim() ? JSON.parse(text) : {};
  if (!j || typeof j !== 'object' || Array.isArray(j)) throw new Error('The settings file is not a JSON object.');
  if (j[c.key] !== undefined && (typeof j[c.key] !== 'object' || Array.isArray(j[c.key]))) throw new Error('"' + c.key + '" in the settings file is not an object.');
  j[c.key] = { ...(j[c.key] || {}), [SERVER_NAME]: entryFor(c, entry) };
  return JSON.stringify(j, null, ind) + '\n';
}

export function withoutEntry(c, text) {
  if (c.format === 'toml') {
    const re = new RegExp('\\n?^\\[mcp_servers\\.' + SERVER_NAME + '\\][\\s\\S]*?(?=^\\[|(?![\\s\\S]))', 'm');
    return text.replace(re, '').replace(/\n{3,}/g, '\n\n');
  }
  const j = JSON.parse(text);
  if (j && j[c.key] && j[c.key][SERVER_NAME]) delete j[c.key][SERVER_NAME];
  return JSON.stringify(j, null, indentOf(text)) + '\n';
}

const stamp = (env) => { const d = new Date(env.now ? env.now() : Date.now()); const p = (n) => String(n).padStart(2, '0'); return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + p(d.getUTCHours()) + p(d.getUTCMinutes()); };

/** What connecting would write. Nothing is written. */
export async function plan(c, env, io, entry = ENTRY) {
  if (c.format === 'cli' && !c.dirs) return { path: null, command: [c.cmd, ...c.addArgs()].join(' '), cli: true };
  const file = configPath(c, env);
  const before = (await io.exists(file)) ? await io.read(file) : '';
  const after = withEntry(c, before, entry);
  return { path: file, before, after, backup: before ? file + '.cadcraft-backup-' + stamp(env) : null, replaces: await has(c, before).catch(() => false) };
}

/** Back the file up, write the entry atomically, read it back. */
export async function apply(c, env, io, entry = ENTRY) {
  if (c.format === 'cli' && !c.dirs) {
    const r = await io.run(c.cmd, c.addArgs());
    if (r.code !== 0) throw new Error(c.name + ' did not take the setting: ' + String(r.out).trim().slice(0, 300));
    return { path: null, backup: null, command: [c.cmd, ...c.addArgs()].join(' ') };
  }
  const p = await plan(c, env, io, entry);
  await io.mkdirp(resolveDir(c, env));
  if (p.backup) await io.write(p.backup, p.before);
  const tmp = p.path + '.cadcraft-tmp';
  await io.write(tmp, p.after);
  await io.rename(tmp, p.path);
  if (!(await has(c, await io.read(p.path)))) throw new Error('The settings were written but CadCraft is not in them when read back: ' + p.path);
  return { path: p.path, backup: p.backup };
}

export async function remove(c, env, io) {
  if (c.format === 'cli' && !c.dirs) { const r = await io.run(c.cmd, c.removeArgs()); return { path: null, removed: r.code === 0 }; }
  const file = configPath(c, env);
  if (!(await io.exists(file))) return { path: file, removed: false };
  const before = await io.read(file);
  if (!(await has(c, before))) return { path: file, removed: false };
  const backup = file + '.cadcraft-backup-' + stamp(env);
  await io.write(backup, before);
  const tmp = file + '.cadcraft-tmp';
  await io.write(tmp, withoutEntry(c, before));
  await io.rename(tmp, file);
  return { path: file, removed: true, backup };
}

/** The copy-paste card for a client: what to paste, where, how to check, how to undo (generated, so it cannot drift). */
export function card(c, env = { platform: 'linux', home: '~', appdata: '%APPDATA%', xdgConfig: '~/.config' }) {
  const file = c.dirs ? configPath(c, env) : null;
  const snippet = c.format === 'toml' ? withEntry(c, '', ENTRY) : c.format === 'cli' && !c.dirs ? [c.cmd, ...c.addArgs()].join(' ') : withEntry(c, '', ENTRY);
  const steps = c.format === 'cli' && !c.dirs
    ? ['Open a terminal.', 'Run the command below.', 'Start ' + c.name + ' and ask it the test prompt.']
    : ['Open ' + file + ' (it is made if it does not exist; keep anything already in it).', 'Add the CadCraft entry below (inside "' + (c.key || 'mcp_servers') + '" if the file has one).', c.restart ? 'Restart ' + c.name + ' completely, then ask it the test prompt.' : 'Start ' + c.name + ' and ask it the test prompt.'];
  return { id: c.id, title: 'Connect ' + c.name, steps, paste: snippet, file, test: TEST_PROMPT, undo: c.format === 'cli' && !c.dirs ? [c.cmd, ...c.removeArgs()].join(' ') : 'Delete the "' + SERVER_NAME + '" entry from ' + file + '.', install: c.install, note: 'CadCraft Studio must be open. Nothing in this entry is a password: Studio keeps the connection secret in a file only you can read.' };
}
