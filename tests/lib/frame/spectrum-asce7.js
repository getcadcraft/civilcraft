/* SPDX-License-Identifier: Apache-2.0 */
/**
 * spectrum-asce7.js — the ASCE 7 design response spectrum (0.9 SU.1056b). DOM-free, imports nothing. The one place the spectrum is
 * defined: the response-spectrum analysis (lib/fem) imports `designSpectrum` from here, the Seismic block of the frame panel
 * draws and reports it, and `seismic-asce7.js` makes SDS and SD1 for it.
 *
 *   designSpectrum({ SDS, SD1, TL = 8, periods?, ordinates? }) → Sa(T) in g (a function), with the fields
 *       .T0 = 0.2 SD1 / SDS · .Ts = SD1 / SDS · .TL · .SDS · .SD1 · .kind ('two-period' | 'multi-period') · .at(T) the same as calling it
 *     two-period (ASCE 7-16 11.4.6, ASCE 7-22 11.4.5.2 where no multi-period spectrum exists):
 *       T < T0:        Sa = SDS (0.4 + 0.6 T / T0)        (so Sa(0) = 0.4 SDS, a straight line up to SDS at T0)
 *       T0 ≤ T ≤ Ts:   Sa = SDS
 *       Ts < T ≤ TL:   Sa = SD1 / T
 *       T > TL:        Sa = SD1 TL / T²
 *     multi-period (ASCE 7-22 11.4.5.1): `periods` (s, ascending) and `ordinates` (g) as the USGS service returns them for a site
 *     (the 22 periods 0 … 10 s); straight lines between the points (the standard says to interpolate; the readers of this file
 *     must confirm the rule in their copy), the last ordinate held beyond the last period.
 *   spectrumPoints(spectrum, periods?) → [[T, Sa]] for a table or a plot
 *
 * Sources (read 2026-11-06; every number kept here is printed by at least two independent public pages — loads-sources.js is the list):
 *   the shape and its four formulas: the SEAOC Structural/Seismic Design Manual Vol. 1 (2021 IBC) sample, Design Example 2 (SDS 0.55, SD1 0.34,
 *   TL 8 → T0 0.12, Ts 0.62; Sa 0.22 at T = 0, 0.34 at 1 s, 0.17 at 2 s, 0.04 at 8 s), FEMA P-2192-V1, and the USGS design-ground-motions
 *   service, whose ASCE 7-22 two-period ordinates for SDS 1.45, SD1 1.13 are 0.58 at T = 0, 1.45 on the plateau, 1.13 at 1 s, 0.11 at 9 s.
 * The standard itself is not held here and nothing here is a code check; the engineer reviews the results.
 */
export const EDITION = 'ASCE/SEI 7-16 11.4.6; ASCE/SEI 7-22 11.4.5';

export function designSpectrum({ SDS, SD1, TL = 8, periods = null, ordinates = null }) {
  if (!(SDS > 0) || !(SD1 >= 0)) throw new Error('designSpectrum: SDS must be above 0 and SD1 not negative');
  const T0 = SD1 > 0 ? 0.2 * SD1 / SDS : 0, Ts = SD1 / SDS;
  const multi = Array.isArray(periods) && Array.isArray(ordinates) && periods.length === ordinates.length && periods.length >= 2
    && periods.every((p, k) => Number.isFinite(p) && Number.isFinite(ordinates[k]) && (k === 0 || p > periods[k - 1]));
  let f;
  if (multi) {
    f = (T) => {
      if (!(T >= 0)) return NaN;
      if (T <= periods[0]) return ordinates[0];
      for (let k = 1; k < periods.length; k++) {
        if (T <= periods[k]) { const a = periods[k - 1], b = periods[k]; return ordinates[k - 1] + (ordinates[k] - ordinates[k - 1]) * (T - a) / (b - a); }
      }
      return ordinates[ordinates.length - 1];
    };
  } else {
    f = (T) => {
      if (!(T >= 0)) return NaN;
      if (T < T0) return SDS * (0.4 + 0.6 * T / T0);
      if (T <= Ts) return SDS;
      if (T <= TL) return SD1 / T;
      return SD1 * TL / (T * T);
    };
  }
  f.at = f;
  f.T0 = T0; f.Ts = Ts; f.TL = TL; f.SDS = SDS; f.SD1 = SD1;
  f.kind = multi ? 'multi-period' : 'two-period';
  return f;
}

/** [[T, Sa]] at the periods given (default: 0, T0, Ts, a few more up to TL and past it). */
export function spectrumPoints(spectrum, periods = null) {
  const list = periods || [...new Set([0, spectrum.T0, spectrum.Ts, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5, 6, spectrum.TL, spectrum.TL + 2].map((v) => Math.round(v * 1e4) / 1e4))]
    .filter((v) => v >= 0).sort((a, b) => a - b);
  return list.map((T) => [T, spectrum(T)]);
}
