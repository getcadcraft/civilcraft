---
title: Dibujar una línea aérea
summary: Coloque soportes en el plano, deje que CivilCraft determine el papel de cada soporte y los tramos entre fines de línea, y mueva los soportes en el plano o en el perfil de la línea.
keywords: línea aérea, soporte, poste, vano, tramo, fin de línea, ángulo, suspensión, perfil, altura, travesaño, retenida, tirante
from: b8e5e272
---

## Dibujarla

1. Tenga una superficie: el terreno bajo la línea sale de ella ([Construir una superficie](topic:build-surface)). Un soporte sin terreno debajo aparece en **Controles**; escriba su **Nivel del terreno** en Propiedades.
2. Haga clic en {{ui:Línea}} en el grupo Líneas eléctricas y haga clic en cada soporte en el plano.
3. Haga doble clic en el último, o presione {{key:Enter}}.

La línea recibe el conductor, el soporte y el equipo que usó por última vez en esta computadora (la primera vez, ejemplos de la biblioteca). Cámbielos en Propiedades.

## La línea en Propiedades

Seleccione la línea (haga clic en un vano) para fijar su **Conductor**, **Conductores por circuito**, **Circuitos**, **Tensión**, la **Regla de distancia** que debe mantener sobre el terreno, y el equipo **En cada soporte** (un travesaño, aisladores, accesorios). La tabla enumera sus **tramos** con el vano de regulación de cada uno, la tensión habitual y la hipótesis de carga que lo rige.

## Soportes

Haga clic en un soporte para seleccionarlo. En Propiedades:

- **Soporte**: su elemento de biblioteca. Cuando es demasiado débil, {{ui:Usar …}} coloca el soporte más pequeño del mismo material en su biblioteca que soporta la carga.
- **Papel**: Automático, Suspensión, Ángulo o Fin de línea. Automático significa: el primer y el último soporte son fines de línea; un giro mayor que el ángulo de la regla hace un soporte de ángulo; un giro mayor, un fin de línea.
- **Altura sobre el terreno**: vacío la toma del elemento de biblioteca (su longitud menos la profundidad en el suelo).
- **También en este soporte**: equipo adicional, como una **retenida** (tirante). Un soporte con retenida transmite el tiro de la línea a su retenida.
- **Soporte existente**: se verifica como los demás, pero no se cuenta en las cantidades.

{{ui:Soporte}} agrega un soporte en el vano más cercano a su clic. Arrastre un soporte en el plano para moverlo. Delete lo quita (una línea conserva al menos dos).

Los tramos van entre fines de línea: dentro de un tramo, el conductor pasa libre por las abrazaderas de suspensión, así que una sola tensión rige todo el tramo.

## El perfil de la línea

Haga clic en {{ui:Perfil}} (o en **Perfil** en las Propiedades de la línea). El panel bajo el plano muestra el terreno a lo largo de la línea, cada soporte desde el terreno hasta su parte superior, la fase más baja del conductor en la **Hipótesis de carga** que elija, y la distancia que la línea debe mantener, como una línea punteada. Un vano que falla se muestra en rojo; el número bajo cada vano es su distancia mínima.

- **Línea** elige la línea aérea a mostrar. Al seleccionar otra línea, o uno de sus soportes, en el plano, el perfil cambia a ella.
- Mueva el puntero sobre el perfil: una guía lo sigue, y la etiqueta indica la distancia a lo largo de la línea, el terreno, el conductor y la distancia allí (y avisa cuando la distancia está por debajo de la regla de la línea).
- {{ui:Medir}} en la barra del perfil: haga clic en dos puntos para obtener la distancia entre ellos, la diferencia de altura, la distancia recta y la pendiente. Un clic cerca del terreno, del conductor o de la parte superior de un soporte se ajusta a ese punto. Haga clic en {{ui:Medir}} otra vez para terminar.
- Los obstáculos que cruza la línea se levantan del terreno: los dibujados como barras, las plantas de Paisajismo como su copa, los muros como barras (vea [Controles de líneas eléctricas](topic:power-line-checks#clearances)). Los recorridos de cables y caños que cruza la línea se marcan bajo el terreno, en su parte superior, con su nombre.

- Arrastre un soporte de costado para moverlo a lo largo de la línea.
- Arrastre su parte superior hacia arriba o hacia abajo para fijar su altura sobre el terreno.
