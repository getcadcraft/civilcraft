/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-solar.mjs — LC.20 item 6, second step (session bim-ops): solar gain through a room's windows on a date
 * (daylight-bim-sky.js clearSky / solarDay). The clear-sky numbers are the hand-worked case in docs/0.7-sessions/bim-ops.md
 * § Hand-worked cases (S1), checked a second time in Python; the geometry by what must hold (south at noon, west in the
 * afternoon, the balcony's shade in summer and not in winter, a turned north). Part of ops-test.mjs (`--only solar`).
 */
import path from 'node:path';
import { building } from './extra2-daylight.mjs';

export default async function solarPart({ APP, WebIFC, IfcModel, quiet, ok, near }) {
  console.log('== LC.20 solar gain through the windows');
  const S = await import(path.join(APP, 'daylight-bim-sky.js'));
  const D = await import(path.join(APP, 'daylight-bim.js'));

  // ---- S1: the clear sky by hand (Hottel 1976 + Liu & Jordan; sea level, mid-latitude summer, 21 June = day 172, zenith 30°)
  const c = S.clearSky(172, Math.cos(30 * Math.PI / 180), { altitudeKm: 0, climate: 'midlat-summer' });
  ok(near(c.Gon, 1322.62, 0.01) && near(c.tauB, 0.59919, 0.00001) && near(c.Gbn, 792.50, 0.05) && near(c.Gbh, 686.33, 0.05) && near(c.Gdh, 108.63, 0.05),
    'S1 by hand: G_on 1322.62, τb 0.59919, beam normal 792.50, beam horizontal 686.33, diffuse horizontal 108.63 W/m²', JSON.stringify(c));
  const night = S.clearSky(172, -0.1);
  ok(night.Gbn === 0 && night.Gdh === 0, 'the sun below the horizon: nothing');
  const hi = S.clearSky(172, Math.cos(30 * Math.PI / 180), { altitudeKm: 1.5 });
  ok(hi.tauB > c.tauB, 'at 1500 m the beam gets through better (τb rises with altitude)');
  ok(S.climateFor(51.5, 7) === 'midlat-summer' && S.climateFor(51.5, 1) === 'midlat-winter' && S.climateFor(-33.9, 1) === 'midlat-summer' && S.climateFor(10, 7) === 'tropical', 'the climate factors by date and hemisphere (Sydney\'s January is summer)');

  // ---- the test building at 51°30′ N, 0° (north = +Y): W1 faces south, W2 west
  const open = async (text) => { const eng = await quiet(IfcModel.create)(WebIFC, null); const m = await quiet((b) => eng.load(b))(new TextEncoder().encode(text)); return { api: eng.api, mid: m.modelID }; };
  const site = { lat: [51, 30, 0], lon: [0, 0, 0], north: [0, 1] };
  const run = async (opts, date) => {
    const { api, mid } = await open(building({ site, ...opts }));
    const g = D.gatherRooms(WebIFC, api, mid, { keep: true });
    const where = S.siteOf(api, mid);
    return { where, r: S.solarDay(g.rooms.filter((x) => x.name === '101'), g.prods, where, { g: 0.6, ...date }) };
  };
  const { where, r: june } = await run({}, { month: 6, day: 21, tz: 0 });
  ok(near(where.lat, 51.5, 1e-9) && where.lon === 0 && where.north.join() === '0,1', 'the site read from IfcSite (51° 30′ N, 0°) and the context\'s TrueNorth (+Y)');
  const room = june.rooms[0], w1 = room.windows.find((w) => w.name === 'W1'), w2 = room.windows.find((w) => w.name === 'W2');
  ok(june.times.length === 96 && room.hourly.length === 96 && june.climate === 'midlat-summer' && june.tz === 0, 'one day in quarter hours (96 steps), the summer factors, UTC+0');
  ok(w1.peakAt >= 11.5 && w1.peakAt <= 12.5 && w2.peakAt >= 15 && w2.peakAt <= 19, `the south window peaks at noon (${w1.peakAt} h), the west one late in the afternoon (${w2.peakAt} h)`);
  ok(w1.hourly.slice(0, 12).every((x) => x === 0) && w1.hourly.slice(88).every((x) => x === 0), 'nothing before 3 a.m. or after 10 p.m. (the sun is down)');
  ok(near(room.kWh, w1.kWh + w2.kWh, 1e-9) && near(room.peak, Math.max(...room.hourly), 1e-9) && room.peak <= w1.peak + w2.peak + 1e-9, 'the room = the sum of its windows; its peak no more than theirs added');
  ok(w1.kWh > 0 && w1.kWh / (3 * 0.75) > 0.5 && w1.kWh / (3 * 0.75) < 5, `about ${(w1.kWh / 2.25).toFixed(2)} kWh per m² of glass through the south window on 21 June (between 0.5 and 5: a sanity bound)`);
  // the balcony 1.0 m out, 1.5 m above W1's centre: shades the high June sun at noon, not the low December sun
  const { r: juneBal } = await run({ balcony: true }, { month: 6, day: 21, tz: 0 });
  const noon = june.times.indexOf(12);
  const b1 = juneBal.rooms[0].windows.find((w) => w.name === 'W1');
  ok(b1.shaded > 0 && b1.hourly[noon] < w1.hourly[noon] * 0.5, `June noon (sun about 62° up, above the balcony's 56.3°): W1's beam is cut (${w1.hourly[noon].toFixed(0)} → ${b1.hourly[noon].toFixed(0)} W)`);
  const { r: dec } = await run({}, { month: 12, day: 21, tz: 0 }), { r: decBal } = await run({ balcony: true }, { month: 12, day: 21, tz: 0 });
  const d1 = dec.rooms[0].windows.find((w) => w.name === 'W1'), db1 = decBal.rooms[0].windows.find((w) => w.name === 'W1');
  ok(db1.shaded === 0 && db1.hourly[noon] > d1.hourly[noon] * 0.9 && dec.climate === 'midlat-winter', `December noon (sun about 15° up): the balcony does not shade the beam (${d1.hourly[noon].toFixed(0)} → ${db1.hourly[noon].toFixed(0)} W: only some sky lost)`);
  // north turned: TrueNorth = −X, so W1 (facing −Y) now faces west, like W2 did: the same energy per m² of glass
  const { api: ta, mid: tm } = await open(building({ site: { ...site, north: [-1, 0] } }));
  const tg = D.gatherRooms(WebIFC, ta, tm, { keep: true });
  const tw = S.solarDay(tg.rooms.filter((x) => x.name === '101'), tg.prods, S.siteOf(ta, tm), { g: 0.6, month: 6, day: 21, tz: 0 }).rooms[0].windows.find((w) => w.name === 'W1');
  const perM2 = (w, a) => w.kWh / (a * 0.75);
  ok(Math.abs(perM2(tw, 3) - perM2(w2, 1.2)) / perM2(w2, 1.2) < 0.03 && Math.abs(tw.peakAt - w2.peakAt) <= 0.5, `TrueNorth turned 90°: W1 faces west and gets what the west window W2 got per m² (${perM2(tw, 3).toFixed(3)} vs ${perM2(w2, 1.2).toFixed(3)} kWh/m², ± 3 %)`);
}
