---
title: Ver el sitio en 3D
summary: Abra la vista 3D, oriente, encuadre y haga zoom, defina la exageración vertical y el colorido, elija qué se muestra, y haga clic en alineaciones, plataformas, líneas características, líneas de quiebre, tuberías, estructuras y puntos para seleccionarlos.
keywords: etiquetas, etiquetas 3d, etiquetas que miran a la cámara, etiquetas de estación, etiquetas de curvas de nivel, etiquetas de puntos, drapear, aérea, capas de mapa sobre la superficie, 3d, tres d, vista 3d, cubo de vistas, brújula, órbita, perspectiva, paralela, isométrica, iso, exageración vertical, terreno, modelo, modelo del sitio, volar alrededor, visualizar, renderizar, tuberías en 3d, estructuras, pozos de visita, obra lineal en 3d, carretera en 3d, superficie de carretera, carriles, guarniciones, banquetas, vegetación en 3d, árboles en 3d, arbustos, setos, paisajismo 3d, rampas en 3d, escalones, muros, pavimentos, obra dura 3d
from: a16bafe1
---

La vista 3D muestra el sitio como un solo modelo: el terreno existente y la superficie proyectada, las curvas de nivel drapeadas sobre ellas, las líneas de quiebre y el borde de la superficie, cada alineación sobre su perfil de proyecto con marcas de estación, las líneas características de la obra lineal y la carretera misma (carriles, acotamientos, cunetas, guarniciones, franjas y banquetas en sus propios colores), las plataformas con sus líneas de liberación, la red de tuberías con tuberías y estructuras a sus elevaciones reales, y desde el espacio de paisajismo la vegetación, pavimentos, senderos, muros, bordillos, rampas y escalones. Lee el mismo proyecto que la planta, así que cada cambio se ve en ambas.

## Abrir la vista 3D

1. Abra puntos topográficos (o un archivo LandXML o de proyecto) para que haya una superficie. Solo la vegetación, los pavimentos o las rampas también bastan para abrirla.
2. Pulse {{key:D}}, o haga clic en {{ui:3D}} en el grupo {{ui:Vista}} de la barra de herramientas.
   La vista 3D se abre sobre la planta, mirando todo el sitio desde el sureste. La primera vez tarda un momento en cargarse.
3. Pulse {{key:D}} otra vez, o haga clic de nuevo en {{ui:3D}}, para volver a la planta. Elegir una herramienta de dibujo como {{ui:Alineación}} o {{ui:Plataforma}} también vuelve a la planta, ya que el dibujo se hace allí.

## Desplazarse

| Para | Haga esto |
|---|---|
| Orbitar | Arrastre con el botón izquierdo o el central |
| Encuadrar | Arrastre con el botón derecho, o mantenga {{key:Shift}} y arrastre |
| Hacer zoom | Gire la rueda; hace zoom hacia el puntero |
| Orbitar en un panel táctil | Deslice con dos dedos ({{key:Shift}} y deslizar encuadra) |
| Hacer zoom en un panel táctil | Pellizque |
| Táctil | Un dedo orbita; dos dedos pellizcan para hacer zoom y se mueven para encuadrar |
| Teclas (la vista tiene el foco) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitan; con {{key:Shift}} encuadran; {{key:Plus}} y {{key:Minus}} hacen zoom |

La barra sobre la vista contiene el resto:

- La lista de vistas: **Iso**, **Superior**, **Inferior**, **Frente** (mirando al norte), **Atrás**, **Izquierda**, **Derecha**.
- {{ui:Perspectiva}}: activado es una vista en perspectiva; haga clic para una proyección paralela (sin escorzo).
- {{ui:Extensión}}: vuelve a mostrar todo. {{key:F}} hace lo mismo mientras la vista 3D está abierta.

## El cubo de vistas

El cubo de vistas de la esquina superior derecha gira con la vista. Haga clic en un lado, una arista o una esquina para mirar el sitio desde ahí (la cámara gira suavemente salvo que su sistema pida movimiento reducido). Arrastre el cubo para orbitar. El anillo de brújula debajo muestra el norte (norte de la cuadrícula, +Y): arrastre el anillo para girar el sitio alrededor de la vertical, o haga clic en N, E, S u O para mirar desde ese lado. {{ui:Inicio}}, la pequeña casa en su esquina superior izquierda, vuelve a la vista isométrica de todo el sitio. Con el teclado: {{key:Tab}} lleva al cubo, las flechas eligen un lado, arista o esquina, y {{key:Enter}} mira desde allí.

En la planta, el mismo cubo muestra la vista superior. Haga clic en cualquier otro lado, arista o esquina (o arrástrelo) para abrir la vista 3D mirando desde ahí: es la forma más rápida de entrar en 3D desde una dirección dada. Para cambiar el cubo por un pequeño icono de ejes, u ocultarlo, consulte **Indicador de esquina** en [Configuración de CivilCraft](topic:settings).

## Exagerar las elevaciones

Los sitios suelen ser mucho más anchos que altos, así que las elevaciones se estiran **2×** al inicio. Elija **1×**, **2×**, **3×**, **5×** o **10×** en la lista de la barra, o en **Exageración vertical en 3D** de [Configuración de CivilCraft](topic:settings) (ambas son una sola configuración). Solo cambia la vista: los volúmenes, los perfiles y las exportaciones se mantienen a escala real.

## Colorear las superficies

- **Bandas de elevación**: las mismas bandas y colores que las bandas de elevación de la planta (el número de bandas se define en **Pantalla** en el panel izquierdo). Cada borde de banda se corta exactamente en su elevación.
- **Un color**: el terreno existente y la superficie proyectada, cada uno en un color liso.
- **Capas de mapa**: las capas de mapa que se muestran bajo la planta (una imagen georreferenciada, mosaicos de mapa o un servicio de mapas; consulte [Capas de mapa](topic:map-layers)) se extienden sobre las superficies como una hoja, de modo que una foto aérea se ve sobre las colinas. Las imágenes que aún llegan se completan a medida que llegan. Sin capa de mapa visible, las superficies conservan sus bandas de elevación y la vista lo indica. La imagen es para la pantalla: las exportaciones GLB y OBJ no la incluyen.

Cuando se muestran ambas superficies, el terreno existente es translúcido sobre la superficie proyectada, así que puede ver el corte (terreno sobre el proyecto) y el terraplén.

## Elegir qué se muestra

Haga clic en {{ui:Mostrar}} en la barra y marque o desmarque:

| Elemento | Qué es |
|---|---|
| Terreno existente | La superficie construida a partir de los puntos topográficos (o leída de LandXML) |
| Superficie proyectada | El terreno existente con las obras lineales y plataformas ya niveladas (solo cuando las hay) |
| Aristas de triángulos | Cada arista de la TIN, como líneas |
| Curvas de nivel | Curvas menores y mayores de cada superficie mostrada, con el intervalo de la planta |
| Borde de superficie | El borde exterior de cada superficie mostrada, a sus elevaciones |
| Líneas de quiebre | Cada línea de quiebre, a sus elevaciones |
| Alineaciones y estaciones | Cada alineación sobre su perfil de proyecto (sobre el terreno cuando no hay perfil), con marcas cada 50 ft o 20 m |
| Líneas características de la obra lineal | Borde de pavimento, acotamiento y línea de liberación en ambos lados |
| Superficies de carretera | La carretera que construye cada obra lineal, según su sección tipo: carriles, acotamientos, cunetas, guarniciones, franjas y banquetas, cada una en su color, sobre la superficie proyectada |
| Vegetación | Cada planta, y las plantas en arriates y setos, como formas sencillas con el tamaño de la lista de plantas: un árbol es un tronco y una copa redonda (un cono para una conífera, un penacho sobre un tronco alto para una palma); los arbustos, plantas de seto, perennes y cubresuelos son cúpulas, las gramíneas son matas y las trepadoras columnas delgadas. Se apoyan en la superficie proyectada (o en el terreno existente) al tamaño que muestra la planta: maduro, o al plantar |
| Obra dura | Pavimentos y senderos con sus pendientes, muros, bordillos, escalones y rampas que suben en tramos con descansos horizontales entre ellos |
| Plataformas y líneas de liberación | El contorno de cada plataforma a su elevación y su línea de liberación |
| Tuberías y estructuras | Tuberías como cilindros entre sus plantillas, estructuras desde el brocal hasta el sumidero |
| **Puntos topográficos** | Un punto en cada punto con elevación (desactivado al inicio) |
| Capas SIG | Las capas SIG mostradas en la planta, en sus colores: líneas y contornos con sus propias elevaciones a esas elevaciones, las demás apoyadas sobre el terreno existente (la siguen exactamente); los puntos como pequeñas cruces. Las formas sin elevación fuera de la superficie se omiten, y la vista indica cuántas |
| Etiquetas | Nombres y valores que siempre miran hacia usted: el nombre de cada alineación en su inicio y sus estaciones cada 100 ft (o 100 m), la elevación de cada curva mayor, las plataformas, las líneas características y las estructuras por nombre, y con **Puntos topográficos** marcado, el número y la elevación de cada punto |

Las etiquetas mantienen su tamaño y su posición vertical sin importar cómo gire o haga zoom, y una colina frente a una etiqueta la oculta. Donde se amontonarían, se muestran las más importantes y las demás esperan a que acerque la vista: primero las alineaciones, luego las estructuras, plataformas, líneas características, estaciones, curvas de nivel y puntos, las más cercanas primero. Solo aparecen en pantalla; las exportaciones y los trazados las omiten.

Sus elecciones, la exageración y el colorido se recuerdan en este navegador.

Una carretera se construye sobre el terreno existente. Con una alineación y una obra lineal pero sin puntos topográficos ni superficie todavía, la carretera se dibuja por ahora sobre un terreno plano provisional: a la elevación media de su perfil de proyecto, o nivelada a elevación 0 cuando tampoco hay perfil. Una advertencia en la parte inferior de la vista 3D y en las propiedades de la obra lineal lo indica. Es solo una imagen: no se obtienen volúmenes ni secciones de ella. Abra puntos topográficos o una superficie y la carretera se mueve sola sobre el terreno real.

La exageración vertical estira el terreno, no la vegetación: las plantas se apoyan sobre el terreno exagerado con su altura y extensión reales, así que un árbol se ve como árbol con cualquier ajuste. Las plantas son formas sencillas, no modelos detallados: miles de ellas siguen siendo rápidas para girar y hacer zoom.

## Tuberías y estructuras

- Una tubería se dibuja con su parte inferior interior en las plantillas que usted define y su parte superior interior (la clave) un diámetro interior más arriba. Los diámetros van en pulgadas en un proyecto en pies y en milímetros en un proyecto en metros, como en el panel derecho.
- Una estructura va desde su brocal (escrito, o tomado de la superficie) hasta su sumidero (la plantilla más baja menos la profundidad del sumidero). Sin ninguna plantilla, se dibuja con 5 ft (1.5 m) de profundidad.
- Las tuberías y estructuras con un problema (vea la revisión de red en el panel derecho) se dibujan en rojo.
- Una tubería sin plantillas no se dibuja; una nota en la parte inferior de la vista indica cuántas son.

## Seleccionar desde la vista 3D

Haga clic en una alineación (o su carretera), una plataforma, una línea característica, una tubería, una estructura, un punto topográfico, una planta, una rampa u otra obra dura. Queda seleccionado igual que si lo hubiera pulsado en la planta: sus propiedades se abren en el panel derecho, donde puede editarlas, y se dibuja en el color de selección por encima de todo en 3D. Lo que seleccione en la planta también se resalta en 3D. Una sugerencia junto al puntero indica lo que pulsó con su este, norte y elevación. Las tuberías y estructuras pueden seleccionarse aun cuando están bajo tierra; una línea oculta tras una colina no puede seleccionarse a través de ella.

Haga clic en una línea de quiebre para ver cuál es: se resalta y la barra de estado la nombra (las líneas de quiebre no tienen propiedades propias).

Haga clic en el terreno para leer allí el este, el norte y la elevación en la sugerencia.

## Conducir a lo largo de una alineación

Haga clic en **Conducir** en la barra 3D y elija una alineación. La vista pasa al asiento del conductor: a 3.5 ft (1.07 m) sobre la carretera, sobre su perfil de proyecto (sobre el terreno existente a lo largo del eje cuando todavía no tiene uno), mirando hacia adelante.

- **Reproducir** o {{key:Space}} conduce a la velocidad que elija (de 10 a 65 mph, o de 15 a 100 km/h); {{key:Space}} de nuevo pausa. Se detiene al final; **Reproducir** entonces vuelve a empezar desde el principio.
- El control deslizante salta a cualquier estación; {{key:Left}} y {{key:Right}} avanzan o retroceden 10 ft (5 m).
- Arrastrar en la vista pausa y le permite mirar alrededor.
- **Detener** o {{key:Esc}} devuelve la vista a donde estaba.

La exageración vertical también se aplica al conducir: póngala en 1× para ver la carretera como quedará.

## Luz del sol

Abra **Sol** en la barra 3D y marque **Luz del sol**. Indique una fecha, una hora del reloj y su zona horaria (el desfase respecto de UTC: en verano, el del horario de verano), y la latitud y longitud del sitio. Cuando el proyecto tiene un sistema de coordenadas, estos datos se completan desde él.

El sitio se ilumina entonces desde donde está el sol, con **Sombras** sobre el terreno, la obra lineal y las plataformas; el menú indica el azimut del sol y su altura, o que está bajo el horizonte. Las posiciones provienen de las ecuaciones solares de NOAA. Las sombras caen correctamente con cualquier exageración, pero se detienen en el borde del sitio: las colinas y edificios más allá de él no proyectan ninguna.

## Exportar la vista 3D

Haga clic en {{ui:GLB}} u {{ui:OBJ}} en la barra. Lo que muestra la vista se guarda a escala real (sin exageración), en metros, con Y hacia arriba. Detalles: [Exportar el sitio en 3D](topic:export-3d).
