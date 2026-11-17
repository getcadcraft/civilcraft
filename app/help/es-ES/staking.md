---
title: Generar un informe de replanteo
summary: Listar estacas a lo largo de una alineación en P.K. y distancias al eje, o los puntos de levantamiento cercanos, con P.K., distancia al eje, coordenadas Norte y Este, cotas de proyecto y del terreno, y desmonte o relleno, y guardar el informe en CSV o PDF.
keywords: replanteo, estacas, informe de replanteo, hoja de desmontes, hoja de rasantes, P.K., distancia al eje, desmonte, relleno, implantación, replanteo de obra, conforme a obra
from: d8a4e9f1
---

Seleccione una alineación y pulse **Informe de replanteo** en sus **Propiedades**.

## Estacas en P.K. y distancias al eje

1. **Desde** y **hasta**: los P.K. a replantear (1+50 o 150).
2. **cada**: el intervalo. Las estacas se colocan en cada múltiplo, en los dos extremos y, con la casilla marcada, donde empiezan y acaban las curvas de la alineación.
3. **Distancias al eje**: a izquierda y derecha de la alineación, mirando hacia el P.K. creciente: `12 L, 0, 12 R`, `L12 CL R12` o `-12, 0, 12` (la izquierda es negativa). Una alineación con corredor empieza con los bordes de calzada y arcenes.
4. **Numerar desde** y **con prefijo** nombran las estacas: 1, 2, 3, o S101, S102.

## Puntos de levantamiento cerca de la alineación

Elija **puntos de levantamiento cerca de la alineación** e indique a qué distancia. A cada punto dentro de esa distancia se le asignan su P.K. y distancia al eje, el proyecto en ese punto y su propia cota como terreno: una comprobación de los puntos replanteados o tomados conforme a obra.

## Contenido del informe

| Columna | Qué es |
|---|---|
| Punto | El nombre de la estaca, o el número del punto de levantamiento |
| P.K., distancia al eje | Dónde está a lo largo de la alineación: L izquierda, R derecha |
| Norte, Este | Sus coordenadas |
| Cota de proyecto | La superficie del corredor explanado en ese punto (de línea de cierre a línea de cierre); si no, el perfil de proyecto en el eje |
| Cota del terreno | La superficie existente en ese punto, o la cota propia del punto de levantamiento |
| Desmonte/relleno | C cuando el terreno está por encima del proyecto (hay que desmontar), F cuando está por debajo (hay que rellenar), con dos decimales |

Una estaca sin cota de proyecto (fuera del corredor, o en una alineación sin ella lejos del eje) no tiene desmonte ni relleno; el cuadro de diálogo indica cuántas son.

## Guardar el informe

- **CSV**: una línea de título, después las columnas anteriores, más el desmonte o relleno como número con signo (terreno menos proyecto), para hojas de cálculo y colectores de datos.
- **PDF**: páginas de tabla en el papel que elija, una estaca por fila, los desmontes en naranja y los rellenos en verde, con el cajetín de los demás planos.

:::note
Las estacas se calculan a partir del diseño del proyecto. Compruébelas con los planos aprobados antes de construir nada.
:::
