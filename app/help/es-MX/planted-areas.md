---
title: Áreas plantadas: céspedes, arriates, praderas, cubresuelos
summary: Áreas plantadas como objetos con una composición de capas (tierra vegetal, mantillo, membrana, bordillo), una mezcla de plantas y un nivel terminado opcional; se recortan solas alrededor de pavimentos, muros y escalones, y dan área neta, volúmenes, longitud de bordillo y conteos de plantas.
keywords: área plantada, césped, tepe, arriate, borde, pradera, cubresuelo, tierra vegetal, mantillo, membrana, tela antimaleza, bordillo, nivel terminado, cuantificaciones, área neta, recorte
from: 2617ec0e
---

{{ui:Áreas}} en el grupo Paisajismo dibuja un **césped**, un **arriate plantado**, una **pradera** o un **cubresuelo**: haga clic en sus esquinas y pulse {{key:Enter}}. Un arriate o cubresuelo empieza lleno con la planta elegida en la sección Plantas; un césped no tiene plantas.

## Qué contiene

- **Composición de capas**: espesor de tierra vegetal, espesor de mantillo, una membrana antimaleza y un bordillo (acero, madera, ladrillo, concreto, plástico o ninguno). Los espesores típicos vienen llenos; defina los suyos.
- **Mezcla**: especies (con cultivar y tamaño) y proporciones, llenadas como un arriate según la separación o la densidad.
- **Nivel terminado**: déjelo vacío y el área sigue el terreno; dé un nivel y el área se convierte en un modificador de terreno (consulte [Modificadores de terreno y niveles](topic:ground-modifiers)).
- **Recortar alrededor de pavimentos, muros y escalones** (activado por defecto): donde pavimento, camino, muro, guarnición, rampa o escalones se superpongan con el área, esa parte se excluye. No se coloca ninguna planta debajo de ellos ni a menos de media separación de su borde.

## Cantidades

Propiedades muestra el **área neta** (después del recorte, medida con exactitud), el perímetro, la **longitud de bordillo** (solo a lo largo del borde propio del área, no donde la obra dura lo corta), los volúmenes de tierra vegetal y mantillo, el área de membrana y los conteos de plantas por fila de mezcla. El cuadro de plantas cuenta las plantas del área; el archivo de cuantificaciones para TakeoffCraft recibe el área, la tierra vegetal, el mantillo, la membrana y el bordillo; el IFC de paisajismo escribe un IfcGeographicElement con un conjunto de cantidades.
