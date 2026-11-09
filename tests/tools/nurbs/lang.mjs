#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lang.mjs — the words cc-nurbs (lib/nurbs, 0.8 SU.747b, session `nurbs`) needs in an app that mounts it: its error codes
 * (nurbs.err.*), command names (nurbs.cmd.*), Problems lines (nurbs.prob.*, nurbs.fix.*) and the Surfaces panel's headings
 * (nurbs.panel.*). The library itself speaks only codes and keys. Each app's OWNER runs this for their app (rule 31: always
 * named, never all apps at once); it writes that app's dev/lang/en.json and es-MX.json (draft) line by line — a key's line is
 * replaced, a new key goes before the closing brace, nothing else moves — and the @context line when the file has one.
 *
 *   node tools/nurbs/lang.mjs <modelcraft|partcraft|supercadcraft> [--check]
 *   node tools/nurbs/lang.mjs --list            (print the keys, write nothing)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// key: [English, context, es-MX draft]
export const NURBS_KEYS = {
  'nurbs.err.not_curve': ['That is not a curve.', 'A NURBS curve could not be read.', 'Eso no es una curva.'],
  'nurbs.err.not_surface': ['That is not a surface.', 'A NURBS surface could not be read.', 'Eso no es una superficie.'],
  'nurbs.err.degree': ['The degree must be a whole number from 1 to {max}.', 'Curve or surface degree out of range.', 'El grado debe ser un número entero de 1 a {max}.'],
  'nurbs.err.cv_count': ['At least {min} control points are needed.', 'Too few control points for the degree.', 'Se necesitan al menos {min} puntos de control.'],
  'nurbs.err.cv_grid': ['The control points do not form a full grid.', 'A surface net with rows of different lengths.', 'Los puntos de control no forman una cuadrícula completa.'],
  'nurbs.err.cv_value': ['A control point is not a number.', 'A control point with a missing or non-numeric coordinate.', 'Un punto de control no es un número.'],
  'nurbs.err.weights': ['Every weight must be a number above zero, one per control point.', 'Rational weights missing, zero or negative.', 'Cada peso debe ser un número mayor que cero, uno por punto de control.'],
  'nurbs.err.too_many': ['More than {max} control points: too many to open here.', 'Size limit.', 'Más de {max} puntos de control: demasiados para abrirlos aquí.'],
  'nurbs.err.too_big': ['The file is too big to open here.', 'File size limit.', 'El archivo es demasiado grande para abrirlo aquí.'],
  'nurbs.err.knots_count': ['The knot vector has the wrong number of values for this degree and these control points.', 'Knots ≠ control points + degree + 1.', 'El vector de nudos tiene un número de valores incorrecto para este grado y estos puntos de control.'],
  'nurbs.err.knots_order': ['The knots must never decrease.', 'Knot vector out of order.', 'Los nudos nunca deben disminuir.'],
  'nurbs.err.knots_clamp': ['The curve must start and end on its end control points (the end knots repeated degree + 1 times).', 'Unclamped knot vector.', 'La curva debe empezar y terminar en sus puntos de control extremos (los nudos extremos repetidos grado + 1 veces).'],
  'nurbs.err.knots_mult': ['An inner knot is repeated more times than the degree.', 'Interior knot multiplicity above the degree.', 'Un nudo interior se repite más veces que el grado.'],
  'nurbs.err.knots_value': ['A knot is not a number, or the knots do not span any length.', 'Bad knot value.', 'Un nudo no es un número, o los nudos no abarcan ninguna longitud.'],
  'nurbs.err.knot_outside': ['That position is not inside the curve.', 'Knot insertion/split outside the domain.', 'Esa posición no está dentro de la curva.'],
  'nurbs.err.knot_mult': ['A knot cannot be repeated more times than the degree.', 'Knot insertion would exceed the degree.', 'Un nudo no puede repetirse más veces que el grado.'],
  'nurbs.err.reduce': ['The degree cannot be lowered without moving the curve more than {tol} mm.', 'Degree reduction refused.', 'No se puede bajar el grado sin mover la curva más de {tol} mm.'],
  'nurbs.err.arc': ['An arc needs an angle.', 'Zero-angle arc.', 'Un arco necesita un ángulo.'],
  'nurbs.err.axis': ['The axis has no direction.', 'Revolve axis of zero length.', 'El eje no tiene dirección.'],
  'nurbs.err.on_axis': ['The whole profile lies on the axis: there is nothing to turn.', 'Revolve profile on the axis.', 'Todo el perfil está sobre el eje: no hay nada que girar.'],
  'nurbs.err.join_gap': ['Curve {index} does not touch the one before it.', 'Join: a gap between curves.', 'La curva {index} no toca la anterior.'],
  'nurbs.err.fit_singular': ['Those points cannot be fitted (some lie on top of each other).', 'Interpolation/approximation system singular.', 'Esos puntos no se pueden ajustar (algunos están uno encima de otro).'],
  'nurbs.err.sections': ['A loft needs at least {min} curves.', 'Too few loft sections.', 'Una solevación necesita al menos {min} curvas.'],
  'nurbs.err.sections_order': ['Two loft curves are in the same place.', 'Loft sections with equal parameters.', 'Dos curvas de la solevación están en el mismo lugar.'],
  'nurbs.err.rails_meet': ['The two rails meet: the profile would shrink to nothing.', 'Two-rail sweep: rails touch.', 'Los dos rieles se tocan: el perfil se reduciría a nada.'],
  'nurbs.err.profile_off_rails': ['The profile\'s ends must start on the two rails.', 'Two-rail sweep: profile ends not on the rails.', 'Los extremos del perfil deben empezar sobre los dos rieles.'],
  'nurbs.err.network_size': ['A network needs at least two curves each way.', 'Network surface: too few curves.', 'Una red necesita al menos dos curvas en cada dirección.'],
  'nurbs.err.network_gap': ['The network\'s curves do not meet (gap {gap} mm).', 'Network surface: profiles and guides do not cross.', 'Las curvas de la red no se cruzan (separación {gap} mm).'],
  'nurbs.err.corners': ['The four curves do not meet at their corners (gap {gap} mm).', 'Coons patch: corners apart.', 'Las cuatro curvas no se unen en sus esquinas (separación {gap} mm).'],
  'nurbs.err.blend_ends': ['The two ends are in the same place: there is nothing to blend.', 'Blend between touching ends.', 'Los dos extremos están en el mismo lugar: no hay nada que fusionar.'],
  'nurbs.err.continuity': ['Choose G0, G1 or G2.', 'Unknown continuity level.', 'Elija G0, G1 o G2.'],
  'nurbs.err.edge': ['That is not an edge of the surface.', 'Unknown edge name.', 'Ese no es un borde de la superficie.'],
  'nurbs.err.dir': ['Choose the u or v direction.', 'Unknown surface direction.', 'Elija la dirección u o v.'],
  'nurbs.err.length': ['The length must be above zero.', 'Extend length not positive.', 'La longitud debe ser mayor que cero.'],
  'nurbs.err.need': ['Pick {n} {kind} first.', 'A command is missing its picks.', 'Elija primero {n} {kind}.'],
  'nurbs.err.no_item': ['That curve or surface is not in the model.', 'A command names a missing item.', 'Esa curva o superficie no está en el modelo.'],
  'nurbs.err.no_command': ['Unknown surface command.', 'Command id not known.', 'Comando de superficie desconocido.'],
  'nurbs.err.not_doc': ['That is not a CadCraft NURBS file.', 'Patch set JSON not recognised.', 'Ese no es un archivo NURBS de CadCraft.'],
  'nurbs.err.doc_version': ['The NURBS file has no valid version.', 'Patch set version missing.', 'El archivo NURBS no tiene una versión válida.'],
  'nurbs.err.doc_newer': ['This NURBS file was saved by a newer version (format {version}); update to open it.', 'Patch set from a newer release.', 'Este archivo NURBS se guardó con una versión más nueva (formato {version}); actualice para abrirlo.'],
  'nurbs.err.item': ['Item {index} in the NURBS file cannot be read.', 'A patch set item is broken.', 'No se puede leer el elemento {index} del archivo NURBS.'],
  'nurbs.err.step_not': ['That is not a STEP file.', 'STEP read failed.', 'Ese no es un archivo STEP.'],
  'nurbs.err.step_syntax': ['The STEP file is damaged.', 'STEP syntax error.', 'El archivo STEP está dañado.'],
  'nurbs.err.step_number': ['A number cannot be written to STEP.', 'Non-finite number on STEP export.', 'Un número no se puede escribir en STEP.'],
  'nurbs.err.step_point': ['A point in the STEP file cannot be read.', 'Broken CARTESIAN_POINT.', 'No se puede leer un punto del archivo STEP.'],
  'nurbs.err.step_empty': ['The STEP file holds no B-spline curve or surface.', 'STEP file with no B-spline geometry.', 'El archivo STEP no contiene ninguna curva ni superficie B-spline.'],
  'nurbs.err.iges_not': ['That is not an IGES file.', 'IGES read failed.', 'Ese no es un archivo IGES.'],
  'nurbs.err.iges_number': ['A number in the IGES file cannot be read.', 'Bad IGES number.', 'No se puede leer un número del archivo IGES.'],
  'nurbs.err.iges_pointer': ['The IGES file points past its own end.', 'Bad directory entry pointer.', 'El archivo IGES apunta más allá de su propio final.'],
  'nurbs.err.iges_entity': ['A B-spline entity in the IGES file is damaged.', 'Broken entity 126/128.', 'Una entidad B-spline del archivo IGES está dañada.'],
  'nurbs.err.iges_empty': ['The IGES file holds no B-spline curve (126) or surface (128).', 'IGES with nothing to read.', 'El archivo IGES no contiene ninguna curva (126) ni superficie (128) B-spline.'],
  'nurbs.cmd.curve_points': ['Curve through points', 'Command.', 'Curva por puntos'],
  'nurbs.cmd.curve_cvs': ['Curve by control points', 'Command.', 'Curva por puntos de control'],
  'nurbs.cmd.trim_curve': ['Trim by a curve', 'Command: cut a surface along a closed curve lying on it.', 'Recortar con una curva'],
  'nurbs.cmd.trim_rect': ['Trim to a rectangle', 'Command: keep (or cut out) a rectangle of the surface.', 'Recortar a un rectángulo'],
  'nurbs.cmd.trim_circle': ['Trim with a circle', 'Command: cut a round hole in a surface, or keep a round part.', 'Recortar con un círculo'],
  'nurbs.cmd.untrim': ['Remove the trim', 'Command: show the whole surface again.', 'Quitar el recorte'],
  'nurbs.err.trim_loop': ['That trim outline cannot be used (it needs at least three points and some area).', 'A trim loop is too short, flat or not numbers.', 'Ese contorno de recorte no se puede usar (necesita al menos tres puntos y algo de área).'],
  'nurbs.err.trim_open': ['That curve is not closed: a trim needs a closed curve.', 'Trim by an open curve.', 'Esa curva no está cerrada: un recorte necesita una curva cerrada.'],
  'nurbs.err.trim_off': ['That curve does not lie on the surface (it is {mm} mm away).', 'Trim by a curve that is not on the surface.', 'Esa curva no está sobre la superficie (está a {mm} mm).'],
  'nurbs.err.trim_self': ['The trim outline crosses itself or another outline.', 'Trim loops cross.', 'El contorno de recorte se cruza consigo mismo o con otro.'],
  'nurbs.err.trim_outside': ['A hole must lie inside the kept part.', 'Hole outside the outer loop.', 'Un agujero debe quedar dentro de la parte conservada.'],
  // 0.9 DC.54 (session nurbs-09): IGES trimmed faces, solids bounded by surfaces, and Booleans on them
  'nurbs.cmd.solid_box': ['Box solid', 'Command: a box whose six faces are flat surfaces.', 'Sólido caja'],
  'nurbs.cmd.solid_cylinder': ['Cylinder solid', 'Command: a cylinder (round side and two trimmed flat ends).', 'Sólido cilindro'],
  'nurbs.cmd.solid_sphere': ['Sphere solid', 'Command: a sphere (one revolved surface).', 'Sólido esfera'],
  'nurbs.cmd.solid_make': ['Solid from surfaces', 'Command: group surfaces that close a volume into a solid.', 'Sólido a partir de superficies'],
  'nurbs.cmd.solid_union': ['Union', 'Command: join two solids into one.', 'Unión'],
  'nurbs.cmd.solid_subtract': ['Subtract', 'Command: take the second solid away from the first.', 'Restar'],
  'nurbs.cmd.solid_intersect': ['Intersect', 'Command: keep only what two solids share.', 'Intersecar'],
  'nurbs.cmd.solid_ungroup': ['Ungroup the solid', 'Command: keep the faces as plain surfaces.', 'Desagrupar el sólido'],
  // 0.9 SU.1082 (session reverse-nurbs-09): surfaces fitted to a scan mesh
  'nurbs.cmd.scan_fit': ['Fit surfaces to the scan', 'Command: detect planes, cylinders and free-form patches in a scanned mesh and build trimmed surfaces.', 'Ajustar superficies al escaneo'],
  'nurbs.cmd.scan_solid': ['Stitch the surfaces to a solid', 'Command: sew every shown surface that is not in a solid into one closed solid.', 'Unir las superficies en un sólido'],
  // 0.9 D9.8 (SubD cages that are exact NURBS)
  'nurbs.cmd.cage_surfaces': ['SubD cage to exact surfaces', 'Command: turn each regular quad of a polygon mesh cage into an exact bicubic B-spline surface (the Catmull–Clark limit).', 'Jaula SubD a superficies exactas'],
  'nurbs.err.cage_none': ['There is no cage: select a mesh first.', 'SubD cage command without a mesh.', 'No hay una jaula: seleccione primero una malla.'],
  'nurbs.err.cage_nopatch': ['None of the {n} quads can be made exact: each touches the cage border or a vertex that does not have four edges.', 'A cage with no regular quads.', 'Ninguno de los {n} cuadriláteros puede hacerse exacto: todos tocan el borde de la jaula o un vértice que no tiene cuatro aristas.'],
  'nurbs.err.scan_none': ['There is no scan to fit: select a mesh first.', 'Fit to scan without a mesh.', 'No hay un escaneo que ajustar: seleccione primero una malla.'],
  'nurbs.err.scan_empty': ['That mesh has no usable triangles.', 'Empty or degenerate scan.', 'Esa malla no tiene triángulos utilizables.'],
  'nurbs.err.scan_big': ['That scan has more than {max} triangles: reduce it first.', 'Scan too big for the in-browser fit.', 'Ese escaneo tiene más de {max} triángulos: redúzcalo primero.'],
  'nurbs.err.no_solid': ['That solid is not in the drawing any more.', 'A solid id that does not exist.', 'Ese sólido ya no está en el dibujo.'],
  'nurbs.err.solid_none': ['Pick the surfaces that close the solid (or show some first).', 'Solid from surfaces with nothing to use.', 'Seleccione las superficies que cierran el sólido (o muestre algunas primero).'],
  'nurbs.err.solid_taken': ['Surface {id} is already a face of {solid}.', 'A surface can belong to one solid only.', 'La superficie {id} ya es una cara de {solid}.'],
  'nurbs.err.solid_size': ['Sizes must be numbers above zero.', 'Primitive with a zero, negative or missing size.', 'Las medidas deben ser números mayores que cero.'],
  'nurbs.err.solid_open': ['These surfaces do not close a volume: {edges} edges stay open (they must meet within {gap} mm). Nothing was changed.', 'Sewing found gaps or loose edges.', 'Estas superficies no cierran un volumen: quedan {edges} bordes abiertos (deben coincidir a menos de {gap} mm). No se cambió nada.'],
  'nurbs.err.bool_engine': ['The solid engine could not be loaded, so the Boolean did not run.', 'manifold-3d missing or failed to load.', 'No se pudo cargar el motor de sólidos, así que la operación booleana no se ejecutó.'],
  'nurbs.err.bool_op': ['That is not a Boolean this panel knows.', 'Unknown Boolean operation.', 'Esa no es una operación booleana que este panel conozca.'],
  'nurbs.err.bool_same': ['Pick two different solids.', 'The same solid twice.', 'Seleccione dos sólidos distintos.'],
  'nurbs.err.bool_input': ['The solid engine refused {name}: its faces close, but not cleanly enough for a Boolean. Try a smaller tolerance.', 'manifold-3d rejected an input mesh.', 'El motor de sólidos rechazó {name}: sus caras cierran, pero no con la limpieza suficiente para una operación booleana. Pruebe una tolerancia menor.'],
  'nurbs.err.bool_empty': ['The result is empty: the two solids share nothing (or the first is inside the second). Nothing was changed.', 'Boolean gave no volume.', 'El resultado está vacío: los dos sólidos no comparten nada (o el primero está dentro del segundo). No se cambió nada.'],
  'nurbs.err.bool_trim': ['A face of the result ({name}) could not be cut cleanly along the intersection. Nothing was changed.', 'New trim loops crossed or did not close.', 'Una cara del resultado ({name}) no se pudo cortar limpiamente a lo largo de la intersección. No se cambió nada.'],
  'nurbs.err.bool_detail': ['An intersection needs more than {max} points on one face. Try a larger tolerance.', 'Trim loop too long.', 'Una intersección necesita más de {max} puntos en una cara. Pruebe una tolerancia mayor.'],
  // 0.9 SU.747c (nurbs-s3-09): fillets, thickening. English only (KICKOFF rule 57: lang-final-09 runs the other languages); null = no draft
  'nurbs.cmd.solid_fillet': ['Fillet between faces', 'Command: round the edge where two faces of a solid meet with a rolling ball.', null],
  'nurbs.cmd.solid_fillet_edges': ['Fillet several edges', 'Command: round several edges of one solid at once (pick the two faces of each edge in turn).', null],
  'nurbs.cmd.solid_thicken': ['Thicken into a solid', 'Command: give a surface a thickness, making a solid.', null],
  'nurbs.err.fillet_face': ['{id} is not a face of the solid {solid}. Pick two faces of one solid.', 'Fillet picks not in one solid.', null],
  'nurbs.err.fillet_edge': ['The faces {a} and {b} do not meet along an edge, so there is no edge to round.', 'Fillet: no shared edge.', null],
  'nurbs.err.fillet_edges': ['The faces {a} and {b} meet along {n} separate edges. Rounding several at once is not built yet.', 'Fillet: more than one shared edge.', null],
  'nurbs.err.fillet_size': ['The radius must be a number above zero.', 'Fillet radius missing or not positive.', null],
  'nurbs.err.fillet_radius': ['A rolling ball of radius {radius} mm does not fit on the face {name}: it would leave the face or the face curves tighter than that. Try a smaller radius. Nothing was changed.', 'Fillet radius too large for a face.', null],
  'nurbs.err.fillet_closed_var': ['A radius that changes along the edge needs an edge with two ends; this edge goes all the way round.', 'Variable fillet on a closed edge.', null],
  'nurbs.err.fillet_end': ['An inside fillet can end only on a flat face square to the edge; the face {name} at its end is not. Nothing was changed.', 'Concave fillet with a slanted or curved end face.', null],
  'nurbs.err.fillet_none': ['Pick the two faces of each edge to round, one pair after the other. Nothing was changed.', 'Several-edge fillet with no faces (or more than 64 edges).', null],
  'nurbs.err.fillet_dup': ['The edge between {a} and {b} was picked twice. Nothing was changed.', 'Several-edge fillet: the same pair of faces twice.', null],
  'nurbs.err.fillet_corner': ['Three rounded edges meet at a corner of {name} and the radius {radius} mm leaves no room for a spherical corner on a short edge (an edge must be at least twice the radius where both its ends are such corners). Use a smaller radius. Nothing was changed.', 'Corner blend of three fillets does not fit.', null],
  'nurbs.err.fillet_hits': ['The fillet would also change other parts of the solid {name} (about {mm3} mm³ more than the rounded edge). Try a smaller radius. Nothing was changed.', 'Fillet tool reached other material.', null],
  'nurbs.err.thicken_size': ['The thickness must be a number above zero.', 'Thicken thickness missing or not positive.', null],
  'nurbs.err.thicken_fold': ['The surface {name} curves tighter (radius {radius} mm, near {at}) than the thickness {thickness} mm on that side, so the offset would fold over. Use a smaller thickness or the other side. Nothing was changed.', 'Thicken: offset folds.', null],
  'nurbs.err.thicken_self': ['Thickening {name} by {thickness} mm runs into another part of the same surface (only {gap} mm away, near {at}). Use a smaller thickness or the other side. Nothing was changed.', 'Thicken: offset crosses the surface.', null],
  'nurbs.err.thicken_open': ['The thickened faces of {name} did not close into a solid. Nothing was changed.', 'Thicken: faces did not sew.', null],
  'nurbs.cmd.insert_knot': ['Insert knot', 'Command.', 'Insertar nudo'],
  'nurbs.cmd.remove_knot': ['Remove knot', 'Command.', 'Quitar nudo'],
  'nurbs.cmd.elevate': ['Raise degree', 'Command.', 'Subir grado'],
  'nurbs.cmd.reduce': ['Lower degree', 'Command.', 'Bajar grado'],
  'nurbs.cmd.rebuild': ['Rebuild curve', 'Command.', 'Reconstruir curva'],
  'nurbs.cmd.match_curve': ['Match curve', 'Command: make a curve end meet another with G0/G1/G2.', 'Igualar curva'],
  'nurbs.cmd.blend_curve': ['Blend curve', 'Command.', 'Curva de fusión'],
  'nurbs.cmd.join': ['Join curves', 'Command.', 'Unir curvas'],
  'nurbs.cmd.split': ['Split curve', 'Command.', 'Dividir curva'],
  'nurbs.cmd.loft': ['Loft', 'Command: surface through curves.', 'Solevar'],
  'nurbs.cmd.ruled': ['Ruled surface', 'Command.', 'Superficie reglada'],
  'nurbs.cmd.extrude': ['Extrude curve', 'Command.', 'Extruir curva'],
  'nurbs.cmd.revolve': ['Revolve curve', 'Command.', 'Revolucionar curva'],
  'nurbs.cmd.sweep1': ['Sweep along one rail', 'Command.', 'Barrido por un riel'],
  'nurbs.cmd.sweep2': ['Sweep along two rails', 'Command.', 'Barrido por dos rieles'],
  'nurbs.cmd.network': ['Surface from a curve network', 'Command.', 'Superficie desde una red de curvas'],
  'nurbs.cmd.coons': ['Patch from four edges', 'Command.', 'Parche desde cuatro bordes'],
  'nurbs.cmd.match_surface': ['Match surface', 'Command: make a surface edge meet another with G0/G1/G2.', 'Igualar superficie'],
  'nurbs.cmd.blend_surface': ['Blend surface', 'Command.', 'Superficie de fusión'],
  'nurbs.cmd.offset': ['Offset surface', 'Command.', 'Desfasar superficie'],
  'nurbs.cmd.extend': ['Extend surface', 'Command.', 'Extender superficie'],
  'nurbs.cmd.rebuild_surface': ['Rebuild surface', 'Command.', 'Reconstruir superficie'],
  'nurbs.prob.g0': ['Gap of {gap} mm between {a} and {b} (wanted {want})', 'Problems line: G0 missed on a shared edge.', 'Separación de {gap} mm entre {a} y {b} (se quería {want})'],
  'nurbs.prob.g1': ['{a} and {b} meet at an angle of {angle}° (wanted {want})', 'Problems line: G1 missed.', '{a} y {b} se unen con un ángulo de {angle}° (se quería {want})'],
  'nurbs.prob.g2': ['Curvature jumps by {dk} 1/mm between {a} and {b} (wanted {want})', 'Problems line: G2 missed.', 'La curvatura salta {dk} 1/mm entre {a} y {b} (se quería {want})'],
  'nurbs.fix.match': ['Match the edge ({want})', 'Problems fix button.', 'Igualar el borde ({want})'],
  'nurbs.panel.title': ['Surfaces', 'Panel title.', 'Superficies'],
  'nurbs.panel.degree': ['Degree', 'Panel column.', 'Grado'],
  'nurbs.panel.cvs': ['Control points', 'Panel column.', 'Puntos de control'],
  'nurbs.panel.rational': ['Rational', 'Panel column: has weights.', 'Racional'],
  'nurbs.panel.edges': ['Shared edges', 'Panel heading of the continuity table.', 'Bordes compartidos'],
  'nurbs.panel.want': ['Wanted', 'Continuity table column.', 'Deseado'],
  'nurbs.panel.got': ['Measured', 'Continuity table column.', 'Medido'],
  'nurbs.panel.gap': ['Gap (mm)', 'Continuity table column: G0.', 'Separación (mm)'],
  'nurbs.panel.angle': ['Angle (°)', 'Continuity table column: G1.', 'Ángulo (°)'],
  'nurbs.panel.dk': ['Curvature jump (1/mm)', 'Continuity table column: G2.', 'Salto de curvatura (1/mm)'],
  'nurbs.panel.none': ['Apart', 'Continuity measured below G0.', 'Separados'],
  'nurbs.panel.note': ['Measured on the exact surfaces at {n} points per edge. G3 and class-A quality are not measured.', 'Panel footnote.', 'Medido sobre las superficies exactas en {n} puntos por borde. La continuidad G3 y la calidad clase A no se miden.'],
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = ['modelcraft', 'partcraft', 'supercadcraft'];

function setLine(src, key, value, { inContext = false } = {}) {
  const line = '  ' + (inContext ? '  ' : '') + JSON.stringify(key) + ': ' + JSON.stringify(value);
  const lines = src.split('\n');
  let lo = 0, hi = lines.length;
  if (inContext) {
    lo = lines.findIndex((l) => /^ {2}"@context": \{\s*$/.test(l));
    if (lo < 0) throw new Error('no @context block');
    hi = lines.findIndex((l, i) => i > lo && /^ {2}\},?\s*$/.test(l));
  }
  const pre = (inContext ? '    ' : '  ') + JSON.stringify(key) + ':';
  for (let i = lo + 1; i < hi; i++) {
    if (!lines[i].startsWith(pre)) continue;
    lines[i] = line + (/,\s*$/.test(lines[i]) ? ',' : '');
    return lines.join('\n');
  }
  const end = inContext ? hi : lines.map((l) => l.trim()).lastIndexOf('}');
  let last = end - 1;
  while (last > lo && !lines[last].trim()) last--;
  if (!/,\s*$/.test(lines[last]) && !/\{\s*$/.test(lines[last])) lines[last] += ',';
  lines.splice(last + 1, 0, line);
  return lines.join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes('--list')) { for (const [k, r] of Object.entries(NURBS_KEYS)) console.log(k + '\t' + r[0]); process.exit(0); }
  const check = args.includes('--check');
  const app = args.find((a) => !a.startsWith('--'));
  if (!APPS.includes(app)) { console.error('name the app: node tools/nurbs/lang.mjs <' + APPS.join('|') + '> [--check]'); process.exit(2); }
  let differs = false;
  for (const [file, col] of [['en.json', 0], ['es-MX.json', 2]]) {
    const p = path.join(ROOT, 'public_html/assets/apps', app, 'dev/lang', file);
    const src = readFileSync(p, 'utf8');
    let out = src;
    const hasContext = /^ {2}"@context": \{/m.test(src);
    for (const [k, row] of Object.entries(NURBS_KEYS)) {
      if (row[col] == null) continue;   // no draft in this language (rule 57: English first, the language round adds the rest)
      out = setLine(out, k, row[col]);
      if (col === 0 && hasContext) out = setLine(out, k, row[1], { inContext: true });
    }
    JSON.parse(out);
    if (out !== src) { differs = true; if (!check) writeFileSync(p, out); }
    console.log(`${app}/${file}: ${out === src ? 'up to date' : check ? 'DIFFERS' : 'written'} (${Object.keys(NURBS_KEYS).length} keys)`);
  }
  if (check && differs) process.exit(1);
}
