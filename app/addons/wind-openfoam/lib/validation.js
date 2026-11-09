/* SPDX-License-Identifier: GPL-3.0-or-later */
/** What has and has not been checked for the OpenFOAM engine (wind-openfoam add-on). Updated by hand from docs/0.9-sessions/env-analysis-09.md when a validation run lands. */
export const OPENFOAM_VALIDATION = {
  windTunnel: false,
  plausibility: { passed: false, date: '2026-11-03', what: 'pending' },
  label: 'OpenFOAM engine: the pipeline runs end to end, but its results have NOT been validated against wind-tunnel data and the cube plausibility check is pending. Not a design value and not a certificate.',
};
