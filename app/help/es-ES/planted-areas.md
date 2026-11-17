---
title: Áreas plantadas: céspedes, macizos, praderas, cubresuelos
summary: Áreas plantadas como objetos con un paquete de capas (tierra vegetal, acolchado, membrana, perfilado), una mezcla de plantas y un nivel de acabado opcional; se recortan solas alrededor de pavimentos, muros y escaleras, y dan superficie neta, volúmenes, longitud de perfilado y recuentos de plantas.
keywords: área plantada, césped, macizo, borde, pradera, cubresuelos, tierra vegetal, acolchado, membrana, tela antihierbas, perfilado, nivel de acabado, mediciones, superficie neta, recorte
from: 2617ec0e
---

{{ui:Zonas}} en el grupo Paisajismo dibuja un **césped**, un **macizo plantado**, una **pradera** o un **cubresuelos**: pulse sus esquinas y pulse {{key:Enter}}. Un macizo o cubresuelos empieza lleno con la planta elegida en la sección Plantas; un césped no tiene plantas.

## Lo que contiene

- **Paquete de capas**: profundidad de tierra vegetal, profundidad de acolchado, una membrana antihierbas y un perfilado (acero, madera, ladrillo, hormigón, plástico o ninguno). Se rellenan valores típicos; defina los suyos.
- **Mezcla**: especies (con cultivar y tamaño) y proporciones, rellenadas como un macizo según la separación o la densidad.
- **Nivel de acabado**: déjelo vacío y el área sigue al terreno; indique un nivel y el área se convierte en un modificador del terreno (véase [Modificadores del terreno y niveles](topic:ground-modifiers)).
- **Recorte alrededor de pavimento, muros y escaleras** (activado por defecto): donde el pavimento, un camino, un muro, un bordillo, una rampa o unas escaleras se solapan con el área, esa parte se excluye. No se coloca ninguna planta bajo ellos ni a menos de media separación de su borde.

## Mediciones

Propiedades muestra la **superficie neta** (tras el recorte, medida con exactitud), el perímetro, la **longitud de perfilado** (solo a lo largo del propio borde del área, no donde lo corta el pavimento), los volúmenes de tierra vegetal y acolchado, el área de membrana y los recuentos de plantas por fila de mezcla. El listado de plantas cuenta las plantas del área; el archivo de mediciones para TakeoffCraft recibe el área, la tierra vegetal, el acolchado, la membrana y el perfilado; el IFC de paisajismo escribe un IfcGeographicElement con un conjunto de cantidades.
