---
title: Modificadores de terreno y niveles en vivo
summary: Todo lo que da forma al terreno proyectado en una sola lista ordenada (gana el último donde se superponen), corte y relleno por cada modificador, controles de unión en el panel de Problemas, y niveles puntuales y flechas de pendiente que leen el terreno en vivo.
keywords: modificadores de terreno, pila, orden, terreno proyectado, terreno existente, superposición, corte y relleno, unión, muro de contención, borde de pavimento, nivel de cama, descanso de escalón, nivel puntual, altura puntual, flecha de pendiente, etiqueta de pendiente, caídas
from: 3998a5b0
---

Terreno proyectado = terreno existente + los modificadores, en orden. El terreno existente nunca se cambia.

## La lista

{{ui:Levels}} › {{ui:Ground modifiers…}} ohechauka opa mba'e ojeporomba'eva terreno: plataformas, albardones, canaletas de drenaje, áreas de movimiento de suelo, pavimentos y senderos, áreas plantadas con nivel terminado, y escalones y rampas cuya casilla **Da forma al terreno** oñemarka (con sus niveles inferior y superior). Donde dos se superponen, el **posterior** gana. Ejapo peteĩ fila, térã usa las flechas, para cambiar el orden; el terreno oñemoñepyrũ enseguida. Cada fila ohechauka su corte y relleno (lo que da forma después de los de arriba), y el total va debajo de la lista.

## Controles de unión

El panel de Problemas ohechauka, con **Ir a**:

- un muro cuyo lado alto está por encima de su tope (tierra sobre el muro), o cuyo lado bajo muestra su cimiento;
- un área plantada cuyo nivel terminado está por encima del borde del pavimento con el que linda, o más de 150 mm por debajo, lo típico;
- escalones cuya base o tope no encuentra el pavimento donde aterrizan;
- dos modificadores que se superponen (gana el posterior allí).

Un muro de contención puede hacer que su tope siga el lado alto del terreno: su altura se vuelve a calcular cada vez que cambia el terreno.

## Un muro de contención que da forma al terreno

Selecciona un muro de contención y marca **Da forma al terreno**. La franja debajo del muro (tan ancha como el muro es grueso) se suma a la lista como modificador:

- el borde del **lado alto** se mantiene en el terreno de allí, estación por estación, así el tope del muro sigue el lado alto (con el remate arriba). Escribe un nivel **Tope** y en cambio mantiene el lado alto a ese nivel menos el remate;
- el borde del **lado bajo** se mantiene en el nivel **Terreno mantenido en el lado bajo** que escribas, o, si queda en blanco, en el terreno de allí;
- el lado alto es el lado cuyo terreno es más alto en todo el muro, así que nunca cambia a lo largo del muro;
- el terreno más allá de la franja no cambia, y el terreno existente nunca cambia.

Como cualquier modificador, queda en la lista, y un modificador posterior a él gana donde se superponen. Un muro cuyo nivel mantenido en un extremo está a más de 150 mm típicos del terreno existente allí recibe un aviso en el panel de Problemas (con **Ir a**). Un muro independiente no da forma al terreno. La casilla está desactivada en archivos de versiones anteriores, así que se abren tal como estaban.

## Niveles puntuales y flechas de pendiente

{{ui:Spot level}} (un clic) y {{ui:Gradient arrow}} (dos clics) leen el terreno cada vez que se dibujan: si mueves o vuelves a nivelar un objeto, las etiquetas lo siguen. En Propiedades elige si una etiqueta lee el terreno proyectado o el existente; las etiquetas del terreno existente se muestran entre corchetes. Las flechas apuntan cuesta abajo y dicen `1:20 (5.0 %)`.
