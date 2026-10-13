/* SPDX-License-Identifier: Apache-2.0 */
/*
 * help-core.js — the reader-dependent parts of compiled help (core/classes/Help.php), shared by
 * the in-app panel (help-panel.js) and the site's topic pages (help-page.js).
 *
 * A reader context is {os, browser, shell, net, input}. Variant blocks (.hv) and picks (.hpv)
 * carry data-v="os:mac,windows;browser:safari": every dimension named must match (any listed
 * token within it). Keys (.hk) carry both renderings; the root's data-os picks one in CSS.
 */

export const DIMENSIONS = ['os', 'browser', 'shell', 'net', 'input'];

export function detect() {
  const nav = navigator;
  const uaData = nav.userAgentData;
  const plat = ((uaData && uaData.platform) || nav.platform || '').toLowerCase();
  const ua = nav.userAgent || '';
  let os = 'windows';
  if (/mac|iphone|ipad|ipod/.test(plat) || /Macintosh|iPhone|iPad/.test(ua)) os = 'mac';
  else if (/linux|x11|cros/.test(plat) && !/Android/.test(ua)) os = 'linux';
  let browser = 'chromium';
  if (/Firefox\//.test(ua)) browser = 'firefox';
  else if (/Safari\//.test(ua) && !/Chrome\/|Chromium\/|CriOS\/|Edg\//.test(ua)) browser = 'safari';
  const desktop = !!(window.cadcraftDesktop);   // set by a desktop shell, when there is one
  const touch = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;   // i18n-ignore (media query)
  return {
    os, browser,
    shell: desktop ? 'desktop' : 'web',
    net: nav.onLine === false ? 'offline' : 'online',
    input: touch ? 'touch' : 'mouse',
  };
}

export function parseSpec(spec) {
  const out = {};
  for (const part of String(spec || '').split(';')) {
    const [dim, list] = part.split(':');
    if (dim && list) out[dim] = list.split(',');
  }
  return out;
}

export function matches(spec, ctx) {
  const s = parseSpec(spec);
  return Object.keys(s).every((dim) => !ctx || ctx[dim] === undefined || ctx[dim] === null || s[dim].includes(ctx[dim]));
}

/**
 * Show what fits ctx (null = show everything, labeled). A pick with no matching part shows all
 * of its parts, so a phrase never disappears.
 */
export function apply(root, ctx) {
  root.dataset.os = (ctx && ctx.os) || root.dataset.osDefault || 'windows';
  root.classList.toggle('help-all', !ctx);
  for (const el of root.querySelectorAll('.hv')) el.hidden = !!ctx && !matches(el.dataset.v, ctx);
  for (const p of root.querySelectorAll('.hp')) {
    const parts = [...p.querySelectorAll(':scope > .hpv')];
    const fit = ctx ? parts.filter((x) => matches(x.dataset.v, ctx)) : parts;
    const show = fit.length ? fit : parts;
    for (const x of parts) x.hidden = !show.includes(x);
    for (const sep of p.querySelectorAll(':scope > .hp-sep')) sep.hidden = show.length < 2;
  }
}

export const LABELS = {
  os: { mac: 'Mac', windows: 'Windows', linux: 'Linux' },
  browser: { chromium: 'Chrome or Edge', firefox: 'Firefox', safari: 'Safari' },   // i18n-ignore (English fallback; shell.help.browser.*)
  shell: { web: 'browser', desktop: 'desktop app' },   // i18n-ignore (English fallback; shell.help.shell.*)
  net: { online: 'online', offline: 'offline' },
  input: { mouse: 'mouse', touch: 'touch' },
};

/** A label in the page's language: shell string shell.help.<dim>.<key> on an app page (window.ccShellT, app-shell.js),
 *  else the English above (the site's /tutorials pages stay English). cap = first letter upper case (menus). */
export function label(dim, key, cap = false) {
  const k = 'shell.help.' + dim + '.' + key;
  const tr = typeof window !== 'undefined' && window.ccShellT ? window.ccShellT(k) : k;
  const v = tr !== k ? tr : (LABELS[dim] && LABELS[dim][key]) || key;
  return cap && v ? v[0].toLocaleUpperCase() + v.slice(1) : v;
}

export function describe(ctx) {
  return [label('os', ctx.os), label('browser', ctx.browser), ctx.input === 'touch' ? label('input', 'touch') : null, label('net', ctx.net)]
    .filter((x) => x && x !== 'undefined').join(', ');
}

/** Plain search over compiled topics: every word must appear; title hits rank first. */
export function search(topics, q) {
  const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const scored = [];
  for (const t of topics) {
    const title = t.title.toLowerCase();
    const head = (t.summary + ' ' + t.keywords.join(' ') + ' ' + t.headings.map((h) => h.text).join(' ')).toLowerCase();
    const body = t.text.toLowerCase();
    let score = 0, ok = true;
    for (const w of words) {
      if (title.includes(w)) score += 10;
      else if (head.includes(w)) score += 4;
      else if (body.includes(w)) score += 1;
      else { ok = false; break; }
    }
    if (ok) scored.push({ t, score: score + (t.scope === 'basics' ? 0 : 0.5) });
  }
  scored.sort((a, b) => b.score - a.score || a.t.title.localeCompare(b.t.title));
  return scored.map((s) => s.t);
}

/** A short excerpt of a topic's text around the first query word. */
export function excerpt(t, q, len = 140) {
  const text = t.text;
  const w = String(q || '').toLowerCase().split(/\s+/).filter(Boolean)[0];
  const at = w ? text.toLowerCase().indexOf(w) : -1;
  if (at < 0) return t.summary;
  const start = Math.max(0, at - 50);
  return (start > 0 ? '…' : '') + text.slice(start, start + len).trim() + (start + len < text.length ? '…' : '');
}
