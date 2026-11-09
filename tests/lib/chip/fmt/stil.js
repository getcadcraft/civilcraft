/* SPDX-License-Identifier: Apache-2.0 */
/**
 * stil.js — STIL (IEEE 1450) pattern writer for testers: Signals, SignalGroups, one WaveformTable (period, drive and strobe times, clock
 * pulses), a PatternBurst / PatternExec and one Pattern made from a vector list. Written from the public description of IEEE 1450-1999.
 * No WGL. Plus readStilVectors(), which reads back the subset this writer writes (for checks and tests; not a general STIL reader).
 *
 *   writeStil({ title, signals: [{ name, dir: 'In'|'Out'|'InOut', clock?: { rise, fall } }], period, drive, strobe, vectors, name })
 *     period/drive/strobe in ns; vectors = [ 'string in signal order' | { signal: char } ]
 *     chars: inputs 0 1, clocks 0 P (P = one pulse at rise..fall), outputs L H X (Z = expect off), InOut also 0/1
 *   → { text, problems }
 */
import { prob, num } from './problem.js';

const ID = /^[A-Za-z_][A-Za-z0-9_]*$/;
const sig = (n) => (ID.test(n) ? n : '"' + n.replace(/"/g, '') + '"');
const ns = (v) => "'" + num(v) + "ns'";

export function writeStil({ title = 'CadCraft patterns', signals, period = 100, drive = 0, strobe, vectors, name = 'pat', date } = {}) {
  const problems = [];
  if (!signals?.length) return { text: '', problems: [prob('stil.no-signals', 'No signals were given.')] };
  if (strobe === undefined) strobe = period * 0.9;
  if (!(period > 0)) problems.push(prob('stil.period', 'The period must be greater than 0.'));
  if (drive < 0 || drive >= period) problems.push(prob('stil.drive', 'The drive time ' + drive + ' ns is outside the period.'));
  if (strobe <= drive || strobe >= period) problems.push(prob('stil.strobe', 'The strobe time ' + strobe + ' ns must come after the drive time and before the end of the period.', { severity: 'warning' }));
  const ins = signals.filter((s) => s.dir === 'In' && !s.clock), clocks = signals.filter((s) => s.clock), outs = signals.filter((s) => s.dir === 'Out'), ios = signals.filter((s) => s.dir === 'InOut');
  for (const c of clocks) if (!(c.clock.rise >= 0 && c.clock.fall > c.clock.rise && c.clock.fall < period)) problems.push(prob('stil.clock', 'Clock ' + c.name + ' pulse ' + c.clock.rise + '–' + c.clock.fall + ' ns does not fit the period.'));
  const names = signals.map((s) => s.name); if (new Set(names).size !== names.length) problems.push(prob('stil.dup', 'Two signals have the same name.'));
  const L = ['STIL 1.0;', '', 'Header {', '  Title "' + String(title).replace(/"/g, "'") + '";', '  Source "CadCraft Chip design";'];
  if (date) L.push('  Date "' + date + '";'); L.push('}', '', 'Signals {');
  for (const s of signals) L.push('  ' + sig(s.name) + ' ' + (s.dir === 'Out' ? 'Out' : s.dir === 'InOut' ? 'InOut' : 'In') + ';');
  L.push('}', '', 'SignalGroups {');
  const groups = [['all_in', ins], ['all_clk', clocks], ['all_io', ios], ['all_out', outs]].filter(([, l]) => l.length);
  for (const [g, l] of groups) L.push('  ' + g + " = '" + l.map((s) => sig(s.name)).join(' + ') + "';");
  L.push("  all_pins = '" + signals.map((s) => sig(s.name)).join(' + ') + "';", '}', '');
  L.push('Timing {', '  WaveformTable wft {', '    Period ' + ns(period) + ';', '    Waveforms {');
  if (ins.length) L.push('      all_in { 01 { ' + ns(drive) + ' D/U; } }');
  for (const c of clocks) L.push('      ' + sig(c.name) + ' { 0P { ' + ns(0) + ' D; ' + ns(c.clock.rise) + ' D/U; ' + ns(c.clock.fall) + ' D; } }');
  if (ios.length) L.push('      all_io { 01 { ' + ns(drive) + ' D/U; } }', '      all_io { LHXZ { ' + ns(0) + ' Z; ' + ns(strobe) + ' L/H/X/T; } }');
  if (outs.length) L.push('      all_out { LHXZ { ' + ns(0) + ' Z; ' + ns(strobe) + ' L/H/X/T; } }');
  L.push('    }', '  }', '}', '');
  L.push('PatternBurst burst {', '  PatList { ' + name + '; }', '}', '', 'PatternExec {', '  PatternBurst burst;', '}', '');
  L.push('Pattern ' + name + ' {', '  W wft;');
  const ok = new Map(signals.map((s) => [s.name, s.clock ? '0P' : s.dir === 'Out' ? 'LHXZ' : s.dir === 'InOut' ? '01LHXZ' : '01']));
  vectors.forEach((v, k) => {
    const row = typeof v === 'string' ? Object.fromEntries(signals.map((s, i) => [s.name, v[i]])) : v;
    if (typeof v === 'string' && v.length !== signals.length) problems.push(prob('stil.width', 'Vector ' + (k + 1) + ' has ' + v.length + ' characters for ' + signals.length + ' signals.'));
    const char = (s) => { const c = row[s.name] ?? (s.dir === 'Out' ? 'X' : s.clock ? '0' : undefined); if (!ok.get(s.name).includes(c)) problems.push(prob('stil.char', 'Vector ' + (k + 1) + ' gives ' + s.name + ' "' + c + '", which a ' + (s.clock ? 'clock' : s.dir) + ' signal cannot take (' + ok.get(s.name).split('').join(' ') + ').')); return c; };
    const parts = [];
    for (const [g, l] of groups) if (g !== 'all_clk') parts.push(g + ' = ' + l.map(char).join('') + ';');
    for (const c of clocks) parts.push(sig(c.name) + ' = ' + char(c) + ';');
    L.push('  V { ' + parts.join(' ') + ' }');
  });
  L.push('}', '');
  return { text: L.join('\n'), problems };
}

/** Read back the vectors of a STIL file this writer made: [{ group: chars }] in pattern order, plus the signal groups. */
export function readStilVectors(text) {
  const s = String(text), groups = {}; const g = /SignalGroups\s*\{([\s\S]*?)\}/.exec(s);
  if (g) for (const m of g[1].matchAll(/(\w+)\s*=\s*'([^']*)'\s*;/g)) groups[m[1]] = m[2].split('+').map((x) => x.trim().replace(/^"|"$/g, ''));
  const per = /Period\s*'([\d.]+)ns'/.exec(s), vectors = [];
  for (const m of s.matchAll(/V\s*\{([^}]*)\}/g)) { const v = {}; for (const a of m[1].matchAll(/("?[\w]+"?)\s*=\s*([^;\s]+)\s*;/g)) v[a[1].replace(/"/g, '')] = a[2]; vectors.push(v); }
  return { groups, period: per ? Number(per[1]) : undefined, vectors };
}
