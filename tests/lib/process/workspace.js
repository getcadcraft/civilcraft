/* SPDX-License-Identifier: Apache-2.0 */
/**
 * workspace.js — the "Process" trade workspace for SuperCad Studio (0.8 Track CH, owner decision O9: the name is "Process"). Data only: Super's
 * workspace adapter (assets/apps/supercadcraft/dev/super-tools.js SETS / WORKSPACE_APPS, lang `sc.ws.process`) reads it. Nothing here touches Super's
 * files: the mount lines go to super_PART_3's inbox (docs/0.8-sessions/process-link_PART_3.md § Mount lines).
 *
 *   PROCESS_WORKSPACE   { id, name, sets: [[app, [command groups]]], apps: [engines shown], panels, model, projectEntry }
 *   projectMembers(p)   the process block of a .ccproject: where it is stored (process.json, stored once) and how a member is read back
 */
import { projectEntry, fromJSON } from './model.js';

export const PROCESS_WORKSPACE = {
  id: 'process', name: 'Process',
  // the command groups of each engine that the trade reaches for (the P&ID add-on's and Plant add-on's commands are in the CadCraft and BimCraft groups)
  sets: [['cadcraft', ['draw', 'annotate', 'blocks', 'layers', 'addons']], ['bimcraft', ['model', 'addons']], ['partcraft', ['features', 'assembly', 'simulation']], ['detailcraft', ['place', 'connect']], ['takeoffcraft', ['takeoff']]],
  apps: ['cadcraft', 'bimcraft', 'partcraft'],
  panels: ['process-model', 'streams', 'problems'],
  model: { format: 'cadcraft-process', file: 'process.json' },
  tools: ['plant_add', 'line_set', 'controls_export', 'process_check', 'optimise_start'],
};
export const projectMembers = {
  write: (model) => projectEntry(model),
  read: (text) => fromJSON(text),
};
