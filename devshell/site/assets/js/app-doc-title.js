/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words of its own. */
/**
 * app-doc-title.js — the tab title follows the open document in EVERY app (owner 2026-11-09), through the one pattern function ccSetDocTitle (app-shell.js):
 *   <document name> — <App>[ — Lab] | CadCraft, with "• " first while unsaved; no document name = the plain page title.
 * An app's shell-mount hands over the host it already builds for the shared modules: ccDocTitleFollow(host) reads host.document().name and host.dirty() (optional) about once a
 * second and only calls ccSetDocTitle when the pair changed. Dev builds only (app-shell.inc); nothing is read from the network.
 */
(function () {
  'use strict';
  if (window.ccDocTitleFollow) return;
  window.ccDocTitleFollow = function (host) {
    var last = null;   // per follower: the app's own follower rewrites the title only when ITS name or unsaved state changes
    function tick() {
      var d = null, dirty = false;
      try { d = host && host.document && host.document(); dirty = !!(host && host.dirty && host.dirty()); } catch (e) { return; }
      var name = d && d.name ? String(d.name) : '', key = name + '|' + dirty;
      if (key === last) return; last = key;
      if (typeof window.ccSetDocTitle === 'function') window.ccSetDocTitle(name, dirty);
    }
    tick(); setInterval(tick, 900);
    window.addEventListener('focus', tick);
  };
})();
