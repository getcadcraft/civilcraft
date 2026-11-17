/* SPDX-License-Identifier: Apache-2.0 */
/*
 * app-about.js — "About <app>" (core/components/app-about.inc): name, edition, version, link home, and "Report a problem" with
 * screenshots. Opens from any [data-about-open] button or window event 'cc-about-open' (the Help panel and the Vector Help menu
 * use these). The report is the /support form posted by script (the drawing is never reloaded); the site's own answer line
 * ("Done." / "Problem:") is shown in the dialog. Screenshots: choose, drag onto the box, or paste.
 * Browser editions served as static files (data-site on the help panel) cannot post a form: the dialog then links to the site.
 */
const T = (k, v) => (window.ccShellT ? window.ccShellT(k, v) : k);
const dlg = document.querySelector('[data-about]');
if (dlg) {
  const $ = (s) => dlg.querySelector(s);
  const form = $('[data-about-form]'), status = $('[data-about-status]'), files = $('[data-about-files]'), thumbs = $('[data-about-thumbs]');
  const SITE = ((document.querySelector('[data-help-panel]') || { dataset: {} }).dataset.site || '').replace(/\/+$/, '');
  const MAX = 3, TYPES = ['image/png', 'image/jpeg'];
  let list = [], returnFocus = null, sending = false;

  // the logo mark: the app bar's own (one source for the brand)
  const mark = document.querySelector('.app-bar-mark');
  if (mark && $('[data-about-mark]')) $('[data-about-mark]').append(...[...mark.cloneNode(true).childNodes]);

  // edition: the page says (window.ccEdition, or #cc-edition's "edition"); the browser is "Web"
  const edition = () => {
    let e = window.ccEdition;
    try { if (!e) e = JSON.parse(document.getElementById('cc-edition')?.textContent || 'null')?.edition; } catch (_) {}
    e = String(e || 'web').toLowerCase();
    const k = 'shell.about.edition.' + (/studio|desktop/.test(e) ? 'studio' : /ios|ipad|iphone|android|mobile/.test(e) ? 'mobile' : 'web');
    return T(k);
  };
  const facts = () => ({ app: dlg.querySelector('[data-about-facts] dd')?.textContent.trim() || dlg.dataset.app, edition: edition(), version: $('[data-about-version]')?.textContent.trim() || '' });

  if (SITE) {   // static edition: links reach the site; no form
    for (const a of dlg.querySelectorAll('[data-about-site]')) a.setAttribute('href', SITE + (a.getAttribute('href') === '/' ? '/' : a.getAttribute('href')));
    form.hidden = true; $('[data-about-offline]').hidden = false;
  }

  const say = (msg, bad) => { status.hidden = !msg; status.textContent = msg || ''; status.dataset.state = bad ? 'error' : 'ok'; if (followed) followed.hidden = true; };

  // BK.148 (lab builds): the report written from this window's history (window.ccAssist, app-ai-assist.js): the steps the person took, the
  // version, and a model excerpt only when they tick it. Such a report goes through the one intake (/api/suggest), where they can follow it.
  const assistBox = $('[data-about-assist]'), stepsOn = $('[data-about-steps]'), excerptOn = $('[data-about-excerpt]'), followed = $('[data-about-followed]');
  const assist = () => (assistBox && window.ccAssist && typeof window.ccAssist.reportParts === 'function' ? window.ccAssist : null);
  const wantsAssist = () => !!assist() && ((stepsOn && stepsOn.checked) || (excerptOn && excerptOn.checked));
  function preview() {
    const a = assist();
    if (assistBox) assistBox.hidden = !a;
    if (!a) return;
    const p = a.reportParts({ what: '', steps: true, excerpt: false }).preview;
    const sv = $('[data-about-steps-view]'), ev = $('[data-about-excerpt-view]');
    if (sv) sv.textContent = p.steps;
    if (ev) ev.textContent = p.excerpt;
  }
  async function sendToIntake(text) {
    const parts = assist().reportParts({ what: text, steps: !!(stepsOn && stepsOn.checked), excerpt: !!(excerptOn && excerptOn.checked) });
    const fd = new FormData();
    for (const name of ['_csrf', 'website']) { const el = form.querySelector('[name="' + name + '"]'); if (el) fd.set(name, el.value); }
    fd.set('form_id', 'sg'); fd.set('return', '/suggest'); fd.set('confirm_new', '1');
    fd.set('tool_name', parts.title); fd.set('why', parts.body); fd.set('email', form.email.value.trim()); fd.set('app', dlg.dataset.app || '');
    if (parts.file) { fd.set('share_file', parts.file, parts.file.name); fd.set('share_days', '14'); fd.set('share_agree', '1'); }   // ticked = the consent the box states
    const r = await fetch('/api/suggest', { method: 'POST', body: fd, credentials: 'same-origin' });
    const url = new URL(r.url, location.href);
    if (r.redirected && url.pathname === '/suggest-sent') return { ok: true, url: url.pathname + url.search };   // the intake sends people there only once the submission is saved
    const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
    return { ok: false, message: doc.querySelector('.field-error, .flash p')?.textContent.trim() || '' };
  }
  const draw = () => {
    thumbs.replaceChildren(...list.map((f, i) => {
      const li = document.createElement('li'), img = document.createElement('img'), b = document.createElement('button');
      img.alt = f.name; img.src = URL.createObjectURL(f); img.onload = () => URL.revokeObjectURL(img.src);
      b.type = 'button'; b.className = 'about-x'; b.setAttribute('aria-label', T('shell.about.shots.remove', { name: f.name })); b.textContent = '×';
      b.onclick = () => { list.splice(i, 1); sync(); };
      li.append(img, b); return li;
    }));
  };
  function sync() {   // the file input carries exactly the chosen list
    if (!files) return;
    const dt = new DataTransfer(); for (const f of list) dt.items.add(f); files.files = dt.files; draw();
  }
  function take(fs) {
    for (const f of fs) {
      if (!TYPES.includes(f.type)) { say(T('shell.about.shots.type'), true); continue; }
      if (list.length >= MAX) { say(T('shell.about.shots.max', { n: MAX }), true); break; }
      list.push(f.name ? f : new File([f], 'screenshot-' + (list.length + 1) + (f.type === 'image/jpeg' ? '.jpg' : '.png'), { type: f.type }));
    }
    sync();
  }
  files?.addEventListener('change', () => { const fs = [...files.files]; list = []; say(''); take(fs); });
  const drop = $('[data-about-drop]');
  drop?.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop?.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop?.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); say(''); take([...e.dataTransfer.files]); });
  dlg.addEventListener('paste', (e) => { const fs = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith('image/')); if (fs.length) { e.preventDefault(); say(''); take(fs); } });

  // send: the visible text + the facts become the message (the /support form's one "message" field). The form is posted by script (the
  // same /api/contact the support page posts to), the redirect is followed and the site's own answer line is shown here: the drawing
  // is never reloaded, and no frame is needed (PartCraft's isolated page refuses frames).
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    const text = $('[data-about-text]').value.trim();
    if (!text || !form.name.value.trim() || !form.email.value.trim()) { say(T('shell.about.need'), true); return; }
    if (wantsAssist()) {
      sending = true; $('[data-about-send]').disabled = true; say(T('shell.about.sending'));
      let res = { ok: false, message: '' };
      try { res = await sendToIntake(text); } catch (_) { /* offline: the failed line below */ }
      sending = false; $('[data-about-send]').disabled = false;
      if (res.ok) {
        say(T('shell.about.assist.sent'));
        if (followed) { followed.querySelector('[data-about-follow]').setAttribute('href', res.url); followed.hidden = false; }
        list = []; sync(); $('[data-about-text]').value = '';
      } else say(res.message || T('shell.about.failed'), true);
      return;
    }
    const f = facts();
    $('[data-about-message]').value = text + '\n\n— ' + T('shell.about.diag') + '\n' + f.app + ' · ' + f.edition + ' · ' + f.version + '\n' + navigator.userAgent;
    sending = true; $('[data-about-send]').disabled = true; say(T('shell.about.sending'));
    let msg = '', bad = true;
    try {
      const r = await fetch(form.action, { method: 'POST', body: new FormData(form), credentials: 'same-origin' });
      const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
      msg = doc.querySelector('#contact .flash p, .flash p')?.textContent.trim() || '';
      bad = !doc.querySelector('.flash-success');
    } catch (_) { /* offline: the failed line below */ }
    sending = false; $('[data-about-send]').disabled = false;
    say(msg || T('shell.about.failed'), bad || !msg);
    if (!bad && msg) { list = []; sync(); $('[data-about-text]').value = ''; }
  });

  // (not named `open`: a function declared in this block lands on window and replaced window.open, so every pop-out in every app opened About)
  function openAbout(opts) {   // opts (BK.124, BK.148): { text } = a draft for the What happened box (the Ask box, an assistant's problem_report)
    const draft = opts && typeof opts === 'object' && typeof opts.text === 'string' ? opts.text.slice(0, 4200) : '';
    if (dlg.open) { if (draft) $('[data-about-text]').value = draft; return; }
    returnFocus = document.activeElement;
    $('[data-about-edition]').textContent = edition(); say('');
    if (draft) $('[data-about-text]').value = draft;
    preview();
    dlg.showModal(); (dlg.querySelector('[data-about-text]') || dlg).focus?.({ preventScroll: true });
  }
  const close = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener('close', () => { try { returnFocus?.focus({ preventScroll: true }); } catch (_) {} });
  dlg.addEventListener('keydown', (e) => e.stopPropagation());   // typing here never reaches the app's keys
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-about-close]')) close(); });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-about-open]'); if (b) { e.preventDefault(); openAbout(); } });
  window.addEventListener('cc-about-open', openAbout);
  window.cadcraftAbout = { open: openAbout, close };
}
