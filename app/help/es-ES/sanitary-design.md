---
title: Calcular los caudales de diseño de saneamiento y comprobar el colector
summary: Introduzca las personas y el área que entran en cada pozo de registro de una red de saneamiento; CivilCraft las suma aguas abajo por la red, calcula el caudal punta con un factor punta y la infiltración, y comprueba la capacidad y la velocidad de cada tubería.
keywords: saneamiento, alcantarillado, colector de saneamiento, aguas residuales, caudal de diseño, caudal punta, factor punta, Harmon, Babbitt, infiltración, población, por habitante, porcentaje de llenado, autolimpieza, velocidad, dimensionado de tuberías, hoja de cálculo de diseño
from: 73ba197a
---

Los caudales de diseño de saneamiento trabajan sobre la [red de tuberías](topic:pipe-network) cuando su {{ui:Type}} es {{ui:Sanitary}}. Sin nada seleccionado, el panel derecho muestra entonces **Caudales de diseño de saneamiento**, donde una red pluvial muestra el drenaje de aguas pluviales.

## Introducir lo que llega

1. Seleccione un pozo de registro. En **Caudales de diseño de saneamiento**, escriba {{ui:People entering here}} y {{ui:Area entering here}} (hectáreas en un proyecto métrico, acres en un proyecto en pies).
2. Para comercios, oficinas o industria, escriba habitantes equivalentes: el área por los habitantes por hectárea (o por acre) que use su organismo. El área cuenta para la infiltración en cualquier caso.
3. Repita en cada pozo donde se conecta una calle o una parcela. Un pozo donde no se conecta nada mantiene ambos valores en 0.

Cada tubería transporta todo lo que entra en su pozo superior y por encima de él. Seleccione un pozo para ver lo que pasa por él.

## Ajustes

| Ajuste | Qué significa |
|---|---|
| {{ui:Flow per person}} | el caudal medio de una persona al día: litros (proyecto métrico) o galones US (proyecto en pies) |
| {{ui:Infiltration}} | agua subterránea que se filtra: litros por segundo por hectárea, o galones al día por acre |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), o Babbitt, 5 / P^0.2, siendo P la población en miles |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | el factor se mantiene entre estos dos valores |
| {{ui:Manning n}} | para capacidad y velocidad |
| {{ui:Least velocity}} / {{ui:Most velocity}} | a la profundidad propia del caudal punta en la tubería |
| {{ui:Most of full capacity}} | cuánto puede llenarse una tubería en punta, como porcentaje de lo que transporta a tubo lleno |

Los valores iniciales son provisionales, no una norma. Utilice los valores que publique su organismo.

## Lo que calcula

Para cada tubería, en orden de flujo:

- caudal punta = personas × caudal por persona × factor punta + área × infiltración
- capacidad a tubo lleno (ecuación de Manning con la pendiente de la tubería) y cuánto la llena el caudal punta
- el calado normal del caudal punta y la velocidad allí

La tabla **Resultados de saneamiento** enumera para cada tubería sus personas, su factor punta, el caudal punta (L/s, o gpm y pies cúbicos por segundo), el porcentaje de llenado y la velocidad. Debajo se listan los problemas: una tubería más llena que el límite, más lenta que la velocidad mínima (puede que no se autolimpie), más rápida que la máxima, o sin pendiente. {{ui:Size the pipes for these flows}} elige para cada tubería el menor diámetro estándar (desde 200 mm u 8 pulgadas) que transporta su punta dentro del límite; un {{key:Mod+Z}} lo deshace.

:::note
Esto es el caudal punta permanente que calcula una hoja de cálculo de diseño, comprobado contra una hoja de cálculo de diseño publicada hasta su redondeo impreso. No es un modelo del colector en el tiempo: no hay hidrogramas, almacenamiento, bombas ni aliviaderos. Consulte [Aún no disponible](topic:not-built-yet).
:::

Las velocidades usan la ecuación de Manning con la misma n a cada calado. Algunos organismos tienen tablas de llenado parcial que hacen variar n con el calado, lo que da una velocidad algo menor en una tubería que trabaja al 60 a 70 % (alrededor de un 3 % menos).
