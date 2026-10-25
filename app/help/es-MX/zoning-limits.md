---
title: Comparar volúmenes con los límites de zonificación que usted escribe
summary: Escriba los retiros de un predio lindero por lindero, una altura máxima, un plano de cielo, un coeficiente de edificabilidad y una ocupación, vea la envolvente construible en el plano y lea qué volúmenes incumplen qué límite.
keywords: zonificación, retiro, retiros, frontal, lateral, posterior, envolvente, área construible, altura máxima, plano de cielo, coeficiente de edificabilidad, ocupación, predio, lote, reglamento
from: 3e267b31
---

**CivilCraft no trae ningún código de zonificación.** No conoce las reglas de ninguna ciudad ni incluye una biblioteca de ellas. Cada número de esta página es uno que usted escribe, tomado de su propio reglamento, y cada resultado dice que se mide contra los límites que usted escribió. Es una forma de ver cómo los límites de un predio dan forma a un edificio, no un dictamen sobre si un diseño está permitido.

## Escriba los límites

En **Propiedades**, bajo **Volúmenes de edificios**, elija un **Predio** (o seleccione un volumen: los límites de su predio aparecen debajo). Luego llene lo que corresponda; deje vacía una casilla si no hay límite:

- **Lindero a la calle**: el lindero del predio sobre la calle. El **Retiro frontal** se aplica a él, el **Retiro posterior** al lindero más opuesto, y el **Retiro lateral** a los demás.
- **Altura máxima**.
- **Plano de cielo**: parte de una altura en el lindero y sube la cantidad que escriba por cada 1 de avance hacia adentro, medido desde el lindero a la calle o desde todos los linderos (2 significa 2 a 1). La altura permitida sobre un punto es la menor entre el plano y la altura máxima.
- **Coeficiente de edificabilidad** (área bruta construida de los volúmenes del predio dividida entre el área del predio) y **Ocupación** (sus huellas divididas entre el área del predio, en porcentaje).

## La envolvente

Marque **Mostrar la envolvente en el plano** para dibujarla en la capa `A-MASS-ENVL`. La envolvente es el predio recortado desde cada lindero con el retiro de ese lindero, y las líneas desplazadas se unen en esquinas a inglete. Un lindero curvo se toma como cuerdas cortas a menos de 0.01 de la curva. Funcionan predios convexos y cóncavos. Si los retiros se cruzan entre sí (un retiro grande en un predio angosto o muy cóncavo) no hay envolvente, y Propiedades lo dice; pruebe distancias menores.

## El resultado

Debajo de las casillas, cada volumen y cada límite recibe una línea, con una marca de visto o de cruz:

- **retiros**: el área del volumen que queda fuera de la envolvente;
- **altura**: la altura del volumen contra la máxima permitida sobre su huella (un prisma de una sola altura queda limitado por la menor altura permitida en cualquiera de sus esquinas);
- **coeficiente de edificabilidad** y **ocupación**: suman todos los volúmenes del predio.
