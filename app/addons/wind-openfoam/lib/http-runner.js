/* SPDX-License-Identifier: GPL-3.0-or-later */
/**
 * http-runner.js — talks to runner/cc-openfoam-runner.mjs on this computer (127.0.0.1) from the browser (wind-openfoam add-on). Files in, files out; nothing else.
 *   makeHttpRunner({ url = 'http://127.0.0.1:8765', token, fetch = globalThis.fetch, poll = 1000 }) → { health(), run(job) }
 */
export function makeHttpRunner({ url = 'http://127.0.0.1:8765', token = '', fetch: fx = globalThis.fetch, poll = 1000, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(url)) throw new Error('the runner must be on this computer (http://127.0.0.1:port)');
  const call = async (method, p, body) => {
    const res = await fx(url + p, { method, headers: { 'x-cc-token': token, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const j = await res.json().catch(() => ({})); if (!res.ok && !j.state) throw new Error(j.error || 'runner answered ' + res.status); return j;
  };
  return {
    health: () => call('GET', '/health'),
    async run({ files, steps, collect, shouldStop, onTick }) {
      const { id } = await call('POST', '/job', { files, steps, collect });
      for (;;) {
        await sleep(poll);
        if (shouldStop && shouldStop()) { await call('DELETE', '/job/' + id).catch(() => {}); return { ok: false, files: {}, log: 'stopped', failedStep: 'stopped' }; }
        const j = await call('GET', '/job/' + id);
        if (onTick) onTick(j.stepIndex !== undefined ? Math.min(0.95, j.stepIndex / Math.max(1, steps.length)) : 0, j.step);
        if (j.state === 'done') return { ok: true, files: j.files || {}, log: j.log || '' };
        if (j.state === 'failed' || j.state === 'stopped') return { ok: false, files: j.files || {}, log: j.log || '', failedStep: j.failedStep };
      }
    },
  };
}
