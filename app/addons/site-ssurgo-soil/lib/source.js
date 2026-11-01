/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: registry data and request text for one open-data service; no sentence a person reads. */
/** USDA Soil Data Access: the SSURGO map unit at one point (symbol, key, name). Table out, not polygons. */
export const SOURCE = {
  id: 'ssurgo-sda', name: 'USDA soil map unit at the point (Soil Data Access)', licence: 'US federal data (public)', where: 'https://sdmdataaccess.sc.egov.usda.gov', kinds: ['soil'], needs: 'point',
  request: ({ lat, lon }) => ({ url: 'https://sdmdataaccess.sc.egov.usda.gov/Tabular/post.rest', method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format: 'JSON', query: "SELECT mu.mukey, mu.musym, mu.muname FROM mapunit mu WHERE mu.mukey IN (SELECT * FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(" + lon.toFixed(6) + ' ' + lat.toFixed(6) + ")'))" }) }),
  parse(text) {
    const j = JSON.parse(text), rows = Array.isArray(j.Table) ? j.Table : [];
    if (!rows.length) return { info: [{ key: 'nosoil' }] };
    return { info: rows.slice(0, 5).map((r) => ({ key: 'soil', value: { mukey: String(r[0]), symbol: String(r[1]), name: String(r[2]) } })) };
  },
};
