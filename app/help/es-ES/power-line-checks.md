---
title: Comprobaciones de líneas eléctricas
summary: Lo que CivilCraft comprueba en cada línea y cable, siempre actualizado: distancias libres, separaciones, oscilación, arranque, cargas en apoyos y dimensionado, herrajes, tirantes, cimentaciones, datos que faltan, conexiones, sobrecargas y caída de tensión.
keywords: comprobaciones, distancia libre, obstáculo, cruce, separación entre fases, oscilación, arranque, carga en apoyo, carga nominal, dimensionado, cimentación, tirante, herraje, cruceta, caída de tensión, sobrecarga, datos que faltan, desconectado
from: e6a0da47
---

**Comprobaciones** en la sección Líneas eléctricas enumera todos los problemas: en rojo lo que falla y en ámbar las advertencias. Pulse uno para seleccionar la línea, el apoyo, el cable o el equipo al que se refiere; los apoyos y vanos que fallan se marcan con un círculo rojo en el plano mientras el espacio de trabajo está abierto.

:::warning
Una ayuda de diseño: estas son comprobaciones de su diseño según sus propias reglas, no una certificación.
:::

## Distancias libres

La fase más baja del conductor se sigue a lo largo de cada vano en cada hipótesis de carga. Su distancia libre mínima sobre el terreno debe alcanzar la **Regla de distancia libre** de la línea. Donde un vano cruza un **obstáculo** (dibujado con {{ui:Obstáculo}}: un punto o una línea, con su altura sobre el terreno y su propia regla de distancia libre), la distancia libre sobre la parte superior del obstáculo se comprueba del mismo modo.

**Lo que el espacio de trabajo Paisajismo sitúa sobre el terreno también cuenta.** Las plantas aisladas (su copa con la extensión y la altura adultas), los setos y los macizos de plantación (la especie más alta de ellos) y los muros (su coronación) son obstáculos bajo una línea, sin necesidad de volver a dibujarlos. Mantienen las reglas definidas en {{ui:Hipótesis de carga y límites…}}: **Plantas de paisajismo bajo una línea** (los conjuntos de ejemplo usan *Árboles y plantas*, 3 m) y **Muros de paisajismo bajo una línea** (*Edificio*); elija **No comprobar** para excluirlos. La distancia libre se mide en vertical desde la parte superior de la planta o del muro hasta el conductor allí donde el vano lo cruza; no se comprueba la distancia horizontal a una copa al lado de la línea. Mover un árbol o elevar un muro cambia las comprobaciones de inmediato.

Sus reglas de distancia libre son propias: ábralas con **Reglas…** junto a cualquier **Regla de distancia libre** (o en {{ui:Hipótesis de carga y límites…}}) para añadir, renombrar, cambiar o eliminar.

## Separación y oscilación

- **Separación entre fases** necesaria: k·√(flecha + longitud del aislador) + U/150, con la flecha de la hipótesis de temperatura máxima y la tensión U en kV (una forma habitual; k es la de su juego de reglas). Se compara con la separación entre fases de la cruceta.
- **Oscilación del aislador** en apoyos de suspensión, bajo la hipótesis de viento: atan(carga transversal ÷ carga vertical), frente a la oscilación máxima del juego de reglas.
- **Arranque**: un apoyo de suspensión más bajo que sus vecinos puede levantarse con el frío; se marca.

## Cargas en apoyos y dimensionado

Para cada apoyo y cada hipótesis de carga, con todos los conductores de la línea:

- **Transversal**: viento por metro × vano de viento (la mitad de la suma de los dos vanos), más 2·H·sen(giro ÷ 2) en un cambio de dirección.
- **A lo largo de la línea**: la diferencia de tensiones de ambos lados en un amarre o un ángulo; en un apoyo de suspensión, solo con hielo en un lado (cada vano se calcula por separado, lo que queda del lado de la seguridad).
- **Vertical**: la carga vertical por metro × el vano de peso (entre los puntos más bajos a cada lado) más el equipo.

La carga horizontal se lleva al punto nominal del apoyo (carga equivalente = carga × altura de fijación ÷ altura del punto nominal) y se compara con su **carga nominal** × el factor del juego de reglas. Cuando es insuficiente, se sugiere el apoyo más pequeño del mismo material de su biblioteca que la soporte. Un apoyo con **tirante** transmite la carga horizontal al tirante, que soporta carga ÷ sen(ángulo del tirante) y se comprueba frente a su propia capacidad.

Los herrajes (grapas, aisladores, crucetas) se comprueban frente a su carga nominal: un herraje de anclaje soporta la tensión del conductor, y uno de suspensión su parte de la carga vertical y transversal. La **cimentación** que se muestra es la profundidad del apoyo en el terreno y un hoyo algo más ancho que su base.

## Datos, conexiones e intensidad

- Un elemento con un campo necesario vacío, o una clave que no está en la biblioteca.
- Un extremo de una ruta de cable, o un equipo, sin conectar a nada.
- **Caída de tensión** e **intensidad** desde cada fuente (equipo marcado como fuente) hasta las cargas (kW y factor de potencia en el equipo), a lo largo de vanos aéreos y cables: √3·I·L·(R cos φ + X sen φ), con R a 20 °C. Si supera la intensidad admisible del cable, o la caída máxima que permite el juego de reglas, se marca.
