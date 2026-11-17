---
title: Cables subterráneos
summary: Trazados de cable en zanjas entre soportes y equipos, recubrimiento y cruces, empalmes según la longitud de bobina, y las mediciones de zanja y de cable.
keywords: cable subterráneo, trazado de cable, zanja, conducto, recubrimiento, cruce, cruce de tubería, empalme, bobina, armario, transformador, fuente, caída de tensión
from: adfd2717
---

## Dibujar un trazado de cable

1. Coloque antes el equipo si el cable termina en un armario, un transformador o un empalme: {{ui:Equipo}}, y después haga clic.
2. Haga clic en {{ui:Cable}} y en el trazado; el inicio y el fin en un soporte o en un equipo lo conectan a él. {{key:Enter}} termina el trazado.

En Propiedades, elija el **Cable**, el **Tipo de zanja**, cuántos **cables en paralelo** y la **holgura** (%). El trazado muestra su longitud, dónde empieza y termina, y la corriente que transporta.

## Qué se comprueba

- **Recubrimiento**: la parte superior del cable debe quedar por debajo del terreno a lo largo del trazado, frente al recubrimiento del tipo de zanja (o al recubrimiento mínimo del conjunto de reglas).
- **Cruces**: donde el trazado cruza una tubería de CivilCraft u otro cable, se compara la separación entre ambos con una regla de distancia libre: la **Distancia libre de cruce** propia del trazado (en sus Propiedades) cuando elija una; si no, la regla **Cruces subterráneos** del conjunto de reglas (los conjuntos de ejemplo usan *Cruce subterráneo*, 0.3 m); o si no, la separación que fija el tipo de zanja respecto a otros servicios. Dos cables que se cruzan conservan la mayor de sus dos distancias. Una línea aérea cruzada se lista a título informativo, y el cable aparece en el perfil de esa línea.
- **Empalmes**: uno cada longitud de bobina del cable (con holgura), cuando el elemento de cable indica una longitud de bobina.

## Equipos

El equipo tiene un elemento de biblioteca, una **carga** (kW) con su **factor de potencia**, y puede ser **una fuente**: la red se alimenta desde allí. La tensión de una fuente procede de su elemento de biblioteca, o, si no, de la línea o del cable que alimenta.

## Mediciones

{{ui:Más}} › {{ui:Mediciones…}} cuenta el cable (longitud del trazado × (1 + holgura) × cables en paralelo + el desnivel en cada extremo), la zanja por tipo, los volúmenes de excavación, de lecho y de relleno, los conductos y los empalmes, con el conductor, los soportes y los equipos de las líneas aéreas.
