---
title: Lo nuevo en 0.9
summary: Plantillas de corredor y de terreno, ajuste y botones Elegir mientras dibujás, análisis GIS con tabla de atributos, estudios de sombra, rendimiento solar, confort y viento para un sitio, una vista de Render 3D, y los complementos Nubes de puntos y WaterCraft.
keywords: lo nuevo, 0.9, notas de versión, plantillas de corredor, plantillas de terreno, editor de plantillas, sección típica, varios corredores, ajuste, ajustes, elegir, mover, copiar, rotar, tangente, render, render 3d, análisis gis, buffer, superposición, unión espacial, tabla de atributos, estilo por atributo, estudio de sombra, rendimiento solar, utci, confort exterior, estudio de viento, openfoam, nubes de puntos, las, laz, watercraft, caudal de incendio, boca de incendio, edad del agua, cloro, demandas, información emergente, diseño, en vivo, dwg, registro de cambios, cambios, 0.8, 0.8.1, versión, nuevas funciones, lluvia, pluvial, encharcamiento, desborde, movimiento de suelo, equilibrio, corte y relleno, acarreo, mejor ruta, costo mínimo, trazado, estanque de detención, desagüe, vaciado, resguardo, avance, relevamiento, dron, acopio, dirección a predio, parcela, suelo, inundación, estabilidad de taludes, bishop, asentamiento, intersección, señalización, señales, distancia de visibilidad, ajuste, mínimos cuadrados, poligonal, mina a cielo abierto, modelo de bloques, enlace de radio, fresnel, cambio de vía, cruce, idiomas, problemas, en vivo, dwg
from: d7ac5b14
---

Esto ha'e lo que cambió en CivilCraft 0.9, comparado con 0.8.1. CivilCraft 0.9 forma parte de CadCraft Studio 0.9 y sus ocho aplicaciones. Las grandes partes son plantillas de corredor y de terreno, ajuste mientras dibujás, análisis GIS, estudios del sol, rendimiento solar, confort y viento de un sitio, y dos complementos: Nubes de puntos y WaterCraft.

## Lo nuevo

### Plantillas de corredor y de terreno

- **Plantillas de corredor.** Abrí {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas del corredor…}} (o escribí {{cmd:TEMPLATES}}). Una plantilla es una sección transversal pequeña con componentes, desplazamientos, pendientes, materiales y códigos de punto. Guardalas en el proyecto, en {{ui:Mi biblioteca}} o como archivo `.cctemplates.json`. El editor de plantillas muestra un dibujo a escala real y lista los problemas mientras escribís.
- **Construir desde plantillas por estación.** Seleccioná un trazado y activá {{ui:Construir desde plantillas por estación}} en sus Propiedades. Cada lado de cada región tiene su propia lista de pavimento y su propia condición de extremo. {{ui:Agregar un corredor}} bajo {{ui:Corredores en este trazado}} pone varios corredores en un mismo trazado.
- **Plantillas de terreno.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de terreno…}} (o escribí {{cmd:TERRAINTEMPLATES}}) aplica materiales por capas, como tierra vegetal o pavimento y base, sobre un terreno, con área y volumen por capa. Ver [Plantillas de corredor y plantillas de terreno](topic:corridor-templates).

### Dibujo

- **Ajustes.** Las herramientas Trazado, Parcela, Parcela de lote, Volumen, Línea de elementos, Medir, Límite y Cuenca ajustan a puntos de relevamiento, PI, esquinas, vértices y estructuras, con una etiqueta junto al marcador. Mantené {{key:Alt}} para un punto libre.
- **Botones Elegir, tangente y mover, copiar, rotar.** Las esquinas de plataforma, parcela y línea de elementos tienen campos escritos de Este y Norte y un botón Elegir con cruz. Las Propiedades también tienen {{ui:Tangente desde dos puntos}} para trazados y {{ui:Mover, copiar y girar}} para trazados, plataformas, parcelas y líneas de elementos. Ver [Dibujar con ajustes, esquinas elegidas y mover, copiar, rotar](topic:draft-with-snaps).
- **Vista de render en 3D.** El botón {{ui:Render}} de la barra 3D dibuja el terreno con colores naturales, cielo, neblina y sombras suaves. No cambia el modelo. El menú {{ui:Sol}} ahora tiene botones {{ui:Aplicar}} y {{ui:Cerrar}}. Ver [Ver el sitio en 3D](topic:site-3d).
- **Paneles que se abren de a una sección.** El panel izquierdo y el panel de Propiedades abren una sección y cierran las demás, y las fichas de la cinta de Paisajismo que tienen varias herramientas son botones divididos.

### Análisis GIS

- **Analizar.** {{ui:Superficie}} › {{ui:Más}} › {{ui:Analizar}} ofrece buffer, superposición, unión espacial, selección por atributo o forma, y medición. Cada herramienta crea una capa nueva en un solo paso de deshacer.
- **Tabla de atributos.** El menú de tres puntos de una capa tiene {{ui:Tabla de atributos…}} y {{ui:Estilo por atributo…}}. Ver [Analizar capas GIS](topic:gis-analysis) y [Trabajar con la tabla de atributos de una capa](topic:gis-table).

### El sitio: sol, solar, confort y viento

- **Sección de entorno.** Seleccioná un volumen: la sección {{ui:Entorno}} queda bajo {{ui:Horas de sol}} en sus Propiedades. Tiene un estudio de sombra (mapa, tabla, animación, CSV), rendimiento solar a partir de un archivo meteorológico de año típico (.epw) y confort exterior (UTCI).
- **Viento, solo como cribado.** {{ui:Ejecutar estudio de viento}} colorea el terreno desde sentado hasta incómodo para cada dirección de viento del archivo meteorológico. No está validado y el panel lo dice.
- **Complemento de viento peatonal (OpenFOAM).** Apagado hasta que lo actives en {{ui:Configuración}} › {{ui:Complementos}}. OpenFOAM es un programa que instalás vos mismo. Ver [Sombra, rendimiento solar y confort exterior](topic:environment).

### Nubes de puntos (complemento)

- Activá {{ui:Nubes de puntos}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña Nubes de puntos en el panel derecho. Abrí un archivo LAS o LAZ, limpialo, ordenalo en suelo, vegetación y edificios, construí el terreno, las curvas de nivel y los volúmenes, y exportá LAS o LAZ. Ver [Nubes de puntos desde un dron o escáner](topic:point-clouds).

### WaterCraft (complemento)

- Activá {{ui:WaterCraft (distribución de agua)}} en {{ui:Configuración}} › {{ui:Complementos}}; aparece una pestaña WaterCraft. Tiene demandas de clientes, caudal de incendio en cada boca de incendio, qué corte de cañería importa más, y antigüedad del agua y cloro, cada uno guardado como CSV. Ver [WaterCraft: demandas, caudal de incendio, cortes y antigüedad del agua](topic:watercraft).

### Trabajar juntos

- En una sesión Live ves los cursores y nombres de los demás en el plano. Plantas de biblioteca: CivilCraft Paisajismo arranca desde su colección de Biblioteca predeterminada, {{ui:CivilCraft paisajismo}}.

## En todas las aplicaciones

- Las sugerencias se muestran como información emergente de Bootstrap, y la sugerencia de inicio puede cerrarse.
- La franja de pestañas de un panel que no entra se desplaza en lugar de cortarse.
- Los títulos de pestañas del navegador dicen `<documento> - CivilCraft | CadCraft`.
- {{ui:Configuración}} tiene una sección de Diseño donde los diseños son una lista desplegable de opciones de dos líneas.
- Las unidades de peso y temperatura están en {{ui:Configuración}} › {{ui:Global}} › {{ui:Unidades}}.
- La lista de idiomas muestra los idiomas para los que la compilación tiene archivos. Los idiomas distintos del inglés son borradores de máquina.

## Corregido

- Los complementos de búsqueda de direcciones y de verificación de EnergyPlus no se podían activar; ahora sí.
- La ayuda ahora dice que el complemento Nubes de puntos escribe una nube limpia como LAS 1.4 o LAZ.
- Hacer clic en el propio agarre del objeto seleccionado ya no inicia un arrastre de agarre que detenía una Elección en espera.

## Límites honestos

- Las plantillas de corredor de ejemplo son marcadores provisorios sin norma; un ingeniero debe verificarlas. Las plantillas de terreno no agregan superficie y no se dibujan en 3D ni en la vista de sección. El segundo corredor de un trazado no está en la exportación IFC. No hay transición entre dos plantillas por estación.
- Las nubes de puntos se probaron con archivos simulados, no con un relevamiento real de dron. Solo se leen LAS y LAZ.
- El análisis GIS se probó con capas simuladas.
- Sombra, sol y confort son estimaciones de planificación; el viento es un cribado no validado. Nada de esto es un valor de diseño.
- WaterCraft es un cálculo de apoyo verificado con redes simuladas. Un ingeniero de agua decide qué valen los números.
- Los idiomas distintos del inglés son borradores de máquina.
- Los instaladores de Windows no están firmados digitalmente, y la imagen de disco de macOS no está notarizada.

## Antes: 0.8 y 0.8.1

Esto es lo que cambió en CivilCraft 0.8 (2026-11-01) y 0.8.1 (2026-11-02), comparado con 0.7. Las grandes partes nuevas son herramientas que prueban tu nivelación y tu sitio (lluvia, movimiento de suelo, rutas, estanques, avance) y seis ventanas de cálculo para terreno, caminos, relevamiento, minas, enlaces y ferrocarril.

### Nuevo

**Probá tu nivelación**

- **Hacer llover.** {{ui:Hacer llover…}} (bajo {{ui:Superficie}}) descarga una tormenta sobre el terreno nivelado. Mirás cómo el agua escurre de las plataformas, se encharca en las esquinas bajas y desborda los estanques demasiado chicos. La corrida está animada y da los volúmenes, el caudal pico de salida y un CSV de cada estanque. La celda predeterminada es gruesa para que una primera mirada sea rápida; una celda más fina tarda más. Los estanques que desbordan también aparecen en el panel de Problemas.
- **Equilibrio de movimiento de suelo.** {{ui:Equilibrio de movimiento de suelo…}} sube o baja una plataforma hasta que corte es igual a relleno, y muestra la tabla de acarreo entre ambos.
- **Mejor ruta.** {{ui:Mejor recorrido…}}: elegí un inicio y un fin, y CivilCraft encuentra el camino más barato a través del terreno que respeta tus límites de pendiente y curvatura, y luego arma un trazado a partir de él.
- **Estanques de detención.** {{ui:Estanques de detención…}} calcula etapa y almacenamiento a partir de tu terreno, toma dispositivos de salida (orificio, vertedero, vertedero en V, aliviadero), hace pasar una tormenta por el estanque y verifica el caudal pico retenido, el tiempo de vaciado y el resguardo.
- **Avance desde relevamientos.** {{ui:Avance desde relevamientos…}} compara superficies de dron o escaneo de distintas fechas con el terreno tal como estaba y con el diseño: porcentaje completado por volumen, áreas excavadas de más y rellenadas de más, acopios, y cuándo termina la obra al ritmo actual (marcado como estimación).

**Conocé el sitio**

- **Dirección a predio.** {{ui:De dirección a predio…}} alinea datos abiertos de parcela, edificio, zonificación, suelo, inundación y terreno en un solo sitio. Podés guardar el sitio en el archivo de proyecto: la dirección escrita, cada fuente con el día en que la obtuviste y su licencia, y lo que devolvió. Reabrí o compartí el proyecto y el sitio sigue ahí, sin volver a obtener nada. También podés guardarlo como archivo de sitio o enviarlo a BimCraft. Ver [De dirección a predio](topic:address-to-site).

**Terreno, caminos, relevamiento, minas, enlaces y ferrocarril**

- **Suelos y pendientes.** {{ui:Suelos y pendientes…}} dibuja el perfil del suelo entre las perforaciones que escribís. El método de Bishop luego busca el círculo crítico en tu terreno, con nivel freático, sobrecarga y coeficiente sísmico; el asentamiento de una zapata incluye consolidación, asentamiento inmediato y tiempo.
- **Intersecciones y señalización.** {{ui:Intersecciones y señalización…}} une ramas con curvas de cordón (un radio por rama, o curvas de tres centros), la distancia de visibilidad para la velocidad de diseño, una verificación de los triángulos de visibilidad, cruces peatonales, líneas de detención, marcas y señales con planilla de señales. Se dibujan en el plano y se guardan como .dxf con capas con nombre.
- **Ajuste de relevamiento.** {{ui:Ajuste de relevamiento…}} hace un ajuste por mínimos cuadrados de una poligonal o red: coordenadas ajustadas, elipses de error, la prueba chi-cuadrado y una marca en la medición que no encaja. Se incluyen redes libres, cierre de poligonal por regla de la brújula y RW5, y archivos de campo GSI, JobXML o CSV; los puntos ajustados se guardan como CSV.
- **Minas a cielo abierto.** {{ui:Minas a cielo abierto…}} convierte muestras de sondeo en un modelo de bloques y la excavación final dentro de tu ángulo de talud, con la relación de desmonte, una tabla por banco y una curva de ley y tonelaje. También están las excavaciones anidadas por factor de ingreso y un cronograma de producción con flujo de caja descontado.
- **Enlaces de radio.** {{ui:Enlaces de radio…}} verifica la línea de vista sobre tu terreno con la curvatura de la tierra, la primera zona de Fresnel, el balance del enlace, el margen de desvanecimiento y la interrupción por multitrayecto, y da la altura de mástil que despejaría el trayecto. También hace balances de pérdida de fibra, cantidades de ruta y el viento sobre una torre.
- **Cambios de vía.** {{ui:Cambios de vía…}} arma un cambio a partir de su número de corazón, cruces entre vías paralelas y un gálibo tilteado por peralte y ensanchado en una curva. Un cambio puede ubicarse en una estación de un trazado.

Ver [Suelos, intersecciones, ajuste de relevamiento, minas, enlaces de radio y cambios de vía](topic:soils-roads-survey-mines-links).

### En todas las aplicaciones

- **Idiomas.** 54 idiomas, diez de ellos nuevos. Los idiomas distintos del inglés son borradores de máquina hasta que un hablante nativo los lea. Los temas de ayuda siguen siendo mayormente en inglés.
- **Filas de la barra.** {{ui:Configuración}} › {{ui:General}} › {{ui:Filas de la barra}}: Ajustar (como antes), 2 filas o 1 fila. La Cinta de CivilCraft muestra la herramienta más usada en grande, las siguientes en pequeño, y el resto detrás de la flecha del nombre del grupo.
- **Dispositivos de entrada.** Touchpad, lápiz, mouse 3D, control y MIDI pueden manejar las aplicaciones.
- **Problemas.** Un panel de Problemas que avisa en todas las aplicaciones, con verificaciones que leen paquetes de normativas.
- **En vivo.** Una vista de quién está dónde en una sesión Live.
- **Complementos.** Un listado de complementos, con complementos de iluminación.
- **Conectá tu IA.** Cualquier asistente que conectes puede manejar las herramientas de CivilCraft. Viene con una nota: la conexión con un clic dentro de CadCraft Studio y el conector alojado todavía no están listos. Ver [Dejá que un asistente de IA trabaje con tu sitio](topic:assistants).

### Corregido en 0.8.1

- **Sección de clases de DWG.** Se leía como el tipo equivocado (GitHub cadcraft#5). Corregido en CivilCraft junto con CadCraft, BimCraft, ModelCraft y TakeoffCraft.
- **Cambio de idioma en ejecución.** CadCraft Studio y las ediciones empaquetadas pueden cambiar de idioma mientras corren. Antes eran solo en inglés. Todavía no probado en todas las plataformas: avisanos si el idioma no cambia.

### Todavía no en esta versión

- **Estas son herramientas de cálculo.** Cada resultado de las nuevas ventanas necesita la verificación de un ingeniero. Las resistencias de suelo parten de valores típicos del grupo de suelo, y la ventana lo dice.
- **Hacer llover.** Una corrida en el sitio de ejemplo puede tardar más de dos minutos en el navegador con una celda fina. Se verificó con casos hechos a mano y una cuenca en V, todavía no en un sitio real nivelado.
- **Dirección a predio.** Lee archivos de datos abiertos que vos traés, y se probó solo con nuestros propios archivos. Los árboles no son una fuente. Obtener fuentes por vos espera la redacción sobre privacidad.
- **Avance desde relevamientos.** Probado solo con relevamientos simulados. El avance en planos y anotaciones (MarkupCraft) y la comparación de escaneo con modelo (BimCraft) no están construidos.
- **Suelos y pendientes.** Solo superficies circulares: sin búsqueda de cuña ni de bloque, y sin grieta de tracción.
- **Intersecciones.** Un radio por rama, sin trayectorias de giro de camiones, y todavía no entran en el corredor.
- **Archivos de campo.** Los lectores se escribieron a partir de descripciones públicas de formato y se probaron con archivos que hicimos. Se necesitan archivos de instrumentos reales.
- **Enlaces y ferrocarril.** Enlaces de radio: solo pérdida en espacio libre y multitrayecto (sin desvanecimiento por lluvia ni patrones de antena), y ninguna norma ferroviaria: cada límite ferroviario es un marcador, con cifras preliminares que ningún ingeniero ferroviario verificó.
- **Windows y macOS.** 0.8 no está firmada digitalmente. Windows puede advertir, y macOS pide clic derecho y luego Abrir.

Todo lo demás está en [Aún no construido](topic:not-built-yet). Para la versión anterior, ver [Lo nuevo en 0.7](topic:whats-new-0-7).
