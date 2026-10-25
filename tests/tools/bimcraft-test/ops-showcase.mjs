/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-showcase.mjs — makes the bim-ops showcase files ONCE (rule: screenshots and videos open saved files; never regenerate):
 *   fixtures/showcase/bimcraft-house-ops.ifc       the showcase house with its site (Denver, 39° 44′ N, 104° 59′ W, 1609 m),
 *       three tracked windows with asset data, a maintenance record (one overdue), documents, sensor limits (5–28 °C), and
 *       the live-feed settings (ws://localhost:9001/mqtt, site/{tag}/temperature: tools/bimcraft-test/ops-broker.mjs --port
 *       9001 --tags W1,W2,W5 feeds it)
 *   fixtures/showcase/bimcraft-house-readings.csv  a day of glass-surface readings for W1, W2, W5, 16:00 on 20 July to 15:30 on
 *       21 July (W1's latest, in the afternoon sun, is over 28 °C)
 * Skips each file that exists (only checks it opens). Run explicitly: node bin/test-bimcraft.mjs --ops --only showcase
 */
import fs from 'node:fs';
import path from 'node:path';

export default async function showcasePart({ APP, ROOT, WebIFC, ok, open }) {
  console.log('== bim-ops showcase files (made once)');
  const dir = path.join(ROOT, 'fixtures/showcase'), ifcOut = path.join(dir, 'bimcraft-house-ops.ifc'), csvOut = path.join(dir, 'bimcraft-house-readings.csv');
  const A = await import(path.join(APP, 'assets-bim.js'));
  const Sn = await import(path.join(APP, 'assets-bim-sensors.js'));
  const Lv = await import(path.join(APP, 'assets-bim-live.js'));
  if (!fs.existsSync(ifcOut)) {
    const src = fs.readFileSync(path.join(dir, 'bimcraft-house.ifc'), 'latin1');
    const sited = src.replace(/(IFCSITE\('3\$VRjozxD15vuqQ_jXo8T_',#5,'Site',\$,\$,#19,\$,\$,\.ELEMENT\.),\$,\$,\$,\$,\$\)/, '$1,(39,44,21,0),(-104,-59,-3,0),1609000.,$,$)');
    if (sited === src) throw new Error('the house\'s site line was not where expected');
    const ed = await open(new TextEncoder().encode(sited));
    const by = (tag) => { for (const id of ed.api.GetLineIDsWithType(ed.mid, WebIFC.IFCWINDOW) ?? []) { const l = ed.api.GetLine(ed.mid, id, false); if (l.Tag?.value === tag) return l.GlobalId.value; } throw new Error('no ' + tag); };
    const w1 = by('W1'), w2 = by('W2'), w5 = by('W5');
    ed.modelChange(A.assetDataOp(w1, { maker: 'Northlight', model: 'PW-72', ref: 'PW-72-LE', serial: 'NL-55-0192', installed: '2025-05-20', warrantyId: 'NL-W-3381', warrantyStart: '2025-05-20', warrantyEnd: '2035-05-20', life: '30' }));
    ed.modelChange(A.addEntryOp(w1, { date: '2025-11-03', work: 'Seals checked, hinges oiled', by: 'FM team', next: '2026-05-03', notes: 'Upper hinge stiff' }));
    ed.modelChange(A.addDocOp(w1, { kind: 'manual', title: 'Picture window care guide', location: 'https://example.com/northlight-pw72-care.pdf' }));
    ed.modelChange(A.addDocOp(w1, { kind: 'photo', title: 'W1 as fitted', location: 'Photos/W1 as fitted.jpg' }));
    for (const g of [w2, w5]) {
      ed.modelChange(A.assetDataOp(g, { maker: 'Northlight', model: 'DH-36', installed: '2025-05-21', warrantyStart: '2025-05-21', warrantyEnd: '2035-05-21', life: '30' }));
      ed.modelChange(A.addEntryOp(g, { date: '2026-04-10', work: 'Sash cords checked', by: 'FM team', next: '2027-04-10' }));
    }
    for (const g of [w1, w2, w5]) ed.modelChange(Sn.sensorOp(g, { low: 5, high: 28, unit: '°C' }));
    ed.modelChange(Lv.feedSettingsOp({ kind: 'mqtt', url: 'ws://localhost:9001/mqtt', topics: ['site/{tag}/temperature'], valueKey: 'value', every: 30 }));
    fs.writeFileSync(ifcOut, ed.save());
    console.log('  ..   wrote ' + path.relative(ROOT, ifcOut));
  } else console.log('  --   ' + path.relative(ROOT, ifcOut) + ' exists: kept');
  if (!fs.existsSync(csvOut)) {
    const rows = ['time,W1,W2,W5'];
    // 48 half hours from 16:00 on 20 July to 15:30 on 21 July: the latest reading is the hot afternoon
    for (let k = 0; k < 48; k++) {
      const at = 16 + k / 2, day = at >= 24 ? 21 : 20, h = Math.floor(at % 24), m = (at % 1) * 60;
      const t = at % 24, sun = Math.max(0, Math.sin(((t - 6) / 14) * Math.PI));
      const w1 = 19 + 12.5 * sun ** 1.5 + 0.4 * Math.sin(t * 3), w2 = 18 + 4 * sun + 0.3 * Math.sin(t * 2), w5 = 18.5 + 6 * Math.max(0, Math.sin(((t - 9) / 12) * Math.PI)) + 0.3 * Math.cos(t * 2);
      rows.push(`2026-07-${day} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')},${w1.toFixed(2)},${w2.toFixed(2)},${w5.toFixed(2)}`);
    }
    fs.writeFileSync(csvOut, rows.join('\n') + '\n');
    console.log('  ..   wrote ' + path.relative(ROOT, csvOut));
  } else console.log('  --   ' + path.relative(ROOT, csvOut) + ' exists: kept');
  // it opens, and holds what the video needs
  const ed = await open(fs.readFileSync(ifcOut));
  const as = A.readAssets(WebIFC, ed.api, ed.mid, { today: '2026-10-23' });
  const p = Sn.parseSensorCsv(fs.readFileSync(csvOut, 'utf8'));
  ok(as.length === 3 && as.filter((a) => a.due === 'overdue').length === 1 && as.every((a) => a.limits.high === 28) && Lv.readFeedSettings(ed.api, ed.mid)?.topics[0] === 'site/{tag}/temperature', 'the showcase IFC: 3 tracked windows, one overdue, limits 5–28 °C, the feed settings');
  const last = (c) => p.cols[c].values[p.rows - 1];
  ok(p.rows === 48 && last(0) > 28 && last(1) < 28 && last(2) < 28, `the readings: 48 half hours to 15:30 on 21 July; W1's latest (${last(0).toFixed(1)} °C) is over 28 °C, W2's and W5's are not`);
}
