---
title: Novedades de la 0.9
summary: Plantillas de corredor y de terreno, ajustes a objetos y botones Seleccionar punto al dibujar, análisis GIS con tabla de atributos, estudios de sombra, producción solar, confort y viento de un sitio, una vista de Render 3D, y los complementos Nubes de puntos y WaterCraft.
keywords: novedades, 0.9, notas de la versión, plantillas de corredor, plantillas de terreno, editor de plantillas, sección tipo, varios corredores, snap, snaps, ajuste a objetos, seleccionar punto, mover, copiar, girar, tangente, render, render 3d, análisis gis, zona de influencia, superposición, unión espacial, tabla de atributos, estilo por atributo, estudio de sombra, producción solar, utci, confort exterior, estudio de viento, openfoam, nubes de puntos, las, laz, watercraft, caudal contra incendios, boca de incendio, edad del agua, cloro, demandas, información sobre herramientas, disposición, en vivo, problemas, idiomas, dwg, 0.8, 0.8.1, versión, nuevas funciones, lluvia, pluviales, movimiento de tierras, desmonte y terraplén, recorrido, balsas, avance, levantamiento, dron, acopio, dirección, parcela, suelo, inundación, talud, estabilidad, Bishop, asentamiento, intersección, marcas viales, señales, distancia de visibilidad, ajuste, mínimos cuadrados, poligonal, corta a cielo abierto, modelo de bloques, radioenlace, Fresnel, desvío ferroviario, cruzamiento, gálibo
from: d7ac5b14
---

Esto es lo que cambió en CivilCraft 0.9, en comparación con la 0.8.1. CivilCraft 0.9 forma parte de CadCraft Studio 0.9 y de sus ocho aplicaciones. Las partes principales son las plantillas de corredor y de terreno, los ajustes a objetos al dibujar, el análisis GIS, los estudios de sol, producción solar, confort y viento de un sitio, y dos complementos: Nubes de puntos y WaterCraft.

## Novedades

### Plantillas de corredor y de terreno

- **Plantillas de corredor.** Abra {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de corredor…}} (o escriba {{cmd:TEMPLATES}}). Una plantilla es una pequeña sección transversal con componentes, desplazamientos, pendientes, materiales y códigos de punto. Guárdelas en el proyecto, en {{ui:Mi biblioteca}} o como archivo `.cctemplates.json`. El editor de plantillas muestra un dibujo a escala real y enumera los problemas a medida que escribe.
- **Construir a partir de plantillas por P.K.** Seleccione un trazado y active {{ui:Construir a partir de plantillas por P.K.}} en sus Propiedades. Cada lado de cada región tiene su propia lista de firmes y su propia condición final. {{ui:Añadir un corredor}} bajo {{ui:Corredores en este trazado}} pone varios corredores en un mismo trazado.
- **Plantillas de terreno.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de terreno…}} (o escriba {{cmd:TERRAINTEMPLATES}}) dispone sobre un terreno materiales en capas, como tierra vegetal o firme y base, con área y volumen por capa. Véase [Plantillas de corredor y plantillas de terreno](topic:corridor-templates).

### Dibujo

- **Ajustes a objetos.** Las herramientas Trazado, Plataforma, Parcela, Volumen, Línea característica, Medir, Límite y Cuenca se ajustan a puntos de levantamiento, PI, esquinas, vértices y estructuras, con una etiqueta junto al marcador. Mantenga pulsada la tecla {{key:Alt}} para un punto libre.
- **Botones Seleccionar punto, tangente y mover, copiar, girar.** Las esquinas de plataforma, de parcela y de línea característica tienen cuadros de Este y Norte escritos y un botón Seleccionar punto con forma de cruz. Las Propiedades también tienen {{ui:Tangente desde dos puntos}} para trazados y {{ui:Mover, copiar y girar}} para trazados, plataformas, parcelas y líneas características. Véase [Dibujar con ajustes, esquinas seleccionadas y mover, copiar y girar](topic:draft-with-snaps).
- **Vista de render en 3D.** El botón {{ui:Render}} de la barra 3D dibuja el terreno con colores naturales, cielo, neblina y sombras suaves. No cambia el modelo. El menú {{ui:Sol}} tiene ahora los botones {{ui:Aplicar}} y {{ui:Cerrar}}. Véase [Ver el sitio en 3D](topic:site-3d).
- **Paneles que se abren de una sección en una.** El panel izquierdo y el panel de Propiedades abren una sección y cierran las demás, y las fichas de la cinta de Paisajismo que agrupan varias herramientas son botones divididos.

### Análisis GIS

- **Analizar.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Analizar}} ofrece zona de influencia, superposición, unión espacial, selección por atributo o por forma, y medir. Cada herramienta crea una capa nueva en un solo paso de deshacer.
- **Tabla de atributos.** El menú de tres puntos de una capa tiene {{ui:Tabla de atributos…}} y {{ui:Estilo por atributo…}}. Véase [Analizar capas GIS](topic:gis-analysis) y [Trabajar con la tabla de atributos de una capa](topic:gis-table).

### El sitio: sol, producción solar, confort y viento

- **Sección de entorno.** Seleccione un volumen: la sección {{ui:Entorno}} está bajo {{ui:Horas de sol}} en sus Propiedades. Tiene un estudio de sombra (mapa, tabla, animación, CSV), producción solar a partir de un archivo meteorológico de año típico (.epw) y confort exterior (UTCI).
- **Viento, solo como cribado.** {{ui:Ejecutar estudio de viento}} colorea el terreno desde «sentado» hasta «incómodo» para cada dirección del viento del archivo meteorológico. No está validado y el panel lo indica.
- **Complemento de viento peatonal (OpenFOAM).** Desactivado hasta que lo active en {{ui:Configuración}} › {{ui:Complementos}}. OpenFOAM es un software que usted instala por su cuenta. Véase [Sombra, producción solar y confort exterior](topic:environment).

### Nubes de puntos (complemento)

- Active {{ui:Nubes de puntos}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña de Nubes de puntos en el panel derecho. Abra un archivo LAS o LAZ, límpielo, clasifíquelo en suelo, vegetación y edificios, genere el terreno, las curvas de nivel y los volúmenes, y exporte LAS o LAZ. Véase [Nubes de puntos desde un dron o un escáner](topic:point-clouds).

### WaterCraft (complemento)

- Active {{ui:WaterCraft (distribución de agua)}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña WaterCraft. Incluye demandas de los abonados, caudal contra incendios en cada boca de incendio, qué corte de tubería importa más, y edad del agua y cloro, cada uno guardado como CSV. Véase [WaterCraft: demandas, caudal contra incendios, cortes y edad del agua](topic:watercraft).

### Trabajar en conjunto

- En una sesión en vivo ve los cursores y los nombres de los demás en el plano. Plantas de biblioteca: CivilCraft Landscape empieza con su colección predeterminada de biblioteca, {{ui:Paisajismo de CivilCraft}}.

## En todas las aplicaciones

- Las sugerencias aparecen como información sobre herramientas de Bootstrap, y el consejo de inicio se puede cerrar.
- La barra de fichas de un panel que no cabe se desplaza en lugar de cortarse.
- Los títulos de las pestañas del navegador tienen el formato `<documento> - CivilCraft | CadCraft`.
- {{ui:Configuración}} tiene una sección de Disposición, donde las disposiciones son una lista desplegable de opciones de dos líneas.
- Las unidades de peso y de temperatura están en {{ui:Configuración}} › {{ui:Global}} › {{ui:Unidades}}.
- La lista de idiomas muestra los idiomas para los que la compilación tiene archivos. Los idiomas distintos del inglés son borradores de máquina.

## Corregido

- Los complementos de búsqueda de direcciones y de comprobación con EnergyPlus no se podían activar; ahora sí.
- La ayuda indica ahora que el complemento Nubes de puntos escribe una nube limpia como LAS 1.4 o LAZ.
- Hacer clic en el agarre del propio objeto seleccionado ya no inicia un arrastre de agarre que detenía una selección de punto en espera.

## Límites honestos

- Las plantillas de corredor de ejemplo son marcadores sin norma; un ingeniero debe comprobarlas. Las plantillas de terreno no añaden ninguna superficie y no se dibujan en 3D ni en la vista de sección. El segundo corredor de un trazado no está en la exportación IFC. No hay transición entre dos plantillas por P.K.
- Las nubes de puntos se probaron con archivos inventados, no con un levantamiento real con dron. Solo se leen LAS y LAZ.
- El análisis GIS se probó con capas inventadas.
- La sombra, la producción solar y el confort son estimaciones de planificación; el viento es un cribado no validado. Nada de esto es un valor de diseño.
- WaterCraft es una ayuda de cálculo comprobada con redes inventadas. Un ingeniero de aguas decide qué valor tienen los números.
- Los idiomas distintos del inglés son borradores de máquina hasta que un hablante nativo los lea.
- Los instaladores de Windows no tienen firma de código, y la imagen de disco de macOS no está notarizada.

## Anterior: 0.8 y 0.8.1

Esto es lo que cambió en CivilCraft 0.8 (2026-11-01) y 0.8.1 (2026-11-02), en comparación con la 0.7. Las partes nuevas principales son herramientas que prueban su explanación y su sitio (lluvia, movimiento de tierras, rutas, balsas, avance) y seis ventanas de cálculo para terreno, carreteras, levantamiento, minas, enlaces y ferrocarril.

### Novedades

**Pruebe su explanación**

- **Hacer llover.** {{ui:Hacer llover…}} (bajo {{ui:Superficie}}) hace caer una tormenta sobre el terreno explanado. Ve cómo el agua escurre desde las plataformas, se encharca en las esquinas bajas y desborda las balsas que son demasiado pequeñas. La ejecución se anima y da los volúmenes, el caudal punta de salida y un CSV de cada balsa. La celda predeterminada es gruesa para que una primera vista sea rápida; una celda más fina es más lenta. Las balsas que desbordan aparecen también en el panel de Problemas.
- **Compensador de movimiento de tierras.** {{ui:Compensador de movimiento de tierras…}} sube o baja una plataforma hasta que el desmonte iguala al terraplén, y muestra la tabla de transporte entre ambos.
- **Mejor trazado.** {{ui:Mejor trazado…}}: elija un inicio y un fin, y CivilCraft encuentra el camino más barato a través del terreno que respeta sus límites de pendiente y de curvatura, y luego crea un trazado a partir de él.
- **Balsas de laminación.** {{ui:Balsas de laminación…}} calcula la cota de agua y el almacenamiento a partir de su terreno, admite dispositivos de desagüe (orificio, vertedero, vertedero en V, aliviadero), hace pasar una tormenta por la balsa y comprueba el caudal punta retenido, el tiempo de vaciado y el resguardo.
- **Avance a partir de levantamientos.** {{ui:Avance a partir de levantamientos…}} compara superficies de dron o de escáner de fechas distintas con el terreno tal como estaba y con el proyecto: porcentaje completado por volumen, áreas excavadas y rellenadas en exceso, acopios y cuándo termina la obra a este ritmo (marcado como estimación).

**Conozca el sitio**

- **De la dirección a la parcela.** {{ui:De la dirección a la parcela…}} reúne en un solo sitio datos abiertos de parcelas, edificios, zonificación, suelos, inundaciones y terreno. Puede guardar el sitio en el archivo de proyecto: la dirección escrita, cada fuente con el día en que la obtuvo y su licencia, y lo que devolvió. Vuelva a abrir o comparta el proyecto y el sitio sigue ahí, sin volver a obtener nada. También puede guardarlo como archivo de sitio o enviarlo a BimCraft. Véase [De la dirección a la parcela](topic:address-to-site).

**Terreno, carreteras, levantamiento, minas, enlaces y ferrocarril**

- **Suelos y taludes.** {{ui:Suelos y taludes…}} dibuja el perfil del suelo entre los sondeos que usted escribe. El método de Bishop busca después el círculo crítico en su terreno, con nivel freático, sobrecarga y coeficiente sísmico; el asentamiento de una zapata incluye consolidación, asentamiento inmediato y tiempo.
- **Intersecciones y marcas viales.** {{ui:Intersecciones y marcas viales…}} une ramales con curvas de bordillo (un radio por ramal, o curvas de tres centros), la distancia de visibilidad para la velocidad de proyecto, una comprobación de los triángulos de visibilidad, pasos de peatones, líneas de detención, marcas y señales con un listado de señales. Se dibujan en el plano y se guardan como .dxf con capas con nombre.
- **Ajuste topográfico.** {{ui:Ajuste topográfico…}} hace un ajuste por mínimos cuadrados de una poligonal o de una red: coordenadas ajustadas, elipses de error, la prueba de chi-cuadrado y una marca en la medición que no encaja. Se incluyen redes libres, cierre de poligonal por la regla de la brújula, y archivos de campo RW5, GSI, JobXML o CSV, y los puntos ajustados se guardan como CSV.
- **Cortas a cielo abierto.** {{ui:Cortas a cielo abierto…}} convierte las muestras de sondeo en un modelo de bloques y en la corta final dentro de su ángulo de talud, con la relación de estéril, una tabla por banco y una curva de ley y tonelaje. También hay cortas anidadas por factor de ingresos y un programa de producción con flujo de caja descontado.
- **Radioenlaces.** {{ui:Radioenlaces…}} comprueba la visibilidad sobre su terreno con la curvatura terrestre, la primera zona de Fresnel, el balance del enlace, el margen de desvanecimiento y el corte por multitrayecto, y da la altura de mástil que despejaría el trayecto. También calcula los balances de pérdidas de fibra, las cantidades de la ruta y el viento sobre una torre.
- **Desvíos ferroviarios.** {{ui:Desvíos ferroviarios…}} crea un desvío a partir de su número de cruzamiento, conexiones entre vías paralelas y un gálibo inclinado por el peralte y ensanchado en una curva. Un desvío puede situarse en una estación de un trazado.

Véase [Suelos, intersecciones, ajuste topográfico, cortas, radioenlaces y desvíos](topic:soils-roads-survey-mines-links).

### En todas las aplicaciones

- **Idiomas.** 54 idiomas, diez de ellos nuevos. Los idiomas distintos del inglés son borradores de máquina hasta que un hablante nativo los lea. Los temas de ayuda siguen siendo en su mayoría en inglés.
- **Filas de la barra de herramientas.** {{ui:Configuración}} › {{ui:General}} › {{ui:Filas de la barra de herramientas}}: Ajustar (como antes), 2 filas o 1 fila. La cinta de CivilCraft muestra la herramienta más usada en grande, las siguientes en pequeño, y el resto detrás de la flecha del nombre del grupo.
- **Dispositivos de entrada.** Un panel táctil, un lápiz, un ratón 3D, un mando y MIDI pueden controlar las aplicaciones.
- **Problemas.** Un panel de Problemas que avisa en todas las aplicaciones, con comprobaciones que leen los paquetes de normativa.
- **En vivo.** Una vista de quién está dónde en una sesión en vivo.
- **Complementos.** Un listado de complementos, con complementos de iluminación.
- **Conecte su IA.** Cualquier asistente que conecte puede manejar las herramientas de CivilCraft. Incluye una nota: la conexión con un solo clic dentro de CadCraft Studio y el conector alojado todavía no están listos. Véase [Deje que un asistente de IA trabaje con su sitio](topic:assistants).

### Corregido en 0.8.1

- **Sección de clases de DWG.** Se leía como un tipo equivocado (GitHub cadcraft#5). Corregido en CivilCraft junto con CadCraft, BimCraft, ModelCraft y TakeoffCraft.
- **Cambio de idioma en ejecución.** CadCraft Studio y las ediciones empaquetadas pueden cambiar de idioma en tiempo de ejecución. Antes solo estaban en inglés. Aún no se ha probado en todas las plataformas: avísenos si el idioma no cambia.

### Todavía no en esta versión

- **Son ayudas de cálculo.** Cada resultado de las nuevas ventanas necesita la revisión de un ingeniero. Las resistencias del suelo parten de valores típicos para el grupo de suelo, y la ventana lo indica.
- **Hacer llover.** Una ejecución en el sitio de ejemplo puede tardar más de dos minutos en el navegador con una celda fina. Se comprobó con casos a mano y con una cuenca en V, pero todavía no en un sitio real con explanación.
- **De la dirección a la parcela.** Lee archivos de datos abiertos que usted aporta, y solo se probó con nuestros propios archivos. Los árboles no son una fuente. Obtener las fuentes por usted queda pendiente de la redacción sobre privacidad.
- **Avance a partir de levantamientos.** Probado solo con levantamientos inventados. No están construidos el avance en planos y anotaciones (MarkupCraft) ni la comparación de escaneo con modelo (BimCraft).
- **Suelos y taludes.** Solo superficies circulares: no hay búsqueda por cuña ni por bloques, ni grieta de tracción.
- **Intersecciones.** Un radio por ramal, sin trayectorias de giro de camiones, y todavía no pasan al corredor.
- **Archivos de campo.** Los lectores se escribieron a partir de descripciones públicas de formatos y se probaron con archivos que hicimos nosotros. Se necesitan archivos reales de instrumentos.
- **Enlaces y ferrocarril.** Radioenlaces: solo pérdida en espacio libre y multitrayecto (sin atenuación por lluvia ni diagramas de antena), y ninguna norma ferroviaria: cada límite ferroviario es un marcador, con cifras de borrador que ningún ingeniero ferroviario ha revisado.
- **Windows y macOS.** 0.8 no tiene firma de código. Windows puede avisar, y macOS pide clic con el botón derecho y luego Abrir.

Lo demás está en [Todavía no construido](topic:not-built-yet). Para la versión anterior, véase [Novedades de la 0.7](topic:whats-new-0-7).
