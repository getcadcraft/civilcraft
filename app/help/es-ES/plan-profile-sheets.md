---
title: Hojas de planta y perfil
summary: Trazar un eje como un conjunto de hojas de planta y perfil en un solo PDF, con líneas de empalme entre ellas.
keywords: planta y perfil, hojas, trazado, pdf, línea de empalme, producción de planos, planos de carreteras, trazado de perfil, exageración vertical, conjunto de hojas
from: 34b4ec78
---

Las hojas de planta y perfil son la forma habitual de dibujar los planos de carreteras: cada hoja muestra dos veces un tramo de la carretera, la planta arriba y el perfil abajo, a la misma escala horizontal, de modo que un P.K. queda en el mismo lugar en ambas.

## Crear las hojas

1. Seleccione el eje. En **Propiedades**, pulse {{ui:Hojas de planta y perfil}}.
2. Elija el **Papel**, la **Escala de planta** y la **Exageración del perfil** (cuántas veces más alto se dibuja el perfil que lo que mide de largo; empiece con 10×). El diálogo indica cuántas hojas resultan y qué parte del eje muestra cada una.
3. Para trazar parte del eje, cambie **Desde P.K.** y **Hasta P.K.**
4. Pulse {{ui:Descargar PDF}}. El PDF tiene una página por hoja.

## Qué hay en una hoja

| Parte | Qué muestra |
|---|---|
| Planta | Todo lo del plano (curvas de nivel, puntos topográficos, el eje y su numeración de P.K., corredores, plataformas, líneas características, tuberías, líneas de muestreo), girado para que este tramo cruce la hoja, con una flecha norte girada en consecuencia |
| Líneas de empalme | Una línea de trazos y puntos perpendicular al eje en cada extremo que continúa en otra hoja, con la etiqueta "Línea de empalme P.K. 5+50.00, véase hoja 2" |
| Perfil | El terreno natural (discontinuo), el perfil de proyecto (rojo), la pendiente de cada recta y el PIV, la cota, L y K de cada curva vertical; los P.K. en la parte inferior y las cotas a ambos lados |
| Cajetín | El nombre del proyecto, el eje y su intervalo de P.K., "Hoja 1 de 3", las escalas horizontal y vertical y la exageración |

El tramo por hoja es tan largo como permita la ventana del plano a la escala, redondeado a la baja a un múltiplo exacto de 50 ft (20 m) en tramos largos o de 10 ft (5 m) en tramos cortos.

:::note
Cuando las cotas del perfil no quepan con la exageración elegida, CivilCraft dibuja todas las hojas con la mayor de 10×, 5×, 4×, 2× y 1× que quepa, y la barra de estado lo indica. Un eje curvo se gira según la dirección del inicio al final de cada tramo, así que la carretera puede subir o bajar ligeramente en la hoja.
:::
