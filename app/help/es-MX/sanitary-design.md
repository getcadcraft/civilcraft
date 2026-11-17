---
title: Calcular los gastos de diseño sanitarios y revisar el colector
summary: Introduzca los habitantes y el área que entran en cada pozo de visita de una red sanitaria; CivilCraft los suma aguas abajo en la red, calcula el gasto máximo con un factor pico e infiltración, y revisa la capacidad y la velocidad de cada tubería.
keywords: sanitario, alcantarillado, alcantarillado sanitario, aguas residuales, gasto de diseño, gasto máximo, factor pico, harmon, babbitt, infiltración, población, por habitante, porcentaje de llenado, autolimpieza, velocidad, dimensionamiento de tuberías, hoja de diseño
from: 73ba197a
---

Los gastos de diseño sanitarios funcionan sobre la [red de tuberías](topic:pipe-network) cuando su {{ui:Tipo}} es {{ui:Sanitario}}. Sin nada seleccionado, el panel derecho muestra entonces **Gastos de diseño sanitarios**, donde una red pluvial muestra el drenaje pluvial.

## Introducir lo que llega

1. Seleccione un pozo de visita. En **Gastos de diseño sanitarios**, escriba {{ui:Habitantes que entran aquí}} y {{ui:Área que entra aquí}} (hectáreas en un proyecto en metros, acres en un proyecto en pies).
2. Para comercios, oficinas o industria, escriba habitantes equivalentes: el área multiplicada por los habitantes por hectárea (o por acre) que use su dependencia. El área cuenta para la infiltración en cualquier caso.
3. Repita en cada pozo de visita donde se conecte una calle o un lote. Un pozo donde no se conecta nada mantiene ambos valores en 0.

Cada tubería conduce todo lo que entra en su pozo de visita aguas arriba y por encima de él. Seleccione un pozo para ver lo que pasa por él.

## Las configuraciones

| Configuración | Qué significa |
|---|---|
| {{ui:Aportación por habitante}} | el gasto medio de una persona al día: litros (proyecto en metros) o galones estadounidenses (proyecto en pies) |
| {{ui:Infiltración}} | agua subterránea que se filtra: litros por segundo por hectárea, o galones al día por acre |
| {{ui:Factor pico}} | Harmon, 1 + 14 / (4 + √P), o Babbitt, 5 / P^0.2, con P la población en miles |
| {{ui:Factor pico de al menos}} / {{ui:Factor pico de a lo más}} | el factor se mantiene entre estos dos valores |
| {{ui:n de Manning}} | para la capacidad y la velocidad |
| {{ui:Velocidad mínima}} / {{ui:Velocidad máxima}} | a la profundidad propia del gasto máximo en la tubería |
| {{ui:Máximo de la capacidad a tubo lleno}} | qué tan lleno puede estar un tubo en el máximo, como porcentaje de lo que conduce a tubo lleno |

Los valores iniciales son de referencia, no una norma. Use los valores que publique su dependencia.

## Lo que calcula

Para cada tubería, en orden de flujo:

- gasto máximo = habitantes × aportación por habitante × factor pico + área × infiltración
- capacidad a tubo lleno (ecuación de Manning con la pendiente de la tubería), y qué tan lleno deja al gasto máximo
- el tirante normal del gasto máximo y la velocidad allí

La tabla **Resultados sanitarios** enumera los habitantes, el factor pico, el gasto máximo (L/s, o gpm y pies cúbicos por segundo), el porcentaje de llenado y la velocidad de cada tubería. Los problemas se listan debajo: un tubo más lleno que el límite, más lento que la velocidad mínima (puede no autolimpiarse), más rápido que la máxima, o sin pendiente. {{ui:Dimensionar las tuberías para estos gastos}} elige para cada tubería el diámetro estándar más pequeño (200 mm u 8 pulgadas en adelante) que conduce su gasto máximo dentro del límite; un {{key:Mod+Z}} lo deshace.

:::note
Este es el gasto máximo permanente que calcula una hoja de diseño, verificado contra una hoja de diseño publicada hasta su redondeo impreso. No es un modelo del alcantarillado en el tiempo: no incluye hidrogramas, almacenamiento, bombas ni desbordamientos. Consulte [Sin construir todavía](topic:not-built-yet).
:::

Las velocidades usan la ecuación de Manning con el mismo n a cualquier profundidad. Algunas dependencias usan gráficas de tubo parcialmente lleno en las que n varía con la profundidad, lo que da una velocidad un poco menor en una tubería que trabaja entre 60 y 70 por ciento de su llenado (alrededor de 3 por ciento menos).
