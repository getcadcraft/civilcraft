/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: this file IS the word table (English source, es-MX draft). */
/**
 * words.js — cc-nodes (nodes_PART_3): every word the library and the panel show, as key → [English, context, es-MX draft]. Node labels come
 * from the library (`nodes.n.<id>`), port names are `nodes.p.<name>`. tools/nodes/lang.mjs writes them into ONE named app's lang files.
 */
import { LIBRARY, CATEGORIES } from './library.js';

const ES = { input: 'Entrada', math: 'Matemáticas', list: 'Listas', vector: 'Puntos y vectores', curve: 'Curvas', transform: 'Transformar', surface: 'Superficies', solid: 'Sólidos' };
const UI = {
  'nodes.title': ['Nodes', 'panel title', 'Nodos'],
  'nodes.close': ['Close', 'button: close the node editor window', 'Cerrar'],
  'nodes.bake': ['Bake to model', 'button: turn the shown surfaces and meshes into the host\'s own geometry', 'Hornear al modelo'],
  'nodes.bake.title': ['Turn what is shown (surfaces and meshes) into editable geometry in the model. The graph stays; the copy no longer follows it.', 'tooltip for the bake button', 'Convierte lo que se muestra (superficies y mallas) en geometría editable del modelo. El grafo se conserva; la copia ya no lo sigue.'],
  'nodes.baked': ['Baked {n} shape(s), {tri} triangles, into the model. {pts} point(s) and {crv} curve(s) are not solids and were left out.', 'status after baking', 'Se hornearon {n} forma(s), {tri} triángulos, en el modelo. {pts} punto(s) y {crv} curva(s) no son sólidos y se omitieron.'],
  'nodes.bake.none': ['Nothing to bake: switch on the eye of a node that makes a surface or a mesh.', 'status when nothing shown is a surface or mesh', 'Nada que hornear: activa el ojo de un nodo que produzca una superficie o una malla.'],
  'nodes.bake.undo': ['Bake nodes to the model', 'undo step label', 'Hornear nodos al modelo'],
  'nodes.ws.label': ['Nodes', 'workspace name', 'Nodos'],
  'nodes.ws.blurb': ['Wire nodes into points, curves and surfaces; every node is also a line of script. Saved in the part file.', 'workspace blurb', 'Conecta nodos para crear puntos, curvas y superficies; cada nodo también es una línea de script. Se guarda en el archivo de la pieza.'],
  'nodes.open': ['Nodes…', 'menu item that opens the node editor', 'Nodos…'],
  'nodes.intro': ['Build a model by wiring nodes: numbers into points, points into curves, curves into surfaces. Every node is also a line of CraftScript.', 'one-paragraph description in the app panel', 'Crea un modelo conectando nodos: números en puntos, puntos en curvas, curvas en superficies. Cada nodo también es una línea de CraftScript.'],
  'nodes.hint': ['Wire the nodes together: drag from a round output to a round input. Every node is also a line of script.', 'panel hint', 'Conecta los nodos: arrastra de una salida redonda a una entrada redonda. Cada nodo también es una línea de script.'],
  'nodes.search': ['Find a node', 'palette search placeholder', 'Buscar un nodo'],
  'nodes.undo': ['Undo', 'button', 'Deshacer'], 'nodes.redo': ['Redo', 'button', 'Rehacer'],
  'nodes.tidy': ['Tidy', 'button: arrange nodes in columns', 'Ordenar'],
  'nodes.fit': ['Fit', 'button: fit all nodes in the view', 'Ajustar'],
  'nodes.clear': ['Clear', 'button: remove every node', 'Vaciar'],
  'nodes.script': ['Script', 'button: show the graph as a script', 'Script'],
  'nodes.script.apply': ['Make the graph from this script', 'button', 'Crear el grafo desde este script'],
  'nodes.script.close': ['Back to the graph', 'button', 'Volver al grafo'],
  'nodes.script.error': ['Line {line}: {message}', 'a script that could not be read', 'Línea {line}: {message}'],
  'nodes.delete': ['Delete', 'button on a selected node', 'Eliminar'],
  'nodes.show': ['Show in the model', 'eye button tooltip', 'Mostrar en el modelo'],
  'nodes.hide': ['Hide from the model', 'eye button tooltip', 'Ocultar del modelo'],
  'nodes.empty': ['No nodes yet. Pick one from the list to start.', 'empty graph', 'Aún no hay nodos. Elige uno de la lista.'],
  'nodes.dropped': ['{n} items in the file could not be read and were left out.', 'warning', 'No se pudieron leer {n} elementos del archivo y se omitieron.'],
  'nodes.stats': ['{nodes} nodes, {wires} wires', 'status line', '{nodes} nodos, {wires} conexiones'],
  'nodes.undo.label': ['Nodes', 'prefix of an undo step', 'Nodos'],
  'nodes.err.format': ['This is not a node graph.', 'error', 'Esto no es un grafo de nodos.'],
  'nodes.err.unknown_type': ['There is no node called {type}.', 'error', 'No hay un nodo llamado {type}.'],
  'nodes.err.too_many': ['A graph holds at most {max} of these.', 'error', 'Un grafo admite como máximo {max}.'],
  'nodes.err.duplicate': ['The name {id} is already used.', 'error', 'El nombre {id} ya se usa.'],
  'nodes.err.no_node': ['That node is not in the graph.', 'error', 'Ese nodo no está en el grafo.'],
  'nodes.err.no_port': ['{id} has no port {port}.', 'error', '{id} no tiene el puerto {port}.'],
  'nodes.err.cycle': ['That wire would make a loop.', 'error', 'Esa conexión haría un bucle.'],
  'nodes.err.type': ['A {from} cannot feed a {to}.', 'error', 'Un {from} no puede alimentar un {to}.'],
  'nodes.err.unit': ['A {from} cannot feed a {to}: the units differ.', 'error', 'Un {from} no puede alimentar un {to}: las unidades difieren.'],
  'nodes.err.units': ['{a} and {b} cannot be mixed.', 'error', 'No se pueden mezclar {a} y {b}.'],
  'nodes.err.units_mul': ['{a} times {b} is not a length or an angle.', 'error', '{a} por {b} no es una longitud ni un ángulo.'],
  'nodes.err.bad_value': ['{port} needs a valid value.', 'error', '{port} necesita un valor válido.'],
  'nodes.err.upstream': ['Waiting for {id}, which has a problem.', 'error', 'Esperando a {id}, que tiene un problema.'],
  'nodes.err.missing': ['{port} has nothing connected.', 'error', '{port} no tiene nada conectado.'],
  'nodes.err.value_type': ['{port} wants a {want}, but got a {got}.', 'error', '{port} espera un {want}, pero recibió un {got}.'],
  'nodes.err.failed': ['{message}', 'error', '{message}'],
  'nodes.err.not_finite': ['{what} is not a finite number.', 'error', '{what} no es un número finito.'],
  'nodes.err.range': ['The smallest value {min} is above the largest {max}.', 'error', 'El valor menor {min} es mayor que el mayor {max}.'],
  'nodes.err.divide_zero': ['Cannot divide by zero.', 'error', 'No se puede dividir entre cero.'],
  'nodes.err.sqrt': ['Cannot take the square root of a negative number.', 'error', 'No se puede sacar la raíz cuadrada de un número negativo.'],
  'nodes.err.count': ['The count must be a whole number from 0 to {max}.', 'error', 'La cantidad debe ser un entero de 0 a {max}.'],
  'nodes.err.count_min': ['The count must be at least {min}.', 'error', 'La cantidad debe ser al menos {min}.'],
  'nodes.err.empty': ['The list is empty.', 'error', 'La lista está vacía.'],
  'nodes.err.zero_vector': ['A vector of length zero has no direction.', 'error', 'Un vector de longitud cero no tiene dirección.'],
  'nodes.err.axis': ['The axis has no direction.', 'error', 'El eje no tiene dirección.'],
  'nodes.err.same_point': ['The two points are the same.', 'error', 'Los dos puntos son el mismo.'],
  'nodes.err.radius': ['The radius must be above zero.', 'error', 'El radio debe ser mayor que cero.'],
  'nodes.err.angle': ['The angle must not be zero.', 'error', 'El ángulo no debe ser cero.'],
  'nodes.err.scale': ['The scale factor must not be zero.', 'error', 'El factor de escala no debe ser cero.'],
  'nodes.err.sections': ['A loft needs at least {min} curves.', 'error', 'Un loft necesita al menos {min} curvas.'],
  'nodes.err.tolerance': ['The tolerance must be above zero.', 'error', 'La tolerancia debe ser mayor que cero.'],
  'nodes.err.not_geometry': ['This is not something that can be moved.', 'error', 'Esto no se puede mover.'],
  'nodes.err.script': ['Line {line}: {message}', 'a script that could not be read', 'Línea {line}: {message}'],
  'nodes.err.script_value': ['{port} needs {want}.', 'error', '{port} necesita {want}.'],
  'nodes.err.bad': ['Something in the file could not be read.', 'error', 'No se pudo leer algo del archivo.'],
};
const ES_NODE = {
  number: 'Número', length: 'Longitud', angle: 'Ángulo', slider: 'Deslizador', boolean: 'Sí / no', point: 'Punto', vector: 'Vector', xyz: 'Partes del punto',
  add: 'Sumar', subtract: 'Restar', multiply: 'Multiplicar', divide: 'Dividir', power: 'Potencia', minimum: 'Menor', maximum: 'Mayor', modulo: 'Resto',
  negate: 'Negar', absolute: 'Valor absoluto', round: 'Redondear', floor: 'Redondear hacia abajo', sqrt: 'Raíz cuadrada', sin: 'Seno', cos: 'Coseno', tan: 'Tangente',
  atan2: 'Ángulo de (x, y)', mix: 'Mezclar', clamp: 'Limitar', series: 'Serie', range: 'Rango', random: 'Números aleatorios', repeat: 'Repetir', list: 'Lista',
  item: 'Elemento', length_of: 'Longitud de la lista', reverse_list: 'Invertir lista', sum: 'Suma', sort: 'Ordenar números',
  point_add: 'Punto + vector', vector_between: 'Vector entre', vector_scale: 'Escalar vector', vector_unit: 'Vector unitario', vector_length: 'Longitud del vector',
  distance: 'Distancia', dot: 'Producto escalar', cross: 'Producto vectorial', midpoint: 'Punto entre', polar: 'Punto en un círculo',
  line: 'Línea', polyline: 'Polilínea', arc: 'Arco', circle: 'Círculo', through_points: 'Curva por puntos', curve_point: 'Punto en la curva', curve_length: 'Longitud de la curva',
  divide_curve: 'Dividir curva', reverse_curve: 'Invertir curva', join_curves: 'Unir curvas', move: 'Mover', rotate: 'Girar', scale: 'Escalar',
  array_linear: 'Matriz en línea', array_polar: 'Matriz alrededor de un eje', extrude: 'Extruir', ruled: 'Superficie reglada', revolve: 'Revolución', loft: 'Loft',
  sweep: 'Barrido por un riel', patch: 'Parche plano', surface_point: 'Punto en la superficie', surface_area: 'Área de la superficie', offset_surface: 'Desfasar superficie', to_mesh: 'Superficie a malla',
};
const ES_PORT = { value: 'valor', min: 'mínimo', max: 'máximo', degrees: 'grados', x: 'x', y: 'y', z: 'z', start: 'inicio', step: 'paso', count: 'cantidad', end: 'fin', seed: 'semilla', items: 'elementos', list: 'lista', index: 'índice',
  numbers: 'números', point: 'punto', vector: 'vector', from: 'desde', to: 'hasta', radius: 'radio', center: 'centro', normal: 'normal', points: 'puntos', degree: 'grado', curve: 'curva', curves: 'curvas', geometry: 'geometría',
  by: 'desplazamiento', angle: 'ángulo', about: 'alrededor de', axis: 'eje', axis_point: 'punto del eje', factor: 'factor', direction: 'dirección', profile: 'perfil', rail: 'riel', sections: 'secciones', surface: 'superficie',
  distance: 'distancia', tolerance: 'tolerancia', out: 'resultado', t: 't', u: 'u', v: 'v', a: 'a', b: 'b', p00: 'p00', p10: 'p10', p11: 'p11', p01: 'p01' };
const PORTS = {};
export function words() {
  const w = { ...UI };
  for (const c of CATEGORIES) w['nodes.cat.' + c] = [c[0].toUpperCase() + c.slice(1), 'node group', ES[c]];
  for (const d of LIBRARY) {
    w['nodes.n.' + d.id] = [d.en, 'node name', ES_NODE[d.id] || d.en];
    for (const p of [...d.ins, ...d.outs]) PORTS[p.name] = PORTS[p.name] || p.en || p.name.replace(/_/g, ' ');
  }
  for (const [k, v] of Object.entries(PORTS)) w['nodes.p.' + k] = [v[0].toUpperCase() + v.slice(1), 'port name', ES_PORT[k] || v];
  return w;
}
