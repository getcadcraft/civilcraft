---
title: Comprobar volúmenes frente a los límites de zonificación que escribe
summary: Escriba los retranqueos de una parcela línea a línea, un límite de altura, un plano de cielo, un coeficiente de edificabilidad y una ocupación, vea la envolvente edificable en el plano y lea qué volúmenes incumplen qué límite.
keywords: zonificación, retranqueo, retranqueos, frente, lateral, fondo, envolvente, superficie edificable, límite de altura, plano de cielo, FAR, coeficiente de edificabilidad, ocupación, parcela, ordenanza, comprobación normativa
from: 3e267b31
---

**CivilCraft no tiene ningún código de zonificación.** No conoce las normas de ninguna ciudad y no incluye una biblioteca de ellas. Cada número de esta página lo escribe usted, tomado de su propia ordenanza, y cada resultado indica que se mide frente a los límites que escribió. Es una forma de ver cómo los límites de una parcela condicionan un edificio, no un dictamen sobre si un diseño está permitido.

## Escriba los límites

En **Propiedades**, bajo **Volúmenes de edificación**, elija una **Parcela** (o seleccione un volumen: los límites de su parcela aparecen debajo). Después rellene lo que aplique; deje un cuadro vacío si no hay límite:

- **Línea de calle**: la línea de lindero que da a la calle. El **Retranqueo frontal** se aplica a ella, el **Retranqueo posterior** a la línea más opuesta, y el **Retranqueo lateral** al resto.
- **Límite de altura**.
- **Plano de cielo**: parte de una altura en la línea de lindero y sube la cantidad que usted escriba por cada 1 de recorrido hacia el interior, medido desde la línea de calle o desde cada línea de lindero (2 significa 2 a 1). La altura permitida sobre un punto es la menor entre el plano y el límite de altura.
- **Coeficiente de edificabilidad** (superficie bruta construida de los volúmenes de la parcela dividida entre el área de la parcela) y **Ocupación** (sus huellas divididas entre el área de la parcela, escrita en porcentaje).

## La envolvente

Marque **Mostrar la envolvente en el plano** para dibujarla en la capa `A-MASS-ENVL`. La envolvente es la parcela recortada desde cada línea de lindero según el retranqueo propio de esa línea, con las líneas de desplazamiento unidas en esquinas a inglete. Una línea de lindero formada por una curva se toma como cuerdas cortas a menos de 0,01 de la curva. Funcionan tanto las parcelas convexas como las cóncavas. Si los retranqueos se pliegan sobre sí mismos (un retranqueo profundo en una parcela estrecha o muy cóncava), no hay envolvente, y Propiedades lo indica; pruebe con distancias menores.

## El resultado

Debajo de los cuadros, cada volumen y cada límite recibe una línea, con una marca de cumple o de no cumple:

- **retranqueos**: el área del volumen que queda fuera de la envolvente;
- **altura**: la altura del volumen frente a la máxima permitida sobre su huella (un prisma de una sola altura queda limitado por la menor altura permitida en cualquiera de sus esquinas);
- **coeficiente de edificabilidad** y **ocupación**: todos los volúmenes de la parcela sumados.
