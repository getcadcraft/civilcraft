/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — every word comes from app-addons-account.js (the shell's ccShellT with English fallbacks). */
/**
 * app-addons-account-mount.js — the account's add-ons in every lab app (0.8 AL.4 / AL.13). app-shell.inc prints `#cc-addons-account` {app, build} and loads this
 * module for dev builds that carry the add-on loader, whether the shell starts it (app-addons.js) or the app does (manifest "addons": "own": BimCraft, CadCraft).
 *
 * It waits for window.ccAddons, then makes ONE AddonsAccount per page (window.ccAddonsAccount; app-fields.js may have made it first, so it only fills what is
 * missing: the loader's package store, the build's trust check, the tab's token), keeps the list in step every few hours when the tab is signed in (a token
 * from /library/connect, kept for the tab; no token = no network call at all), and fills Settings › "Your add-ons" (its own fieldset in app-settings.inc,
 * shown once this has run): Remove, Updates all together, Browse, offline, Sign in, and (0.9 OF.4) Add from a file + a package file dropped onto the window
 * (installDrop; window.ccAddonsFromFile for Studio to hand a file over).
 */
const tag = typeof document !== 'undefined' ? document.getElementById('cc-addons-account') : null;

export async function mountAccount(cfg, ccAddons) {
  const m = await import('./app-addons-account.js?v=1794197714');
  let trust = null;
  try { trust = await import(new URL('addons/trust.js', new URL(cfg.build, location.href)).href); } catch { /* a build without it: nothing can be fetched and installed */ }
  const shellT = (key, fallback, vars) => {
    const r = typeof window.ccShellT === 'function' ? window.ccShellT(['shell', key].join('.'), vars) : null;
    return r && r !== ['shell', key].join('.') ? r : String(fallback).replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : '{' + k + '}'));
  };
  const haveIds = () => { try { return ccAddons.list().filter((a) => a.state === 'active' || a.state === 'ready').map((a) => (a.manifest && a.manifest.id) || a.id); } catch { return []; } };
  // AK.1 (2026-11-20): a packed page (Studio's apps, a browser edition) is not served by getcadcraft.com, so the list is asked of the site by address (cfg.site, printed by
  // devshell/render.php) with the device sign-in the client already has; the edition word comes from the host (Studio sets window.ccEdition = 'desktop' before the page scripts).
  const acc = window.ccAddonsAccount || (window.ccAddonsAccount = new m.AddonsAccount({ app: cfg.app, edition: window.ccEdition || cfg.edition || 'web', base: cfg.site || '', fields: () => window.ccFields }));
  let session = null; try { session = window.sessionStorage; } catch { /* blocked */ }
  if (ccAddons && ccAddons.loader && !ccAddons.loader.engineResolver) ccAddons.loader.engineResolver = acc.engineResolver;   // AL.5: add-ons that import engine:<name>/… use a downloaded engine package when the account has one
  acc.attach({ packages: ccAddons && ccAddons.loader && ccAddons.loader.packages, trust, session });
  if (!acc.signedIn() && !cfg.site) acc.autoConnect().then((r) => { if (r && r.ok && !r.already) { try { acc.autoUpdate(); } catch { /* later */ } } }).catch(() => {});   // already signed in to the site: no second sign-in (FX.43)
  else if (acc.due()) acc.sync().then((r) => { if (r && r.ok) return acc.autoUpdate(); }).catch(() => {});   // AL.11: the automatic ones, together; the rest wait for a yes in Settings
  // AL.6: the seam an app calls when it opens/saves a file: ccAddonsFile.stamp(doc, ids) before saving, ccAddonsFile.offer(doc, bannerEl) after opening.
  window.ccAddonsFile = {
    stamp: (doc, ids) => m.stampFile(doc, acc.items, ids),
    note: (doc) => acc.noteFile(doc, haveIds()),
    offer: (doc, el) => m.renderFileOffer(el, acc, doc, { have: haveIds(), t: shellT }),
  };
  // 0.9 OF.4 / OF.5: a signed package FILE, added with no connection (Settings › Add from a file, or dropped onto the window — Studio's window too, once
  // Studio lets the drop reach the page). The paid ids the page knows make the licence gate refuse a paid item that is not on this device's list.
  const paidIds = new Set(Array.isArray(cfg.paid) ? cfg.paid.filter((x) => typeof x === 'string') : []);
  if (typeof window.ccAddonLicensePaid === 'function') window.ccAddonLicensePaid([...paidIds]);
  const fromFile = async (file) => {
    let bytes;
    try { bytes = file instanceof Uint8Array ? file : new Uint8Array(await file.arrayBuffer()); } catch { return { ok: false, reason: 'unreadable' }; }
    return m.installFromFile({ acc, loader: ccAddons && ccAddons.loader, trust: acc.trust, name: file.name || '', bytes, paidIds });
  };
  /** Studio (or a test) hands a file over directly: ccAddonsFromFile(File | {name, bytes}) → the answer, said on screen. */
  window.ccAddonsFromFile = async (f) => { const r = await fromFile(f && f.bytes instanceof Uint8Array ? Object.assign(f.bytes, { name: f.name }) : f); announce(m.fileResultText(r, shellT)); return r; };
  installDrop(fromFile, (r) => announce(m.fileResultText(r, shellT)));
  const set = document.querySelector('[data-addons-account-set]');
  if (set) {
    const t = (key, fallback, vars) => {
      const s = typeof window.ccShellT === 'function' ? window.ccShellT(['shell', key].join('.'), vars) : null;
      return s && s !== ['shell', key].join('.') ? s : String(fallback).replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : '{' + k + '}'));
    };
    m.renderYourAddons(set, acc, { t, fromFile });
    set.hidden = false;
  }
  return acc;
}

/** A short message on screen (and for screen readers): a small status line at the foot of the window, gone after a while. */
function announce(text) {
  if (typeof document === 'undefined') return;
  let n = document.getElementById('cc-addons-file-note');
  if (!n) {
    n = document.createElement('div');
    n.id = 'cc-addons-file-note'; n.setAttribute('role', 'status'); n.setAttribute('aria-live', 'polite');
    n.style.cssText = 'position:fixed;left:50%;bottom:1.25rem;transform:translateX(-50%);z-index:2147483000;max-width:min(40rem,90vw);padding:.6rem 1rem;'
      + 'background:var(--sheet,#fff);color:var(--ink,#111);border:1.5px solid var(--ink,#111);border-radius:2px;font:inherit;font-size:.9rem';
    document.body.appendChild(n);
  }
  n.textContent = text; n.hidden = false;
  clearTimeout(n._t); n._t = setTimeout(() => { n.hidden = true; }, 9000);
  try { if (window.ccShellScreen && window.ccShellScreen.say) window.ccShellScreen.say(text); } catch { /* none */ }
}

/**
 * Drop a package file onto the window (OF.4). Only a drop whose files are ALL add-on packages (*.ccaddon.json) is taken (captured before the app's own
 * drop handlers, which open drawings); any other drop goes on to the app untouched. While a file is dragged over, the drop is allowed.
 */
export function installDrop(fromFile, done, win = typeof window !== 'undefined' ? window : null) {
  if (!win || win.__ccAddonsDrop) return;
  win.__ccAddonsDrop = true;
  const isPkg = (f) => f && /\.ccaddon\.json$/i.test(f.name || '');
  win.addEventListener('dragover', (e) => {
    const dt = e.dataTransfer;
    if (dt && Array.from(dt.types || []).includes('Files') && Array.from(dt.items || []).every((i) => i.kind === 'file' && (i.type === 'application/json' || i.type === ''))) e.preventDefault();
  }, true);
  win.addEventListener('drop', async (e) => {
    const files = Array.from((e.dataTransfer && e.dataTransfer.files) || []);
    if (!files.length || !files.every(isPkg)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    for (const f of files) done(await fromFile(f));
  }, true);
}

if (tag) {
  let cfg = null;
  try { cfg = JSON.parse(tag.textContent); } catch { cfg = null; }
  // A packed page mounts only where the host says the person has an account to add from (Studio); a browser edition zip has none (#cc-edition accounts:false).
  if (cfg && cfg.app && cfg.build && (!cfg.site || window.ccEdition === 'desktop')) {
    let tries = 0;
    const wait = () => {
      if (window.ccAddons) { mountAccount(cfg, window.ccAddons).catch((e) => { try { console.warn('the account add-on list did not start:', e); } catch { /* no console */ } }); return; }
      if (++tries < 300) setTimeout(wait, 200);   // up to a minute: the app's own loader starts after its model code
    };
    wait();
  }
}
