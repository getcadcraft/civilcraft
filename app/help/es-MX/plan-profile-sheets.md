---
title: Hojas de planta y perfil
summary: Trace una alineación como un juego de hojas de planta y perfil en un solo PDF, con líneas de empate entre ellas.
keywords: planta y perfil, hojas, trazar, pdf, línea de empate, producción de planos, planos de carreteras, trazado de perfil, exageración vertical, juego de hojas
from: 34b4ec78
---

Las hojas de planta y perfil son la forma habitual de dibujar los planos de carreteras: cada hoja muestra un tramo de la vía dos veces, la planta arriba y el perfil abajo, a la misma escala horizontal, de modo que una estación queda en el mismo lugar en ambos.

## Crear las hojas

1. Seleccione la alineación. En **Propiedades**, haga clic en {{ui:Hojas de planta y perfil}}.
2. Elija el **Papel**, la **Escala de planta** y la **Exageración del perfil** (cuántas veces más alto se dibuja el perfil de lo que es largo; empiece con 10×). El cuadro de diálogo indica cuántas hojas resultan y cuánta parte de la alineación muestra cada una.
3. Para trazar parte de la alineación, cambie **Desde estación** y **Hasta estación**.
4. Haga clic en {{ui:Descargar PDF}}. El PDF tiene una página por hoja.

## Qué contiene una hoja

| Parte | Lo que muestra |
|---|---|
| Planta | Todo lo del plano (curvas de nivel, puntos topográficos, la alineación y su cadenamiento, obras lineales, plataformas, líneas características, tuberías, líneas de muestreo) girado para que este tramo quede a lo ancho de la hoja, con una flecha de norte girada igual |
| Líneas de empate | Una línea de trazos y puntos, perpendicular a la alineación, en cada extremo que continúa en otra hoja, con la etiqueta "Línea de empate est. 5+50.00, vea hoja 2" |
| Perfil | El terreno natural (discontinuo), el perfil de proyecto (rojo), la pendiente de cada tangente y el PIV, la elevación, L y K de cada curva vertical; estaciones en la parte inferior, elevaciones a ambos lados |
| Cajetín | El nombre del proyecto, la alineación y su intervalo de estaciones, "Hoja 1 de 3", las escalas horizontal y vertical y la exageración |

El tramo por hoja tiene la longitud que permite la ventana de planta a la escala, redondeado hacia abajo a un múltiplo exacto de 50 ft (20 m) en tramos largos o de 10 ft (5 m) en tramos cortos.

:::note
Cuando las elevaciones del perfil no quepan con la exageración elegida, CivilCraft dibuja todas las hojas con la mayor de 10×, 5×, 4×, 2× y 1× que quepa, y la barra de estado lo indica. Una alineación curva se gira según la dirección del inicio al final de cada tramo, así que la vía puede subir o bajar ligeramente en la hoja.
:::
