/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-access.js — drafting and modelling without sight, the shared part (round 3, session shell_PART_3, EG.52; plan docs/spikes/access_PART_2.md;
 * map docs/apps/shell-modules.md § Access). Lifted from CadCraft's access-sound.js, access-voice.js and the live-region part of access-ui.js (rule 39: built
 * for every app and SuperCad Studio; CadCraft is the first host, not the owner). Loaded by app-shell.inc for a build whose manifest says "access": true
 * (AppBuilds::extras; dev builds only). Reads #cc-access {app, appName}. The pure parts are exported so Node tests them (bin/test-app-access.mjs).
 *
 *   window.ccAccess = {
 *     attach({ known, act, stage, lang }) → ccAccess      the app's adapter, all optional
 *        known(name) → boolean       is `name` a command (or an alias) of this app? lets spoken words become a command line
 *        act(result)                 what the app does with what was heard: result = matchSpoken's { kind: 'command'|'input'|'enter'|'cancel'|'undo'|'redo', text, rest? }
 *        stage                       the drawing's element: beep() pans by where the cursor is across it
 *        lang                        a function or string for the voice language ('en-US'); default the page's language
 *     say(text, { urgent, remember }) · repeat() · beep(kind, x) · on · sound · volume · voice · online    (the person's choices; one switch for every app)
 *     set({ on, sound, volume, voice, online })              the same as the Settings card; speaks the change
 *     voiceStart() → Promise<boolean> · voiceStop() · voiceMode() → Promise<'local'|'online'|'none'>
 *     earcons · EARCON_KINDS
 *   }
 * Apps that load before this module wait for it: `window.ccAccess ? go() : addEventListener('cc-access-ready', go, { once: true })`.
 *
 * What the shell does not do: no speech synthesis of its own (the person's screen reader speaks the live regions), no speech service of ours and no audio sent by
 * us (rule 35: voice runs only where the browser recognises on this computer; the browser maker's online service only after the person allows it by name),
 * no trained model. Off until the person turns it on (Settings › Global › Drafting without sight); with it off nothing here makes a sound or a sentence.
 * The choices are the person's, kept in this browser for every app (localStorage cc-access). Words: shell.access.* in assets/lang/shell.
 */

// ------------------------------------------------------------------ sounds (pure plan + Web Audio player)
const BASE = 440;
const semis = (n) => BASE * Math.pow(2, n / 12);

/** One plan per snap kind (and for grips, hits and refusals): pitch in Hz, wave, length in seconds. Ten snap kinds, ten different sounds. */
const PLAN = {
  end:   { hz: semis(7),   wave: 'square',   dur: 0.07 },
  mid:   { hz: semis(0),   wave: 'triangle', dur: 0.09 },
  cen:   { hz: semis(-12), wave: 'sine',     dur: 0.14 },
  quad:  { hz: semis(4),   wave: 'triangle', dur: 0.07 },
  int:   { hz: semis(12),  wave: 'square',   dur: 0.05, twice: true },
  perp:  { hz: semis(9),   wave: 'sine',     dur: 0.08 },
  tan:   { hz: semis(5),   wave: 'sine',     dur: 0.08 },
  near:  { hz: semis(-5),  wave: 'sine',     dur: 0.04 },
  node:  { hz: semis(14),  wave: 'sine',     dur: 0.06 },
  ins:   { hz: semis(2),   wave: 'sawtooth', dur: 0.08 },
  grip:  { hz: semis(16),  wave: 'square',   dur: 0.04, twice: true },
  object: { hz: semis(-7), wave: 'triangle', dur: 0.05 },   // the cursor came onto an object (no snap)
  click: { hz: semis(19),  wave: 'square',   dur: 0.03 },
  error: { hz: semis(-17), wave: 'sawtooth', dur: 0.18 },
  done:  { hz: semis(24),  wave: 'sine',     dur: 0.12 },
};

/** The sound plan for a kind, or null for a kind with none. pan −1 (left) … 1 (right) from `x` 0…1 across the drawing area. */
export function earcon(kind, x = 0.5) {
  const p = PLAN[kind];
  if (!p) return null;
  return { ...p, pan: Math.max(-1, Math.min(1, (Number.isFinite(x) ? x : 0.5) * 2 - 1)) };
}
export const EARCON_KINDS = Object.keys(PLAN);

/** Plays earcons. `enabled` and `volume` (0…1) are set by the page. A browser without Web Audio stays silent. Nothing is downloaded or sent: the sounds are made on the computer. */
export class Earcons {
  constructor() { this.enabled = false; this.volume = 0.25; this.ctx = null; this.last = { kind: '', at: 0 }; }
  _ctx() {
    if (this.ctx) return this.ctx;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    try { this.ctx = new AC(); } catch { this.ctx = null; }
    return this.ctx;
  }
  /** Play one. The same sound is not repeated within 60 ms, so a cursor moving over many snaps stays readable. */
  play(kind, x = 0.5) {
    if (!this.enabled) return false;
    const plan = earcon(kind, x), ctx = this._ctx();
    if (!plan || !ctx) return false;
    const now = performance.now();
    if (this.last.kind === kind && now - this.last.at < 60) return false;
    this.last = { kind, at: now };
    if (ctx.state === 'suspended') ctx.resume?.();
    const t0 = ctx.currentTime;
    for (let i = 0; i < (plan.twice ? 2 : 1); i++) {
      const o = ctx.createOscillator(), g = ctx.createGain(), start = t0 + i * (plan.dur + 0.03);
      o.type = plan.wave; o.frequency.value = plan.hz;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(this.volume, start + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, start + plan.dur);
      let tail = g;
      if (ctx.createStereoPanner) { const pn = ctx.createStereoPanner(); pn.pan.value = plan.pan; g.connect(pn); tail = pn; }
      o.connect(g); tail.connect(ctx.destination);
      o.start(start); o.stop(start + plan.dur + 0.02);
    }
    return true;
  }
}

// ------------------------------------------------------------------ voice (pure matching + the browser's recognition, local first)
const WORDS = {
  en: { zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 },
  es: { cero: 0, uno: 1, un: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, veinte: 20, treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900 },
};
const SCALE = { en: { hundred: 100, thousand: 1000 }, es: { cien: 100, ciento: 100, mil: 1000 } };
const MINUS = { en: ['minus', 'negative'], es: ['menos'] };
const POINT = { en: ['point'], es: ['punto', 'coma'] };
const CONNECT = { en: ['and'], es: ['y'] };

/** Spoken numbers to digits: "three hundred and fifty" → 350, "minus two point five" → -2.5. Returns null if it is not a number. English and Spanish; the other languages are Track LG's. */
export function spokenNumber(text, lang = 'en') {
  const L = lang.startsWith('es') ? 'es' : 'en';
  const w = String(text).toLowerCase().replace(/[,]/g, ' ').split(/\s+/).filter(Boolean);
  if (!w.length) return null;
  if (w.length === 1 && /^-?\d+(\.\d+)?$/.test(w[0])) return Number(w[0]);
  let neg = false, i = 0;
  if (MINUS[L].includes(w[0])) { neg = true; i = 1; }
  let total = 0, cur = 0, seen = false, frac = null;
  for (; i < w.length; i++) {
    const x = w[i];
    if (POINT[L].includes(x)) { frac = ''; continue; }
    if (frac !== null) {
      const d = WORDS[L][x] ?? (/^\d$/.test(x) ? Number(x) : undefined);
      if (d === undefined || d > 9) return null;
      frac += d; seen = true; continue;
    }
    if (CONNECT[L].includes(x)) continue;
    if (/^\d+$/.test(x)) { cur += Number(x); seen = true; continue; }
    if (x in WORDS[L]) { cur += WORDS[L][x]; seen = true; continue; }
    if (x in SCALE[L]) {
      const s = SCALE[L][x];
      if (s === 100) cur = (cur || 1) * 100; else { total += (cur || 1) * s; cur = 0; }
      seen = true; continue;
    }
    return null;
  }
  if (!seen) return null;
  const v = total + cur + (frac ? Number('0.' + frac) : 0);
  return neg ? -v : v;
}

/** Words that mean "press Enter", "cancel", "undo" and so on, per language. */
const KEYWORDS = {
  en: { enter: ['enter', 'done', 'accept', 'okay', 'ok'], cancel: ['cancel', 'escape', 'stop'], undo: ['undo'], redo: ['redo'], close: ['close'], last: ['last'] },
  es: { enter: ['intro', 'aceptar', 'listo', 'enter'], cancel: ['cancelar', 'escape', 'parar'], undo: ['deshacer'], redo: ['rehacer'], close: ['cerrar'], last: ['último', 'ultimo'] },
};

/**
 * What was heard → what to do. `known(name)` says whether a name is a command or an alias of the app.
 * → { kind: 'command'|'input'|'enter'|'cancel'|'undo'|'redo'|'none', text } — `text` is the line to run or type.
 * Coordinates by voice: "point three hundred comma four hundred", "distance twelve hundred", "angle forty five".
 */
export function matchSpoken(heard, known, lang = 'en') {
  const L = lang.startsWith('es') ? 'es' : 'en', K = KEYWORDS[L];
  const said = String(heard || '').trim().toLowerCase().replace(/[.!?]+$/g, '');
  if (!said) return { kind: 'none', text: '' };
  const first = said.split(/\s+/)[0];
  for (const kind of ['enter', 'cancel', 'undo', 'redo']) if (K[kind].includes(said)) return { kind, text: '' };
  const pt = said.match(L === 'es' ? /^(?:punto|coordenadas?)\s+(.+?)\s+(?:coma|y)\s+(.+)$/ : /^(?:point|coordinates?)\s+(.+?)\s+(?:comma|by)\s+(.+)$/);
  if (pt) { const a = spokenNumber(pt[1], L), b = spokenNumber(pt[2], L); if (a !== null && b !== null) return { kind: 'input', text: a + ',' + b }; }
  const ang = said.match(L === 'es' ? /^(?:ángulo|angulo)\s+(.+)$/ : /^angle\s+(.+)$/);
  if (ang) { const a = spokenNumber(ang[1], L); if (a !== null) return { kind: 'input', text: '<' + a }; }
  const dist = said.match(L === 'es' ? /^(?:distancia|longitud)\s+(.+)$/ : /^(?:distance|length)\s+(.+)$/);
  if (dist) { const a = spokenNumber(dist[1], L); if (a !== null) return { kind: 'input', text: String(a) }; }
  const n = spokenNumber(said, L);
  if (n !== null) return { kind: 'input', text: String(n) };
  const k = typeof known === 'function' ? known : () => false;
  if (k(said.replace(/\s+/g, ''))) return { kind: 'command', text: said.replace(/\s+/g, '') };
  if (k(first)) return { kind: 'command', text: first, rest: said.slice(first.length).trim() };
  return { kind: 'none', text: said };
}

/** Is speech recognition on this computer possible? → 'local' (no audio leaves it), 'online' (the browser's maker's service) or 'none'. */
export async function voiceMode(lang = 'en-US', g = globalThis) {
  const SR = g.SpeechRecognition || g.webkitSpeechRecognition;
  if (!SR) return 'none';
  try {
    if (typeof SR.available === 'function') {
      const r = await SR.available({ langs: [lang], processLocally: true });
      if (r === 'available' || r === 'downloadable' || r === true) return 'local';
    }
  } catch { /* fall through */ }
  return 'online';
}

/** Listens for commands. `onHeard(text)` gets each final phrase; the caller runs `matchSpoken`. Off until start(). `g` is the global with SpeechRecognition (tests pass a fake). */
export class Voice {
  constructor({ lang = 'en-US', allowOnline = false, onHeard, onState, g = globalThis } = {}) {
    Object.assign(this, { lang, allowOnline, onHeard, onState, g, rec: null, on: false });
  }
  async start() {
    const SR = this.g.SpeechRecognition || this.g.webkitSpeechRecognition;
    const mode = await voiceMode(this.lang, this.g);
    if (mode === 'none') { this.onState?.('unsupported'); return false; }
    if (mode === 'online' && !this.allowOnline) { this.onState?.('needs-online-ok'); return false; }
    const r = new SR();
    r.lang = this.lang; r.continuous = true; r.interimResults = false;
    if (mode === 'local') r.processLocally = true;
    r.onresult = (ev) => { for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) this.onHeard?.(ev.results[i][0].transcript); };
    r.onerror = (ev) => { this.onState?.('error:' + (ev.error || '')); if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') this.on = false; };
    r.onend = () => { if (this.on) { try { r.start(); } catch { this.on = false; this.onState?.('stopped'); } } else this.onState?.('stopped'); };
    this.rec = r; this.on = true;
    try { r.start(); } catch { this.on = false; this.onState?.('error:start'); return false; }
    this.onState?.(mode === 'local' ? 'listening-local' : 'listening-online');
    return true;
  }
  stop() { this.on = false; try { this.rec?.stop(); } catch { /* already stopped */ } }
}

// ------------------------------------------------------------------ the announcer (two live regions)
/** The same sentence is not said twice within `quietMs`: state = { text, at }. → the text to say, or '' to stay quiet. */
export function dedupe(state, text, now, quietMs = 800) {
  if (!text) return '';
  if (state.text === text && now - state.at < quietMs) return '';
  state.text = text; state.at = now;
  return text;
}

/**
 * Two live regions (polite, urgent) and one `say`. Lines said within `batchMs` go out as one message; `urgent` interrupts (errors, cancel). `enabled()` says whether
 * to speak at all (the person's switch). `doc` is the page's document (tests pass a small fake); the regions exist from the start, empty, so a screen reader has
 * registered them before the first sentence.
 */
export function createAnnouncer({ doc = globalThis.document, enabled = () => true, batchMs = 120, quietMs = 600, now = () => performance.now(), timers = globalThis } = {}) {
  const mk = (role, live) => { const e = doc.createElement('div'); e.className = 'visually-hidden'; e.setAttribute('role', role); e.setAttribute('aria-live', live); e.setAttribute('aria-atomic', 'true'); e.dataset.accessLive = live; return e; };
  const polite = mk('status', 'polite'), assertive = mk('alert', 'assertive');
  doc.body.append(polite, assertive);
  const A = { lastSaid: '', quiet: { text: '', at: 0 } };
  let buf = [], timer = 0;
  function say(text, { urgent = false, remember = true } = {}) {
    if (!enabled() || !text) return '';
    const s = dedupe(A.quiet, text, now(), quietMs);
    if (!s) return '';
    if (remember) A.lastSaid = s;
    if (urgent) { assertive.textContent = ''; timers.setTimeout(() => { assertive.textContent = s; }, 30); return s; }
    buf.push(s);
    timers.clearTimeout(timer);
    timer = timers.setTimeout(() => { const m = buf.join('. '); buf = []; polite.textContent = ''; timers.setTimeout(() => { polite.textContent = m; }, 30); }, batchMs);
    return s;
  }
  /** Say the last sentence again, even though it is the same. */
  function repeat() { if (!A.lastSaid) return ''; A.quiet.text = ''; return say(A.lastSaid, { remember: false }); }
  return { say, repeat, polite, assertive, get lastSaid() { return A.lastSaid; } };
}

// ------------------------------------------------------------------ the person's choices
export const PREF_KEY = 'cc-access';
export const DEFAULT_PREFS = { on: false, sound: false, volume: 0.25, voice: 'off', online: false };
/** Whatever is stored (or typed into a file) → a clean record. */
export function cleanPrefs(raw) {
  let o = raw;
  if (typeof raw === 'string') { try { o = JSON.parse(raw); } catch { o = null; } }
  const p = { ...DEFAULT_PREFS };
  if (!o || typeof o !== 'object') return p;
  p.on = o.on === true; p.sound = o.sound === true; p.online = o.online === true;
  p.voice = o.voice === 'on' ? 'on' : 'off';
  const v = Number(o.volume);
  if (Number.isFinite(v)) p.volume = Math.max(0, Math.min(1, v));
  return p;
}


// ------------------------------------------------------------------ the keyboard explorer (round 3, session access_PART_3: the same cursor in every app)
const NICE = [1, 2, 5];
/** A step for the arrow keys: about 1/100 of what the view shows, rounded to 1, 2 or 5 × 10ⁿ. */
export function niceStep(span) {
  const raw = Math.max(Number(span) / 100 || 0, 1e-9), mag = Math.pow(10, Math.floor(Math.log10(raw)));
  return (NICE.slice().reverse().find((n) => n * mag <= raw * 1.0001) || 1) * mag;
}
/** The eight directions: 0 right, 1 up-right, 2 up, 3 up-left, 4 left, 5 down-left, 6 down, 7 down-right (up is +y unless `yUp` is false). */
export function dirIndex(dx, dy, yUp = true) {
  const a = Math.atan2(yUp ? dy : -dy, dx);
  return ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
}
/**
 * The things of the view nearest to p, nearest first. items = [{id, label, x, y, kind?, snap?}] in the app's own units.
 * → [{item, d, dx, dy, dir}] (at most `n`, none farther than `radius`).
 */
export function nearestItems(items, p, { radius = Infinity, n = 5, yUp = true } = {}) {
  const out = [];
  for (const item of items || []) {
    if (!item || !Number.isFinite(item.x) || !Number.isFinite(item.y)) continue;
    const dx = item.x - p.x, dy = item.y - p.y, d = Math.hypot(dx, dy);
    if (d <= radius) out.push({ item, d, dx, dy, dir: dirIndex(dx, dy, yUp) });
  }
  out.sort((a, b) => a.d - b.d || String(a.item.id).localeCompare(String(b.item.id)));
  return out.slice(0, n);
}
/** "Cursor at …. Near it: A, 3 m away, to the left; B …" or "Nothing within …". T(key, vars) and fmt(number) come from the page. */
export function sayNearby(entries, p, { T, fmt, radius, at }) {
  const where = at || T('shell.access.kit.point', { x: fmt(p.x), y: fmt(p.y) });
  if (!entries.length) return T('shell.access.kit.near.none', { at: where, r: fmt(radius) });
  const items = entries.map((e) => e.d < 1e-9 ? T('shell.access.kit.near.on', { what: e.item.label }) : T('shell.access.kit.near.item', { what: e.item.label, d: fmt(e.d), dir: T('shell.access.kit.dir.' + e.dir) })).join('; ');
  return T('shell.access.kit.near', { at: where, items });
}
/** A sentence for a move from `base` to p ("12 away, to the right"), or '' when they are the same place. */
export function sayMove(base, p, { T, fmt, yUp = true }) {
  if (!base) return '';
  const dx = p.x - base.x, dy = p.y - base.y, d = Math.hypot(dx, dy);
  if (d < 1e-9) return T('shell.access.kit.move.none');
  return T('shell.access.kit.move', { d: fmt(d), dir: T('shell.access.kit.dir.' + dirIndex(dx, dy, yUp)) });
}

// ------------------------------------------------------------------ the page
const cfg = (() => { try { return typeof document === 'undefined' ? null : JSON.parse(document.getElementById('cc-access')?.textContent || 'null'); } catch (e) { return null; } })();
if (cfg && cfg.app && typeof window !== 'undefined' && !window.ccAccess) boot();

function boot() {
  const T = (k, v) => (window.ccShellT ? window.ccShellT(k, v) : k);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window: this page keeps it */ } },
  };
  let P = cleanPrefs(store.get(PREF_KEY));
  let adapter = { known: null, act: null, stage: null, lang: null };
  const earcons = new Earcons();
  const sync = () => { earcons.enabled = P.on && P.sound; earcons.volume = P.volume; };
  sync();
  const ann = createAnnouncer({ enabled: () => P.on });
  const lang = () => { const l = typeof adapter.lang === 'function' ? adapter.lang() : adapter.lang; return l || document.documentElement.lang || 'en-US'; };
  let voice = null, voiceNote = '';

  const say = (text, o) => ann.say(text, o);
  function stageX(x) {
    if (Number.isFinite(x)) return x;
    return 0.5;
  }
  const beep = (kind, x) => { if (P.on && P.sound) earcons.play(kind, stageX(x)); };

  function heard(text) {
    const r = matchSpoken(text, adapter.known, lang());
    if (r.kind === 'none') { say(T('shell.access.voice.unknown', { heard: text })); beep('error'); return; }
    say(T('shell.access.voice.heard', { heard: text }));
    try { adapter.act?.(r); } catch (e) { say(T('shell.access.voice.failed'), { urgent: true }); }
  }
  async function voiceStart() {
    if (voice?.on) return true;
    if (!P.on) return false;
    if (!adapter.act) { voiceNote = 'noadapter'; say(T('shell.access.voice.state.noadapter')); render(); return false; }
    voice = new Voice({ lang: lang(), allowOnline: P.online, onHeard: heard, onState: (s) => {
      voiceNote = s.startsWith('error') ? 'error' : s;
      say(T('shell.access.voice.state.' + voiceNote.replace(/-/g, '_')));
      render();
    } });
    const ok = await voice.start();
    render();
    return ok;
  }
  function voiceStop() { voice?.stop(); voice = null; }

  function save() { store.set(PREF_KEY, JSON.stringify(P)); }
  /** Change the person's choices (the Settings card, or an app's command), speak what changed and keep the record. */
  function set(o = {}) {
    const before = P;
    P = cleanPrefs({ ...P, ...o });
    sync(); save();
    if (!before.on && P.on) say(T('shell.access.said.on'));
    if (before.on && !P.on) { voiceStop(); }
    else if (P.on) {
      if (before.sound !== P.sound) say(T(P.sound ? 'shell.access.said.sound.on' : 'shell.access.said.sound.off'));
      if (before.voice !== P.voice) { if (P.voice === 'on') voiceStart(); else { voiceStop(); say(T('shell.access.voice.state.stopped')); } }
      if (before.online !== P.online && voice) { voiceStop(); if (P.voice === 'on') voiceStart(); }
    }
    document.documentElement.toggleAttribute('data-cc-access', P.on);
    for (const m of mounts) m.apply();
    document.dispatchEvent(new CustomEvent('cc-access-change', { detail: { ...P } }));
    render();
    return P;
  }

  // ---- Settings › Global › Drafting without sight (the card in app-settings.inc; one switch for every app)
  const box = document.querySelector('[data-access-settings]');
  function h(tag, attrs = {}, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) { if (v === false || v == null) continue; if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : String(v)); }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    return e;
  }
  function render() {
    if (!box) return;
    const focused = document.activeElement && box.contains(document.activeElement) ? document.activeElement.getAttribute('data-k') : '';
    const check = (k, label, on, hint) => h('label', { class: 'shell-check' }, h('input', { type: 'checkbox', 'data-k': k, checked: on ? true : null, disabled: k !== 'on' && !P.on ? true : null, onchange: (e) => set({ [k]: e.target.checked ? (k === 'voice' ? 'on' : true) : (k === 'voice' ? 'off' : false) }) }), ' ', label, hint ? h('span', { class: 'shell-hint-text', text: ' ' + hint }) : null);
    const state = voiceNote ? T('shell.access.voice.state.' + voiceNote.replace(/-/g, '_')) : '';
    box.replaceChildren(
      h('p', { class: 'shell-hint-text', text: T('shell.access.hint') }),
      check('on', T('shell.access.on'), P.on),
      check('sound', T('shell.access.sound'), P.sound),
      h('div', { class: 'shell-row' }, h('label', { for: 'cc-access-vol', text: T('shell.access.volume') }),
        h('input', { id: 'cc-access-vol', type: 'range', min: '0', max: '1', step: '0.05', value: String(P.volume), 'data-k': 'volume', disabled: !P.on ? true : null,
          onchange: (e) => set({ volume: Number(e.target.value) }) })),
      check('voice', T('shell.access.voice'), P.voice === 'on'),
      check('online', T('shell.access.online'), P.online),
      h('p', { class: 'shell-hint-text', 'aria-live': 'polite', 'data-access-state': true, text: state }),
    );
    if (focused) box.querySelector('[data-k="' + focused + '"]')?.focus();
  }
  window.addEventListener('storage', (e) => { if (e.key === PREF_KEY) { P = cleanPrefs(e.newValue); sync(); document.documentElement.toggleAttribute('data-cc-access', P.on); if (!P.on) voiceStop(); for (const m of mounts) m.apply(); document.dispatchEvent(new CustomEvent('cc-access-change', { detail: { ...P } })); render(); } });
  document.documentElement.toggleAttribute('data-cc-access', P.on);
  render();


  // ---- the keyboard explorer: one cursor, the same keys, in every app. The app hands over what it has; the cursor, the keys and the sentences are shared.
  //   ccAccess.mount({ stage, label, span, items, fmt, yUp, here, describe, selection, snap, pick, enter, slash, cursor, onCursor })
  //     stage      the element that takes the keys (becomes a focusable `application` region while Access is on)
  //     label      its name for the screen reader (string or function)
  //     span()     how wide the view is, in the app's units: the arrow keys step about 1/100 of it
  //     items()    [{id, label, x, y, kind?}] the things of the view, in the app's units; Tab steps through them nearest first, N lists the nearest
  //     fmt(v)     a length in words ("3.2 m"); default two decimals
  //     here(p)    optional: what to say for a cursor place with nothing near it (default "x …, y …")
  //     describe() the whole view in words (key D) · selection() what is selected (key S)
  //     snap(p)    optional: {kind, x, y, label} when p is on a snap point: its sound and words
  //     pick(p, item)  Enter · enter()  Space (accept / finish)  · slash()  the key for the command line, if the app has one
  //     walk()     optional, for an app with no plane to move over (a feature tree, a schedule, a list of members): [{id, label}] in order. The arrow keys and Tab
  //                step through it, Home and End jump, Enter picks the one you are on: pick(null, item). items/span/snap are not needed then.
  //     keys       optional: { '[': ({shift, cursor, put, step}) => text | undefined } extra keys of the app (say what they list in keysHelp, a string or function)
  //     cursor()   optional: where the app's own cursor is (default the kit's)  · onCursor(p)  move the app's own cursor there
  const mounts = [];
  function mount(o = {}) {
    const M = { o, p: null, tabs: null, tabAt: -1, last: '', at: -1 };
    const fmt = (v) => (o.fmt ? o.fmt(v) : String(Math.round(v * 100) / 100));
    const yUp = o.yUp !== false;
    const span = () => Number(o.span ? o.span() : 100) || 100;
    const items = () => (o.items ? o.items() : []) || [];
    const start = () => M.p || o.cursor?.() || { x: 0, y: 0 };
    const hereText = (p) => (o.here ? o.here(p) : T('shell.access.kit.point', { x: fmt(p.x), y: fmt(p.y) }));
    function words(p) {
      const sn = o.snap?.(p);
      if (sn) { beep(sn.kind || 'end'); return sn.label || ''; }
      const near = nearestItems(items(), p, { radius: span() / 80, n: 1, yUp })[0];
      if (near) { beep('object'); return near.item.label; }
      return '';
    }
    function put(p, { full = true } = {}) {
      M.p = p; o.onCursor?.(p);
      const w = words(p);
      say(w ? w + '. ' + hereText(p) : hereText(p));
    }
    function tabs() {
      if (!M.tabs) { M.tabs = nearestItems(items(), start(), { n: 12, yUp }); M.tabAt = -1; }
      return M.tabs;
    }
    const KEYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    function onKey(e) {
      if (!P.on || e.altKey || e.metaKey) return;
      const k = e.key, lower = k.length === 1 ? k.toLowerCase() : k;
      let handled = true, keepTabs = false;
      const list = o.walk ? o.walk() || [] : null;
      if (list && (k in KEYS || k === 'Tab' || k === 'Home' || k === 'End')) {
        if (!list.length) say(T('shell.access.kit.walk.none'));
        else {
          const back = k === 'ArrowUp' || k === 'ArrowLeft' || (k === 'Tab' && e.shiftKey);
          if (k === 'Home') M.at = 0; else if (k === 'End') M.at = list.length - 1;
          else M.at = M.at < 0 ? (back ? list.length - 1 : 0) : Math.max(0, Math.min(list.length - 1, M.at + (back ? -1 : 1)));
          if (M.at >= list.length) M.at = list.length - 1;
          beep(list[M.at].kind || 'object');
          o.onWalk?.(list[M.at]);
          say(T('shell.access.kit.walk.at', { what: String(list[M.at].label).replace(/[.\s]+$/, ''), i: M.at + 1, n: list.length }));
        }
      } else if (list && k === 'Enter') {
        const it = list[M.at] || null; beep('click');
        if (o.pick) o.pick(null, it); else say(it ? it.label : T('shell.access.kit.nothing_here'));
      } else if (list && lower === 'w') say(list[M.at] ? T('shell.access.kit.walk.at', { what: String(list[M.at].label).replace(/[.\s]+$/, ''), i: M.at + 1, n: list.length }) : T('shell.access.kit.walk.none'));
      else if (list && lower === 'n') say(list.length ? [M.at - 1, M.at + 1].filter((i) => i >= 0 && i < list.length).map((i) => (i < M.at ? T('shell.access.kit.walk.before', { what: list[i].label }) : T('shell.access.kit.walk.after', { what: list[i].label }))).join('. ') || T('shell.access.kit.walk.only') : T('shell.access.kit.walk.none'));
      else if (KEYS[k]) {
        const step = niceStep(span()) * (e.shiftKey ? 10 : e.ctrlKey ? 0.1 : 1), c = start(), d = KEYS[k];
        put({ x: c.x + d[0] * step, y: c.y + d[1] * (yUp ? step : -step) });
      } else if (k === 'Enter') {
        const c = start(), it = nearestItems(items(), c, { radius: span() / 80, n: 1, yUp })[0]?.item || null;
        beep('click');
        if (o.pick) o.pick(c, it); else say(it ? it.label : T('shell.access.kit.nothing_here'));
      } else if (k === ' ') { if (o.enter) o.enter(); else handled = false; }
      else if (k === 'Tab') {
        const list = tabs();
        if (!list.length) say(T('shell.access.kit.nothing_near'));
        else { M.tabAt = (M.tabAt + (e.shiftKey ? -1 : 1) + list.length) % list.length; const it = list[M.tabAt].item; put({ x: it.x, y: it.y }); keepTabs = true; }
      } else if (lower === 'd') say(o.describe ? o.describe() : T('shell.access.kit.nothing_to_describe'));
      else if (lower === 'w') say(words2(start()));
      else if (lower === 'n') say(sayNearby(nearestItems(items(), start(), { radius: span() / 8, n: 5, yUp }), start(), { T, fmt, radius: span() / 8 }));
      else if (lower === 's') say(o.selection ? o.selection() : T('shell.access.kit.nothing_selected'));
      else if (lower === 'r') ann.repeat();
      else if (lower === 'v') set({ voice: P.voice === 'on' ? 'off' : 'on' });
      else if (k === '/' && o.slash) { o.slash(); say(T('shell.access.kit.at_command_line')); }
      else if (k === '?') say(T('shell.access.kit.keys') + (o.keysHelp ? ' ' + (typeof o.keysHelp === 'function' ? o.keysHelp() : o.keysHelp) : ''));
      else if (o.keys && o.keys[k]) { const r = o.keys[k]({ shift: e.shiftKey, cursor: start(), put, step: niceStep(span()) }); if (r) say(r); }
      else handled = false;
      if (handled) { e.preventDefault(); e.stopPropagation(); if (!keepTabs) M.tabs = null; }
    }
    const words2 = hereText;
    const orig = o.stage ? { label: o.stage.getAttribute('aria-label'), tab: o.stage.getAttribute('tabindex'), role: o.stage.getAttribute('role') } : {};
    const put1 = (el, name, v) => { if (v == null) el.removeAttribute(name); else el.setAttribute(name, v); };
    M.apply = () => {
      const s = o.stage;
      if (!s) return;
      if (P.on) { s.setAttribute('tabindex', '0'); s.setAttribute('role', 'application'); s.setAttribute('aria-label', (typeof o.label === 'function' ? o.label() : o.label) || T('shell.access.kit.stage')); }
      else { put1(s, 'role', orig.role); put1(s, 'aria-label', orig.label); put1(s, 'tabindex', orig.tab); }
    };
    o.stage?.addEventListener('keydown', onKey);
    o.stage?.addEventListener('focus', () => { if (P.on) { M.tabs = null; say(o.walk ? ((typeof o.label === 'function' ? o.label() : o.label) || T('shell.access.kit.stage')) : T('shell.access.kit.focus')); } });
    M.say = say; M.put = put;
    mounts.push(M);
    M.apply();
    return { put, apply: M.apply, cursor: start, refresh: () => { M.tabs = null; }, current: () => (o.walk ? (o.walk() || [])[M.at] || null : null), goTo: (id) => { const l = o.walk ? o.walk() || [] : []; const i = l.findIndex((x) => x.id === id); if (i >= 0) M.at = i; } };
  }
  // follow(el): speak what an element's text becomes (a status bar, a results panel). Quiet while Access is off; the same words are not said twice in a row.
  function follow(el, o = {}) {
    if (!el || typeof MutationObserver === 'undefined') return () => {};
    let last = '';
    const read = () => {
      if (!P.on) return;
      const s = String(o.text ? o.text(el) : el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, o.max || 300);
      if (!s || s === last) return;
      last = s;
      say((o.prefix ? o.prefix + ' ' : '') + s, { urgent: !!(o.urgent && o.urgent(s)) });
    };
    // an element that is a live region itself would be read twice: Access reads it, so its own region is switched off while Access is on
    const live = el.getAttribute('aria-live');
    const entry = { apply: () => { if (live && live !== 'off') el.setAttribute('aria-live', P.on ? 'off' : live); } };
    mounts.push(entry); entry.apply();
    const mo = new MutationObserver(read);
    mo.observe(el, { childList: true, characterData: true, subtree: true });
    return () => { mo.disconnect(); if (live) el.setAttribute('aria-live', live); const i = mounts.indexOf(entry); if (i >= 0) mounts.splice(i, 1); };
  }

  window.ccAccess = {
    mount, follow,
    attach(a = {}) { adapter = { ...adapter, ...a }; if (P.on && P.voice === 'on') voiceStart(); return window.ccAccess; },
    say, repeat: () => ann.repeat(), beep, set,
    get on() { return P.on; }, get sound() { return P.sound; }, get volume() { return P.volume; }, get voice() { return P.voice; }, get online() { return P.online; },
    voiceStart, voiceStop, voiceMode: () => voiceMode(lang()),
    earcons, EARCON_KINDS, state: () => ({ ...P, listening: !!voice?.on, note: voiceNote, lastSaid: ann.lastSaid }),
  };
  document.dispatchEvent(new CustomEvent('cc-access-ready'));
}
