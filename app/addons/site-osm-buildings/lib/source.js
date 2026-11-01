/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: registry data and request text for one open-data service; no sentence a person reads. */
/** OpenStreetMap buildings through the Overpass API (ways with a building tag, geometry inline) → polygons with height / levels / building tags. */
export const SOURCE = {
  id: 'osm-buildings', name: 'OpenStreetMap buildings (Overpass)', licence: 'ODbL, © OpenStreetMap contributors', where: 'https://overpass-api.de', kinds: ['buildings'], needs: 'point',
  request({ lat, lon, radius = 150 }) {
    const dLat = radius / 111320, dLon = radius / (111320 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)));
    const bb = [lat - dLat, lon - dLon, lat + dLat, lon + dLon].map((v) => v.toFixed(6)).join(',');
    return { url: 'https://overpass-api.de/api/interpreter', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent('[out:json][timeout:25];way["building"](' + bb + ');out geom 400;') };
  },
  parse(text) {
    const j = JSON.parse(text);
    if (!j || !Array.isArray(j.elements)) throw new Error('no elements');
    const features = [];
    for (const w of j.elements) {
      if (w.type !== 'way' || !Array.isArray(w.geometry) || w.geometry.length < 4) continue;
      const ring = w.geometry.map((p) => [p.lon, p.lat]);
      const a = ring[0], b = ring[ring.length - 1]; if (a[0] !== b[0] || a[1] !== b[1]) continue;
      features.push({ type: 'Feature', properties: { building: w.tags?.building ?? 'yes', height: w.tags?.height ?? null, 'building:levels': w.tags?.['building:levels'] ?? null, name: w.tags?.name ?? null }, geometry: { type: 'Polygon', coordinates: [ring] } });
    }
    return { geojson: JSON.stringify({ type: 'FeatureCollection', features }), kind: 'buildings', name: 'OpenStreetMap buildings' };
  },
};
