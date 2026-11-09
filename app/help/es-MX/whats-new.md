---
title: Novedades en 0.8 y 0.8.1
summary: CivilCraft 0.8 agrega Que llueva (una corrida de tormenta sobre su movimiento de tierras), un balance de movimiento de tierras, un buscador de la mejor ruta, estanques de retención, avance según levantamientos, un importador de dirección a sitio que conserva el sitio en el proyecto, y ventanas para suelos y taludes, intersecciones y señalización, ajuste topográfico, minas a cielo abierto, enlaces de radio y desvíos ferroviarios. 0.8.1 corrige la lectura de archivos DWG.
keywords: novedades, qué hay de nuevo, notas de la versión, registro de cambios, cambios, 0.8, 0.8.1, versión, nuevas funciones, lluvia, tormenta, encharcamiento, desborde, movimiento de tierras, balance, corte y relleno, acarreo, mejor ruta, costo mínimo, alineación, estanque de retención, salida, abatimiento, bordo libre, avance, levantamiento, dron, acopio, dirección a sitio, parcela, suelo, inundación, estabilidad de taludes, Bishop, asentamiento, intersección, señalización, señales, distancia de visibilidad, ajuste, mínimos cuadrados, poligonal, mina a cielo abierto, modelo de bloques, enlace de radio, Fresnel, desvío, cruce, idiomas, problemas, en vivo, dwg
from: b0932cf0
---

Estos son los cambios de CivilCraft 0.8 (2026-11-01) y 0.8.1 (2026-11-02), en comparación con la 0.7. Las partes nuevas más importantes son herramientas que prueban su nivelación y su sitio (lluvia, movimiento de tierras, rutas, estanques, avance) y seis ventanas de cálculo para terreno, caminos, levantamiento, minas, enlaces y vías férreas.

## Novedades

### Pruebe su nivelación

- **Que llueva.** {{ui:Que llueva…}} (en {{ui:Superficie}}) descarga una tormenta sobre el terreno nivelado. Usted observa cómo el agua escurre desde las plataformas, se encharca en las esquinas bajas y desborda los estanques que son demasiado pequeños. La corrida se anima y entrega los volúmenes, el gasto máximo de salida y un CSV de cada estanque. La celda predeterminada es gruesa para que una primera revisión sea rápida; una celda más fina tarda más. Los estanques que desbordan también aparecen en el panel de Problemas.
- **Balance de movimiento de tierras.** {{ui:Balance de movimiento de tierras…}} sube o baja una plataforma hasta que el corte iguale al relleno, y muestra la tabla de acarreo entre ambos.
- **Mejor ruta.** {{ui:Mejor ruta…}}: elija un inicio y un fin, y CivilCraft busca el trayecto más económico sobre el terreno que respeta sus límites de pendiente y de curva, y a partir de él crea una alineación.
- **Estanques de retención.** {{ui:Estanques de retención…}} calcula el nivel y el almacenamiento a partir de su terreno, acepta dispositivos de salida (orificio, vertedor, vertedor en V, aliviadero), hace pasar una tormenta por el estanque y verifica el gasto máximo retenido, el tiempo de abatimiento y el bordo libre.
- **Avance según levantamientos.** {{ui:Avance según levantamientos…}} compara superficies de dron o de escaneo de distintas fechas con el terreno tal como estaba y con el diseño: porcentaje completado por volumen, áreas excavadas en exceso y rellenadas en exceso, acopios, y cuándo termina la obra a este ritmo (marcado como estimación).

### Conozca el sitio

- **Dirección a sitio.** {{ui:Dirección a sitio…}} reúne en un solo sitio los datos abiertos de parcelas, edificaciones, zonificación, suelo, inundación y terreno. Puede conservar el sitio en el archivo del proyecto: la dirección escrita, cada fuente con el día en que la obtuvo y su licencia, y lo que devolvió. Vuelva a abrir o comparta el proyecto y el sitio sigue ahí, sin volver a obtener nada. También puede guardarlo como archivo de sitio o enviarlo a BimCraft. Consulte [Dirección a sitio](topic:address-to-site).

### Terreno, caminos, levantamiento, minas, enlaces y vías férreas

- **Suelos y taludes.** {{ui:Suelos y taludes…}} dibuja el perfil del suelo entre los sondeos que usted escribe. Luego, el método de Bishop busca el círculo crítico sobre su terreno, con nivel freático, sobrecarga y coeficiente sísmico; el asentamiento de una zapata incluye consolidación, asentamiento inmediato y tiempo.
- **Intersecciones y señalización.** {{ui:Intersecciones y señalización…}} une tramos con curvas de esquina (un radio por tramo, o curvas de tres centros), la distancia de visibilidad para la velocidad de diseño, una revisión de los triángulos de visibilidad, cruces peatonales, líneas de alto, marcas y señales con una tabla de señales. Se dibujan en la planta y se guardan como .dxf con capas nombradas.
- **Ajuste topográfico.** {{ui:Ajuste topográfico…}} ejecuta un ajuste por mínimos cuadrados de una poligonal o de una red: coordenadas ajustadas, elipses de error, la prueba de chi cuadrada y una marca en la medición que no encaja. Se incluyen redes libres, cierre de una poligonal por la regla de la brújula y archivos de campo RW5, GSI, JobXML o CSV, y los puntos ajustados se guardan como CSV.
- **Minas a cielo abierto.** {{ui:Minas a cielo abierto…}} convierte muestras de perforación en un modelo de bloques y en la mina final dentro de su ángulo de talud, con la relación de desbroce, una tabla por banco y una curva de ley y tonelaje. También incluye minas anidadas por factor de ingreso y un programa de producción con flujo de efectivo descontado.
- **Enlaces de radio.** {{ui:Enlaces de radio…}} verifica la línea de vista sobre su terreno con la curvatura de la tierra, la primera zona de Fresnel, el balance del enlace, el margen de desvanecimiento y la interrupción por multitrayectoria, y entrega la altura de mástil que libraría la trayectoria. También hace presupuestos de pérdida de fibra, cantidades de la ruta y el viento sobre una torre.
- **Desvíos ferroviarios.** {{ui:Desvíos ferroviarios…}} crea un desvío a partir de su número de corazón, cruces de vía entre vías paralelas y un gálibo que se inclina por el peralte y se ensancha en una curva. Un desvío puede ubicarse en una estación de una alineación.

Consulte [Suelos, intersecciones, ajuste topográfico, minas, enlaces de radio y desvíos](topic:soils-roads-survey-mines-links).

## En todas las aplicaciones

- **Idiomas.** 54 idiomas, diez de ellos nuevos. Los idiomas distintos del inglés son borradores de máquina hasta que un hablante nativo los revise. Los temas de ayuda siguen siendo mayormente en inglés.
- **Filas de la barra de herramientas.** {{ui:Configuración}} › {{ui:General}} › {{ui:Filas de la barra de herramientas}}: Ajustar (como antes), 2 filas o 1 fila. La cinta de CivilCraft muestra la herramienta más usada en grande, las siguientes en pequeño, y el resto detrás de la flecha del nombre del grupo.
- **Dispositivos de entrada.** El panel táctil, la pluma, el ratón 3D, el control y MIDI pueden manejar las aplicaciones.
- **Problemas.** Un panel de Problemas que advierte en todas las aplicaciones, con verificaciones que leen paquetes de normativas.
- **En vivo.** Una vista de quién está dónde en una sesión En vivo.
- **Complementos.** Un listado de complementos, con complementos de iluminación.
- **Conecte su IA.** Cualquier asistente que conecte puede usar las herramientas de CivilCraft. Viene con una nota: la conexión con un clic dentro de CadCraft Studio y el conector alojado todavía no están listos. Consulte [Deje que un asistente de IA trabaje con su sitio](topic:assistants).

## Corregido en 0.8.1

- **Sección de clases de DWG.** Se leía como un tipo incorrecto (GitHub cadcraft#5). Corregido en CivilCraft junto con CadCraft, BimCraft, ModelCraft y TakeoffCraft.
- **Cambio de idioma en ejecución.** CadCraft Studio y las ediciones empaquetadas pueden cambiar de idioma en tiempo de ejecución. Antes solo estaban en inglés. Todavía no se ha probado en todas las plataformas: avísenos si el idioma no cambia.

## Todavía no incluido en esta versión

- **Son ayudas de cálculo.** Todo resultado de las ventanas nuevas requiere la revisión de un ingeniero. Las resistencias del suelo parten de valores típicos del grupo de suelo, y la ventana lo indica.
- **Que llueva.** Una corrida en el sitio de muestra puede tardar más de dos minutos en el navegador con una celda fina. Se verificó con casos de cálculo a mano y con una cuenca en forma de V, pero todavía no en un sitio real nivelado.
- **Dirección a sitio.** Lee archivos de datos abiertos que usted aporta, y se probó solo con nuestros propios archivos. Los árboles no son una fuente. La obtención de fuentes por usted queda pendiente de la redacción sobre privacidad.
- **Avance según levantamientos.** Se probó solo con levantamientos ficticios. El avance en presentaciones y marcas (MarkupCraft), y el escaneo contra modelo (BimCraft), no están construidos.
- **Suelos y taludes.** Solo superficies circulares: no hay búsqueda de cuña ni de bloque, ni grieta de tensión.
- **Intersecciones.** Un radio por tramo, sin trayectorias de barrido de camiones, y todavía no pasan al corredor.
- **Archivos de campo.** Los lectores se escribieron a partir de descripciones públicas de formato y se probaron con archivos que nosotros hicimos. Se necesitan archivos reales de instrumentos.
- **Enlaces y vías.** Enlaces de radio: solo pérdida en espacio libre y multitrayectoria (sin atenuación por lluvia ni patrones de antena), y ninguna norma ferroviaria: cada límite ferroviario es un marcador de posición, con cifras preliminares que ningún ingeniero ferroviario ha revisado.
- **Windows y macOS.** 0.8 no tiene firma de código. Windows puede advertir, y macOS pide hacer clic derecho y luego Abrir.

Todo lo demás está en [Aún no construido](topic:not-built-yet). Para la versión anterior, consulte [Novedades en 0.7](topic:whats-new-0-7).
