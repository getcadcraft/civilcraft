/* SPDX-License-Identifier: Apache-2.0 */
/**
 * idf-spike.mjs — one EnergyPlus input file (IDF, v26.2) from a BimCraft model: the 0.7 LC.20 item 8 SPIKE (session bim-ops).
 * NOTHING SHIPS FROM IT: it lives under tools/, no app file imports it. It shows how far BimCraft's own readings go toward an
 * EnergyPlus model; the go / no-go is in docs/spikes/LC.20-energyplus.md.
 *
 *   idfFromModel(W, api, mid, { g, e, uMap, inputs, site, name }) → { text, zones, surfaces, windows, skipped: [why…] }
 *     g = daylight-bim.js gatherRooms(…, { keep: true }); e = energy-bim.js gatherEnergy; uMap = uValues; inputs = energy INPUTS
 *   One Zone per room; its own shell's coplanar triangles merged into one polygon per plane (BuildingSurface:Detailed;
 *   triangles kept where a plane does not close into one loop); each surface's boundary from a ray at its centre (Outdoors /
 *   Ground on the lowest level / Adiabatic toward another room, same temperature as the loads); constructions as
 *   Material:NoMass with R = 1/U − surface resistances, one per U; windows as FenestrationSurface:Detailed on the wall they
 *   face, WindowMaterial:SimpleGlazingSystem (U, g, T); infiltration at the air changes; two design days (heating with no sun,
 *   cooling clear sky) at the inputs' temperatures; Sizing:Zone + ZoneHVAC:IdealLoadsAirSystem so EnergyPlus reports each
 *   zone's design heating and cooling load. No weather file is needed (sizing periods only).
 */
const f = (x, d = 4) => (Number.isFinite(x) ? (Math.round(x * 10 ** d) / 10 ** d).toString() : '0');
const obj = (type, fields) => type + ',\n' + fields.map((v, i) => '  ' + String(v ?? '') + (i === fields.length - 1 ? ';' : ',')).join('\n') + '\n';
const nm = (s) => String(s).replace(/[,;!\n\r]/g, ' ').trim().slice(0, 90) || 'x';

function planes(tr) {
  const groups = new Map();
  for (let i = 0; i + 8 < tr.length; i += 9) {
    const A = [tr[i], tr[i + 1], tr[i + 2]], B = [tr[i + 3], tr[i + 4], tr[i + 5]], C = [tr[i + 6], tr[i + 7], tr[i + 8]];
    const ab = B.map((v, k) => v - A[k]), ac = C.map((v, k) => v - A[k]);
    const n = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
    const l = Math.hypot(...n);
    if (l < 1e-9) continue;
    const u = n.map((v) => v / l), d = u[0] * A[0] + u[1] * A[1] + u[2] * A[2];
    const key = u.map((v) => Math.round(v * 1000)).join(',') + '|' + Math.round(d * 1000);
    if (!groups.has(key)) groups.set(key, { n: u, tris: [] });
    groups.get(key).tris.push([A, B, C]);
  }
  return [...groups.values()];
}
/** One loop from a group's triangles (edges used once, chained), or null when it is not a single simple loop. */
function loop(tris) {
  const k = (p) => p.map((v) => Math.round(v * 10000)).join(',');
  const pts = new Map(), use = new Map();
  for (const t of tris) for (let i = 0; i < 3; i++) { const a = t[i], b = t[(i + 1) % 3]; pts.set(k(a), a); pts.set(k(b), b); const e = [k(a), k(b)].sort().join('|'); use.set(e, (use.get(e) || 0) + 1); }
  const next = new Map();
  for (const t of tris) for (let i = 0; i < 3; i++) { const a = k(t[i]), b = k(t[(i + 1) % 3]); if (use.get([a, b].sort().join('|')) === 1) { if (next.has(a)) return null; next.set(a, b); } }
  if (next.size < 3) return null;
  const start = next.keys().next().value, out = [];
  let at = start;
  for (let i = 0; i <= next.size; i++) { out.push(pts.get(at)); at = next.get(at); if (at === undefined) return null; if (at === start) break; }
  if (out.length !== next.size) return null;
  // drop points in a straight line
  return out.filter((p, i) => { const a = out[(i + out.length - 1) % out.length], b = out[(i + 1) % out.length]; const u = p.map((v, j) => v - a[j]), w = b.map((v, j) => v - p[j]); const c = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]; return Math.hypot(...c) > 1e-9; });
}
const newell = (P) => { const n = [0, 0, 0]; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); } return n; };
const ccwAbout = (P, out) => { const n = newell(P); return n[0] * out[0] + n[1] * out[1] + n[2] * out[2] >= 0 ? P : P.slice().reverse(); };

export function idfFromModel(W, api, mid, { g, e, uMap, inputs, site = null, name = 'BimCraft model', E }) {
  const I = { ...E.INPUTS, ...inputs }, skipped = [];
  const lat = site?.lat ?? 51.5, lon = site?.lon ?? 0, tz = Math.round(lon / 15);
  const roomById = new Map(e.rooms.map((r) => [r.id, r]));
  const prods = g.prods, spaces = [...prods].filter(([, p]) => p.cls === 'IFCSPACE');
  // constructions by U (one NoMass material each); surface resistances as energy-bim.js uses them
  const cons = new Map();
  const consFor = (u, kind) => {
    const key = kind + ':' + f(u, 3);
    if (!cons.has(key)) { const rs = kind === 'roof' ? 0.14 : kind === 'floor' ? 0.21 : 0.17; cons.set(key, { name: 'C ' + key, kind, r: Math.max(0.001, 1 / u - rs), u }); }
    return cons.get(key).name;
  };
  let text = '! EnergyPlus input written by BimCraft (0.7 LC.20 spike, session bim-ops): ' + nm(name) + '\n! A spike, not a product feature.\n\n';
  text += obj('Version', ['26.2']);
  text += obj('SimulationControl', ['Yes', 'No', 'No', 'Yes', 'No', 'No', '1']);
  text += obj('Building', [nm(name), '0', 'Suburbs', '0.04', '0.4', 'FullExterior', '25', '6']);
  text += obj('Timestep', ['4']);
  text += obj('Site:Location', ['Site', f(lat), f(lon), tz, f(site?.elevation ?? 0, 1)]);
  text += obj('Site:GroundTemperature:BuildingSurface', Array(12).fill(f(I.tg, 1)));
  // SizingPeriod:DesignDay, field by field as the v26.2 IDD has them: 1 name … 5 max dry-bulb, 6 range, 9 humidity type, 10 wet-bulb,
  // 15 pressure, 16 wind, 17 direction, 18–20 rain / snow / DST, 21 solar model, 26 sky clearness (0 = no sun: the heating day)
  const dd = (nmx, month, day, type, tMax, range, wb, clear) => obj('SizingPeriod:DesignDay', [nmx, month, day, type, f(tMax, 1), f(range, 1), '', '', 'WetBulb', f(wb, 1), '', '', '', '', '101325', '3', '0', 'No', 'No', 'No', 'ASHRAEClearSky', '', '', '', '', f(clear, 2)]);
  text += dd('Heating design day', 1, 21, 'WinterDesignDay', I.te, 0, I.te, 0);
  text += dd('Cooling design day', 7, 21, 'SummerDesignDay', I.teSummer, 8, I.teSummer - 8, 1);
  text += obj('GlobalGeometryRules', ['UpperLeftCorner', 'Counterclockwise', 'World']);
  text += obj('ScheduleTypeLimits', ['Any', '', '', 'Continuous']);
  text += obj('Schedule:Constant', ['Always on', 'Any', '1']);
  text += obj('Schedule:Constant', ['Heating setpoint', 'Any', f(I.ti, 1)]);
  text += obj('Schedule:Constant', ['Cooling setpoint', 'Any', f(I.tiCool, 1)]);
  text += obj('Schedule:Constant', ['Control type', 'Any', '4']);   // 4 = dual setpoint
  text += obj('ThermostatSetpoint:DualSetpoint', ['Setpoints', 'Heating setpoint', 'Cooling setpoint']);
  let surfaces = 0, windows = 0;
  const lowestZ = Math.min(...spaces.map(([, p]) => p.box.lo[2]));
  const glazing = obj('WindowMaterial:SimpleGlazingSystem', ['Glazing', '1.4', '0.6', '0.7']) + obj('Construction', ['C window', 'Glazing']);
  let body = '';
  for (const r of g.rooms) {
    const er = roomById.get(r.id), sp = prods.get(r.id);
    if (!er || !sp) { skipped.push('room ' + r.name + ': no geometry'); continue; }
    const zone = nm('Zone ' + (r.name || r.id) + ' ' + r.id);
    body += obj('Zone', [zone, '0', '0', '0', '0', '1', '1', 'autocalculate', 'autocalculate']);
    // the room's U-values by exposure, area-weighted from the energy reading (walls / roof / floor), for its surfaces
    const avgU = (pred) => { let a = 0, ua = 0; for (const p of er.parts) if (p.id !== null && pred(p)) { const u = uMap.get(p.id)?.u ?? 0.3; a += p.area; ua += p.area * u; } return a > 0 ? ua / a : null; };
    const uWall = avgU((p) => /WALL|PLATE|CURTAIN/.test(p.cls) && p.exposure === 'outside') ?? 0.3;
    const uRoof = avgU((p) => /SLAB|ROOF|COVERING/.test(p.cls) && p.exposure === 'outside') ?? 0.2;
    const uFloor = avgU((p) => p.exposure === 'ground') ?? 0.25;
    const c = [(sp.box.lo[0] + sp.box.hi[0]) / 2, (sp.box.lo[1] + sp.box.hi[1]) / 2, (sp.box.lo[2] + sp.box.hi[2]) / 2];
    const wallSurfaces = [];
    for (const pl of planes(sp.tr)) {
      let n = pl.n;
      const p0 = pl.tris[0][0];
      if ((p0[0] - c[0]) * n[0] + (p0[1] - c[1]) * n[1] + (p0[2] - c[2]) * n[2] < 0) n = n.map((v) => -v);
      const L = loop(pl.tris);
      const polys = L && L.length >= 3 ? [L] : pl.tris;
      if (!L) skipped.push(zone + ': a face kept as ' + pl.tris.length + ' triangles');
      for (const P0 of polys) {
        const P = ccwAbout(P0, n);
        const kind = n[2] > 0.7 ? 'Roof' : n[2] < -0.7 ? 'Floor' : 'Wall';
        const ground = kind === 'Floor' && sp.box.lo[2] <= lowestZ + 0.3;
        const cen = P.reduce((s, q) => s.map((v, k) => v + q[k] / P.length), [0, 0, 0]);
        const probe = cen.map((v, k) => v + n[k] * 0.6);
        const next = spaces.find(([id, q]) => id !== r.id && probe[0] >= q.box.lo[0] && probe[0] <= q.box.hi[0] && probe[1] >= q.box.lo[1] && probe[1] <= q.box.hi[1] && probe[2] >= q.box.lo[2] && probe[2] <= q.box.hi[2]);
        const bc = next ? 'Adiabatic' : ground ? 'Ground' : 'Outdoors';
        const u = kind === 'Wall' ? uWall : kind === 'Roof' ? uRoof : uFloor;
        const sname = nm(zone + ' ' + kind + ' ' + (++surfaces));
        body += obj('BuildingSurface:Detailed', [sname, kind, consFor(u, kind.toLowerCase()), zone, '', bc, '', bc === 'Outdoors' ? 'SunExposed' : 'NoSun', bc === 'Outdoors' ? 'WindExposed' : 'NoWind', 'autocalculate', P.length, ...P.flatMap((q) => [f(q[0]), f(q[1]), f(q[2])])]);
        if (kind === 'Wall' && bc === 'Outdoors') wallSurfaces.push({ name: sname, n, P, d: n[0] * P[0][0] + n[1] * P[0][1] + n[2] * P[0][2] });
      }
    }
    // windows on the outside wall they face (projected onto that wall's plane)
    for (const w of r.windows) {
      const wall = wallSurfaces.filter((s) => s.n[0] * w.n[0] + s.n[1] * w.n[1] > 0.99).map((s) => ({ s, dist: Math.abs(s.n[0] * w.origin[0] + s.n[1] * w.origin[1] + s.n[2] * w.origin[2] - s.d) })).sort((a, b) => a.dist - b.dist)[0];
      if (!wall || wall.dist > 0.8) { skipped.push('window ' + (w.name || w.id) + ': no outside wall of its room faces it'); continue; }
      const k = Math.sqrt(w.area / Math.max(1e-9, (w.span[1] - w.span[0]) * w.hz)), mid = (w.span[0] + w.span[1]) / 2, hw = (w.span[1] - w.span[0]) * k / 2, hh = w.hz * k / 2;
      const cc = [w.origin[0] + w.s[0] * mid, w.origin[1] + w.s[1] * mid, w.origin[2]];
      const onWall = (p) => { const t = wall.s.n[0] * p[0] + wall.s.n[1] * p[1] + wall.s.n[2] * p[2] - wall.s.d; return p.map((v, j) => v - wall.s.n[j] * t); };
      const corners = [[-hw, hh], [-hw, -hh], [hw, -hh], [hw, hh]].map(([a, b]) => onWall([cc[0] + w.s[0] * a, cc[1] + w.s[1] * a, cc[2] + b]));
      const P = ccwAbout(corners, wall.s.n);
      body += obj('FenestrationSurface:Detailed', [nm(zone + ' Window ' + (++windows)), 'Window', 'C window', wall.s.name, '', 'autocalculate', '', '1', 4, ...P.flatMap((q) => [f(q[0]), f(q[1]), f(q[2])])]);
    }
    body += obj('ZoneInfiltration:DesignFlowRate', [nm(zone + ' air'), zone, 'Always on', 'AirChanges/Hour', '', '', '', f(I.ach, 3), '1', '0', '0', '0']);
    body += obj('ZoneControl:Thermostat', [nm(zone + ' thermostat'), zone, 'Control type', 'ThermostatSetpoint:DualSetpoint', 'Setpoints']);
    body += obj('Sizing:Zone', [zone, 'SupplyAirTemperature', '14', '', 'SupplyAirTemperature', '50', '', '0.009', '0.004', '', '1.0', '1.0']);
    body += obj('ZoneHVAC:EquipmentConnections', [zone, nm(zone + ' equipment'), nm(zone + ' supply'), '', nm(zone + ' node'), nm(zone + ' return')]);
    body += obj('ZoneHVAC:EquipmentList', [nm(zone + ' equipment'), 'SequentialLoad', 'ZoneHVAC:IdealLoadsAirSystem', nm(zone + ' ideal'), '1', '1', '', '']);
    body += obj('ZoneHVAC:IdealLoadsAirSystem', [nm(zone + ' ideal'), '', nm(zone + ' supply'), '', '', '50', '13', '0.0156', '0.0077', 'NoLimit', '', '', 'NoLimit', '', '', '', '', 'ConstantSupplyHumidityRatio', '', 'ConstantSupplyHumidityRatio']);
  }
  for (const c of cons.values()) text += obj('Material:NoMass', [c.name + ' R', 'MediumRough', f(c.r, 4), '0.9', '0.7', '0.7']) + obj('Construction', [c.name, c.name + ' R']);
  text += glazing + body;
  text += obj('Output:Table:SummaryReports', ['ZoneComponentLoadSummary', 'HVACSizingSummary']);
  text += obj('OutputControl:Table:Style', ['CommaAndHTML']);
  return { text, zones: g.rooms.length, surfaces, windows, skipped };
}
