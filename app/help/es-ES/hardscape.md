---
title: Pavimento, muros y escalones
summary: Pavimento con pendientes hacia un desagüe o una pendiente transversal, un patrón y su composición; senderos que siguen el terreno; muros de contención y exentos con zapatas escalonadas; bordillos; rampas y escalones comprobados frente a sus límites; exportación a IFC.
keywords: pavimentos y obra dura, pavimento, adoquines, patio, terraza, pendientes, desagüe, pendiente transversal, espina de pez, aparejo a soga, sendero, camino peatonal, muro de contención, muro de jardín, zapata, albardilla, bordillo, remate de borde, rampa, accesibilidad, escalones, escaleras, contrahuellas, huellas, descansillo
from: 51475877
---

La obra dura se calcula siempre de nuevo a partir del terreno, de modo que sigue el relieve y se regenera cuando se mueve el terreno o su línea. Arrastre sus esquinas en el plano como cualquier línea. Para abrirla, use {{ui:Hardscape}} en el grupo Paisajismo.

## Pavimento

Haga clic en las esquinas y pulse {{key:Enter}}. En **Propiedades**:

- **Cota**: vacía = la cota media del terreno bajo él.
- **Pendientes**: nivelado, una **pendiente transversal** (un % hacia una dirección) o **hacia un desagüe**: CivilCraft le pide que haga clic donde va el desagüe, y entonces cada esquina sube desde el desagüe con la pendiente. Las flechas del plano muestran las pendientes.
- **Patrón** (cuadrícula, aparejo a soga, espina de pez) con el tamaño de la pieza, la junta y el ángulo; **Ancho del borde**. En una hoja, las juntas más finas que un milímetro se omiten.
- El pavimento forma parte de la superficie proyectada. Sus capas (adoquines, lecho de asiento, base) pasan al IFC y a las cantidades.

## Senderos

Haga clic a lo largo del sendero y pulse {{key:Enter}}. Sigue el terreno, con su **Pendiente transversal** hacia su lado derecho. Un sendero más empinado que la **Pendiente máxima admitida** se marca con `!` en el plano donde ocurre, y las **Propiedades** indican la pendiente máxima que alcanza.

## Muros

Haga clic a lo largo del muro y pulse {{key:Enter}}. Un muro es **de contención** o **exento**. Sin **Cota superior**, el muro se eleva su **Altura** sobre el terreno en toda su longitud; escriba una cota superior para mantenerlo nivelado. Su **zapata** se sitúa a una profundidad fija bajo el terreno y desciende en escalones enteros, de modo que queda nivelada entre ellos. Las **Propiedades** dan su longitud, sus alturas, la superficie de paramento y los escalones de la zapata; el plano rotula la coronación y la base del muro (TW / BW) en cada extremo.

:::warning
Un muro de contención de más de 1.2 m (4 ft) se marca: lo diseña un ingeniero.
:::

## Bordillos

Haga clic a lo largo del bordillo y pulse {{key:Enter}}; defina su anchura y su resalte.

## Rampas

Haga clic desde la base hasta la cabeza y pulse {{key:Enter}}. Las cotas proceden del terreno en cada extremo, salvo que las escriba. Una rampa recibe un descansillo cada 750 mm (2.5 ft) de desnivel y se comprueba frente a la **Pendiente máxima admitida** (1:12 de partida) y una anchura mínima; las **Propiedades** indican la longitud que necesitaría.

## Escalones

Haga clic en el borde frontal del peldaño inferior y después donde los escalones llegan arriba, y pulse {{key:Enter}}. El número de contrahuellas sale de la altura y de la **Contrahuella máxima**; la huella, de la regla de confort 2R + G ≈ 630 mm, nunca por debajo de la **Huella mínima**; un descansillo cada **Contrahuellas por tramo como máximo**. Las **Propiedades** indican si caben entre los dos puntos o cuánto más largos tienen que ser.

:::note
Los límites de rampas y escalones son valores predeterminados señalados como tales. Ajuste los que exija su código de edificación.
:::

## Fuera de CivilCraft

- Más › {{ui:Export landscape IFC}}: pavimentos y senderos como `IfcPavement`, muros como `IfcWall` (los de contención como RETAININGWALL) con sus capas, bordillos como `IfcKerb`, rampas como `IfcRamp`, escalones como `IfcStair` con sus contrahuellas y huellas.
- La tabla de vegetación, con **Enviar a TakeoffCraft**, lleva las superficies de pavimento y los volúmenes de capa, las superficies de paramento y las longitudes de los muros, las longitudes de bordillos y el número de escalones.
- La hoja de detalles dibuja la sección de cada muro, la composición de cada pavimento y cada tramo de escalones. Véase [Hojas de paisajismo](topic:landscape-sheets).
