/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lan-ui.js — Settings › Rendering › other computers (0.7 CU.7): "Let others render on this computer" (off by default, per
 * machine, with this computer's code) and "Use other computers" (the Studios nearby that turned it on; connect with their
 * code). Shown ONLY when Studio's shell offers the bridge below — a browser tab has no way to find other computers, and the
 * section says nothing it cannot do. The app hands in its DOM helper, words, crypto (live-crypto.js), pool and node kernels.
 *
 *   mountLan(host, box) → { devices({ W, H, scene }) → Promise<[hybrid device of every connected node]>, close() }
 *     scene = { kernel: id, buffers: { name: typedArray }, params } — what the render shares with its own pool; each node that
 *     has that kernel gets it once and becomes a device
 *   host = { el, t, bridge, crypto, pool, kernels: { id: {url, fn} },
 *            storage (localStorage-like; 'cc-compute.node' = '1' when this computer serves) }
 *   bridge = window.cadcraftDesktop.renderNodes (desktop-shell, `platforms`; contract in docs/apps/compute.md § LAN):
 *     advertise(tag) → Promise · stopAdvertising() · onConnection(cb(transport)) · browse() → Promise<[{tag, name, host, port}]>
 *     onNodes(cb([…])) · connect({host, port}) → Promise<transport>
 *     transport = { send(Uint8Array), close(), onmessage, onclose }  (bytes only: the shell never sees inside the frames)
 * Words: compute.lan.* (tools/compute/lang.mjs).
 */
import { serveNode } from './lan-node.js';
import { connectNode } from './lan.js';

const KEY = 'cc-compute.node';

export function mountLan(host, box) {
  const { el, t, bridge, crypto, pool, kernels } = host;
  if (!bridge || typeof bridge.advertise !== 'function' || !crypto) { box.replaceChildren(); box.hidden = true; return { devices: () => [], close() {} }; }
  box.hidden = false;
  const store = host.storage || { getItem: () => null, setItem() {} };
  let serving = false, code = null, wrong = 0, servedNow = null;
  const nodes = new Map();   // tag → { node, info, name }
  const status = el('p', { className: 'shell-hint-text', role: 'status', 'aria-live': 'polite' });
  const codeLine = el('p', { className: 'cc-lan-code', hidden: true });
  const serve = el('input', { type: 'checkbox', name: 'ccLanServe' });
  const newCode = el('button', { type: 'button', className: 'btn-line btn-sm-cc', hidden: true }, t('compute.lan.new-code'));
  const list = el('ul', { className: 'cc-lan-list' });
  const say = (k, f) => { status.textContent = t(k, f || {}); };

  function freshCode() {
    code = crypto.newCode();
    wrong = 0;
    codeLine.replaceChildren(t('compute.lan.code'), ' ', el('strong', {}, code));
    return bridge.advertise(crypto.parseCode(code).tag);
  }
  async function startServing() {
    serving = true; codeLine.hidden = false; newCode.hidden = false;
    await freshCode();
    say('compute.lan.serving');
  }
  function stopServing() {
    serving = false; codeLine.hidden = true; newCode.hidden = true; code = null;
    try { bridge.stopAdvertising(); } catch { /* gone */ }
    try { servedNow?.close(); } catch { /* gone */ }
    say('compute.lan.off');
  }
  bridge.onConnection(async (transport) => {
    if (!serving || !code) { transport.close(); return; }
    if (servedNow) { transport.close(); return; }   // one at a time
    const c = crypto.parseCode(code);
    try {
      servedNow = await serveNode({ transport, code: { tag: c.tag, secret: c.secret }, crypto, pool, kernels,
        onEvent: (k, d) => {
          if (k === 'wrong-code' && ++wrong >= 3) { freshCode(); say('compute.lan.wrong-tries'); }
          if (k === 'range') say('compute.lan.rendering', { w: d.W, h: d.H, spp: d.spp });
          if (k === 'left') { servedNow = null; if (serving) say('compute.lan.serving'); }
        } });
      wrong = 0;
      say('compute.lan.connected-in');
    } catch { servedNow = null; }
  });

  async function refresh(found) {
    const items = (found || []).filter((n) => n && typeof n.tag === 'string').slice(0, 32);
    list.replaceChildren(...(items.length ? items.map((n) => {
      const on = nodes.get(n.tag);
      const btn = el('button', { type: 'button', className: 'btn-line btn-sm-cc' }, t(on ? 'compute.lan.disconnect' : 'compute.lan.connect'));
      btn.addEventListener('click', () => (on ? disconnect(n.tag) : askCode(n)));
      return el('li', {}, el('span', {}, String(n.name || n.tag).slice(0, 60)), ' ', on ? el('small', {}, t('compute.lan.workers', { n: on.info.workers })) : null, ' ', btn);
    }) : [el('li', { className: 'shell-hint-text' }, t('compute.lan.none'))]));
  }
  async function askCode(n) {
    // an inline field for the code (never window.prompt: the apps ask in the page)
    const field = el('input', { type: 'text', inputMode: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: 'TT-SSSSS', 'aria-label': t('compute.lan.code-of', { name: n.name || n.tag }), maxLength: 12 });
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc' }, t('compute.lan.connect'));
    const row = el('li', { className: 'cc-lan-ask' }, field, ' ', go);
    list.append(row);
    field.focus();
    const submit = async () => {
      go.disabled = true;
      say('compute.lan.connecting', { name: n.name || n.tag });
      try {
        const transport = await bridge.connect({ host: n.host, port: n.port });
        const node = await connectNode({ transport, code: String(field.value || ''), crypto });
        nodes.set(n.tag, { node, info: node.info, name: n.name });
        node.onclose = () => { nodes.delete(n.tag); say('compute.lan.left', { name: n.name || n.tag }); bridge.browse().then(refresh, () => {}); };
        say('compute.lan.connected', { name: n.name || n.tag, n: node.info.workers });
      } catch (e) {
        say(e?.code === 'wrong_code' ? 'compute.lan.wrong' : 'compute.lan.failed', { name: n.name || n.tag });
      }
      bridge.browse().then(refresh, () => {});
    };
    go.addEventListener('click', submit);
    field.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  }
  function disconnect(tag) { const n = nodes.get(tag); nodes.delete(tag); try { n?.node.close(); } catch { /* gone */ } bridge.browse().then(refresh, () => {}); }

  serve.addEventListener('change', () => { try { store.setItem(KEY, serve.checked ? '1' : ''); } catch { /* private window */ } serve.checked ? startServing() : stopServing(); });
  newCode.addEventListener('click', () => { freshCode(); say('compute.lan.code-new'); });
  bridge.onNodes?.(refresh);

  box.replaceChildren(
    el('label', { className: 'shell-check' }, serve, ' ', t('compute.lan.serve')),
    el('p', { className: 'shell-hint-text' }, t('compute.lan.serve-hint')),
    codeLine, newCode,
    el('p', {}, el('strong', {}, t('compute.lan.use'))),
    el('p', { className: 'shell-hint-text' }, t('compute.lan.use-hint')),
    list, status);
  let on = false;
  try { on = store.getItem(KEY) === '1'; } catch { on = false; }
  serve.checked = on;
  if (on) startServing(); else say('compute.lan.off');
  bridge.browse().then(refresh, () => refresh([]));

  return {
    /** One hybrid device per connected node, for the scene the app is rendering (sent once per node). */
    async devices({ W, H, scene: sc } = {}) {
      if (!sc || !sc.kernel || !sc.buffers) return [];
      const out = [];
      for (const n of nodes.values()) {
        if (!n.info.kernels.includes(sc.kernel)) continue;
        try { const id = await n.node.loadScene(sc); out.push(n.node.device(id, { W, H })); } catch { /* that node is skipped */ }
      }
      return out;
    },
    close() { stopServing(); for (const tag of [...nodes.keys()]) disconnect(tag); },
  };
}
