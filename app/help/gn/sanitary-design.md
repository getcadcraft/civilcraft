---
title: Calcular los caudales de diseño cloacal y verificar el colector
summary: Ingresá las personas y la superficie que entran en cada cámara de una red cloacal; CivilCraft las suma aguas abajo en la red, calcula el caudal punta con un factor de punta e infiltración, y verifica la capacidad y la velocidad de cada caño.
keywords: cloacal, colector, colector cloacal, aguas residuales, caudal de diseño, caudal punta, factor de punta, harmon, babbitt, infiltración, población, per cápita, porcentaje de llenado, autolimpieza, velocidad, dimensionamiento de caños, planilla de diseño
from: 73ba197a
---

Los caudales de diseño cloacal trabajan sobre la [red de caños](topic:pipe-network) cuando su {{ui:Tipo}} es {{ui:Cloacal}}. Sin nada seleccionado, el panel derecho muestra entonces **Caudales de diseño cloacal** donde una red pluvial muestra drenaje pluvial.

## Ingresar lo que llega

1. Seleccioná una cámara. Bajo **Caudales de diseño cloacal**, escribí {{ui:Personas que ingresan aquí}} y {{ui:Superficie que ingresa aquí}} (hectáreas en un proyecto métrico, acres en un proyecto en pies).
2. Para comercios, oficinas o industria, escribí personas equivalentes: la superficie por las personas por hectárea (o por acre) que usa tu organismo. La superficie cuenta para la infiltración en cualquier caso.
3. Repetí para cada cámara a la que se conecte una calle o un lote. Una cámara a la que no se conecta nada mantiene ambos valores en 0.

Cada caño lleva todo lo que entra en su cámara superior y lo que está más arriba. Seleccioná una cámara para ver qué pasa por ella.

## La configuración

| Configuración | Qué significa |
|---|---|
| {{ui:Caudal por persona}} | el caudal medio de una persona por día: litros (proyecto métrico) o galones de EE. UU. (proyecto en pies) |
| {{ui:Infiltración}} | agua subterránea que se filtra: litros por segundo por hectárea, o galones por día por acre |
| {{ui:Factor de punta}} | Harmon, 1 + 14 / (4 + √P), o Babbitt, 5 / P^0,2, con P la población en miles |
| {{ui:Factor de punta como mínimo}} / {{ui:Factor de punta como máximo}} | el factor queda entre estos dos valores |
| {{ui:Manning n}} | para la capacidad y la velocidad |
| {{ui:Velocidad mínima}} / {{ui:Velocidad máxima}} | a la profundidad propia del caudal punta en el caño |
| {{ui:Máximo de capacidad llena}} | cuán lleno puede correr un caño en el punto, como porcentaje de lo que lleva a caño lleno |

Los valores de partida son marcadores de posición, no una norma. Usá los valores que publica tu organismo.

## Lo que calcula

Para cada caño, en orden de flujo:

- caudal punta = personas × caudal por persona × factor de punta + superficie × infiltración
- capacidad a caño lleno (ecuación de Manning con la pendiente del caño), y cuán lleno lo deja el caudal punta
- la profundidad normal del caudal punta y la velocidad allí

La tabla **Resultados cloacales** lista las personas de cada caño, su factor de punta, el caudal punta (L/s, o gpm y pies cúbicos por segundo), el porcentaje de llenado y la velocidad. Los problemas se listan debajo: un caño más lleno que el límite, más lento que la velocidad mínima (puede no autolimpiarse), más rápido que la máxima, o sin pendiente. {{ui:Dimensionar los caños para estos caudales}} elige para cada caño el tamaño estándar más chico (200 mm u 8 pulgadas y más) que lleva su punta dentro del límite; un {{key:Mod+Z}} lo deshace.

:::note
Esto es el caudal punta en régimen permanente que calcula una planilla de diseño, verificado contra una planilla de diseño publicada hasta su redondeo impreso. No es un modelo del colector en el tiempo: sin hidrogramas, almacenamiento, bombas ni desbordes. Ver [Todavía no construido](topic:not-built-yet).
:::

Las velocidades usan la ecuación de Manning con la misma n a cada profundidad. Algunos organismos usan tablas de llenado parcial donde la n cambia con la profundidad, lo que da una velocidad un poco menor en un caño que corre entre 60 y 70 por ciento lleno (alrededor de 3 por ciento menos).
