/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ps-kiri.js — a print job through Kiri:Moto's engine (roadmap PS.13; MIT, assets/vendor/kiri-moto, loaded on first use). No DOM of ours and no imports: its copy
 * lives in the slicer-kiri add-on. Its bundle runs a worker of its own.
 *
 *   sliceWithKiri(tris, job, { base, stl, startLines, endLines, onProgress, signal }) → Promise<[lines]>
 *     Its model is one widget centred on the bed, so the plate goes in as one STL and is moved back to where the person put it.
 */
export function kiriSettings(job, startLines, endLines) {
  const rate = job.speed;
  return {
    device: {
      bedWidth: job.bed[0], bedDepth: job.bed[1], maxHeight: job.bed[2], bedRound: false, originCenter: false, extrudeAbs: false,
      gcodePre: startLines, gcodePost: endLines,
      extruders: [{ extFilament: job.filament, extNozzle: job.nozzle, extSelect: ['T0'], extDeselect: [], extOffsetX: 0, extOffsetY: 0 }],
    },
    process: {
      sliceHeight: job.layer, firstSliceHeight: Math.max(job.layer, Math.min(0.3, job.nozzle * 0.75)), sliceLineWidth: job.nozzle * 1.1,
      sliceShells: job.walls, sliceTopLayers: job.top, sliceBottomLayers: job.bottom, sliceFillSparse: job.infill / 100, sliceFillType: 'hex',
      sliceSupportEnable: !!job.supports, outputTemp: job.nozzle_temp, outputBedTemp: job.bed_temp, firstLayerNozzleTemp: job.nozzle_temp, firstLayerBedTemp: job.bed_temp,
      outputFanSpeed: Math.round(job.fan * 2.55), outputFeedrate: rate, outputFinishrate: rate * 0.6, firstLayerRate: Math.min(20, rate), outputSeekrate: 150,
      outputRetractDist: job.retract, outputRetractSpeed: 40, outputBrimCount: job.skirt ? 2 : 0, outputBrimOffset: 4, outputRaft: false,
    },
  };
}

export async function sliceWithKiri(tris, job, { base, stl, startLines, endLines, onProgress = null, signal = null }) {
  const { Engine } = await import(base + 'pack/kiri-eng.js');
  const lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
  let zMin = Infinity;
  for (const t of tris) for (const p of t) { for (let k = 0; k < 2; k++) { if (p[k] < lo[k]) lo[k] = p[k]; if (p[k] > hi[k]) hi[k] = p[k]; } if (p[2] < zMin) zMin = p[2]; }
  const engine = new Engine({ workURL: base + 'pack/kiri-work.js', poolURL: base + 'pack/kiri-pool.js' });
  const { device, process } = kiriSettings(job, startLines, endLines);
  engine.setMode('FDM').setDevice(device).setProcess(process);
  engine.setListener((m) => {
    if (signal?.aborted) return;
    const update = m?.slice?.update ?? m?.prepare?.update;
    if (typeof update === 'number') onProgress?.({ stage: 'kiri', layer: Math.round(update * 100), layers: 100 });
  });
  await engine.parse(stl.buffer);
  engine.moveTo((lo[0] + hi[0]) / 2 - job.bed[0] / 2, (lo[1] + hi[1]) / 2 - job.bed[1] / 2, 0);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  await engine.slice();
  await engine.prepare();
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return (await engine.export()).split(/\r?\n/);
}
