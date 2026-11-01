/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-native-ui.js — 0.7.1 71.27 (owner 2026-10-26): Save writes the project as a pair, <name>.civilcraft.json + <name>.ifc (IFC 4.3), and
 * opening either finds its partner (ifc-native.js does the files and the decisions; this file reaches the host and the person).
 *
 *   createNative(ctx) → { save(), openFiles(files, hostFiles) → Promise<bool> (true = handled), warnings(), fix(action) }
 *   ctx = { host (host.js), project(), target() / setTarget(hostFile) (the file Save writes), openProjectText(text, name, from) → bool,
 *           importIfc(file) (ifc-civil-ui.js, a foreign IFC), say, busy, fileStem(), species(), confirmDiscard(), root, refocus() }
 *
 * Save, by host:
 *   desktop (Studio)   the JSON written in place (or a save dialog the first time), the IFC written beside it in the same folder
 *                      (host.folderOf: the shell's atomic writes); recent files list the JSON — the pair is one entry
 *   browser + File System Access (Chromium)   a folder is asked once (kept while the page is open) and both files written into it;
 *                      cancelling the folder picker, or a browser that cannot (no user gesture), downloads both instead
 *   other browsers     two downloads, the JSON then the IFC (chosen over a .zip: either file reopens on its own, drops straight back
 *                      in, and the pair needs no unpacking; Firefox and Chromium both allow the second download from the same click)
 * Opening: a dropped / opened pair opens together; one file looks for its partner (desktop: the same folder; browser: the folder Save
 * used, else the person is asked to add it or to continue alone) and ifc-native.js decide() picks what opens; its warnings go to the
 * Problems panel as code ifc.native.changed / ifc.native.stale / ifc.native.missing with two fixes: save now (writes both files) and
 * show the IFC's geometry as reference.
 */

import { writePair, readNative, decide, reconcile } from './ifc-native.js';
import { t } from './i18n.js';

const isJson = (n) => /\.json$/i.test(n || ''), isIfc = (n) => /\.ifc$/i.test(n || '');
const stemOf = (n) => String(n || '').replace(/\.civilcraft\.json$/i, '').replace(/\.(json|ifc)$/i, '');

export function createNative(ctx) {
  let folder = null;      // the browser folder Save wrote to (File System Access), kept while the page is open
  let lastIfc = null;     // { name, bytes } of the IFC the open project came with (for "show the IFC's geometry")
  const P = () => ctx.project();
  const setWarnings = (list) => { const p = P(); p.nativeWarnings = list; p.emit('native'); };

  async function save() {
    const p = P(), tgt = ctx.target(), stem = stemOf(tgt?.name) || ctx.fileStem();
    ctx.busy(t('ifc.pair.busy', { json: stem + '.civilcraft.json', ifc: stem + '.ifc' }));
    let w;
    try { w = await writePair(p, { stem, species: ctx.species?.() || null }); } catch (err) { ctx.busy(null); ctx.say(t('ifc.pair.failed', { why: err.message })); return false; }
    const host = ctx.host, types = [{ description: 'CivilCraft project', extensions: ['.json'] }];   // i18n-ignore: an OS file type
    let how = '', note = '';
    try {
      if (host.kind === 'desktop') {
        const r = tgt && isJson(tgt.name) ? await host.save({ target: tgt, data: w.jsonText, name: w.jsonName, types }) : await host.saveAs({ data: w.jsonText, name: w.jsonName, types });
        if (!r.ok) { ctx.say(r.cancelled ? t('save.cancelled') : t('save.failed', { error: r.error?.message || String(r.error) })); return false; }
        if (r.target) ctx.setTarget(r.target);
        if (stemOf(r.name) !== stem && r.target) {
          // a new name in the save dialog: the pair names each other by it, so write the JSON again with that name
          w = await writePair(p, { stem: stemOf(r.name), species: ctx.species?.() || null });
          const r2 = await host.save({ target: r.target, data: w.jsonText, name: w.jsonName, types });
          if (!r2.ok) { ctx.say(t('save.failed', { error: r2.error?.message || String(r2.error) })); return false; }
        }
        const dir = host.folderOf(r.target);
        try { if (!dir) throw new Error(t('ifc.pair.nofolder')); await dir.write(stemOf(r.name) + '.ifc', w.ifcText); how = t('ifc.pair.how.side'); }
        catch (err) { note = ' ' + t('ifc.pair.ifcfail', { ifc: stemOf(r.name) + '.ifc', why: err.message }); how = t('ifc.pair.how.side'); }
      } else {
        if (!folder && typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function') folder = await host.pickFolder({ write: true, id: 'civilcraft-project' }).catch(() => null);
        if (folder) {
          await folder.write(w.jsonName, w.jsonText);
          await folder.write(w.ifcName, w.ifcText);
          how = folder.name ? t('ifc.pair.how.folder', { folder: folder.name }) : t('ifc.pair.how.chosen');
        } else {
          host.download(new Blob([w.jsonText], { type: 'application/json' }), w.jsonName, 'application/json');
          host.download(new Blob([w.ifcText], { type: 'application/x-step' }), w.ifcName, 'application/x-step');
          how = t('ifc.pair.how.dl');
        }
      }
    } catch (err) { ctx.say(t('ifc.pair.failed', { why: err.message })); return false; } finally { ctx.busy(null); }
    p.saved = p.version;
    lastIfc = { name: w.ifcName, bytes: new TextEncoder().encode(w.ifcText) };
    setWarnings([]);
    ctx.saved?.();
    ctx.say(t('ifc.pair.saved', { json: w.jsonName, ifc: w.ifcName, how }) + note);
    return true;
  }

  /** Ask for the partner (browser): → File | null (continue alone) */
  function askPartner(have, want) {
    return new Promise((resolve) => {
      const dlg = document.createElement('dialog');
      dlg.className = 'cv-dialog'; dlg.setAttribute('data-ifc-pair', '');
      const input = Object.assign(document.createElement('input'), { type: 'file', accept: isIfc(want) ? '.ifc' : '.json', className: 'visually-hidden' });
      const btn = (text, cls, fn) => Object.assign(document.createElement('button'), { type: 'button', className: cls, textContent: text, onclick: fn });
      const h = Object.assign(document.createElement('h2'), { className: 'cv-h', textContent: t('ifc.pair.h') });
      const p = Object.assign(document.createElement('p'), { className: 'cv-note', textContent: t('ifc.pair.ask', { file: have, partner: want }) });
      let done = false;
      const end = (v) => { if (done) return; done = true; dlg.close(); dlg.remove(); ctx.refocus?.(); resolve(v); };
      input.addEventListener('change', () => end(input.files[0] || null));
      const foot = document.createElement('div'); foot.className = 'cv-dlg-foot';
      foot.append(btn(t('ifc.pair.go', { file: have }), 'btn-line btn-sm-cc', () => end(null)), btn(t('ifc.pair.add', { partner: want }), 'btn-plot btn-sm-cc', () => input.click()));
      foot.firstChild.setAttribute('data-ifc-pair-alone', ''); foot.lastChild.setAttribute('data-ifc-pair-add', '');
      const body = document.createElement('div'); body.className = 'cv-dlg-body'; body.append(p, input);
      const form = document.createElement('div'); form.className = 'cv-dlg'; form.append(Object.assign(document.createElement('div'), { className: 'cv-dlg-head' }), body, foot);
      form.firstChild.append(h);
      dlg.append(form);
      dlg.addEventListener('cancel', () => end(null));
      ctx.root.append(dlg);
      dlg.showModal();
    });
  }

  /** The partner of one file: desktop → its folder; browser → the folder Save used; else ask. → { name, bytes|text } | null */
  async function partnerOf(file, hostFile, wantName) {
    const host = ctx.host;
    const dir = host.kind === 'desktop' && hostFile ? host.folderOf(hostFile) : folder;
    if (dir) { try { const b = await dir.read(wantName); return { name: wantName, file: new File([b], wantName) }; } catch { /* not there */ } }
    if (host.kind === 'desktop') return null;
    const f = await askPartner(file.name, wantName);
    return f ? { name: f.name, file: f } : null;
  }

  async function openFiles(files, hostFiles = []) {
    const ifcF = files.find((f) => isIfc(f.name)), jsonF = files.find((f) => isJson(f.name));
    if (!ifcF && !jsonF) return false;
    let jsonText = jsonF ? await jsonF.text() : null, jsonObj = null;
    if (jsonText !== null) { try { jsonObj = JSON.parse(jsonText); } catch { jsonObj = null; } }
    if (!ifcF && !jsonObj?.pair) return false;   // a project file from before the pair (or not ours): opened as before
    let ifcBytes = ifcF ? new Uint8Array(await ifcF.arrayBuffer()) : null, ifcName = ifcF?.name || null;
    ctx.busy(t('cad.ui.reading', { file: (jsonF || ifcF).name }));
    let r = null;
    try {
      r = ifcBytes ? await readNative(ifcBytes) : null;
      if (ifcF && !r.native && !jsonF) { ctx.busy(null); await ctx.importIfc(ifcF); return true; }   // not CivilCraft's: the import dialog
      // one file of a pair: find the other
      if (!jsonF && r?.native) {
        ctx.busy(null);
        const pf = await partnerOf(ifcF, hostFiles.find((h) => h.name === ifcF.name), r.native.jsonName || stemOf(ifcF.name) + '.civilcraft.json');
        if (pf) { jsonText = await pf.file.text(); jsonObj = JSON.parse(jsonText); }
      } else if (!ifcF && jsonObj?.pair?.ifc) {
        ctx.busy(null);
        const pf = await partnerOf(jsonF, hostFiles.find((h) => h.name === jsonF.name), jsonObj.pair.ifc);
        if (pf) { ifcBytes = new Uint8Array(await pf.file.arrayBuffer()); ifcName = pf.name; r = await readNative(ifcBytes); }
      }
    } catch (err) { ctx.busy(null); ctx.say(t('ifc.in.failed', { file: (ifcF || jsonF).name, why: err.message })); return true; }
    ctx.busy(null);
    const jsonName = jsonF?.name || (jsonText !== null ? (r?.native?.jsonName || stemOf(ifcName) + '.civilcraft.json') : null);
    const d = decide({ ifc: r ? { name: ifcName, native: r.native, current: r.current } : null, json: jsonText !== null ? { name: jsonName, text: jsonText } : null });
    if (d.open === 'import') { if (ifcF) await ctx.importIfc(ifcF); return true; }
    if (d.open === 'none') { ctx.say(t('cv.open.failed', { file: (jsonF || ifcF).name, why: t('ifc.pair.unreadable') })); return true; }
    let text = d.text, extra = '';
    if (d.reconcile) {
      // a lone IFC changed elsewhere: keep what still matches; the IFC's own alignments where CivilCraft's changed
      const { readCivilIfc } = await import('./ifc-civil-read.js');
      const obj = JSON.parse(text), read = readCivilIfc(ifcBytes, { units: obj.units === 'm' ? 'm' : 'ft' }).alignments.map((a) => ({ ...a, gidTag: (r.native.elements[a.gid]?.[0] || '').replace(/^el\|/, '') }));
      const rc = reconcile(obj, d.diff, read);
      text = JSON.stringify(rc.obj);
      if (rc.replaced.length || rc.dropped.length) extra = ' ' + t('ifc.native.reconciled', { replaced: rc.replaced.join(', ') || '—', dropped: rc.dropped.join(', ') || '—' });
    }
    const target = d.open === 'json' ? hostFiles.find((h) => h.name === jsonName) || null : null;
    const ok = await ctx.openProjectText(text, d.open === 'json' ? jsonName : ifcName, target);
    if (!ok) return true;
    if (d.open !== 'json' && !target && ctx.host.kind === 'desktop') {
      // opened from the IFC on the desktop: Save writes the JSON beside it
      const hf = hostFiles.find((h) => h.name === ifcName);
      const dir = hf ? ctx.host.folderOf(hf) : null;
      if (dir && hf.path) ctx.setTarget({ name: stemOf(ifcName) + '.civilcraft.json', path: hf.path.replace(/[^\\/]+$/, stemOf(ifcName) + '.civilcraft.json') });
    }
    lastIfc = ifcBytes ? { name: ifcName, bytes: ifcBytes } : null;
    setWarnings(d.warnings.map((w) => ({ ...w, text: t(w.msg.key, w.msg.vars) })));
    if (d.warnings.length || extra) ctx.say(t(d.warnings[0]?.msg.key || 'ifc.pair.opened', d.warnings[0]?.msg.vars || { json: jsonName, ifc: ifcName }) + extra);
    else ctx.say(t('ifc.pair.opened', { json: jsonName, ifc: ifcName }));
    return true;
  }

  /** The Problems panel's entries for the open pair (civilcraft.js passes them to problems-civilcraft.js). */
  function warnings() {
    return (P().nativeWarnings || []).map((w) => ({ ...w, fixes: w.fixes.map((a) => ({ id: a, action: a, msg: { key: 'ifc.native.fix.' + (a === 'ifcSave' ? 'save' : 'take'), vars: {} }, text: t('ifc.native.fix.' + (a === 'ifcSave' ? 'save' : 'take')) })) }));
  }
  async function fix(action) {
    if (action === 'ifcSave') return save();
    if (action === 'ifcTake' && lastIfc) {
      const { readCivilIfc, applyIfcImport } = await import('./ifc-civil-read.js');
      const p = P(), r = readCivilIfc(lastIfc.bytes, { units: p.state.units });
      const res = applyIfcImport(p, { ...r, alignments: [] }, { eg: -1, refs: true, file: lastIfc.name });
      ctx.say(t('ifc.native.taken', { ifc: lastIfc.name, n: res.refs }));
      return true;
    }
    return false;
  }
  return { save, openFiles, warnings, fix, get folder() { return folder; } };
}
