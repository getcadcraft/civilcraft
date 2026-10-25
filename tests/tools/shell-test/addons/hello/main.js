/* SPDX-License-Identifier: Apache-2.0 */
// Test fixture for assets/js/addons.js (bin/test-addons.mjs).
import { greet } from './lib/greet.js';

export function activate(api) {
  globalThis.__hello = { active: true, greeting: greet(api), api: api.version, app: api.app.slug, extra: api.extra || null };
  api.storage.set('count', (api.storage.get('count') || 0) + 1);
  api.onDeactivate(() => { globalThis.__hello.cleaned = true; });
  return () => { globalThis.__hello.active = false; };
}
