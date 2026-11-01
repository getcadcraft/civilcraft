/* SPDX-License-Identifier: Apache-2.0 */
/**
 * env.js — the environment every solver reads (0.8 round 2, EG.32; DOM-free, no imports, canonical copy: lib/env/).
 *
 * One plain object: where the design lives. Gravity (Earth, Moon, Mars, orbit), the ambient pressure and the ambient temperature.
 *   { v: 1, preset: 'earth'|'moon'|'mars'|'orbit'|'custom', g: m/s², pressure: Pa (absolute), temperature: °C }
 * It is data, so it can be saved in a file, sent to a worker and hashed (envKey). A solver never asks "which planet": it calls
 * applyEnv(job) at the top of its entry point and gets a copy of the job in which everything the environment decides is filled in:
 *
 *   gravity loads without their own `g`        → g from the environment (mm/s²; 0 in orbit, the load stays and says so)
 *   pressure loads marked `absolute: true`     → gauge: p − the ambient pressure (a sealed vessel in vacuum sees all of its pressure)
 *   heat convection / radiation without Tamb   → the ambient temperature
 *   thermalLoad without Tref                   → the ambient temperature (the stress-free temperature)
 *
 * A job without `env` comes back unchanged (files saved before EG.32 are solved exactly as they were, with the old 9810 mm/s²).
 * Units follow PartCraft's solvers: mm, N, MPa, °C. The environment's own fields are SI (m/s², Pa, °C) because that is how the
 * published figures are quoted.
 *
 *   PRESETS, FORMAT, VERSION, newEnv(preset), readEnv(raw) (untrusted → clean copy, or throws), envKey(env),
 *   gravityMM(env), pressureMPa(env), gaugeMPa(env, absoluteMPa), weightN(env, kg), describeEnv(env),
 *   envProblems(env, ctx) → [problem], applyEnv(job) → job
 */
export const FORMAT = 'cc-env';
export const VERSION = 1;

/**
 * Figures a preset starts from. `source` says where each comes from; the temperature of a world with no atmosphere to speak of is a
 * mean the designer is expected to replace with the case that matters (`range` is the swing to check against).
 */
export const PRESETS = {
  earth: { g: 9.80665, pressure: 101325, temperature: 20, range: [-89, 57], source: 'standard gravity (CGPM 1901), standard atmosphere (exact), 20 °C reference temperature (ISO 1)' },
  moon: { g: 1.62, pressure: 0, temperature: -23, range: [-173, 123], source: 'NASA lunar fact sheet: surface gravity 1.62 m/s², mean surface temperature about 250 K, 100–396 K between night and day' },
  mars: { g: 3.71, pressure: 636, temperature: -63, range: [-143, 27], source: 'NASA Mars fact sheet: surface gravity 3.71 m/s², mean surface pressure about 636 Pa, mean temperature about 210 K' },
  orbit: { g: 0, pressure: 0, temperature: 20, range: [-65, 125], source: 'free fall (no apparent weight; tidal terms ignored); no ambient pressure; 20 °C is an assumed interior temperature, not a figure' },
};
export const PRESET_IDS = Object.keys(PRESETS).concat('custom');

const LIMITS = { g: [0, 1000], pressure: [0, 1e9], temperature: [-273.15, 1e4] };

export function newEnv(preset = 'earth') {
  const p = PRESETS[preset];
  if (!p) throw new Error('Unknown environment "' + String(preset).slice(0, 40) + '". Use earth, moon, mars, orbit, or custom values.');   // i18n-ignore: developer error
  return { v: VERSION, preset, g: p.g, pressure: p.pressure, temperature: p.temperature };
}

const bad = (m) => { throw new Error(m); };
const inRange = (v, key, what) => (typeof v === 'number' && Number.isFinite(v) && v >= LIMITS[key][0] && v <= LIMITS[key][1] ? v : bad(what + ' must be a number from ' + LIMITS[key][0] + ' to ' + LIMITS[key][1] + '.'));   // i18n-ignore: callers translate through the problem codes

/** Untrusted input (a file, a tool call) → a clean environment. Fields left out come from the preset; a preset name with edited
 *  numbers becomes 'custom' (so the label never lies). */
export function readEnv(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'object' || Array.isArray(raw)) bad('The environment must be an object.');   // i18n-ignore
  const preset = raw.preset === undefined ? 'earth' : raw.preset;
  if (!PRESET_IDS.includes(preset)) bad('Unknown environment preset.');   // i18n-ignore
  const base = newEnv(preset === 'custom' ? 'earth' : preset);
  const out = {
    v: VERSION, preset,
    g: raw.g === undefined ? base.g : inRange(raw.g, 'g', 'Gravity'),
    pressure: raw.pressure === undefined ? base.pressure : inRange(raw.pressure, 'pressure', 'Pressure'),
    temperature: raw.temperature === undefined ? base.temperature : inRange(raw.temperature, 'temperature', 'Temperature'),
  };
  if (preset !== 'custom' && (out.g !== base.g || out.pressure !== base.pressure || out.temperature !== base.temperature)) out.preset = 'custom';
  return out;
}

/** A short stable string for caching ("did the environment change since this result?"). */
export const envKey = (env) => (env ? [env.g, env.pressure, env.temperature].map((v) => +v.toPrecision(10)).join('|') : 'none');

/** Gravity in mm/s², the unit the solvers use. */
export const gravityMM = (env) => env.g * 1000;
/** Ambient pressure in MPa (N/mm²). */
export const pressureMPa = (env) => env.pressure / 1e6;
/** Gauge pressure for a sealed volume at `absoluteMPa` inside: what loads the walls. Negative = the outside pushes harder. */
export const gaugeMPa = (env, absoluteMPa) => absoluteMPa - pressureMPa(env);
/** Weight in newtons of a mass in kg. */
export const weightN = (env, kg) => kg * env.g;

/** One line for the status area and the report. */
export function describeEnv(env) {
  if (!env) return 'Standard gravity 9.81 m/s², temperature as set on each condition';   // i18n-ignore: the unset case, only for logs
  const g = env.g === 0 ? 'weightless' : +env.g.toFixed(3) + ' m/s²';
  const p = env.pressure === 0 ? 'vacuum' : +(env.pressure / 1000).toFixed(3) + ' kPa';
  return env.preset + ': ' + g + ', ' + p + ', ' + +env.temperature.toFixed(1) + ' °C';   // i18n-ignore: log text; the panel builds its own words
}

/**
 * The environment as Problems (docs/0.8-PROBLEMS-SPEC.md § 1; rule 29). Pure data: the app registers them with the shell.
 * ctx: { gravityLoads: n (gravity loads in the study), absolutePressure: n, heatNeedsAmbient: n, material: { name, maxService? } }
 *   env.orbit.gravity     note     a gravity load in a weightless environment contributes nothing
 *   env.vacuum.pressure   warning  a pressure load marked absolute in vacuum is all of it (not reduced)
 *   env.temp.range        warning  the ambient temperature is outside the preset's published swing
 *   env.temp.service      warning  the ambient temperature is above the material's service limit
 */
export function envProblems(env, ctx = {}) {
  const out = [];
  if (!env) return out;
  const at = [{ kind: 'environment', id: 'env' }];
  const mk = (code, severity, key, vars, extra = {}) => ({ id: 'partcraft.env:' + code + ':env', code, severity, msg: { key: 'env.p.' + key, vars }, about: at, source: { kind: 'check', name: 'partcraft.env' }, ...extra });
  if (env.g === 0 && ctx.gravityLoads > 0) out.push(mk('env.orbit.gravity', 'note', 'orbit_gravity', { n: ctx.gravityLoads }));
  if (env.pressure === 0 && ctx.absolutePressure > 0) out.push(mk('env.vacuum.pressure', 'warning', 'vacuum_pressure', { n: ctx.absolutePressure }));
  const p = PRESETS[env.preset];
  if (p && (env.temperature < p.range[0] || env.temperature > p.range[1])) {
    out.push(mk('env.temp.range', 'warning', 'temp_range', { T: env.temperature, lo: p.range[0], hi: p.range[1], world: env.preset }, { req: { op: 'between', value: p.range, unit: '°C' }, found: { value: env.temperature, unit: '°C' } }));
  }
  const svc = ctx.material && ctx.material.maxService;
  if (typeof svc === 'number' && env.temperature > svc) {
    out.push(mk('env.temp.service', 'warning', 'temp_service', { T: env.temperature, max: svc, material: ctx.material.name || '' }, { req: { op: '<=', value: svc, unit: '°C' }, found: { value: env.temperature, unit: '°C' } }));
  }
  return out;
}

/**
 * Fill in everything the environment decides. Returns a copy of `job` (the argument is not changed); a job with no `env` is
 * returned as it came. Safe to call twice (a second call finds nothing left to fill). The job shape is the solvers':
 *   job.bcs.loads[]  {type 'gravity', dir, g?} | {type 'pressure', p, absolute?} | …
 *   job.heat[]       {type 'convection'|'radiation', Tamb?} | …
 *   job.thermalLoad  {mode, dT, Tref?}
 *   job.env          the environment (readEnv shape)
 * `job.envApplied` is set to the key that was applied.
 */
export function applyEnv(job) {
  if (!job || !job.env) return job;
  const env = job.env, key = envKey(env);
  if (job.envApplied === key) return job;
  const out = { ...job, envApplied: key };
  if (job.bcs && Array.isArray(job.bcs.loads)) {
    out.bcs = { ...job.bcs, loads: job.bcs.loads.map((l) => {
      if (l.type === 'gravity' && (l.g === undefined || l.g === null)) return { ...l, g: gravityMM(env) };
      if (l.type === 'pressure' && l.absolute === true) { const { absolute, ...rest } = l; return { ...rest, p: gaugeMPa(env, l.p), gaugeOf: l.p }; }
      return l;
    }) };
  }
  if (Array.isArray(job.heat)) out.heat = job.heat.map((h) => ((h.type === 'convection' || h.type === 'radiation') && (h.Tamb === undefined || h.Tamb === null) ? { ...h, Tamb: env.temperature } : h));
  if (job.thermalLoad && (job.thermalLoad.Tref === undefined || job.thermalLoad.Tref === null)) out.thermalLoad = { ...job.thermalLoad, Tref: env.temperature };
  return out;
}
