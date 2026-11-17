---
title: Modificadores del terreno y cotas en vivo
summary: Todo lo que da forma al terreno proyectado en una sola lista ordenada (gana el último donde se solapan), desmonte y terraplén por modificador, comprobaciones de empalme en el panel de Problemas, y cotas puntuales y flechas de pendiente que leen el terreno en vivo.
keywords: modificadores del terreno, pila, orden, terreno proyectado, terreno existente, solapamiento, desmonte y terraplén, empalme, muro de contención, borde de pavimento, cota de lecho, rellano de escalón, cota puntual, altura puntual, flecha de pendiente, etiqueta de pendiente, pendientes
from: 3998a5b0
---

Terreno proyectado = terreno existente + los modificadores, en orden. El terreno existente nunca se modifica.

## La lista

{{ui:Levels}} › {{ui:Ground modifiers…}} enumera todos los objetos que dan forma al terreno: plataformas, caballones, cunetas vegetales, zonas de explanación, pavimentos y senderos, zonas ajardinadas con cota acabada, y escalones y rampas cuya casilla **Da forma al terreno** esté marcada (con sus cotas de base y de cabeza). Donde dos se solapan, gana el de **después**. Arrastre una fila o use las flechas para cambiar el orden; el terreno se recalcula al instante. Cada fila muestra su desmonte y terraplén (lo que da forma después de los anteriores), con el total bajo la lista.

## Comprobaciones de empalme

El panel de Problemas enumera, con **ir a**:

- un muro cuyo lado alto queda por encima de su coronación (tierra sobre el muro), o cuyo lado bajo muestra su cimentación;
- una zona ajardinada cuya cota acabada está por encima del borde del pavimento con el que linda, o más de los 150 mm habituales por debajo de él;
- escalones cuya base o cuya cabeza no coinciden con el pavimento en el que descansan;
- dos modificadores que se solapan (gana el posterior en esa zona).

Un muro de contención puede hacer que su coronación siga el lado alto del terreno: su altura se recalcula cada vez que cambia el terreno.

## Un muro de contención que da forma al terreno

Seleccione un muro de contención y marque **Da forma al terreno**. La franja bajo el muro (tan ancha como el muro es grueso) se une a la lista como modificador:

- el borde del **lado alto** se mantiene a la altura del terreno en ese punto, estación a estación, de modo que la coronación del muro sigue al lado alto (con el remate encima). Escriba una **Cota superior** y el lado alto se mantendrá a esa cota menos el remate;
- el borde del **lado bajo** se mantiene en la cota **Terreno retenido en el lado bajo** que escriba o, si lo deja vacío, a la del terreno en ese punto;
- el lado alto es el lado cuyo terreno es más alto en todo el muro, de modo que nunca cambia a lo largo del muro;
- el terreno más allá de la franja no cambia, y el terreno existente nunca cambia.

Como cualquier modificador, ocupa su lugar en la lista, y un modificador posterior a él gana donde se solapan. Un muro cuya cota retenida en un extremo esté a más de los 150 mm habituales del terreno existente en ese punto recibe una advertencia en el panel de Problemas (con **ir a**). Un muro exento no da forma al terreno. La casilla está desactivada en los archivos de versiones anteriores, así que se abren tal como estaban.

## Cotas puntuales y flechas de pendiente

{{ui:Spot level}} (un clic) y {{ui:Gradient arrow}} (dos clics) leen el terreno cada vez que se dibujan: si mueve o renivela un objeto, las etiquetas se actualizan. En **Propiedades** elija si una etiqueta lee el terreno proyectado o el existente; las etiquetas del terreno existente se muestran entre corchetes. Las flechas apuntan cuesta abajo y muestran `1:20 (5.0 %)`.
