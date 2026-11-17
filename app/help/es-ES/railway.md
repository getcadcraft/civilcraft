---
title: Diseñar una vía férrea
summary: Convierta un trazado en una vía férrea: transiciones de carril (clotoide, parábola cúbica, Bloss, Helmert, semionda sinusoidal, sinusoide), peralte en cada curva con su peralte de equilibrio, insuficiencia y exceso de peralte, límites de peralte y de geometría de vía como avisos, aparatos de vía y travesías por estación, una envolvente de gálibo recorrida a lo largo de la línea y una vía con carriles, traviesas y un lecho de balasto construida como el corredor, en planta, secciones, perfil, 3D y mediciones.
keywords: ferrocarril, carril, vía férrea, vía, tren, metro, tranvía, peralte, sobreelevación, insuficiencia de peralte, exceso de peralte, peralte de equilibrio, transición, curva de transición, clotoide, parábola cúbica, bloss, helmert, semionda sinusoidal, coseno, ancho de vía, ancho estándar, ancho superior, ancho métrico, ancho estrecho, traviesa, balasto, subbalasto, plataforma, berma, entreeje de vía, 60E1, 54E1, UIC60, 115RE, 136RE, gradiente de peralte, variación del peralte, aparato de vía, aguja, cambio, travesía de vías, corazón, número de corazón, lanzamiento, curva de cierre, velocidad en desvío, gálibo, envolvente de gálibo, gálibo de carga, envolvente cinemática, andén, separación al andén, separación de vías, pendiente, curva vertical, radio mínimo, peralte LandXML
from: 99de9745
---

Cualquier trazado puede ser una vía férrea. Sus curvas reciben entonces transiciones de carril y un peralte (la sobreelevación de los carriles), y su corredor se construye como una vía: carriles sobre traviesas, sobre un lecho de balasto, nivelado en el terreno como una carretera. Los aparatos de vía y las travesías se colocan por estación, y se puede desplazar una envolvente de gálibo a lo largo de la vía y comprobarla frente a lo que se encuentra junto a ella.

Todos los valores de esta página son **valores provisionales**, no normas. Los ferrocarriles fijan sus límites según la velocidad de línea, el tipo de vía y el país; establézcalos a partir de la norma de su propio ferrocarril. CivilCraft no incluye ninguna tabla nacional.

## Convertir el trazado en ferrocarril

1. Seleccione el trazado y busque **Vía férrea** en Propiedades.
2. Marque **Este trazado es una vía férrea**. Cada cambio es un paso de deshacer.
3. Establezca la **Velocidad de proyecto** en la parte superior de las Propiedades del trazado: es la velocidad de línea con la que se comprueba el peralte. **Trenes más lentos** (en el bloque Vía férrea) es la velocidad con la que se comprueba el exceso de peralte.

## Transiciones

Indique una longitud de espiral en cada extremo de la curva en la tabla de PI (**Espiral de entrada**, **Espiral de salida**), y después elija su tipo en la tabla de curvas del bloque Vía férrea, o **Transición en cada curva**:

| Tipo | Curvatura a lo largo de la transición |
|---|---|
| Clotoide | crece de forma uniforme (la espiral de carretera) |
| Parábola cúbica | y = x³ / (6·R·L), con L medida a lo largo de la tangente; la curva en sí es algo más larga |
| Bloss | 3u² − 2u³ de la curvatura total (u = la parte de la longitud): empieza y termina suavemente |
| Helmert | dos parábolas, 2u² y después 1 − 2(1 − u)² |
| Semionda sinusoidal | (1 − cos πu) / 2 |
| Sinusoide | u − sen(2πu) / 2π |

Todos excepto la parábola cúbica giran L / 2R, como la clotoide. Las estaciones se miden a lo largo de la longitud real. LandXML conserva el tipo (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Peralte

Escriba el **Peralte** de cada curva en milímetros. La tabla muestra para cada curva:

- **Peralte de equilibrio** = G·v² / (g·R), siendo G la distancia entre los ejes de los carriles (**Entreeje de carriles**, el ancho de vía más el ancho de la cabeza del carril, salvo que lo escriba). Con G = 1500 mm, esto es la conocida fórmula 11.8·V² / R (V en km/h, R en m).
- **Insuficiencia** = peralte de equilibrio a la velocidad de línea − peralte aplicado.
- **Exceso** = peralte aplicado − peralte de equilibrio a la velocidad de los trenes más lentos.
- **Rampa**: la pendiente de peralte más fuerte a lo largo de sus rampas, en milímetros por metro.

El peralte aumenta a lo largo de cada transición, con la forma de su curvatura: recto para una clotoide o una parábola cúbica, con forma de Bloss para Bloss, etc. Un extremo de curva sin transición se peralta en el tramo recto anterior, con la longitud que exija el límite de gradiente de peralte, y lo indica: el peralte cambia entonces donde no cambia la curvatura.

**El peralte gira alrededor de** indica qué carril se mantiene sobre el perfil de proyecto: **el carril bajo** (lo habitual), **el carril interior** o **el eje de la vía** (cada carril se desplaza la mitad del peralte). El perfil de proyecto es, en ese punto, la cabeza del carril.

El **Diagrama de peralte** dibuja la altura de cada carril sobre el perfil a lo largo de las estaciones; la vista de perfil y las hojas de planta y perfil muestran lo mismo como una banda bajo el perfil.

## Límites y avisos de peralte

**Peralte aplicado máximo**, **Insuficiencia de peralte máxima**, **Exceso de peralte máximo**, **Pendiente de peralte más fuerte** y **Variación de peralte más rápida** (el gradiente a la velocidad de línea, en mm/s) se comprueban en cada curva. Un valor por encima de un límite genera un aviso en el bloque Vía férrea y en el panel de Problemas, con el límite y el valor encontrado. Sin velocidad de proyecto no se comprueban la insuficiencia ni la variación (una nota lo indica).

## La vía

Establezca el **Ancho de vía** (preajustes de ancho estándar 1435 mm, superior, métrico o estrecho, o uno propio), el **Perfil de carril** (60E1, 54E1, 49E1, 115RE, 136RE: solo sus dimensiones publicadas), el número de **Vías** y sus **Entreejes de vía**, y después **Traviesas y balasto**: material de la traviesa, longitud, anchura, canto y separación; espesor del balasto bajo la traviesa (en el carril bajo), berma, pendiente, y cuánto queda su cara superior por debajo de las traviesas; espesor del subbalasto, la berma más allá del pie del balasto y la pendiente transversal de la plataforma.

Pulse **Construir la vía**. Se aplica al corredor del trazado, construido como una vía a lo largo del perfil de proyecto: los carriles y las traviesas se inclinan con el peralte, la plataforma no. Los taludes de enlace parten del borde de la berma en los desmontes y terraplenes del corredor, y la vía se nivela con la superficie proyectada como una carretera.

- **Planta**: ambos carriles de cada vía (capa C-RAIL-TRAK) y, con más de una vía, el eje de cada vía (C-RAIL-CNTR), en pantalla, en DXF, DWG, PDF y en las hojas de planta y perfil.
- **Secciones**: las traviesas, los carriles, y las bases del balasto y del subbalasto en todas las secciones.
- **3D**: los carriles, cada traviesa y el lecho de balasto (Mostrar › Vía), también en GLB, OBJ y USD.
- **Mediciones**: longitud de la vía, carril (ambos carriles de cada vía, a lo largo de la línea propia de cada vía), traviesas, el lecho de balasto y el balasto menos las traviesas, y el subbalasto, por áreas medias entre extremos de sección.

## Comprobaciones de geometría de vía

Además del peralte, el bloque Vía férrea comprueba la propia línea frente a otros seis límites (todos provisionales, todos a su elección):

- **Pendiente más fuerte** del perfil de proyecto, en milímetros por metro.
- **Radio mínimo de curva vertical**, como factor k en R ≥ k·V² (R en metros, V en km/h). Una curva vertical parabólica de longitud L entre dos pendientes tiene un radio igual a L dividido por la variación de pendiente.
- **Curva vertical más corta**.
- **Radio mínimo de curva** en planta (0 desactiva la comprobación).
- **Arco o recta más corta**, como segundos de recorrido a la velocidad de línea: si un arco circular, o la recta entre dos curvas, es más corto que esa distancia, se emite un aviso. 1,8 s es la conocida regla de "la mitad de la velocidad en km/h, en metros".
- **Variación de la insuficiencia de peralte** a lo largo de cada transición, en mm/s a la velocidad de línea.

**Geometría de vía** enumera la pendiente más fuerte encontrada y cada curva vertical con su radio y el radio que exige la velocidad de línea. Una curva vertical que coincide con una transición o una rampa de peralte recibe una nota. Sin perfil de proyecto o sin velocidad de proyecto, se omiten las comprobaciones que los necesitan y una nota lo indica.

## Aparatos de vía y travesías

En **Aparatos de vía y travesías**, pulse **Añadir un aparato de vía**. Se coloca en la recta más larga; ajústelo en la tabla:

- **Estación del talón de aguja**: donde empieza el aparato en este trazado.
- **Corazón**: el número de corazón N (1:N). El ángulo del corazón es 2·atan(1 / 2N).
- **Lado**: izquierda o derecha, mirando en sentido de la estación creciente.
- **Separación de travesía** en metros: si es mayor que 0, el aparato se convierte en una travesía hacia una vía paralela a esa distancia (dos aparatos y la recta entre ellos).

La tabla muestra el **Lanzamiento** (del talón de aguja al corazón), el **Radio** de la curva de cierre y la **Velocidad en desvío** que permite ese radio con su límite de insuficiencia de peralte y sin peralte. **Crear su vía** convierte el itinerario desviado en un trazado propio (la aguja, la curva de cierre y después recto con el ángulo del corazón) con los mismos ajustes de vía férrea, listo para alargarlo.

La planta dibuja los dos carriles desviados de cada aparato, su eje, una marca en el talón de aguja y en el corazón, y "1:N" (capa C-RAIL-TURN), en pantalla y en DXF, DWG, PDF y hojas. La vista 3D dibuja los carriles desviados al nivel de la vía principal.

La forma es **provisional**: una aguja recta y una curva de cierre a partir del número de corazón. Un aparato construido sigue la norma del ferrocarril y el plano del fabricante. Avisos: un aparato que se sale del trazado, que está sobre una curva, una transición, el peralte o una curva vertical, o que se solapa con otro; y una nota cuando la velocidad de línea supera su velocidad en desvío.

## Envolvente de gálibo

Marque **Desplazar una envolvente de gálibo a lo largo de esta vía**. Elija el **Contorno** (dos formas provisionales, o **Su propio contorno** escrito como un punto por línea: desplazamiento desde el eje de la vía, y después altura sobre la cabeza del carril, en metros), la **Longitud del vehículo** y los **Entreejes de bogie** y, si lo hay, el **Borde del andén** (lado, distancia al eje de la vía, altura sobre el carril).

En cada estación el contorno se inclina con el peralte alrededor del carril bajo y se ensancha por la curvatura: el centro del vehículo se desplaza hacia dentro b² / 8R, sus extremos hacia fuera (L² − b²) / 8R (b los entreejes de bogie, L la longitud del vehículo, R el radio en ese punto, siguiendo la transición). El bloque dibuja la sección en la recta y donde es más ancha, y enumera:

- la **envolvente más ancha** y dónde está,
- los **entreejes de vía** comparados con los entreejes que necesitan dos envolventes vecinas,
- el espacio libre en el **borde del andén**, o cuánto se introduce en él,
- cada línea de elemento, estructura de tuberías y otro trazado ferroviario encontrado **dentro de la envolvente**.

Una línea de elemento con cotas se evalúa frente al contorno a su altura sobre el carril; sin perfil de proyecto, o para un punto sin cota, se evalúa solo en planta y la lista lo indica. La planta muestra los dos bordes de la envolvente (capa C-RAIL-CLRN) con una cruz en cada elemento que queda dentro.

Los contornos ofrecidos son **provisionales, no el gálibo de ningún ferrocarril**. Escriba el gálibo de obra de su ferrocarril antes de fiarse de un resultado.

## En otros programas

- **LandXML**: un trazado ferroviario se escribe con sus transiciones (spiType) y un bloque `Cant`: el ancho de vía, el punto de giro, la velocidad de línea y una estación donde empieza y termina cada rampa de peralte, con el peralte aplicado, el peralte de equilibrio y la insuficiencia. Al abrir un archivo LandXML con un bloque `Cant`, ese trazado se convierte en vía férrea con esos peraltes.
- **IFC**: el trazado con sus segmentos de peralte, los carriles, las traviesas, el balasto y el subbalasto.

## Todavía no incluido

Aparatos de vía en la exportación IFC, familias de aparatos más allá de la curva de cierre única (agujas curvas, corazones de punta móvil, cruzamientos dobles, rombos), reglas de gálibo cinemático (la envolvente es un contorno fijo con desplazamiento por curva), catenaria y señalización.

**Qué norma.** En el bloque Vía férrea, "Norma a citar" admite Ninguna o Europea (UIC y EN). Elegir Europea indica los documentos que cita un proyecto europeo (EN 13803 para los parámetros del trazado, EN 13232 para aparatos de vía y cruzamientos, EN 15273 para gálibos, EN 13848 para la calidad de la geometría de vía) y añade a cada límite un cuadro para la cláusula de la que procede. Ningún valor de ninguna norma está incluido: el peralte, la insuficiencia, el exceso, la pendiente y los límites de variación, la geometría de los aparatos y el gálibo de obra siguen siendo provisionales, y la ventana lo indica. Un ingeniero ferroviario comprueba cada valor con el texto de la propia norma, y escribe la cláusula junto a él, antes de construir nada. Sudáfrica y las tablas AREMA no están en esta versión.
