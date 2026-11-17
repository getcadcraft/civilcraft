/* SPDX-License-Identifier: Apache-2.0 */
/**
 * super.mjs — SuperCad Studio's project tools for the headless server and the CLI (0.10 BK.59, bk-r4-assistant-10): the same read tools
 * the live window registers (supercadcraft/dev/super-agents.js projectTools), over a .ccproject file opened by path. One source: nothing
 * is copied from the app. Read only; the window-only tools (selection, workspace, commands, the mounted apps) say why in WINDOW_ONLY.
 *   superTools(env, helpers) → tool definitions: super_open + the project tools, each taking `doc`
 */
import { load } from './apps.mjs';

let A = null, P = null, REG = null, LAY = null, LR = null, DISC = null;
try { A = await load('supercadcraft', 'super-agents.js'); P = await load('supercadcraft', 'super-project.js'); } catch { A = null; P = null; }
for (const [n, set] of [['super-registry.js', (m) => { REG = m; }], ['super-layers.js', (m) => { LAY = m; }], ['super-linkroles.js', (m) => { LR = m; }], ['super-disciplines.js', (m) => { DISC = m; }]]) { try { set(await load('supercadcraft', n)); } catch { /* not in this build: the tools say so */ } }   // a package without Super's modules lists none

export function superTools(env, { ToolError, readFile, keep, get, S, obj }) {
  if (!A) return [];
  const sessionEnv = { ToolError, REG, LAY, LR, DISC, project: (a) => get(env, a.doc, 'super').s.project };
  const tools = [];
  tools.push({ name: 'super_open', group: 'read', title: 'Open a Super project',
    description: 'Open a SuperCad Studio project file (.ccproject, the zip form) and return a handle (d1, ...) for the super_* project tools: members, links, registry objects, layers, revisions. Reads the file only; nothing is changed or written.',
    inputSchema: obj({ path: S.path }, ['path']),
    run: async (a) => {
      const { real, bytes } = readFile(env, a.path);
      const { project, skipped } = await P.fromBytes(bytes);
      const doc = keep(env, 'super', { project }, real);
      return { doc, skipped: (skipped || []).length, path: real, name: project.name || '', members: project.members.length, links: project.links.length, revision: project.revision | 0 };
    } });
  for (const t of A.projectTools(sessionEnv, { doc: true })) {
    const name = t.name.startsWith('super_') ? t.name : 'super_' + t.name;
    tools.push({ ...t, name, inputSchema: { ...t.inputSchema, properties: { ...t.inputSchema.properties, doc: S.doc } } });
  }
  return tools;
}
