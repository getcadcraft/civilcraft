---
title: Pavimentos, muros y escalones
summary: Pavimento con caídas hacia un drenaje o una pendiente transversal, un patrón y su estructura; senderos que siguen el terreno; muros de contención e independientes con zapatas escalonadas; guarniciones; rampas y escalones revisados contra sus límites; exportación IFC.
keywords: elementos duros, pavimento, adoquines, patio, terraza, caídas, drenaje, pendiente transversal, espina de pescado, aparejo a soga, sendero, andador, muro de contención, muro de jardín, zapata, remate, guarnición, arista, rampa, accesibilidad, escalones, escaleras, contrahuellas, huellas, descanso
from: d34b4466
---

Los elementos duros se vuelven a calcular a partir del terreno cada vez, así que siguen su relieve y se regeneran cuando se mueven el terreno o su línea. Arrastre sus esquinas en la planta como cualquier línea. Ábralos desde {{ui:Elementos duros}} en el grupo Paisajismo.

## Pavimento

Haga clic en las esquinas y pulse {{key:Enter}}. En Propiedades:

- **Nivel**: vacío = el promedio del terreno bajo él.
- **Caídas**: nivel, una **pendiente transversal** (un % hacia una dirección) o **hacia un drenaje**: CivilCraft le pide que haga clic donde va el drenaje, y luego cada esquina sube desde el drenaje con la caída. Las flechas en la planta muestran las caídas.
- **Patrón** (cuadrícula, aparejo a soga, espina de pescado) con el tamaño de la unidad, la junta y el ángulo; ancho del **Encintado**. En una hoja, las juntas más cercanas que un milímetro se omiten.
- El pavimento forma parte de la superficie proyectada. Sus capas (adoquines, cama de asiento, base) pasan al IFC y a las cantidades.

## Senderos

Haga clic a lo largo del sendero y pulse {{key:Enter}}. Sigue el terreno, con su **Pendiente transversal** hacia su lado derecho. Un sendero más empinado que la **Pendiente máxima permitida** se marca con `!` en la planta donde está, y Propiedades indica qué tan empinado llega a ser.

Donde un sendero se encuentra con una vía construida por una obra lineal, se detiene en el borde exterior de la vía, al nivel de la banqueta o del acotamiento en ese punto, en la superficie proyectada y en la vista 3D. Un sendero que cruza una vía se nivela y se muestra como dos piezas, y un extremo dibujado hasta el doble del ancho del sendero antes de la vía se prolonga hasta su borde. La planta sigue mostrando el sendero como lo dibujó, y su longitud y área cuentan toda la línea. Vea [Barrido de una obra lineal vial](topic:corridor).

## Muros

Haga clic a lo largo del muro y pulse {{key:Enter}}. Un muro es de **contención** o **independiente**. Sin **Corona**, se levanta su **Altura** sobre el terreno en toda su longitud; escriba una corona para mantenerlo nivelado. Su **zapata** queda a una profundidad fija bajo el terreno y baja en escalones completos, así que se mantiene nivelada entre ellos. Propiedades indica su longitud, alturas, área de cara y escalones de zapata; la planta marca la parte superior e inferior del muro (TW / BW) en cada extremo.

:::warning
Un muro de contención más alto que 1.2 m (4 ft) se marca: un ingeniero lo diseña.
:::

## Guarniciones

Haga clic a lo largo de la guarnición y pulse {{key:Enter}}; defina su ancho y su altura libre.

## Rampas

Haga clic desde la parte inferior hasta la superior y pulse {{key:Enter}}. Los niveles provienen del terreno en cada extremo, a menos que los escriba. Una rampa recibe un descanso cada desnivel de 750 mm (2.5 ft) y se revisa contra la **Pendiente máxima permitida** (1:12 al inicio) y un ancho mínimo; Propiedades indica qué longitud necesitaría.

## Escalones

Haga clic en el borde frontal del primer escalón, luego donde los escalones llegan arriba, y pulse {{key:Enter}}. El número de contrahuellas sale de la altura y de la **Contrahuella mayor**; la huella, de la regla de confort 2R + G ≈ 630 mm, nunca es menor que la **Huella menor**; hay un descanso cada **Contrahuellas por tramo como máximo**. Propiedades indica si caben entre los dos puntos o cuánto más largos necesitan ser.

:::note
Los límites de rampas y escalones son valores predeterminados rotulados. Defina los que exija su código de construcción.
:::

## Fuera de CivilCraft

- Más › {{ui:Exportar IFC de paisajismo}}: pavimentos y senderos como `IfcPavement`, muros como `IfcWall` (los muros de contención como RETAININGWALL) con sus capas, guarniciones como `IfcKerb`, rampas como `IfcRamp`, escalones como `IfcStair` con sus contrahuellas y huellas.
- El cuadro de plantas, con **Enviar a TakeoffCraft**, lleva las áreas de pavimento y los volúmenes de capas, las áreas y longitudes de cara de los muros, las longitudes de guarniciones y el número de escalones.
- La hoja de detalles dibuja la sección de cada muro, la estructura de cada pavimento y cada tramo de escalones. Vea [Hojas de paisajismo](topic:landscape-sheets).
