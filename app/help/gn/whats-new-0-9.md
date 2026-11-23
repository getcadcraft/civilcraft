---
title: Novedades de la 0.9 (anteriores)
summary: Plantillas de corredor y de terreno, ajustes y botones Elegir al dibujar, análisis GIS con una tabla de atributos, estudios de sombra, rendimiento solar, confort y viento para un sitio, una vista 3D de render, y los complementos Nubes de puntos y WaterCraft.
keywords: novedades 0.9, versión anterior, novedades, 0.9, notas de la versión, plantillas de corredor, plantillas de terreno, editor de plantillas, sección típica, varios corredores, ajuste, ajustes, elegir, mover, copiar, rotar, tangente, render, render 3d, análisis gis, buffer, superposición, unión espacial, tabla de atributos, dar estilo por atributo, estudio de sombra, rendimiento solar, utci, confort exterior, estudio de viento, openfoam, nubes de puntos, las, laz, watercraft, caudal de incendio, hidrante, edad del agua, cloro, demandas, información emergente, diseño, lluvia, pluvial, encharcamiento, desbordamiento, movimiento de suelo, equilibrio, corte y relleno, acarreo, mejor recorrido, menor costo, trazado, estanque de detención, salida, abatimiento, resguardo, avance, relevamiento, dron, acopio, dirección a predio, parcela, suelo, inundación, estabilidad de taludes, bishop, asentamiento, empalme, señalización, señales, distancia de visibilidad, ajuste, mínimos cuadrados, poligonal, mina a cielo abierto, enlace de radio, fresnel, desvío, cruce, idiomas, problemas, en vivo, dwg
from: 4664522c
---

Esto es lo que cambió en CivilCraft 0.9, comparado con 0.8.1. CivilCraft 0.9 es parte de CadCraft Studio 0.9 y de sus ocho aplicaciones. Las partes principales son las plantillas de corredor y de terreno, los ajustes al dibujar, el análisis GIS, los estudios del sol, el rendimiento solar, el confort y el viento de un sitio, y dos complementos: Nubes de puntos y WaterCraft.

## Novedades

### Plantillas de corredor y de terreno

- **Plantillas de corredor.** Abrí {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas del corredor…}} (o escribí {{cmd:TEMPLATES}}). Una plantilla es una pequeña sección transversal con componentes, desplazamientos, pendientes, materiales y códigos de punto. Guardalas en el proyecto, en {{ui:Mi biblioteca}} o como un archivo `.cctemplates.json`. El editor de plantillas muestra un dibujo a escala real y lista los problemas a medida que escribís.
- **Construir desde plantillas por estación.** Seleccioná un trazado y activá {{ui:Construir desde plantillas por estación}} en sus Propiedades. Cada lado de cada región tiene su propia lista de pavimento y su propia condición de extremo. {{ui:Agregar un corredor}} bajo {{ui:Corredores en este trazado}} pone varios corredores en un mismo trazado.
- **Plantillas de terreno.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de terreno…}} (o escribí {{cmd:TERRAINTEMPLATES}}) extiende materiales en capas, como capa vegetal o pavimento y base, sobre un terreno, con área y volumen por capa. Mirá [Plantillas de corredor y plantillas de terreno](topic:corridor-templates).

### Dibujo

- **Ajustes.** Las herramientas Trazado, Pad, Parcela, Masa, Línea de rasgo, Medir, Límite y Cuenca se ajustan a puntos de relevamiento, PI, esquinas, vértices y estructuras, con un rótulo junto al marcador. Mantené {{key:Alt}} para un punto libre.
- **Botones Elegir, tangente y mover, copiar, rotar.** Las esquinas de pad, parcela y línea de rasgo tienen casillas de Este y Norte escritas y un botón Elegir con cruz. Las Propiedades también tienen {{ui:Tangente desde dos puntos}} para trazados y {{ui:Mover, copiar y rotar}} para trazados, pads, parcelas y líneas de rasgo. Mirá [Dibujar con ajustes, esquinas elegidas y mover, copiar, rotar](topic:draft-with-snaps).
- **Vista de render en 3D.** El botón {{ui:Render}} de la barra 3D dibuja el terreno con colores naturales, cielo, neblina y sombras suaves. No cambia el modelo. El menú {{ui:Sol}} ahora tiene los botones {{ui:Aplicar}} y {{ui:Cerrar}}. Mirá [Ver el sitio en 3D](topic:site-3d).
- **Los paneles se abren una sección por vez.** El panel izquierdo y el panel de Propiedades abren una sección y cierran las otras, y las fichas de la cinta de Paisajismo que contienen varias herramientas son botones divididos.

### Análisis GIS

- **Analizar.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Analizar}} ofrece buffer, superposición, unión espacial, selección por atributo o forma, y medición. Cada herramienta crea una capa nueva en un solo paso de deshacer.
- **Tabla de atributos.** El menú de tres puntos de una capa tiene {{ui:Tabla de atributos…}} y {{ui:Dar estilo por atributo…}}. Mirá [Analizar capas GIS](topic:gis-analysis) y [Trabajar con la tabla de atributos de una capa](topic:gis-table).

### El sitio: sol, energía solar, confort y viento

- **Sección de entorno.** Seleccioná un volumen: la sección {{ui:Entorno}} está bajo {{ui:Horas de sol}} en sus Propiedades. Tiene un estudio de sombra (mapa, tabla, animación, CSV), rendimiento solar a partir de un archivo meteorológico de año típico (.epw) y confort exterior (UTCI).
- **Viento, solo para evaluación preliminar.** {{ui:Ejecutar estudio de viento}} colorea el terreno desde sentado hasta incómodo para cada dirección de viento del archivo meteorológico. No está validado, y el panel lo dice.
- **Complemento de viento peatonal (OpenFOAM).** Apagado hasta que lo actives en {{ui:Configuración}} › {{ui:Complementos}}. OpenFOAM es un software que instalás vos mismo. Mirá [Sombra, rendimiento solar y confort exterior](topic:environment).

### Nubes de puntos (complemento)

- Activá {{ui:Nubes de puntos}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña Nubes de puntos en el panel derecho. Abrí un archivo LAS o LAZ, limpialo, ordenalo en suelo, vegetación y edificios, construí el terreno, las curvas de nivel y los volúmenes, y exportá LAS o LAZ. Mirá [Nubes de puntos desde un dron o escáner](topic:point-clouds).

### WaterCraft (complemento)

- Activá {{ui:WaterCraft (distribución de agua)}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña WaterCraft. Tiene demandas de clientes, caudal de incendio en cada hidrante, qué corte de cañería importa más, y edad del agua y cloro, cada uno guardado como CSV. Mirá [WaterCraft: demandas, caudal de incendio, cortes y edad del agua](topic:watercraft).

### Trabajo en conjunto

- En una sesión En vivo ves los cursores y nombres de los demás en el plano. Plantas de la biblioteca: CivilCraft Landscape empieza desde su colección predeterminada de la Biblioteca, {{ui:CivilCraft paisajismo}}.

## En todas las aplicaciones

- Las indicaciones se muestran como información emergente de Bootstrap, y el consejo de inicio puede cerrarse.
- La franja de pestañas de un panel que no entra se desplaza en lugar de cortarse.
- Los títulos de las pestañas del navegador dicen `<documento> - CivilCraft | CadCraft`.
- {{ui:Configuración}} tiene una sección de Diseño, donde los diseños son una lista desplegable de opciones de dos líneas.
- Las unidades de peso y temperatura están en {{ui:Configuración}} › {{ui:Global}} › {{ui:Unidades}}.
- La lista de idiomas muestra los idiomas para los que la versión tiene archivos. Los idiomas distintos del inglés son borradores de máquina.

## Corregido

- Los complementos de búsqueda de direcciones y de verificación de EnergyPlus no se podían activar; ahora sí.
- La ayuda ahora dice que el complemento Nubes de puntos escribe una nube limpia como LAS 1.4 o LAZ.
- Hacer clic en la agarradera del propio objeto seleccionado ya no inicia un arrastre de agarradera que detenía un Elegir en espera.

## Límites reconocidos

- Las plantillas de corredor de ejemplo son provisorias y no provienen de ninguna norma; un ingeniero debe verificarlas. Las plantillas de terreno no agregan superficie y no se dibujan en 3D ni en la vista de sección. El segundo corredor de un trazado no está en la exportación IFC. No hay ahusamiento entre dos plantillas por estación.
- Las nubes de puntos se probaron con archivos inventados, no con un relevamiento real de dron. Solo se leen LAS y LAZ.
- El análisis GIS se probó con capas inventadas.
- Sombra, sol y confort son estimaciones de planificación; el viento es una evaluación preliminar no validada. Nada de eso es un valor de diseño.
- WaterCraft es una ayuda de cálculo verificada con redes inventadas. Un ingeniero de aguas decide qué valen los números.
- Los idiomas distintos del inglés son borradores de máquina.
- Los instaladores de Windows no están firmados con código, y la imagen de disco de macOS no está notarizada.

## Anteriores: 0.8 y 0.8.1

Esto es lo que cambió en CivilCraft 0.8 (2026-11-01) y 0.8.1 (2026-11-02), comparado con 0.7. Las partes nuevas principales son herramientas que prueban tu nivelación y tu sitio (lluvia, movimiento de suelo, recorridos, estanques, avance), y seis ventanas de cálculo para terreno, caminos, relevamiento, minas, enlaces y ferrocarril.

### Novedades

**Probá tu nivelación**

- **Que llueva.** {{ui:Que llueva…}} (bajo {{ui:Superficie}}) descarga una tormenta sobre el terreno nivelado. Ves cómo el agua escurre desde los pads, se encharca en las esquinas bajas y desborda los estanques demasiado chicos. La corrida se anima y da los volúmenes, el caudal pico de salida y un CSV de cada estanque. La celda predeterminada es gruesa para que una primera mirada sea rápida; una celda más fina es más lenta. Los estanques que desbordan también aparecen en el panel de Problemas.
- **Equilibrador de movimiento de suelo.** {{ui:Equilibrador de movimiento de suelo…}} sube o baja un pad hasta que el corte iguala al relleno, y muestra la tabla de acarreo entre ellos.
- **Mejor recorrido.** {{ui:Mejor recorrido…}}: elegí un inicio y un fin, y CivilCraft encuentra el camino más barato por el terreno que respeta tus límites de pendiente y curvatura, y luego arma un trazado con él.
- **Estanques de detención.** {{ui:Estanques de detención…}} calcula la cota y el almacenamiento a partir de tu terreno, toma dispositivos de salida (orificio, vertedero, vertedero en V, aliviadero), hace pasar una tormenta por el estanque y verifica el caudal retenido pico, el tiempo de vaciado y el resguardo.
- **Avance desde relevamientos.** {{ui:Avance desde relevamientos…}} compara superficies de dron o escaneo de distintas fechas con el terreno como estaba y con el diseño: porcentaje completado por volumen, áreas excavadas de más y rellenadas de más, acopios, y cuándo termina la obra a este ritmo (marcado como estimación).

**Conocé el sitio**

- **Dirección a predio.** {{ui:Dirección a predio…}} alinea datos abiertos de parcela, edificio, zonificación, suelo, inundación y terreno sobre un solo sitio. Podés guardar el sitio en el archivo del proyecto: la dirección escrita, cada fuente con el día en que la obtuviste y su licencia, y lo que devolvió. Reabrí o compartí el proyecto y el sitio sigue ahí, sin volver a obtener nada. También podés guardarlo como archivo de sitio o enviarlo a BimCraft. Mirá [Dirección a predio](topic:address-to-site).

**Terreno, caminos, relevamiento, minas, enlaces y ferrocarril**

- **Suelos y pendientes.** {{ui:Suelos y pendientes…}} dibuja el perfil de suelo entre las perforaciones que escribís. El método de Bishop busca entonces el círculo crítico en tu terreno, con nivel freático, sobrecarga y coeficiente sísmico; el asentamiento de una zapata incluye consolidación, asentamiento inmediato y tiempo.
- **Empalmes y señalización.** {{ui:Empalmes y señalización…}} une ramales con retornos de cordón (un radio por ramal, o retornos de tres centros), la distancia de visibilidad para la velocidad de diseño, una verificación de los triángulos de visibilidad, cruces peatonales, barras de parada, marcas y señales con una planilla de señales. Se dibujan en el plano y se guardan como .dxf con capas nombradas.
- **Ajuste de relevamiento.** {{ui:Ajuste de relevamiento…}} ejecuta un ajuste por mínimos cuadrados de una poligonal o red: coordenadas ajustadas, elipses de error, la prueba chi-cuadrado y una marca en la medición que no encaja. Se incluyen redes libres, el cierre de una poligonal por la regla de la brújula y RW5, y archivos de campo GSI, JobXML o CSV; los puntos ajustados se guardan como CSV.
- **Minas a cielo abierto.** {{ui:Minas a cielo abierto…}} convierte muestras de sondeo en un modelo de bloques y en el pit final dentro de tu ángulo de talud, con la relación de desmonte, una tabla por banco y una curva de ley y tonelaje. También hay pits anidados por factor de ingreso y un plan de producción con flujo de caja descontado.
- **Enlaces de radio.** {{ui:Enlaces de radio…}} verifica la línea de vista sobre tu terreno con la curvatura de la tierra, la primera zona de Fresnel, el balance del enlace, el margen de desvanecimiento y la interrupción por multitrayectoria, y da la altura de mástil que despejaría el trayecto. También hace balances de pérdida de fibra, cantidades de ruta y el viento sobre una torre.
- **Desvíos ferroviarios.** {{ui:Desvíos ferroviarios…}} arma un desvío a partir de su número de corazón, cruces entre vías paralelas y un gálibo de estructura inclinado por peralte y ensanchado en una curva. Un desvío puede ubicarse en una estación de un trazado.

Mirá [Suelos, empalmes, ajuste de relevamiento, minas, enlaces de radio y desvíos](topic:soils-roads-survey-mines-links).

### En todas las aplicaciones

- **Idiomas.** 54 idiomas, diez de ellos nuevos. Los idiomas distintos del inglés son borradores de máquina hasta que un hablante nativo los lea. Los temas de ayuda siguen siendo mayormente en inglés.
- **Filas de la barra de herramientas.** {{ui:Configuración}} › {{ui:General}} › {{ui:Filas de la barra}}: Ajustar (como antes), 2 filas o 1 fila. La Cinta de CivilCraft muestra la herramienta más usada en grande, las siguientes en pequeño, y el resto detrás de la flecha del nombre del grupo.
- **Dispositivos de entrada.** El trackpad, la pluma, el mouse 3D, el control y MIDI pueden manejar las aplicaciones.
- **Problemas.** Un panel de Problemas que avisa en cada aplicación, con verificaciones que leen paquetes de normativa.
- **En vivo.** Una vista de quién está dónde en una sesión En vivo.
- **Complementos.** Un listado de complementos, con complementos de iluminación.
- **Conectá tu IA.** Cualquier asistente que conectes puede manejar las herramientas de CivilCraft. Viene con una nota de que la conexión con un clic dentro de CadCraft Studio y el conector alojado todavía no están listos. Mirá [Dejá que un asistente de IA trabaje con tu sitio](topic:assistants).

### Corregido en 0.8.1

- **Sección de clases DWG.** Se leía como el tipo equivocado (GitHub cadcraft#5). Corregido en CivilCraft junto con CadCraft, BimCraft, ModelCraft y TakeoffCraft.
- **Cambio de idioma en ejecución.** CadCraft Studio y las ediciones empaquetadas pueden cambiar de idioma mientras corren. Antes solo estaban en inglés. Todavía no se probó en todas las plataformas: avisanos si el idioma no cambia.

### Todavía no en esta versión

- **Son ayudas de cálculo.** Cada resultado de las nuevas ventanas necesita la verificación de un ingeniero. Las resistencias del suelo parten de valores típicos del grupo de suelo, y la ventana lo dice.
- **Que llueva.** Una corrida en el sitio de ejemplo puede tardar más de dos minutos en el navegador con una celda fina. Se verificó con casos hechos a mano y una cuenca en V, pero todavía no en un sitio nivelado real.
- **Dirección a predio.** Lee archivos de datos abiertos que vos traés, y se probó solo con nuestros propios archivos. Los árboles no son una fuente. Buscar las fuentes por vos depende de la redacción sobre privacidad.
- **Avance desde relevamientos.** Probado solo con relevamientos inventados. El avance en hojas y anotaciones (MarkupCraft) y el escaneo contra modelo (BimCraft) no están construidos.
- **Suelos y pendientes.** Solo superficies circulares: no hay búsqueda en cuña ni en bloque, ni grieta de tracción.
- **Empalmes.** Un radio por ramal, sin trayectorias de camiones, y todavía no entran en el corredor.
- **Archivos de campo.** Los lectores se escribieron a partir de descripciones públicas de formato y se probaron con archivos que hicimos nosotros. Se necesitan archivos de instrumentos reales.
- **Enlaces y ferrocarril.** Enlaces de radio: solo pérdida en espacio libre y multitrayectoria (sin atenuación por lluvia ni patrones de antena), y ninguna norma ferroviaria: cada límite ferroviario es provisorio, con números de borrador que ningún ingeniero ferroviario verificó.
- **Windows y macOS.** La 0.8 no está firmada con código. Windows puede advertir, y macOS pide clic derecho y luego Abrir.

Todo lo demás está en [Todavía no construido](topic:not-built-yet). Para la versión anterior, mirá [Novedades de la 0.7](topic:whats-new-0-7).
