---
title: Áreas plantadas: céspedes, canteros, prados, cubresuelos
summary: Áreas plantadas como objetos con una composición por capas (tierra vegetal, mulch, membrana, borde), una mezcla de plantas y un nivel terminado opcional; se recortan solas alrededor de pavimentos, muros y escalones, y dan superficie neta, volúmenes, longitud de borde y conteo de plantas.
keywords: área plantada, césped, pasto, cantero, borde, prado, cubresuelos, tierra vegetal, mulch, membrana, tela antimaleza, borde, nivel terminado, cómputos, superficie neta, recorte
from: 2617ec0e
---

{{ui:Areas}} en el grupo Paisajismo dibuja un **césped**, un **cantero plantado**, un **prado** o un **cubresuelos**: haga clic en sus esquinas y presione {{key:Enter}}. Un cantero o cubresuelos empieza lleno con la planta elegida en la sección Plantas; un césped no tiene plantas.

## Qué contiene

- **Composición por capas**: espesor de tierra vegetal, espesor de mulch, una membrana antimaleza y un borde (acero, madera, ladrillo, hormigón, plástico o ninguno). Los espesores típicos ya vienen cargados; defina los suyos.
- **Mezcla**: especies (con cultivar y tamaño) y proporciones, llenadas como un cantero según el espaciamiento o la densidad.
- **Nivel terminado**: déjelo vacío y el área sigue al terreno; dele un nivel y el área pasa a ser un modificador del terreno (ver [Modificadores del terreno y niveles](topic:ground-modifiers)).
- **Recortar alrededor de pavimentos, muros y escalones** (activado por defecto): donde un pavimento, un camino, un muro, un cordón, una rampa o escalones se superponen con el área, esa parte se deja afuera. No se coloca ninguna planta debajo de ellos ni a menos de media separación de su borde.

## Cómputos

Propiedades muestra la **superficie neta** (después del recorte, medida con exactitud), el perímetro, la **longitud del borde** (solo a lo largo del borde propio del área, no donde lo corta el duro del paisaje), los volúmenes de tierra vegetal y mulch, la superficie de membrana y el conteo de plantas por fila de la mezcla. La planilla de plantas cuenta las plantas del área; el archivo de cómputos para TakeoffCraft recibe la superficie, tierra vegetal, mulch, membrana y borde; el IFC de paisajismo escribe un IfcGeographicElement con un conjunto de cantidades.
