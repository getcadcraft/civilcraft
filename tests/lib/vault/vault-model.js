/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vault-model.js — what the Documents panel shows and offers, without the DOM (0.8 SU.1058, sessions `sx-vault`, `vault-08`). Canonical in
 * lib/vault (each app's copy in dev/vault/, written by tools/vault/sync.mjs); vault-panel.js is the panel; tools/vault/test-ui.mjs
 * drives this file in Node.
 *
 *   ACTIONS                       every action the panel can show, in its order
 *   actionsFor(rec, { open, canOpen, extras }) → the actions that apply to one file now (rec = Vault.files() row; canOpen = the app opens
 *                                   this kind; open = it is the file open in the app, which adds the app's `extras`): the vault's own
 *                                   rules decide again when the action runs
 *   CODES                         every refusal code vault.js returns (each has an `sx.vault.err.<code>` string)
 *   errorKey(code)                → the string key for a refusal
 *   stateKey(state)               → 'sx.vault.state.<state>'
 *   identity(store, account)      → { user, machine } (the signed-in name first, else what was typed before) · saveIdentity(store, who)
 *   fillVaultFields(doc, rec, { fillTitleBlocks, stateLabel }) → how many attribute values changed, every layout's title blocks
 *   readOnlyKey(rec)              → null when the person may save the open vault file (it is checked out to them), else the string key saying why not
 *   ASME_SKIP                     the revision letters ASME Y14.35 leaves out (I O Q S X Z)
 *   settingsForm(settings)        → the text the settings form shows · settingsPatch(form) → the patch for vault.setSettings
 *   folderNote(kind)              → the note about locks on this kind of folder (best effort outside Node/Studio-with-exclusive)
 */
import { titleBlockValues } from './vault-links.js';

export const ACTIONS = ['open', 'checkout', 'checkin', 'undo', 'newrev', 'submit', 'approve', 'reject', 'obsolete', 'breaklock'];
export const CODES = ['no_user', 'not_found', 'exists', 'missing_file', 'outside', 'locked', 'not_locked', 'not_holder', 'released', 'in_review',
  'obsolete', 'state', 'checked_out', 'nothing_to_submit', 'no_approver', 'not_approver', 'approver_is_author', 'no_reason', 'not_admin', 'no_rev', 'busy'];

export const stateKey = (state) => 'sx.vault.state.' + state;
export const errorKey = (code) => (CODES.includes(code) ? 'sx.vault.err.' + code : 'sx.vault.err.other');

export function actionsFor(rec, { open = false, canOpen = false, extras = [] } = {}) {
  if (!rec) return [];
  const lock = rec.lock, mine = !!lock?.mine, other = !!lock && !mine;
  const out = new Set();
  if (canOpen) out.add('open');
  if (!lock && rec.state === 'wip') out.add('checkout');
  if (!lock && rec.state === 'released') out.add('newrev');
  if (mine) { out.add('checkin'); out.add('undo'); }
  if (!lock && rec.state === 'wip' && /\./.test(rec.rev)) out.add('submit');
  if (rec.state === 'review') { out.add('approve'); out.add('reject'); }
  if (!lock && rec.state === 'released') out.add('obsolete');
  if (other) out.add('breaklock');
  const core = ACTIONS.filter((a) => out.has(a));
  return open && canOpen ? [...core, ...extras] : core;   // extras (an app's own actions) are for the file that is open
}

export function identity(store, account) {
  let saved = {};
  try { saved = JSON.parse(store?.getItem('cadcraft.vault.who') || '{}') || {}; } catch { saved = {}; }
  const user = String(account?.name || saved.user || '').trim().slice(0, 80);
  let machine = String(saved.machine || '').trim().slice(0, 80);
  if (!machine) {
    machine = 'PC-' + Math.random().toString(36).slice(2, 6).toUpperCase();   // i18n-ignore (an id the person can change)
    try { store?.setItem('cadcraft.vault.who', JSON.stringify({ ...saved, machine })); } catch { /* private window */ }
  }
  return { user, machine };
}
export function saveIdentity(store, { user, machine }) {
  try { store?.setItem('cadcraft.vault.who', JSON.stringify({ user: String(user || '').trim().slice(0, 80), machine: String(machine || '').trim().slice(0, 80) })); } catch { /* private window */ }
}

export function fillVaultFields(doc, rec, { fillTitleBlocks, stateLabel }) {
  const values = titleBlockValues(rec, { stateLabel });
  let n = 0;
  for (const lay of doc.layouts || []) n += fillTitleBlocks(doc, lay.name, values);
  return n;
}

export const folderNote = (fsx) => (fsx && fsx.exclusive ? 'sx.vault.folder.exclusive' : 'sx.vault.folder.besteffort');

export const ASME_SKIP = 'IOQSXZ';
const lines = (v) => (Array.isArray(v) ? v.join('\n') : '');
/** The settings as form text: names one per line, letters, the four-eyes flag, days. */
export function settingsForm(settings = {}) {
  return { approvers: lines(settings.approvers), admins: lines(settings.admins), approverNotAuthor: !!settings.approverNotAuthor,
    revSkip: String(settings.revSkip || ''), staleLockDays: String(settings.staleLockDays ?? 14) };
}
/** The form text → the patch for vault.setSettings (the vault cleans it again; names deduplicated here, letters upper-cased). */
export function settingsPatch(form = {}) {
  const names = (v) => { const seen = new Set(); return String(v || '').split(/[\n,;]+/).map((x) => x.trim()).filter((x) => x && !seen.has(x.toLowerCase()) && seen.add(x.toLowerCase())); };
  const days = Number(String(form.staleLockDays ?? '').trim());
  return { approvers: names(form.approvers), admins: names(form.admins), approverNotAuthor: !!form.approverNotAuthor,
    revSkip: String(form.revSkip || '').toUpperCase().replace(/[^A-Z]/g, ''), ...(Number.isFinite(days) && days >= 1 && days <= 3650 ? { staleLockDays: Math.round(days) } : {}) };
}

/** Why the open drawing may not be saved over (SAVE), or null. Copies (Save As, exports) are not asked: they never touch the vault's file. */
export function readOnlyKey(rec) {
  if (!rec) return null;
  if (rec.lock?.mine) return null;
  if (rec.lock) return 'sx.vault.ro.locked';
  if (rec.state !== 'wip') return 'sx.vault.ro.state';
  return 'sx.vault.ro.notout';
}
