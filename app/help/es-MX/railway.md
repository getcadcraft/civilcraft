---
title: Diseñar una vía férrea
summary: Convierta una alineación en vía férrea: transiciones de riel (clotoide, parábola cúbica, Bloss, Helmert, media onda senoidal, senoidal), peralte en cada curva con su peralte de equilibrio, insuficiencia y exceso de peralte, límites de peralte y de geometría de vía como advertencias, cambios de vía y travesías por estación, una envolvente de gálibo barrida a lo largo de la línea y una vía con rieles, durmientes y balasto, construida como obra lineal, en planta, secciones, perfil, 3D y cantidades.
keywords: ferrocarril, riel, vía férrea, vía, tren, metro, tranvía, peralte, sobreelevación, insuficiencia de peralte, exceso de peralte, peralte de equilibrio, transición, curva de transición, clotoide, parábola cúbica, Bloss, Helmert, media onda senoidal, coseno, ancho de vía, ancho estándar, ancho ancho, ancho métrico, ancho angosto, durmiente, balasto, subbalasto, plataforma de vía, berma, separación entre vías, 60E1, 54E1, UIC60, 115RE, 136RE, gradiente de peralte, tasa de cambio de peralte, cambio de vía, aguja, corazón, travesía de vías, número de corazón, desvío, curva de cierre, velocidad en desvío, gálibo, envolvente de gálibo, gálibo de estructura, envolvente cinemática, andén, separación al andén, separación entre vías, pendiente, curva vertical, radio mínimo, peralte LandXML
from: 99de9745
---

Cualquier alineación puede ser una vía férrea. Sus curvas reciben entonces transiciones de riel y un peralte (la sobreelevación de los rieles), y su obra lineal se construye como vía: rieles sobre durmientes, en una capa de balasto, con la rasante ajustada al terreno como un camino. Los cambios de vía y las travesías se colocan por estación, y se puede barrer una envolvente de gálibo a lo largo de ella y comprobarla contra lo que se encuentra junto a la vía.

Cada número de abajo es un **valor de referencia**, no una norma. Los ferrocarriles fijan sus límites según la velocidad de la línea, el tipo de vía y el país; defínalos según la norma de su propio ferrocarril. CivilCraft no incluye ninguna tabla nacional.

## Convertir la alineación en vía férrea

1. Seleccione la alineación y busque **Ferrocarril** en **Propiedades**.
2. Marque **Esta alineación es una vía férrea**. Cada cambio equivale a un paso de deshacer.
3. Defina la **Velocidad de proyecto** en la parte superior de las propiedades de la alineación: es la velocidad de línea contra la que se revisa el peralte. **Trenes más lentos** (en la sección Ferrocarril) es la velocidad contra la que se revisa el exceso de peralte.

## Transiciones

Asigne a cada curva una longitud de espiral en cada extremo en la tabla de PI (**Espiral de entrada**, **Espiral de salida**) y, después, elija su tipo en la tabla de curvas de la sección Ferrocarril, o use **Transición para cada curva**:

| Tipo | Curvatura a lo largo de la transición |
|---|---|
| Clotoide | crece de manera uniforme (la espiral de carretera) |
| Parábola cúbica | y = x³ / (6·R·L), con L medida a lo largo de la tangente; la curva en sí es un poco más larga |
| Bloss | 3u² − 2u³ de la curvatura total (u = la proporción de la longitud): comienza y termina suavemente |
| Helmert | dos parábolas, 2u² y luego 1 − 2(1 − u)² |
| Media onda senoidal | (1 − cos πu) / 2 |
| Senoidal | u − sen(2πu) / 2π |

Todas, excepto la parábola cúbica, giran L / 2R, igual que la clotoide. Las estaciones avanzan a lo largo de la longitud real. LandXML conserva el tipo (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Peralte

Escriba el **Peralte** de cada curva en milímetros. La tabla muestra para cada curva:

- **Peralte de equilibrio** = G·v² / (g·R), siendo G la distancia entre los centros de los rieles (**Centros de riel**, el ancho de vía más el ancho de la cabeza del riel, salvo que lo escriba). Con G = 1500 mm, esto equivale a la conocida fórmula 11,8·V² / R (V en km/h, R en m).
- **Insuficiencia** = peralte de equilibrio a la velocidad de línea − peralte aplicado.
- **Exceso** = peralte aplicado − peralte de equilibrio a la velocidad de los trenes más lentos.
- **Rampa**: la pendiente de peralte más fuerte a lo largo de sus rampas, en milímetros por metro.

El peralte aumenta a lo largo de cada transición, con la forma de su curvatura: recto para una clotoide o una parábola cúbica, con forma Bloss para Bloss, etc. Un extremo de curva sin transición genera su rampa en la recta anterior, con la longitud que requiera el límite de gradiente de peralte, y así lo indica: en ese caso el peralte cambia donde no cambia la curvatura.

**Peralte gira alrededor de** indica qué riel permanece sobre el perfil de proyecto: **el riel bajo** (lo habitual), **el riel interior** o **el eje de la vía** (cada riel se mueve la mitad del peralte). El perfil de proyecto es la parte superior del riel en ese punto.

El **Diagrama de peralte** dibuja la altura de cada riel sobre el perfil a lo largo de las estaciones; la vista de perfil y las hojas de planta y perfil muestran lo mismo como una franja bajo el perfil.

## Límites y advertencias de peralte

**Peralte aplicado máximo**, **Insuficiencia de peralte máxima**, **Exceso de peralte máximo**, **Pendiente máxima de peralte** y **Cambio de peralte más rápido** (el gradiente a la velocidad de línea, en mm/s) se revisan en cada curva. Un valor que supera un límite genera una advertencia en la sección Ferrocarril y en el panel Problemas, con el límite y el valor encontrado. Sin velocidad de proyecto, la insuficiencia y la tasa de cambio no se revisan (una nota lo indica).

## La vía

Defina el **Ancho de vía** (valores preestablecidos estándar de 1435 mm, ancho ancho, métrico o angosto, o uno propio), la **Sección de riel** (60E1, 54E1, 49E1, 115RE, 136RE: solo sus dimensiones publicadas), el número de **Vías** y sus **Separaciones entre vías**; luego, **Durmientes y balasto**: material del durmiente, longitud, ancho, peralte y separación; profundidad del balasto bajo el durmiente (en el riel bajo), hombro, pendiente y cuánto queda su parte superior por debajo de los durmientes; profundidad del subbalasto, la berma más allá del pie del balasto y la pendiente transversal de la plataforma.

Pulse **Construir la vía**. Esto activa la obra lineal de la alineación, construida como vía sobre el perfil de proyecto: los rieles y los durmientes se inclinan con el peralte, la plataforma no. Las pendientes de talud de corte y terraplén parten del borde de la berma en el corte y el terraplén de la obra lineal, y la vía se ajusta a la superficie proyectada como un camino.

- **Planta**: ambos rieles de cada vía (capa C-RAIL-TRAK) y, si hay más de una vía, el eje de cada una (C-RAIL-CNTR), en pantalla, en DXF, DWG, PDF y en hojas de planta y perfil.
- **Secciones**: los durmientes, los rieles y las bases del balasto y del subbalasto en cada sección.
- **3D**: los rieles, cada durmiente y la capa de balasto (Mostrar › Vía), también en GLB, OBJ y USD.
- **Cantidades**: longitud de vía, riel (ambos rieles de cada vía, a lo largo de la línea propia de cada una), durmientes, la capa de balasto y el balasto sin los durmientes, y el subbalasto, por áreas medias entre extremos de sección.

## Revisiones de geometría de vía

Además del peralte, la sección Ferrocarril revisa la línea misma contra seis límites más (todos son valores de referencia, todos definidos por usted):

- **Pendiente máxima** del perfil de proyecto, en milímetros por metro.
- **Radio mínimo de curva vertical**, como factor k en R ≥ k·V² (R en metros, V en km/h). Una curva vertical parabólica de longitud L entre dos pendientes tiene un radio igual a L dividido por el cambio de pendiente.
- **Curva vertical más corta**.
- **Radio mínimo de curva** en planta (0 desactiva la revisión).
- **Arco o recta más corta**, expresada en segundos de recorrido a la velocidad de línea: se advierte si un arco circular, o la recta entre dos curvas, es más corto que esa distancia. 1,8 s corresponde a la conocida regla de "la mitad de la velocidad en km/h, en metros".
- **Tasa de cambio de insuficiencia de peralte** a lo largo de cada transición, en mm/s a la velocidad de línea.

**Geometría de vía** enumera la pendiente máxima encontrada y cada curva vertical con su radio y el radio que exige la velocidad de línea. Una curva vertical que se encuentra sobre una transición o una rampa de peralte genera una nota. Sin perfil de proyecto o sin velocidad de proyecto, las revisiones que los necesitan se omiten y una nota lo indica.

## Cambios de vía y travesías

Bajo **Cambios de vía y travesías**, pulse **Agregar un cambio de vía**. Se coloca en la recta más larga; defínalo en la tabla:

- **Estación del inicio de la aguja**: donde comienza el cambio de vía en esta alineación.
- **Corazón**: el número de corazón N (1:N). El ángulo del corazón es 2·atan(1 / 2N).
- **Lado**: izquierdo o derecho, mirando en el sentido de las estaciones crecientes.
- **Separación de travesía** en metros: si es mayor que 0, el cambio de vía se convierte en una travesía hacia una vía paralela a esa distancia (dos cambios de vía y la recta entre ellos).

La tabla muestra la **Longitud de desvío** (del inicio de la aguja al corazón), el **Radio** de la curva de cierre y la **Velocidad en desvío** que permite ese radio con su límite de insuficiencia de peralte y sin peralte. **Crear su vía** convierte la ruta de desvío en una alineación propia (la aguja, la curva de cierre y luego recto con el ángulo del corazón), con los mismos ajustes ferroviarios, lista para alargarse.

La planta dibuja los dos rieles de desvío de cada cambio de vía, su eje, una marca en el inicio de la aguja y en el corazón, y "1:N" (capa C-RAIL-TURN), en pantalla y en DXF, DWG, PDF y hojas. La vista 3D dibuja los rieles de desvío al nivel de la vía principal.

La forma es un **valor de referencia**: una aguja recta y una curva de cierre a partir del número de corazón. Un cambio de vía construido sigue la norma del ferrocarril y el plano del fabricante. Advertencias: un cambio de vía que sale de la alineación, que queda sobre una curva, una transición, un peralte o una curva vertical, o que se superpone con otro; y una nota cuando la velocidad de línea supera su velocidad en desvío.

## Envolvente de gálibo

Marque **Barrer una envolvente de gálibo a lo largo de esta vía**. Elija el **Contorno** (dos formas de referencia, o **Su propio contorno** escrito como un punto por línea: desplazamiento desde el eje de la vía, luego altura sobre la parte superior del riel, en metros), la **Longitud del vehículo** y los **Centros de bogie** y, si existe, un **Borde del andén** (lado, distancia desde el eje de la vía, altura sobre el riel).

En cada estación el contorno se inclina con el peralte alrededor del riel bajo y se ensancha por la curva: la parte central del vehículo se desplaza hacia adentro en b² / 8R, y sus extremos hacia afuera en (L² − b²) / 8R (b los centros de bogie, L la longitud del vehículo, R el radio en ese punto, según la transición). La sección dibuja la sección en la recta y donde es más ancha, y enumera:

- la **envolvente más ancha** y dónde se encuentra,
- los **centros de vía** comparados con los centros que requieren dos envolventes vecinas,
- el espacio libre en el **borde del andén**, o cuánto invade,
- cada línea de elemento, estructura de tubería y otra alineación ferroviaria encontrada **dentro de la envolvente**.

Una línea de elemento con elevaciones se evalúa contra el contorno a su altura sobre el riel; sin perfil de proyecto, o para un punto sin elevación, se evalúa solo en planta y la lista lo indica. La planta muestra los dos bordes de la envolvente (capa C-RAIL-CLRN) con una cruz en cada elemento que queda dentro.

Los contornos ofrecidos son **valores de referencia, no el gálibo de ningún ferrocarril**. Escriba el gálibo de estructura de su ferrocarril antes de confiar en un resultado.

## En otros programas

- **LandXML**: una alineación ferroviaria se escribe con sus transiciones (spiType) y un bloque `Cant`: el ancho de vía, el punto de giro, la velocidad de línea y una estación donde comienza y termina cada rampa de peralte, con el peralte aplicado, el peralte de equilibrio y la insuficiencia. Al abrir un archivo LandXML con un bloque `Cant`, esa alineación se convierte en vía férrea con esos peraltes.
- **IFC**: la alineación con sus segmentos de peralte, los rieles, los durmientes, el balasto y el subbalasto.

## Aún no incluido

Cambios de vía en la exportación IFC, familias de cambios de vía más allá de la curva de cierre única (agujas curvas, corazones de punta móvil, cruzamientos dobles, rombos), reglas cinemáticas de gálibo (la envolvente es un contorno fijo con desplazamiento por curva), catenaria y señalización.

**Qué norma.** En la sección Ferrocarril, "Norma a citar" admite Ninguna o Europea (UIC y EN). Al elegir Europea se nombran los documentos que cita un proyecto europeo (EN 13803 para los parámetros de alineación, EN 13232 para agujas y cruzamientos, EN 15273 para gálibos, EN 13848 para la calidad de la geometría de vía) y cada límite tiene un recuadro para la cláusula de la que procede. Ningún número de ninguna norma está incorporado: los límites de peralte, insuficiencia, exceso, pendiente y tasa, la geometría de cambios de vía y el gálibo de estructura siguen siendo valores de referencia, y la ventana lo indica. Un ingeniero ferroviario debe comprobar cada valor contra el texto de la propia norma y escribir la cláusula junto a él antes de construir nada. Sudáfrica y las tablas AREMA no están incluidas en esta versión.
