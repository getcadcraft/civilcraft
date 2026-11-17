---
title: Verificar volúmenes contra los límites de zonificación que escribís
summary: Escribí los retiros de un lote línea por línea, un límite de altura, un plano de exposición al cielo, un coeficiente de ocupación y una cobertura; mirá la envolvente edificable en el plano y leé qué volúmenes rompen qué límite.
keywords: zonificación, retiro, retiros, frente, lateral, fondo, envolvente, superficie edificable, límite de altura, plano de exposición al cielo, coeficiente de ocupación, FAR, cobertura, lote, parcela, ordenanza, verificación normativa
from: 3e267b31
---

**CivilCraft no tiene código de zonificación incorporado.** No conoce las reglas de ninguna ciudad ni trae una biblioteca de ellas. Cada número de esta página es uno que escribís, tomado de tu propia ordenanza, y cada resultado dice que se mide contra los límites que escribiste. Es una manera de ver cómo los límites de un lote dan forma a un edificio, no un dictamen sobre si un diseño está permitido.

## Escribí los límites

En **Propiedades**, bajo **Volúmenes de edificio**, elegí una **Parcela** (o seleccioná un volumen: debajo se muestran los límites de su parcela). Luego completá lo que aplique; dejá un campo vacío para "sin límite":

- **Línea de calle**: la línea de lote sobre la calle. El **Retiro de frente** se aplica a ella, el **Retiro de fondo** a la línea más opuesta, y el **Retiro lateral** al resto.
- **Límite de altura**.
- **Plano de cielo**: arranca a una altura en la línea de lote y sube la cantidad que escribas por cada 1 de recorrido hacia adentro, medido desde la línea de calle o desde cada línea de lote (2 significa 2 a 1). La altura permitida sobre un punto es la más baja entre el plano y el límite de altura.
- **Coeficiente de ocupación** (superficie bruta de piso de los volúmenes del lote dividida por el área del lote) y **Cobertura** (sus huellas divididas por el área del lote, escrita en porcentaje).

## La envolvente

Marcá **Mostrar la envolvente en el plano** para dibujarla en la capa `A-MASS-ENVL`. La envolvente es el lote achicado desde cada línea de lote según el retiro propio de esa línea, con las líneas de desplazamiento encontrándose en esquinas a inglete. Una línea de lote hecha de curva se toma como cuerdas cortas dentro de 0,01 de la curva. Funcionan tanto lotes convexos como cóncavos. Si los retiros se pliegan sobre sí mismos (un retiro profundo en un lote angosto o muy cóncavo) no hay envolvente, y Propiedades lo indica; probá distancias menores.

## El resultado

Debajo de los campos, cada volumen y cada límite tiene una línea, con un tilde o una cruz:

- **retiros**: el área del volumen que queda fuera de la envolvente;
- **altura**: la altura del volumen frente a la máxima permitida sobre su huella (un prisma de una altura se limita por la altura permitida más baja en cualquiera de sus esquinas);
- **coeficiente de ocupación** y **cobertura**: todos los volúmenes de la parcela sumados.
