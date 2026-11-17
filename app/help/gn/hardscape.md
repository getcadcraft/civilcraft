---
title: Pavimentos, muros y escalones
summary: Pavimento con caídas hacia un desagüe o una pendiente transversal, un patrón y su capa base; senderos que siguen el terreno; muros de contención e independientes con cimientos escalonados; cordones; rampas y escalones verificados contra sus límites; exportación IFC.
keywords: obras duras, pavimento, adoquines, patio, terraza, caídas, desagüe, pendiente transversal, espina de pez, aparejo, sendero, camino peatonal, muro de contención, muro de jardín, cimiento, remate, cordón, borde, rampa, accesibilidad, escalones, escaleras, contrahuellas, huellas, descanso
from: 51475877
---

Las obras duras se vuelven a calcular cada vez a partir del terreno, así que siguen el relieve y se regeneran cuando el terreno o su línea se mueven. Arrastra sus esquinas en el plano como cualquier línea. Ábrelas desde {{ui:Hardscape}} en el grupo paisajismo.

## Pavimento

Haz clic en las esquinas y presiona {{key:Enter}}. En Propiedades:

- **Nivel**: vacío = el promedio del terreno debajo.
- **Caídas**: nivel, una **pendiente transversal** (un % hacia una dirección) o **hacia un desagüe**: CivilCraft te pide que hagas clic donde va el desagüe, y luego cada esquina sube desde el desagüe con la caída. Las flechas en el plano muestran las caídas.
- **Patrón** (cuadrícula, aparejo a soga, espina de pez) con el tamaño de la unidad, la junta y el ángulo; **Ancho** del borde. En una hoja, las juntas más cortas que un milímetro se omiten.
- El pavimento es parte de la superficie proyectada. Sus capas (adoquines, lecho, base) pasan al IFC y a los cómputos.

## Senderos

Haz clic a lo largo del sendero y presiona {{key:Enter}}. Sigue el terreno, con su **Pendiente transversal** hacia su lado derecho. Un sendero más empinado que **Pendiente máxima permitida** se marca con `!` en el plano donde ocurre, y Propiedades dice qué tan empinado llega a ser.

## Muros

Haz clic a lo largo del muro y presiona {{key:Enter}}. Un muro es **de contención** o **independiente**. Sin **Tope**, se eleva su **Altura** sobre el terreno en toda su longitud; escribe un tope para mantenerlo nivelado. Su **cimiento** queda a una profundidad fija debajo del terreno y baja por escalones enteros, así que queda nivelado entre ellos. Propiedades da su longitud, alturas, área de cara y escalones del cimiento; el plano rotula el tope y la base del muro (TW / BW) en cada extremo.

:::warning
Un muro de contención de más de 1,2 m (4 ft) se marca: lo diseña un ingeniero.
:::

## Cordones

Haz clic a lo largo del cordón y presiona {{key:Enter}}; define su ancho y su altura libre.

## Rampas

Haz clic desde la parte inferior hasta la superior y presiona {{key:Enter}}. Los niveles vienen del terreno en cada extremo, salvo que los escribas. Una rampa recibe un descanso cada subida de 750 mm (2.5 ft) y se verifica contra **Pendiente máxima permitida** (1:12 para empezar) y un ancho mínimo; Propiedades dice qué largo necesitaría.

## Escalones

Haz clic en el borde frontal del primer escalón, luego donde los escalones llegan arriba, y presiona {{key:Enter}}. El número de contrahuellas sale de la altura y de la **Contrahuella más grande**; la huella sale de la regla de comodidad 2R + G ≈ 630 mm, nunca menor que la **Huella más pequeña**; un descanso cada **Contrahuellas por tramo como máximo**. Propiedades dice si entran entre los dos puntos o cuánto más largos necesitan ser.

:::note
Los límites de rampas y escalones son valores predeterminados rotulados. Define los que exija el código de edificación de tu zona.
:::

## Fuera de CivilCraft

- Más › {{ui:Export landscape IFC}}: pavimentos y senderos como `IfcPavement`, muros como `IfcWall` (los de contención como RETAININGWALL) con sus capas, cordones como `IfcKerb`, rampas como `IfcRamp`, escalones como `IfcStair` con sus contrahuellas y huellas.
- **Enviar a TakeoffCraft** de la planilla de plantas lleva las áreas de pavimento y los volúmenes de capas, las áreas de cara y longitudes de muros, las longitudes de cordones y la cantidad de escalones.
- La hoja de detalles dibuja la sección de cada muro, la composición de cada pavimento y cada tramo de escalones. Ver [Hojas de paisajismo](topic:landscape-sheets).
