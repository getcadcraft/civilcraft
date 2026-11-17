---
title: El espacio de trabajo de paisajismo
summary: Planos de plantación, nivelación, pavimentos, muros, escalones, riego y hojas de paisajismo sobre el mismo sitio, las mismas superficies y el mismo archivo que la obra civil.
keywords: paisajismo, arquitectura del paisaje, jardín, plantación, plantas, árboles, nivelación, obras duras, pavimento, riego, aspersores, espacio de trabajo, diseño de sitio, plan de paisajismo
from: eea929d1
---

El espacio de trabajo de paisajismo pone herramientas de diseño de paisajismo en el sitio de CivilCraft que ya tenés: los mismos puntos de relevamiento, el mismo terreno existente, la misma superficie proyectada y el mismo archivo de proyecto.

## Abrirlo

Elegí {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. La barra de herramientas muestra entonces una opción **Espacio de trabajo** y un grupo **Paisajismo**, y los grupos Superficie, Diseño y GIS se corren para hacer lugar. Elegí **Civil** en Espacio de trabajo para volver. CivilCraft recuerda el espacio de trabajo que usaste por última vez en esta computadora.

El panel izquierdo gana tres secciones arriba:

- **Plantas**: la lista de plantas, para buscar y elegir lo que colocás. Ver [La lista de plantas](topic:plant-list).
- **Controles de nivelación**: análisis de pendiente, flechas de flujo y encharcamiento. Ver [Nivelación](topic:landscape-grading).
- **Riego**: los aspersores y caños que colocás a continuación, y la configuración del suministro de agua. Ver [Riego](topic:irrigation).

## Qué hay en el grupo Paisajismo

| Herramienta | Qué hace | Tema |
|---|---|---|
| **Planta**, **Cantero**, **Seto** | Plantas sueltas, canteros llenos con la separación de las plantas, setos a lo largo de una línea | [Plantación](topic:planting) |
| **Nivelar** | Plataformas, albardones, canaletas, áreas de nivelación con niveles puntuales y curvas de nivel, controles de pendiente y flujo | [Nivelación](topic:landscape-grading) |
| **Obras duras** | Pavimentos, caminos, muros, cordones, rampas y escalones que siguen el terreno | [Obras duras](topic:hardscape) |
| **Áreas** | Áreas plantadas: céspedes, canteros, praderas y cubresuelos con una capa, recortadas alrededor de las obras duras | [Áreas plantadas](topic:planted-areas) |
| **Niveles** | Modificadores de terreno en orden con corte y relleno, niveles puntuales, flechas de pendiente, líneas de corte | [Modificadores de terreno](topic:ground-modifiers), [Cortes](topic:landscape-sections) |
| **Riego** | Aspersores, caños, válvulas, líneas de goteo, el suministro, cobertura y un control hidráulico | [Riego](topic:irrigation) |
| **Más** | Desde una línea (objetos vinculados a los trazos), la planilla de plantas, la tabla de plantas, planillas, gráficos de plantas, objetos libres, hojas de paisajismo y el juego de publicación, exportación IFC, tamaño y rótulos de plantas | [Objetos desde trazos](topic:objects-from-lines), [Registros de plantas](topic:plant-records), [Planillas](topic:worksheets), [Hojas de paisajismo](topic:landscape-sheets), [Objetos libres](topic:freeform-objects) |

Todo lo que agregues es un solo paso de deshacer, se guarda en el archivo del proyecto, y se dibuja en el plano en capas llamadas `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` y `L-IRRG-…`, así que las exportaciones DXF, DWG y PDF también lo incluyen.

## Una sola superficie para todo

Plataformas, albardones, canaletas, áreas de nivelación, pavimentos y caminos se nivelan dentro de la **superficie proyectada**, la misma que usan los corredores y las plataformas de obra. El **terreno existente** nunca cambia. Las plantas se asientan sobre el terreno que tienen debajo, así que se mueven cuando cambia la nivelación. La movimiento de suelo cuenta la nivelación de paisajismo junto con todo lo demás.

:::tip
¿Es nuevo para vos? [Diseñar un jardín, de principio a fin](topic:landscape-walkthrough) recorre todo el espacio de trabajo en el sitio de muestra.
:::
