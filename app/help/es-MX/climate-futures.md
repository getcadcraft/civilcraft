---
title: "Futuros climáticos: inundación, calor e incendio forestal en 2050 y 2080"
summary: En Dirección a sitio, eleve el nivel de inundación del sitio para un clima futuro, evalúe la exposición a incendios forestales y transforme un archivo meteorológico, y muestre el presente junto al futuro, a partir de un paquete de datos climáticos (SSP2-4.5 y SSP5-8.5, 2050 y 2080).
keywords: clima, cambio climático, futuro, 2050, 2080, ssp, cmip6, escenario, nivel del mar, inundación, elevación base de inundación, bfe, fema, calor, archivo meteorológico, epw, transformación, incendio forestal, incendio de matorral
from: b0d2ee38
---

Las cifras climáticas provienen de un **paquete de datos**, no de la aplicación. Active el complemento {{ui:Futuros climáticos}} en Configuración › Complementos, o cargue un archivo de paquete propio en el bloque {{ui:Futuro climático}}.

:::warning
El paquete que viene con el complemento es una **muestra**: tres lugares (Denver, Miami, Johannesburgo), un modelo climático y cinco años en cada período de 20 años. Sirve para probar las herramientas, **no para diseñar**. Un paquete completo se construye con `tools/climate/build-pack.mjs` a partir de los datos NEX-GDDP-CMIP6 de la NASA.
:::

## Dónde está

Superficie › Más › Dirección a sitio. Establezca el punto, agregue las capas (una capa de inundación de FEMA da la elevación base de inundación) y pulse el botón que lee el sitio. Bajo las filas del sitio está el bloque {{ui:Futuro climático}}: elija un **Escenario** (SSP2-4.5 o SSP5-8.5) y un **Año** (2050 = 2041-2060, 2080 = 2071-2090, ambos frente a 1995-2014). Se usa el lugar del paquete más cercano al punto, o el que usted elija; si está lejos de todos los lugares, se usan los cambios promedio globales y el panel lo indica.

## Nivel de diseño de inundación

El nivel actual es la elevación base de inundación de FEMA cuando la capa de inundación la tenía (en pies, NAVD 88); si no, escriba el suyo. Elija el tipo de inundación (costera, de río o por lluvia intensa, o ambas), la profundidad de inundación en el sitio para la parte de lluvia, y un francobordo si quiere uno. {{ui:Elevar el nivel de inundación}} muestra el nivel actual y el futuro lado a lado, las partes por nivel del mar y por lluvia, y los supuestos: todo el aumento del nivel del mar se suma a un nivel costero; el caudal del río sube uno a uno con la lluvia del día más húmedo y la profundidad sigue al caudal elevado a la potencia 0.6 (Manning, cauce ancho); las partes se suman.

:::warning
Una evaluación preliminar del cambio, no un estudio de inundación. El nivel de diseño de inundación lo determina la autoridad o su ingeniero.
:::

## Exposición a incendios forestales (solo evaluación preliminar)

La vegetación más cercana, la pendiente que sube desde ella y la distancia dan una banda de muy baja a extrema, actual y futura (la futura multiplica por el cambio del paquete en el índice meteorológico de incendios). **Solo evaluación preliminar:** es nuestra propia escala relativa para saber si un sitio necesita una evaluación formal de incendios forestales; no es una calificación normativa.

## Calor: un archivo meteorológico futuro

Elija un archivo `.epw` de la condición actual y {{ui:Generar el archivo meteorológico futuro}}: se transforma con el método publicado de desplazamiento y estiramiento (Belcher, Hacker y Powell 2005) y se compara el calor (temperatura media y máxima, temperaturas de diseño, horas por encima de 30 °C y 35 °C, grados-día). {{ui:Guardar el archivo meteorológico futuro}} lo guarda para el panel Ambiente, para la verificación energética de BimCraft o para sus propias herramientas.

## De dónde vienen las cifras

NASA NEX-GDDP-CMIP6 (salida de modelos CMIP6 reducida a escala, CC BY 4.0 por modelo) para temperatura, humedad, insolación, lluvia y clima de incendios; la media global del IPCC AR6 para el aumento del nivel del mar, salvo que el paquete incluya cifras locales. El panel muestra la fuente, la licencia y la fecha del paquete.
