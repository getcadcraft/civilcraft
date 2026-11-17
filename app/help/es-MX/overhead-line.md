---
title: Dibujar una línea aérea
summary: Coloque soportes en el plano, deje que CivilCraft determine el papel de cada soporte y los vanos entre amarres terminales, y mueva los soportes en el plano o en el perfil de la línea.
keywords: línea aérea, soporte, poste, vano, sección, amarre terminal, ángulo, suspensión, perfil, altura, cruceta, retenida, tensor
from: b8e5e272
---

## Dibújela

1. Tenga una superficie: el terreno bajo la línea proviene de ella ([Construir una superficie](topic:build-surface)). Un soporte sin terreno debajo aparece en **Verificaciones**; escriba su **Nivel del terreno** en Propiedades en su lugar.
2. Haga clic en {{ui:Línea}} en el grupo Líneas de energía, y haga clic en cada soporte en el plano.
3. Haga doble clic en el último, o pulse Enter.

La línea obtiene el conductor, el soporte y el equipo que usó por última vez en esta computadora (la primera vez, ejemplos de la biblioteca). Cámbielos en Propiedades.

## La línea en Propiedades

Seleccione la línea (haga clic en un vano) para definir su **Conductor**, **Conductores por circuito**, **Circuitos**, **Tensión**, la **Regla de libramiento** que debe mantener sobre el terreno, y el equipo **En cada soporte** (una cruceta, aisladores, herrajes). La tabla enumera sus **secciones** con el vano de regulación de cada una, la tensión de uso diario y el caso de carga que la gobierna.

## Soportes

Haga clic en un soporte para seleccionarlo. En Propiedades:

- **Soporte**: su elemento de biblioteca. Cuando es demasiado débil, {{ui:Usar …}} coloca el soporte más pequeño del mismo material en su biblioteca que soporta la carga.
- **Papel**: Automático, Suspensión, Ángulo o Amarre terminal. Automático significa: el primer y el último soporte son amarres terminales; un giro mayor que el ángulo de la regla establecida hace un soporte de ángulo; un giro mayor, un amarre terminal.
- **Altura sobre el terreno**: vacío la toma del elemento de biblioteca (su longitud menos la profundidad enterrada).
- **También en este soporte**: equipo adicional, como una **retenida** (tensor). Un soporte con retenida transfiere el tiro de la línea a su retenida.
- **Soporte existente**: se verifica como los demás, pero se excluye de las cantidades.

{{ui:Soporte}} agrega un soporte en el vano más cercano a su clic. Arrastre un soporte en el plano para moverlo. {{ui:Eliminar}} lo quita (una línea conserva al menos dos).

Las secciones van entre amarres terminales: dentro de una sección, el conductor corre libremente por las abrazaderas de suspensión, así que una sola tensión rige toda la sección.

## El perfil de la línea

Haga clic en {{ui:Perfil}} (o en **Perfil** en las Propiedades de la línea). El panel bajo el plano muestra el terreno a lo largo de la línea, cada soporte desde el terreno hasta su parte superior, la fase más baja del conductor en el **Caso de carga** que elija, y el libramiento que la línea debe mantener, como línea punteada. Un vano que falla se muestra en rojo; el número bajo cada vano es su libramiento más bajo.

- **Línea** elige la línea aérea a mostrar. Seleccionar otra línea, o uno de sus soportes, en el plano cambia el perfil a ella.
- Mueva el puntero sobre el perfil: una línea guía lo sigue, y la etiqueta indica la distancia a lo largo de la línea, el terreno, el conductor y el libramiento en ese punto (y avisa cuando el libramiento está por debajo de la regla de la línea).
- {{ui:Medir}} en la barra del perfil: haga clic en dos puntos para obtener la distancia horizontal, la diferencia de altura, la distancia recta y la pendiente entre ellos. Un clic cerca del terreno, del conductor o de la parte superior de un soporte se ajusta a ese punto. Haga clic de nuevo en {{ui:Medir}} para detenerse.
- Los obstáculos que cruza la línea se levantan desde el terreno: los trazados como barras, las plantas de Paisaje como su copa, y los muros como barras (vea [Verificaciones de líneas de energía](topic:power-line-checks#clearances)). Las rutas de cables y las tuberías que la línea cruza se marcan bajo el terreno, en su parte superior, con su nombre.

- Arrastre un soporte de lado para moverlo a lo largo de la línea.
- Arrastre su parte superior hacia arriba o hacia abajo para fijar su altura sobre el terreno.
