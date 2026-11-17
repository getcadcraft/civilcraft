---
title: Cables subterráneos
summary: Rutas de cable en zanjas entre soportes y equipos, recubrimiento y cruces, empalmes por longitud de carrete, y las cantidades de zanja y de cable.
keywords: cable subterráneo, ruta de cable, zanja, ducto, recubrimiento, cruce, cruce de tubería, empalme, carrete, gabinete, transformador, fuente, caída de voltaje
from: adfd2717
---

## Dibujar una ruta de cable

1. Coloque primero el equipo si el cable termina en un gabinete, un transformador o un empalme: {{ui:Equipo}}, y luego haga clic.
2. Haga clic en {{ui:Cable}} y luego en la ruta; empiece y termine en un soporte o en un equipo para conectarse a él. Enter termina la ruta.

En Propiedades, elija el **Cable**, el **Tipo de zanja**, cuántos **cables en paralelo** y la **holgura** (%). La ruta muestra su longitud, dónde empieza y termina, y la corriente que transporta.

## Qué se verifica

- **Recubrimiento**: la parte superior del cable bajo el terreno a lo largo de la ruta, contra el recubrimiento del tipo de zanja (o el recubrimiento mínimo del conjunto de reglas).
- **Cruces**: donde la ruta cruza una tubería de CivilCraft u otro cable, la separación entre ellos frente a una regla de separación libre: la **Separación en cruces** propia de la ruta (en sus Propiedades) cuando elija una; si no, la regla **Cruces subterráneos** del conjunto de reglas (los conjuntos de ejemplo usan *Cruce subterráneo*, 0.3 m); si no, la separación del tipo de zanja respecto a otros servicios. Si dos cables se cruzan, se conserva la mayor de las dos separaciones. Una línea aérea cruzada se enumera para información, y el cable aparece en el perfil de esa línea.
- **Empalmes**: uno cada longitud de carrete del cable (con holgura), cuando el elemento de cable indica una longitud de carrete.

## Equipo

El equipo tiene un elemento de biblioteca, una **carga** (kW) con su **factor de potencia**, y puede ser **una fuente**: la red se alimenta desde allí. El voltaje de una fuente proviene de su elemento de biblioteca, o si no, de la línea o cable que alimenta.

## Cantidades

{{ui:Más}} › {{ui:Cantidades…}} cuenta el cable (longitud de la ruta × (1 + holgura) × cables en paralelo + el desnivel en cada extremo), la zanja por tipo, los volúmenes de excavación, lecho y relleno, los ductos y los empalmes, junto con el conductor, los soportes y el equipo de las líneas aéreas.
