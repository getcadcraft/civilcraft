---
title: Novedades de la versión 0.9
summary: Plantillas de obra lineal y de terreno, referencias y botones de selección al dibujar, análisis GIS con una tabla de atributos, estudios de sombra, rendimiento solar, confort y viento para un sitio, una vista de render 3D, y los complementos Nube de puntos y WaterCraft.
keywords: novedades, 0.9, notas de la versión, plantillas de obra lineal, plantillas de terreno, editor de plantillas, sección típica, varias obras lineales, referencia, referencias, seleccionar, mover, copiar, girar, tangente, render, render 3d, análisis gis, zona de influencia, superposición, unión espacial, tabla de atributos, estilo por atributo, estudio de sombra, rendimiento solar, utci, confort exterior, estudio de viento, openfoam, nube de puntos, las, laz, watercraft, flujo contra incendio, hidrante, antigüedad del agua, cloro, demandas, información emergente, cuadros, lluvia, pluvial, encharcamiento, desbordamiento, movimiento de tierras, balance, corte y relleno, acarreo, mejor ruta, costo mínimo, alineación, estanque de retención, salida, abatimiento, bordo libre, avance, levantamiento, dron, acopio, dirección a sitio, parcela, suelo, inundación, estabilidad de taludes, bishop, asentamiento, cruce, señalización, señales, distancia de visibilidad, ajuste, mínimos cuadrados, poligonal, tajo a cielo abierto, modelo de bloques, enlace de radio, fresnel, desvío, cruce de vías, idiomas, problemas, en vivo, dwg
from: d7ac5b14
---

Esto es lo que cambió en CivilCraft 0.9, en comparación con la 0.8.1. CivilCraft 0.9 es parte de CadCraft Studio 0.9 y de sus ocho aplicaciones. Las partes principales son las plantillas de obra lineal y de terreno, las referencias al dibujar, el análisis GIS, los estudios de sol, rendimiento solar, confort y viento de un sitio, y dos complementos: Nube de puntos y WaterCraft.

## Novedades

### Plantillas de obra lineal y de terreno

- **Plantillas de obra lineal.** Abra {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de obra lineal…}} (o escriba {{cmd:TEMPLATES}}). Una plantilla es una sección transversal pequeña con componentes, desfases, pendientes, materiales y códigos de punto. Guárdelas en el proyecto, en {{ui:Mi biblioteca}} o como archivo `.cctemplates.json`. El editor de plantillas muestra un dibujo a escala real y lista los problemas mientras escribe.
- **Construir con plantillas por estación.** Seleccione una alineación y active {{ui:Construir con plantillas por estación}} en sus Propiedades. Cada lado de cada región tiene su propia lista de pavimentos y su propia condición final. {{ui:Agregar una obra lineal}} bajo {{ui:Obras lineales en esta alineación}} pone varias obras lineales en una misma alineación.
- **Plantillas de terreno.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de terreno…}} (o escriba {{cmd:TERRAINTEMPLATES}}) coloca materiales en capas, como capa vegetal o pavimento y base, sobre un terreno, con área y volumen por capa. Vea [Plantillas de obra lineal y plantillas de terreno](topic:corridor-templates).

### Dibujo

- **Referencias.** Las herramientas Alineación, Plataforma, Parcela, Volumen, Línea característica, Medir, Límite y Cuenca se ajustan a puntos topográficos, PI, esquinas, vértices y estructuras, con una etiqueta junto al marcador. Mantenga pulsado {{key:Alt}} para un punto libre.
- **Botones de selección, tangente, y mover, copiar, girar.** Las esquinas de plataforma, parcela y línea característica tienen cuadros escritos de Este y Norte y un botón de selección con cruz. Las Propiedades también tienen {{ui:Tangente desde dos puntos}} para alineaciones y {{ui:Desplazar, copiar y girar}} para alineaciones, plataformas, parcelas y líneas características. Vea [Dibujar con referencias, esquinas seleccionadas y desplazar, copiar y girar](topic:draft-with-snaps).
- **Vista de render en 3D.** El botón {{ui:Realista}} de la barra 3D dibuja el terreno con colores naturales, cielo, neblina y sombras suaves. No cambia el modelo. El menú {{ui:Sol}} ahora tiene los botones {{ui:Aplicar}} y {{ui:Cerrar}}. Vea [Ver el sitio en 3D](topic:site-3d).
- **Los paneles se abren una sección a la vez.** El panel izquierdo y el panel de Propiedades abren una sección y cierran las demás, y los botones de la cinta de Paisajismo que agrupan varias herramientas son botones divididos.

### Análisis GIS

- **Analizar.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Analizar}} ofrece zona de influencia, superposición, unión espacial, seleccionar por atributo o por forma, y medir. Cada herramienta crea una capa nueva en un solo paso de deshacer.
- **Tabla de atributos.** El menú de tres puntos de una capa tiene {{ui:Tabla de atributos…}} y {{ui:Estilo por atributo…}}. Vea [Analizar capas GIS](topic:gis-analysis) y [Trabajar con la tabla de atributos de una capa](topic:gis-table).

### El sitio: sol, rendimiento solar, confort y viento

- **Sección de entorno.** Seleccione un volumen: la sección {{ui:Entorno}} está debajo de {{ui:Horas de sol}} en sus Propiedades. Tiene un estudio de sombra (mapa, tabla, animación, CSV), rendimiento solar a partir de un archivo de clima de un año típico (.epw) y confort exterior (UTCI).
- **Viento, solo como tamizado.** {{ui:Ejecutar estudio de viento}} colorea el terreno desde sentado hasta incómodo, para cada dirección de viento del archivo de clima. No está validado y el panel lo indica.
- **Complemento de viento peatonal (OpenFOAM).** Está desactivado hasta que lo active en {{ui:Configuración}} › {{ui:Complementos}}. OpenFOAM es un software que usted instala por su cuenta. Vea [Sombra, rendimiento solar y confort exterior](topic:environment).

### Nube de puntos (complemento)

- Active {{ui:Nube de puntos}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña de Nube de puntos en el panel derecho. Abra un archivo LAS o LAZ, límpielo, clasifíquelo en suelo, vegetación y edificios, construya el terreno, las curvas de nivel y los volúmenes, y exporte LAS o LAZ. Vea [Nubes de puntos de un dron o escáner](topic:point-clouds).

### WaterCraft (complemento)

- Active {{ui:WaterCraft (distribución de agua)}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña WaterCraft. Tiene demandas de clientes, flujo contra incendio en cada hidrante, qué corte de tubería importa más, y antigüedad del agua y cloro, cada una guardada como CSV. Vea [WaterCraft: demandas, flujo contra incendio, cortes y antigüedad del agua](topic:watercraft).

### Trabajo en conjunto

- En una sesión de Live, ve el cursor y el nombre de los demás en el plano. Elementos de biblioteca de plantas: CivilCraft Paisajismo empieza con su colección predeterminada de biblioteca, {{ui:CivilCraft paisajismo}}.

## En todas las aplicaciones

- Las sugerencias se muestran como información emergente de Bootstrap, y la sugerencia inicial se puede cerrar.
- La franja de pestañas de un panel que no cabe se desplaza en lugar de cortarse.
- Los títulos de pestaña del navegador dicen `<documento> - CivilCraft | CadCraft`.
- {{ui:Configuración}} tiene una sección de Diseño, donde los diseños son una lista desplegable de opciones de dos líneas.
- Las unidades de peso y de temperatura están en {{ui:Configuración}} › {{ui:Global}} › {{ui:Unidades}}.
- La lista de idiomas muestra los idiomas para los que la compilación tiene archivos. Los idiomas distintos del inglés son borradores de máquina.

## Corregido

- Los complementos de búsqueda de direcciones y de verificación de EnergyPlus no se podían activar; ahora sí.
- La ayuda ahora dice que el complemento Nube de puntos escribe una nube limpia como LAS 1.4 o LAZ.
- Hacer clic en el pinzamiento propio del objeto seleccionado ya no inicia un arrastre de pinzamiento que detenía una selección en espera.

## Límites conocidos

- Las plantillas de obra lineal de ejemplo son marcadores sin norma; un ingeniero debe verificarlas. Las plantillas de terreno no agregan superficie y no se dibujan en 3D ni en la vista de sección. La segunda obra lineal de una alineación no está en la exportación IFC. No hay transición entre dos plantillas por estación.
- Los puntos de nube se probaron con archivos ficticios, no con un levantamiento real con dron. Solo se leen LAS y LAZ.
- El análisis GIS se probó con capas ficticias.
- Sombra, sol y confort son estimaciones de planificación; el viento es un tamizado no validado. Nada de esto es un valor de diseño.
- WaterCraft es una ayuda de cálculo probada con redes ficticias. Un ingeniero hidráulico decide cuánto valen los números.
- Los idiomas distintos del inglés son borradores de máquina hasta que un hablante nativo los lea.
- Los instaladores de Windows no tienen firma de código, y la imagen de disco de macOS no está notarizada.

## Antes: 0.8 y 0.8.1

Esto es lo que cambió en CivilCraft 0.8 (2026-11-01) y 0.8.1 (2026-11-02), en comparación con la 0.7. Las partes nuevas más importantes son herramientas que prueban su nivelación y su sitio (lluvia, movimiento de tierras, rutas, estanques, avance), y seis ventanas de cálculo para terreno, caminos, levantamiento, minas, enlaces y ferrocarril.

### Nuevo

**Pruebe su nivelación**

- **Que llueva.** {{ui:Que llueva…}} (en {{ui:Superficie}}) descarga una tormenta sobre el terreno nivelado. Usted ve cómo el agua escurre de las plataformas, se encharca en las esquinas bajas y desborda los estanques demasiado pequeños. La corrida se anima y da los volúmenes, el gasto pico de salida y un CSV de cada estanque. La celda predeterminada es gruesa para que una primera revisión sea rápida; una celda más fina es más lenta. Los estanques que desbordan también aparecen en el panel de Problemas.
- **Balance de movimiento de tierras.** {{ui:Balance de movimiento de tierras…}} sube o baja una plataforma hasta que el corte iguale al relleno, y muestra la tabla de acarreo entre ellos.
- **Mejor ruta.** {{ui:Mejor ruta…}}: elija un inicio y un final, y CivilCraft encuentra el camino más económico a través del terreno que respeta sus límites de pendiente y de curvatura, y luego crea una alineación a partir de él.
- **Estanques de retención.** {{ui:Estanques de retención…}} calcula la cota y el almacenamiento a partir de su terreno, acepta dispositivos de salida (orificio, vertedor, vertedor en V, vertedero de excedencias), hace pasar una tormenta por el estanque y verifica el gasto pico retenido, el tiempo de abatimiento y el bordo libre.
- **Avance según levantamientos.** {{ui:Avance según levantamientos…}} compara superficies de dron o escaneo de distintas fechas con el terreno tal como estaba y con el diseño: porcentaje completado por volumen, áreas excavadas de más y rellenadas de más, acopios, y cuándo termina el trabajo a este ritmo (marcado como estimación).

**Conozca el sitio**

- **Dirección a sitio.** {{ui:Dirección a sitio…}} alinea datos abiertos de parcela, edificio, zonificación, suelo, inundación y terreno en un solo sitio. Puede guardar el sitio en el archivo de proyecto: la dirección escrita, cada fuente con el día en que la obtuvo y su licencia, y lo que devolvió. Al reabrir o compartir el proyecto, el sitio sigue ahí, sin volver a obtener nada. También puede guardarlo como archivo de sitio o enviarlo a BimCraft. Vea [Dirección a sitio](topic:address-to-site).

**Terreno, caminos, levantamiento, minas, enlaces y ferrocarril**

- **Suelos y taludes.** {{ui:Suelos y taludes…}} dibuja el perfil del suelo entre sondeos que usted escribe. El método de Bishop luego busca el círculo crítico en su terreno, con un nivel freático, una sobrecarga y un coeficiente sísmico; el asentamiento de una zapata incluye consolidación, asentamiento inmediato y tiempo.
- **Intersecciones y señalización.** {{ui:Intersecciones y señalización…}} une ramales con curvas de esquina (un radio por ramal, o curvas de tres centros), la distancia de visibilidad para la velocidad de diseño, una verificación de los triángulos de visibilidad, cruces peatonales, líneas de alto, marcas y señales con un cuadro de señales. Se dibujan en el plano y se guardan como .dxf con capas con nombre.
- **Ajuste topográfico.** {{ui:Ajuste topográfico…}} hace un ajuste por mínimos cuadrados de una poligonal o red: coordenadas ajustadas, elipses de error, la prueba de chi cuadrada y una marca en la medición que no encaja. Se incluyen redes libres, cierre de poligonal por la regla de la brújula y RW5, y archivos de campo GSI, JobXML o CSV; los puntos ajustados se guardan como CSV.
- **Minas a cielo abierto.** {{ui:Minas a cielo abierto…}} convierte muestras de perforación en un modelo de bloques y en el tajo final dentro de su ángulo de talud, con la relación de desbroce, una tabla por banco y una curva de ley y tonelaje. También hay tajos anidados por factor de ingreso y un programa de producción con flujo de caja descontado.
- **Enlaces de radio.** {{ui:Enlaces de radio…}} verifica la línea de vista sobre su terreno con la curvatura terrestre, la primera zona de Fresnel, el balance del enlace, el margen de desvanecimiento y la interrupción por trayectos múltiples, y da la altura de mástil que libraría el trayecto. También hace balances de pérdida de fibra, cantidades de ruta y el viento sobre una torre.
- **Desvíos ferroviarios.** {{ui:Desvíos ferroviarios…}} hace un desvío a partir de su número de corazón, cruces entre vías paralelas y un gálibo de estructura inclinado por el peralte y ensanchado en una curva. Un desvío puede estar en una estación de una alineación.

Vea [Suelos, intersecciones, ajuste topográfico, minas, enlaces de radio y desvíos](topic:soils-roads-survey-mines-links).

### En todas las aplicaciones

- **Idiomas.** 54 idiomas, diez de ellos nuevos. Los idiomas distintos del inglés son borradores de máquina hasta que un hablante nativo los lea. Los temas de ayuda siguen siendo en su mayoría en inglés.
- **Filas de la barra de herramientas.** {{ui:Configuración}} › {{ui:General}} › {{ui:Filas de la barra de herramientas}}: Ajustar (como antes), 2 filas o 1 fila. La cinta de CivilCraft muestra la herramienta más usada en grande, las siguientes en pequeño, y el resto detrás de la flecha del nombre del grupo.
- **Dispositivos de entrada.** El panel táctil, el lápiz, el ratón 3D, el control y MIDI pueden manejar las aplicaciones.
- **Problemas.** Un panel de Problemas que advierte en todas las aplicaciones, con verificaciones que leen paquetes de normativa.
- **En vivo.** Una vista de quién está dónde en una sesión de Live.
- **Complementos.** Un listado de complementos, con complementos de iluminación.
- **Conecte su IA.** Cualquier asistente que conecte puede manejar las herramientas de CivilCraft. Viene con una nota: conectar con un clic dentro de CadCraft Studio y el conector alojado todavía no están listos. Vea [Deje que un asistente de IA trabaje con su sitio](topic:assistants).

### Corregido en 0.8.1

- **Sección de clases de DWG.** Se leía como el tipo equivocado (GitHub cadcraft#5). Corregido en CivilCraft junto con CadCraft, BimCraft, ModelCraft y TakeoffCraft.
- **Cambiar de idioma en ejecución.** CadCraft Studio y las ediciones empaquetadas pueden cambiar de idioma en tiempo de ejecución. Antes solo estaban en inglés. Todavía no se probó en todas las plataformas: avísenos si el idioma no cambia.

### Todavía no en esta versión

- **Estas son ayudas de cálculo.** Cada resultado de las nuevas ventanas necesita la revisión de un ingeniero. Las resistencias del suelo parten de valores típicos del grupo de suelo, y la ventana lo indica.
- **Que llueva.** Una corrida en el sitio de muestra puede tardar más de dos minutos en el navegador con una celda fina. Se verificó con casos hechos a mano y una cuenca en V, pero todavía no en un sitio real nivelado.
- **Dirección a sitio.** Lee archivos de datos abiertos que usted aporta, y se probó solo con nuestros propios archivos. Los árboles no son una fuente. Obtener fuentes por usted espera la redacción sobre privacidad.
- **Avance según levantamientos.** Probado solo con levantamientos ficticios. El avance en hojas y marcas (MarkupCraft) y el escaneo contra modelo (BimCraft) no están construidos.
- **Suelos y taludes.** Solo superficies circulares: sin búsqueda por cuña ni por bloques, y sin grieta de tensión.
- **Intersecciones.** Un radio por ramal, sin trayectorias de camiones, y todavía no entran en la obra lineal.
- **Archivos de campo.** Los lectores se escribieron a partir de descripciones públicas de formatos y se probaron con archivos que hicimos. Se necesitan archivos reales de instrumentos.
- **Enlaces y ferrocarril.** Enlaces de radio: solo pérdida de espacio libre y trayectos múltiples (sin desvanecimiento por lluvia ni patrones de antena), y sin norma ferroviaria: cada límite ferroviario es un marcador, con cifras preliminares que ningún ingeniero ferroviario ha verificado.
- **Windows y macOS.** La 0.8 no tiene firma de código. Windows puede advertir, y macOS pide clic derecho y luego Abrir.

Todo lo demás está en [Aún no construido](topic:not-built-yet). Para la versión anterior, vea [Novedades de la versión 0.7](topic:whats-new-0-7).
