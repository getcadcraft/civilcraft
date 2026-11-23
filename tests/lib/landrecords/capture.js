/* SPDX-License-Identifier: Apache-2.0 */
/**
 * capture.js — the device side of a field walk (0.11 LR.2): the position from the browser, a button that can be pressed without looking
 * (on the screen, on a watch, on a headset, on a clicker), the screen kept awake, and a buzz, a beep and a spoken count in answer.
 * Browser only, but everything it touches comes in through `env` (window by default), so the tests drive it with stand-ins.
 *
 * NOTHING IS SENT ANYWHERE. The position is read by this page from the device and stays in this page until the person saves it.
 *
 * HOW A WATCH PRESSES THE BUTTON. A web page cannot run on a watch. But a watch (and a headset, and a car) shows the media buttons of
 * whatever the phone is "playing", and the browser hands those presses to the page (the Media Session API). While the walk is armed the page
 * plays ten seconds of silence in a loop under the title "Field walk: N points", so play / pause / next on the wrist is the Mark button and
 * previous is Undo. A Bluetooth page-turner or presenter is simpler still: it types Page Down or Enter.
 *
 *   makeCapture({ env, onFix(fix), onError(code), onButton('mark' | 'undo'), keepS }) → {
 *     supported: { position, media, wake, buzz, speech },
 *     start() / stop()                    watch the position (high accuracy); every fix is cleaned, kept keepS seconds, and handed to onFix
 *     push(fix)                           a fix from elsewhere (the tests, a simulated walk)
 *     last() → fix | null · recent(seconds) → [fix] · age() → seconds since the last fix | Infinity
 *     arm({ media, keys, title }) → { media: bool, keys: bool } / disarm()      call from a click: a browser starts sound only on a press
 *     title(text)                         what the watch shows
 *     awake(on) → Promise<bool>           the screen kept on (released by the browser when the page is hidden; asked again when it shows)
 *     answer(kind: 'mark' | 'undo' | 'refuse', say?)   buzz + beep + the words spoken, each only where the device has it
 *   }
 *   onError codes: 'unsupported' | 'denied' | 'unavailable' | 'timeout' | 'insecure'
 *   silenceUrl(env, seconds) → a blob: URL of a silent WAV (8 kHz, 8 bit)   MARK_KEYS · UNDO_KEYS
 */
import { cleanFix } from './clean.js';

export const MARK_KEYS = ['Enter', ' ', 'PageDown', 'ArrowRight', 'MediaPlayPause', 'MediaTrackNext'];
export const UNDO_KEYS = ['PageUp', 'ArrowLeft', 'MediaTrackPrevious'];

export function silenceUrl(env, seconds = 10) {
  const rate = 8000, n = rate * seconds, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
  const put = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  put(0, 'RIFF'); v.setUint32(4, 36 + n, true); put(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); put(36, 'data'); v.setUint32(40, n, true);
  new Uint8Array(buf, 44).fill(128);   // 8-bit PCM: 128 is silence
  return env.URL.createObjectURL(new env.Blob([buf], { type: 'audio/wav' }));
}

export function makeCapture({ env = globalThis, onFix = () => {}, onError = () => {}, onButton = () => {}, keepS = 60 } = {}) {
  const nav = env.navigator || {}, doc = env.document;
  const supported = {
    position: !!(nav.geolocation && nav.geolocation.watchPosition), media: !!nav.mediaSession, wake: !!(nav.wakeLock && nav.wakeLock.request),
    buzz: typeof nav.vibrate === 'function', speech: !!(env.speechSynthesis && env.SpeechSynthesisUtterance),
  };
  let watch = null, fixes = [], audio = null, audioUrl = null, lock = null, wantAwake = false, keys = null, lastPress = 0, tone = null;
  const now = () => (env.Date || Date).now();

  function push(raw) {
    const f = cleanFix(raw); if (!f) return null;
    if (!f.t) f.t = now();
    fixes.push(f);
    const cut = f.t - keepS * 1000; while (fixes.length > 1 && fixes[0].t < cut) fixes.shift();
    if (fixes.length > 600) fixes = fixes.slice(-600);
    onFix(f); return f;
  }
  function start() {
    if (watch !== null) return true;
    if (env.isSecureContext === false) { onError('insecure'); return false; }
    if (!supported.position) { onError('unsupported'); return false; }
    watch = nav.geolocation.watchPosition(
      (pos) => { const c = pos.coords || {}; push({ lat: c.latitude, lon: c.longitude, acc: c.accuracy, alt: c.altitude, t: pos.timestamp }); },
      (err) => onError(err && err.code === 1 ? 'denied' : err && err.code === 3 ? 'timeout' : 'unavailable'),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
    return true;
  }
  function stop() { if (watch !== null) { try { nav.geolocation.clearWatch(watch); } catch { /* gone already */ } watch = null; } }

  // one press is one press: a watch that sends pause and then play for a single tap must not make two points
  const press = (what) => { const t = now(); if (t - lastPress < 700) return; lastPress = t; onButton(what); };
  function arm({ media = true, keys: wantKeys = true, title: text = '' } = {}) {
    const got = { media: false, keys: false };
    if (wantKeys && doc && !keys) {
      keys = (e) => {
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) return;   // typing a code is not a press
        if ((tag === 'BUTTON' || tag === 'A') && (e.key === 'Enter' || e.key === ' ')) return;   // that key presses the button it is on
        if (MARK_KEYS.includes(e.key)) { e.preventDefault(); press('mark'); } else if (UNDO_KEYS.includes(e.key)) { e.preventDefault(); press('undo'); }
      };
      doc.addEventListener('keydown', keys, true);
    }
    got.keys = !!keys;
    if (media && supported.media && env.Audio) {
      try {
        if (!audio) { audioUrl = silenceUrl(env, 10); audio = new env.Audio(audioUrl); audio.loop = true; }
        const again = () => { try { const p = audio.play(); if (p && p.catch) p.catch(() => {}); nav.mediaSession.playbackState = 'playing'; } catch { /* the browser said no */ } };
        const mark = () => { press('mark'); again(); }, undo = () => { press('undo'); again(); };
        for (const [a, fn] of [['play', mark], ['pause', mark], ['nexttrack', mark], ['previoustrack', undo], ['stop', mark]]) { try { nav.mediaSession.setActionHandler(a, fn); } catch { /* an action this browser does not have */ } }
        again(); title(text); got.media = true;
      } catch { got.media = false; }
    }
    return got;
  }
  function disarm() {
    if (keys && doc) { doc.removeEventListener('keydown', keys, true); keys = null; }
    if (supported.media) for (const a of ['play', 'pause', 'nexttrack', 'previoustrack', 'stop']) { try { nav.mediaSession.setActionHandler(a, null); } catch { /* not there */ } }
    if (audio) { try { audio.pause(); } catch { /* not playing */ } audio = null; }
    if (audioUrl) { try { env.URL.revokeObjectURL(audioUrl); } catch { /* gone */ } audioUrl = null; }
  }
  function title(text) {
    if (!supported.media || !env.MediaMetadata) return;
    try { nav.mediaSession.metadata = new env.MediaMetadata({ title: String(text || 'Field walk').slice(0, 80), artist: 'CadCraft', album: 'Field walk' }); } catch { /* no metadata here */ }
  }

  async function awake(on) {
    wantAwake = !!on;
    if (!supported.wake) return false;
    try {
      if (on && !lock) { lock = await nav.wakeLock.request('screen'); if (lock && lock.addEventListener) lock.addEventListener('release', () => { lock = null; }); }
      else if (!on && lock) { await lock.release(); lock = null; }
      return !!lock;
    } catch { lock = null; return false; }
  }
  const onShow = () => { if (wantAwake && doc && doc.visibilityState === 'visible' && !lock) awake(true); };
  if (doc && doc.addEventListener) doc.addEventListener('visibilitychange', onShow);

  function beep(freq, ms) {
    const AC = env.AudioContext || env.webkitAudioContext; if (!AC) return;
    try {
      tone = tone || new AC();
      const o = tone.createOscillator(), g = tone.createGain();
      o.frequency.value = freq; g.gain.value = 0.15; o.connect(g); g.connect(tone.destination);
      o.start(); o.stop(tone.currentTime + ms / 1000);
    } catch { /* no sound: the buzz and the screen still answer */ }
  }
  function answer(kind, say = '') {
    if (supported.buzz) { try { nav.vibrate(kind === 'mark' ? 120 : kind === 'undo' ? [60, 60, 60] : [300, 100, 300]); } catch { /* not allowed */ } }
    beep(kind === 'mark' ? 880 : kind === 'undo' ? 440 : 220, kind === 'refuse' ? 400 : 140);
    if (say && supported.speech) { try { env.speechSynthesis.cancel(); env.speechSynthesis.speak(new env.SpeechSynthesisUtterance(String(say).slice(0, 120))); } catch { /* no voice */ } }
  }

  return {
    supported, start, stop, push, arm, disarm, title, awake, answer,
    last: () => fixes[fixes.length - 1] || null,
    recent: (seconds) => { const l = fixes[fixes.length - 1]; if (!l) return []; const cut = l.t - seconds * 1000; return fixes.filter((f) => f.t >= cut); },
    age: () => { const l = fixes[fixes.length - 1]; return l ? (now() - l.t) / 1000 : Infinity; },
    end() { stop(); disarm(); awake(false); if (doc && doc.removeEventListener) doc.removeEventListener('visibilitychange', onShow); if (tone && tone.close) { try { tone.close(); } catch { /* closed */ } tone = null; } },
  };
}
