/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: registry data and request text for one open-data service; no sentence a person reads. */
/** A county or city parcel layer published as an ArcGIS REST FeatureServer / MapServer layer: the person gives the layer's address (…/MapServer/0). */
export const layerUrl = (u) => {
  let url; try { url = new URL(String(u).trim()); } catch { return null; }
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  const m = url.pathname.replace(/\/query\/?$/, '').replace(/\/+$/, '');
  if (!/\/(MapServer|FeatureServer)\/\d+$/i.test(m)) return null;
  return url.origin + m;
};
export const SOURCE = {
  id: 'county-parcels', name: 'County or city parcel layer (ArcGIS REST)', licence: 'differs by county; many publish open data, some do not — read the service\'s terms', where: 'the county or city GIS open-data portal', kinds: ['parcels'], needs: 'url',
  request({ lat, lon, radius = 150, url }) {
    const base = layerUrl(url); if (!base) throw new Error('layer address');
    const dLat = radius / 111320, dLon = radius / (111320 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)));
    const env = [lon - dLon, lat - dLat, lon + dLon, lat + dLat].map((v) => v.toFixed(6)).join(',');
    return { url: base + '/query?where=1%3D1&geometry=' + env + '&geometryType=esriGeometryEnvelope&inSR=4326&outSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&resultRecordCount=300&f=geojson' };
  },
  parse(text) { const j = JSON.parse(text); if (j.error || j.type !== 'FeatureCollection') throw new Error('not geojson'); return { geojson: text, kind: 'parcels', name: 'County parcels' }; },
};
