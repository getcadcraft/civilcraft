---
title: Perfiles de la superficie del agua en ríos
summary: Modele un río a partir de la superficie del terreno y calcule perfiles permanentes de la superficie del agua por el método del paso estándar: niveles de agua, energía, velocidades, números de Froude y la zona inundada en la planta. Función experimental; cada resultado requiere la revisión de un ingeniero.
keywords: bordo, área de flujo inefectiva, editor de secciones, río, hidráulica, perfil de la superficie del agua, remanso, paso estándar, flujo permanente, 1d, secciones transversales, manning, rugosidad, capacidad de conducción, tirante crítico, tirante normal, froude, línea de energía, zona inundada, llanura de inundación, inundación, márgenes, longitud de tramos, contracción, expansión, subcrítico, supercrítico, régimen mixto, resalto hidráulico
from: fb8bf425
---

CivilCraft calcula perfiles permanentes y unidimensionales de la superficie del agua a lo largo de un río: para cada gasto que indique, el nivel del agua en cada sección transversal, a partir del balance de energía entre secciones vecinas (el método del paso estándar). La función está en fase experimental mientras se verifica.

**Solo como apoyo de diseño.** Los niveles de agua requieren la revisión de un ingeniero calificado antes de que alguien los use: un modelo 1D es tan bueno como sus secciones, valores de rugosidad, longitudes de tramo y fronteras, y no conoce puentes, alcantarillas ni el flujo que sale del río.

## Dibujar el río

1. Construya primero la superficie del terreno existente (puntos, líneas de quiebre o una TIN que haya abierto).
2. En **Superficie** › {{ui:Más}}, elija {{ui:River}}.
3. Haga clic a lo largo del eje del río **de aguas arriba a aguas abajo**, luego pulse {{key:Enter}} o haga doble clic.

CivilCraft traza una sección perpendicular al eje cada 50 m (200 ft), con 100 m (300 ft) hacia cada lado, a partir del terreno. Las estaciones del río se miden desde el extremo aguas abajo, así que crecen hacia aguas arriba. Los márgenes empiezan como una suposición de 10 m (30 ft) a cada lado del punto más bajo de cada sección.

Para agregar una sección donde el río se estrecha o donde hay una estructura, seleccione el río, haga clic en {{ui:Agregar una sección}} y dibuje una línea de corte a través de él (en cualquier sentido: se gira para que vaya de izquierda a derecha mirando aguas abajo).

## Configurar el río

Seleccione el río para verlo en **Propiedades**:

- **Régimen de flujo**: subcrítico (lo habitual: se calcula aguas arriba desde la frontera de aguas abajo), supercrítico (se calcula aguas abajo desde la frontera de aguas arriba) o mixto (ambos, y luego el que tenga mayor fuerza específica en cada sección; una vista previa).
- **Perfiles de flujo**: un nombre y un gasto para cada uno (por ejemplo, uno de 10 años y otro de 100 años), y la frontera en el extremo de aguas abajo (y en el de aguas arriba cuando el régimen no es subcrítico): **Tirante normal** con una pendiente de energía (la pendiente del lecho es una primera estimación), una **Elevación de superficie de agua conocida**, o **Tirante crítico**.
- **Secciones desde el terreno**: el espaciado, cuánto se extiende a izquierda y derecha, la suposición de margen y los dos valores de n de Manning; {{ui:Cortar las secciones de nuevo}} reemplaza las secciones (un paso de deshacer).
- **La tabla de secciones**: para cada sección, los desfases de margen izquierdo y derecho, el n del cauce y el n de la llanura, las longitudes de tramo hasta la siguiente sección aguas abajo (llanura izquierda, cauce, llanura derecha; medidas en la planta para empezar) y los coeficientes de contracción y expansión (0.1 y 0.3 para empezar: transiciones graduales). {{ui:Edición}} abre el editor de secciones (siguiente); un punto después indica que la sección tiene un bordo o un área inefectiva.

Cada cambio es un paso de deshacer ({{key:Mod+Z}}).

## Editar una sección: márgenes, bordos y áreas inefectivas

{{ui:Edición}} en una sección dibuja su terreno y le permite arrastrar lo que lee el solucionador: el **margen izquierdo y derecho** (dividen la sección en la llanura izquierda, el cauce principal y la llanura derecha), un **bordo** en cualquiera de los lados y **áreas de flujo inefectivas**. Cada controlador también puede moverse con las teclas de flecha, y cada número puede escribirse junto a la gráfica. {{ui:Aplicar}} es un paso de deshacer.

- Un **bordo** tiene una posición (desfase) y una elevación de corona. El terreno más allá de él, alejado del río, queda aislado del río mientras la superficie del agua esté por debajo de la corona: su área, perímetro mojado y capacidad de conducción se excluyen. Por encima de la corona, toda la sección vuelve a contar. Un bordo se levanta fuera del margen que protege; si está dentro de los márgenes, se marca.
- Un **área de flujo inefectiva** retiene agua pero no transporta flujo (un bolsón detrás de un terraplén, agua muerta junto a la aproximación a un puente). Indique sus dos desfases y, si lo desea, un nivel de agua por debajo del cual es inefectiva ({{ui:siempre}} si queda en blanco): por encima de ese nivel fluye como el resto. Si cubre parte del cauce principal, se marca.
- Entre dos secciones, la zona inundada deja seco el terreno detrás de un bordo que tienen ambas secciones, mientras la superficie del agua allí esté por debajo de la corona (la línea entre las dos coronas es recta).

## Calcular y leer los resultados

Haga clic en {{ui:Perfiles de la superficie del agua}}. Para el perfil que elija obtiene:

- una **gráfica** a lo largo del río (flujo de izquierda a derecha): fondo del cauce, márgenes, superficie del agua, línea de energía y superficie crítica del agua; las secciones con tirante crítico se encierran en un círculo;
- una **tabla** por sección: estación del río, gasto, fondo del cauce, superficie del agua, superficie crítica del agua, línea de energía, tirante, velocidad en el cauce y en total, el número de Froude del cauce, área de flujo, ancho superficial, el gasto en cada llanura y en el cauce, la pendiente de energía, y las advertencias;
- **advertencias** en palabras sencillas, por ejemplo una sección con tirante crítico, agua por encima de los extremos de una sección, o un cambio grande de capacidad de conducción entre dos secciones (agregue secciones intermedias).

{{ui:Tabla (CSV)}}, {{ui:Informe}} (texto plano con el método, las fronteras y cada tabla) y {{ui:Gráfica (SVG)}} se guardan en sus descargas. Cada uno incluye la línea de revisión.

Marque {{ui:Mostrar la zona inundada}} en **Propiedades** para sombrear el área mojada en la planta para el perfil elegido, con la línea de agua trazada donde el tirante es cero. Entre secciones, la superficie del agua es horizontal a través del río y cambia linealmente con la estación. El terreno detrás de un bordo queda seco mientras el agua esté bajo su corona. Otras zonas bajas dentro del corredor del río a las que el agua no puede llegar (detrás de un terraplén de carretera, por ejemplo) igual se sombrean: revíselas.

## En el dibujo y en Problemas

Las líneas del río pasan a la planta, al PDF y al DWG en sus propias capas: **C-WATR-CNTR** (el eje), **C-WATR-SCTN** (cada línea de corte, con su estación del río) y **C-WATR-FLOD** (la línea de agua de la zona inundada, cuando {{ui:Mostrar la zona inundada}} está marcado para un perfil). Las advertencias del río (una sección con tirante crítico, agua por encima de los extremos de una sección, un cambio de capacidad de conducción que pide más secciones, un balance de energía que no cerró, un bordo dentro de los márgenes) también van al panel **Problemas**, referidas al río y ubicadas en la sección de la que proceden.

## Cómo se calcula

- Energía entre dos secciones: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Capacidad de conducción por subdivisión: cada llanura se divide donde cambia su n, K = Σ (1/n)·A·R^(2/3) (1.486/n en unidades de EE. UU.); el cauce es una sola pieza, con un n compuesto cuando cambia su n. El α sale de cómo se reparte la capacidad de conducción.
- Pendiente de fricción por capacidad de conducción promedio, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², sobre la longitud del tramo ponderada por el gasto.
- Coeficiente de contracción cuando el flujo se acelera aguas abajo, y de expansión cuando se frena.
- Tirante crítico = mínima energía específica. Cada nivel de agua se resuelve en un intervalo acotado, así que nunca salta al lado equivocado del crítico; cuando no existe respuesta, se fija en tirante crítico y se marca.

El programa se verifica contra el tirante normal de Manning, el tirante crítico en un canal rectangular, y el ejemplo de remanso de Chow (*Open-Channel Hydraulics*, 1959, capítulo 10), integrado de forma independiente. El mismo método usan los programas comunes de ríos 1D, así que un cálculo a mano o los apuntes de un estudiante son compatibles.

## Alcantarillas y puentes

En las **Propiedades** del río, bajo **Alcantarillas y puentes**, {{ui:Agregar una alcantarilla}} o {{ui:Agregar un puente}} coloca una estructura entre dos secciones (cada tramo conserva al menos dos). El perfil bajo ella no cambia; la superficie del agua justo aguas arriba proviene de la estructura, y el perfil continúa aguas arriba desde allí. **Resultados** agrega una tabla de cada estructura: nivel de aguas abajo, nivel de aguas arriba, qué control domina, el gasto a través de la abertura y el gasto sobre el camino o la losa. Solo flujo subcrítico.

- **Alcantarilla** (cajón o circular, uno o más conductos iguales). El control de entrada es flujo de vertedor mientras la entrada está libre, y flujo de orificio cuando se ahoga, combinados entre un nivel de aguas arriba de una y una vez y media la altura. El control de salida es el balance de energía: pérdida en la entrada, fricción y carga de velocidad a la salida, sobre el mayor entre el nivel de aguas abajo y el punto medio del tirante crítico y la clave, menos la caída a lo largo del conducto. El nivel de aguas arriba es el mayor de los dos. Marque **El agua puede pasar sobre el camino** y el flujo de vertedor del camino comparte el gasto con los conductos.
- **Puente.** La abertura es la sección bajo el puente, cortada en los estribos, con cada pila como un área que no transporta flujo. La superficie del agua en la abertura proviene de la sección de abajo (coeficiente de expansión), y la sección de arriba, de la abertura (coeficiente de contracción). Si la abertura no puede pasar el gasto con ese nivel de aguas abajo, funciona a tirante crítico y el puente se marca como obstruido. Si el agua llega a la cuerda inferior, el flujo es a presión (tipo compuerta mientras el nivel de aguas abajo esté por debajo de la cuerda inferior, ahogado por encima de ella), y el agua sobre la losa suma flujo de vertedor; el nivel de aguas arriba es aquel en el que todos suman el gasto.

Los coeficientes (descarga, pérdida de entrada, vertedor) son valores redondos predeterminados. Cámbielos para su diseño. No son las gráficas ajustadas que imprimen los manuales de diseño de alcantarillas, así que trate el nivel de aguas arriba de una alcantarilla cerca de su límite como una estimación. El agua sobre un camino o una losa, una entrada ahogada, una abertura obstruida y el flujo rápido en un conducto se muestran en **Problemas**.

## Flujo no permanente

{{ui:Flujo no permanente…}} en las **Propiedades** del río encamina un hidrograma de avenida a lo largo de las secciones. Escriba el caudal de entrada como horas y gastos, un par por línea, la pendiente de aguas abajo (tirante normal) y cuánto tiempo correr. Parte de la superficie permanente del agua en el primer gasto y resuelve las ecuaciones unidimensionales completas (el esquema implícito de cuatro puntos, con peso 0.6 en el tiempo). Obtiene el nivel y el gasto máximos del agua en cada sección con la hora en que ocurre cada uno, una gráfica del gasto en los dos extremos, y la verificación de volumen (entra, sale y el cambio almacenado). Se verifica que el flujo permanente siga siendo permanente, que un escalón en el caudal de entrada termine en el perfil permanente del nuevo gasto, que el volumen cierre, y la velocidad de la onda de avenida contra la onda cinemática. Solo flujo subcrítico, un tramo, sin aportes laterales, y sin alcantarillas ni puentes dentro de la corrida.

## Confluencias

Tramos que unen el flujo en una sola salida: los gastos se suman, y la superficie del agua en la cabeza del tramo de aguas abajo se lleva hasta los extremos de los tramos que se le unen (la misma superficie del agua en la confluencia, el método simple: sin ángulo, sin cantidad de movimiento, así que sirve para números de Froude bajos). El modelo y las pruebas están en su lugar (`river-structures.js`); un panel para unir dos ríos en la planta todavía no está construido.

## Sin construir todavía

Vertedores y compuertas como estructuras propias, un panel para confluencias, estructuras dentro de una corrida no permanente, y flujo supercrítico no permanente. Una corrida de régimen mixto marca un resalto hidráulico entre dos secciones, pero no lo ubica.

**Dónde se unen los ríos.** En las Propiedades de un río, "Desemboca en" nombra el río al que se une. Los ríos que se unen se resuelven juntos: el río en el que desembocan lleva la suma de sus gastos, y cada uno termina en la superficie del agua de la primera sección de ese río (el método de igual superficie del agua; omite el ángulo y la cantidad de movimiento de los flujos). Para unir un río principal y un arroyo, dibuje un río corto debajo de la confluencia y haga que ambos desemboquen en él. Los resultados muestran una tabla de confluencia. Los valores predeterminados de estos resultados (contracción 0.1, expansión 0.3, cauce de una pieza con rugosidad compuesta, régimen mixto por fuerza específica) se mantienen hasta que un ingeniero los revise, y los Resultados lo indican.
