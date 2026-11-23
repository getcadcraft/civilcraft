---
title: Pavimento, muros y escalones
summary: Pavimento con caídas hacia un desagüe o una pendiente transversal, un patrón y su estructura; senderos que siguen el terreno; muros de contención y exentos con cimientos escalonados; cordones; rampas y escalones verificados contra sus límites; IFC de salida.
keywords: obras duras, pavimento, adoquines, patio, terraza, caídas, desagüe, pendiente transversal, espina de pescado, aparejo a soga, sendero, camino peatonal, muro de contención, muro de jardín, cimiento, remate, cordón, borde, rampa, accesibilidad, escalones, escaleras, contrahuellas, huellas, descanso
from: d34b4466
---

Las obras duras se vuelven a calcular a partir del terreno cada vez, de modo que siguen el relieve y se regeneran cuando el terreno o su línea se mueven. Arrastrá sus esquinas en el plano como cualquier línea. Abrilas desde {{ui:Obras duras}} en el grupo Paisajismo.

## Pavimento

Hacé clic en las esquinas y presioná {{key:Enter}}. En Propiedades:

- **Nivel**: vacío = el promedio del terreno bajo él.
- **Caídas**: nivel, una **pendiente transversal** (un % hacia una dirección) o **hacia un desagüe**: CivilCraft te pide que hagas clic donde va el desagüe, y entonces cada esquina sube desde el desagüe con la caída. Las flechas en el plano muestran las caídas.
- **Patrón** (cuadrícula, aparejo a soga, espina de pescado) con el tamaño de la unidad, la junta y el ángulo; **Borde** de ancho. En una hoja, las juntas más cercanas que un milímetro se omiten.
- El pavimento forma parte de la superficie propuesta. Sus capas (adoquines, lecho, base) pasan al IFC y a las cantidades.

## Senderos

Hacé clic a lo largo del sendero y presioná {{key:Enter}}. Sigue el terreno, con su **Pendiente transversal** hacia su lado derecho. Un sendero más empinado que la **Pendiente máxima permitida** se marca con `!` en el plano donde ocurre, y las Propiedades dicen qué tan empinado llega a ser.

Donde un sendero encuentra un camino construido por un corredor, se detiene en el borde exterior del camino, a la misma altura que la vereda o la berma allí, en la superficie propuesta y en la vista 3D. Un sendero que cruza un camino se nivela y se muestra como dos piezas, y un extremo dibujado hasta el doble del ancho del sendero antes del camino se prolonga hasta su borde. El plano todavía muestra el sendero como lo dibujaste, y su longitud y su área cuentan la línea completa. Mirá [Barrido de un corredor vial](topic:corridor).

## Muros

Hacé clic a lo largo del muro y presioná {{key:Enter}}. Un muro es de **contención** o **exento**. Sin **Parte superior**, se eleva su **Altura** sobre el terreno en toda su longitud; escribí una parte superior para mantenerlo nivelado. Su **cimiento** queda a una profundidad fija bajo el terreno y baja en escalones enteros, de modo que queda nivelado entre ellos. Las propiedades dan su longitud, sus alturas, el área de su cara y los escalones del cimiento; el plano rotula la parte superior y la inferior del muro (TW / BW) en cada extremo.

:::warning
Un muro de contención de más de 1.2 m (4 ft) se marca: lo diseña un ingeniero.
:::

## Cordones

Hacé clic a lo largo del cordón y presioná {{key:Enter}}; fijá su ancho y su altura libre.

## Rampas

Hacé clic desde la parte inferior hasta la superior y presioná {{key:Enter}}. Las cotas salen del terreno en cada extremo, salvo que las escribas. Una rampa tiene un descanso cada desnivel de 750 mm (2.5 ft) y se verifica contra la **Pendiente máxima permitida** (1:12 al inicio) y un ancho mínimo; las Propiedades dicen cuánto tendría que ser de larga.

## Escalones

Hacé clic en el borde frontal del primer escalón, luego donde los escalones llegan arriba, y presioná {{key:Enter}}. El número de contrahuellas sale de la altura y de la **Contrahuella mayor**; la huella, de la regla de confort 2R + G ≈ 630 mm, nunca menos que la **Huella mínima**; un descanso cada **Contrahuellas por tramo como máximo**. Las Propiedades dicen si caben entre los dos puntos o cuánto más largos necesitan ser.

:::note
Los límites para rampas y escalones son valores predeterminados rotulados. Fijá los que exige el código de edificación de tu zona.
:::

## Fuera de CivilCraft

- Más › {{ui:Exportar IFC de paisajismo}}: el pavimento y los senderos como `IfcPavement`, los muros como `IfcWall` (los muros de contención como RETAININGWALL) con sus capas, los cordones como `IfcKerb`, las rampas como `IfcRamp`, los escalones como `IfcStair` con sus contrahuellas y huellas.
- **Enviar a TakeoffCraft** de la planilla de plantas lleva las áreas de pavimento y los volúmenes de capas, las áreas de cara y las longitudes de los muros, las longitudes de los cordones y la cantidad de escalones.
- La hoja de detalles dibuja la sección de cada muro, la estructura de cada pavimento y cada tramo de escalones. Mirá [Hojas de paisajismo](topic:landscape-sheets).
