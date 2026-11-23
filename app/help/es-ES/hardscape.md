---
title: Pavimentos, muros y escalones
summary: Pavimento con pendientes hacia un desagüe o un bombeo transversal, con su patrón y sus capas; sendas que siguen el terreno; muros de contención e independientes con zapatas escalonadas; bordillos; rampas y escaleras comprobadas frente a sus límites; exportación IFC.
keywords: obra dura, pavimento, adoquines, patio, terraza, pendientes, desagüe, bombeo transversal, espina de pez, aparejo a soga, senda, camino peatonal, muro de contención, muro de jardín, zapata, coronación, bordillo, encintado, rampa, accesibilidad, escaleras, escalones, contrahuellas, huellas, descansillo
from: d34b4466
---

La obra dura se vuelve a calcular cada vez a partir del terreno, así que sigue el relieve y se regenera cuando se mueven el terreno o su línea. Arrastre sus esquinas en la planta como cualquier línea. Ábrala desde {{ui:Pavimentos y obra dura}} en el grupo Paisajismo.

## Pavimento

Haga clic en las esquinas y pulse {{key:Enter}}. En Propiedades:

- **Cota**: vacío = la media del terreno bajo él.
- **Pendientes**: horizontal, un **bombeo transversal** (un % hacia una dirección) o **hacia un desagüe**: CivilCraft le pide que haga clic donde va el desagüe, y después cada esquina sube desde el desagüe con la pendiente. Las flechas en la planta muestran las pendientes.
- **Patrón** (cuadrícula, aparejo a soga, espina de pez) con el tamaño de la unidad, la junta y el ángulo; anchura del **Encintado**. En una hoja, se omiten las juntas más cercanas que un milímetro.
- El pavimento forma parte de la superficie de proyecto. Sus capas (piezas, lecho, base) pasan a la IFC y a las mediciones.

## Sendas

Haga clic a lo largo de la senda y pulse {{key:Enter}}. Sigue el terreno, con su **Pendiente transversal** hacia su lado derecho. Una senda más empinada que la **Pendiente máxima admitida** se marca con `!` en la planta donde se encuentra, y Propiedades indica cuánto llega a ser.

Donde una senda se encuentra con una carretera construida por un corredor, se detiene en el borde exterior de la carretera, a la misma cota que la acera o el arcén de ese punto, en la superficie de proyecto y en la vista 3D. Una senda que cruza una carretera se ajusta y se muestra como dos tramos, y un extremo dibujado a menos del doble de la anchura de la senda respecto a la carretera se prolonga hasta su borde. La planta sigue mostrando la senda tal como la dibujó, y su longitud y superficie cuentan toda la línea. Vea [Barrer un corredor de carretera](topic:corridor).

## Muros

Haga clic a lo largo del muro y pulse {{key:Enter}}. Un muro es **de contención** o **independiente**. Sin **Coronación**, se mantiene su **Altura** sobre el terreno en toda su longitud; escriba una coronación para mantenerlo a nivel. Su **zapata** queda a una profundidad fija bajo el terreno y baja por escalones enteros, de modo que se mantiene a nivel entre ellos. Propiedades indica su longitud, alturas, superficie de cara y escalones de zapata; la planta rotula la coronación y la base del muro (TW / BW) en cada extremo.

:::warning
Un muro de contención de más de 1.2 m (4 ft) se marca: lo diseña un ingeniero.
:::

## Bordillos

Haga clic a lo largo del bordillo y pulse {{key:Enter}}; fije su anchura y su resalte.

## Rampas

Haga clic desde abajo hasta arriba y pulse {{key:Enter}}. Las cotas se toman del terreno en cada extremo, salvo que las escriba. Una rampa lleva un descansillo cada desnivel de 750 mm (2.5 ft) y se comprueba frente a la **Pendiente máxima admitida** (1:12 al inicio) y una anchura mínima; Propiedades indica la longitud que necesitaría.

## Escaleras

Haga clic en el borde frontal del primer escalón, luego donde las escaleras llegan arriba, y pulse {{key:Enter}}. El número de contrahuellas sale de la altura y de la **Contrahuella máxima**; la huella, de la regla de confort 2R + G ≈ 630 mm, nunca por debajo de la **Huella mínima**; y un descansillo cada **Contrahuellas por tramo como máximo**. Propiedades indica si caben entre los dos puntos o cuánto más largas necesitan ser.

:::note
Los límites de rampas y escaleras son valores predeterminados identificados como tales. Fije los que exija su código de edificación.
:::

## Fuera de CivilCraft

- Más › {{ui:Exportar IFC de paisajismo}}: pavimentos y sendas como `IfcPavement`, muros como `IfcWall` (los muros de contención como RETAININGWALL) con sus capas, bordillos como `IfcKerb`, rampas como `IfcRamp`, escaleras como `IfcStair` con sus contrahuellas y huellas.
- La lista de plantas, **Enviar a TakeoffCraft**, lleva las superficies de pavimento y los volúmenes de capas, las superficies de cara y las longitudes de los muros, las longitudes de bordillo y el número de escalones.
- La hoja de detalles dibuja la sección de cada muro, el paquete de cada pavimento y cada tramo de escaleras. Vea [Hojas de paisajismo](topic:landscape-sheets).
