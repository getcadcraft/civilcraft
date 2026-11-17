---
title: Dibujar una línea aérea
summary: Coloque apoyos en el plano, deje que CivilCraft determine el papel de cada apoyo y de los tramos entre amarres, y mueva los apoyos en el plano o en el perfil de la línea.
keywords: línea aérea, apoyo, poste, vano, tramo, amarre, ángulo, suspensión, perfil, altura, cruceta, retenida, tirante
from: b8e5e272
---

## Dibujarla

1. Tenga una superficie: el terreno bajo la línea procede de ella ([Crear una superficie](topic:build-surface)). Un apoyo sin terreno debajo aparece en **Comprobaciones**; escriba su **Cota del terreno** en Propiedades en su lugar.
2. Haga clic en {{ui:Line}} en el grupo Líneas eléctricas y haga clic en cada apoyo del plano.
3. Haga doble clic en el último, o pulse {{key:Enter}}.

La línea recibe el conductor, el apoyo y el equipo que usó por última vez en este equipo (la primera vez, ejemplos de la biblioteca). Cámbielos en Propiedades.

## La línea en Propiedades

Seleccione la línea (haga clic en un vano) para definir su **Conductor**, los **Conductores por circuito**, los **Circuitos**, la **Tensión**, la **Regla de distancias** que debe mantener sobre el terreno, y el equipo **En cada apoyo** (una cruceta, aisladores, herrajes). La tabla enumera sus **tramos** con el vano de regulación de cada uno, la tensión habitual y la hipótesis de carga que lo gobierna.

## Apoyos

Haga clic en un apoyo para seleccionarlo. En Propiedades:

- **Apoyo**: su elemento de biblioteca. Cuando es demasiado débil, {{ui:Use …}} coloca el apoyo más pequeño del mismo material en su biblioteca que soporte la carga.
- **Papel**: Automático, Suspensión, Ángulo o Amarre. Automático significa: el primer y el último apoyo son amarres; un giro por encima del ángulo de la regla establecida hace un apoyo de ángulo; un giro mayor, un amarre.
- **Altura sobre el terreno**: si está vacía, se toma del elemento de biblioteca (su longitud menos la profundidad enterrada).
- **También en este apoyo**: equipo adicional, como una **retenida**. Un apoyo con retenida transmite el tiro de la línea a su retenida.
- **Apoyo existente**: se comprueba como los demás, pero no se incluye en las cantidades.

{{ui:Support}} añade un apoyo en el vano más cercano a su clic. Arrastre un apoyo en el plano para moverlo. {{key:Delete}} lo elimina (una línea conserva al menos dos).

Los tramos discurren entre amarres: dentro de un tramo, el conductor corre libremente por las grapas de suspensión, así que una única tensión rige todo el tramo.

## El perfil de la línea

Haga clic en {{ui:Profile}} (o en **Perfil** en las Propiedades de la línea). El panel bajo el plano muestra el terreno a lo largo de la línea, cada apoyo desde el terreno hasta su cabeza, la fase más baja del conductor en la **Hipótesis de carga** que elija, y la distancia que la línea debe mantener, como línea discontinua. Un vano que no cumple aparece en rojo; el número bajo cada vano es su distancia mínima.

- **Línea** elige la línea aérea que se muestra. Al seleccionar otra línea, o uno de sus apoyos, en el plano, el perfil cambia a ella.
- Mueva el puntero sobre el perfil: una línea guía lo sigue, y la etiqueta indica la distancia a lo largo de la línea, el terreno, el conductor y la distancia libre en ese punto (y avisa cuando la distancia libre está por debajo de la regla de la línea).
- {{ui:Measure}} en la barra del perfil: haga clic en dos puntos para obtener la distancia horizontal, la diferencia de altura, la distancia recta y la pendiente entre ellos. Un clic cerca del terreno, del conductor o de la cabeza de un apoyo se ajusta a él. Haga clic de nuevo en {{ui:Measure}} para detener.
- Los obstáculos que cruza la línea se levantan desde el terreno: los dibujados como barras, las plantas de Paisajismo como su copa, los muros como barras (vea [Comprobaciones de líneas eléctricas](topic:power-line-checks#clearances)). Las rutas de cables y las tuberías que cruza la línea se marcan bajo el terreno, en su parte superior, con su nombre.

- Arrastre un apoyo lateralmente para moverlo a lo largo de la línea.
- Arrastre su cabeza hacia arriba o hacia abajo para fijar su altura sobre el terreno.
