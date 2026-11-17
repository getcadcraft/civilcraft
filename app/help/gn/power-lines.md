---
title: El espacio de trabajo Líneas eléctricas
summary: Líneas aéreas y cables subterráneos en tu sitio, con tus propias bibliotecas, flecha y tensión bajo tus hipótesis de carga, verificaciones de despeje y resistencia, tablas de tendido, cantidades, hojas y exportación SIG.
keywords: línea eléctrica, línea aérea, eléctrico, distribución, postes, soportes, conductor, flecha, tensión, tendido, despeje, cable subterráneo, zanja, espacio de trabajo, empresa de servicios
from: 638dd856
---

El espacio de trabajo Líneas eléctricas pone líneas aéreas y cables subterráneos en el sitio de CivilCraft que ya tienes: los mismos puntos de relevamiento, el mismo terreno, el mismo archivo de proyecto.

:::warning
Es una ayuda de diseño. El espacio de trabajo calcula flecha, tensión, despejes y cargas a partir de **tus** hipótesis de carga y límites; no incluye la norma de ningún país. Un ingeniero verifica cada resultado con la norma que corresponda antes de construir nada.
:::

## Abrirlo

Elige {{ui:Superficie}} › {{ui:Más}} › {{ui:Espacio de trabajo de líneas eléctricas}}, o **Líneas eléctricas** en Espacio de trabajo. La barra de herramientas muestra entonces un grupo **Líneas eléctricas**; los grupos Diseño y SIG se retiran. Elige **Civil** en Espacio de trabajo para volver. CivilCraft recuerda el espacio de trabajo que usaste por última vez en esta computadora.

El panel izquierdo gana dos secciones arriba:

- **Líneas eléctricas**: tus hipótesis de carga y límites, las líneas y cables del proyecto, y **Verificaciones**, siempre al día. Haz click en una verificación para seleccionar aquello a lo que se refiere.
- **Biblioteca**: tus conductores, cables, soportes, equipos y tipos de zanja propios. Ver [Tu biblioteca de líneas eléctricas](topic:power-line-library).

## Qué hay en el grupo Líneas eléctricas

| Herramienta | Qué hace | Tema |
|---|---|---|
| **Línea** | Una línea aérea: haz click en cada soporte | [Dibujar una línea aérea](topic:overhead-line) |
| **Soporte** | Agrega un soporte en un tramo | [Dibujar una línea aérea](topic:overhead-line) |
| **Cable** | Una ruta de cable subterráneo en una zanja | [Cables subterráneos](topic:underground-cables) |
| **Equipo** | Un gabinete, un transformador, un empalme, o la fuente que alimenta la red | [Cables subterráneos](topic:underground-cables) |
| **Obstáculo** | Algo que cruza una línea: una ruta, un edificio, otra línea | [Verificaciones](topic:power-line-checks) |
| **Perfil** | El perfil de la línea: terreno, soportes y el conductor en cada hipótesis de carga | [Dibujar una línea aérea](topic:overhead-line#the-line-profile) |
| **Más** | Hipótesis de carga y límites, tablas de tendido, cantidades, hojas e informe, SIG, archivos de estudio | [Flecha y tensión](topic:sag-and-tension), [Salidas](topic:power-line-outputs), [Archivos de estudio](topic:power-line-study-file) |

Todo lo que agregas es un solo paso de deshacer, se guarda en el archivo de proyecto y se dibuja en el plano en capas llamadas `C-POWR-…`, así que las exportaciones DXF, DWG y PDF también lo incluyen.
