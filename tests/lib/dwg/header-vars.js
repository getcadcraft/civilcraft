/* SPDX-License-Identifier: Apache-2.0 */
/**
 * header-vars.js — the AcDb:Header variables, one table for reading and writing. cc-dwg (Apache-2.0),
 * written from the ODA "Open Design Specification for .dwg files" v5.4.1, chapter 9 (and 2 for the codes).
 *
 *   HEADER_VARS: [{ name, type, from, to, dxf?, def? }]  in file order
 *     name  DXF name without '$' (PINSBASE … for the paper-space copies), or an UNKNOWN_n / *_OBJECT name
 *     type  B BS BL BLL BD RC RS RL TV T H HS CMC 3BD 2RD TD TS
 *           H  = handle reference (handle stream from R2007), stored as a hex string ('' for none)
 *           HS = HANDSEED: a handle with code 0 in the data stream, hex string
 *           TD = Julian date as two BLs (day, ms) → day + ms / 86400000
 *           TS = time span as two BLs (days, ms) → days + ms / 86400000
 *     from, to  version numbers (12 R13, 14 R14, 15 R2000, 18 R2004, 21 R2007, 24 R2010, 27 R2013, 32 R2018)
 *     def   the value the ODA spec names as default, where it does
 *   VERSION_NUM: { AC1012: 12, … AC1032: 32 }
 *   varsFor(ver) → the entries present in that version
 *   decodeHeaderVars(r, ver, opts) → { vars, order }  r = BitReader positioned on the first variable;
 *     opts.handles = BitReader for the handle stream (R2007+), opts.after(name, r) hook for the caller.
 *   FLAG_BITS: the R2000+ "Flags" BL split into CELWEIGHT ENDCAPS JOINSTYLE LWDISPLAY XEDIT EXTNAMES PSTYLEMODE OLESTARTUP
 *
 * The writer walks HEADER_VARS for its version and writes each type with its own BitWriter.
 */
import { msg } from './messages.js';

export const VERSION_NUM = { AC1012: 12, AC1014: 14, AC1015: 15, AC1018: 18, AC1021: 21, AC1024: 24, AC1027: 27, AC1032: 32 };

const ALL = [12, 99], R13_14 = [12, 14], PRE2004 = [12, 15], R2004P = [18, 99], R2000P = [15, 99],
  R2007P = [21, 99], R2010P = [24, 99], R2013P = [27, 99], R13_18 = [12, 18], R13_15 = [12, 15], R2007 = [21, 21],
  R14P = [14, 99];

const rows = [];
const v = (range, type, name, dxf, def) => rows.push({ name, type, from: range[0], to: range[1], dxf, def });
const many = (range, type, names) => { for (const n of names) v(range, type, n); };

v(R2013P, 'BLL', 'REQUIREDVERSIONS', 160, 0);
v(ALL, 'BD', 'UNKNOWN_1', undefined, 412148564080.0);
v(ALL, 'BD', 'UNKNOWN_2', undefined, 1.0);
v(ALL, 'BD', 'UNKNOWN_3', undefined, 1.0);
v(ALL, 'BD', 'UNKNOWN_4', undefined, 1.0);
v(ALL, 'TV', 'UNKNOWN_5', undefined, '');
v(ALL, 'TV', 'UNKNOWN_6', undefined, '');
v(ALL, 'TV', 'UNKNOWN_7', undefined, '');
v(ALL, 'TV', 'UNKNOWN_8', undefined, '');
v(ALL, 'BL', 'UNKNOWN_9', undefined, 24);
v(ALL, 'BL', 'UNKNOWN_10', undefined, 0);
v(R13_14, 'BS', 'UNKNOWN_11', undefined, 0);
v(PRE2004, 'H', 'CURRENT_VIEWPORT_ENTITY_HEADER');
v(ALL, 'B', 'DIMASO', 70);
v(ALL, 'B', 'DIMSHO', 70);
v(R13_14, 'B', 'DIMSAV', 70);
many(ALL, 'B', ['PLINEGEN', 'ORTHOMODE', 'REGENMODE', 'FILLMODE', 'QTEXTMODE', 'PSLTSCALE', 'LIMCHECK']);
v(R13_14, 'B', 'BLIPMODE', 70);
v(R2004P, 'B', 'UNKNOWN_12');
many(ALL, 'B', ['USRTIMER', 'SKPOLY', 'ANGDIR', 'SPLFRAME']);
many(R13_14, 'B', ['ATTREQ', 'ATTDIA']);
many(ALL, 'B', ['MIRRTEXT', 'WORLDVIEW']);
v(R13_14, 'B', 'WIREFRAME');
many(ALL, 'B', ['TILEMODE', 'PLIMCHECK', 'VISRETAIN']);
v(R13_14, 'B', 'DELOBJ');
many(ALL, 'B', ['DISPSILH', 'PELLIPSE']);
v(ALL, 'BS', 'PROXYGRAPHICS', 70);
v(R13_14, 'BS', 'DRAGMODE', 70);
many(ALL, 'BS', ['TREEDEPTH', 'LUNITS', 'LUPREC', 'AUNITS', 'AUPREC']);
v(R13_14, 'BS', 'OSMODE', 70);
v(ALL, 'BS', 'ATTMODE', 70);
v(R13_14, 'BS', 'COORDS', 70);
v(ALL, 'BS', 'PDMODE', 70);
v(R13_14, 'BS', 'PICKSTYLE', 70);
many(R2004P, 'BL', ['UNKNOWN_13', 'UNKNOWN_14', 'UNKNOWN_15']);
many(ALL, 'BS', ['USERI1', 'USERI2', 'USERI3', 'USERI4', 'USERI5', 'SPLINESEGS', 'SURFU', 'SURFV', 'SURFTYPE',
  'SURFTAB1', 'SURFTAB2', 'SPLINETYPE', 'SHADEDGE', 'SHADEDIF', 'UNITMODE', 'MAXACTVP', 'ISOLINES', 'CMLJUST', 'TEXTQLTY']);
many(ALL, 'BD', ['LTSCALE', 'TEXTSIZE', 'TRACEWID', 'SKETCHINC', 'FILLETRAD', 'THICKNESS', 'ANGBASE', 'PDSIZE',
  'PLINEWID', 'USERR1', 'USERR2', 'USERR3', 'USERR4', 'USERR5', 'CHAMFERA', 'CHAMFERB', 'CHAMFERC', 'CHAMFERD',
  'FACETRES', 'CMLSCALE', 'CELTSCALE']);
v(ALL, 'TV', 'MENU', 1);   // Spec gap: the spec says R13-R18; R2007+ files carry it too (first string of the string stream)
v(ALL, 'TD', 'TDCREATE', 40);
v(ALL, 'TD', 'TDUPDATE', 40);
many(R2004P, 'BL', ['UNKNOWN_16', 'UNKNOWN_17', 'UNKNOWN_18']);
v(ALL, 'TS', 'TDINDWG', 40);
v(ALL, 'TS', 'TDUSRTIMER', 40);
v(ALL, 'CMC', 'CECOLOR', 62);
v(ALL, 'HS', 'HANDSEED', 5);
v(ALL, 'H', 'CLAYER', 8);
v(ALL, 'H', 'TEXTSTYLE', 7);
v(ALL, 'H', 'CELTYPE', 6);
v(R2007P, 'H', 'CMATERIAL', 347);
v(ALL, 'H', 'DIMSTYLE', 2);
v(ALL, 'H', 'CMLSTYLE', 2);
v(R2000P, 'BD', 'PSVPSCALE', 40);
v(ALL, '3BD', 'PINSBASE', 10);
v(ALL, '3BD', 'PEXTMIN', 10);
v(ALL, '3BD', 'PEXTMAX', 10);
v(ALL, '2RD', 'PLIMMIN', 10);
v(ALL, '2RD', 'PLIMMAX', 10);
v(ALL, 'BD', 'PELEVATION', 40);
v(ALL, '3BD', 'PUCSORG', 10);
v(ALL, '3BD', 'PUCSXDIR', 10);
v(ALL, '3BD', 'PUCSYDIR', 10);
v(ALL, 'H', 'PUCSNAME', 2);
v(R2000P, 'H', 'PUCSORTHOREF', 2);
v(R2000P, 'BS', 'PUCSORTHOVIEW', 70);
v(R2000P, 'H', 'PUCSBASE', 2);
many(R2000P, '3BD', ['PUCSORGTOP', 'PUCSORGBOTTOM', 'PUCSORGLEFT', 'PUCSORGRIGHT', 'PUCSORGFRONT', 'PUCSORGBACK']);
v(ALL, '3BD', 'INSBASE', 10);
v(ALL, '3BD', 'EXTMIN', 10);
v(ALL, '3BD', 'EXTMAX', 10);
v(ALL, '2RD', 'LIMMIN', 10);
v(ALL, '2RD', 'LIMMAX', 10);
v(ALL, 'BD', 'ELEVATION', 40);
v(ALL, '3BD', 'UCSORG', 10);
v(ALL, '3BD', 'UCSXDIR', 10);
v(ALL, '3BD', 'UCSYDIR', 10);
v(ALL, 'H', 'UCSNAME', 2);
v(R2000P, 'H', 'UCSORTHOREF', 2);
v(R2000P, 'BS', 'UCSORTHOVIEW', 70);
v(R2000P, 'H', 'UCSBASE', 2);
many(R2000P, '3BD', ['UCSORGTOP', 'UCSORGBOTTOM', 'UCSORGLEFT', 'UCSORGRIGHT', 'UCSORGFRONT', 'UCSORGBACK']);
// Spec gap: ch. 9 lists DIMPOST/DIMAPOST (TV) as common here and again (T) in the R13–R14 block below; R13/R14
// files have only the later pair (found with R13/R14 files saved by the ODA File Converter).
v(R2000P, 'TV', 'DIMPOST', 1);
v(R2000P, 'TV', 'DIMAPOST', 1);
// R13-R14 dimension variables
many(R13_14, 'B', ['DIMTOL', 'DIMLIM', 'DIMTIH', 'DIMTOH', 'DIMSE1', 'DIMSE2', 'DIMALT', 'DIMTOFL', 'DIMSAH', 'DIMTIX', 'DIMSOXD']);
v(R13_14, 'RC', 'DIMALTD', 70); v(R13_14, 'RC', 'DIMZIN', 70);
v(R13_14, 'B', 'DIMSD1', 70); v(R13_14, 'B', 'DIMSD2', 70);
v(R13_14, 'RC', 'DIMTOLJ', 70); v(R13_14, 'RC', 'DIMJUST', 70); v(R13_14, 'RC', 'DIMFIT', 70);
v(R13_14, 'B', 'DIMUPT', 70);
many(R13_14, 'RC', ['DIMTZIN', 'DIMALTZ', 'DIMALTTZ', 'DIMTAD']);
many(R13_14, 'BS', ['DIMUNIT', 'DIMAUNIT', 'DIMDEC', 'DIMTDEC', 'DIMALTU', 'DIMALTTD']);
v(R13_14, 'H', 'DIMTXSTY', 7);
many(ALL, 'BD', ['DIMSCALE', 'DIMASZ', 'DIMEXO', 'DIMDLI', 'DIMEXE', 'DIMRND', 'DIMDLE', 'DIMTP', 'DIMTM']);
v(R2007P, 'BD', 'DIMFXL', 40); v(R2007P, 'BD', 'DIMJOGANG', 40); v(R2007P, 'BS', 'DIMTFILL', 70); v(R2007P, 'CMC', 'DIMTFILLCLR', 62);
many(R2000P, 'B', ['DIMTOL', 'DIMLIM', 'DIMTIH', 'DIMTOH', 'DIMSE1', 'DIMSE2']);
many(R2000P, 'BS', ['DIMTAD', 'DIMZIN', 'DIMAZIN']);
v(R2007P, 'BS', 'DIMARCSYM', 70);
many(ALL, 'BD', ['DIMTXT', 'DIMCEN', 'DIMTSZ', 'DIMALTF', 'DIMLFAC', 'DIMTVP', 'DIMTFAC', 'DIMGAP']);
many(R13_14, 'T', ['DIMPOST', 'DIMAPOST', 'DIMBLK_NAME', 'DIMBLK1_NAME', 'DIMBLK2_NAME']);
v(R2000P, 'BD', 'DIMALTRND', 40); v(R2000P, 'B', 'DIMALT', 70); v(R2000P, 'BS', 'DIMALTD', 70);
many(R2000P, 'B', ['DIMTOFL', 'DIMSAH', 'DIMTIX', 'DIMSOXD']);
many(ALL, 'CMC', ['DIMCLRD', 'DIMCLRE', 'DIMCLRT']);
many(R2000P, 'BS', ['DIMADEC', 'DIMDEC', 'DIMTDEC', 'DIMALTU', 'DIMALTTD', 'DIMAUNIT', 'DIMFRAC', 'DIMLUNIT', 'DIMDSEP', 'DIMTMOVE', 'DIMJUST']);
v(R2000P, 'B', 'DIMSD1', 70); v(R2000P, 'B', 'DIMSD2', 70);
many(R2000P, 'BS', ['DIMTOLJ', 'DIMTZIN', 'DIMALTZ', 'DIMALTTZ']);
v(R2000P, 'B', 'DIMUPT', 70); v(R2000P, 'BS', 'DIMATFIT', 70);
v(R2007P, 'B', 'DIMFXLON', 70);
v(R2010P, 'B', 'DIMTXTDIRECTION', 70); v(R2010P, 'BD', 'DIMALTMZF', 40); v(R2010P, 'TV', 'DIMALTMZS', 1);
v(R2010P, 'BD', 'DIMMZF', 40); v(R2010P, 'TV', 'DIMMZS', 1);
v(R2000P, 'H', 'DIMTXSTY', 7); v(R2000P, 'H', 'DIMLDRBLK', 1); v(R2000P, 'H', 'DIMBLK', 1);
v(R2000P, 'H', 'DIMBLK1', 1); v(R2000P, 'H', 'DIMBLK2', 1);
v(R2007P, 'H', 'DIMLTYPE', 6); v(R2007P, 'H', 'DIMLTEX1', 6); v(R2007P, 'H', 'DIMLTEX2', 6);
v(R2000P, 'BS', 'DIMLWD', 70); v(R2000P, 'BS', 'DIMLWE', 70);
many(ALL, 'H', ['BLOCK_CONTROL_OBJECT', 'LAYER_CONTROL_OBJECT', 'STYLE_CONTROL_OBJECT', 'LINETYPE_CONTROL_OBJECT',
  'VIEW_CONTROL_OBJECT', 'UCS_CONTROL_OBJECT', 'VPORT_CONTROL_OBJECT', 'APPID_CONTROL_OBJECT', 'DIMSTYLE_CONTROL_OBJECT']);
v(R13_15, 'H', 'VPORT_ENTITY_HEADER_CONTROL_OBJECT');
many(ALL, 'H', ['DICTIONARY_ACAD_GROUP', 'DICTIONARY_ACAD_MLINESTYLE', 'DICTIONARY_NAMED_OBJECTS']);
v(R2000P, 'BS', 'TSTACKALIGN', undefined, 1); v(R2000P, 'BS', 'TSTACKSIZE', undefined, 70);
v(R2000P, 'TV', 'HYPERLINKBASE', 1); v(R2000P, 'TV', 'STYLESHEET', 1);
many(R2000P, 'H', ['DICTIONARY_LAYOUTS', 'DICTIONARY_PLOTSETTINGS', 'DICTIONARY_PLOTSTYLES']);
many(R2004P, 'H', ['DICTIONARY_MATERIALS', 'DICTIONARY_COLORS']);
v(R2007P, 'H', 'DICTIONARY_VISUALSTYLE');
v(R2013P, 'H', 'UNKNOWN_HANDLE_R2013');
v(R2000P, 'BL', 'FLAGS');
v(R2000P, 'BS', 'INSUNITS', 70);
v(R2000P, 'BS', 'CEPSNTYPE', 380);
v(R2000P, 'H', 'CPSNID', 390);   // only when CEPSNTYPE == 3 — see decodeHeaderVars
v(R2000P, 'TV', 'FINGERPRINTGUID', 2);
v(R2000P, 'TV', 'VERSIONGUID', 2);
many(R2004P, 'RC', ['SORTENTS', 'INDEXCTL', 'HIDETEXT', 'XCLIPFRAME', 'DIMASSOC', 'HALOGAP']);
v(R2004P, 'BS', 'OBSCUREDCOLOR', 70); v(R2004P, 'BS', 'INTERSECTIONCOLOR', 70);   // DXF $OBSCOLOR (read.js adds that alias)
v(R2004P, 'RC', 'OBSCUREDLTYPE', 280); v(R2004P, 'RC', 'INTERSECTIONDISPLAY', 280);  // DXF $OBSLTYPE
v(R2004P, 'TV', 'PROJECTNAME', 1);
many(ALL, 'H', ['BLOCK_RECORD_PAPER_SPACE', 'BLOCK_RECORD_MODEL_SPACE', 'LTYPE_BYLAYER', 'LTYPE_BYBLOCK', 'LTYPE_CONTINUOUS']);
v(R2007P, 'B', 'CAMERADISPLAY', 290);
v(R2007P, 'BL', 'UNKNOWN_19'); v(R2007P, 'BL', 'UNKNOWN_20'); v(R2007P, 'BD', 'UNKNOWN_21');
many(R2007P, 'BD', ['STEPSPERSEC', 'STEPSIZE', '3DDWFPREC', 'LENSLENGTH', 'CAMERAHEIGHT']);
v(R2007P, 'RC', 'SOLIDHIST', 280); v(R2007P, 'RC', 'SHOWHIST', 280);
many(R2007P, 'BD', ['PSOLWIDTH', 'PSOLHEIGHT', 'LOFTANG1', 'LOFTANG2', 'LOFTMAG1', 'LOFTMAG2']);
v(R2007P, 'BS', 'LOFTPARAM', 70); v(R2007P, 'RC', 'LOFTNORMALS', 280);
many(R2007P, 'BD', ['LATITUDE', 'LONGITUDE', 'NORTHDIRECTION']);
v(R2007P, 'BL', 'TIMEZONE', 70);
many(R2007P, 'RC', ['LIGHTGLYPHDISPLAY', 'TILEMODELIGHTSYNCH', 'DWFFRAME', 'DGNFRAME']);
v(R2007P, 'B', 'UNKNOWN_22');
v(R2007P, 'CMC', 'INTERFERECOLOR', 62);
many(R2007P, 'H', ['INTERFEREOBJVS', 'INTERFEREVPVS', 'DRAGVS']);
v(R2007P, 'RC', 'CSHADOW', 280);
// Spec gap: the spec's last "BD unknown" of the R2007+ block is $SHADOWPLANELOCATION (set to 2.5 in a DXF, saved
// by the ODA File Converter as R2007/R2010/R2018: this field reads 2.5).
v(R2007P, 'BD', 'SHADOWPLANELOCATION', 40);
many([14, 18], 'BS', ['UNKNOWN_24', 'UNKNOWN_25', 'UNKNOWN_26', 'UNKNOWN_27']);

export const HEADER_VARS = rows;

export function varsFor(ver) { return rows.filter((r) => ver >= r.from && ver <= r.to); }

export const FLAG_BITS = {
  CELWEIGHT: (f) => f & 0x1F, ENDCAPS: (f) => (f & 0x60) >> 5, JOINSTYLE: (f) => (f & 0x180) >> 7,
  LWDISPLAY: (f) => (f & 0x200 ? 0 : 1), XEDIT: (f) => (f & 0x400 ? 0 : 1), EXTNAMES: (f) => (f & 0x800 ? 1 : 0),
  PSTYLEMODE: (f) => (f & 0x2000 ? 1 : 0), OLESTARTUP: (f) => (f & 0x4000 ? 1 : 0),
};

const hex = (n) => (n ? n.toString(16).toUpperCase() : '');

/**
 * Read every variable of this version. `r` reads the data stream (and, from R2007, has `r.str` set to
 * the string stream); `opts.handles` reads the handle stream (R2007+; earlier the handles are inline).
 * Returns { vars: { NAME: value } }. Stops quietly (with `error`) if the stream runs out.
 */
export function decodeHeaderVars(r, ver, opts = {}) {
  const hr = opts.handles || r;
  const vars = {};
  let error = null;
  try {
    for (const e of rows) {
      if (ver < e.from || ver > e.to) continue;
      if (e.name === 'CPSNID' && vars.CEPSNTYPE !== 3) continue;
      const at = r.pos;
      vars[e.name] = readOne(r, hr, e.type);
      if (opts.trace) opts.trace(e, at, vars[e.name], hr.pos);
    }
  } catch (err) { error = err.message; }
  if (vars.FLAGS !== undefined) for (const [k, f] of Object.entries(FLAG_BITS)) vars[k] = f(vars.FLAGS);
  return { vars, error };
}

function readOne(r, hr, type) {
  switch (type) {
    case 'B': return r.B();
    case 'BS': return r.BS();
    case 'BL': return r.BL();
    case 'BLL': return r.BLL();
    case 'BD': return r.BD();
    case 'RC': return r.RC();
    case 'RS': return r.RS();
    case 'RL': return r.RL();
    case 'TV': return r.TV();
    case 'T': return r.T();
    case 'H': return hex(hr.H());
    case 'HS': return hex(r.H());
    case 'CMC': return r.CMC();
    case '3BD': return r.BD3();
    case '2RD': return r.RD2();
    case 'TD': case 'TS': { const d = r.BL(), ms = r.BL(); return d + ms / 86400000; }
    default: throw new Error(msg('ccdwg.err.header_type', { type }));
  }
}
