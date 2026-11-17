---
title: Editar un punto topográfico
summary: Cambie el número, las coordenadas, la cota o la descripción de un punto, o arrástrelo a un nuevo lugar de la planta.
keywords: editar punto, mover punto, cambiar cota, renumerar, número de punto, descripción, arrastrar, norte, este, corregir punto, toma errónea
from: 375ae2e9
---

Una toma errónea, una altura de mira equivocada o una descripción mal escrita: corrija el punto, y la superficie se actualiza.

## Cambiar los valores de un punto

1. Con {{ui:Seleccionar}}, haga clic en el punto de la planta. **Propiedades** muestra su número, este, norte, cota y descripción en casillas.
2. Escriba el valor nuevo y pulse {{key:Enter}} (o haga clic fuera). Deje vacía **Cota** para un punto sin cota.
3. La superficie, las curvas de nivel y todo lo construido a partir de ellas se actualizan a la vez.

Cada cambio es un solo paso: {{key:Mod+Z}} lo deshace y {{key:Mod+Y}} lo rehace. Un valor que CivilCraft no puede usar (un número que ya tiene otro punto, letras en una coordenada) se rechaza: la casilla se marca con un contorno y la barra de estado indica el motivo.

Una nueva descripción de código crea un nuevo grupo de puntos, como lo hace una importación (véase [Crear una superficie](topic:build-surface)).

## Mover un punto en la planta

1. Seleccione el punto (se le añade un anillo).
2. Arrastre el anillo. La barra de estado muestra la coordenada este y norte a la que irá.
3. Suelte para moverlo; su cota no cambia. Pulse {{key:Esc}} antes de soltar para devolverlo a su sitio.

## Las líneas de ruptura siguen al punto

Una línea de ruptura dibujada con la herramienta {{ui:Línea de ruptura}} copia los puntos por los que pasa. Cuando mueve un punto o cambia su cota, los vértices de la línea de ruptura situados en él se mueven con él, en el mismo paso. Los grupos de líneas de ruptura creados a partir de descripciones siempre se reconstruyen a partir de los puntos.

:::note
Una superficie leída de un archivo LandXML conserva sus propios triángulos: las ediciones de puntos solo la cambian después de {{ui:Reconstruir la superficie a partir de los puntos}}.
:::
