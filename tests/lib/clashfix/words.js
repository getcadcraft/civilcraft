/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the review panel's words in English and the es-MX draft; a host's own language file wins (same shape as lib/live/connect-words.js) */
export const WORDS = {
  en: {
    'clashfix.open': 'Propose fixes', 'clashfix.title': 'Proposed fixes',
    'clashfix.lede': 'Each discipline proposes fixes for its own elements only. Every fix was tried on a copy of the model and checked again for clashes and rules. Nothing changes until you accept fixes and apply them.',
    'clashfix.who.none': 'No assistant is connected: these are the built-in rule proposals.',
    'clashfix.who.some': '{n} connected assistant(s) can add fixes here (they read the clashes and propose for their discipline).',
    'clashfix.disc.structure': 'Structure', 'clashfix.disc.mechanical': 'Mechanical', 'clashfix.disc.plumbing': 'Plumbing', 'clashfix.disc.electrical': 'Electrical', 'clashfix.disc.architecture': 'Architecture',
    'clashfix.by.rules': 'Built-in rules', 'clashfix.by.assistant': 'Assistant: {name}',
    'p.crossover.over': 'Detour over it, {dz} up', 'p.crossover.under': 'Detour under it, {dz} down', 'p.shift.up': 'Raise the whole run {dz}', 'p.shift.down': 'Lower the whole run {dz}',
    'p.shift.side': 'Move the whole run {d} to the side', 'p.resize': 'Make the duct {w} × {h}', 'p.move_column': 'Move the column {d}', 'p.move_wall': 'Move the wall {d}',
    'p.opening.beam': 'Opening in the beam web, {w} × {h}', 'p.opening.slab': 'Hole in the slab, {w} × {h}', 'p.opening.wall': 'Sleeve in the wall, {w} × {h}', 'p.assistant': 'Proposed by an assistant',
    'clashfix.t.resolves': 'Settles it', 'clashfix.t.not': 'Does not settle it', 'clashfix.t.new': '{n} new clash(es)', 'clashfix.t.nonew': 'no new clash',
    'clashfix.t.breaks': '{n} rule(s) broken', 'clashfix.t.nobreaks': 'no rule broken', 'clashfix.t.added': '{len} more run', 'clashfix.t.moved': 'moves {len}',
    'clashfix.t.fittings': '{n} fittings', 'clashfix.t.cost': 'cost score {n}', 'clashfix.t.also': 'also settles {n} more',
    'clashfix.r.clearance': 'Closer than {need} mm to another element', 'clashfix.r.headroom': 'Below the headroom line ({need} mm above the level)', 'clashfix.r.drain_slope': 'The drain would rise along its flow',
    'clashfix.r.access_above': 'Less than {need} mm above the tray to lay cable', 'clashfix.r.web_opening': 'Breaks a web opening rule (size, distance from the ends or height)', 'clashfix.r.span': 'A beam framing into the column changes span',
    'note.engineer': 'The structural engineer signs this off.', 'note.fire_stop': 'Fire-rated wall: the sleeve needs fire stopping.',
    'clashfix.refused': 'Not filed: {why}', 'clashfix.c.not_yours': 'that element belongs to another discipline', 'clashfix.c.too_far': 'over the limit', 'clashfix.c.fixed_end': 'the run is fixed to equipment',
    'clashfix.c.drain_detour': 'a gravity drain may not rise or dip', 'clashfix.c.too_many': 'too many detours on one run', 'clashfix.c.bad_leg': 'no such leg', 'clashfix.c.not_rect': 'not a rectangular duct',
    'clashfix.c.area': 'the duct would get smaller', 'clashfix.c.aspect': 'the duct would be too flat', 'clashfix.c.small': 'a side would be too small', 'clashfix.c.load_bearing': 'the wall may carry load',
    'clashfix.c.not_through': 'no run passes there', 'clashfix.c.bad_op': 'not allowed', 'clashfix.c.unknown_element': 'unknown element', 'clashfix.c.not_a_tool': 'not this discipline\'s tool', 'clashfix.c.unknown_clash': 'unknown clash', 'clashfix.c.too_tight': 'no room for the bends (each piece between two bends needs {need})',
    'clashfix.accept': 'Accept', 'clashfix.accepted': 'Accepted', 'clashfix.reject': 'Reject', 'clashfix.rejected': 'Rejected', 'clashfix.show': 'Show', 'clashfix.clear': 'Undo choice',
    'clashfix.advice': 'Advice only: this app cannot make this change in the model. Accepting it notes it in the issue list.',
    'clashfix.sum': '{n} accepted: {resolved} of {total} clashes settled together, {left} left, {new} new clash(es), {breaks} rule(s) broken.',
    'clashfix.sum.none': 'Nothing accepted yet.', 'clashfix.apply': 'Apply accepted fixes (one undo step)',
    'clashfix.applied': 'Applied {n} fix(es) as one undo step. The clash check runs again.', 'clashfix.applied.advice': '{n} advice-only fix(es) noted as issues.',
    'clashfix.conflict': 'That fix changes an element another accepted fix already changes. Undo the other choice first.',
    'clashfix.none': 'No fix found within the limits for this clash.', 'clashfix.close': 'Close', 'clashfix.empty': 'No clashes to settle. Run the clash check first.',
    'clashfix.why': 'Why: {why}', 'clashfix.refused.model': 'the model did not take the change (see the status line)', 'clashfix.more': '{n} more', 'clashfix.failed': 'Could not apply the fixes: {why}',
    'clashfix.limits': 'Limits: a run moves up to {shift}, a detour climbs up to {rise}, a column moves up to {col}, a gap of {gap} is kept round runs.',
  },
  'es-MX': {
    'clashfix.open': 'Proponer arreglos', 'clashfix.title': 'Arreglos propuestos',
    'clashfix.lede': 'Cada disciplina propone arreglos solo para sus propios elementos. Cada arreglo se probó en una copia del modelo y se revisó de nuevo contra choques y reglas. Nada cambia hasta que aceptes arreglos y los apliques.',
    'clashfix.who.none': 'No hay un asistente conectado: estas son las propuestas de las reglas integradas.',
    'clashfix.who.some': '{n} asistente(s) conectado(s) pueden agregar arreglos aquí (leen los choques y proponen para su disciplina).',
    'clashfix.disc.structure': 'Estructura', 'clashfix.disc.mechanical': 'Mecánica', 'clashfix.disc.plumbing': 'Plomería', 'clashfix.disc.electrical': 'Eléctrica', 'clashfix.disc.architecture': 'Arquitectura',
    'clashfix.by.rules': 'Reglas integradas', 'clashfix.by.assistant': 'Asistente: {name}',
    'p.crossover.over': 'Desvío por encima, {dz} arriba', 'p.crossover.under': 'Desvío por debajo, {dz} abajo', 'p.shift.up': 'Subir todo el tramo {dz}', 'p.shift.down': 'Bajar todo el tramo {dz}',
    'p.shift.side': 'Mover todo el tramo {d} de lado', 'p.resize': 'Hacer el ducto de {w} × {h}', 'p.move_column': 'Mover la columna {d}', 'p.move_wall': 'Mover el muro {d}',
    'p.opening.beam': 'Abertura en el alma de la viga, {w} × {h}', 'p.opening.slab': 'Perforación en la losa, {w} × {h}', 'p.opening.wall': 'Camisa en el muro, {w} × {h}', 'p.assistant': 'Propuesto por un asistente',
    'clashfix.t.resolves': 'Lo resuelve', 'clashfix.t.not': 'No lo resuelve', 'clashfix.t.new': '{n} choque(s) nuevo(s)', 'clashfix.t.nonew': 'ningún choque nuevo',
    'clashfix.t.breaks': '{n} regla(s) incumplida(s)', 'clashfix.t.nobreaks': 'ninguna regla incumplida', 'clashfix.t.added': '{len} más de tramo', 'clashfix.t.moved': 'mueve {len}',
    'clashfix.t.fittings': '{n} conexiones', 'clashfix.t.cost': 'costo relativo {n}', 'clashfix.t.also': 'también resuelve {n} más',
    'clashfix.r.clearance': 'A menos de {need} mm de otro elemento', 'clashfix.r.headroom': 'Debajo de la altura libre ({need} mm sobre el nivel)', 'clashfix.r.drain_slope': 'El drenaje subiría en el sentido del flujo',
    'clashfix.r.access_above': 'Menos de {need} mm libres sobre la charola para tender cable', 'clashfix.r.web_opening': 'Incumple una regla de aberturas en el alma (tamaño, distancia a los extremos o altura)', 'clashfix.r.span': 'Una viga que llega a la columna cambia de claro',
    'note.engineer': 'El ingeniero estructural lo aprueba.', 'note.fire_stop': 'Muro con resistencia al fuego: la camisa necesita sello cortafuego.',
    'clashfix.refused': 'No se registró: {why}', 'clashfix.c.not_yours': 'ese elemento es de otra disciplina', 'clashfix.c.too_far': 'pasa del límite', 'clashfix.c.fixed_end': 'el tramo está fijo a un equipo',
    'clashfix.c.drain_detour': 'un drenaje por gravedad no puede subir ni bajar', 'clashfix.c.too_many': 'demasiados desvíos en un tramo', 'clashfix.c.bad_leg': 'no existe ese segmento', 'clashfix.c.not_rect': 'no es un ducto rectangular',
    'clashfix.c.area': 'el ducto quedaría más chico', 'clashfix.c.aspect': 'el ducto quedaría demasiado plano', 'clashfix.c.small': 'un lado quedaría demasiado chico', 'clashfix.c.load_bearing': 'el muro puede ser de carga',
    'clashfix.c.not_through': 'no pasa ningún tramo por ahí', 'clashfix.c.bad_op': 'no permitido', 'clashfix.c.unknown_element': 'elemento desconocido', 'clashfix.c.not_a_tool': 'no es una herramienta de esta disciplina', 'clashfix.c.unknown_clash': 'choque desconocido', 'clashfix.c.too_tight': 'no hay lugar para los codos (cada pieza entre dos codos necesita {need})',
    'clashfix.accept': 'Aceptar', 'clashfix.accepted': 'Aceptado', 'clashfix.reject': 'Rechazar', 'clashfix.rejected': 'Rechazado', 'clashfix.show': 'Mostrar', 'clashfix.clear': 'Deshacer elección',
    'clashfix.advice': 'Solo consejo: esta app no puede hacer este cambio en el modelo. Al aceptarlo se anota en la lista de incidencias.',
    'clashfix.sum': '{n} aceptado(s): {resolved} de {total} choques resueltos juntos, quedan {left}, {new} choque(s) nuevo(s), {breaks} regla(s) incumplida(s).',
    'clashfix.sum.none': 'Nada aceptado todavía.', 'clashfix.apply': 'Aplicar los arreglos aceptados (un solo paso de deshacer)',
    'clashfix.applied': 'Se aplicaron {n} arreglo(s) como un solo paso de deshacer. La revisión de choques corre de nuevo.', 'clashfix.applied.advice': '{n} arreglo(s) de solo consejo anotados como incidencias.',
    'clashfix.conflict': 'Ese arreglo cambia un elemento que ya cambia otro arreglo aceptado. Deshaz primero la otra elección.',
    'clashfix.none': 'No se encontró un arreglo dentro de los límites para este choque.', 'clashfix.close': 'Cerrar', 'clashfix.empty': 'No hay choques que resolver. Corre primero la revisión de choques.',
    'clashfix.why': 'Por qué: {why}', 'clashfix.refused.model': 'el modelo no aceptó el cambio (ve la línea de estado)', 'clashfix.more': '{n} más', 'clashfix.failed': 'No se pudieron aplicar los arreglos: {why}',
    'clashfix.limits': 'Límites: un tramo se mueve hasta {shift}, un desvío sube hasta {rise}, una columna se mueve hasta {col}, se deja un espacio de {gap} alrededor de los tramos.',
  },
};

/** t: the host's translate function (its file wins); else this file's words in the locale, then English. */
export function wordsOf(t, locale = 'en') {
  const own = WORDS[locale] || WORDS[String(locale).split('-')[0]] || null;
  return (k, v) => {
    let r = t ? t(k, v) : k;
    if (r && r !== k) return r;
    r = (own && own[k]) || WORDS.en[k] || k;
    return r.replace(/\{(\w+)\}/g, (m, a) => (v && v[a] !== undefined ? v[a] : m));
  };
}
