---
title: Verificaciones de líneas eléctricas
summary: Lo que CivilCraft verifica en cada línea y cable, siempre al día: despejes, separaciones, balanceo, levantamiento, cargas de soporte y dimensionado, accesorios, vientos, cimientos, datos faltantes, conexiones, sobrecargas y caída de tensión.
keywords: verificaciones, despeje, despeje sobre el terreno, obstáculo, cruce, separación de fases, balanceo de aislador, levantamiento, carga de soporte, carga nominal, dimensionado, cimiento, viento, tensor, accesorio, cruceta, caída de tensión, sobrecarga, datos faltantes, desconectado
from: e6a0da47
---

**Verificaciones** en la sección Líneas eléctricas lista cada problema: rojo lo que falla y ámbar las advertencias. Haz click en uno para seleccionar la línea, soporte, cable o equipo al que se refiere; soportes y tramos que fallan se marcan con rojo en el plano mientras el espacio de trabajo esté abierto.

:::warning
Es una ayuda de diseño: son verificaciones de tu diseño según tus propias reglas, no una certificación.
:::

## Despejes

La fase más baja del conductor se sigue a lo largo de cada tramo y en cada hipótesis de carga. Su despeje mínimo sobre el terreno debe alcanzar la **Regla de despeje** de la línea. Donde un tramo cruza un **obstáculo** (dibujado con {{ui:Obstáculo}}: un punto o una línea, con su altura sobre el terreno y su propia regla de despeje), el despeje sobre la parte superior del obstáculo se verifica de la misma manera.

**Lo que el espacio de trabajo Paisaje pone sobre el terreno también cuenta.** Plantas individuales (su copa con su tamaño adulto y altura), setos y canteros (la especie más alta de ellos) y muros (su parte superior) son obstáculos bajo una línea, sin necesidad de dibujarlos otra vez. Mantienen las reglas definidas en {{ui:Hipótesis de carga y límites…}}: **Plantas del paisaje bajo una línea** (los conjuntos de ejemplo usan *Árboles y plantas*, 3 m) y **Muros del paisaje bajo una línea** (*Edificio*); elige **Sin verificar** para dejarlos fuera. El despeje se mide en vertical desde la parte superior de la planta o muro hasta el conductor donde el tramo la cruza; la distancia lateral a una copa al lado de la línea no se verifica. Mover un árbol o subir un muro cambia las verificaciones al instante.

Tus reglas de despeje son tuyas: ábrelas con **Reglas…** junto a cualquier **Regla de despeje** (o en {{ui:Hipótesis de carga y límites…}}) para agregar, renombrar, cambiar o quitar.

## Separación y balanceo

- **Separación de fases** necesaria: k·√(flecha + longitud de aislador) + U/150, con la flecha del caso caliente y la tensión U en kV (una forma común; k es el de tu conjunto de reglas). Se compara con la separación de fases de la cruceta.
- **Balanceo de aislador** en soportes de suspensión, bajo el caso de viento: atan(carga transversal ÷ carga vertical), contra el balanceo máximo del conjunto de reglas.
- **Levantamiento**: un soporte de suspensión más bajo que sus vecinos puede ser levantado en frío; se marca.

## Cargas de soporte y dimensionado

Para cada soporte y cada hipótesis de carga, con todos los conductores de la línea:

- **Transversal**: viento por metro × vano de viento (mitad de los dos tramos), más 2·H·sen(giro ÷ 2) en un ángulo.
- **A lo largo de la línea**: la diferencia de tensiones de los dos lados en un fin de línea o ángulo; en un soporte de suspensión solo bajo hielo en un lado (cada tramo trabajado por separado, lo que queda del lado seguro).
- **Vertical**: la carga vertical por metro × vano de peso (entre los puntos más bajos de cada lado) más el equipo.

La carga horizontal se lleva al punto nominal del soporte (carga equivalente = carga × altura de fijación ÷ altura del punto nominal) y se compara con su **carga nominal** × el factor del conjunto de reglas. Si es demasiado débil, se sugiere el soporte más pequeño del mismo material en tu biblioteca que la soporte. Un soporte con **vientos** pasa la carga horizontal a los vientos, que soportan carga ÷ sen(ángulo del viento) y se verifican contra su propia capacidad.

Los accesorios (abrazaderas, aisladores, crucetas) se verifican contra su carga nominal: un accesorio de anclaje soporta la tensión del conductor, un accesorio de suspensión su parte de la carga vertical y transversal. El **cimiento** que se muestra es la profundidad del soporte en el terreno y un agujero algo más ancho que su base.

## Datos, conexiones y corriente

- Un elemento con un campo necesario vacío, o una clave que no está en la biblioteca.
- Un extremo de ruta de cable, o un equipo, conectado a nada.
- **Caída de tensión** y **corriente** desde cada fuente (equipo marcado como fuente) hasta las cargas (kW y factor de potencia en el equipo), a lo largo de tramos aéreos y cables: √3·I·L·(R cos φ + X sen φ), con R a 20 °C. Si supera la corriente nominal del cable, o la caída que permite el conjunto de reglas, se marca.
