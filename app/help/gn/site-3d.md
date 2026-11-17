---
title: Ver el sitio en 3D
summary: Abrir la vista 3D, orbitar, desplazar y hacer zoom, fijar la exageración vertical y el color, elegir qué se muestra, y hacer clic en trazados, plataformas, líneas de elementos, líneas de quiebre, caños, estructuras y puntos para seleccionarlos.
keywords: etiquetas, etiquetas 3d, billboard, etiquetas de cara a la cámara, etiquetas de estación, etiquetas de curvas de nivel, etiquetas de puntos, drape, aéreo, capas de mapa sobre la superficie, 3d, tres d, vista 3d, cubo de vista, brújula, orbitar, perspectiva, paralela, isométrica, iso, exageración vertical, terreno, modelo, modelo del sitio, volar alrededor, visualizar, render, caños en 3d, estructuras, cámaras, corredor 3d, camino en 3d, superficie del camino, carriles, cordones, veredas, plantas en 3d, árboles en 3d, arbustos, setos, paisaje 3d, rampas en 3d, escalones, muros, pavimento, duro 3d
from: a16bafe1
---

La vista 3D muestra el sitio como un solo modelo: el terreno existente y la superficie graduada, las curvas de nivel proyectadas sobre ellos, las líneas de quiebre y el borde de la superficie, cada trazado sobre su perfil de diseño con marcas de estación, las líneas de elementos del corredor y el camino en sí (carriles, bermas, cunetas, cordones, franjas y veredas en sus propios colores), las plataformas con sus líneas de terreno, la red de caños con caños y estructuras a sus cotas reales, y desde el espacio de trabajo de Paisajismo, las plantas, el pavimento, los senderos, los muros, los cordones, las rampas y los escalones. Lee el mismo proyecto que el plano, así que cada edición se ve en ambos.

## Abrir la vista 3D

1. Abrí puntos de levantamiento (o un archivo LandXML o de proyecto) para que haya una superficie. Plantas, pavimento o rampas solos también alcanzan para abrirla.
2. Presioná {{key:D}}, o hacé clic en {{ui:3D}} en el grupo {{ui:Vista}} de la barra de herramientas.
   La vista 3D se abre sobre el plano, mirando todo el sitio desde el sureste. La primera vez tarda un momento en cargar.
3. Presioná {{key:D}} de nuevo, o hacé clic otra vez en {{ui:3D}}, para volver al plano. Elegir una herramienta de dibujo como {{ui:Alineación}} o {{ui:Plataforma}} también vuelve al plano, ya que el dibujo se hace allí.

## Moverse

| Para | Hacer esto |
|---|---|
| Orbitar | Arrastrar con el botón izquierdo o el central |
| Desplazar | Arrastrar con el botón derecho, o {{key:Shift}} y arrastrar |
| Hacer zoom | Girar la rueda; hace zoom hacia el puntero |
| Orbitar en un touchpad | Deslizar con dos dedos ({{key:Shift}} y deslizar desplaza) |
| Hacer zoom en un touchpad | Pellizcar |
| Táctil | Un dedo orbita; dos dedos pellizcan para hacer zoom y se mueven para desplazar |
| Teclas (la vista tiene el foco) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitan, con {{key:Shift}} desplazan; {{key:Plus}} y {{key:Minus}} hacen zoom |

La barra sobre la vista tiene el resto:

- La lista de vistas: **Iso**, **Superior**, **Inferior**, **Frente** (mirando al norte), **Posterior**, **Izquierda**, **Derecha**.
- {{ui:Perspectiva}}: presionado es una vista en perspectiva; hacé clic para una proyección paralela (sin escorzo).
- {{ui:Extensión}}: vuelve a mostrar todo. {{key:F}} hace lo mismo mientras la vista 3D está abierta.

## El cubo de vista

El cubo de vista en la esquina superior derecha gira con la vista. Hacé clic en un lado, un borde o una esquina para mirar el sitio desde allí (la cámara gira con suavidad salvo que tu sistema pida movimiento reducido). Arrastrá el cubo para orbitar. El anillo de brújula debajo muestra el norte (norte de la cuadrícula, +Y): arrastrá el anillo para girar el sitio alrededor de la vertical, o hacé clic en N, E, S o O para mirar desde ese lado. {{ui:Inicio}}, la pequeña casa en su esquina superior izquierda, vuelve a la vista isométrica de todo el sitio. Con el teclado: {{key:Tab}} hasta el cubo, las flechas eligen un lado, borde o esquina, {{key:Enter}} mira desde allí.

En el plano el mismo cubo muestra la parte superior. Hacé clic en cualquier otro lado, borde o esquina (o arrastralo) para abrir la vista 3D mirando desde allí: es la forma más rápida de pasar a 3D desde una dirección dada. Para cambiar el cubo por un pequeño icono de ejes, o para ocultarlo, ver **Indicador de esquina** en [Configuración de CivilCraft](topic:settings).

## Exagerar las cotas

Los sitios suelen ser mucho más anchos que altos, así que las cotas se estiran **2×** para empezar. Elegí **1×**, **2×**, **3×**, **5×** o **10×** en la lista de la barra, o en **Exageración vertical 3D** de [Configuración de CivilCraft](topic:settings) (las dos son una sola configuración). Solo cambia la vista: los volúmenes, perfiles y exportaciones quedan a escala real.

## Colorear las superficies

- **Bandas de cota**: las mismas bandas y colores que las bandas de cota del plano (la cantidad de bandas se fija en **Visualización** en el panel izquierdo). Cada borde de banda se corta exactamente en su cota.
- **Un color**: el terreno existente y la superficie graduada, cada uno en un color liso.
- **Capas de mapa**: las capas de mapa que se muestran debajo del plano (una imagen georreferenciada, teselas de mapa o un servicio de mapas; ver [Capas de mapa](topic:map-layers)) se extienden sobre las superficies como una lámina, así que una foto aérea se ve sobre las colinas. Las imágenes que todavía llegan se completan a medida que llegan. Sin capa de mapa visible, las superficies conservan sus bandas de cota y la vista lo dice. La imagen es para la pantalla: las exportaciones GLB y OBJ no la incluyen.

Cuando se muestran las dos superficies, el terreno existente es transparente sobre la superficie graduada, así puedés ver el corte (terreno por encima del diseño) y el terraplén.

## Elegir qué se muestra

Hacé clic en {{ui:Mostrar}} en la barra y marcá o desmarcá:

| Elemento | Qué es |
|---|---|
| Terreno existente | La superficie construida a partir de los puntos de levantamiento (o leída de LandXML) |
| Superficie graduada | El terreno existente con los corredores y las plataformas graduados (solo cuando hay alguno) |
| Bordes de triángulos | Cada borde de TIN, como líneas |
| Curvas de nivel | Curvas menores y mayores de cada superficie mostrada, al intervalo del plano |
| Borde de superficie | El borde exterior de cada superficie mostrada, en sus cotas |
| Líneas de quiebre | Cada línea de quiebre, en sus cotas |
| Trazados y estaciones | Cada trazado sobre su perfil de diseño (sobre el terreno cuando no hay perfil), con marcas cada 50 ft o 20 m |
| Líneas de elementos del corredor | Borde de calzada, berma y línea de terreno de ambos lados |
| Superficies de camino | El camino que construye cada corredor, desde su sección tipo: carriles, bermas, cunetas, cordones, franjas y veredas, cada uno en su color, sobre la superficie graduada |
| Plantas | Cada planta, y las plantas en canteros y setos, como formas simples dimensionadas desde la lista de plantas: un árbol es un tronco y una copa redonda (un cono para una conífera, un penacho sobre un tronco alto para una palmera), los arbustos, las plantas de seto, las perennes y los cubresuelos son cúpulas, los pastos son penachos, las trepadoras son columnas delgadas. Se apoyan sobre la superficie graduada (o el terreno existente) con el tamaño que muestra el plano: adulto, o al plantar |
| Obra dura | Pavimento y senderos con sus pendientes, muros, cordones, escalones, y rampas que suben en tramos con descansos nivelados entre ellos |
| Plataformas y líneas de terreno | El contorno de cada plataforma a su cota y su línea de terreno |
| Caños y estructuras | Caños como caños redondos entre sus fondos, estructuras desde el borde hasta el sumidero |
| Puntos de levantamiento | Un punto en cada punto con una cota (desactivado al principio) |
| Capas GIS | Las capas GIS que se muestran en el plano, en sus colores: líneas y contornos con sus propias cotas a esas cotas, otras apoyadas sobre el terreno existente (la siguen exactamente); los puntos como pequeñas cruces. Las formas sin cotas fuera de la superficie se omiten, y la vista dice cuántas |
| Etiquetas | Nombres y valores que siempre miran hacia vos: el nombre de cada trazado en su inicio y sus estaciones cada 100 ft (o 100 m), la cota de cada curva de nivel mayor, las plataformas, las líneas de elementos y las estructuras por nombre, y con **Puntos de levantamiento** marcado el número y la cota de cada punto |

Las etiquetas conservan el mismo tamaño y quedan derechas sin importar cómo gires o hagas zoom, y una colina delante de una etiqueta la oculta. Donde se amontonan, se ven las más importantes y el resto espera hasta que hagas zoom: primero los trazados, después las estructuras, las plataformas, las líneas de elementos, las estaciones, las curvas de nivel y los puntos, las más cercanas primero. Son solo para la pantalla; las exportaciones y los trazados las omiten.

Tus elecciones, la exageración y el color se recuerdan en este navegador.

Un camino se construye sobre el terreno existente. Con un trazado y un corredor pero sin puntos de levantamiento ni superficie todavía, el camino se dibuja sobre un terreno provisional plano: a la cota promedio de su perfil de diseño, o a nivel en la cota 0 cuando tampoco hay perfil. Un aviso en la parte inferior de la vista 3D y en las propiedades del corredor lo dice. Es solo una imagen: no salen volúmenes ni secciones de allí. Abrí puntos de levantamiento o una superficie y el camino pasa solo al terreno real.

La exageración vertical estira el terreno, no las plantas: se apoyan sobre el terreno exagerado a su altura y extensión reales, así que un árbol se ve como un árbol con cualquier configuración. Las plantas son formas simples, no modelos detallados: miles de ellas siguen siendo rápidas de girar y de ampliar.

## Caños y estructuras

- Un caño se dibuja con su fondo interior en los fondos que fijes y su parte superior interior (la clave) un diámetro interior más alto. Los diámetros van en pulgadas en un proyecto en pies y en milímetros en un proyecto métrico, como en el panel derecho.
- Una estructura va desde su borde (escrito, o desde la superficie) hasta su sumidero (el fondo más bajo menos la profundidad del sumidero). Sin ningún fondo, se dibuja con 5 ft (1,5 m) de profundidad.
- Los caños y las estructuras con un problema (ver la verificación de red en el panel derecho) se dibujan en rojo.
- Un caño sin fondos no se dibuja; una nota en la parte inferior de la vista dice cuántos son.

## Seleccionar desde la vista 3D

Hacé clic en un trazado (o su camino), una plataforma, una línea de elementos, un caño, una estructura, un punto de levantamiento, una planta, una rampa u otra obra dura. Queda seleccionado igual que si hubieras hecho clic en el plano: sus propiedades se abren en el panel derecho, donde podés editarlas, y se dibuja en el color de selección por encima de todo en 3D. Lo que selecciones en el plano también se resalta en 3D. Una sugerencia junto al puntero nombra lo que señalaste con su este, norte y cota. Los caños y las estructuras se pueden seleccionar aunque estén bajo tierra; una línea oculta detrás de una colina no se puede atravesar con clic.

Hacé clic en una línea de quiebre para ver cuál es: se resalta, y la barra de estado la nombra (las líneas de quiebre no tienen propiedades propias).

Hacé clic en el terreno para leer el este, norte y cota allí en la sugerencia.

## Conducir a lo largo de un trazado

Hacé clic en **Conducir** en la barra 3D y elegí un trazado. La vista se mueve a un asiento de conductor: 3.5 ft (1.07 m) sobre la ruta, sobre su perfil de diseño (sobre el terreno existente a lo largo del eje cuando todavía no tiene uno), mirando hacia adelante a lo largo de ella.

- **Reproducir** o {{key:Space}} conduce a la velocidad que elijas (10 a 65 mph, o 15 a 100 km/h); {{key:Space}} de nuevo pausa. Se detiene al final; **Reproducir** entonces empieza de nuevo desde el principio.
- El deslizador salta a cualquier estación; {{key:Left}} y {{key:Right}} avanzan o retroceden 10 ft (5 m).
- Arrastrar en la vista pausa y permite mirar alrededor.
- **Detener** o {{key:Esc}} devuelve la vista a donde estaba.

La exageración vertical también se aplica mientras se conduce: ponela en 1× para ver la ruta como va a quedar.

## Luz del sol

Abrí **Sol** en la barra 3D y marcá **Luz del sol**. Dá una fecha, una hora del reloj y su zona horaria (el desfase respecto de UTC: en verano, la del horario de verano), y la latitud y longitud del sitio. Cuando el proyecto tiene un sistema de coordenadas, se completan a partir de él.

El sitio queda entonces iluminado desde donde está el sol, con **Sombras** sobre el terreno, el corredor y las plataformas; el menú dice el azimut del sol y qué altura tiene, o que está bajo el horizonte. Las posiciones salen de las ecuaciones solares de NOAA. Las sombras caen del lado correcto con cualquier exageración, pero se detienen en el borde del sitio: las colinas y los edificios más allá no proyectan ninguna.

## Exportar la vista 3D

Hacé clic en {{ui:GLB}} u {{ui:OBJ}} en la barra. Lo que muestra la vista se guarda a escala real (sin exageración), en metros, con Y hacia arriba. Detalles: [Exportar el sitio en 3D](topic:export-3d).
