/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ps-library.js — a Library item as triangles a print stage can place (roadmap PS.4). Imports nothing, no DOM.
 *
 *   searchItems(q, { fetchFn, base, per }) → Promise<[{ uuid, version, name, category, license, preview }]>   items with a 3D body only
 *   loadItem(uuid, version, { fetchFn, base }) → Promise<item>      item.json (8 MB at most)
 *   itemTris(item) → { tris: [[x, y, z] ×3] mm, Z up, standing on 0, centred on X and Y; size: [x, y, z] } | null when it has no body
 *
 * Answers are untrusted: numbers are checked here and the panel only ever shows text as text.
 */
const BASE = '/api/v1/library';
const MAX_BYTES = 8 * 1024 * 1024;

export async function searchItems(q, { fetchFn, base = BASE, per = 24 } = {}) {
  const u = base + '/items?per=' + per + (q ? '&q=' + encodeURIComponent(q) : '');
  const res = await fetchFn(u, { headers: { Accept: 'application/json' }, credentials: 'omit' });
  if (!res.ok) throw new Error('library ' + res.status);
  const json = await res.json();
  const items = json?.data?.items;
  return Array.isArray(items) ? items : [];
}

export async function loadItem(uuid, version, { fetchFn, base = BASE } = {}) {
  const res = await fetchFn(base + '/items/' + encodeURIComponent(uuid) + '/' + Number(version) + '/item.json', { credentials: 'omit' });
  if (!res.ok) throw new Error('library ' + res.status);
  const text = await res.text();
  if (text.length > MAX_BYTES) throw new Error('too large');
  return JSON.parse(text);
}

export function itemTris(item) {
  const b = item?.body;
  if (!b) return null;
  let P, I;
  if (b.type === 'box') {
    const { x = 0, y = 0, z = 0, w, d, h } = b;
    if (![x, y, z, w, d, h].every(Number.isFinite)) return null;
    P = []; for (const dz of [0, h]) for (const [dx, dy] of [[0, 0], [w, 0], [w, d], [0, d]]) P.push(x + dx, y + dy, z + dz);
    I = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
  } else if (Array.isArray(b.positions)) {
    P = b.positions; I = Array.isArray(b.indices) && b.indices.length ? b.indices : [...Array(Math.floor(P.length / 3)).keys()];
  } else return null;
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i++) { const v = P[i], k = i % 3; if (!Number.isFinite(v)) return null; if (v < lo[k]) lo[k] = v; if (v > hi[k]) hi[k] = v; }
  if (!(hi[0] > lo[0] && hi[1] > lo[1] && hi[2] > lo[2])) return null;
  const cx = (lo[0] + hi[0]) / 2, cy = (lo[1] + hi[1]) / 2, n = P.length / 3, tris = [];
  for (let t = 0; t + 2 < I.length; t += 3) {
    const tri = [];
    for (let k = 0; k < 3; k++) {
      const v = I[t + k];
      if (!Number.isInteger(v) || v < 0 || v >= n) return null;
      tri.push([P[v * 3] - cx, P[v * 3 + 1] - cy, P[v * 3 + 2] - lo[2]]);
    }
    tris.push(tri);
  }
  return { tris, size: [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]] };
}
