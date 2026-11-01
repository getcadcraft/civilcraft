/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol names and XML; hosts word what the person sees. */
/**
 * escl.js — cc-scanstart's scanner client: eSCL (AirScan / Mopria), the protocol nearly every networked scanner and office copier
 * speaks. DOM-free, plain text in and bytes out; the same file runs in the page and in Node (bin/test-scanstart.mjs drives it
 * against a stand-in scanner). The page never reaches the network itself: a host hands in `request(method, path, body)` —
 * Studio's desktop shell carries it to a scanner it found on the LAN (desktop-shell scanner.rs: private addresses, paths under
 * the scanner's eSCL root only). No trained model; nothing goes past the scanner.
 *
 *   parseCapabilities(xml) → { model, sources: ['Platen'|'Feeder'], resolutions: [dpi], colors: ['BlackAndWhite1'|'Grayscale8'|'RGB24'],
 *                              formats: ['image/jpeg'|'application/pdf'|'image/png'|…], maxW, maxH (in 1/300 in) }
 *   settingsXml({ source, color, dpi, format, w, h })   → the ScanSettings document (values from fixed lists only)
 *   pickSettings(caps, want) → the settings this scanner can do nearest to `want` ({ source, color, dpi, format })
 *   await scan(request, { rs = 'eSCL', want, onState(text key), wait(ms), maxPages }) → { pages: [{ bytes, type }], settings, caps }
 *        request(method, path, body?) → { status, headers: { location, 'content-type' }, body: Uint8Array }
 *        errors are thrown as EsclError(key, detail): busy, refused, nojob, nopage, cancelled, network
 */

export class EsclError extends Error { constructor(key, detail = '') { super(key + (detail ? ': ' + detail : '')); this.key = key; this.detail = detail; } }

const COLORS = ['BlackAndWhite1', 'Grayscale8', 'RGB24'];
const SOURCES = ['Platen', 'Feeder'];
const FORMATS = ['image/jpeg', 'application/pdf', 'image/png', 'image/tiff'];
const dec = new TextDecoder();
const all = (xml, tag) => [...String(xml).matchAll(new RegExp(`<(?:[A-Za-z0-9]+:)?${tag}>([^<]*)</(?:[A-Za-z0-9]+:)?${tag}>`, 'g'))].map((m) => m[1].trim());
const one = (xml, tag) => all(xml, tag)[0] ?? '';
const block = (xml, tag) => { const m = new RegExp(`<(?:[A-Za-z0-9]+:)?${tag}>([\\s\\S]*?)</(?:[A-Za-z0-9]+:)?${tag}>`).exec(String(xml)); return m ? m[1] : ''; };

export function parseCapabilities(xml) {
  const s = String(xml || '').slice(0, 2e6);
  const sources = [];
  if (block(s, 'Platen')) sources.push('Platen');
  if (block(s, 'Adf')) sources.push('Feeder');
  const inputs = block(s, 'Platen') || block(s, 'Adf') || s;
  const nums = (t) => [...new Set(all(inputs, t).map(Number).filter((n) => Number.isFinite(n) && n > 0))].sort((a, b) => a - b);
  const resolutions = nums('XResolution');
  const colors = [...new Set(all(inputs, 'ColorMode'))].filter((c) => COLORS.includes(c));
  const formats = [...new Set([...all(inputs, 'DocumentFormatExt'), ...all(inputs, 'DocumentFormat')])].filter((f) => /^[a-z]+\/[a-z0-9.+-]+$/i.test(f));
  return { model: one(s, 'MakeAndModel').slice(0, 120), sources, resolutions, colors, formats,
    maxW: Number(one(inputs, 'MaxWidth')) || 2550, maxH: Number(one(inputs, 'MaxHeight')) || 3508 };
}

export function pickSettings(caps, want = {}) {
  const source = SOURCES.includes(want.source) && caps.sources.includes(want.source) ? want.source : caps.sources[0] || 'Platen';
  const color = COLORS.includes(want.color) && caps.colors.includes(want.color) ? want.color : ['Grayscale8', 'RGB24', 'BlackAndWhite1'].find((c) => caps.colors.includes(c)) || 'Grayscale8';
  const target = Number(want.dpi) || 300, rs = caps.resolutions.length ? caps.resolutions : [300];
  const dpi = rs.reduce((b, r) => (Math.abs(r - target) < Math.abs(b - target) ? r : b), rs[0]);
  // a sheet to trace: JPEG reads everywhere; PDF when the person asked for it (several pages from the feeder)
  const format = FORMATS.includes(want.format) && caps.formats.includes(want.format) ? want.format : caps.formats.includes('image/jpeg') ? 'image/jpeg' : caps.formats.find((f) => FORMATS.includes(f)) || 'image/jpeg';
  return { source, color, dpi, format, w: caps.maxW, h: caps.maxH };
}

export function settingsXml({ source = 'Platen', color = 'Grayscale8', dpi = 300, format = 'image/jpeg', w = 2550, h = 3508 } = {}) {
  if (!SOURCES.includes(source) || !COLORS.includes(color) || !FORMATS.includes(format)) throw new EsclError('refused', 'settings');
  const n = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || lo)));
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<scan:ScanSettings xmlns:scan="http://schemas.hp.com/imaging/escl/2011/05/03" xmlns:pwg="http://www.pwg.org/schemas/2010/12/sm">\n'
    + '  <pwg:Version>2.0</pwg:Version>\n'
    + '  <pwg:ScanRegions><pwg:ScanRegion><pwg:ContentRegionUnits>escl:ThreeHundredthsOfInches</pwg:ContentRegionUnits>'
    + `<pwg:XOffset>0</pwg:XOffset><pwg:YOffset>0</pwg:YOffset><pwg:Width>${n(w, 1, 30000)}</pwg:Width><pwg:Height>${n(h, 1, 60000)}</pwg:Height></pwg:ScanRegion></pwg:ScanRegions>\n`
    + `  <pwg:InputSource>${source}</pwg:InputSource>\n`
    + `  <scan:ColorMode>${color}</scan:ColorMode>\n`
    + `  <scan:XResolution>${n(dpi, 50, 2400)}</scan:XResolution><scan:YResolution>${n(dpi, 50, 2400)}</scan:YResolution>\n`
    + `  <pwg:DocumentFormat>${format}</pwg:DocumentFormat><scan:DocumentFormatExt>${format}</scan:DocumentFormatExt>\n`
    + '</scan:ScanSettings>\n';
}

/** A Location header (absolute or not) → its path, only when it stays under the eSCL root. */
export function jobPath(location, rs = 'eSCL') {
  let p = String(location || '').trim();
  try { if (/^https?:\/\//i.test(p)) p = new URL(p).pathname; } catch { return null; }
  p = '/' + p.replace(/^\/+/, '').replace(/\/+$/, '');
  return p.startsWith('/' + rs + '/ScanJobs/') && !p.includes('..') && /^[A-Za-z0-9/_.-]+$/.test(p) ? p : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function scan(request, { rs = 'eSCL', want = {}, onState = () => {}, wait = sleep, maxPages = 50, signal = null } = {}) {
  const root = '/' + String(rs).replace(/^\/+|\/+$/g, '');
  const ask = async (m, p, b) => {
    if (signal?.aborted) throw new EsclError('cancelled');
    try { return await request(m, p, b); } catch (e) { throw new EsclError('network', String(e?.message || e).slice(0, 200)); }
  };
  onState('caps');
  const c = await ask('GET', root + '/ScannerCapabilities');
  if (c.status !== 200) throw new EsclError('refused', 'capabilities ' + c.status);
  const caps = parseCapabilities(dec.decode(c.body));
  const st = await ask('GET', root + '/ScannerStatus').catch(() => null);
  if (st && st.status === 200 && /<(?:\w+:)?State>\s*(Processing|Testing)\s*</.test(dec.decode(st.body))) throw new EsclError('busy');
  const settings = pickSettings(caps, want);
  onState('start');
  const j = await ask('POST', root + '/ScanJobs', settingsXml(settings));
  if (j.status === 503) throw new EsclError('busy');
  if (j.status !== 201 && j.status !== 200) throw new EsclError('refused', 'job ' + j.status);
  const job = jobPath(j.headers?.location, root.slice(1));
  if (!job) throw new EsclError('nojob');
  const pages = [];
  let tries = 0;
  try {
    while (pages.length < maxPages) {
      onState(pages.length ? 'next' : 'scanning');
      const r = await ask('GET', job + '/NextDocument');
      if (r.status === 200) { pages.push({ bytes: r.body, type: String(r.headers?.['content-type'] || settings.format).split(';')[0] }); tries = 0; if (settings.source === 'Platen') { /* one sheet; the scanner ends the job with a 404 */ } continue; }
      if (r.status === 503 && tries < 120) { tries++; await wait(1000); continue; }   // still scanning, or warming up
      if (r.status === 404 || r.status === 410) break;   // no more pages
      throw new EsclError('nopage', String(r.status));
    }
  } catch (e) {
    await ask('DELETE', job).catch(() => {});
    throw e;
  }
  if (!pages.length) throw new EsclError('nopage', 'empty');
  onState('done');
  return { pages, settings, caps };
}
