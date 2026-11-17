---
title: Diseño de riego
summary: Herramienta de cálculo, no un diseño visado: aspersores, ramales, tubería principal, válvulas y líneas de goteo en el terreno; zonas detectadas a partir de las tuberías; pérdida de presión por Hazen–Williams, aspersor más desfavorable, caudal y presión frente al suministro, pluviometría, tiempos de riego, cobertura y lista de materiales.
keywords: riego, aspersor, aspersores, difusor, rotor, boquilla rotativa, borboteador, goteo, línea de goteo, emisor, válvula, zona, estación, programador, tubería principal, ramal, punto de conexión, suministro de agua, presión, psi, kPa, caudal, gpm, pérdida por fricción, hazen williams, pluviometría, tiempo de riego, cobertura, cabeza a cabeza, lista de materiales
from: 7d6342c1
---

:::warning
Es una herramienta de cálculo, no un diseño visado: un diseñador de riego comprueba cada resultado antes de construir nada.
:::

## Trazar el sistema

1. En la sección **Riego** a la izquierda, elija el **Aspersor**, su **Arco** y dónde empieza el arco, y los diámetros de tubería para los ramales y la tubería principal.
2. {{ui:Irrigation}} › {{ui:Point of connection}}: haga clic donde se une el suministro de agua. Ajuste su **presión**, el **caudal disponible** y la pérdida del contador y del antirretorno en Propiedades.
3. {{ui:Irrigation}} › {{ui:Valve}}: haga clic donde va la válvula de cada zona. Una válvula inicia una zona.
4. {{ui:Irrigation}} › {{ui:Head}}: haga clic para colocar aspersores; cada clic coloca uno.
5. {{ui:Irrigation}} › {{ui:Lateral pipe}}: haga clic desde una válvula pasando por sus aspersores y pulse {{key:Enter}}. {{ui:Mainline}}: desde el punto de conexión hasta cada válvula.

Los extremos de tubería se ajustan a aspersores, válvulas, el suministro y otros extremos de tubería, de modo que la red queda unida. Una zona es todo lo que se alcanza desde su válvula a lo largo de los ramales; la tubería principal transporta una zona cada vez.

## Goteo

{{ui:Irrigation}} › {{ui:Drip line}}: haga clic a lo largo de la línea, empezando donde se alimenta (un extremo de ramal o una válvula). Ajuste el **caudal del emisor** y la **separación** en Propiedades; su caudal es la suma de los emisores que lleva.

## La comprobación

{{ui:Irrigation}} › {{ui:Check the system…}} enumera cada zona:

| Columna | Cómo se calcula |
|---|---|
| Caudal | La suma de los caudales de los aspersores (y de las líneas de goteo) |
| En la válvula | La presión de trabajo del aspersor más desfavorable más las pérdidas en la tubería hasta él (Hazen–Williams, diámetro interior de la tubería, diferencia de cota) y la pérdida en la válvula |
| En el suministro | Lo mismo más la pérdida de la tubería principal que transporta esa zona, y la pérdida del contador y del antirretorno |
| Pluviometría | El caudal de los aspersores dividido por el área que riegan con separación cabeza a cabeza |
| Minutos a la semana | Para aplicar el ajuste **Agua a la semana** |
| Problemas | Velocidad por encima del límite, un aspersor fuera de su rango de presión, difusores y rotores en una misma válvula, presión o caudal insuficientes en el suministro, aspersores sin zona, bucles |

Seleccione una válvula para ver las cifras de su zona y su aspersor más desfavorable, rodeado en el plano. La lista de materiales cuenta los aspersores por tipo y arco, la tubería por diámetro, las válvulas, la línea de goteo y los emisores, y las estaciones del programador. **Guardar como CSV** conserva ambas.

Los ajustes de la sección Riego son: **Hazen–Williams C** (150 para tubería de plástico nueva), la **velocidad máxima** del agua en una tubería (1.5 m/s), la **pérdida en una válvula** y **agua a la semana**. Son valores predeterminados señalados como tales.

## Cobertura

{{ui:Irrigation}} › {{ui:Show coverage}} indica qué parte del área dejan seca los aspersores, qué parte reciben dos o más, y qué aspersores no alcanzan a un vecino (separación cabeza a cabeza).

## Aspersores

Los aspersores listados son tipos **genéricos** que CadCraft ha escrito a partir de pluviometrías de diseño (aspersores fijos, boquillas rotativas, rotores de engranajes, borboteadores, microaspersores, emisores), no productos de ningún fabricante. **Añadir aspersores desde un archivo…** lee los suyos propios (una lista JSON con el alcance, el caudal o la pluviometría de cada aspersor y su rango de presión); se guardan con el proyecto. Los datos publicados de un fabricante solo se incluyen con el permiso registrado de ese fabricante.

Debajo de los aspersores genéricos, la lista contiene **aspersores típicos** (sus nombres terminan en «valores típicos»): tamaños de boquilla de aspersores fijos, boquillas rotativas y rotores de engranajes, microaspersores, borboteadores y emisores, con un radio, un caudal y un rango de presión. CadCraft los calcula a partir de fórmulas publicadas (la ecuación del orificio para el caudal, el escalado del alcance del chorro para el radio) y de clases nominales de caudal, solo a partir de fuentes abiertas; no se copia ninguna tabla de fabricante. Elija uno y el selector muestra su base y su licencia. Un proyecto que lo use conserva el aspersor y su fuente en el archivo del proyecto. Son para planificar: compruebe los datos propios del aspersor real antes de construir.
