/* SPDX-License-Identifier: Apache-2.0 */
/**
 * drive.js — driving along an alignment in the 3D view, and where the sun is (0.4 V10). No DOM, no three.js; the Node
 * test drives it (bin/test-civilcraft-drive.mjs).
 *
 *   elevationAlong(al, profile, ground) → (sta) → z | null   the design profile where it has one, else the existing
 *       ground on the centerline (ground(x, y) → z | null)
 *   driveFrame(al, elevAt, sta, { eye, ahead, origin, exag }) → { eye: [x, y, z], target: [x, y, z], z } in the 3D view's
 *       local coordinates (project − origin; z × exag): the eye `eye` above the road at `sta`, looking at the same height
 *       `ahead` further on (past the end: straight on along the last direction)
 *   DRIVE_SPEEDS[units] = [{ label, perSec }]   (mph / km/h in project units a second)
 *   EYE_HEIGHT[units]   a driver's eye: 3.5 ft, 1.07 m
 *
 *   sunPosition(date, lat, lon) → { azimuth (degrees from north, clockwise), altitude (degrees above the horizon, with
 *       standard refraction), declination, eot (minutes) }   NOAA's solar calculator equations (Meeus); good to about a
 *       minute of arc for 1800–2100
 *   sunVector({ azimuth, altitude }) → [east, north, up] unit vector toward the sun (Z up, as the 3D view)
 */

export const EYE_HEIGHT = { ft: 3.5, m: 1.07 };
export const DRIVE_SPEEDS = {
  ft: [10, 25, 45, 65].map((mph) => ({ label: mph + ' mph', perSec: (mph * 5280) / 3600 })),
  m: [15, 40, 70, 100].map((kmh) => ({ label: kmh + ' km/h', perSec: (kmh * 1000) / 3600 })),
};

export function elevationAlong(al, profile, ground) {
  const useProf = !!profile?.ok;
  let last = null;
  return (sta) => {
    let z = useProf ? profile.elevationAt(sta) : null;
    if (z === null || !Number.isFinite(z)) { const p = al.pointAt(sta); z = ground ? ground(p.x, p.y) : null; }
    if (z !== null && Number.isFinite(z)) last = z;
    return last;
  };
}

export function driveFrame(al, elevAt, sta, { eye = 3.5, ahead = 100, origin = { x: 0, y: 0, z: 0 }, exag = 1 } = {}) {
  const s = Math.max(al.start, Math.min(al.end, sta));
  const p = al.pointAt(s), z = elevAt(s) ?? origin.z;
  const L = (x, y, zz) => [x - origin.x, y - origin.y, (zz - origin.z) * exag];
  const s2 = Math.min(al.end, s + ahead);
  let q, z2;
  if (s2 - s > ahead * 0.25) { q = al.pointAt(s2); z2 = elevAt(s2) ?? z; }
  else { q = { x: p.x + ahead * Math.cos(p.dir), y: p.y + ahead * Math.sin(p.dir) }; z2 = z; }   // at the end: straight on, level
  return { eye: L(p.x, p.y, z + eye), target: L(q.x, q.y, z2 + eye), z, sta: s };
}

// ------------------------------------------------------------------ the sun (NOAA / Meeus)
const R = Math.PI / 180;
export function sunPosition(date, lat, lon) {
  const ms = date instanceof Date ? date.getTime() : Number(date);
  const jd = ms / 86400000 + 2440587.5, T = (jd - 2451545) / 36525;
  const L0 = (((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360) + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C = Math.sin(M * R) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M * R) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * R) * 0.000289;
  const omega = 125.04 - 1934.136 * T, lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * R);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60, eps = eps0 + 0.00256 * Math.cos(omega * R);
  const decl = Math.asin(Math.sin(eps * R) * Math.sin(lambda * R)) / R;
  const y = Math.tan((eps / 2) * R) ** 2;
  const eot = (4 / R) * (y * Math.sin(2 * L0 * R) - 2 * e * Math.sin(M * R) + 4 * e * y * Math.sin(M * R) * Math.cos(2 * L0 * R) - 0.5 * y * y * Math.sin(4 * L0 * R) - 1.25 * e * e * Math.sin(2 * M * R));
  const d = new Date(ms), minutes = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60 + d.getUTCMilliseconds() / 60000;
  let tst = (minutes + eot + 4 * lon) % 1440; if (tst < 0) tst += 1440;
  const ha = tst / 4 < 0 ? tst / 4 + 180 : tst / 4 - 180;
  const cosZ = Math.sin(lat * R) * Math.sin(decl * R) + Math.cos(lat * R) * Math.cos(decl * R) * Math.cos(ha * R);
  const zen = Math.acos(Math.max(-1, Math.min(1, cosZ))) / R, elev = 90 - zen;
  // azimuth from north, clockwise
  const sz = Math.sin(zen * R);
  let az;
  if (Math.abs(sz) < 1e-9) az = lat > decl ? 180 : 0;
  else {
    const c = (Math.sin(lat * R) * Math.cos(zen * R) - Math.sin(decl * R)) / (Math.cos(lat * R) * sz);
    const a = Math.acos(Math.max(-1, Math.min(1, c))) / R;
    az = ha > 0 ? (a + 180) % 360 : (540 - a) % 360;
  }
  return { azimuth: az, altitude: elev + refraction(elev), declination: decl, eot };
}
/** NOAA's approximation of atmospheric refraction (degrees) at an apparent elevation. */
function refraction(h) {
  if (h > 85) return 0;
  const te = Math.tan(h * R);
  let r;
  if (h > 5) r = 58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5;
  else if (h > -0.575) r = 1735 + h * (-518.2 + h * (103.4 + h * (-12.79 + h * 0.711)));
  else r = -20.774 / te;
  return r / 3600;
}
export function sunVector({ azimuth, altitude }) {
  const a = azimuth * R, h = altitude * R;
  return [Math.cos(h) * Math.sin(a), Math.cos(h) * Math.cos(a), Math.sin(h)];
}
