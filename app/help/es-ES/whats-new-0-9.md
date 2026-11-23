---
title: Novedades de la versión 0.9 (anteriores)
summary: Plantillas de corredor y de terreno, ajustes y botones de selección al dibujar, análisis GIS con tabla de atributos, estudios de sombra, producción solar, confort y viento para un emplazamiento, una vista de Render 3D, y los complementos Nubes de puntos y WaterCraft.
keywords: novedades 0.9, versión anterior, novedades, 0.9, notas de la versión, plantillas de corredor, plantillas de terreno, editor de plantillas, sección tipo, varios corredores, ajuste, ajustes, selección, botón de selección, mover, copiar, girar, tangente, render, render 3D, análisis GIS, zona de influencia, superposición, unión espacial, tabla de atributos, estilo por atributo, estudio de sombra, producción solar, UTCI, confort exterior, estudio de viento, OpenFOAM, nubes de puntos, LAS, LAZ, WaterCraft, caudal contra incendios, hidrante, edad del agua, cloro, demandas, información emergente, diseño, lluvia, tormenta, encharcamiento, desbordamiento, movimiento de tierras, equilibrio, desmonte y terraplén, acarreo, mejor trazado, coste mínimo, trazado, balsa de detención, desagüe, vaciado, resguardo, avance, topografía, dron, acopio, parcela, suelo, inundación, estabilidad de taludes, Bishop, asentamiento, intersección, señalización, distancia de visibilidad, ajuste, mínimos cuadrados, poligonal, mina a cielo abierto, modelo de bloques, enlace de radio, Fresnel, desvío, cambio de vía, idiomas, problemas, en directo, DWG, registro de cambios, cambios, 0.8, 0.8.1, versión, funciones nuevas
from: 4664522c
---

Esto es lo que cambió en CivilCraft 0.9, comparado con 0.8.1. CivilCraft 0.9 forma parte de CadCraft Studio 0.9 y de sus ocho aplicaciones. Las partes principales son las plantillas de corredor y de terreno, los ajustes al dibujar, el análisis GIS, los estudios del sol, la producción solar, el confort y el viento de un emplazamiento, y dos complementos: Nubes de puntos y WaterCraft.

## Novedades

### Plantillas de corredor y de terreno

- **Plantillas de corredor.** Abra {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de corredor…}} (o escriba {{cmd:TEMPLATES}}). Una plantilla es una pequeña sección transversal con componentes, desplazamientos, pendientes, materiales y códigos de punto. Guárdelas en el proyecto, en {{ui:Mi biblioteca}} o como archivo `.cctemplates.json`. El editor de plantillas muestra un dibujo a escala real y enumera los problemas mientras escribe.
- **Construir a partir de plantillas por P.K.** Seleccione un trazado y active {{ui:Construir a partir de plantillas por P.K.}} en sus Propiedades. Cada lado de cada tramo tiene su propia lista de firme y su propia condición final. {{ui:Añadir un corredor}} en {{ui:Corredores en este trazado}} coloca varios corredores en un mismo trazado.
- **Plantillas de terreno.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de terreno…}} (o escriba {{cmd:TERRAINTEMPLATES}}) extiende materiales por capas, como tierra vegetal o firme y base, sobre un terreno, con superficie y volumen por capa. Vea [Plantillas de corredor y de terreno](topic:corridor-templates).

### Dibujo

- **Ajustes.** Las herramientas Trazado, Plataforma, Parcela, Volumen de edificación, Línea característica, Medir, Contorno y Cuenca se ajustan a puntos topográficos, PI, esquinas, vértices y estructuras, con una etiqueta junto al marcador. Mantenga pulsado {{key:Alt}} para un punto libre.
- **Botones de selección, tangente y mover, copiar, girar.** Las esquinas de plataforma, parcela y línea característica tienen casillas de Este y Norte escritas y un botón de selección con cruceta. Propiedades también tiene {{ui:Tangente desde dos puntos}} para trazados y {{ui:Mover, copiar y girar}} para trazados, plataformas, parcelas y líneas características. Vea [Dibujar con ajustes, esquinas elegidas y mover, copiar, girar](topic:draft-with-snaps).
- **Vista de render en 3D.** El botón {{ui:Render}} de la barra 3D dibuja el terreno con colores naturales, cielo, neblina y sombras suaves. No cambia el modelo. El menú {{ui:Sol}} tiene ahora los botones {{ui:Aplicar}} y {{ui:Cerrar}}. Vea [Ver el emplazamiento en 3D](topic:site-3d).
- **Los paneles se abren de una sección en una.** El panel izquierdo y el panel de Propiedades abren una sección y cierran las demás, y las fichas de la cinta de Paisajismo que contienen varias herramientas son botones divididos.

### Análisis GIS

- **Analizar.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Analizar}} ofrece zona de influencia, superposición, unión espacial, selección por atributo o forma, y medir. Cada herramienta crea una capa nueva en un solo paso de deshacer.
- **Tabla de atributos.** El menú de tres puntos de una capa tiene {{ui:Tabla de atributos…}} y {{ui:Estilo por atributo…}}. Vea [Analizar capas GIS](topic:gis-analysis) y [Trabajar con la tabla de atributos de una capa](topic:gis-table).

### El emplazamiento: sol, producción solar, confort y viento

- **Sección de entorno.** Seleccione un volumen: la sección {{ui:Entorno}} aparece bajo {{ui:Horas de sol}} en sus Propiedades. Tiene un estudio de sombra (mapa, tabla, animación, CSV), producción solar a partir de un archivo meteorológico de año típico (.epw) y confort exterior (UTCI).
- **Viento, solo como cribado.** {{ui:Ejecutar estudio de viento}} colorea el terreno desde sentarse hasta resultar incómodo, para cada dirección del viento del archivo meteorológico. No está validado y el panel lo indica.
- **Complemento de viento peatonal (OpenFOAM).** Desactivado hasta que lo active en {{ui:Configuración}} › {{ui:Complementos}}. OpenFOAM es un programa que usted instala por su cuenta. Vea [Sombra, producción solar y confort exterior](topic:environment).

### Nubes de puntos (complemento)

- Active {{ui:Nubes de puntos}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña Nubes de puntos en el panel derecho. Abra un archivo LAS o LAZ, límpielo, clasifíquelo en terreno, vegetación y edificios, genere el terreno, las curvas de nivel y los volúmenes, y exporte LAS o LAZ. Vea [Nubes de puntos de un dron o escáner](topic:point-clouds).

### WaterCraft (complemento)

- Active {{ui:WaterCraft (distribución de agua)}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña WaterCraft. Tiene demandas de abonados, caudal contra incendios en cada hidrante, qué corte de conducción importa más, y edad del agua y cloro, cada uno guardado como CSV. Vea [WaterCraft: demandas, caudal contra incendios, cortes y edad del agua](topic:watercraft).

### Trabajo en equipo

- En una sesión en directo ve los cursores y nombres de los demás en la planta. Plantas de la biblioteca: CivilCraft Paisajismo parte de su colección predeterminada de la biblioteca, {{ui:CivilCraft paisajismo}}.

## En todas las aplicaciones

- Las sugerencias se muestran como información emergente de Bootstrap, y el consejo de inicio se puede cerrar.
- La franja de pestañas de un panel que no cabe se desplaza en lugar de cortarse.
- Los títulos de las pestañas del navegador son `<documento> - CivilCraft | CadCraft`.
- {{ui:Configuración}} tiene una sección de Disposición donde las disposiciones son una lista desplegable de opciones de dos líneas.
- Las unidades de peso y temperatura están en {{ui:Configuración}} › {{ui:Global}} › {{ui:Unidades}}.
- La lista de idiomas muestra los idiomas para los que la versión tiene archivos. Los idiomas distintos del inglés son borradores automáticos.

## Corregido

- Los complementos de búsqueda de direcciones y de comprobación de EnergyPlus no se podían activar; ahora sí.
- La ayuda indica ahora que el complemento Nubes de puntos escribe una nube depurada como LAS 1.4 o LAZ.
- Hacer clic en el propio agarre del objeto seleccionado ya no inicia un arrastre de agarre que detenía una selección en espera.

## Límites reales

- Las plantillas de corredor de ejemplo son provisionales, sin norma; un ingeniero debe comprobarlas. Las plantillas de terreno no añaden superficie y no se dibujan en 3D ni en la vista de sección. El segundo corredor de un trazado no está en la exportación IFC. No hay ahusamiento entre dos plantillas por P.K.
- Las nubes de puntos se probaron con archivos ficticios, no con un levantamiento real con dron. Solo se leen LAS y LAZ.
- El análisis GIS se probó con capas ficticias.
- El sombreado, la producción solar y el confort son estimaciones de planificación; el viento es un cribado no validado. Nada de ello es un valor de proyecto.
- WaterCraft es una herramienta de cálculo comprobada en redes ficticias. Un ingeniero de aguas decide el valor de las cifras.
- Los idiomas distintos del inglés son borradores automáticos.
- Los instaladores de Windows no tienen firma de código, y la imagen de disco de macOS no está notarizada.

## Anteriores: 0.8 y 0.8.1

Esto es lo que cambió en CivilCraft 0.8 (2026-11-01) y 0.8.1 (2026-11-02), comparado con 0.7. Las nuevas partes principales son herramientas que comprueban su nivelación y su emplazamiento (lluvia, movimiento de tierras, trazados, balsas, avance) y seis ventanas de cálculo para terreno, carreteras, topografía, minas, enlaces y ferrocarril.

### Novedades

**Compruebe su nivelación**

- **Hacer llover.** {{ui:Hacer llover…}} (en {{ui:Superficie}}) descarga una tormenta sobre el terreno nivelado. Ve cómo el agua escurre de las plataformas, se encharca en las esquinas bajas y desborda las balsas demasiado pequeñas. El cálculo es animado y da los volúmenes, el caudal punta de salida y un CSV de cada balsa. La celda predeterminada es gruesa para que una primera vista sea rápida; una celda más fina es más lenta. Las balsas que desbordan aparecen también en el panel de Problemas.
- **Compensador de movimiento de tierras.** {{ui:Compensador de movimiento de tierras…}} sube o baja una plataforma hasta que el desmonte iguala al terraplén, y muestra la tabla de acarreo entre ellos.
- **Mejor trazado.** {{ui:Mejor trazado…}}: elija un inicio y un final, y CivilCraft busca el camino más barato a través del terreno que respeta sus límites de pendiente y de curva, y luego crea un trazado a partir de él.
- **Balsas de detención.** {{ui:Balsas de laminación…}} calcula el nivel de agua y el almacenamiento a partir de su terreno, admite dispositivos de salida (orificio, vertedero, vertedero en V, aliviadero), hace pasar una tormenta por la balsa y comprueba el caudal punta retenido, el tiempo de vaciado y el resguardo.
- **Avance a partir de levantamientos.** {{ui:Avance a partir de levantamientos…}} compara superficies de dron o escaneo de fechas distintas con el terreno tal como estaba y con el proyecto: porcentaje completado por volumen, áreas excavadas de más y rellenadas de más, acopios, y cuándo termina la obra a este ritmo (marcado como estimación).

**Conozca el emplazamiento**

- **De la dirección al emplazamiento.** {{ui:De la dirección a la parcela…}} reúne en un solo emplazamiento datos abiertos de parcela, edificio, zonificación, suelo, inundación y terreno. Puede guardar el emplazamiento en el archivo del proyecto: la dirección escrita, cada fuente con el día en que la obtuvo y su licencia, y lo que devolvió. Al reabrir o compartir el proyecto, el emplazamiento sigue ahí, sin volver a obtener nada. También puede guardarlo como archivo de emplazamiento o enviarlo a BimCraft. Vea [De la dirección al emplazamiento](topic:address-to-site).

**Terreno, carreteras, topografía, minas, enlaces y ferrocarril**

- **Suelos y taludes.** {{ui:Suelos y taludes…}} dibuja el perfil del suelo entre sondeos que escriba. El método de Bishop busca después el círculo crítico sobre su terreno, con nivel freático, sobrecarga y coeficiente sísmico; el asentamiento de una zapata incluye consolidación, asentamiento inmediato y tiempo.
- **Intersecciones y marcas viales.** {{ui:Intersecciones y marcas viales…}} reúne los ramales con radios de bordillo (un radio por ramal, o retornos de tres centros), la distancia de visibilidad para la velocidad de proyecto, una comprobación de los triángulos de visibilidad, pasos de peatones, líneas de detención, marcas y señales con un cuadro de señales. Se dibujan en la planta y se guardan como .dxf con capas con nombre.
- **Ajuste topográfico.** {{ui:Ajuste topográfico…}} ejecuta un ajuste por mínimos cuadrados de una poligonal o red: coordenadas ajustadas, elipses de error, la prueba de chi cuadrado y una marca en la medición que no encaja. Se incluyen redes libres, cierre de una poligonal por la regla de la brújula y RW5, archivos de campo GSI, JobXML o CSV, y los puntos ajustados se guardan como CSV.
- **Minas a cielo abierto.** {{ui:Cortas a cielo abierto…}} convierte muestras de sondeo en un modelo de bloques y en la corta final dentro de su ángulo de talud, con la relación de estéril, una tabla por banco y una curva de ley y tonelaje. También hay cortas anidadas por factor de ingreso y un programa de producción con flujo de caja descontado.
- **Enlaces de radio.** {{ui:Radioenlaces…}} comprueba la visibilidad sobre su terreno con la curvatura terrestre, la primera zona de Fresnel, el balance del enlace, el margen de desvanecimiento y la interrupción por multitrayecto, y da la altura de mástil que despejaría el trayecto. También hace balances de pérdidas de fibra, cantidades de trazado y el viento sobre una torre.
- **Desvíos ferroviarios.** {{ui:Desvíos ferroviarios…}} genera un desvío a partir de su número de corazón, escapes entre vías paralelas y un gálibo de obra inclinado por el peralte y ensanchado en una curva. Un desvío puede situarse en un P.K. de un trazado.

Vea [Suelos, intersecciones, ajuste topográfico, minas, enlaces de radio y desvíos](topic:soils-roads-survey-mines-links).

### En todas las aplicaciones

- **Idiomas.** 54 idiomas, diez de ellos nuevos. Los idiomas distintos del inglés son borradores automáticos hasta que los lea un hablante nativo. Los temas de ayuda siguen siendo mayoritariamente en inglés.
- **Filas de la barra de herramientas.** {{ui:Configuración}} › {{ui:General}} › {{ui:Filas de la barra de herramientas}}: Ajustar (como antes), 2 filas o 1 fila. La cinta de CivilCraft muestra la herramienta más usada grande, las siguientes pequeñas, y el resto tras la flecha del nombre del grupo.
- **Dispositivos de entrada.** El panel táctil, el lápiz, el ratón 3D, el mando y MIDI pueden manejar las aplicaciones.
- **Problemas.** Un panel de Problemas que avisa en todas las aplicaciones, con comprobaciones que leen los paquetes de normativa.
- **En directo.** Una vista de quién está dónde en una sesión en directo.
- **Complementos.** Un listado de complementos, con complementos de iluminación.
- **Conecte su IA.** Cualquier asistente que conecte puede manejar las herramientas de CivilCraft. Viene con una nota que indica que la conexión con un solo clic dentro de CadCraft Studio y el conector alojado aún no están listos. Vea [Deje que un asistente de IA trabaje con su emplazamiento](topic:assistants).

### Corregido en 0.8.1

- **Sección de clases DWG.** Se leía como un tipo incorrecto (GitHub cadcraft#5). Corregido en CivilCraft junto con CadCraft, BimCraft, ModelCraft y TakeoffCraft.
- **Cambio de idioma en ejecución.** CadCraft Studio y las ediciones empaquetadas pueden cambiar de idioma en tiempo de ejecución. Antes solo estaban en inglés. Aún no se ha probado en todas las plataformas: díganos si el idioma no cambia.

### Todavía no incluido en esta versión

- **Son herramientas de cálculo.** Cada resultado de las nuevas ventanas necesita la comprobación de un ingeniero. Las resistencias del suelo parten de valores típicos del grupo de suelo, y la ventana lo indica.
- **Hacer llover.** Un cálculo en el emplazamiento de ejemplo puede tardar más de dos minutos en el navegador con una celda fina. Se comprobó con casos hechos a mano y una cuenca en forma de V, pero aún no en un emplazamiento real nivelado.
- **De la dirección al emplazamiento.** Lee archivos de datos abiertos que usted aporta, y solo se probó con nuestros propios archivos. Los árboles no son una fuente. La obtención de fuentes por usted queda pendiente de la redacción sobre privacidad.
- **Avance a partir de levantamientos.** Probado solo con levantamientos ficticios. El avance en hojas y marcas (MarkupCraft) y el escaneo frente al modelo (BimCraft) no están construidos.
- **Suelos y taludes.** Solo superficies circulares: sin búsqueda en cuña ni en bloque, y sin grieta de tracción.
- **Intersecciones.** Un radio por ramal, sin trayectorias de giro de camiones, y aún no entran en el corredor.
- **Archivos de campo.** Los lectores se escribieron a partir de descripciones públicas de formato y se probaron con archivos que hicimos nosotros. Se necesitan archivos reales de instrumentos.
- **Enlaces y ferrocarril.** Enlaces de radio: solo pérdida en espacio libre y multitrayecto (sin desvanecimiento por lluvia ni diagramas de antena), y ninguna norma ferroviaria: cada límite ferroviario es provisional, con cifras de borrador que ningún ingeniero ferroviario ha comprobado.
- **Windows y macOS.** 0.8 no tiene firma de código. Windows puede avisar, y macOS pide hacer clic con el botón derecho y después Abrir.

Todo lo demás está en [Aún no disponible](topic:not-built-yet). Para la versión anterior, vea [Novedades de la versión 0.7](topic:whats-new-0-7).
