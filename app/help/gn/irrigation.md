---
title: Diseño de riego
summary: Una ayuda de cálculo, no un diseño sellado: aspersores, laterales, línea principal, válvulas y líneas de goteo en el sitio; zonas encontradas desde los caños; pérdida de presión por Hazen–Williams, el cabezal de peor caso, caudal y presión frente al suministro, tasas de precipitación, tiempos de riego, cobertura y una lista de materiales.
keywords: riego, aspersor, aspersores, aspersión, rotor, boquilla rotativa, burbujeador, goteo, línea de goteo, emisor, válvula, zona, estación, controlador, línea principal, lateral, punto de conexión, suministro de agua, presión, psi, kpa, caudal, gpm, pérdida por fricción, hazen williams, tasa de precipitación, tiempo de riego, cobertura, cabeza a cabeza, lista de materiales
from: 7d6342c1
---

:::warning
Esta es una ayuda de cálculo, no un diseño sellado: un diseñador de riego revisa cada resultado antes de construir nada.
:::

## Trazar el sistema

1. En la sección **Riego** a la izquierda, elige el **Aspersor**, su **Arco** y dónde empieza el arco, y los diámetros de caño para laterales y la línea principal.
2. {{ui:Irrigation}} › {{ui:Point of connection}}: haz clic donde se une el suministro de agua. Define su **presión**, el **caudal disponible** y la pérdida del medidor y del antirretorno en Propiedades.
3. {{ui:Irrigation}} › {{ui:Valve}}: haz clic donde va la válvula de cada zona. Una válvula inicia una zona.
4. {{ui:Irrigation}} › {{ui:Head}}: haz clic para colocar aspersores; cada clic coloca uno.
5. {{ui:Irrigation}} › {{ui:Lateral pipe}}: haz clic desde una válvula pasando por sus aspersores y presiona {{key:Enter}}. {{ui:Mainline}}: desde el punto de conexión hasta cada válvula.

Los extremos de los caños se ajustan a los aspersores, válvulas, el suministro y otros extremos de caños, así la red se une. Una zona es todo lo que se alcanza desde su válvula por los laterales; la línea principal lleva una zona a la vez.

## Goteo

{{ui:Irrigation}} › {{ui:Drip line}}: haz clic a lo largo de la línea, empezando donde se alimenta (un extremo de lateral o una válvula). Define el **caudal del emisor** y el **espaciado** en Propiedades; su caudal son los emisores a lo largo de ella.

## La verificación

{{ui:Irrigation}} › {{ui:Check the system…}} lista cada zona:

| Columna | Cómo se calcula |
|---|---|
| Caudal | Los caudales de los aspersores (y de las líneas de goteo) sumados |
| En la válvula | La presión de trabajo del aspersor de peor caso más las pérdidas de caño hasta él (Hazen–Williams, el diámetro interior del caño, el cambio de elevación) y la pérdida a través de la válvula |
| En el suministro | Lo mismo más la pérdida de la línea principal que lleva esa zona, y la pérdida del medidor y del antirretorno |
| Precipitación | El caudal de los aspersores sobre el área que riegan con espaciado cabeza a cabeza |
| Minutos por semana | Para aplicar el ajuste **Riego por semana** |
| Problemas | Velocidad por encima del límite, un aspersor fuera de su rango de presión, aspersiones y rotores en una válvula, presión o caudal insuficientes en el suministro, aspersores sin zona, bucles |

Selecciona una válvula para ver las cifras de su zona y su aspersor de peor caso marcado con un círculo en el plano. La lista de materiales cuenta los aspersores por tipo y arco, los caños por diámetro, las válvulas, la línea de goteo y los emisores, y las estaciones del controlador. **Guardar como CSV** conserva ambas.

Ajustes en la sección Riego: **Hazen–Williams C** (150 para caño plástico nuevo), el **caudal más rápido** en un caño (1,5 m/s), la **pérdida a través de una válvula**, y **riego por semana**. Están rotulados como valores predeterminados.

## Cobertura

{{ui:Irrigation}} › {{ui:Show coverage}} indica cuánta área dejan secas los aspersores, cuánta riegan dos o más, y qué aspersores no llegan a un vecino (espaciado cabeza a cabeza).

## Aspersores

Los aspersores listados son tipos **genéricos** escritos por CadCraft a partir de tasas de precipitación de diseño (aspersores fijos, boquillas rotativas, rotores de engranaje, burbujeadores, microaspersores, emisores), no productos de ningún fabricante. **Agregar aspersores desde un archivo…** lee los tuyos (una lista JSON con el alcance, el caudal o la tasa de precipitación de cada aspersor, y su rango de presión); se guardan con el proyecto. Los datos publicados de un fabricante se incluyen solo con el permiso registrado de ese fabricante.

Debajo de los aspersores genéricos, la lista tiene **aspersores típicos** (sus nombres terminan en "valores típicos"): tamaños de boquilla de aspersores fijos, boquillas rotativas y rotores de engranaje, microaspersores, burbujeadores y emisores, con un radio, un caudal y un rango de presión. CadCraft los calcula a partir de matemática publicada (la ecuación del orificio para el caudal, el escalado del alcance del chorro para el radio) y clases de caudal nominales, solo de fuentes abiertas; no se copia ninguna tabla de fabricante. Elige uno y el selector muestra su base y su licencia. Un proyecto que usa uno conserva el aspersor y su fuente en el archivo del proyecto. Son para planificación: verifica los datos propios del aspersor real antes de construir.
