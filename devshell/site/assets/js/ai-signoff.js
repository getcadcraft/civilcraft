/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — the text an assistant reads; the person's own words are shell.docinfo.signoff.* in the shell's language file (app-docinfo.js). */
/**
 * ai-signoff.js — "unsigned outputs say so" (BK.144; principle 3, ai-principles.js). DOM-free, no imports; tested in Node (bin/test-principles.mjs).
 *
 * Every estimate or audit an assistant hands back carries a `signoff` line saying whether a PERSON signed it off in this file (docinfo.js sign()). The
 * line is added where results leave the app (the dispatcher's `outgoing`, composed with the model-data filter and the figure ledger), so no tool has to
 * remember it and no assistant can leave it out.
 *
 *   outputKind(tool, group) → 'estimate' | 'audit' | null
 *   signoffLine(status, kind) → the sentence
 *   withSignoff(outgoing, info) → an `outgoing` that adds { signoff: { signed, by?, at?, stale?, line } } to an object result of an estimate or audit tool
 */
const ESTIMATE = /(^|_)(cost|estimate|takeoff|quantities|boq)(_|$)|^prices_apply$|^schedule_(read|export)$/;
const AUDIT = /(_check|^audit|_audit|^verify)(_|$)/;

export function outputKind(tool, group) {
  const t = String(tool || '');
  if (AUDIT.test(t)) return 'audit';
  if (ESTIMATE.test(t)) return 'estimate';
  return null;
}

export function signoffLine(st, kind) {
  const what = kind === 'audit' ? 'audit' : 'estimate';
  if (!st || !st.signed) return 'Not signed off by a person: this ' + what + ' is a draft until someone signs it off in Drawing details.';
  const d = st.at ? new Date(st.at).toISOString().slice(0, 10) : '';
  return 'Signed off by ' + st.by + (d ? ' on ' + d : '') + (st.stale ? ', but the drawing was saved after that: sign it off again.' : '.');
}

export function withSignoff(outgoing, info) {
  return (value, ctx) => {
    const out = typeof outgoing === 'function' ? outgoing(value, ctx) : { value };
    try {
      const kind = outputKind(ctx && ctx.tool, ctx && ctx.group);
      const v = out && 'value' in out ? out.value : value;
      if (kind && v && typeof v === 'object' && !Array.isArray(v) && !v.isError && !v.content) {
        const st = info.signoff(kind);
        return { ...out, value: { ...v, signoff: { signed: st.signed, ...(st.signed ? { by: st.by, at: new Date(st.at).toISOString(), stale: st.stale } : {}), line: signoffLine(st, kind) } } };
      }
    } catch { /* an output with no note is still the same output */ }
    return out;
  };
}
