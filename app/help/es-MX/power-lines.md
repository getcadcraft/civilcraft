---
title: El espacio de trabajo Líneas eléctricas
summary: Líneas aéreas y cables subterráneos en su sitio, con sus propias bibliotecas, flecha y tensión según sus casos de carga, verificaciones de libranza y resistencia, tablas de tendido, cantidades, hojas y exportación a GIS.
keywords: línea eléctrica, línea aérea, eléctrico, distribución, postes, apoyos, conductor, flecha, tensión, tendido, libranza, cable subterráneo, zanja, espacio de trabajo, empresa de servicios públicos
from: 638dd856
---

El espacio de trabajo Líneas eléctricas coloca líneas aéreas y cables subterráneos sobre el sitio de CivilCraft que ya tiene: los mismos puntos topográficos, el mismo terreno, el mismo archivo de proyecto.

:::warning
Es una herramienta de diseño. El espacio de trabajo calcula flecha, tensión, libranzas y cargas a partir de **sus** casos de carga y límites; no incorpora la norma de ningún país. Un ingeniero verifica cada resultado contra la norma que aplique antes de construir nada.
:::

## Abrirlo

Elija {{ui:Superficie}} › {{ui:Más}} › {{ui:Espacio de trabajo de líneas eléctricas}}, o **Líneas eléctricas** en Espacio de trabajo. La barra de herramientas muestra entonces un grupo **Líneas eléctricas**; los grupos Diseño y GIS se apartan. Elija **Civil** en Espacio de trabajo para volver. CivilCraft recuerda el espacio de trabajo que usó por última vez en esta computadora.

El panel izquierdo gana dos secciones en la parte superior:

- **Líneas eléctricas**: sus casos de carga y límites, las líneas y cables del proyecto, y **Verificaciones**, siempre actualizadas. Haga clic en una verificación para seleccionar aquello a lo que se refiere.
- **Biblioteca**: sus propios conductores, cables, apoyos, equipos y tipos de zanja. Vea [Su biblioteca de líneas eléctricas](topic:power-line-library).

## Qué hay en el grupo Líneas eléctricas

| Herramienta | Qué hace | Tema |
|---|---|---|
| **Línea** | Una línea aérea: haga clic en cada apoyo | [Dibujar una línea aérea](topic:overhead-line) |
| **Apoyo** | Agrega un apoyo sobre un vano | [Dibujar una línea aérea](topic:overhead-line) |
| **Cable** | Una ruta de cable subterráneo en una zanja | [Cables subterráneos](topic:underground-cables) |
| **Equipo** | Un gabinete, un transformador, una junta, o la fuente que alimenta la red | [Cables subterráneos](topic:underground-cables) |
| **Obstáculo** | Algo que cruza una línea: una carretera, un edificio, otra línea | [Verificaciones](topic:power-line-checks) |
| **Perfil** | El perfil de la línea: terreno, apoyos y conductor en cada caso de carga | [Dibujar una línea aérea](topic:overhead-line#the-line-profile) |
| **Más** | Casos de carga y límites, tablas de tendido, cantidades, hojas y reporte, GIS, archivos de estudio | [Flecha y tensión](topic:sag-and-tension), [Salidas](topic:power-line-outputs), [Archivos de estudio](topic:power-line-study-file) |

Todo lo que agrega es un solo paso de deshacer, se guarda en el archivo de proyecto y se dibuja en la planta, en capas llamadas `C-POWR-…`, así que las exportaciones a DXF, DWG y PDF también lo incluyen.
