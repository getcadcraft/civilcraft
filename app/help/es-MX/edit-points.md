---
title: Editar un punto topográfico
summary: Cambie el número, las coordenadas, la elevación o la descripción de un punto, o arrástrelo a un nuevo lugar en la planta.
keywords: editar punto, mover punto, cambiar elevación, renumerar, número de punto, descripción, arrastrar, norte, este, fijar un punto, toma errónea
from: 375ae2e9
---

Una toma errónea, una altura de estadal equivocada o una descripción mal escrita: corrija el punto y la superficie se ajusta.

## Cambiar los valores de un punto

1. Con {{ui:Seleccionar}}, haga clic en el punto de la planta. **Propiedades** muestra su número, este, norte, elevación y descripción en cuadros.
2. Escriba el nuevo valor y pulse {{key:Enter}} (o haga clic fuera). Deje vacía **Elevación** en un punto sin elevación.
3. La superficie, las curvas de nivel y todo lo construido sobre ellas se actualizan de inmediato.

Cada cambio es un solo paso: {{key:Mod+Z}} lo deshace y {{key:Mod+Y}} lo rehace. Un valor que CivilCraft no puede usar (un número que ya tiene otro punto, letras en una coordenada) se rechaza: el cuadro se resalta con un borde y la barra de estado indica el motivo.

Un nuevo código de descripción crea un nuevo grupo de puntos, como lo hace una importación (vea [Crear una superficie](topic:build-surface)).

## Mover un punto en la planta

1. Seleccione el punto (aparece un anillo).
2. Arrastre el anillo. La barra de estado muestra el este y el norte donde quedará.
3. Suelte para mover el punto; su elevación se mantiene. Pulse {{key:Esc}} antes de soltar para devolverlo a su lugar.

## Las líneas de ruptura siguen al punto

Una línea de ruptura dibujada con la herramienta {{ui:Línea de ruptura}} copia los puntos por los que pasa. Al mover un punto o cambiar su elevación, los vértices de la línea de ruptura en ese punto se mueven con él, en el mismo paso. Los grupos de líneas de ruptura creados a partir de descripciones siempre se reconstruyen a partir de los puntos.

:::note
Una superficie leída de un archivo LandXML conserva sus propios triángulos: las ediciones de puntos solo la cambian después de {{ui:Reconstruir la superficie a partir de los puntos}}.
:::
