---
title: Perfiles de la lámina de agua de un río
summary: Modele un río a partir de la superficie del terreno y calcule perfiles estacionarios de la lámina de agua por el método del paso estándar: niveles de agua, energía, velocidades, números de Froude y la extensión de la inundación en la planta. Una función de laboratorio; todo resultado necesita la revisión de un ingeniero.
keywords: dique, área de flujo ineficaz, editor de secciones, río, hidráulica, perfil de la lámina de agua, remanso, paso estándar, flujo permanente, 1d, secciones transversales, Manning, rugosidad, capacidad de transporte, tirante crítico, tirante normal, Froude, línea de energía, extensión de la inundación, llanura de inundación, inundación, orillas, longitudes de tramo, contracción, expansión, subcrítico, supercrítico, régimen mixto, resalto hidráulico
from: fb8bf425
---

CivilCraft calcula perfiles de la lámina de agua estacionarios y unidimensionales a lo largo de un río: para cada caudal que indique, el nivel del agua en cada sección transversal, a partir del balance de energía entre secciones vecinas (el método del paso estándar). Está en el laboratorio mientras se comprueba.

**Solo ayuda al diseño.** Los niveles de agua necesitan la revisión de un ingeniero cualificado antes de que nadie se fíe de ellos: un modelo 1D solo es tan bueno como sus secciones, sus valores de rugosidad, sus longitudes de tramo y sus contornos, y no conoce puentes, alcantarillas ni el flujo que sale del río.

## Dibujar el río

1. Construya primero la superficie del terreno existente (puntos, líneas de rotura o una TIN que haya abierto).
2. En **Superficie** › {{ui:More}}, elija {{ui:River}}.
3. Haga clic a lo largo del eje del río **de aguas arriba a aguas abajo** y, después, pulse {{key:Enter}} o haga doble clic.

CivilCraft corta una sección perpendicular al eje cada 50 m (200 ft), con 100 m (300 ft) a cada lado, a partir del terreno. Las estaciones del río se miden desde el extremo aguas abajo, así que crecen aguas arriba. Las orillas se estiman inicialmente a 10 m (30 ft) a cada lado del punto más bajo de cada sección.

Para añadir una sección donde el río se estrecha o hay una obra, seleccione el río, haga clic en {{ui:Add a section}} y dibuje una línea de corte a través de él (en cualquier sentido: se gira para que vaya de izquierda a derecha mirando aguas abajo).

## Configurar el río

Seleccione el río para verlo en **Propiedades**:

- **Régimen de flujo**: subcrítico (lo habitual: se calcula aguas arriba desde el contorno de aguas abajo), supercrítico (se calcula aguas abajo desde el contorno de aguas arriba) o mixto (ambos, y después el de mayor fuerza específica en cada sección; una vista previa).
- **Perfiles de caudal**: un nombre y un caudal para cada uno (por ejemplo, una avenida de 10 años y otra de 100 años), y el contorno en el extremo aguas abajo (y en el extremo aguas arriba cuando el régimen no es subcrítico): **Tirante normal** con una pendiente de energía (la pendiente del lecho es una primera estimación), una **Cota de lámina de agua conocida** o **Tirante crítico**.
- **Secciones desde el terreno**: la separación, hasta dónde llegan a izquierda y a derecha, la estimación de las orillas y los dos valores de n de Manning. {{ui:Cut sections again}} sustituye las secciones (un paso de deshacer).
- **La tabla de secciones**: para cada sección, los desplazamientos de las orillas izquierda y derecha, la n del cauce y la n de la llanura de inundación, las longitudes de tramo hasta la siguiente sección aguas abajo (llanura izquierda, cauce, llanura derecha; medidas en planta para empezar) y los coeficientes de contracción y expansión (0.1 y 0.3 para empezar: transiciones graduales). {{ui:Edit}} abre el editor de secciones (siguiente apartado); un punto junto a él indica que la sección tiene un dique o un área ineficaz.

Cada cambio es un paso de deshacer ({{key:Mod+Z}}).

## Editar una sección: orillas, diques y áreas ineficaces

{{ui:Edit}} sobre una sección dibuja su terreno y le permite arrastrar lo que lee el solucionador: la **orilla izquierda y derecha** (dividen la sección en la llanura izquierda, el cauce principal y la llanura derecha), un **dique** a cada lado y **áreas de flujo ineficaces**. Cada control también puede moverse con las teclas de flecha, y cada número puede escribirse junto al gráfico. {{ui:Apply}} es un paso de deshacer.

- Un **dique** tiene una posición (desplazamiento) y una cota de coronación. El terreno más allá de él, alejado del río, queda aislado del río mientras la lámina de agua esté por debajo de la coronación: su área, su perímetro mojado y su capacidad de transporte se excluyen. Por encima de la coronación, toda la sección vuelve a contar. Un dique se sitúa fuera de la orilla que protege; si está dentro de las orillas, se marca.
- Un **área de flujo ineficaz** retiene agua pero no transporta caudal (una depresión detrás de un terraplén, agua muerta junto a la aproximación de un puente). Indique sus dos desplazamientos y, si quiere, una cota de agua por debajo de la cual es ineficaz ({{ui:always}} si está en blanco): por encima de ese nivel fluye como el resto. Si cubre parte del cauce principal, se marca.
- Entre dos secciones, la extensión de la inundación deja en seco el terreno detrás de un dique que tienen ambas secciones, mientras la lámina de agua está por debajo de la coronación (la línea entre las dos coronaciones es recta).

## Calcular y leer los resultados

Pulse {{ui:Water surface profiles}}. Para el perfil que elija obtendrá:

- un **gráfico** a lo largo del río (caudal de izquierda a derecha): fondo del cauce, orillas, lámina de agua, línea de energía y lámina de agua crítica; las secciones fijadas en tirante crítico se marcan con un círculo;
- una **tabla** por sección: estación del río, caudal, fondo del cauce, lámina de agua, lámina de agua crítica, línea de energía, calado, velocidad en el cauce y global, número de Froude del cauce, área de flujo, anchura superior, caudal en cada llanura y en el cauce, pendiente de energía y advertencias;
- **advertencias** en palabras sencillas, por ejemplo una sección fijada en tirante crítico, agua por encima de los extremos de una sección, o un gran cambio de capacidad de transporte entre dos secciones (añada secciones intermedias).

{{ui:Table (CSV)}}, {{ui:Report}} (texto plano con el método, los contornos y cada tabla) y {{ui:Plot (SVG)}} se guardan en su carpeta de descargas. Cada uno incluye la línea de revisión.

Marque {{ui:Show the flood extent}} en **Propiedades** para sombrear en la planta la zona mojada del perfil elegido, con la línea de agua trazada donde el calado es cero. Entre secciones, la lámina de agua es horizontal a través del río y cambia linealmente con la estación. El terreno detrás de un dique queda seco mientras el agua esté por debajo de su coronación. Otras zonas bajas dentro del corredor del río a las que el agua no puede llegar (por ejemplo, detrás de un terraplén de carretera) siguen sombreadas: compruébelas.

## En el dibujo y en Problemas

Las líneas del río pasan a la planta, al PDF y al DWG en sus propias capas: **C-WATR-CNTR** (el eje), **C-WATR-SCTN** (cada línea de corte, con su estación del río) y **C-WATR-FLOD** (la línea de agua de la extensión de la inundación, cuando se marca {{ui:Show the flood extent}} para un perfil). Las advertencias del río (una sección fijada en tirante crítico, agua por encima de los extremos de la sección, un cambio de capacidad de transporte que pide más secciones, un balance de energía que no cierra, un dique dentro de las orillas) también van al panel **Problemas**, referidas al río y situadas en la sección de la que proceden.

## Cómo se calcula

- Energía entre dos secciones: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Capacidad de transporte por subdivisión: cada llanura se divide donde cambia su n, K = Σ (1/n)·A·R^(2/3) (1.486/n en unidades US); el cauce es una sola parte, con una n compuesta cuando cambia su n. α sale de cómo se reparte la capacidad de transporte.
- Pendiente de fricción por capacidad media, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², sobre la longitud de tramo ponderada por caudal.
- Coeficiente de contracción cuando el flujo se acelera aguas abajo, de expansión cuando se frena.
- Tirante crítico = energía específica mínima. Cada nivel de agua se resuelve en un intervalo acotado, de modo que nunca salta al lado equivocado del crítico; cuando no existe solución, se fija en tirante crítico y se marca.

El programa se contrasta con el tirante normal de Manning, con el tirante crítico en un canal rectangular y con el ejemplo de remanso de Chow (*Open-Channel Hydraulics*, 1959, capítulo 10), integrado de forma independiente. El mismo método lo usan los programas habituales de ríos 1D, de modo que un cálculo a mano o los apuntes de un estudiante son trasladables.

## Alcantarillas y puentes

En las **Propiedades** del río, bajo **Alcantarillas y puentes**, {{ui:Add a culvert}} o {{ui:Add a bridge}} coloca una entre dos secciones (cada tramo conserva al menos dos). El perfil situado debajo no cambia; la lámina de agua justo aguas arriba de la obra procede de la estructura, y el perfil continúa aguas arriba desde allí. **Resultados** añade una tabla de cada estructura: el nivel aguas abajo, el nivel aguas arriba, qué control rige, el caudal a través de la abertura y el caudal por encima de la carretera o del tablero. Solo para flujo subcrítico.

- **Alcantarilla** (cajón o circular, uno o más conductos iguales). El control de entrada es flujo de vertedero mientras la entrada está libre, y flujo por orificio cuando queda ahogada, combinado entre una carga de aguas arriba de una y una vez y media la altura. El control de salida es el balance de energía: pérdida en la entrada, fricción y altura de velocidad a la salida, sobre el mayor entre el nivel aguas abajo y el punto medio del tirante crítico, y la clave, menos la caída a lo largo del conducto. La carga de aguas arriba es la mayor de las dos. Marque **El agua puede pasar por encima de la carretera** y el flujo de vertedero de la carretera comparte el caudal con los conductos.
- **Puente.** La abertura es la sección situada bajo el puente, cortada en los estribos, con cada pila como un área que no transporta caudal. La lámina de agua en la abertura procede de la sección inferior (coeficiente de expansión), y la de la sección superior, de la abertura (coeficiente de contracción). Si la abertura no puede dar paso al caudal con ese nivel aguas abajo, funciona en tirante crítico y el puente se marca como obstruido. Si el agua alcanza el cordón inferior, el flujo es a presión (tipo compuerta mientras el nivel aguas abajo esté por debajo del cordón inferior, ahogado por encima de él), y el agua sobre el tablero añade flujo de vertedero; el nivel de aguas arriba es aquel en el que la suma coincide con el caudal.

Los coeficientes (de descarga, de pérdida en la entrada, de vertedero) son valores por defecto redondos que puede modificar para su diseño. No son los gráficos ajustados que imprimen los manuales de diseño de alcantarillas, así que trate la carga de una alcantarilla cerca de su límite como una estimación. El agua sobre una carretera o un tablero, una entrada ahogada, una abertura obstruida y el flujo rápido en un conducto se muestran en **Problemas**.

## Flujo no permanente

{{ui:Unsteady flow…}} en las **Propiedades** del río hace circular un hidrograma de avenida por las secciones. Escriba el caudal de entrada como horas y caudales, un par por línea, la pendiente de aguas abajo (tirante normal) y cuánto tiempo debe correr. Parte de la lámina de agua permanente del primer caudal y resuelve las ecuaciones unidimensionales completas (el esquema implícito de cuatro puntos, ponderado 0.6 en el tiempo). Obtiene el nivel y el caudal máximos en cada sección, con la hora en que ocurre cada uno, un gráfico del caudal en los dos extremos y la comprobación de volumen (entrada, salida y variación almacenada). Se comprueba que el flujo permanente sigue siendo permanente, que un escalón en la entrada termina en el perfil permanente del nuevo caudal, que el volumen cierra y la velocidad de la onda de avenida frente a la onda cinemática. Flujo subcrítico, un solo tramo, sin aportaciones laterales, y sin alcantarillas ni puentes dentro de la simulación.

## Confluencias

Tramos que unen el flujo en una salida: los caudales se suman, y la lámina de agua en la cabecera del tramo aguas abajo se traslada hasta los extremos de los tramos que confluyen en él (la misma lámina de agua en la confluencia; el método simple: sin ángulo ni cantidad de movimiento, así que es adecuado para números de Froude bajos). El modelo y las pruebas están en su sitio (`river-structures.js`); un panel para unir dos ríos en la planta aún no está construido.

## Aún no disponible

Azudes y compuertas como estructuras propias, un panel para confluencias, estructuras dentro de una simulación no permanente y flujo supercrítico no permanente. Una simulación de régimen mixto marca un resalto hidráulico entre dos secciones, pero no lo sitúa.

**Dónde confluyen los ríos.** En las Propiedades de un río, «Desemboca en» indica el río al que se une. Los ríos que confluyen se resuelven juntos: el río en el que desembocan lleva la suma de sus caudales, y cada uno de ellos termina en la lámina de agua de la primera sección de ese río (el método de igual lámina de agua; omite el ángulo y la cantidad de movimiento de los caudales). Para unir un río principal y un arroyo, dibuje un tramo corto de río debajo de la confluencia y haga que ambos desemboquen en él. Los resultados muestran una tabla de confluencia. Los valores por defecto de estos resultados (contracción 0.1, expansión 0.3, cauce de una sola pieza con rugosidad compuesta, régimen mixto por fuerza específica) se mantienen hasta que un ingeniero los revise, y los Resultados lo indican.
