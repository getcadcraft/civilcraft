---
title: Modificadores del terreno y cotas en vivo
summary: Todo lo que da forma al terreno propuesto en una sola lista ordenada (gana el último donde se superponen), corte y relleno por modificador, comprobaciones de unión en el panel Problemas, y cotas puntuales y flechas de pendiente que leen el terreno en vivo.
keywords: modificadores del terreno, pila, orden, terreno propuesto, terreno existente, superposición, corte y relleno, unión, muro de contención, borde de pavimento, nivel de lecho, descanso de escalón, cota puntual, altura puntual, flecha de pendiente, etiqueta de pendiente, caídas
from: 3998a5b0
---

Terreno propuesto = terreno existente + los modificadores, en orden. El terreno existente nunca se modifica.

## La lista

{{ui:Cotas}} › {{ui:Modificadores del terreno…}} enumera todos los objetos que dan forma al terreno: plataformas, bermas, cunetas vegetadas, áreas de nivelación, pavimentos y senderos, áreas plantadas con una cota terminada, y escalones y rampas cuya casilla **Modela el terreno** está marcada (con sus cotas inferior y superior). Donde dos se superponen, gana el **último**. Arrastre una fila, o use las flechas, para cambiar el orden; el terreno se reconstruye de inmediato. Cada fila muestra su corte y relleno (lo que modela después de las filas anteriores), con el total debajo de la lista.

## Comprobaciones de unión

El panel Problemas enumera, con **ir a**:

- un muro cuyo lado alto está por encima de su remate (tierra sobre el muro), o cuyo lado bajo deja ver su cimentación;
- un área plantada cuya cota terminada está por encima del borde del pavimento con el que colinda, o más de los 150 mm típicos por debajo de él;
- escalones cuyo inicio o final no coincide con el pavimento en el que descansan;
- dos modificadores que se superponen (gana el último en esa zona).

Un muro de contención puede hacer que su remate siga al lado alto del terreno: su altura se recalcula cada vez que cambia el terreno.

## Un muro de contención que modela el terreno

Seleccione un muro de contención y marque **Modela el terreno**. La franja bajo el muro (tan ancha como el muro es grueso) se une a la lista como un modificador:

- El borde del **lado alto** se mantiene en el terreno de ese punto, estación por estación, de modo que el remate del muro sigue al lado alto (con la coronación encima). Si escribe una **Cota superior**, el lado alto se mantiene en esa cota menos la coronación.
- El borde del **lado bajo** se mantiene en la cota **Terreno retenido en el lado bajo** que escriba o, si la deja vacía, en el terreno de ese punto.
- El lado alto es el lado cuyo terreno es más alto en todo el muro, así que nunca cambia a lo largo del muro.
- El terreno más allá de la franja no cambia, y el terreno existente nunca cambia.

Como cualquier modificador, ocupa su lugar en la lista, y un modificador posterior gana donde se superpongan. Un muro cuya cota retenida en un extremo esté a más de los 150 mm típicos del terreno existente en ese punto genera una advertencia en el panel Problemas (con **ir a**). Un muro independiente no modela el terreno. La casilla está desactivada en archivos de versiones anteriores, así que se abren tal como estaban.

## Cotas puntuales y flechas de pendiente

{{ui:Cota puntual}} (un clic) y {{ui:Flecha de pendiente}} (dos clics) leen el terreno cada vez que se dibujan: si mueve o vuelve a nivelar un objeto, las etiquetas lo siguen. En Propiedades elija si una etiqueta lee el terreno propuesto o el existente; las etiquetas del terreno existente se muestran entre corchetes. Las flechas apuntan cuesta abajo y muestran `1:20 (5.0 %)`.
