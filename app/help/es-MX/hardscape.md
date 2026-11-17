---
title: Pavimentos, muros y escalones
summary: Pavimento con pendientes hacia un desagüe o una pendiente transversal, un patrón y su composición; senderos que siguen el terreno; muros de contención e independientes con cimentación escalonada; bordillos; rampas y escalones verificados contra sus límites; salida a IFC.
keywords: elementos duros, pavimento, adoquines, patio, terraza, pendientes, desagüe, pendiente transversal, espina de pescado, aparejo a soga, sendero, andador, muro de contención, muro de jardín, cimentación, remate, bordillo, borde, rampa, accesibilidad, escalones, escaleras, contrahuellas, huellas, descanso
from: 51475877
---

Los elementos duros se calculan de nuevo a partir del terreno cada vez, así que siguen al relieve y se regeneran cuando el terreno o su línea cambian. Arrastre sus esquinas en el plano como cualquier línea. Ábralo desde {{ui:Elementos duros}} en el grupo Paisajismo.

## Pavimento

Haga clic en las esquinas y pulse {{key:Enter}}. En Propiedades:

- **Cota**: vacía = la media del terreno bajo él.
- **Pendientes**: cota, una **pendiente transversal** (un % hacia una dirección) o **hacia un desagüe**: CivilCraft le pide que haga clic donde va el desagüe, y entonces cada esquina sube desde el desagüe con la pendiente. Las flechas en el plano muestran las pendientes.
- **Patrón** (cuadrícula, aparejo a soga, espina de pescado) con el tamaño de la unidad, la junta y el ángulo; y el ancho del **Remate**. En una hoja, las juntas más finas que un milímetro se omiten.
- El pavimento forma parte de la superficie propuesta. Sus capas (adoquines, cama de asiento, base) pasan al IFC y a las cantidades.

## Senderos

Haga clic a lo largo del sendero y pulse {{key:Enter}}. Sigue el terreno, con su **Pendiente transversal** hacia su lado derecho. Un sendero más empinado que la **Pendiente máxima permitida** se marca con `!` en el plano donde ocurre, y en Propiedades se indica qué tan empinado llega a ser.

## Muros

Haga clic a lo largo del muro y pulse {{key:Enter}}. Un muro es de **contención** o **independiente**. Sin **Cota superior**, se eleva su **Altura** sobre el terreno a todo lo largo; escriba una cota superior para mantenerlo nivelado. Su **cimentación** queda a una profundidad fija bajo el terreno y desciende en escalones completos, por lo que permanece nivelada entre ellos. En Propiedades aparecen su longitud, alturas, área de cara y escalones de cimentación; en el plano se rotulan el remate y la base del muro (TW / BW) en cada extremo.

:::warning
Un muro de contención de más de 1.2 m (4 ft) se marca: lo diseña un ingeniero.
:::

## Bordillos

Haga clic a lo largo del bordillo y pulse {{key:Enter}}; defina su ancho y su saliente.

## Rampas

Haga clic desde la parte inferior hasta la superior y pulse {{key:Enter}}. Las cotas se toman del terreno en cada extremo, salvo que las escriba. Una rampa recibe un descanso cada 750 mm (2.5 ft) de desnivel y se verifica contra la **Pendiente máxima permitida** (1:12 para empezar) y un ancho mínimo; en Propiedades se indica cuánto tendría que medir.

## Escalones

Haga clic en el borde frontal del primer escalón, luego donde los escalones llegan a lo alto, y pulse {{key:Enter}}. El número de contrahuellas sale de la altura y de la **Contrahuella máxima**; la huella, de la regla de confort 2R + G ≈ 630 mm, nunca por debajo de la **Huella mínima**; y un descanso cada **Contrahuellas por tramo como máximo**. En Propiedades se indica si caben entre los dos puntos o cuánto más largos tendrían que ser.

:::note
Los límites de rampas y escalones son valores predeterminados rotulados. Configure los que exija el código de construcción de su localidad.
:::

## Fuera de CivilCraft

- Más › {{ui:Exportar IFC de paisajismo}}: pavimentos y senderos como `IfcPavement`, muros como `IfcWall` (los muros de contención como RETAININGWALL) con sus capas, bordillos como `IfcKerb`, rampas como `IfcRamp`, escalones como `IfcStair` con sus contrahuellas y huellas.
- **Enviar a TakeoffCraft** de la lista de plantas lleva las áreas de pavimento y los volúmenes de capas, las áreas de cara y longitudes de muro, las longitudes de bordillo y el número de escalones.
- La hoja de detalles dibuja la sección de cada muro, la composición de cada pavimento y cada tramo de escaleras. Vea [Hojas de paisajismo](topic:landscape-sheets).
