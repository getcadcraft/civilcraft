/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --acoustics` (0.8 EG.49, session bim-sim_PART_2): room acoustics. Sabine and Eyring against hand-worked numbers,
 * the air's absorption against its standard's table, the computed impulse response measured back (its decay must come out at the reverberation
 * time it was made for, band by band), convolution against the direct sum, and the sounds and the WAV file.
 */
import path from 'node:path';

export async function acousticsMode({ APP, WebIFC, IfcModel, quiet }) {
  const ROOTX0 = path.resolve(APP, '../../../../..');
  const A = await import(path.join(ROOTX0, 'lib/acoustics/acoustics.js'));
  const IR = await import(path.join(ROOTX0, 'lib/acoustics/acoustics-ir.js'));
  let bad = 0, good = 0;
  const ok0 = (c, l) => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + l); };
  // XE.3 (xe-sound_PART_3): the engine is lib/acoustics; BimCraft's files are byte-identical copies, and the maths is run from the canonical files
  const fsx = await import('node:fs'), ROOTX = path.resolve(APP, '../../../../..');
  for (const n of ['acoustics.js', 'acoustics-ir.js']) ok0(Buffer.compare(fsx.readFileSync(path.join(ROOTX, 'lib/acoustics', n)), fsx.readFileSync(path.join(APP, n))) === 0, 'lib/acoustics/' + n + ' = the BimCraft copy (tools/acoustics/sync.mjs)');
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const near = (v, want, tol) => Math.abs(v - want) <= tol;
  const rel = (v, want, f) => Math.abs(v - want) <= f * want;
  const flat = (a) => [a, a, a, a, a, a];

  console.log('== Sabine and Eyring on a 10 × 8 × 3 m room');
  const V = 240, S = 2 * (80 + 30 + 24);
  const r1 = A.reverb({ volume_m3: V, surfaces: [{ area_m2: S, alpha: flat(0.1) }] }, { air: false });
  ok(r1.ok && near(r1.area, 268, 1e-9) && near(r1.volume, 240, 1e-9), 'volume 240 m³, surface 268 m²');
  ok(near(r1.bands[3].sabine, 0.161 * 240 / 26.8, 1e-9), 'Sabine, α = 0.1 all round: 0.161 × 240 / 26.8 = ' + (0.161 * 240 / 26.8).toFixed(4) + ' s (' + r1.bands[3].sabine.toFixed(4) + ')');
  ok(near(r1.bands[3].eyring, 0.161 * 240 / (-268 * Math.log(0.9)), 1e-9), 'Eyring: 0.161 × 240 / (−268 ln 0.9) = ' + r1.bands[3].eyring.toFixed(4) + ' s');
  const r0 = A.reverb({ volume_m3: V, surfaces: [{ area_m2: S, alpha: flat(0.01) }] }, { air: false });
  ok(rel(r0.bands[0].eyring, r0.bands[0].sabine, 0.006), 'the two agree for a live room (α = 0.01: ' + r0.bands[0].sabine.toFixed(3) + ' vs ' + r0.bands[0].eyring.toFixed(3) + ' s)');
  const r5 = A.reverb({ volume_m3: V, surfaces: [{ area_m2: S, alpha: flat(0.5) }] }, { air: false });
  ok(near(r5.bands[0].sabine, 0.161 * 240 / 134, 1e-9) && r5.bands[0].eyring < r5.bands[0].sabine * 0.75, 'a dead room (α = 0.5): Eyring ' + r5.bands[0].eyring.toFixed(3) + ' s is well under Sabine ' + r5.bands[0].sabine.toFixed(3) + ' s');
  ok(r5.bands[0].T === r5.bands[0].eyring && r1.bands[0].T === r1.bands[0].sabine, 'the answer given uses Eyring above ᾱ = 0.2, Sabine below');
  ok(r5.notes.some((n) => n.key === 'ac.note.dead'), 'a note says Sabine is out of its range in a dead room');
  const mixed = A.reverb({ volume_m3: V, surfaces: [{ area_m2: 80, key: 'carpet' }, { area_m2: 80, key: 'ceiling-tile' }, { area_m2: 108, key: 'gypsum' }] }, { air: false });
  const hand = (i) => (80 * A.MATERIALS.carpet.alpha[i] + 80 * A.MATERIALS['ceiling-tile'].alpha[i] + 108 * A.MATERIALS.gypsum.alpha[i]);
  ok(near(mixed.bands[2].A, hand(2), 1e-9) && near(mixed.bands[2].sabine, 0.161 * V / hand(2), 1e-9), 'materials add by area × α: A(500 Hz) = ' + hand(2).toFixed(2) + ' m² sabins');
  ok(near(mixed.mid.T, (mixed.bands[2].T + mixed.bands[3].T) / 2, 1e-12), 'the mid-band figure is the mean of 500 Hz and 1 kHz');
  const peopleRoom = A.reverb({ volume_m3: V, surfaces: [{ area_m2: S, alpha: flat(0.1) }], extra: [{ name: 'curtain', a: flat(10) }] }, { air: false });
  ok(near(peopleRoom.bands[0].sabine, 0.161 * 240 / 36.8, 1e-9), 'extra absorption (a curtain, people) in m² sabins is added: ' + peopleRoom.bands[0].sabine.toFixed(3) + ' s');
  ok(!A.reverb({ volume_m3: V, surfaces: [{ area_m2: S, key: 'nonesuch' }] }).ok && !A.reverb({ volume_m3: 0, surfaces: [] }).ok, 'an unknown material or no volume is refused, not guessed');
  ok(Object.values(A.MATERIALS).every((m) => m.alpha.length === 6 && m.alpha.every((a) => a > 0 && a < 1)) && A.materialKeys('floor').includes('carpet') && !A.materialKeys('floor').includes('ceiling-tile'), 'every material has six coefficients between 0 and 1; kinds filter the lists');

  console.log('== air absorption (ISO 9613-1, 20 °C, 50 % humidity)');
  const air = Object.fromEntries(A.BANDS.map((f) => [f, A.airAbsorption(f) * 1000]));
  ok(near(air[1000], 4.7, 0.4) && near(air[2000], 9.9, 0.6) && near(air[4000], 29.7, 2) && air[125] < 1, 'dB per km: ' + A.BANDS.map((f) => f + ' Hz ' + air[f].toFixed(1)).join(', ') + ' (table: 4.7, 9.9, about 30)');
  ok(A.airAbsorption(4000, { T: 20, RH: 20 }) > A.airAbsorption(4000, { T: 20, RH: 50 }) * 0.8 && A.airAbsorption(4000, { T: 30, RH: 20 }) !== A.airAbsorption(4000), 'it depends on temperature and humidity');
  const big = { volume_m3: 5000, surfaces: [{ area_m2: 2600, alpha: flat(0.12) }] };
  const withAir = A.reverb(big), noAir = A.reverb(big, { air: false });
  ok(withAir.bands[5].T < noAir.bands[5].T * 0.9 && near(withAir.bands[0].T, noAir.bands[0].T, 0.02 * noAir.bands[0].T), 'in a big hall the air shortens the 4 kHz time (' + noAir.bands[5].T.toFixed(2) + ' → ' + withAir.bands[5].T.toFixed(2) + ' s), not the bass');

  console.log('== Problems');
  const rooms = [{ name: 'Hall', res: noAir, at: [1, 2] }, { name: 'Study', res: mixed }];
  const pr = A.rtProblems(rooms, { target: 0.6 });
  ok(pr.length === 1 && pr[0].code === 'acoustics.rt' && pr[0].req.value === 0.6 && pr[0].found.value > 0.6 && /m² more absorption/.test(pr[0].text), 'a hall over the person\'s own target gives one warning with the absorption that would meet it: ' + pr[0]?.text);
  ok(A.rtProblems(rooms, {}).length === 0, 'no target set, no Problems (the number is the person\'s, not ours)');
  const need = /About (\d+) m²/.exec(pr[0].text)[1];
  const fixed = A.reverb({ ...big, extra: [{ a: flat(Number(need)) }] }, { air: false });
  ok(fixed.mid.sabine <= 0.6 * 1.06, 'adding that absorption brings the mid Sabine time to ' + fixed.mid.sabine.toFixed(2) + ' s');

  console.log('== a computed impulse response, measured back');
  const hall = A.reverb({ volume_m3: 600, surfaces: [{ area_m2: 200, key: 'vinyl-floor' }, { area_m2: 200, key: 'ceiling-tile' }, { area_m2: 260, key: 'plaster' }] });
  const made = IR.synthIR(hall, { sr: 22050, distance: 8, seed: 3 });
  ok(made.ir.length > 22050 && made.ir[0] === 1, 'the response starts with the direct sound (' + made.ir.length + ' samples at 22.05 kHz)');
  const seeds = [1, 2, 3, 4, 5], runs = seeds.map((sd) => { const m = IR.synthIR(hall, { sr: 22050, distance: 8, seed: sd }); return A.BANDS.map((f, i) => IR.measureRT(m.ir, m.sr, i)); });
  const med = A.BANDS.map((f, i) => runs.map((r) => r[i]).sort((x, y) => x - y)[2]);
  ok(med.every((m, i) => m && rel(m, hall.bands[i].T, i === 0 ? 0.2 : 0.1)), 'measured (median of 5 noises) / made, by band: ' + A.BANDS.map((f, i) => f + ' Hz ' + med[i].toFixed(2) + '/' + hall.bands[i].T.toFixed(2)).join(', ') + ' (within 10 %; 20 % at 125 Hz, where a narrow band of noise decays unevenly)');
  const spread = runs.map((r) => r[3]);
  ok(spread.every((v) => rel(v, hall.bands[3].T, 0.06)), 'at 1 kHz every one of five noises is within 6 % (' + spread.map((v) => v.toFixed(2)).join(', ') + ' s for ' + hall.bands[3].T.toFixed(2) + ')');
  const dead = A.reverb({ volume_m3: 60, surfaces: [{ area_m2: 20, key: 'carpet' }, { area_m2: 20, key: 'ceiling-tile' }, { area_m2: 70, key: 'gypsum' }] });
  const madeD = IR.synthIR(dead, { sr: 22050, distance: 3, seed: 3 });
  const measD = IR.measureRT(madeD.ir, madeD.sr, 3);
  ok(measD && rel(measD, dead.bands[3].T, 0.2) && measD < 1, 'a small treated room: 1 kHz measured ' + (measD ? measD.toFixed(2) : '–') + ' s, made ' + dead.bands[3].T.toFixed(2) + ' s');
  ok(madeD.ir.length < made.ir.length, 'a dead room has a shorter response than a hall (' + madeD.ir.length + ' vs ' + made.ir.length + ')');
  const again = IR.synthIR(hall, { sr: 22050, distance: 8, seed: 3 }), other = IR.synthIR(hall, { sr: 22050, distance: 8, seed: 4 });
  ok(Buffer.compare(Buffer.from(again.ir.buffer), Buffer.from(made.ir.buffer)) === 0 && Buffer.compare(Buffer.from(other.ir.buffer), Buffer.from(made.ir.buffer)) !== 0, 'same seed, same bytes; another seed is another noise');
  ok(rel(IR.measureRT(other.ir, other.sr, 3), hall.bands[3].T, 0.15), 'and the other noise has the same reverberation time (' + IR.measureRT(other.ir, other.sr, 3).toFixed(2) + ' s)');
  ok(near(made.criticalDistance, Math.sqrt(200 * 0 + (hall.area * ((hall.bands[2].alpha + hall.bands[3].alpha) / 2) / (1 - (hall.bands[2].alpha + hall.bands[3].alpha) / 2)) / (16 * Math.PI)), 1e-9), 'critical distance = √(R / 16π) = ' + made.criticalDistance.toFixed(2) + ' m');
  const near1 = IR.synthIR(hall, { sr: 22050, distance: 1, seed: 3 });
  const tailE = (r) => { let e = 0; for (let i = 5000; i < r.ir.length; i++) e += r.ir[i] * r.ir[i]; return e; };
  ok(tailE(near1) < tailE(made) * 0.1, 'close to the source the tail is weaker against the direct sound than far from it');

  console.log('== convolution, listening, sounds, WAV');
  const x = Float32Array.from({ length: 300 }, (_, i) => Math.sin(i * 0.3) + 0.1 * Math.cos(i * 1.7)), h = Float32Array.from({ length: 90 }, (_, i) => Math.exp(-i / 20));
  const y = IR.convolve(x, h);
  let worst = 0;
  for (let n = 0; n < y.length; n++) { let s = 0; for (let k = 0; k < h.length; k++) if (n - k >= 0 && n - k < x.length) s += x[n - k] * h[k]; worst = Math.max(worst, Math.abs(s - y[n])); }
  ok(y.length === 389 && worst < 1e-4, 'FFT convolution equals the direct sum (largest difference ' + worst.toExponential(1) + ')');
  const sr = 22050, speech = IR.drySample('speech', sr), clap = IR.drySample('clap', sr), music = IR.drySample('music', sr);
  ok(speech.length > sr * 2 && clap.length < sr && music.length > sr * 3, 'three dry sounds: speech ' + (speech.length / sr).toFixed(1) + ' s, clap ' + (clap.length / sr).toFixed(2) + ' s, music ' + (music.length / sr).toFixed(1) + ' s');
  ok([speech, clap, music].every((s) => s.every(Number.isFinite) && Math.max(...s.map(Math.abs)) <= 1.0001 && Math.max(...s.map(Math.abs)) > 0.2), 'finite and not clipped');
  ok(Buffer.compare(Buffer.from(IR.drySample('speech', sr).buffer), Buffer.from(speech.buffer)) === 0, 'the sounds are made the same every time');
  const rms = (a, from = 0, to = a.length) => { let s = 0; for (let i = from; i < to; i++) s += a[i] * a[i]; return Math.sqrt(s / (to - from)); };
  const inHall = IR.listen(speech, made.ir, {}), inRoom = IR.listen(speech, madeD.ir, {});
  ok(near(rms(inHall, 0, speech.length), rms(speech), 0.01 * rms(speech)) && near(rms(inRoom, 0, speech.length), rms(speech), 0.01 * rms(speech)), 'heard in the room, the level matches the dry level (so only the room changes)');
  const ring = (o) => rms(o, speech.length, Math.min(o.length, speech.length + sr / 2));
  ok(inHall.length > speech.length && ring(inHall) > 3 * ring(inRoom), 'after the voice stops the hall rings on and the treated room does not (rms ' + ring(inHall).toFixed(4) + ' vs ' + ring(inRoom).toFixed(4) + ')');
  const clapHall = IR.listen(clap, made.ir, { tail: 2 }), peakAt = clapHall.reduce((m, v, i) => (Math.abs(v) > Math.abs(clapHall[m]) ? i : m), 0);
  ok(peakAt < sr * 0.1, 'a clap is loudest at the start, then dies away');
  const w = IR.wavBytes(Float32Array.from([0, 0.5, -0.5, 1, -1]), 22050), dv = new DataView(w.buffer);
  ok(String.fromCharCode(...w.slice(0, 4)) === 'RIFF' && String.fromCharCode(...w.slice(8, 12)) === 'WAVE' && dv.getUint32(24, true) === 22050 && dv.getUint32(40, true) === 10 && w.length === 54 && Math.abs(dv.getInt16(46, true) - 16384) <= 1, 'a WAV file: RIFF/WAVE header, 22050 Hz, 5 samples of 16 bits');
  const hot = IR.wavBytes(Float32Array.from([0, 3, -3]), 8000), hv = new DataView(hot.buffer);
  ok(Math.abs(hv.getInt16(46, true)) === 32767 && hv.getInt16(48, true) === -32767, 'a hot response is scaled to full scale, never clipped (a 3.0 peak becomes ±32767, not wrapped)');

  console.log('== on a drawn house (8 × 5 m, 3 m high, an inner wall at x = 4000, a door in each)');
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const AM = await import(path.join(APP, 'acoustics-model.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { readOpenings } = await import(path.join(APP, 'model-openings.js'));
  const text = N.newBuilding({ name: 'Acoustics', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'a.ifc', now: new Date('2026-10-28T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const L1 = snap.levels[0].guid, rect = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
  ed.modelChange(OPS.drawWalls({ storey: L1, segs: rect.map((p, i) => ({ a: p, b: rect[(i + 1) % 4] })), typeKey: 'ext-2x6', height: 3000, extSide: 'right' }));
  ed.modelChange(OPS.drawWalls({ storey: L1, segs: [{ a: [4000, 0], b: [4000, 5000] }], typeKey: 'int-2x4', height: 3000 }));
  snap = OPS.snapshotModel(ed);
  const south = snap.walls.find((w) => w.a[1] === 0 && w.b[1] === 0 && w.typeKey === 'ext-2x6'), inner = snap.walls.find((w) => w.typeKey === 'int-2x4');
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: inner.guid, typeKey: 'door-single', offset: 3500, face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-single-hung', offset: 5000, face: 'left' }));
  const rooms2 = AM.acousticsRooms(ed, {});
  ok(rooms2.length === 2, 'two rooms: ' + rooms2.map((r) => r.name + ' ' + r.area_m2 + ' m²').join(', '));
  const west = rooms2.find((r) => r.poly.every((p) => p[0] <= 4100)), east = rooms2.find((r) => r.poly.every((p) => p[0] >= 3900));
  ok(west.height_m === 3 && near(west.volume_m3, west.area_m2 * 3, 0.1) && west.area_m2 > 18 && west.area_m2 < 20.5, 'the west room: ' + west.area_m2 + ' m² × ' + west.height_m + ' m = ' + west.volume_m3 + ' m³');
  const mw = new ModelWriter(ed.W, ed.api, ed.mid), ops = readOpenings(mw), door = (o) => o.width * o.height / 1e6;
  const doorsWest = ops.filter((o) => o.kind === 'door').reduce((s, o) => s + door(o), 0), win = ops.filter((o) => o.kind === 'window').reduce((s, o) => s + door(o), 0);
  const sur = (r, n) => r.surfaces.find((s) => s.name === n);
  ok(sur(west, 'doors') && near(sur(west, 'doors').area_m2, doorsWest, 0.01), 'both doors open into the west room and count as wood door (' + sur(west, 'doors').area_m2.toFixed(2) + ' m²)');
  ok(near(sur(east, 'doors').area_m2, door(ops.find((o) => o.kind === 'door' && o.wall === inner.id || o.wallGuid === inner.guid)), 0.01), 'the inner door is also the east room\'s');
  ok(!sur(west, 'windows') && sur(east, 'windows') && near(sur(east, 'windows').area_m2, win, 0.01), 'the window belongs to the east room: ' + sur(east, 'windows')?.area_m2.toFixed(2) + ' m² of glass');
  const per = west.poly.reduce((acc, p, i) => acc + Math.hypot(west.poly[(i + 1) % west.poly.length][0] - p[0], west.poly[(i + 1) % west.poly.length][1] - p[1]), 0) / 1000;
  ok(near(sur(west, 'walls').area_m2 + sur(west, 'doors').area_m2 + (sur(west, 'windows')?.area_m2 || 0), per * 3, 0.01), 'walls + doors + windows = perimeter × height (' + (per * 3).toFixed(2) + ' m²)');
  const byHand = A.reverb({ volume_m3: west.volume_m3, surfaces: west.surfaces.map((s) => ({ area_m2: s.area_m2, alpha: A.MATERIALS[s.key].alpha })) });
  ok(west.res.ok && near(west.res.mid.T, byHand.mid.T, 0.005 * byHand.mid.T), 'the room\'s reverberation is the engine\'s on those numbers: ' + west.res.mid.T.toFixed(2) + ' s at mid frequencies');
  const carpeted = AM.acousticsRooms(ed, { rooms: { [west.id]: { floor: 'carpet', ceiling: 'ceiling-tile' } } }).find((r) => r.id === west.id);
  ok(carpeted.res.mid.T < west.res.mid.T * 0.8, 'carpet and a tiled ceiling bring it down: ' + west.res.mid.T.toFixed(2) + ' → ' + carpeted.res.mid.T.toFixed(2) + ' s');
  const lava = AM.acousticsRooms(ed, { rooms: { [west.id]: { floor: 'lava' } } }).find((r) => r.id === west.id);
  ok(!lava.res.ok && lava.res.reason === 'nomaterial', 'an unknown finish says so instead of guessing');
  const dry = AM.acousticsRooms(ed, { env: { RH: 20 } }).find((r) => r.id === west.id);
  ok(dry.res.bands[5].T < west.res.bands[5].T && near(dry.res.bands[1].T, west.res.bands[1].T, 0.01), 'drier air (20 % humidity) absorbs more at 4 kHz and shortens it (' + west.res.bands[5].T.toFixed(2) + ' → ' + dry.res.bands[5].T.toFixed(2) + ' s), the bass is unchanged');

  console.log('== EG.49 round 3: finishes read from the model, people and furniture, a source and a listener the person places');
  ok(west.finishSource.wall === 'model' || west.finishSource.wall === 'default', 'the room says where each finish came from: ' + JSON.stringify(west.finishSource));
  // a house of masonry walls: the inside layer is concrete, which the room now reads from the wall type
  const text2 = N.newBuilding({ name: 'Block', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'b.ifc', now: new Date('2026-10-28T12:00:00Z') });
  const engine2 = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine2.load(b))(new TextEncoder().encode(text2));
  const ed2 = new IfcEditor(WebIFC, engine2);
  const sn2 = OPS.snapshotModel(ed2), K1 = sn2.levels[0].guid, rc = [[0, 0], [6000, 0], [6000, 5000], [0, 5000]];
  ed2.modelChange(OPS.drawWalls({ storey: K1, segs: rc.map((p, i) => ({ a: p, b: rc[(i + 1) % 4] })), typeKey: 'concrete-200', height: 3000, extSide: 'right' }));
  const masonry = AM.acousticsRooms(ed2, {})[0], masonryDefault = AM.acousticsRooms(ed2, { fromModel: false })[0];
  ok(masonry.surfaces.find((s) => s.name === 'walls').key === 'concrete' && masonry.finishSource.wall === 'model', 'concrete walls are read as concrete from the wall type, not assumed to be plasterboard');
  ok(masonryDefault.surfaces.find((s) => s.name === 'walls').key === 'gypsum' && masonry.res.mid.T > masonryDefault.res.mid.T, 'with the model switched off the default plasterboard is used and the room is livelier with bare masonry (' + masonryDefault.res.mid.T.toFixed(2) + ' → ' + masonry.res.mid.T.toFixed(2) + ' s)');
  const picked = AM.acousticsRooms(ed2, { rooms: { [masonry.id]: { wall: 'wood-panel' } } })[0];
  ok(picked.surfaces.find((s) => s.name === 'walls').key === 'wood-panel' && picked.finishSource.wall === 'picked', 'a finish the person picks wins over the model\'s');
  // people: m² sabins by hand: n × PERSON_ABSORPTION per band added to A
  const base2 = AM.acousticsRooms(ed2, {})[0], crowd = AM.acousticsRooms(ed2, { people: { [base2.id]: 20 } })[0];
  const dA = crowd.res.bands.map((b, i) => b.A - base2.res.bands[i].A);
  ok(dA.every((d, i) => near(d, 20 * A.PERSON_ABSORPTION[i], 1e-9)) && crowd.res.mid.T < base2.res.mid.T, '20 people add 20 × the per-person absorption to every band (' + dA.map((d) => d.toFixed(2)).join(', ') + ' m² sabins) and shorten the room (' + base2.res.mid.T.toFixed(2) + ' → ' + crowd.res.mid.T.toFixed(2) + ' s)');
  ok(A.furnishingFor('Sofa 2000') && A.furnishingFor('Sofa 2000').key === 'sofa' && A.furnishingFor('Bed') && A.furnishingFor('Mystery') === null, 'furniture is told by its name: a sofa and a bed absorb, an unknown piece adds nothing');
  const FM = await import(path.join(APP, 'furnish-model.js'));
  const plan = FM.furnishPlan(ed2, { storey: K1, at: [3000, 2500], kind: 'living' });
  ed2.modelChange(FM.furnishOp(K1, plan.placements));
  const furnished = AM.acousticsRooms(ed2, {})[0], bare = AM.acousticsRooms(ed2, { furnishings: false })[0];
  ok(plan.placements.length > 0 && furnished.spec.extra.some((e) => e.name === 'furniture' && e.n > 0) && furnished.res.mid.T < bare.res.mid.T, 'furniture the model holds (' + plan.placements.length + ' pieces placed by the furnish tool) absorbs: ' + bare.res.mid.T.toFixed(2) + ' → ' + furnished.res.mid.T.toFixed(2) + ' s');
  // a source and a listener: the direct sound arrives at distance / c
  const rq = A.reverb({ volume_m3: 90, surfaces: [{ area_m2: 120, alpha: A.MATERIALS.gypsum.alpha }] }), rbox = { lx: 6, ly: 5, h: 3 };
  const nearIr = IR.synthIR(rq, { sr: 48000, box: rbox, source: [1, 2.5, 1.5], listener: [2, 2.5, 1.5], seed: 3 }), farIr = IR.synthIR(rq, { sr: 48000, box: rbox, source: [1, 2.5, 1.5], listener: [5, 2.5, 1.5], seed: 3 });
  ok(near(nearIr.distance, 1, 1e-9) && near(farIr.distance, 4, 1e-9) && nearIr.ir[0] === 1 && farIr.ir[0] === 1, 'a listener 1 m and 4 m from the source: the distances are what was placed (' + nearIr.distance + ', ' + farIr.distance + ' m)');
  const tailE3 = (r) => r.ir.slice(Math.round(0.05 * 48000)).reduce((s2, v) => s2 + v * v, 0);
  ok(tailE3(farIr) > tailE3(nearIr), 'the farther listener hears more reverberation relative to the direct sound: the tail is at the diffuse-field level for that distance');
  const clampedIr = IR.synthIR(rq, { sr: 48000, box: rbox, source: [-5, 2.5, 1.5], listener: [99, 2.5, 9], seed: 3 });
  ok(clampedIr.source[0] >= 0.05 && clampedIr.listener[0] <= 5.95 && clampedIr.listener[2] <= 2.95, 'a point outside the room is pulled inside it');

  const SA = await import(path.join(APP, 'sim-agents.js'));
  const tool = SA.simTools({ ed: () => ed }).find((x) => x.name === 'acoustics_check');
  const ac = tool.run({ targetS: 0.5 });
  ok(ac.rooms.length === 2 && ac.rooms[0].usedS.length === 6 && ac.bandsHz.join() === '125,250,500,1000,2000,4000' && ac.problems.length >= 1 && ac.problems[0].found.value > 0.5, 'acoustics_check: two rooms, six bands each, a Problem against a 0.5 s target (' + ac.problems.map((p) => p.text).join(' | ').slice(0, 90) + ')');
  const one = tool.run({ room: west.id, finishes: { [west.id]: { floor: 'carpet', ceiling: 'ceiling-tile' } } });
  ok(one.rooms.length === 1 && near(one.rooms[0].midS, carpeted.res.mid.T, 0.01), 'finishes can be passed per room and give the panel\'s number (' + one.rooms[0].midS + ' s)');
  let thrown = null;
  try { tool.run({ finishes: { [west.id]: { floor: 'lava' } } }); } catch (e) { thrown = e; }
  ok(thrown && thrown.code === 'invalid_argument' && /Use one of/.test(thrown.next[0]), 'an unknown finish is refused with the list to choose from');

  console.log(`\nacoustics: ${good} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
