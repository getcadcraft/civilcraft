---
title: Perfiles de la superficie del agua en río
summary: Modelar un río a partir de la superficie del terreno y calcular perfiles de la superficie del agua en régimen permanente por el método del paso estándar: niveles de agua, energía, velocidades, números de Froude y la extensión de la inundación en el plano. Función de laboratorio; cada resultado necesita la revisión de un ingeniero.
keywords: dique, área de flujo ineficaz, editor de secciones, río, hidráulica, perfil de la superficie del agua, remanso, paso estándar, flujo permanente, 1d, secciones transversales, manning, rugosidad, conveyance, profundidad crítica, profundidad normal, froude, línea de energía, extensión de la inundación, llanura de inundación, inundación, márgenes, longitudes de tramo, contracción, expansión, subcrítico, supercrítico, régimen mixto, resalto hidráulico
from: fb8bf425
---

CivilCraft calcula perfiles de la superficie del agua unidimensionales, en régimen permanente, a lo largo de un río: para cada caudal que indiques, el nivel de agua en cada sección transversal, a partir del balance de energía entre secciones vecinas (el método del paso estándar). Está en laboratorio mientras se verifica.

**Solo ayuda de diseño.** Los niveles de agua necesitan la revisión de un ingeniero calificado antes de que alguien los use: un modelo 1D vale lo que valgan sus secciones, sus valores de rugosidad, sus longitudes de tramo y sus contornos, y no conoce puentes, alcantarillas ni el caudal que sale del río.

## Dibujar el río

1. Construí primero la superficie del terreno existente (puntos, líneas de quiebre o una TIN que hayas abierto).
2. En **Superficie** › {{ui:Más}}, elegí {{ui:Río}}.
3. Hacé clic a lo largo del eje del río **desde aguas arriba hacia aguas abajo**, y después presioná {{key:Enter}} o hacé doble clic.

CivilCraft corta una sección perpendicular al eje cada 50 m (200 ft), con 100 m (300 ft) hacia cada lado, a partir del terreno. Las estaciones del río se miden desde el extremo de aguas abajo, así que crecen hacia aguas arriba. Las márgenes empiezan como una estimación de 10 m (30 ft) a cada lado del punto más bajo de cada sección.

Para agregar una sección donde el río se angosta o hay una estructura, seleccioná el río, hacé clic en {{ui:Agregar una sección}} y dibujá una línea de corte a través de él (en cualquier sentido: se gira para que vaya de izquierda a derecha mirando aguas abajo).

## Configurar el río

Seleccioná el río para verlo en **Propiedades**:

- **Régimen de flujo**: subcrítico (lo habitual: se calcula aguas arriba desde el contorno de aguas abajo), supercrítico (se calcula aguas abajo desde el contorno de aguas arriba) o mixto (ambos, y después el que tenga mayor fuerza específica en cada sección; una vista previa).
- **Perfiles de caudal**: un nombre y un caudal para cada uno (por ejemplo un caudal de 10 años y otro de 100 años), y el contorno en el extremo de aguas abajo (y en el de aguas arriba cuando el régimen no es subcrítico): **Profundidad normal** con una pendiente de energía (la pendiente del lecho es una primera estimación), una **Superficie de agua conocida** en cota, o **Profundidad crítica**.
- **Secciones a partir del terreno**: la separación, cuánto se extienden a izquierda y derecha, la estimación de margen y los dos valores de n de Manning; {{ui:Volver a cortar las secciones}} reemplaza las secciones (un paso de deshacer).
- **La tabla de secciones**: para cada sección, los desplazamientos de margen izquierdo y derecho, la n del cauce y la n de la llanura de inundación, las longitudes de tramo hasta la sección siguiente aguas abajo (llanura izquierda, cauce, llanura derecha; medidas desde el plano para empezar) y los coeficientes de contracción y expansión (0,1 y 0,3 para empezar: transiciones graduales). {{ui:Editar}} abre el editor de secciones (siguiente); un punto después indica que la sección tiene un dique o un área ineficaz.

Cada cambio es un paso de deshacer ({{key:Mod+Z}}).

## Editar una sección: márgenes, diques y áreas ineficaces

{{ui:Editar}} sobre una sección dibuja su terreno y te deja arrastrar lo que lee el solucionador: el **margen izquierdo y derecho** (dividen la sección en la llanura izquierda, el cauce principal y la llanura derecha), un **dique** a cualquiera de los lados y **áreas de flujo ineficaces**. Cada manija también puede moverse con las teclas de flecha, y cada número puede escribirse al lado del gráfico. {{ui:Aplicar}} es un paso de deshacer.

- Un **dique** tiene una posición (desplazamiento) y una cota de coronamiento. El terreno más allá de él, lejos del río, queda separado del río mientras la superficie del agua esté por debajo del coronamiento: su área, su perímetro mojado y su conveyance se excluyen. Por encima del coronamiento, toda la sección vuelve a contar. Un dique queda por fuera del margen que protege; uno dentro de los márgenes se marca.
- Un **área de flujo ineficaz** retiene agua pero no lleva caudal (un bolsón detrás de un terraplén, agua muerta junto a la aproximación de un puente). Dale sus dos desplazamientos y, si querés, un nivel de agua por debajo del cual es ineficaz ({{ui:siempre}} si queda en blanco): por encima de ese nivel corre como el resto. Una que cubre parte del cauce principal se marca.
- Entre dos secciones, la extensión de la inundación deja seco el terreno detrás de un dique que comparten ambas secciones, mientras la superficie del agua allí esté por debajo del coronamiento (la línea entre los dos coronamientos es recta).

## Calcular y leer los resultados

Hacé clic en {{ui:Perfiles de la superficie del agua}}. Para el perfil que elijas obtenés:

- un **gráfico** a lo largo del río (caudal de izquierda a derecha): fondo del cauce, márgenes, superficie del agua, línea de energía y superficie de agua crítica; las secciones con profundidad crítica se marcan con un círculo;
- una **tabla** por sección: estación del río, caudal, fondo del cauce, superficie del agua, superficie de agua crítica, línea de energía, profundidad, velocidad en el cauce y total, el número de Froude del cauce, área de flujo, ancho superior, el caudal en cada llanura y en el cauce, la pendiente de energía y las advertencias;
- **advertencias** en palabras simples, por ejemplo una sección fijada en profundidad crítica, agua por encima de los extremos de una sección, o un gran cambio de conveyance entre dos secciones (agregá secciones intermedias).

{{ui:Tabla (CSV)}}, {{ui:Informe}} (texto simple con el método, los contornos y cada tabla) y {{ui:Gráfico (SVG)}} se guardan en tus descargas. Cada uno lleva la línea de revisión.

Marcá {{ui:Mostrar la extensión de la inundación}} en **Propiedades** para sombrear en el plano el área mojada del perfil elegido, con la línea de agua dibujada donde la profundidad es cero. Entre secciones la superficie del agua es horizontal a través del río y cambia linealmente con la estación. El terreno detrás de un dique queda seco mientras el agua esté por debajo de su coronamiento. Otros terrenos bajos dentro del corredor del río que el agua no puede alcanzar (detrás de un terraplén de camino, por ejemplo) igual se sombrean: revisalos.

## En el plano y en Problemas

Las líneas del río van al plano, al PDF y al DWG en sus propias capas: **C-WATR-CNTR** (el eje), **C-WATR-SCTN** (cada línea de corte, con su estación del río) y **C-WATR-FLOD** (la línea de agua de la extensión de la inundación, cuando {{ui:Mostrar la extensión de la inundación}} está marcado para un perfil). Las advertencias del río (una sección fijada en profundidad crítica, agua por encima de los extremos de las secciones, un cambio de conveyance que pide más secciones, un balance de energía que no cerró, un dique dentro de los márgenes) también van al panel de **Problemas**, sobre el río y ubicadas en la sección de la que provienen.

## Cómo se calcula

- Energía entre dos secciones: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Conveyance por subdivisión: cada llanura se parte donde cambia su n, K = Σ (1/n)·A·R^(2/3) (1,486/n en unidades de EE. UU.); el cauce es una sola pieza, con una n compuesta cuando cambia su n. α sale de cómo se reparte la conveyance.
- Pendiente de fricción por conveyance promedio, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², sobre la longitud del tramo ponderada por caudal.
- Coeficiente de contracción cuando el flujo se acelera aguas abajo, de expansión cuando se frena.
- Profundidad crítica = mínima energía específica. Cada nivel de agua se resuelve en un intervalo cerrado, así que nunca salta al lado equivocado de la crítica; cuando no hay respuesta se fija en profundidad crítica y se marca.

El programa se verifica contra la profundidad normal de Manning, la profundidad crítica en un canal rectangular, y el ejemplo de remanso de Chow (*Open-Channel Hydraulics*, 1959, capítulo 10), integrado de forma independiente. El mismo método lo usan los programas comunes de río 1D, así que un cálculo a mano o los apuntes de un estudiante se trasladan sin problema.

## Alcantarillas y puentes

En las **Propiedades** del río, bajo **Alcantarillas y puentes**, {{ui:Agregar una alcantarilla}} o {{ui:Agregar un puente}} colocan una entre dos secciones (cada tramo conserva al menos dos). El perfil debajo no cambia; la superficie del agua justo aguas arriba viene de la estructura, y el perfil sigue aguas arriba desde allí. **Resultados** agrega una tabla de cada estructura: nivel de aguas abajo, nivel de aguas arriba, qué control gobierna, el caudal por la abertura y el caudal por encima de la calzada o del tablero. Solo flujo subcrítico.

- **Alcantarilla** (cajón o redonda, una o más celdas iguales). El control de entrada es flujo de vertedero mientras la entrada está libre, y flujo de orificio una vez que queda ahogada, mezclados entre una carga de aguas arriba de una y una y media veces la altura. El control de salida es el balance de energía: pérdida de entrada, fricción y carga de velocidad de salida, sobre el mayor entre el nivel de aguas abajo y la mitad de la profundidad crítica y la clave, menos la caída a lo largo de la celda. El nivel de aguas arriba es el mayor de los dos. Marcá **El agua puede pasar sobre la calzada** y el flujo de vertedero de la calzada comparte el caudal con las celdas.
- **Puente.** La abertura es la sección debajo del puente, cortada en los estribos, con cada pilar como un área que no lleva caudal. La superficie del agua en la abertura sale de la sección de abajo (coeficiente de expansión), y la sección de arriba sale de la abertura (coeficiente de contracción). Si la abertura no puede pasar el caudal con ese nivel de aguas abajo, corre en profundidad crítica y el puente se marca como obstruido. Si el agua llega a la viga inferior, el flujo es de presión (tipo compuerta mientras el nivel de aguas abajo está por debajo de la viga inferior, ahogado por encima), y el agua sobre el tablero agrega flujo de vertedero; el nivel de aguas arriba es aquel en el que todo suma el caudal.

Los coeficientes (descarga, pérdida de entrada, vertedero) son valores por defecto redondos que escribís vos. Cambialos para tu diseño. No son los gráficos ajustados que imprimen los manuales de diseño de alcantarillas, así que tratá el nivel de aguas arriba de una alcantarilla cerca de su límite como una estimación. El agua sobre una calzada o un tablero, una entrada ahogada, una abertura obstruida y el flujo rápido en una celda se muestran en **Problemas**.

## Flujo no permanente

{{ui:Flujo no permanente…}} en las **Propiedades** del río envía un hidrograma de crecida a lo largo de las secciones. Escribí el ingreso como horas y caudales, un par por línea, la pendiente de aguas abajo (profundidad normal) y cuánto tiempo correr. Arranca desde la superficie de agua permanente del primer caudal y resuelve las ecuaciones completas unidimensionales (el esquema implícito de cuatro puntos, con peso 0,6 en el tiempo). Obtenés el nivel y el caudal máximos en cada sección con la hora en que ocurre cada uno, un gráfico del caudal en los dos extremos, y la verificación de volumen (entrada, salida y el cambio almacenado). Se verifica que un flujo permanente siga permanente, que un escalón en el ingreso termine en el perfil permanente del nuevo caudal, que el volumen cierre, y la velocidad de la onda de crecida contra la onda cinemática. Flujo subcrítico, un solo tramo, sin aporte lateral, y sin alcantarillas ni puentes dentro de la corrida.

## Confluencias

Tramos que unen el flujo en una sola salida: los caudales se suman, y la superficie del agua en el inicio del tramo de aguas abajo se lleva hacia arriba hasta los extremos de los tramos que se unen a él (la misma superficie de agua en la confluencia, el método simple: sin ángulo, sin cantidad de movimiento, así que sirve para números de Froude bajos). El modelo y las pruebas están listos (`river-structures.js`); un panel para unir dos ríos en el plano todavía no está construido.

## Todavía no construido

Vertederos y compuertas como estructuras propias, un panel para confluencias, estructuras dentro de una corrida no permanente, y flujo no permanente supercrítico. Una corrida de régimen mixto marca un resalto hidráulico entre dos secciones, pero no lo ubica.

**Donde se unen los ríos.** En las Propiedades de un río, "Desemboca en" nombra el río en el que desemboca. Los ríos que se unen se resuelven juntos: el río en el que desembocan lleva la suma de sus caudales, y cada uno termina en la superficie de agua de la primera sección de ese río (el método de igual superficie de agua; deja de lado el ángulo y la cantidad de movimiento de los caudales). Para unir un río principal y un arroyo, dibujá un río corto debajo de la confluencia y hacé que ambos desemboquen en él. Los resultados muestran una tabla de confluencia. Los valores por defecto de estos resultados (contracción 0,1, expansión 0,3, cauce de una sola pieza con rugosidad compuesta, el régimen mixto por fuerza específica) se mantienen hasta que un ingeniero los revise, y los Resultados lo dicen.
