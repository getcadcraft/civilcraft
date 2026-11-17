/* SPDX-License-Identifier: Apache-2.0 */
/**
 * os-programs.js — the outside programs the Open solver cases add-on writes files for: what each is for, its licence as its own project
 * states it, and its own download page (lib/opensolvers; suggestion 1309). DOM-free data. Read on 2026-11-11:
 *   OpenFOAM (ESI)         COPYING of v2412: "You may use, distribute and copy the OpenFOAM CFD Toolbox under the terms of GNU General Public
 *                          License version 3 … or (at your option) any later version."; openfoam.com/documentation/licencing: "OpenFOAM is
 *                          distributed under the GPL v3 licence."
 *   OpenFOAM (Foundation)  openfoam.org/download: "OpenFOAM is free and open source, distributed only under the GNU General Public Licence v3";
 *                          COPYING of OpenFOAM-13: GPL version 3 "or (at your option) any later version".
 *   code_aster             code-aster.org/en/legal: "code_aster is free software distributed under the GNU General Public License (GPL) version 3".
 *   OpenRadioss            source notice: "GNU Affero General Public License … either version 3 of the License, or (at your option) any later
 *                          version." The fork's own COPYRIGHT.md says the original repository was removed on 2026-10-01 and that OpenCourant
 *                          "is the community continuation of OpenRadioss"; that statement is the fork's, not checked elsewhere.
 * None of these programs, and no code from them, is in CadCraft: CadCraft writes text files for them and reads text files they write.
 */
export const PROGRAMS = [
  { id: 'openfoam-esi', target: 'flow', name: 'OpenFOAM (openfoam.com, ESI / OpenCFD line)', licence: 'GNU General Public License, version 3 or later (GPL-3.0-or-later)', url: 'https://www.openfoam.com/download/' },
  { id: 'openfoam-foundation', target: 'flow', name: 'OpenFOAM (openfoam.org, OpenFOAM Foundation line)', licence: 'GNU General Public License, version 3 or later (GPL-3.0-or-later)', url: 'https://openfoam.org/download/' },
  { id: 'code-aster', target: 'structure', name: 'code_aster (EDF)', licence: 'GNU General Public License, version 3 or later (GPL-3.0-or-later)', url: 'https://code-aster.org/' },
  { id: 'openradioss', target: 'impact', name: 'OpenRadioss (continued by its community as OpenCourant)', licence: 'GNU Affero General Public License, version 3 or later (AGPL-3.0-or-later)', url: 'https://github.com/OpenCourant/OpenCourant/releases' },
];
/** The sentence every listing carries (the words shown come from the host's language file; this is the reference text). */
export const SEPARATE = 'These programs are separate from CadCraft. They are not part of it, and you add them to your own computer yourself.';
