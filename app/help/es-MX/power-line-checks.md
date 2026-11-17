---
title: Verificaciones de líneas eléctricas
summary: Lo que CivilCraft verifica en cada línea y cable, siempre actualizado: libranzas, separación entre fases, oscilación, levantamiento, cargas en apoyos y dimensionamiento, accesorios, retenidas, cimentaciones, datos faltantes, conexiones, sobrecargas y caída de tensión.
keywords: verificaciones, libranza, libranza sobre el terreno, obstáculo, cruce, separación entre fases, oscilación del aislador, levantamiento, carga en el apoyo, carga nominal, dimensionamiento, cimentación, retenida, tirante, accesorio, cruceta, caída de tensión, sobrecarga, datos faltantes, desconectado
from: e6a0da47
---

**Verificaciones** en la sección Líneas eléctricas enumera cada problema: en rojo lo que falla y en ámbar las advertencias. Haga clic en uno para seleccionar la línea, el apoyo, el cable o el equipo al que se refiere; los apoyos y vanos que fallan se marcan con un círculo rojo en la planta mientras el espacio de trabajo está abierto.

:::warning
Es una herramienta de diseño: estas son verificaciones de su diseño contra sus propias reglas, no una certificación.
:::

## Libranzas

La fase más baja del conductor se sigue a lo largo de cada vano en cada caso de carga. Su libranza mínima sobre el terreno debe alcanzar la **Regla de libranza** de la línea. Donde un vano cruza un **obstáculo** (dibujado con {{ui:Obstáculo}}: un punto o una línea, con su altura sobre el terreno y su propia regla de libranza), la libranza sobre la parte superior del obstáculo se verifica del mismo modo.

**Lo que el espacio de trabajo Paisajismo coloca sobre el terreno también cuenta.** Las plantas individuales (su copa con el ancho y la altura de madurez), los setos y los macizos de plantación (la especie más alta de ellos) y los muros (su parte superior) son obstáculos bajo una línea, sin necesidad de dibujarlos otra vez. Conservan las reglas definidas en {{ui:Casos de carga y límites…}}: **Plantas de paisajismo bajo una línea** (los conjuntos de ejemplo usan *Árboles y plantas*, 3 m) y **Muros de paisajismo bajo una línea** (*Edificio*). Elija **No verificar** para excluirlos. La libranza se mide en vertical desde la parte superior de la planta o del muro hasta el conductor en el punto donde el vano lo cruza; la distancia lateral a una copa al lado de la línea no se verifica. Mover un árbol o elevar un muro cambia las verificaciones de inmediato.

Sus reglas de libranza son propias: ábralas con **Reglas…** junto a cualquier **Regla de libranza** (o en {{ui:Casos de carga y límites…}}) para agregar, renombrar, cambiar o quitar reglas.

## Separación y oscilación

- **Separación entre fases** necesaria: k·√(flecha + longitud del aislador) + U/150, con la flecha del caso caliente y la tensión U en kV (una forma común; k es el de su conjunto de reglas). Se compara con la separación entre fases de la cruceta.
- **Oscilación del aislador** en apoyos de suspensión, bajo el caso de viento: atan(carga transversal ÷ carga vertical), contra la mayor oscilación del conjunto de reglas.
- **Levantamiento**: un apoyo de suspensión más bajo que sus vecinos puede ser levantado en frío; se marca.

## Cargas en apoyos y dimensionamiento

Para cada apoyo y cada caso de carga, con todos los conductores de la línea:

- **Transversal**: viento por metro × el vano de viento (la mitad de los dos vanos), más 2·H·sen(giro ÷ 2) en un cambio de dirección.
- **A lo largo de la línea**: la diferencia de las tensiones de los dos lados en un anclaje terminal o en un ángulo; en un apoyo de suspensión, solo bajo hielo en un lado (cada vano se calcula por separado, lo que queda del lado seguro).
- **Vertical**: la carga vertical por metro × el vano de peso (entre los puntos más bajos a cada lado) más el equipo.

La carga horizontal se lleva al punto nominal del apoyo (carga equivalente = carga × altura de sujeción ÷ altura del punto nominal) y se compara con su **carga nominal** × el factor del conjunto de reglas. Cuando es insuficiente, se sugiere el apoyo más pequeño del mismo material en su biblioteca que la soporte. Un apoyo con **retenida** transmite la carga horizontal a la retenida, que soporta carga ÷ sen(ángulo de la retenida) y se verifica contra su propia capacidad.

Los accesorios (abrazaderas, aisladores, crucetas) se verifican contra su carga nominal: un accesorio de anclaje soporta la tensión del conductor, y un accesorio de suspensión su parte de la carga vertical y transversal. La **cimentación** mostrada es la profundidad del apoyo en el terreno y un agujero algo más ancho que su pie.

## Datos, conexiones y corriente

- Un elemento con un campo necesario vacío, o una clave que no está en la biblioteca.
- Un extremo de una ruta de cable, o un equipo, conectado a nada.
- **Caída de tensión** y **corriente** desde cada fuente (equipo marcado como fuente) hasta las cargas (kW y factor de potencia en el equipo), a lo largo de vanos aéreos y cables: √3·I·L·(R cos φ + X sen φ), con R a 20 °C. Si supera la capacidad de corriente del cable, o la caída permitida por el conjunto de reglas, se marca.
