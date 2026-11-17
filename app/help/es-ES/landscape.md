---
title: El espacio de trabajo de Paisajismo
summary: Planos de plantación, explanación, pavimentos, muros, escalones, riego y hojas de paisajismo sobre la misma parcela, las mismas superficies y el mismo archivo que la obra civil.
keywords: paisajismo, arquitectura paisajista, jardín, plantación, plantas, árboles, explanación, pavimentos y obra dura, pavimento, riego, aspersores, espacio de trabajo, diseño de emplazamiento, plano de paisajismo
from: eea929d1
---

El espacio de trabajo de Paisajismo añade herramientas de diseño paisajístico a la parcela de CivilCraft que ya tiene: los mismos puntos del levantamiento, el mismo terreno existente, la misma superficie proyectada y el mismo archivo de proyecto.

## Abrirlo

Elija {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. La barra de herramientas muestra entonces una opción **Espacio de trabajo** y un grupo **Paisajismo**, y los grupos Superficie, Diseño y SIG se apartan para dar sitio. Elija **Civil** en Espacio de trabajo para volver. CivilCraft recuerda el espacio de trabajo que usó por última vez en este equipo.

El panel izquierdo gana tres secciones en la parte superior:

- **Plantas**: la lista de plantas, para buscar y elegir lo que coloca. Consulte [La lista de plantas](topic:plant-list).
- **Comprobaciones de explanación**: análisis de pendientes, flechas de flujo y encharcamiento. Consulte [Explanación](topic:landscape-grading).
- **Riego**: los aspersores y las tuberías que coloca a continuación, y los ajustes del suministro de agua. Consulte [Riego](topic:irrigation).

## Qué hay en el grupo Paisajismo

| Herramienta | Qué hace | Tema |
|---|---|---|
| **Planta**, **Zona**, **Seto** | Plantas sueltas, zonas de plantación rellenas según la separación de las plantas, setos a lo largo de una línea | [Plantación](topic:planting) |
| **Explanar** | Plataformas, caballones, cunetas vegetales, zonas de explanación con cotas puntuales y curvas de nivel, comprobaciones de pendiente y de flujo | [Explanación](topic:landscape-grading) |
| **Pavimentos y obra dura** | Pavimentos, senderos, muros, bordillos, rampas y escalones que siguen el terreno | [Pavimentos y obra dura](topic:hardscape) |
| **Zonas** | Zonas plantadas: céspedes, macizos, praderas y cubresuelos con una capa de base, recortados alrededor de la obra dura | [Zonas plantadas](topic:planted-areas) |
| **Cotas** | Modificadores del terreno en orden, con desmonte y terraplén, cotas puntuales, flechas de pendiente y líneas de sección | [Modificadores del terreno](topic:ground-modifiers), [Secciones](topic:landscape-sections) |
| **Riego** | Aspersores, tuberías, válvulas, líneas de goteo, el suministro, la cobertura y una comprobación hidráulica | [Riego](topic:irrigation) |
| **Más** | Desde una línea (objetos vinculados a la geometría), el listado de plantas, la tabla de plantas, los cuadros de mediciones, la representación de plantas, los objetos de forma libre, las hojas de paisajismo y el conjunto de publicación, la exportación IFC, el tamaño y las etiquetas de las plantas | [Objetos desde la geometría](topic:objects-from-lines), [Fichas de plantas](topic:plant-records), [Cuadros de mediciones](topic:worksheets), [Hojas de paisajismo](topic:landscape-sheets), [Objetos de forma libre](topic:freeform-objects) |

Todo lo que añada es un solo paso de deshacer, se guarda en el archivo de proyecto y se dibuja en la planta en capas llamadas `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` y `L-IRRG-…`, de modo que las exportaciones DXF, DWG y PDF también lo incluyen.

## Una sola superficie para todo

Las plataformas, los caballones, las cunetas vegetales, las zonas de explanación, los pavimentos y los senderos se explanan sobre la **superficie proyectada**, la misma que usan los corredores y las plataformas de obra. El **terreno existente** nunca cambia. Las plantas se asientan sobre el terreno que tienen debajo, de modo que se mueven cuando cambia la explanación. Los movimientos de tierras cuentan la explanación de paisajismo junto con todo lo demás.

:::tip
¿Es nuevo en esto? [Diseñar un jardín de principio a fin](topic:landscape-walkthrough) recorre todo el espacio de trabajo en la parcela de muestra.
:::
