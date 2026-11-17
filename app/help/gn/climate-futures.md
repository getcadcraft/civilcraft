---
title: "Escenarios climáticos: inundación, calor e incendio forestal en 2050 y 2080"
summary: En Dirección a sitio, subí el nivel de inundación del sitio para un clima futuro, evaluá la exposición a incendios forestales y transformá un archivo de clima, presente junto a futuro, a partir de un paquete de datos climáticos (SSP2-4.5 y SSP5-8.5, 2050 y 2080).
keywords: clima, cambio climático, futuro, 2050, 2080, ssp, cmip6, escenario, nivel del mar, inundación, elevación base de inundación, bfe, fema, calor, archivo de clima, epw, morph, incendio forestal, incendio de monte
from: b0d2ee38
---

Las cifras climáticas vienen de un **paquete de datos**, no de la aplicación. Activá el complemento {{ui:Escenarios climáticos}} en Configuración › Complementos, o cargá un archivo de paquete propio en el bloque {{ui:Clima futuro}}.

:::warning
El paquete que viene con el complemento es una **muestra**: tres lugares (Denver, Miami, Johannesburgo), un modelo climático, cinco años en cada período de 20 años. Sirve para probar las herramientas, **no para diseñar**. Un paquete completo se construye con `tools/climate/build-pack.mjs` a partir de los datos NEX-GDDP-CMIP6 de la NASA.
:::

## Dónde está

Superficie › Más › Dirección a sitio. Fijá el punto, agregá las capas (una capa de inundación de FEMA da la elevación base de inundación) y apretá el botón que lee el sitio. Debajo de las filas del sitio está el bloque {{ui:Clima futuro}}: elegí un **Escenario** (SSP2-4.5 o SSP5-8.5) y un **Año** (2050 = 2041-2060, 2080 = 2071-2090, ambos contra 1995-2014). Se usa el lugar del paquete más cercano al punto, o el que elijas; si está lejos de todos los lugares, se usan los cambios promedio globales y el panel lo dice.

## Nivel de inundación de diseño

El nivel actual es la elevación base de inundación de FEMA cuando la capa de inundación la tuvo (pies, NAVD 88), si no, escribí el tuyo. Elegí el tipo de inundación (costera, de río o de lluvia intensa, o ambas), la profundidad de inundación en el sitio para la parte de lluvia, y un margen de seguridad si querés uno. {{ui:Subir el nivel de inundación}} muestra el nivel actual y el futuro lado a lado, las partes de nivel del mar y de lluvia, y los supuestos: todo el aumento del nivel del mar se suma a un nivel costero; el caudal del río sube uno a uno con la lluvia del día más húmedo y la profundidad sigue al caudal elevado a 0.6 (Manning, cauce ancho); las partes se suman.

:::warning
Es una evaluación del cambio, no un estudio de inundación. El nivel de inundación de diseño lo define la autoridad o tu ingeniero.
:::

## Exposición a incendios forestales (solo evaluación)

La vegetación más cercana, la pendiente hacia arriba desde ella y la distancia dan una banda de muy baja a extrema, presente y futura (la futura multiplica por el cambio del índice de clima de incendios del paquete). **Solo evaluación:** nuestra propia escala relativa para saber si un sitio necesita una evaluación de incendio forestal en forma; no es una calificación de código.

## Calor: un archivo de clima futuro

Elegí un archivo `.epw` de clima actual y {{ui:Crear el archivo de clima futuro}}: se transforma con el método publicado de desplazamiento y estiramiento (Belcher, Hacker y Powell 2005) y se compara el calor (temperatura media y máxima, temperaturas de diseño, horas por encima de 30 °C y 35 °C, grados-día). {{ui:Guardar el archivo de clima futuro}} lo guarda para el panel de Ambiente, la verificación de energía de BimCraft o tus propias herramientas.

## De dónde salen los números

NASA NEX-GDDP-CMIP6 (salida de modelos CMIP6 reducida a escala, CC BY 4.0 por modelo) para temperatura, humedad, sol, lluvia y clima de incendios; el promedio global del IPCC AR6 para el aumento del nivel del mar, salvo que el paquete traiga cifras locales. El panel muestra la fuente, la licencia y la fecha del paquete.
