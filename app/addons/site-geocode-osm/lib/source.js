/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: registry data and request text for one open-data service; no sentence a person reads. */
/**
 * OpenStreetMap's address search through OUR caching proxy (0.8 EG.63, civil_PART_4; owner decision 2026-10-29): the app asks getcadcraft.com/api/v1/geocode, which asks
 * Nominatim (https://operations.osmfoundation.org/policies/nominatim/) at most once a second with an identifying User-Agent and keeps the answer 90 days, so the service
 * sees one polite client. The address goes to getcadcraft.com for that; no key, no cookie, the network hash is only a throttle, and only a hash of the address is stored.
 * Answer: { status, data: { found, lat, lon, label, cached, attribution } }.
 */
export const SOURCE = {
  id: 'geocode-osm', name: 'OpenStreetMap address search (through getcadcraft.com)', licence: 'ODbL, © OpenStreetMap contributors', where: 'https://getcadcraft.com/api/v1/geocode', kinds: ['point'], needs: 'address',
  request: ({ address }) => ({ url: 'https://getcadcraft.com/api/v1/geocode?q=' + encodeURIComponent(String(address).trim().slice(0, 300)), headers: { Accept: 'application/json' } }),
  parse(text) {
    const a = JSON.parse(text), d = a && a.status === 'success' ? a.data : null;
    if (!d) throw new Error('bad answer');
    if (!d.found) return { info: [{ key: 'nomatch' }] };
    const lat = Number(d.lat), lon = Number(d.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new Error('bad point');
    return { point: { lat, lon, label: String(d.label || '').slice(0, 200) } };
  },
};
