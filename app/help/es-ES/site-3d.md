---
title: Ver el emplazamiento en 3D
summary: Abra la vista 3D, oriente, desplace y amplíe, establezca la exageración vertical y el coloreado, elija lo que se muestra, y haga clic en alineaciones, plataformas, líneas de elementos, líneas de rotura, tuberías, estructuras y puntos para seleccionarlos.
keywords: etiquetas, etiquetas 3D, etiquetas que miran a la cámara, etiquetas de estación, etiquetas de curvas de nivel, etiquetas de puntos, proyección, aérea, capas de mapa sobre la superficie, 3d, tres d, vista 3D, cubo de vista, brújula, orbitar, perspectiva, paralela, isométrica, iso, exageración vertical, terreno, modelo, modelo del emplazamiento, recorrer, visualizar, renderizar, tuberías en 3D, estructuras, pozos de registro, corredor en 3D, carretera en 3D, superficie de la carretera, carriles, bordillos, aceras, plantas en 3D, árboles en 3D, arbustos, setos, paisajismo 3D, rampas en 3D, escalones, muros, pavimentos, urbanización dura 3D
from: a16bafe1
---

La vista 3D muestra el emplazamiento como un único modelo: el terreno existente y la superficie proyectada, las curvas de nivel proyectadas sobre ellos, las líneas de rotura y el borde de la superficie, cada alineación sobre su perfil de proyecto con marcas de estación, las líneas de elementos del corredor y la propia carretera (carriles, arcenes, cunetas, bordillos, franjas y aceras en sus propios colores), las plataformas con sus líneas de talud, la red de tuberías con tuberías y estructuras a sus cotas reales y, desde el espacio de trabajo Paisajismo, las plantas, los pavimentos, los senderos, los muros, los bordillos, las rampas y los escalones. Lee el mismo proyecto que la planta, así que cada cambio aparece en ambas.

## Abrir la vista 3D

1. Abra puntos topográficos (o un archivo LandXML o de proyecto) para que haya una superficie. Las plantas, los pavimentos o las rampas por sí solos bastan también para abrirla.
2. Pulse {{key:D}}, o haga clic en {{ui:3D}} en el grupo {{ui:View}} de la barra de herramientas.
   La vista 3D se abre sobre la planta, mirando todo el emplazamiento desde el sureste. La primera vez tarda un momento en cargarse.
3. Pulse {{key:D}} de nuevo, o haga clic otra vez en {{ui:3D}}, para volver a la planta. Elegir una herramienta de dibujo, como {{ui:Alignment}} o {{ui:Pad}}, también vuelve a la planta, ya que el dibujo se hace allí.

## Desplazarse

| Para | Haga esto |
|---|---|
| Orbitar | Arrastre con el botón izquierdo o con el central |
| Desplazar | Arrastre con el botón derecho, o mantenga {{key:Shift}} y arrastre |
| Ampliar | Gire la rueda; amplía hacia el puntero |
| Orbitar en un panel táctil | Deslice con dos dedos ({{key:Shift}} y deslizar desplaza) |
| Ampliar en un panel táctil | Pellizque |
| Táctil | Un dedo orbita; dos dedos pellizcan para ampliar y se mueven para desplazar |
| Teclas (la vista tiene el foco) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitan; con {{key:Shift}} desplazan; {{key:Plus}} y {{key:Minus}} amplían |

La barra sobre la vista contiene el resto:

- La lista de vistas: **Iso**, **Superior**, **Inferior**, **Frontal** (mirando al norte), **Posterior**, **Izquierda**, **Derecha**.
- {{ui:Perspective}}: pulsado es una vista en perspectiva; haga clic para una proyección paralela (sin escorzo).
- {{ui:Extents}}: muestra de nuevo todo. {{key:F}} hace lo mismo mientras la vista 3D está abierta.

## El cubo de vista

El cubo de vista de la esquina superior derecha gira con la vista. Haga clic en una cara, una arista o una esquina para mirar el emplazamiento desde allí (la cámara gira suavemente, salvo que su sistema pida movimiento reducido). Arrastre el cubo para orbitar. El anillo de brújula bajo él indica el norte (norte de cuadrícula, +Y): arrástrelo para girar el emplazamiento alrededor de la vertical, o haga clic en N, E, S u O para mirar desde ese lado. {{ui:Home}}, la pequeña casa en su esquina superior izquierda, vuelve a la vista isométrica de todo el emplazamiento. Con el teclado: {{key:Tab}} hasta el cubo, las flechas eligen una cara, arista o esquina, y {{key:Enter}} mira desde allí.

En la planta, el mismo cubo muestra la parte superior. Haga clic en cualquier otra cara, arista o esquina (o arrástrelo) para abrir la vista 3D mirando desde allí: es la forma más rápida de entrar en 3D desde una dirección dada. Para cambiar el cubo por un pequeño icono de ejes, o para ocultarlo, consulte **Indicador de esquina** en [Configuración de CivilCraft](topic:settings).

## Exagerar las cotas

Los emplazamientos suelen ser mucho más anchos que altos, así que las cotas se estiran **2×** para empezar. Elija **1×**, **2×**, **3×**, **5×** o **10×** en la lista de la barra, o bajo **Exageración vertical 3D** en [Configuración de CivilCraft](topic:settings) (los dos son un solo ajuste). Solo cambia la vista: los volúmenes, los perfiles y las exportaciones se mantienen a escala real.

## Colorear las superficies

- **Bandas de cota**: las mismas bandas y colores que las bandas de cota de la planta (el número de bandas se establece en **Visualización**, en el panel izquierdo). Cada borde de banda se corta exactamente a su cota.
- **Un solo color**: el terreno existente y la superficie proyectada, cada uno en un color liso.
- **Capas de mapa**: las capas de mapa mostradas bajo la planta (una imagen georreferenciada, teselas de mapa o un servicio de mapas; consulte [Capas de mapa](topic:map-layers)) se extienden sobre las superficies como una lámina, de modo que una foto aérea se ve sobre las colinas. Las imágenes que aún llegan se completan a medida que llegan. Sin ninguna capa de mapa visible, las superficies conservan sus bandas de cota y la vista lo indica. La imagen es para la pantalla: las exportaciones GLB y OBJ no la incluyen.

Cuando se muestran ambas superficies, el terreno existente es transparente sobre la superficie proyectada, de modo que puede ver el desmonte (terreno por encima del proyecto) y el terraplén.

## Elegir lo que se muestra

Haga clic en {{ui:Show}} en la barra y marque o desmarque:

| Elemento | Qué es |
|---|---|
| Terreno existente | La superficie construida a partir de los puntos topográficos (o leída de LandXML) |
| Superficie proyectada | El terreno existente con los corredores y las plataformas proyectados (solo cuando hay algunos) |
| Aristas de triángulos | Cada arista de la TIN, como líneas |
| Curvas de nivel | Curvas de nivel menores y mayores de cada superficie mostrada, a la equidistancia de la planta |
| Borde de superficie | El borde exterior de cada superficie mostrada, a sus cotas |
| Líneas de rotura | Cada línea de rotura, a sus cotas |
| Alineaciones y estaciones | Cada alineación sobre su perfil de proyecto (sobre el terreno donde no hay perfil), con marcas cada 50 ft o 20 m |
| Líneas de elementos del corredor | Borde de calzada, arcén y línea de talud a ambos lados |
| Superficies de carretera | La carretera que construye cada corredor, a partir de su sección tipo: carriles, arcenes, cunetas, bordillos, franjas y aceras, cada uno en su color, sobre la superficie proyectada |
| Plantas | Cada planta, y las plantas en jardineras y setos, como formas sencillas dimensionadas a partir de la lista de plantas: un árbol es un tronco y una copa redonda (un cono para una conífera, un penacho sobre un tronco alto para una palmera); arbustos, plantas de seto, vivaces y cubresuelos son cúpulas, las gramíneas son penachos y las trepadoras, columnas finas. Se sitúan sobre la superficie proyectada (o el terreno existente) al tamaño que muestra la planta: adulto, o al plantarse |
| Urbanización dura | Pavimentos y senderos con sus pendientes, muros, bordillos, escalones y rampas que suben en tramos con descansillos entre ellos |
| Plataformas y líneas de talud | El contorno de cada plataforma a su cota, y su línea de talud |
| Tuberías y estructuras | Tuberías como tuberías circulares entre sus fondos; estructuras desde el brocal hasta el sumidero |
| Puntos topográficos | Un punto en cada punto con cota (desactivado al principio) |
| Capas SIG | Las capas SIG mostradas en la planta, en sus colores: líneas y contornos con sus propias cotas a esas cotas, y las demás apoyadas sobre el terreno existente (lo siguen exactamente); puntos como pequeñas cruces. Las formas sin cotas fuera de la superficie se omiten, y la vista indica cuántas |
| Etiquetas | Nombres y valores que siempre miran hacia usted: el nombre de cada alineación en su inicio y sus estaciones cada 100 ft (o 100 m), la cota de cada curva de nivel mayor, plataformas, líneas de elementos y estructuras por nombre, y, con **Puntos topográficos** marcado, el número y la cota de cada punto |

Las etiquetas mantienen el mismo tamaño y verticales al girar o ampliar, y una colina delante de una etiqueta la oculta. Donde se amontonarían, se muestran las más importantes y las demás esperan hasta que amplíe: primero las alineaciones, luego las estructuras, las plataformas, las líneas de elementos, las estaciones, las curvas de nivel y los puntos, las más cercanas primero. Solo están en pantalla: las exportaciones y los planos las omiten.

Sus elecciones, la exageración y el coloreado se recuerdan en este navegador.

Una carretera se construye sobre el terreno existente. Con una alineación y un corredor, pero sin puntos topográficos ni superficie todavía, la carretera se dibuja sobre un terreno provisional llano: a la cota media de su perfil de proyecto, o a nivel 0 cuando tampoco hay perfil. Una advertencia en la parte inferior de la vista 3D y en las propiedades del corredor lo indica. Es solo una imagen: no salen volúmenes ni secciones de ella. Abra puntos topográficos o una superficie y la carretera se traslada sola al terreno real.

La exageración vertical estira el terreno, no las plantas: estas se sitúan sobre el terreno exagerado a su altura y extensión reales, así que un árbol parece un árbol con cualquier ajuste. Las plantas son formas sencillas, no modelos detallados: miles de ellas siguen siendo rápidas de girar y ampliar.

## Tuberías y estructuras

- Una tubería se dibuja con su fondo interior en las cotas de fondo que usted establece, y su parte superior interior (la clave) a un diámetro interior por encima. Los diámetros van en pulgadas en un proyecto en pies y en milímetros en un proyecto métrico, como en el panel derecho.
- Una estructura va desde su brocal (escrito, o desde la superficie) hasta su sumidero (la cota de fondo más baja menos la profundidad del sumidero). Sin ninguna cota de fondo, se dibuja con 5 ft (1.5 m) de profundidad.
- Las tuberías y estructuras con un problema (consulte la comprobación de red en el panel derecho) se dibujan en rojo.
- Una tubería sin cotas de fondo no se dibuja; una nota en la parte inferior de la vista indica cuántas son.

## Seleccionar desde la vista 3D

Haga clic en una alineación (o en su carretera), una plataforma, una línea de elementos, una tubería, una estructura, un punto topográfico, una planta, una rampa u otra urbanización dura. Queda seleccionado igual que si lo hubiera pulsado en la planta: sus propiedades se abren en el panel derecho, donde puede editarlas, y se dibuja en el color de selección encima de todo en 3D. Lo que seleccione en la planta también se resalta en 3D. Un consejo junto al puntero indica lo que ha pulsado, con su coordenada este, norte y cota. Las tuberías y estructuras pueden pulsarse aunque estén bajo tierra; una línea oculta tras una colina no puede pulsarse a través de ella.

Haga clic en una línea de rotura para ver cuál es: se resalta, y la barra de estado la nombra (las líneas de rotura no tienen propiedades propias).

Haga clic en el terreno para leer allí la coordenada este, norte y la cota en el consejo.

## Recorrer una alineación

Haga clic en **Conducir** en la barra 3D y elija una alineación. La vista se traslada a un asiento de conductor: 3.5 ft (1.07 m) sobre la carretera, sobre su perfil de proyecto (sobre el terreno existente a lo largo del eje cuando todavía no tiene perfil), mirando hacia delante a lo largo de ella.

- **Reproducir** o {{key:Space}} conduce a la velocidad que elija (de 10 a 65 mph, o de 15 a 100 km/h); {{key:Space}} de nuevo pausa. Se detiene al final; **Reproducir** entonces vuelve a empezar desde el principio.
- El control deslizante salta a cualquier estación; {{key:Left}} y {{key:Right}} avanzan o retroceden 10 ft (5 m).
- Arrastrar en la vista pausa y permite mirar alrededor.
- **Detener** o {{key:Esc}} devuelve la vista a donde estaba.

La exageración vertical se aplica también al conducir: póngala en 1× para ver la carretera como quedará.

## Luz del sol

Abra **Sol** en la barra 3D y marque **Luz del sol**. Indique una fecha, una hora del reloj y su zona horaria (el desfase respecto a UTC: en verano, el de horario de verano), y la latitud y la longitud del emplazamiento. Cuando el proyecto tiene un sistema de coordenadas, se rellenan a partir de él.

El emplazamiento se ilumina entonces desde donde está el sol, con **Sombras** sobre el terreno, el corredor y las plataformas; el menú indica el acimut del sol y su altura, o que está bajo el horizonte. Las posiciones proceden de las ecuaciones solares de la NOAA. Las sombras caen bien con cualquier exageración, pero se detienen en el borde del emplazamiento: las colinas y los edificios más allá de él no proyectan ninguna.

## Exportar la vista 3D

Haga clic en {{ui:GLB}} u {{ui:OBJ}} en la barra. Lo que muestra la vista se guarda a escala real (sin exageración), en metros, con Y hacia arriba. Detalles: [Exportar el emplazamiento en 3D](topic:export-3d).
