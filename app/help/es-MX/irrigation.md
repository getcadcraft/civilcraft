---
title: Diseño de riego
summary: Herramienta de cálculo, no un diseño sellado: aspersores, ramales, línea principal, válvulas y líneas de goteo en el sitio; zonas detectadas a partir de las tuberías; pérdida de presión por Hazen–Williams, el aspersor de peor caso, caudal y presión frente al suministro, tasas de precipitación, tiempos de riego, cobertura y lista de materiales.
keywords: riego, aspersor, aspersores, rociador, rotor, boquilla rotatoria, burbujeador, goteo, línea de goteo, emisor, válvula, zona, estación, controlador, línea principal, ramal, punto de conexión, suministro de agua, presión, psi, kpa, caudal, gpm, pérdida por fricción, hazen williams, tasa de precipitación, tiempo de riego, cobertura, aspersor a aspersor, lista de materiales
from: 7d6342c1
---

:::warning
Esta es una herramienta de cálculo, no un diseño sellado: un diseñador de riego verifica cada resultado antes de construir algo.
:::

## Trazar el sistema

1. En la sección **Riego** a la izquierda, elija el **Aspersor**, su **Arco** y el punto donde empieza el arco, y los diámetros de tubería para los ramales y la línea principal.
2. {{ui:Riego}} › {{ui:Punto de conexión}}: haga clic donde se une el suministro de agua. Configure su **presión**, el **caudal disponible** y la pérdida del medidor y del antirretorno en Propiedades.
3. {{ui:Riego}} › {{ui:Válvula}}: haga clic donde va la válvula de cada zona. Una válvula inicia una zona.
4. {{ui:Riego}} › {{ui:Aspersor}}: haga clic para colocar aspersores; cada clic coloca uno.
5. {{ui:Riego}} › {{ui:Tubería lateral}}: haga clic desde una válvula, pasando por sus aspersores, y pulse {{key:Enter}}. {{ui:Línea principal}}: desde el punto de conexión hasta cada válvula.

Los extremos de tubería se ajustan a aspersores, válvulas, el suministro y otros extremos de tubería, así la red se une. Una zona es todo lo que se alcanza desde su válvula a lo largo de los ramales; la línea principal lleva una zona a la vez.

## Goteo

{{ui:Riego}} › {{ui:Línea de goteo}}: haga clic a lo largo de la línea, empezando donde recibe el agua (un extremo de ramal o una válvula). Configure el **caudal del emisor** y el **espaciado** en Propiedades; su caudal es el de los emisores a lo largo de ella.

## La verificación

{{ui:Riego}} › {{ui:Revisar el sistema…}} enumera cada zona:

| Columna | Cómo se calcula |
|---|---|
| Caudal | La suma de los caudales de los aspersores (y de las líneas de goteo) |
| En la válvula | La presión de trabajo del aspersor de peor caso más las pérdidas de tubería hasta él (Hazen–Williams, el diámetro interior de la tubería, el cambio de elevación) y la pérdida a través de la válvula |
| En el suministro | Lo mismo, más la pérdida de la línea principal que lleva esa zona, y la pérdida del medidor y del antirretorno |
| Precipitación | El caudal de los aspersores sobre el área que riegan, con espaciado aspersor a aspersor |
| Minutos por semana | Para aplicar la configuración **Riego por semana** |
| Problemas | Velocidad por encima del límite, un aspersor fuera de su rango de presión, aspersores y rotores en una misma válvula, presión o caudal insuficientes en el suministro, aspersores sin zona, bucles |

Seleccione una válvula para ver las cifras de su zona y su aspersor de peor caso marcado en el plano. La lista de materiales cuenta los aspersores por tipo y arco, las tuberías por diámetro, las válvulas, las líneas de goteo y emisores, y las estaciones del controlador. **Guardar como CSV** conserva ambas.

Configuración en la sección Riego: **Hazen–Williams C** (150 para tubería plástica nueva), la **velocidad máxima** del flujo en una tubería (1.5 m/s), la **pérdida a través de una válvula** y **Riego por semana**. Son valores predeterminados rotulados.

## Cobertura

{{ui:Riego}} › {{ui:Mostrar cobertura}} indica qué parte del área los aspersores dejan seca, qué parte reciben dos o más aspersores, y qué aspersores no alcanzan a un vecino (espaciado aspersor a aspersor).

## Aspersores

Los aspersores listados son tipos **genéricos** escritos por CadCraft a partir de tasas de precipitación de diseño (aspersores fijos, boquillas rotatorias, rotores de engranes, burbujeadores, microaspersores, goteros), no productos de ningún fabricante. **Agregar aspersores desde un archivo…** lee sus propios aspersores (una lista JSON con el alcance, el caudal o la tasa de precipitación de cada aspersor, y su rango de presión); se guardan con el proyecto. Los datos publicados de un fabricante solo se incluyen con el permiso registrado de ese fabricante.

Debajo de los aspersores genéricos, la lista tiene **aspersores típicos** (sus nombres terminan en "valores típicos"): tamaños de boquilla de aspersores fijos, boquillas rotatorias y rotores de engranes, microaspersores, burbujeadores y goteros, con un radio, un caudal y un rango de presión. CadCraft los calcula a partir de fórmulas publicadas (la ecuación del orificio para el caudal, el escalado del alcance del chorro para el radio) y de clases de caudal nominales, solo a partir de fuentes abiertas; no se copió ninguna tabla de fabricante. Elija uno y el selector muestra su base y su licencia. Un proyecto que lo usa conserva el aspersor y su fuente en el archivo del proyecto. Son para planificación: verifique los datos propios del aspersor real antes de construir.
