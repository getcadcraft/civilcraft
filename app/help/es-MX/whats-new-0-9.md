---
title: Novedades de la versión 0.9 (anteriores)
summary: Plantillas de obra lineal y de terreno, referencias y botones de precisión al dibujar, análisis SIG con tabla de atributos, estudios de sombra, rendimiento solar, confort y viento para un sitio, una vista de render 3D, y los complementos Nubes de puntos y WaterCraft.
keywords: novedades 0.9, versión anterior, novedades, 0.9, notas de la versión, plantillas de obra lineal, plantillas de terreno, editor de plantillas, sección tipo, varias obras lineales, forzcursor, precisar, mover, copiar, girar, tangente, render, render 3D, análisis SIG, área de influencia, superposición, unión espacial, tabla de atributos, estilo por atributo, estudio de sombra, rendimiento solar, UTCI, confort exterior, estudio de viento, OpenFOAM, nubes de puntos, LAS, LAZ, watercraft, flujo contra incendio, hidrante, antigüedad del agua, cloro, demandas, descripciones emergentes, lluvia, tormenta, encharcamiento, desbordamiento, movimiento de tierras, balance, corte y terraplén, acarreo, mejor ruta, costo mínimo, alineación, estanque de retención, salida, abatimiento, bordo libre, avance, topografía, dron, acopio, dirección a sitio, parcela, suelo, inundación, estabilidad de taludes, Bishop, asentamiento, intersección, señalización, distancia de visibilidad, ajuste, mínimos cuadrados, poligonal, mina a cielo abierto, modelo de bloques, enlace de radio, Fresnel, desvío, cruce, idiomas, problemas, en vivo, DWG
from: 4664522c
---

Esto es lo que cambió en CivilCraft 0.9, en comparación con 0.8.1. CivilCraft 0.9 forma parte de CadCraft Studio 0.9 y de sus ocho aplicaciones. Las partes principales son las plantillas de obra lineal y de terreno, las referencias al dibujar, el análisis SIG, los estudios de sol, rendimiento solar, confort y viento de un sitio, y dos complementos: Nubes de puntos y WaterCraft.

## Nuevo

### Plantillas de obra lineal y de terreno

- **Plantillas de obra lineal.** Abra {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de obra lineal…}} (o escriba {{cmd:TEMPLATES}}). Una plantilla es una pequeña sección transversal con componentes, desfases, pendientes, materiales y códigos de punto. Guárdelas en el proyecto, en {{ui:Mi biblioteca}} o como un archivo `.cctemplates.json`. El editor de plantillas muestra un dibujo a escala real y enumera los problemas mientras escribe.
- **Construir con plantillas por estación.** Seleccione una alineación y active {{ui:Construir con plantillas por estación}} en sus Propiedades. Cada lado de cada región tiene su propia lista de pavimento y su propia condición de extremo. {{ui:Agregar una obra lineal}} bajo {{ui:Obras lineales en esta alineación}} pone varias obras lineales en una misma alineación.
- **Plantillas de terreno.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de terreno…}} (o escriba {{cmd:TERRAINTEMPLATES}}) coloca materiales en capas, como capa vegetal o pavimento y base, sobre un terreno, con área y volumen por capa. Vea [Plantillas de obra lineal y de terreno](topic:corridor-templates).

### Dibujo

- **Forzcursor.** Las herramientas Alineación, Plataforma, Parcela, Volumen, Línea característica, Medir, Límite y Cuenca se ajustan a puntos topográficos, PI, esquinas, vértices y estructuras, con una etiqueta junto al marcador. Mantenga {{key:Alt}} para un punto libre.
- **Botones Precisar, tangente y mover, copiar, girar.** Las esquinas de plataformas, parcelas y líneas características tienen casillas escritas de Este y Norte y un botón Precisar con mira. Propiedades también tiene {{ui:Tangente desde dos puntos}} para alineaciones y {{ui:Desplazar, copiar y girar}} para alineaciones, plataformas, parcelas y líneas características. Vea [Dibujar con forzcursor, esquinas precisadas y mover, copiar, girar](topic:draft-with-snaps).
- **Vista de render en 3D.** El botón {{ui:Realista}} de la barra 3D dibuja el terreno con colores naturales, cielo, neblina y sombras suaves. No cambia el modelo. El menú {{ui:Sol}} ahora tiene los botones {{ui:Aplicar}} y {{ui:Cerrar}}. Vea [Vista del sitio en 3D](topic:site-3d).
- **Los paneles abren una sección a la vez.** El panel izquierdo y el panel de Propiedades abren una sección y cierran las demás, y las fichas de la cinta de Paisajismo que contienen varias herramientas son botones divididos.

### Análisis SIG

- **Analizar.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Analizar}} ofrece área de influencia, superposición, unión espacial, selección por atributo o forma, y medición. Cada herramienta crea una capa nueva en un paso de deshacer.
- **Tabla de atributos.** El menú de tres puntos de una capa tiene {{ui:Tabla de atributos…}} y {{ui:Estilo por atributo…}}. Vea [Analizar capas SIG](topic:gis-analysis) y [Trabajar con la tabla de atributos de una capa](topic:gis-table).

### El sitio: sol, solar, confort y viento

- **Sección de entorno.** Seleccione un volumen: la sección {{ui:Entorno}} aparece bajo {{ui:Horas de sol}} en sus Propiedades. Tiene un estudio de sombra (mapa, tabla, animación, CSV), rendimiento solar a partir de un archivo de clima de un año típico (.epw) y confort exterior (UTCI).
- **Viento, solo como cribado.** {{ui:Ejecutar estudio de viento}} colorea el terreno desde apto para sentarse hasta incómodo, para cada dirección del viento en el archivo de clima. No está validado y el panel lo indica.
- **Complemento de viento peatonal (OpenFOAM).** Desactivado hasta que lo active en {{ui:Configuración}} › {{ui:Complementos}}. OpenFOAM es un programa que usted instala por su cuenta. Vea [Sombra, rendimiento solar y confort exterior](topic:environment).

### Nubes de puntos (complemento)

- Active {{ui:Nubes de puntos}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña Nubes de puntos en el panel derecho. Abra un archivo LAS o LAZ, límpielo, clasifíquelo en terreno, vegetación y edificios, genere el terreno, las curvas de nivel y los volúmenes, y exporte LAS o LAZ. Vea [Nubes de puntos de un dron o escáner](topic:point-clouds).

### WaterCraft (complemento)

- Active {{ui:WaterCraft (distribución de agua)}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña WaterCraft. Tiene demandas de clientes, flujo contra incendio en cada hidrante, qué interrupción de tubería importa más, y antigüedad del agua y cloro, cada una guardada como CSV. Vea [WaterCraft: demandas, flujo contra incendio, interrupciones y antigüedad del agua](topic:watercraft).

### Trabajo en conjunto

- En una sesión en vivo ve los cursores y nombres de los demás en la planta. Plantas de la biblioteca: CivilCraft Paisajismo parte de su colección predeterminada de la biblioteca, {{ui:CivilCraft paisajismo}}.

## En todas las aplicaciones

- Las sugerencias se muestran como descripciones emergentes de Bootstrap, y el consejo de inicio se puede cerrar.
- La franja de pestañas de un panel que no cabe se desplaza en lugar de cortarse.
- Los títulos de las pestañas del navegador dicen `<documento> - CivilCraft | CadCraft`.
- {{ui:Configuración}} tiene una sección de Disposición, donde las disposiciones son una lista desplegable de opciones de dos líneas.
- Las unidades de peso y temperatura están en {{ui:Configuración}} › {{ui:Global}} › {{ui:Unidades}}.
- La lista de idiomas muestra los idiomas para los que la versión tiene archivos. Los idiomas distintos del inglés son borradores de traducción automática.

## Corregido

- Los complementos de búsqueda de dirección y de revisión de EnergyPlus no se podían activar; ahora sí.
- La ayuda ahora indica que el complemento Nubes de puntos escribe una nube limpia como LAS 1.4 o LAZ.
- Hacer clic en el propio pinzamiento del objeto seleccionado ya no inicia un arrastre de pinzamiento que detenía un Precisar en espera.

## Límites reconocidos

- Las plantillas de obra lineal de ejemplo son provisionales, sin norma; un ingeniero debe revisarlas. Las plantillas de terreno no agregan superficie y no se dibujan en 3D ni en la vista de sección. La segunda obra lineal en una alineación no está en la exportación IFC. No hay ahusamiento entre dos plantillas por estación.
- Las nubes de puntos se probaron con archivos ficticios, no con un levantamiento real con dron. Solo se leen LAS y LAZ.
- El análisis SIG se probó con capas ficticias.
- La sombra, el solar y el confort son estimaciones de planeación; el viento es un cribado no validado. Nada de ello es un valor de diseño.
- WaterCraft es una ayuda de cálculo verificada con redes ficticias. Un ingeniero de agua decide el valor de las cifras.
- Los idiomas distintos del inglés son borradores de traducción automática.
- Los instaladores de Windows no están firmados digitalmente, y la imagen de disco de macOS no está notarizada.

## Anteriores: 0.8 y 0.8.1

Esto es lo que cambió en CivilCraft 0.8 (2026-11-01) y 0.8.1 (2026-11-02), en comparación con 0.7. Las partes nuevas principales son herramientas que prueban su nivelación y su sitio (lluvia, movimiento de tierras, rutas, estanques, avance) y seis ventanas de cálculo para terreno, vías, topografía, minas, enlaces y ferrocarril.

### Nuevo

**Pruebe su nivelación**

- **Que llueva.** {{ui:Que llueva…}} (en {{ui:Superficie}}) deja caer una tormenta sobre el terreno nivelado. Ve el agua escurrir de las plataformas, encharcarse en las esquinas bajas y desbordar los estanques demasiado pequeños. La corrida es animada y da los volúmenes, el gasto de salida máximo y un CSV de cada estanque. La celda predeterminada es gruesa para que una primera revisión sea rápida; una celda más fina es más lenta. Los estanques que se desbordan también aparecen en el panel de Problemas.
- **Equilibrador de movimiento de tierras.** {{ui:Balance de movimiento de tierras…}} sube o baja una plataforma hasta que el corte iguale al terraplén, y muestra la tabla de acarreo entre ellos.
- **Mejor ruta.** {{ui:Mejor ruta…}}: precise un inicio y un final, y CivilCraft encuentra el camino más económico a través del terreno que respeta sus límites de pendiente y de curva, y luego crea una alineación con él.
- **Estanques de retención.** {{ui:Estanques de retención…}} calcula el nivel y el almacenamiento a partir de su terreno, admite dispositivos de salida (orificio, vertedor, vertedor de sección triangular, aliviadero), hace pasar una tormenta por el estanque y revisa el gasto máximo retenido, el tiempo de abatimiento y el bordo libre.
- **Avance a partir de levantamientos.** {{ui:Avance según levantamientos…}} compara superficies de dron o escaneo de distintas fechas con el terreno como era y con el diseño: porcentaje completado por volumen, áreas excavadas en exceso y rellenadas en exceso, acopios, y cuándo termina el trabajo a este ritmo (marcado como estimación).

**Conozca el sitio**

- **Dirección al sitio.** {{ui:Dirección a sitio…}} reúne en un solo sitio datos abiertos de parcela, edificio, zonificación, suelo, inundación y terreno. Puede guardar el sitio en el archivo del proyecto: la dirección escrita, cada fuente con el día en que la obtuvo y su licencia, y lo que devolvió. Al reabrir o compartir el proyecto, el sitio sigue ahí, sin volver a obtener nada. También puede guardarlo como archivo de sitio o enviarlo a BimCraft. Vea [Dirección al sitio](topic:address-to-site).

**Terreno, vías, topografía, minas, enlaces y ferrocarril**

- **Suelos y taludes.** {{ui:Suelos y taludes…}} dibuja el perfil del suelo entre los sondeos que escriba. Luego, el método de Bishop busca el círculo crítico en su terreno, con nivel freático, sobrecarga y coeficiente sísmico; el asentamiento de una zapata incluye consolidación, asentamiento inmediato y tiempo.
- **Intersecciones y señalización.** {{ui:Intersecciones y señalización…}} une ramales con retornos de guarnición (un radio por ramal, o retornos de tres centros), la distancia de visibilidad para la velocidad de diseño, una revisión de los triángulos de visibilidad, cruces peatonales, barras de alto, marcas y señales con un cuadro de señales. Se dibujan en la planta y se guardan como .dxf con capas con nombre.
- **Ajuste topográfico.** {{ui:Ajuste topográfico…}} ejecuta un ajuste por mínimos cuadrados de una poligonal o red: coordenadas ajustadas, elipses de error, la prueba de chi cuadrada y una marca en la medición que no encaja. Se incluyen redes libres, el cierre de una poligonal por la regla de la brújula y archivos de campo RW5, GSI, JobXML o CSV, y los puntos ajustados se guardan como CSV.
- **Minas a cielo abierto.** {{ui:Minas a cielo abierto…}} convierte muestras de perforación en un modelo de bloques y en la mina final dentro de su ángulo de talud, con la relación de desbroce, una tabla por banco y una curva de ley y tonelaje. También hay minas anidadas por factor de ingreso y un programa de producción con flujo de caja descontado.
- **Enlaces de radio.** {{ui:Enlaces de radio…}} revisa la línea de vista sobre su terreno con la curvatura terrestre, la primera zona de Fresnel, el balance de enlace, el margen de desvanecimiento y la interrupción por multitrayecto, y da la altura del mástil que libraría la trayectoria. También hace balances de pérdidas de fibra, cantidades de ruta y el viento sobre una torre.
- **Desvíos ferroviarios.** {{ui:Desvíos ferroviarios…}} crea un desvío a partir de su número de corazón, cruces entre vías paralelas y un gálibo de estructura inclinado por el peralte y ensanchado en una curva. Un desvío puede ubicarse en una estación de una alineación.

Vea [Suelos, intersecciones, ajuste topográfico, minas, enlaces de radio y desvíos](topic:soils-roads-survey-mines-links).

### En todas las aplicaciones

- **Idiomas.** 54 idiomas, diez de ellos nuevos. Los idiomas distintos del inglés son borradores de traducción automática hasta que un hablante nativo los revise. Los temas de ayuda siguen siendo en su mayoría en inglés.
- **Filas de la barra de herramientas.** {{ui:Configuración}} › {{ui:General}} › {{ui:Filas de la barra de herramientas}}: Envolver (como antes), 2 filas o 1 fila. La cinta de CivilCraft muestra la herramienta más usada grande, las siguientes pequeñas, y el resto detrás de la flecha del nombre del grupo.
- **Dispositivos de entrada.** El panel táctil, la pluma, el ratón 3D, el control y MIDI pueden manejar las aplicaciones.
- **Problemas.** Un panel de Problemas que advierte en cada aplicación, con revisiones que leen paquetes de normativa.
- **En vivo.** Una vista de quién está dónde en una sesión en vivo.
- **Complementos.** Un listado de complementos, con complementos de iluminación.
- **Conecte su IA.** Cualquier asistente que conecte puede manejar las herramientas de CivilCraft. Incluye una nota de que la conexión con un solo clic dentro de CadCraft Studio y el conector alojado todavía no están listos. Vea [Deje que un asistente de IA trabaje con su sitio](topic:assistants).

### Corregido en 0.8.1

- **Sección de clases DWG.** Se leía como un tipo incorrecto (GitHub cadcraft#5). Corregido en CivilCraft junto con CadCraft, BimCraft, ModelCraft y TakeoffCraft.
- **Cambio de idioma en ejecución.** CadCraft Studio y las ediciones empaquetadas pueden cambiar de idioma mientras se ejecutan. Antes solo estaban en inglés. Todavía no se probó en todas las plataformas: avísenos si el idioma no cambia.

### Todavía no en esta versión

- **Son ayudas de cálculo.** Cada resultado en las nuevas ventanas necesita la revisión de un ingeniero. Las resistencias del suelo parten de valores típicos del grupo de suelo, y la ventana lo indica.
- **Que llueva.** Una corrida en el sitio de muestra puede tardar más de dos minutos en el navegador con una celda fina. Se revisó contra casos hechos a mano y una cuenca en V, pero todavía no en un sitio real nivelado.
- **Dirección al sitio.** Lee archivos de datos abiertos que usted aporta, y se probó solo con nuestros propios archivos. Los árboles no son una fuente. La obtención de fuentes por usted espera la redacción de privacidad.
- **Avance a partir de levantamientos.** Probado solo con levantamientos ficticios. El avance en hojas y marcas (MarkupCraft) y el escaneo contra modelo (BimCraft) no están construidos.
- **Suelos y taludes.** Solo superficies circulares: no hay búsqueda de cuña ni de bloque, ni grieta de tensión.
- **Intersecciones.** Un radio por ramal, sin trayectorias de giro de camiones, y todavía no entran en la obra lineal.
- **Archivos de campo.** Los lectores se escribieron a partir de descripciones públicas de formato y se probaron con archivos que hicimos. Se necesitan archivos reales de instrumentos.
- **Enlaces y ferrocarril.** Enlaces de radio: solo pérdida en espacio libre y multitrayecto (sin desvanecimiento por lluvia ni patrones de antena), y sin norma ferroviaria: cada límite ferroviario es provisional, con cifras preliminares que ningún ingeniero ferroviario ha revisado.
- **Windows y macOS.** 0.8 no está firmada digitalmente. Windows puede advertir, y macOS pide hacer clic derecho y luego Abrir.

Todo lo demás está en [Aún no disponible](topic:not-built-yet). Para la versión anterior, vea [Novedades de la versión 0.7](topic:whats-new-0-7).
