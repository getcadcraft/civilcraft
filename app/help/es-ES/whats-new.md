---
title: Novedades de la 0.8 y la 0.8.1
summary: CivilCraft 0.8 añade Hacer llover (una tormenta sobre su nivelación), un compensador de movimiento de tierras, un buscador de mejor trazado, balsas de laminación, avance a partir de levantamientos, un importador de dirección a parcela que mantiene el emplazamiento en el proyecto, y ventanas para suelos y taludes, intersecciones y marcas viales, ajuste topográfico, cortas a cielo abierto, radioenlaces y desvíos ferroviarios. 0.8.1 corrige la lectura de archivos DWG.
keywords: novedades, qué hay de nuevo, notas de la versión, registro de cambios, cambios, 0.8, 0.8.1, versión, nuevas funciones, lluvia, tormenta, encharcamiento, desbordamiento, movimiento de tierras, compensación, desmonte y terraplén, transporte de tierras, mejor trazado, menor coste, trazado, balsa de laminación, desagüe, vaciado, resguardo, avance, levantamiento, dron, acopio, dirección a parcela, parcela, suelo, inundación, estabilidad de taludes, bishop, asentamiento, intersección, marcas viales, señales, distancia de visibilidad, ajuste, mínimos cuadrados, poligonal, cielo abierto, modelo de bloques, radioenlace, fresnel, desvío, cruce, idiomas, problemas, en directo, dwg
from: b0932cf0
---

Esto es lo que ha cambiado en CivilCraft 0.8 (2026-11-01) y 0.8.1 (2026-11-02), en comparación con la 0.7. Las grandes novedades son herramientas que prueban su nivelación y su emplazamiento (lluvia, movimiento de tierras, trazados, balsas, avance) y seis ventanas de cálculo para terreno, viales, topografía, minas, enlaces y ferrocarril.

## Novedades

### Compruebe la nivelación del terreno

- **Hacer llover.** {{ui:Hacer llover…}} (en {{ui:Superficie}}) deja caer una tormenta sobre el terreno nivelado. Se ve cómo el agua corre desde las plataformas, se encharca en las esquinas bajas y desborda las balsas que son demasiado pequeñas. La simulación está animada y da los volúmenes, el caudal punta de salida y un CSV con cada balsa. La celda por defecto es gruesa para que una primera revisión sea rápida; una celda más fina tarda más. Las balsas que desbordan también aparecen en el panel Problemas.
- **Compensador de movimiento de tierras.** {{ui:Compensador de movimiento de tierras…}} sube o baja una plataforma hasta que el desmonte iguala al terraplén, y muestra la tabla de transporte entre ambos.
- **Mejor trazado.** {{ui:Mejor trazado…}}: elija un inicio y un final, y CivilCraft busca el camino más económico sobre el terreno que respeta sus límites de pendiente y de curvatura, y con él crea un trazado.
- **Balsas de laminación.** {{ui:Balsas de laminación…}} calcula la cota y el volumen de almacenamiento a partir de su terreno, admite dispositivos de desagüe (orificio, vertedero, vertedero en V, aliviadero), hace pasar una tormenta por la balsa y comprueba el caudal punta retenido, el tiempo de vaciado y el resguardo.
- **Avance a partir de levantamientos.** {{ui:Avance a partir de levantamientos…}} compara superficies de dron o de escáner de distintas fechas con el terreno tal como estaba y con el proyecto: porcentaje completado por volumen, zonas excavadas en exceso y rellenadas en exceso, acopios y la fecha en que terminará la obra a este ritmo (marcada como estimación).

### Conozca el emplazamiento

- **Dirección a parcela.** {{ui:De la dirección a la parcela…}} reúne en un solo emplazamiento los datos abiertos de parcela, edificación, zonificación, suelo, inundación y terreno. Puede guardar el emplazamiento en el archivo del proyecto: la dirección escrita, cada fuente con el día en que la obtuvo y su licencia, y lo que devolvió. Al reabrir o compartir el proyecto, el emplazamiento sigue ahí, sin volver a obtener nada. También puede guardarlo como archivo de emplazamiento o enviarlo a BimCraft. Consulte [De la dirección a la parcela](topic:address-to-site).

### Terreno, viales, topografía, minas, enlaces y ferrocarril

- **Suelos y taludes.** {{ui:Suelos y taludes…}} dibuja el perfil del suelo entre los sondeos que escriba. El método de Bishop busca después el círculo crítico sobre su terreno, con nivel freático, sobrecarga y coeficiente sísmico; el asentamiento de una zapata incluye consolidación, asentamiento inmediato y tiempo.
- **Intersecciones y marcas viales.** {{ui:Intersecciones y marcas viales…}} une ramales con curvas de bordillo (un radio por ramal, o curvas de tres centros), la distancia de visibilidad para la velocidad de proyecto, una comprobación de los triángulos de visibilidad, pasos de peatones, líneas de parada, marcas y señales con un cuadro de señales. Se dibujan en la planta y se guardan como .dxf con capas con nombre.
- **Ajuste topográfico.** {{ui:Ajuste topográfico…}} hace un ajuste por mínimos cuadrados de una poligonal o una red: coordenadas ajustadas, elipses de error, la prueba chi-cuadrado y una marca en la medida que no encaja. Se incluyen redes libres, cierre de una poligonal por la regla de la brújula y archivos de campo RW5, GSI, JobXML o CSV, y los puntos ajustados se guardan como CSV.
- **Cortas a cielo abierto.** {{ui:Cortas a cielo abierto…}} convierte las muestras de sondeo en un modelo de bloques y la corta final dentro de su ángulo de talud, con la relación de estéril, una tabla por banco y una curva de ley y tonelaje. También hay cortas anidadas por factor de ingresos y un plan de producción con flujo de caja descontado.
- **Radioenlaces.** {{ui:Radioenlaces…}} comprueba la visibilidad directa sobre su terreno con la curvatura de la tierra, la primera zona de Fresnel, el balance del enlace, el margen de desvanecimiento y la interrupción por multitrayecto, y da la altura de mástil que libraría el trayecto. También hace presupuestos de pérdidas de fibra, cubicaciones de rutas y el viento sobre una torre.
- **Desvíos ferroviarios.** {{ui:Desvíos ferroviarios…}} crea un desvío a partir de su número de corazón, cruces entre vías paralelas y un gálibo inclinado por el peralte y ensanchado en curva. Un desvío puede situarse en un punto kilométrico de un trazado.

Consulte [Suelos, intersecciones, ajuste topográfico, cortas, radioenlaces y desvíos](topic:soils-roads-survey-mines-links).

## En todas las aplicaciones

- **Idiomas.** 54 idiomas, diez de ellos nuevos. Los idiomas distintos del inglés son borradores automáticos hasta que los lea un hablante nativo. Los temas de ayuda siguen estando mayormente en inglés.
- **Filas de la barra de herramientas.** {{ui:Configuración}} › {{ui:General}} › {{ui:Filas de la barra de herramientas}}: Ajustar (como antes), 2 filas o 1 fila. La cinta de CivilCraft muestra la herramienta más usada en grande, las siguientes en pequeño, y el resto detrás de la flecha del nombre del grupo.
- **Dispositivos de entrada.** El panel táctil, el lápiz, el ratón 3D, el mando y MIDI pueden manejar las aplicaciones.
- **Problemas.** Un panel Problemas que avisa en todas las aplicaciones, con comprobaciones que leen los paquetes de normativa.
- **En directo.** Una vista de quién está dónde en una sesión en directo.
- **Complementos.** Un listado de complementos, con complementos de iluminación.
- **Conecte su IA.** Cualquier asistente que conecte puede manejar las herramientas de CivilCraft. Se incluye una nota: la conexión con un solo clic dentro de CadCraft Studio y el conector alojado todavía no están listos. Consulte [Deje que un asistente de IA trabaje con su emplazamiento](topic:assistants).

## Corregido en 0.8.1

- **Sección de clases DWG.** Se leía como un tipo incorrecto (GitHub cadcraft#5). Corregido en CivilCraft junto con CadCraft, BimCraft, ModelCraft y TakeoffCraft.
- **Cambio de idioma en ejecución.** CadCraft Studio y las ediciones empaquetadas pueden cambiar de idioma en tiempo de ejecución. Antes solo estaban en inglés. Aún no se ha probado en todas las plataformas: díganos si el idioma no cambia.

## Todavía no en esta versión

- **Son ayudas de cálculo.** Cada resultado de las ventanas nuevas necesita la comprobación de un ingeniero. Las resistencias del suelo parten de valores típicos para el grupo de suelo, y la ventana lo indica.
- **Hacer llover.** Una simulación en el sitio de ejemplo puede tardar más de dos minutos en el navegador con una celda fina. Se comprobó con casos resueltos a mano y con una cuenca en V, pero todavía no en un terreno nivelado real.
- **Dirección a parcela.** Lee los archivos de datos abiertos que usted aporta, y se probó solo con nuestros propios archivos. Los árboles no son una fuente. Obtener las fuentes por usted depende de la redacción sobre privacidad.
- **Avance a partir de levantamientos.** Probado solo con levantamientos inventados. El avance en planos y anotaciones (MarkupCraft) y el escaneado frente al modelo (BimCraft) no están construidos.
- **Suelos y taludes.** Solo superficies circulares: no hay búsqueda de cuña ni de bloque y no hay grieta de tracción.
- **Intersecciones.** Un radio por ramal, sin trayectorias de giro de camiones, y todavía no entran en el corredor.
- **Archivos de campo.** Los lectores se escribieron a partir de descripciones públicas de formato y se probaron con archivos que nosotros creamos. Se necesitan archivos reales de instrumentos.
- **Enlaces y ferrocarril.** Radioenlaces: solo pérdida en espacio libre y multitrayecto (sin desvanecimiento por lluvia ni diagramas de antena), y sin norma ferroviaria: cada límite ferroviario es un marcador, con cifras preliminares que ningún ingeniero ferroviario ha comprobado.
- **Windows y macOS.** La 0.8 no está firmada digitalmente. Windows puede avisar, y macOS pide hacer clic derecho y luego Abrir.

Todo lo demás está en [Aún no construido](topic:not-built-yet). Para la versión anterior, consulte [Novedades de la 0.7](topic:whats-new-0-7).
