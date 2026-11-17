---
title: El espacio de trabajo de líneas eléctricas
summary: Líneas aéreas y cables subterráneos en su emplazamiento, con sus propias bibliotecas, flecha y tensión bajo sus hipótesis de carga, comprobaciones de distancia libre y resistencia, tablas de tendido, mediciones, hojas y exportación a GIS.
keywords: línea eléctrica, línea aérea, eléctrico, distribución, postes, apoyos, conductor, flecha, tensión, tendido, distancia libre, cable subterráneo, zanja, espacio de trabajo, distribuidora
from: 638dd856
---

El espacio de trabajo de líneas eléctricas sitúa líneas aéreas y cables subterráneos en el emplazamiento de CivilCraft que ya tiene: los mismos puntos topográficos, el mismo terreno, el mismo archivo de proyecto.

:::warning
Una ayuda de diseño. El espacio de trabajo calcula la flecha, la tensión, las distancias libres y las cargas a partir de **sus** hipótesis de carga y límites; no incorpora la normativa de ningún país. Un ingeniero comprueba cada resultado frente a la normativa que corresponda antes de construir nada.
:::

## Abrirlo

Elija {{ui:Superficie}} › {{ui:Más}} › {{ui:Espacio de trabajo de líneas eléctricas}}, o **Líneas eléctricas** en Espacio de trabajo. La barra de herramientas muestra entonces un grupo **Líneas eléctricas**; los grupos Diseño y GIS se apartan. Elija **Civil** en Espacio de trabajo para volver. CivilCraft recuerda el espacio de trabajo que usó por última vez en este equipo.

El panel izquierdo gana dos secciones en la parte superior:

- **Líneas eléctricas**: sus hipótesis de carga y límites, las líneas y cables del proyecto, y **Comprobaciones**, siempre actualizadas. Pulse una comprobación para seleccionar aquello a lo que se refiere.
- **Biblioteca**: sus propios conductores, cables, apoyos, equipos y tipos de zanja. Véase [Biblioteca de líneas eléctricas](topic:power-line-library).

## Qué hay en el grupo Líneas eléctricas

| Herramienta | Qué hace | Tema |
|---|---|---|
| **Línea** | Una línea aérea: pulse en cada apoyo | [Dibujar una línea aérea](topic:overhead-line) |
| **Apoyo** | Añade un apoyo en un vano | [Dibujar una línea aérea](topic:overhead-line) |
| **Cable** | Un trazado de cable subterráneo en una zanja | [Cables subterráneos](topic:underground-cables) |
| **Equipo** | Un armario, un transformador, un empalme o la fuente que alimenta la red | [Cables subterráneos](topic:underground-cables) |
| **Obstáculo** | Algo que cruza una línea: una carretera, un edificio, otra línea | [Comprobaciones](topic:power-line-checks) |
| **Perfil** | El perfil de la línea: terreno, apoyos y conductor en cada hipótesis de carga | [Dibujar una línea aérea](topic:overhead-line#the-line-profile) |
| **Más** | Hipótesis de carga y límites, tablas de tendido, mediciones, hojas e informe, GIS, archivos de estudio | [Flecha y tensión](topic:sag-and-tension), [Salidas](topic:power-line-outputs), [Archivos de estudio](topic:power-line-study-file) |

Todo lo que añade es un solo paso de deshacer, se guarda en el archivo del proyecto y se dibuja en el plano en capas llamadas `C-POWR-…`, de modo que también lo llevan las exportaciones DXF, DWG y PDF.
