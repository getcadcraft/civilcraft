---
title: "Escenarios climáticos: inundación, calor e incendio forestal en 2050 y 2080"
summary: En Dirección a emplazamiento, eleve el nivel de inundación del emplazamiento para un clima futuro, evalúe la exposición a incendios forestales y transforme un archivo meteorológico, y compárelo con el presente, a partir de un paquete de datos climáticos (SSP2-4.5 y SSP5-8.5, 2050 y 2080).
keywords: clima, cambio climático, futuro, 2050, 2080, ssp, cmip6, escenario, nivel del mar, inundación, cota de inundación de base, bfe, fema, calor, archivo meteorológico, epw, transformación, incendio forestal, incendio de vegetación
from: b0d2ee38
---

Las cifras climáticas proceden de un **paquete de datos**, no de la aplicación. Active el complemento {{ui:Escenarios climáticos}} en Configuración › Complementos, o cargue un archivo de paquete propio en el bloque {{ui:Clima futuro}}.

:::warning
El paquete que viene con el complemento es una **muestra**: tres lugares (Denver, Miami, Johannesburgo), un modelo climático y cinco años en cada período de 20 años. Sirve para probar las herramientas, **no para diseñar**. Un paquete completo se construye con `tools/climate/build-pack.mjs` a partir de los datos NEX-GDDP-CMIP6 de la NASA.
:::

## Dónde está

Superficie › Más › Dirección a emplazamiento. Fije el punto, añada las capas (una capa de inundación de FEMA aporta la cota de inundación de base) y pulse el botón que lee el emplazamiento. Bajo las filas del emplazamiento está el bloque {{ui:Clima futuro}}: elija un **Escenario** (SSP2-4.5 o SSP5-8.5) y un **Año** (2050 = 2041-2060, 2080 = 2071-2090, ambos frente a 1995-2014). Se usa el lugar del paquete más cercano al punto, o el que elija usted; si está lejos de todos los lugares, se usan los cambios medios globales y el panel lo indica.

## Nivel de inundación de diseño

El nivel actual es la cota de inundación de base de FEMA cuando la capa de inundación la tenía (en pies, NAVD 88); si no, escriba el suyo. Elija el tipo de inundación (costera, fluvial o de lluvia intensa, o ambas), la profundidad de inundación en el emplazamiento para la parte de lluvia, y un resguardo si quiere uno. {{ui:Elevar el nivel de inundación}} muestra el nivel actual y el futuro uno junto al otro, las partes de subida del mar y de lluvia, y las hipótesis: se suma toda la subida del nivel del mar a un nivel costero; el caudal fluvial sube uno a uno con la lluvia del día más húmedo y la profundidad sigue al caudal elevado a la potencia 0.6 (Manning, cauce ancho); las partes se suman.

:::warning
Una evaluación del cambio, no un estudio de inundación. El nivel de inundación de diseño lo fija la autoridad o su ingeniero.
:::

## Exposición a incendios forestales (solo evaluación)

La vegetación más cercana, la pendiente hacia arriba desde ella y la distancia dan una banda desde muy baja hasta extrema, actual y futura (la futura multiplica por el cambio del índice meteorológico de incendio del paquete). **Solo evaluación:** es nuestra propia escala relativa para saber si un emplazamiento necesita una evaluación completa de incendios forestales; no es una calificación normativa.

## Calor: un archivo meteorológico futuro

Elija un archivo `.epw` actual y pulse {{ui:Crear el archivo meteorológico futuro}}: se transforma con el método publicado de desplazamiento y estiramiento (Belcher, Hacker y Powell 2005) y se compara el calor (temperatura media y máxima, temperaturas de diseño, horas por encima de 30 °C y 35 °C, grados-día). {{ui:Guardar el archivo meteorológico futuro}} lo guarda para el panel de Entorno, para la comprobación energética de BimCraft o para sus propias herramientas.

## De dónde vienen las cifras

NASA NEX-GDDP-CMIP6 (salida de modelos CMIP6 reducida a escala, CC BY 4.0 por modelo) para temperatura, humedad, insolación, lluvia y meteorología de incendios; la media global del AR6 del IPCC para la subida del nivel del mar, salvo que el paquete incluya cifras locales. El panel muestra la fuente, la licencia y la fecha del paquete.
