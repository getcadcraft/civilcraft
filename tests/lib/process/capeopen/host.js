/* SPDX-License-Identifier: Apache-2.0 */
/**
 * host.js — the engine host's whole program, for any JavaScript runtime that can read and write lines synchronously (0.9 IND.3):
 * Node (tools/capeopen/engine-node.mjs) and the native host (tools/capeopen/shim/src/bin/engine.rs, which embeds QuickJS and gives
 * `ccReadLine` / `ccWriteLine`). No Node or browser APIs.
 *
 *   runHost({ readLine, writeLine, packageTexts: [json text of exported package files], engine }) → serves until shutdown or end of input
 * Package files that fail checkCapeOpenPackage are skipped and reported by `hello` (field `skipped`), so one bad file does not stop the rest.
 */
import { SyncPeer, serveEngine } from './protocol.js';
import { checkCapeOpenPackage } from './bundle.js';

export function loadPackages(texts) {
  const packages = [], skipped = [];
  for (const [i, t] of (texts || []).entries()) {
    let o = null; try { o = JSON.parse(t); } catch { skipped.push({ file: i, why: 'not JSON' }); continue; }
    const c = checkCapeOpenPackage(o); if (!c.ok) { skipped.push({ file: i, why: c.problems.join('; ') }); continue; }
    for (const p of o.packages) if (!packages.some((q) => q.name === p.name)) packages.push(p);
  }
  return { packages, skipped };
}
export function runHost({ readLine, writeLine, packageTexts, engine }) {
  const { packages, skipped } = loadPackages(packageTexts);
  const peer = new SyncPeer(readLine, writeLine, 'e');
  serveEngine(peer, { packages, engine: engine || 'cc-process' });
  const hello = peer.handlers.get('hello'); peer.handle('hello', (p, pe) => ({ ...hello(p, pe), skipped }));
  peer.serve();
  return peer;
}
