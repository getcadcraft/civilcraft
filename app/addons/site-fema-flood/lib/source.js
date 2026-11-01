/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: registry data and request text for one open-data service; no sentence a person reads. */
/** FEMA National Flood Hazard Layer, layer 28 "Flood Hazard Zones" (ArcGIS REST, GeoJSON out). US federal data. */
const BASE = 'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query';
export const SOURCE = {
  id: 'fema-nfhl', name: 'FEMA flood hazard zones (NFHL)', licence: 'US federal data (public); see the notice at msc.fema.gov', where: 'https://www.fema.gov/flood-maps/national-flood-hazard-layer', kinds: ['flood'], needs: 'point',
  request({ lat, lon, radius = 150 }) {
    const dLat = radius / 111320, dLon = radius / (111320 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)));
    const env = [lon - dLon, lat - dLat, lon + dLon, lat + dLat].map((v) => v.toFixed(6)).join(',');
    return { url: BASE + '?where=1%3D1&geometry=' + env + '&geometryType=esriGeometryEnvelope&inSR=4326&outSR=4326&spatialRel=esriSpatialRelIntersects&outFields=FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE&returnGeometry=true&resultRecordCount=200&f=geojson' };
  },
  parse(text) { const j = JSON.parse(text); if (j.error || j.type !== 'FeatureCollection') throw new Error('not geojson'); return { geojson: text, kind: 'flood', name: 'FEMA flood hazard zones' }; },
};
