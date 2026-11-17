---
title: Cables subterráneos
summary: Recorridos de cable en zanjas entre soportes y equipos, recubrimiento y cruces, juntas según la longitud del carrete, y las cantidades de zanja y de cable.
keywords: cable subterráneo, recorrido de cable, zanja, ducto, recubrimiento, cruce, cruce de caño, junta, carrete, gabinete, transformador, fuente, caída de tensión
from: adfd2717
---

## Dibujar un recorrido de cable

1. Colocá primero el equipo si el cable termina en un gabinete, un transformador o una junta: {{ui:Equipment}}, y después hacé clic.
2. Hacé clic en {{ui:Cable}} y después en el recorrido; empezá y terminá en un soporte o en un equipo para conectarte a él. {{key:Enter}} termina.

En Propiedades, elegí el **Cable**, el **Tipo de zanja**, cuántos **cables en paralelo** y la **holgura** (%). El recorrido muestra su longitud, dónde empieza y termina, y la corriente que lleva.

## Qué se verifica

- **Recubrimiento**: la parte superior del cable debe estar por debajo del terreno a lo largo del recorrido, según el recubrimiento del tipo de zanja (o el recubrimiento mínimo del conjunto de reglas).
- **Cruces**: donde el recorrido cruza un caño de CivilCraft u otro cable, la separación entre ambos se compara con una regla de distancia libre: la **Distancia libre de cruce** propia del recorrido (en sus Propiedades) cuando elegís una, si no la regla **Cruces subterráneos** del conjunto de reglas (los conjuntos de ejemplo usan *Cruce subterráneo*, 0.3 m), y si no, la separación del tipo de zanja respecto de otros servicios. Dos cables que se cruzan conservan la mayor de sus dos distancias. Una línea aérea cruzada se lista a título informativo, y el cable aparece en el perfil de esa línea.
- **Juntas**: una cada longitud de carrete del cable (con holgura), cuando el ítem de cable da una longitud de carrete.

## Equipo

El equipo tiene un ítem de biblioteca, una **carga** (kW) con su **factor de potencia**, y puede ser **una fuente**: la red se alimenta desde ahí. La tensión de una fuente sale de su ítem de biblioteca, o si no, de la línea o el cable que alimenta.

## Cantidades

{{ui:More}} › {{ui:Quantities…}} cuenta el cable (longitud del recorrido × (1 + holgura) × cables en paralelo + la subida en cada extremo), la zanja por tipo, los volúmenes de excavación, cama y relleno, los ductos y las juntas, con el conductor, los soportes y los equipos de las líneas aéreas.
