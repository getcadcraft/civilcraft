/* SPDX-License-Identifier: Apache-2.0 */
// Words of the shared picker dialog (lib/crs-pick/crs-pick-dialog.js) and of the places that open it in CivilCraft and CadCraft
// (0.8 D8.9, session `crs-share_PART_3`). sync.mjs writes them (en + es-MX draft + @context) into the named app's lang files.
// SHARED_FROM_LANG = the words of lang.mjs (BimCraft's set) the dialog also uses; the rest of lang.mjs stays BimCraft's.
export const SHARED_FROM_LANG = ['geo.pick.search', 'geo.pick.search.ph', 'geo.pick.prj', 'geo.pick.name', 'geo.pick.hit', 'geo.pick.hits', 'geo.pick.hits.more',
  'geo.pick.custom', 'geo.pick.keep', 'geo.pick.kept', 'geo.pick.mine', 'geo.pick.mine.none', 'geo.pick.mine.use', 'geo.pick.mine.remove', 'geo.pick.use', 'geo.pick.prj.bad'];
export const SHARED_PREFIX = ['crs.pick.'];

export const SHARE_EN = {
  'geo.pick.share.close': 'Close',
  'geo.pick.share.note': 'My projections are kept in this browser and are the same in every CadCraft app that offers this dialog.',
  'geo.pick.share.geographic': 'A latitude-longitude system cannot be used here. Pick a projected system (UTM, state plane, a national grid or your own).',
  'crs.pick.problem': '{name} cannot be used here: {why}',
};
export const SHARE_ES = {
  'geo.pick.share.close': 'Cerrar',
  'geo.pick.share.note': 'Mis proyecciones se guardan en este navegador y son las mismas en toda app de CadCraft que ofrezca este cuadro.',
  'geo.pick.share.geographic': 'Aquí no se puede usar un sistema de latitud y longitud. Elige un sistema proyectado (UTM, plano estatal, una cuadrícula nacional o uno propio).',
  'crs.pick.problem': '{name} no se puede usar aquí: {why}',
};
export const SHARE_CTX = {
  'geo.pick.share.close': 'Button: closes the coordinate system dialog without choosing.',
  'geo.pick.share.note': 'Note at the foot of the coordinate system dialog about the saved list (My projections).',
  'geo.pick.share.geographic': 'Message in the coordinate system dialog: the chosen system uses degrees but a map grid is needed.',
  'crs.pick.problem': 'Warning text. {name} = the coordinate system chosen, {why} = the reason it was refused (a sentence).',
};

// per app: the place that opens the dialog
export const APP_EN = {
  civilcraft: {
    'crs.d.more': 'UTM, EPSG number or your own…',
    'crs.d.more.title': 'Choose the project\'s coordinate system',
    'crs.d.more.intro': 'Search by EPSG number, by UTM zone (UTM 33N) or by words from the name, paste a projection definition, load a .prj file, or choose one of your own.',
    'crs.d.more.help': 'Type a UTM zone or an EPSG number, paste your own projection, or take one from My projections. The choice is checked against the project\'s units before it is used.',
  },
  cadcraft: {
    'ml.sys.more': 'UTM, EPSG number or your own…',
    'ml.sys.more.title': 'Coordinate system of this drawing',
    'ml.sys.more.intro': 'Search by EPSG number, by UTM zone (UTM 33N) or by words from the name, load a .prj file, or choose from My projections. The drawing keeps the EPSG number, so a definition must match a listed system.',
    'ml.sys.more.help': 'Type a UTM zone or an EPSG number, or take a system from My projections. It is chosen here and set with Use this system, and saved in the DWG or DXF.',
    'ml.sys.more.nocode': '{name} has no EPSG number and matches no listed system. This drawing keeps its system as an EPSG number, so pick a listed system.',
    'ml.sys.more.chosen': '{name} is chosen. Set the placement and press Use this system.',
  },
};
export const APP_ES = {
  civilcraft: {
    'crs.d.more': 'UTM, número EPSG o uno propio…',
    'crs.d.more.title': 'Elegir el sistema de coordenadas del proyecto',
    'crs.d.more.intro': 'Busca por número EPSG, por zona UTM (UTM 33N) o por palabras del nombre, pega una definición de proyección, carga un archivo .prj o elige una propia.',
    'crs.d.more.help': 'Escribe una zona UTM o un número EPSG, pega tu propia proyección o toma una de Mis proyecciones. La elección se revisa con las unidades del proyecto antes de usarse.',
  },
  cadcraft: {
    'ml.sys.more': 'UTM, número EPSG o uno propio…',
    'ml.sys.more.title': 'Sistema de coordenadas de este dibujo',
    'ml.sys.more.intro': 'Busca por número EPSG, por zona UTM (UTM 33N) o por palabras del nombre, carga un archivo .prj o elige de Mis proyecciones. El dibujo guarda el número EPSG, así que una definición debe coincidir con un sistema de la lista.',
    'ml.sys.more.help': 'Escribe una zona UTM o un número EPSG, o toma un sistema de Mis proyecciones. Se elige aquí, se aplica con el botón de usar este sistema y se guarda en el DWG o DXF.',
    'ml.sys.more.nocode': '{name} no tiene número EPSG ni coincide con un sistema de la lista. Este dibujo guarda su sistema como número EPSG, así que elige uno de la lista.',
    'ml.sys.more.chosen': 'Se eligió {name}. Indica la ubicación y pulsa el botón de usar este sistema.',
  },
};
export const APP_CTX = {
  civilcraft: {
    'crs.d.more': 'Button in the coordinate system dialog: opens the shared picker (UTM zone, EPSG number, own projection).',
    'crs.d.more.title': 'Title of the shared coordinate system picker opened from the project dialog.',
    'crs.d.more.intro': 'Explanation under the title of the shared picker.',
    'crs.d.more.help': 'Help line under the button. "My projections" is the saved list of own projections.',
  },
  cadcraft: {
    'ml.sys.more': 'Button in the Map layers dialog: opens the shared picker (UTM zone, EPSG number, own projection).',
    'ml.sys.more.title': 'Title of the shared coordinate system picker opened from the Map layers dialog.',
    'ml.sys.more.intro': 'Explanation under the title of the shared picker.',
    'ml.sys.more.help': 'Help line under the button. "Use this system" is the label of the apply button (ml.sys.apply).',
    'ml.sys.more.nocode': 'Warning. {name} = the projection chosen.',
    'ml.sys.more.chosen': 'Status line. {name} = the system chosen.',
  },
};
