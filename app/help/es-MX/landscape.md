---
title: El espacio de trabajo de paisajismo
summary: Planos de plantación, nivelación, pavimentos, muros, escalones, riego y hojas de paisaje en el mismo sitio, con las mismas superficies y el mismo archivo que la obra civil.
keywords: paisajismo, arquitectura de paisaje, jardín, plantación, plantas, árboles, nivelación, elementos duros, pavimento, riego, aspersores, espacio de trabajo, diseño de sitio, plano de paisajismo
from: eea929d1
---

El espacio de trabajo de paisajismo agrega herramientas de diseño de paisajismo al sitio de CivilCraft que ya tiene: los mismos puntos de levantamiento, el mismo terreno existente, la misma superficie propuesta y el mismo archivo de proyecto.

## Ábralo

Elija {{ui:Superficie}} › {{ui:Más}} › {{ui:Espacio de trabajo de paisajismo}}. La barra de herramientas muestra entonces una opción **Espacio de trabajo** y un grupo **Paisajismo**, y los grupos Superficie, Diseño y SIG se hacen a un lado para dar espacio. Elija **Civil** en Espacio de trabajo para volver. CivilCraft recuerda el espacio de trabajo que usó por última vez en esta computadora.

El panel izquierdo gana tres secciones arriba:

- **Plantas**: la lista de plantas, para buscar y elegir lo que coloca. Vea [La lista de plantas](topic:plant-list).
- **Comprobaciones de nivelación**: análisis de pendientes, flechas de flujo y encharcamiento. Vea [Nivelación](topic:landscape-grading).
- **Riego**: los aspersores y tuberías que coloca a continuación, y la configuración del suministro de agua. Vea [Riego](topic:irrigation).

## Qué hay en el grupo Paisajismo

| Herramienta | Qué hace | Tema |
|---|---|---|
| **Planta**, **Arriate**, **Seto** | Plantas individuales, arriates de plantación llenos con el espaciamiento de las plantas, setos a lo largo de una línea | [Plantación](topic:planting) |
| **Nivelar** | Plataformas, bermas, cunetas vegetadas, áreas de nivelación con cotas puntuales y curvas de nivel, revisiones de pendiente y de flujo | [Nivelación](topic:landscape-grading) |
| **Elementos duros** | Pavimentos, senderos, muros, guarniciones, rampas y escalones que siguen el terreno | [Elementos duros](topic:hardscape) |
| **Áreas** | Áreas plantadas: céspedes, arriates, praderas y cubresuelos con una composición de capas, recortadas alrededor de los elementos duros | [Áreas plantadas](topic:planted-areas) |
| **Cotas** | Modificadores del terreno en orden, con corte y relleno, cotas puntuales, flechas de pendiente y líneas de sección | [Modificadores del terreno](topic:ground-modifiers), [Secciones](topic:landscape-sections) |
| **Riego** | Aspersores, tuberías, válvulas, líneas de goteo, la alimentación, cobertura y una revisión hidráulica | [Riego](topic:irrigation) |
| **Más** | Desde una línea (objetos vinculados a la geometría), el cuadro de plantas, la tabla de plantas, hojas de cálculo, gráficos de plantas, objetos de forma libre, hojas de paisaje y el juego de publicación, exportación IFC, tamaño y etiquetas de las plantas | [Objetos desde la geometría](topic:objects-from-lines), [Registros de plantas](topic:plant-records), [Hojas de cálculo](topic:worksheets), [Hojas de paisaje](topic:landscape-sheets), [Objetos de forma libre](topic:freeform-objects) |

Todo lo que agrega es un solo paso de deshacer, se guarda en el archivo del proyecto y se dibuja en el plano en capas llamadas `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` y `L-IRRG-…`, así que las exportaciones DXF, DWG y PDF también lo incluyen.

## Una sola superficie para todo

Las plataformas, bermas, cunetas vegetadas, áreas de nivelación, pavimentos y senderos se nivelan dentro de la **superficie propuesta**, la misma que usan las obras lineales y las plataformas. El **terreno existente** nunca cambia. Las plantas se asientan sobre el terreno que tienen debajo, así que se mueven cuando cambia la nivelación. Los movimientos de tierra cuentan la nivelación del paisajismo junto con todo lo demás.

:::tip
¿Es nuevo? [Diseñe un jardín, de principio a fin](topic:landscape-walkthrough) recorre todo el espacio de trabajo en el sitio de muestra.
:::
