/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vault-app.js — the Documents panel for an app that opens whole files and saves the open one as a file (PartCraft, BimCraft;
 * 0.8 SU.1058, session `vault-08`). Canonical in lib/vault; the apps' copies (dev/vault/) are written by tools/vault/sync.mjs.
 * CadCraft has its own adapter (cadcraft/dev/vault-ui.js: xrefs, title blocks, revision block, compare). Everything else is
 * vault-panel.js; this file only maps the app's three small calls onto the panel's `app` adapter.
 *
 *   installVaultPanel({ stage, el, t, print, focusCommandLine, fileHost, kinds, openFile, currentFile, getRef, setRef, afterCheckin, saveBlob })
 *     kinds         the vault kinds the app opens: PartCraft ['part', 'assembly'], BimCraft ['ifc']
 *     openFile(File)             open it in the app (a tab, a model: the app's own way)
 *     currentFile(rec)           → { bytes } the open file as the app saves it (nothing is downloaded), { wrong: true } when what is open is
 *                                not this kind of file, or null (check in what lies in the folder)
 *     getRef() / setRef(ref)     where the app remembers which vault file is open: { id, path, folder } | null (on its document)
 *     afterCheckin(rec)          the open file is now the vault's copy: mark it saved
 *     saveBlob(name, text, mime) hand a file to the person (the BOM as CSV)
 *   → { open, close, node, state, useFolder, saveBlocked }    saveBlocked() → the sentence to print when SAVE must not go ahead, else null
 *     (the app's Save asks it, in place only: a file opened from the vault is saved over only while it is checked out to you)
 */
import { createVaultPanel } from './vault-panel.js';

const base = (p) => String(p).split('/').pop();

export function installVaultPanel({ stage, el, t, print, focusCommandLine, fileHost, kinds, openFile, currentFile, getRef, setRef, afterCheckin, saveBlob }) {
  const app = {
    kinds,
    saveBlob,
    async open(rec, bytes, folder) {
      await openFile(new File([bytes], base(rec.path)));
      setRef({ id: rec.id, path: rec.path, folder });
    },
    openRef: () => { const r = getRef(); return r ? { id: r.id, folder: r.folder } : null; },
    current: (rec) => currentFile(rec),
    afterCheckin: (rec) => afterCheckin?.(rec),
  };
  // a cloud folder, through the signed-in transport the host page or Studio hands over (window.ccVaultCloud = { request, available?, base? }; app-teamwork.js sets it from Studio's cloud); absent = no cloud button. Same hook as CadCraft's vault-ui.js.
  Object.defineProperty(app, 'cloud', { get: () => (typeof window !== 'undefined' && window.ccVaultCloud) || null, configurable: true });
  return createVaultPanel({ stage, el, t, print, focusCommandLine, fileHost, app });
}
