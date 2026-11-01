---
title: Perfiles de la superficie del agua de un río
summary: Modele un río a partir de la superficie del terreno y calcule perfiles de la superficie del agua en flujo permanente por el método del paso estándar: niveles de agua, energía, velocidades, números de Froude y la zona inundada en el plano. Una función del laboratorio; todo resultado necesita la revisión de un ingeniero.
keywords: diques, áreas de flujo inefectivas, editor de secciones, río, hidráulica, perfil de la superficie del agua, remanso, paso estándar, flujo permanente, 1d, secciones transversales, manning, rugosidad, capacidad de conducción, tirante crítico, tirante normal, froude, línea de energía, zona inundada, planicie de inundación, márgenes, longitudes de tramo, contracción, expansión, subcrítico, supercrítico, régimen mixto, salto hidráulico
from: a665898f
---

CivilCraft calcula perfiles de la superficie del agua de un río en flujo permanente y unidimensional: para cada caudal que usted da, el nivel del agua en cada sección transversal, a partir del balance de energía entre secciones vecinas (el método del paso estándar). Está en el laboratorio mientras se revisa.

**Solo una ayuda de diseño.** Los niveles de agua necesitan la revisión de un ingeniero calificado antes de que alguien dependa de ellos: un modelo 1D vale lo que valen sus secciones, sus valores de rugosidad, sus longitudes de tramo y sus condiciones de frontera, y no conoce puentes, alcantarillas ni flujo que sale del río.

## Dibuje el río

1. Cree primero el terreno existente (puntos, líneas de quiebre o un TIN que haya abierto).
2. En **Superficie** › **Más**, elija **Río**.
3. Haga clic a lo largo del eje del río **de aguas arriba hacia aguas abajo** y pulse {{key:Enter}} o haga doble clic.

CivilCraft corta del terreno una sección perpendicular al eje cada 50 m (200 ft), con 100 m (300 ft) a cada lado. Las estaciones del río se miden desde el extremo de aguas abajo, de modo que crecen hacia aguas arriba. Las márgenes empiezan como una estimación de 10 m (30 ft) a cada lado del punto más bajo de cada sección.

Para agregar una sección donde el río se estrecha o hay una estructura, seleccione el río, haga clic en **Agregar una sección** y dibuje una línea de corte que lo cruce (en cualquier sentido: se gira para que corra de izquierda a derecha mirando aguas abajo).

## Configure el río

Seleccione el río para verlo en **Propiedades**:

- **Régimen de flujo**: subcrítico (el caso usual: se calcula hacia aguas arriba desde la frontera de aguas abajo), supercrítico (se calcula hacia aguas abajo desde la frontera de aguas arriba) o mixto (ambos, y en cada sección el que tenga mayor fuerza específica; una vista previa).
- **Perfiles de flujo**: un nombre y un caudal para cada uno (por ejemplo un caudal a 10 años y otro a 100 años), y la frontera en el extremo de aguas abajo (y en el de aguas arriba cuando el régimen no es subcrítico): **Tirante normal** con una pendiente de energía (la pendiente del fondo es una primera estimación), una **Superficie de agua conocida** o **Tirante crítico**.
- **Secciones desde el terreno**: la separación, hasta dónde a la izquierda y a la derecha, la estimación de las márgenes y los dos valores de n de Manning; **Cortar las secciones de nuevo** reemplaza las secciones (un solo paso de deshacer).
- **La tabla de secciones**: para cada sección, las distancias de las márgenes izquierda y derecha, la n del cauce y la n de las llanuras, las longitudes de tramo hasta la siguiente sección hacia aguas abajo (llanura izquierda, cauce, llanura derecha; medidas en el plano al comienzo) y los coeficientes de contracción y expansión (0.1 y 0.3 al comienzo: transiciones graduales). **Editar** abre el editor de secciones (siguiente); un punto después indica que la sección tiene un dique o un área inefectiva.

Cada cambio es un paso de deshacer ({{key:Mod+Z}}).

## Edite una sección: márgenes, diques y áreas inefectivas

**Editar** en una sección dibuja su terreno y deja arrastrar lo que lee el programa: la **margen izquierda y la derecha** (dividen la sección en llanura izquierda, cauce principal y llanura derecha), un **dique** a cada lado y **áreas de flujo inefectivas**. Cada control también se mueve con las teclas de flecha, y cada número se puede escribir junto a la gráfica. **Aplicar** es un solo paso de deshacer.

- Un **dique** tiene un lugar (distancia) y una elevación de corona. El terreno detrás de él, lejos del río, queda aislado del río mientras la superficie del agua esté por debajo de la corona: su área, su perímetro mojado y su capacidad de conducción se dejan fuera. Por encima de la corona la sección vuelve a contar completa. Un dique va fuera de la margen que protege; uno dentro de las márgenes se señala.
- Un **área de flujo inefectiva** guarda agua pero no conduce flujo (una bolsa detrás de un terraplén, agua muerta junto al acceso de un puente). Dé sus dos distancias y, si quiere, un nivel de agua por debajo del cual es inefectiva (**siempre** si se deja en blanco): por encima de ese nivel fluye como el resto. Una que cubre parte del cauce principal se señala.
- Entre dos secciones, la zona inundada deja seco el terreno detrás de un dique que ambas secciones tienen, mientras la superficie del agua ahí esté por debajo de la corona (la línea entre las dos coronas es recta).

## Calcule y lea los resultados

Haga clic en **Perfiles de la superficie del agua**. Para el perfil que elija obtiene:

- una **gráfica** a lo largo del río (el flujo va de izquierda a derecha): fondo del cauce, márgenes, superficie del agua, línea de energía y superficie crítica del agua; las secciones fijadas en tirante crítico van marcadas con un círculo;
- una **tabla** por sección: estación del río, caudal, fondo del cauce, superficie del agua, superficie crítica del agua, línea de energía, tirante, velocidad en el cauce y total, número de Froude del cauce, área de flujo, ancho superior, el flujo en cada llanura y en el cauce, la pendiente de energía y advertencias;
- **advertencias** en palabras sencillas, por ejemplo una sección fijada en tirante crítico, agua por encima de los extremos de una sección, o un gran cambio de capacidad de conducción entre dos secciones (agregue secciones intermedias).

**Tabla (CSV)**, **Informe** (texto sencillo con el método, las fronteras y cada tabla) y **Gráfica (SVG)** se guardan en sus descargas. Cada uno lleva la línea de revisión.

Marque **Mostrar la zona inundada** en **Propiedades** para sombrear en el plano el área mojada del perfil elegido, con la línea de agua dibujada donde el tirante es cero. Entre secciones la superficie del agua es horizontal a lo ancho del río y cambia linealmente con la estación. El terreno detrás de un dique se deja seco mientras el agua esté bajo su corona. Otro terreno bajo dentro del corredor del río al que el agua no puede llegar (detrás de un terraplén de camino, por ejemplo) se sombrea de todos modos: revíselo.

## En el dibujo y en Problemas

Las líneas del río van al plano, al PDF y al DWG en sus propias capas: **C-WATR-CNTR** (el eje), **C-WATR-SCTN** (cada línea de corte, con su estación) y **C-WATR-FLOD** (la línea de agua de la zona inundada, cuando **Mostrar la zona inundada** está marcado para un perfil). Las advertencias del río (una sección fijada en tirante crítico, agua por encima de los extremos de la sección, un cambio de capacidad de conducción que pide más secciones, un balance de energía que no cerró, un dique dentro de las márgenes) también van al panel **Problemas**, sobre el río y ubicadas en la sección de donde vienen.

## Cómo se calcula

- Energía entre dos secciones: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Capacidad de conducción por subdivisión: cada llanura se divide donde cambia su n, K = Σ (1/n)·A·R^(2/3) (1.486/n en unidades de EE. UU.); el cauce es una sola pieza, con una n compuesta cuando su n cambia. α sale de cómo se reparte la capacidad de conducción.
- Pendiente de fricción por capacidad de conducción promedio, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², sobre la longitud de tramo ponderada por el flujo.
- Coeficiente de contracción cuando el flujo se acelera hacia aguas abajo, de expansión cuando se frena.
- Tirante crítico = energía específica mínima. Cada nivel de agua se resuelve sobre un intervalo, así que nunca salta al lado equivocado del crítico; cuando no hay respuesta se fija en tirante crítico y se señala.

El programa se verifica con el tirante normal de Manning, el tirante crítico en un canal rectangular y el ejemplo de remanso de Chow (*Open-Channel Hydraulics*, 1959, capítulo 10) integrado de forma independiente. El mismo método lo usan los programas comunes de ríos 1D, así que un cálculo a mano o los apuntes de un estudiante se pueden comparar.

## Aún no construido

Puentes y alcantarillas, vertederos, uniones de varios tramos y flujo no permanente. Una corrida de régimen mixto señala un salto hidráulico entre dos secciones pero no lo ubica.
