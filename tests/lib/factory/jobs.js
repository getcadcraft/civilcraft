/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes and file format names; the panel words them. */
/**
 * jobs.js — the job queue (0.9 D8.13): programs for the machines, already posted for a control (by PartCraft's CAM with its editable posts,
 * or a program file the person opens), queued per machine, checked, and sent. Sending is EG.40's: Studio's "Send to a machine" dialog
 * (`window.ccSendToMachine`), which uploads the file to the machine's file store and never starts a CNC, laser or robot. Nothing here starts
 * a machine. DOM-free; the host passes `send` and a storage for the hand-over between apps.
 *
 *   cleanJob(raw) → job | null       { id, name, file, text, post, machine, from: { app, part }, state, at, sentAt?, note?, log[] }
 *   checkJob(job, machine) → [{ code, severity }]        codes: no-machine, file-name, too-big, empty, post-differs, machine-down, machine-offline
 *   sendJob(job, machine, { send }) → { ok, job, code? }  send = ccSendToMachine; job.state queued → sent | failed (cancelled stays queued)
 *   jobFile(job) / readJobFile(text)                     format cadcraft-factory-job v1 (what PartCraft hands over)
 *   outbox(storage): { list(), push(job), take() }       localStorage key cc-factory:outbox (same-origin hand-over PartCraft → the queue)
 */
export const STATES = ['queued', 'sent', 'failed', 'done', 'cancelled'];
/** The program names EG.40's drivers take (studio/hub/machines.js EXTENSIONS). */
export const EXTENSIONS = ['gcode', 'gco', 'g', 'nc', 'ngc', 'tap', 'cnc', 'bgcode', 'nc1'];
export const MAX_TEXT = 32 * 1024 * 1024;
export const OUTBOX_KEY = 'cc-factory:outbox';
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/;
const ID = { test: (v) => typeof v === 'string' && ID_RE.test(v) };
const text = (v, n) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, n);
const one = (v, n) => text(v, n).replace(/[\r\n\t]/g, ' ').trim();
export const extOf = (name) => ((/\.([A-Za-z0-9]+)$/.exec(String(name || '')) || [])[1] || '').toLowerCase();
export const cleanFileName = (name) => { const s = String(name || '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[-.]+/, '').slice(0, 80); return s && EXTENSIONS.includes(extOf(s)) ? s : null; };
let seq = 0;
export const newJobId = (now = Date.now()) => 'job-' + now.toString(36) + '-' + (++seq).toString(36);

export function cleanJob(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const t = text(raw.text, MAX_TEXT);
  const id = ID.test(raw.id) ? raw.id : newJobId();
  const file = cleanFileName(raw.file) || one(raw.file, 80);
  return { id, name: one(raw.name, 80) || file || id, file, text: t, post: one(raw.post, 60), machine: ID.test(raw.machine) ? raw.machine : '',
    from: { app: one(raw.from && raw.from.app, 30), part: one(raw.from && raw.from.part, 80) }, state: STATES.includes(raw.state) ? raw.state : 'queued',
    at: Number.isFinite(raw.at) ? raw.at : Date.now(), sentAt: Number.isFinite(raw.sentAt) ? raw.sentAt : null, note: one(raw.note, 200),
    log: (Array.isArray(raw.log) ? raw.log : []).slice(-20).map((l) => ({ at: Number(l.at) || 0, code: one(l.code, 40), detail: one(l.detail, 200) })) };
}

export function checkJob(job, machine, { live = null } = {}) {
  const out = [];
  if (!machine) { out.push({ code: 'no-machine', severity: 'error' }); return out; }
  if (!cleanFileName(job.file)) out.push({ code: 'file-name', severity: 'error' });
  if (!job.text || !job.text.trim()) out.push({ code: 'empty', severity: 'error' });
  if (job.text && new TextEncoder().encode(job.text).length > 256 * 1024 * 1024) out.push({ code: 'too-big', severity: 'error' });
  if (job.post && machine.post && job.post !== machine.post) out.push({ code: 'post-differs', severity: 'warning' });
  if (machine.kind === 'printer' && extOf(job.file) === 'nc1') out.push({ code: 'file-name', severity: 'error' });
  if (live === 'down') out.push({ code: 'machine-down', severity: 'warning' });
  if (live === 'offline') out.push({ code: 'machine-offline', severity: 'warning' });
  return out;
}

export async function sendJob(job, machine, { send, now = Date.now() } = {}) {
  const problems = checkJob(job, machine).filter((p) => p.severity === 'error');
  const log = (code, detail = '') => { job.log = [...job.log, { at: now, code, detail: String(detail).slice(0, 200) }].slice(-20); };
  if (problems.length) { log('refused', problems.map((p) => p.code).join(' ')); return { ok: false, job, code: problems[0].code }; }
  if (typeof send !== 'function') { log('no-send'); return { ok: false, job, code: 'no-send' }; }
  let r;
  try { r = await send({ app: 'factory', kind: extOf(job.file) === 'nc1' ? 'nc1' : 'gcode', files: [{ name: cleanFileName(job.file), bytes: new TextEncoder().encode(job.text) }], note: machine.name }); }
  catch (e) { r = { ok: false, error: String((e && e.message) || e) }; }
  if (r && r.ok) { job.state = 'sent'; job.sentAt = now; log('sent', machine.name); return { ok: true, job }; }
  if (r && r.cancelled) { log('cancelled'); return { ok: false, job, code: 'cancelled' }; }
  job.state = 'failed'; log('failed', r && r.error); return { ok: false, job, code: 'failed', error: r && r.error };
}

export function jobFile(job) { return JSON.stringify({ format: 'cadcraft-factory-job', version: 1, name: job.name, file: job.file, post: job.post, from: job.from, text: job.text }, null, 1); }
export function readJobFile(src) {
  let j; try { j = JSON.parse(src); } catch { return null; }
  if (!j || j.format !== 'cadcraft-factory-job' || j.version !== 1 || typeof j.text !== 'string') return null;
  return cleanJob({ name: j.name, file: j.file, post: j.post, from: j.from, text: j.text });
}
/** A program file as it is (G-code text), named by its file. */
export function jobFromProgram(name, src, extra = {}) { return cleanJob({ name, file: name, text: src, ...extra }); }

export function outbox(storage) {
  const read = () => { try { const v = JSON.parse((storage && storage.getItem(OUTBOX_KEY)) || '[]'); return Array.isArray(v) ? v.map(cleanJob).filter(Boolean) : []; } catch { return []; } };
  const write = (list) => { try { storage.setItem(OUTBOX_KEY, JSON.stringify(list)); return true; } catch { return false; } };
  return {
    list: read,
    push(job) { const list = read().concat([cleanJob(job)]).slice(-50); return write(list) ? list.length : 0; },
    take() { const list = read(); if (list.length) { try { storage.removeItem(OUTBOX_KEY); } catch { /* storage refused */ } } return list; },
  };
}
