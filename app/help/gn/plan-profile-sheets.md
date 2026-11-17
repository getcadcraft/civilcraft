---
title: Hojas de planta ha perfil
summary: Trazar un alineamiento como un conjunto de hojas de planta y perfil en un solo PDF, con líneas de empalme entre ellas.
keywords: planta y perfil, hojas, trazar, pdf, línea de empalme, producción de planos, planos de camino, trazado de perfil, exageración vertical, conjunto de hojas
from: 34b4ec78
---

Las hojas de planta y perfil son la forma habitual de dibujar planos de camino: cada hoja muestra un tramo del camino dos veces, la planta arriba y el perfil abajo, a la misma escala horizontal, para que una estación quede en el mismo lugar en ambos.

## Hacer las hojas

1. Seleccione el alineamiento. En **Propiedades**, haga clic en {{ui:Plan and profile sheets}}.
2. Elija el **Papel**, la **Escala de planta** y la **Exageración de perfil** (cuántas veces más alto se dibuja el perfil que lo largo; 10× para empezar). El diálogo indica cuántas hojas resultan y cuánto del alineamiento muestra cada una.
3. Para trazar una parte del alineamiento, cambie **Desde estación** y **Hasta estación**.
4. Haga clic en {{ui:Download PDF}}. El PDF tiene una página por hoja.

## Qué hay en una hoja

| Parte | Qué muestra |
|---|---|
| Planta | Todo lo del plano (curvas de nivel, puntos de relevamiento, el alineamiento y su numeración de estaciones, corredores, plataformas, líneas de rasgo, caños, líneas de muestra) girado para que este tramo cruce la hoja, con una flecha norte girada en la misma dirección |
| Líneas de empalme | Una línea de trazos y puntos, perpendicular al alineamiento, en cada extremo que continúa en otra hoja, con el rótulo "Línea de empalme sta 5+50.00, ver hoja 2" |
| Perfil | El terreno existente (de trazos), el perfil de diseño (rojo), la pendiente de cada tangente y el PVI, elevación, L y K de cada curva vertical; estaciones abajo, elevaciones a ambos lados |
| Cajetín | El nombre del proyecto, el alineamiento y su rango de estaciones, "Hoja 1 de 3", las escalas horizontal y vertical y la exageración |

El tramo por hoja es tan largo como lo permita la ventana de planta a esa escala, redondeado hacia abajo a un múltiplo de 50 ft (20 m) en tramos largos o de 10 ft (5 m) en cortos.

:::note
Si las elevaciones del perfil no entraran con la exageración elegida, CivilCraft dibuja cada hoja con la mayor de 10×, 5×, 4×, 2× y 1× que entre, y la barra de estado lo indica. Un alineamiento curvo se gira según la dirección del inicio al final de cada tramo, así que el camino puede subir o bajar un poco en la hoja.
:::
