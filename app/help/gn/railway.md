---
title: Diseñar una vía férrea
summary: Hacer de un trazado una vía férrea: transiciones de vía (clotoide, parábola cúbica, Bloss, Helmert, media onda senoidal, senoidal), peralte en cada curva con su peralte de equilibrio, déficit y exceso, límites de peralte y de geometría de vía como avisos, desvíos y cruces de vías por estación, un gálibo barrido a lo largo de la línea, y una vía con rieles, durmientes y un lecho de balasto construida como corredor, en planta, cortes, perfil, 3D y cantidades.
keywords: vía férrea, riel, ferrocarril, vía, tren, metro, tranvía, peralte, sobreelevación, déficit de peralte, exceso de peralte, peralte de equilibrio, transición, curva de transición, clotoide, parábola cúbica, bloss, helmert, media onda senoidal, coseno, trocha, trocha estándar, trocha ancha, trocha métrica, trocha angosta, durmiente, traviesa, balasto, subbalasto, plataforma, berma, separación de vías, 60E1, 54E1, UIC60, 115RE, 136RE, pendiente del peralte, tasa de variación del peralte, desvío, aguja, cambio, cruce de vías, corazón, número de corazón, talón, curva de cierre, velocidad en desvío, gálibo, gálibo de obra, gálibo cinemático, andén, separación del andén, separación de vías, pendiente, curva vertical, radio mínimo, peralte LandXML
from: 99de9745
---

Cualquier trazado puede ser una vía férrea. Sus curvas reciben entonces transiciones de vía y un peralte (la sobreelevación de los rieles), y su corredor se construye como vía: rieles sobre durmientes en un lecho de balasto, nivelado en el terreno como una ruta. Se pueden poner desvíos y cruces de vías por estación, y se puede barrer un gálibo a lo largo de la línea y verificarlo contra lo que está al costado de la vía.

Todos los números de abajo son **valores de referencia**, no normas. Los ferrocarriles fijan sus límites según la velocidad de la línea, el tipo de vía y el país; fíjelos según la norma de su propio ferrocarril. CivilCraft no trae ninguna tabla nacional.

## Hacer del trazado una vía férrea

1. Seleccione el trazado y busque **Vía férrea** en Propiedades.
2. Marque **Este trazado es una vía férrea**. Cada cambio es un paso de Deshacer.
3. Fije la **Velocidad de diseño** en la parte superior de las Propiedades del trazado: es la velocidad de la línea con la que se verifica el peralte. **Trenes más lentos** (en el bloque Vía férrea) es la velocidad con la que se verifica el exceso de peralte.

## Transiciones

Dé a cada curva una longitud de espiral a cada extremo en la tabla de PI (**Espiral de entrada**, **Espiral de salida**), luego elija su tipo en la tabla de curvas del bloque Vía férrea, o use **Transición para cada curva**:

| Tipo | Curvatura a lo largo de la transición |
|---|---|
| Clotoide | crece de manera uniforme (la espiral de ruta) |
| Parábola cúbica | y = x³ / (6·R·L), con L medida sobre la tangente; la curva en sí es un poco más larga |
| Bloss | 3u² − 2u³ de la curvatura total (u = la proporción de la longitud): comienza y termina suavemente |
| Helmert | dos parábolas, 2u² y luego 1 − 2(1 − u)² |
| Media onda senoidal | (1 − cos πu) / 2 |
| Senoidal | u − sen(2πu) / 2π |

Todas excepto la parábola cúbica giran L / 2R, como la clotoide. Las estaciones se miden a lo largo de la longitud real. LandXML conserva el tipo (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Peralte

Escriba el **Peralte** de cada curva en milímetros. La tabla muestra para cada curva:

- **Peralte de equilibrio** = G·v² / (g·R), siendo G la distancia entre los centros de los rieles (**Separación de rieles**, la trocha más el ancho de la cabeza del riel salvo que usted la escriba). Con G = 1500 mm esto es el conocido 11,8·V² / R (V en km/h, R en m).
- **Déficit** = equilibrio a la velocidad de la línea − peralte aplicado.
- **Exceso** = peralte aplicado − equilibrio a la velocidad de los trenes más lentos.
- **Rampa**: la pendiente de peralte más pronunciada a lo largo de sus rampas, en milímetros por metro.

El peralte sube a lo largo de cada transición, con la forma de su curvatura: recto para la clotoide o la parábola cúbica, con forma de Bloss para Bloss, y así sucesivamente. Un extremo de curva sin transición sube en la recta anterior, todo lo largo que exija el límite de pendiente de peralte, y se indica así: el peralte cambia entonces donde la curvatura no cambia.

**Peralte gira alrededor de** indica qué riel se mantiene en el perfil de diseño: **el riel bajo** (lo habitual), **el riel interior** o **el centro de la vía** (cada riel se mueve la mitad del peralte). El perfil de diseño es la cara superior del riel en ese punto.

El **Diagrama de peralte** dibuja la altura de cada riel sobre el perfil a lo largo de las estaciones; la vista de perfil y las hojas de planta y perfil muestran lo mismo como una banda debajo del perfil.

## Límites de peralte y avisos

**Peralte aplicado máximo**, **Déficit de peralte máximo**, **Exceso de peralte máximo**, **Pendiente de peralte más pronunciada** y **Variación de peralte más rápida** (la pendiente a la velocidad de la línea, en mm/s) se verifican en cada curva. Un valor superior a un límite es un aviso en el bloque Vía férrea y en el panel de Problemas, con el límite y el valor encontrado. Sin velocidad de diseño, el déficit y la tasa de variación no se verifican (una nota lo indica).

## La vía

Fije la **Trocha** (valores preestablecidos estándar 1435 mm, ancha, métrica o angosta, o la suya propia), el **Perfil de riel** (60E1, 54E1, 49E1, 115RE, 136RE: solo sus medidas publicadas), el número de **Vías** y sus **Separaciones de vía**, luego **Durmientes y balasto**: material del durmiente, largo, ancho, espesor y separación; espesor de balasto bajo el durmiente (en el riel bajo), hombrera, pendiente, cuánto queda su cara superior por debajo de los durmientes; espesor de subbalasto, la berma más allá de la base del balasto y la pendiente transversal de la plataforma.

Presione **Construir la vía**. Se activa sobre el corredor del trazado, construido como vía a lo largo del perfil de diseño: los rieles y los durmientes se inclinan con el peralte, la plataforma no. Los taludes de corte y terraplén parten del borde de la berma en el corte y en el terraplén del corredor, y la vía se nivela con la superficie proyectada como una ruta.

- **Planta**: ambos rieles de cada vía (capa C-RAIL-TRAK) y, con más de una vía, el centro de cada vía (C-RAIL-CNTR), en pantalla, en DXF, DWG, PDF y hojas de planta y perfil.
- **Cortes**: los durmientes, los rieles, y las bases del balasto y del subbalasto en cada corte.
- **3D**: los rieles, cada durmiente y el lecho de balasto (Mostrar › Vía), también en GLB, OBJ y USD.
- **Cantidades**: longitud de vía, riel (ambos rieles de cada vía, a lo largo de la línea propia de cada vía), durmientes, el lecho de balasto y el balasto menos los durmientes, y el subbalasto, por áreas medias de extremos entre cortes.

## Verificaciones de geometría de vía

Además del peralte, el bloque Vía férrea verifica la línea misma contra seis límites más (todos son valores de referencia, todos suyos para fijar):

- **Pendiente más pronunciada** del perfil de diseño, en milímetros por metro.
- **Radio de curva vertical mínimo**, como factor k en R ≥ k·V² (R en metros, V en km/h). Una curva vertical parabólica de longitud L entre dos pendientes tiene un radio de L dividido por la variación de la pendiente.
- **Curva vertical más corta**.
- **Radio de curva mínimo** en planta (0 desactiva la verificación).
- **Arco o recta más corta**, como segundos de recorrido a la velocidad de la línea: un arco circular, o la recta entre dos curvas, más corto que esa distancia genera aviso. 1,8 s es el conocido "la mitad de la velocidad en km/h, en metros".
- **Tasa de variación del déficit de peralte** a lo largo de cada transición, en mm/s a la velocidad de la línea.

**Geometría de vía** enumera la pendiente más pronunciada encontrada y cada curva vertical con su radio y el radio que exige la velocidad de la línea. Una curva vertical que cae sobre una transición o una rampa de peralte recibe una nota. Sin perfil de diseño o sin velocidad de diseño, las verificaciones que los necesitan se omiten y una nota lo indica.

## Desvíos y cruces de vías

Bajo **Desvíos y cruces de vías**, presione **Agregar un desvío**. Se ubica en la recta más larga; fíjelo en la tabla:

- **Estación del talón de aguja**: dónde comienza el desvío en este trazado.
- **Corazón**: el número de corazón N (1:N). El ángulo del corazón es 2·atan(1 / 2N).
- **Lado**: izquierda o derecha, mirando en sentido de la estación creciente.
- **Separación de cruce** en metros: por encima de 0, el desvío se convierte en un cruce hacia una vía paralela a esa distancia (dos desvíos y la recta entre ellos).

La tabla muestra la **Longitud de talón** (talón de aguja al corazón), el **Radio** de la curva de cierre y la **Velocidad en desvío** que ese radio permite con su límite de déficit de peralte y sin peralte. **Crear su vía** convierte la ruta desviada en un trazado propio (la aguja, la curva de cierre y luego recto con el ángulo del corazón) con las mismas opciones de vía férrea, listo para alargarse.

La planta dibuja los dos rieles desviados de cada desvío, su eje, una marca en el talón de aguja y en el corazón, y "1:N" (capa C-RAIL-TURN), en pantalla y en DXF, DWG, PDF y hojas. La vista 3D dibuja los rieles desviados al nivel de la vía principal.

La forma es un **valor de referencia**: una aguja recta y una curva de cierre a partir del número de corazón. Un desvío construido sigue la norma del ferrocarril y el plano del fabricante. Avisos: un desvío que sale del trazado, que cae sobre una curva, una transición, un peralte o una curva vertical, o que se superpone con otro; y una nota cuando la velocidad de la línea supera su velocidad en desvío.

## Gálibo

Marque **Barrer un gálibo a lo largo de esta vía**. Elija el **Contorno** (dos formas de referencia, o **Su propio contorno** escrito como un punto por línea: desfase desde el centro de la vía, luego altura sobre la cara superior del riel, en metros), el **Largo del vehículo** y los **Centros de bogies** y, si lo hay, el **Borde del andén** (lado, distancia desde el centro de la vía, altura sobre el riel).

En cada estación el contorno se inclina con el peralte alrededor del riel bajo y se ensancha por la curva: el centro del vehículo se desplaza hacia adentro en b² / 8R, sus extremos hacia afuera en (L² − b²) / 8R (b los centros de bogies, L el largo del vehículo, R el radio allí, siguiendo la transición). El bloque dibuja el corte en la recta y donde es más ancho, y enumera:

- el **gálibo más ancho** y dónde está,
- las **separaciones de vía** comparadas con las separaciones que exigen dos gálibos vecinos,
- el espacio libre en el **borde del andén**, o cuánto invade,
- cada línea de elemento, estructura de tubería y otro trazado ferroviario encontrado **dentro del gálibo**.

Una línea de elemento con cotas se juzga contra el contorno a su altura sobre el riel; sin perfil de diseño, o para un punto sin cota, se juzga solo en planta y la lista lo indica. La planta muestra los dos bordes del gálibo (capa C-RAIL-CLRN) con una cruz en cada cosa que está dentro.

Los contornos ofrecidos son **valores de referencia, no la trocha de ningún ferrocarril**. Escriba el gálibo de obra de su ferrocarril antes de confiar en un resultado.

## En otros programas

- **LandXML**: un trazado ferroviario se escribe con sus transiciones (spiType) y un bloque `Cant`: la trocha, el punto de giro, la velocidad de la línea, y una estación donde comienza y termina cada rampa de peralte con el peralte aplicado, el peralte de equilibrio y el déficit. Abrir un archivo LandXML con un bloque `Cant` convierte ese trazado en una vía férrea con esos peraltes.
- **IFC**: el trazado con sus segmentos de peralte, los rieles, durmientes, balasto y subbalasto.

## Aún no construido

Desvíos en la exportación IFC, familias de desvíos más allá de la curva de cierre única (agujas curvas, corazones de punta móvil, cruzamientos dobles, diamantes), reglas de gálibo cinemático (el gálibo es un contorno fijo con desplazamiento por curva), líneas aéreas y señalización.

**Qué norma.** En el bloque Vía férrea, "Norma a citar" toma Ninguna o Europea (UIC y EN). Elegir Europea indica los documentos que cita un proyecto europeo (EN 13803 para los parámetros del trazado, EN 13232 para agujas y cruzamientos, EN 15273 para gálibos, EN 13848 para la calidad de la geometría de vía) y da a cada límite un recuadro para la cláusula de la que proviene. Ningún número de ninguna norma viene incorporado: los límites de peralte, déficit, exceso, pendiente y variación, la geometría de desvíos y el gálibo de obra siguen siendo valores de referencia, y la ventana lo indica. Un ingeniero ferroviario verifica cada valor con el texto propio de la norma, y escribe la cláusula al lado, antes de construir nada. Sudáfrica y las tablas AREMA no están en esta versión.
