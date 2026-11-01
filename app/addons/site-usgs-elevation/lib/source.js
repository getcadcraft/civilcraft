/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: registry data and request text for one open-data service; no sentence a person reads. */
/** USGS Elevation Point Query Service (3DEP): the ground elevation at one point, metres. */
export const SOURCE = {
  id: 'usgs-epqs', name: 'USGS ground elevation (3DEP point query)', licence: 'US federal data (public)', where: 'https://apps.nationalmap.gov/epqs/', kinds: ['elevation'], needs: 'point',
  request: ({ lat, lon }) => ({ url: 'https://epqs.nationalmap.gov/v1/json?x=' + lon.toFixed(6) + '&y=' + lat.toFixed(6) + '&wkid=4326&units=Meters&includeDate=false' }),
  parse(text) {
    const j = JSON.parse(text), v = Number(j.value);
    if (!Number.isFinite(v) || v < -500) return { info: [{ key: 'noelev' }] };   // the service answers -1000000 where it has no data
    return { info: [{ key: 'elevation', value: Math.round(v * 100) / 100 }] };
  },
};
