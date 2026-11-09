/* SPDX-License-Identifier: Apache-2.0 */
/**
 * loads-sources.js — where every wind, seismic and combination number of lib/frame came from (0.9 SU.1056b). Data only, no imports.
 * Rule (owner, 2026-11-06): a table value is kept only when at least TWO independent public pages print it; every page was read
 * on DATE_READ; nothing was typed from memory; the standard itself (ASCE/SEI 7) is not held, only what these public pages print.
 * `UNCONFIRMED` lists what could not be confirmed and is therefore LEFT OUT (or left to the person to type).
 * Editions are kept apart: wind = ASCE 7-10 and 7-16 forms (7-22 moved Kd and revised Kz: not built); seismic site tables = ASCE 7-16
 * (7-22 has no Fa/Fv tables: SMS and SM1 come from the USGS service or are typed); combinations = the 7-10 / 7-16 forms.
 */
export const DATE_READ = '2026-11-06';

const U = {
  bentleyWind: 'https://DOCS.BENTLEY.COM/LiveContent/web/STAAD.Pro Help-v20/ja/GUID-097B8DD9-8D53-45D7-AE98-EE3F8BCDBC99.html',
  bentleyKz: 'https://DOCS.BENTLEY.COM/LiveContent/web/STAAD.Pro Help-v20/en/GUID-58DCD909-BE9F-4D23-B155-EFDF86AD5AD1.html',
  skycivWind716: 'https://skyciv.com/docs/tech-notes/loading/asce-7-16-wind-load-calculation-example-for-l-shaped-building/',
  skycivWindP: 'https://skyciv.com/?p=16565',
  spri: 'https://www.spri.org/wp-content/uploads/2023/10/2-2023-WDS-ASCE-7_Chamberlain.pdf',
  dlubal: 'https://www.dlubal.com/zh/support-and-learning/support/knowledge-base/001546',
  neTexas: 'https://branches.asce.org/northeasttexas/sites/branches.asce.org.northeasttexas/files/ASCE7-16_PPT_2021.pdf',
  enercalc: 'https://media.enercalc.com/faq_help_20/asce_7-10_wind_forces__chapter.htm',
  calcs: 'https://calcs.com/docs/calculations/us/wind_loads_mwfrs_directional_asce_7',
  medeek: 'https://design.medeek.com/resources/DOCUMENTS/ASCE7-10_SEC26.8.pdf',
  steelcalc: 'https://steelcalculator.pages.dev/tools/wind-load/',
  steelcalcRef: 'https://steelcalculator-dev.pages.dev/reference/wind-load-calculation-asce7/',
  structure716: 'https://www.structuremag.org/article/technical-aspects-of-asce-7-16/',
  seaog722: 'https://seaog.org/images/meeting/031825/seaog_asce_7_22_wind_changes.pdf',
  ghosh716: 'https://www.skghoshassociates.com/asce-7-16',
  idecadSite: 'https://help.idecad.com/ideCAD/11-4-4-site-coefficients',
  idecadSys: 'https://help.idecad.com/ideCAD/12-2-structural-system-selection',
  idecadCu: 'https://help.idecad.com/ideCAD/12-8-2-determination-of-the-building-s-fundamental',
  idecadIe: 'https://help.idecad.com/ideCAD/1-5-1-1-5-2-risk-category-of-building-and-importan',
  seaocEx: 'https://shop.iccsafe.org/media/wysiwyg/material/9011S211-Sample.pdf',
  seaoc24: 'https://shop.iccsafe.org/media/wysiwyg/material/9011S243-Sample.pdf',
  p2192: 'https://nibs.org/wp-content/uploads/2025/04/fema_nehrp_design-examples-and-training-materials_volume01.pdf',
  seau722: 'https://seau.org/images/meeting/022024/seau_2024_asce_7_22_updates.pdf',
  usgs722: 'https://earthquake.usgs.gov/ws/building-codes/asce7-22/calculate',
  usgs716: 'https://earthquake.usgs.gov/ws/building-codes/asce7-16/calculate',
  bentleyRam: 'https://docs.bentley.com/LiveContent/web/RAM%20Structural%20System%20Help-v4/en/GUID-7C0568C6-D473-4EF0-B1A3-25C2CC31A10B.html',
  iisee: 'https://iisee.kenken.go.jp/net/seismic_design_code/usa/table5_usa.html',
  iiseeCu: 'https://iisee.kenken.go.jp/net/seismic_design_code/usa/table4_usa.html',
  skycivSeis: 'https://skyciv.com/docs/tech-notes/loading/asce-7-16-seismic-load-calculation-example/',
  autodeskK: 'https://help.autodesk.com/cloudhelp/2027/ENU/RSAPRO-UsersGuide/files/GUID-E9A36A99-569E-4EA3-8043-7093C1EFDD32.htm',
  seain: 'https://seain.org/images/meeting/030520/seismic_r___1__1.5__3_with_low_seismic_design_example.pdf',
  asce710: 'https://www.waterboards.ca.gov/waterrights/water_issues/programs/bay_delta/california_waterfix/exhibits/docs/dd_jardins/DDJ-148%20ASCE%207-10.pdf',
  skycivLrfd: 'https://skyciv.com/docs/tech-notes/load-combinations/asce-7-10-lrfd/',
  skycivAsd: 'https://skyciv.com/docs/tech-notes/load-combinations/asce-7-10-asd/',
  umass: 'http://www.ecs.umass.edu/cee434/handouts/LoadCombs_16.pdf',
  idecadCombo: 'https://help.idecad.com/ideCAD/load-combination-and-strength-design',
  iccManual: 'https://shop.iccsafe.org/media/wysiwyg/material/8983P18-Sample.pdf',
  steelcalcCombo: 'https://steelcalculator.pages.dev/reference/load-combinations-asce7/',
};

/** id → { what, edition, urls[] }: each item has two or more independent pages. */
export const SOURCES = Object.freeze({
  'wind.qz': { what: 'qz = 0.00256 Kz Kzt Kd V² (psf, mph); 7-16 adds Ke', edition: '7-10, 7-16', urls: [U.spri, U.bentleyWind, U.skycivWindP, U.neTexas, U.dlubal] },
  'wind.Kd': { what: 'Kd = 0.85 for buildings (MWFRS)', edition: '7-10, 7-16', urls: [U.bentleyWind, U.skycivWind716, U.steelcalc] },
  'wind.Ke': { what: 'Ke = e^(−0.0000362 ze) with ze in feet (= e^(−0.000119 ze) in metres); Ke = 1.0 is allowed (conservative)', edition: '7-16', urls: [U.bentleyKz, U.skycivWind716, U.dlubal, U.spri, U.structure716] },
  'wind.Kzt': { what: 'Kzt = (1 + K1 K2 K3)²', edition: '7-10, 7-16', urls: [U.medeek, U.spri] },
  'wind.Kz': { what: 'Kz = 2.01 (z/zg)^(2/α), z not below 15 ft; α, zg: B 7.0 / 1200 ft, C 9.5 / 900 ft, D 11.5 / 700 ft', edition: '7-10, 7-16', urls: [U.bentleyKz, U.bentleyWind, U.skycivWindP, U.steelcalc, U.skycivWind716] },
  'wind.Kz-points': { what: 'Table values used as checks: Exposure C 0.85 (0-15 ft), 0.90 (20 ft), 0.98 (30 ft); Exposure B 0.57, 0.62, 0.70, 0.76 (0-15, 20, 30, 40 ft)', edition: '7-10, 7-16', urls: [U.skycivWindP, U.steelcalcRef, U.bentleyKz, U.bentleyWind] },
  'wind.G': { what: 'G = 0.85 for rigid buildings (natural frequency at least 1 Hz)', edition: '7-10, 7-16, 7-22', urls: [U.medeek, U.bentleyWind, U.calcs, U.enercalc] },
  'wind.GCpi': { what: 'GCpi = ±0.18 enclosed, ±0.55 partially enclosed, 0 open', edition: '7-10, 7-16', urls: [U.spri, U.steelcalcRef, U.bentleyWind, U.skycivWind716, U.skycivWindP] },
  'wind.Cp': { what: 'Cp walls: windward 0.8, side −0.7, leeward −0.5 for L/B 0 to 1', edition: '7-10, 7-16', urls: [U.skycivWind716, U.skycivWindP, 'https://steelcalculator.pages.dev/guides/wind-load-worked-example/'] },
  'wind.p': { what: 'p = q G Cp − qi (GCpi); q = qz windward wall, qh leeward, side and roof; qi = qh for enclosed', edition: '7-10, 7-16, 7-22', urls: [U.bentleyWind, U.skycivWind716, U.calcs] },
  'wind.min16': { what: 'Minimum wind load 16 psf on the wall area', edition: '7-10, 7-16', urls: [U.enercalc, 'https://docs.bentley.com/LiveContent/web/RAM%20Structural%20System%20Help%20Complete-v5/en/GUID-3B8B8C83-6721-4FC1-AB84-AAD73E0CA6AE.html', 'https://calcs.com/docs/calculations/us/wind_loads__asce_7_16____mwfrs_overview'] },
  'wind.example': { what: 'Worked example (STAAD verification): V 110 mph, Exposure B, h 20 ft, qh = 16.42847 psf, windward p at 20 ft = 14.13 psf', edition: '7-10', urls: [U.bentleyWind] },
  'wind.example-SI': { what: 'Worked example (SI, partially enclosed): Exposure C, V 52 m/s, Ke 0.987, Kz(5 m) 0.865, q 1202.87 Pa, qh 1271.01 Pa', edition: '7-16', urls: [U.skycivWind716] },
  'seis.Fa': { what: 'Fa, Table 11.4-1, site classes A to D, Ss ≤0.25 / 0.5 / 0.75 / 1.0 / 1.25 / ≥1.5, straight-line interpolation', edition: '7-16', urls: [U.ghosh716, U.idecadSite, U.seaocEx] },
  'seis.Fv': { what: 'Fv, Table 11.4-2, site classes A to D, S1 ≤0.1 / 0.2 / 0.3 / 0.4 / 0.5 / ≥0.6, straight-line interpolation', edition: '7-16', urls: [U.ghosh716, U.idecadSite, U.seaocEx] },
  'seis.SD': { what: 'SMS = Fa Ss, SM1 = Fv S1, SDS = 2/3 SMS, SD1 = 2/3 SM1', edition: '7-16, 7-22', urls: [U.seaocEx, U.p2192, U.seau722] },
  'seis.no-FaFv-722': { what: 'ASCE 7-22 has no Fa/Fv tables: SMS and SM1 come per site (USGS geodatabase)', edition: '7-22', urls: [U.p2192, U.seau722, U.usgs722] },
  'seis.D-exception': { what: 'Site class D with S1 ≥ 0.2 (7-16 11.4.8): not required if SM1 is increased 50 % and the resulting SD1 is used everywhere', edition: '7-16 (Supplement 3)', urls: [U.seaocEx, U.p2192, U.usgs716] },
  'seis.spectrum': { what: 'Design response spectrum: Sa = SDS(0.4 + 0.6 T/T0), SDS plateau, SD1/T, SD1 TL/T²; T0 = 0.2 SD1/SDS, Ts = SD1/SDS', edition: '7-16 11.4.6; 7-22 11.4.5.2', urls: [U.seaocEx, U.p2192, U.usgs722] },
  'seis.Ie': { what: 'Ie: Risk Category II 1.0, IV 1.5', edition: '7-16, 7-22', urls: [U.idecadIe, U.p2192] },
  'seis.Ct': { what: 'Table 12.8-2 (US units, hn in ft): steel moment frame 0.028 / 0.8, concrete moment frame 0.016 / 0.9, steel EBF and BRBF 0.03 / 0.75, all other 0.02 / 0.75', edition: '7-16, 7-22', urls: [U.bentleyRam, U.p2192, U.iisee] },
  'seis.Cu': { what: 'Table 12.8-1 Cu: SD1 ≥0.4 1.4, 0.3 1.4, 0.2 1.5, 0.15 1.6, ≤0.1 1.7', edition: '7-16', urls: [U.idecadCu, U.iiseeCu, U.p2192] },
  'seis.Cs': { what: 'Cs = SDS/(R/Ie), at most SD1/(T R/Ie) (T ≤ TL) or SD1 TL/(T² R/Ie), at least max(0.044 SDS Ie, 0.01), and 0.5 S1/(R/Ie) where S1 ≥ 0.6', edition: '7-16 (7-22 example)', urls: [U.skycivSeis, U.p2192] },
  'seis.k': { what: 'k = 1 for T ≤ 0.5 s, 2 for T ≥ 2.5 s, 1 + (T − 0.5)/2 between; Fx = Cvx V', edition: '7-16, 7-22', urls: [U.skycivSeis, U.autodeskK, U.p2192] },
  'seis.R-steel': { what: 'Table 12.2-1 R, Ω0, Cd: steel SMF 8/3/5.5, OMF 3.5/3/3, SCBF (building frame) 6/2/5, OCBF 3.25/2/3.25, steel not specifically detailed 3/3/3', edition: '7-16', urls: [U.idecadSys, U.seain] },
  'seis.R-rc-smf': { what: 'Table 12.2-1 R, Ω0, Cd: reinforced concrete special moment frame 8/3/5.5', edition: '7-16', urls: [U.idecadSys, U.seaoc24] },
  'seis.R-722-coupled': { what: 'Table 12.2-1 (7-22): ductile coupled reinforced concrete walls 8/2.5/8', edition: '7-22', urls: [U.seau722, U.p2192] },
  'seis.usgs': { what: 'USGS building-codes web services (ASCE 7-16 and 7-22), GET, no key, CORS open for GET', edition: '7-16, 7-22', urls: [U.usgs716, U.usgs722] },
  'combo.lrfd': { what: 'LRFD 1.4D; 1.2D+1.6L+0.5(Lr|S|R); 1.2D+1.6(Lr|S|R)+(L|0.5W); 1.2D+1.0W+L+0.5(Lr|S|R); 1.2D+1.0E+L+0.2S; 0.9D+1.0W; 0.9D+1.0E', edition: '7-10, 7-16', urls: [U.asce710, U.skycivLrfd, U.umass, U.idecadCombo] },
  'combo.asd': { what: 'ASD D; D+L; D+(Lr|S|R); D+0.75L+0.75(Lr|S|R); D+(0.6W|0.7E); D+0.75L+0.75(0.6W)+0.75(Lr|S|R); D+0.75L+0.75(0.7E)+0.75S; 0.6D+0.6W; 0.6D+0.7E', edition: '7-10, 7-16', urls: [U.asce710, U.skycivAsd, U.idecadCombo, U.steelcalcCombo] },
  'combo.Ev': { what: 'E = Eh ± Ev; Eh = ρ QE; Ev = 0.2 SDS D; Em = Ω0 QE; (1.2+0.2SDS)D + ρQE + L + 0.2S; (0.9−0.2SDS)D + ρQE; ASD (1.0+0.14SDS)D + 0.7ρQE; (0.6−0.14SDS)D + 0.7ρQE; overstrength with Ω0 in place of ρ', edition: '7-10 section 12.4 (7-16 forms Ev/Eh/Emh in UMass, ideCAD)', urls: [U.asce710, U.iccManual, U.steelcalcCombo, U.umass, U.idecadCombo] },
});

/** Left out (or left to the person to type) because two public pages did not both print it. */
export const UNCONFIRMED = Object.freeze([
  'Wind speed V by Risk Category (map values: the person types V)',
  'The literal SI coefficient 0.613 (the SI form here is converted from the printed 0.00256 mph / psf constant, so it is about 0.05 % above 0.613)',
  'The complete Kz table (every height) and any Exposure D table value: Kz comes from the formula, which is confirmed; only the points in wind.Kz-points were read as table values',
  'ASCE 7-22 wind: Kz was revised (about 2 % lower for B and C), Kd moved out of qz; the 7-22 Kz table was not found on two pages, so only the 7-10 / 7-16 form is built',
  'Leeward Cp for L/B = 2 (−0.3) and L/B ≥ 4 (−0.2), roof Cp table: one publisher each; the leeward −0.5 is used (and flagged) beyond L/B 1, or the person types Cp',
  'Minimum roof wind load 8 psf; wind torsion cases (Figure 27.3-8 eccentricity): the person sets the eccentricity',
  'Ke Table 26.9-1 values (the confirmed exponential is used; it differs a little from the table, e.g. 0.826 against 0.82 at 5280 ft)',
  'Fa / Fv for site class E and F (7-16): the tables list numbers on one page only; give SDS and SD1 from a site-specific study',
  'ASCE 7-22 Fa / Fv: none exist (tables removed); BC, CD, DE classes need the USGS service or typed SMS and SM1',
  'Risk Category I and III importance factors (one page each): type Ie',
  'Table 12.12-1 story drift limits (0.020 / 0.015 / 0.010 hsx, already in loads-asce7.js): not printed on two pages; ASCE 7-22 also has a 0.025 hsx row for Risk II structures of four stories or less. Check the limit yourself',
  'Accidental torsion 5 % (12.8.4.2), Ax amplification, redundancy ρ 1.0 / 1.3: one page each; ρ is an input, the 5 % stays as built in 0.8 and is flagged',
  'R, Ω0, Cd and height limits for intermediate / ordinary RC frames, EBF, BRBF, shear-wall and dual systems, wood: one page each',
  'Table 12.8-2 SI coefficients (0.0724 and others of 0.8): not printed on any page; now converted from the confirmed US values',
  'ASCE 7-22 section 2.3.6 combinations: not read; the 7-10 / 7-16 forms are built',
  'Eurocode EN 1991-1-4 simplified wind: no second free source for the terrain table; not built (the National Annex changes the parameters anyway)',
]);
