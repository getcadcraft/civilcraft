---
title: Aún no disponible
summary: Lo que esta versión de CivilCraft todavía no hace, y qué hacer en su lugar hoy.
keywords: falta, limitaciones, hoja de ruta, no disponible, espirales, ensanchamientos, dwg, dxf, sumideros, retención, secciones transversales, más adelante, límites
from: a2d970ef
---

CivilCraft está en una fase temprana. Esta página indica lo que la versión actual no hace, para que no lo busque. Nada de lo que aquí se indica tiene fecha prevista.

## Puntos

| No disponible todavía | En su lugar, hoy |
|---|---|
| Añadir un segundo archivo de puntos al primero | Una los archivos antes en un editor de texto o en una hoja de cálculo |
| Exportar un archivo de texto de puntos | Exporte LandXML (los puntos salen como CgPoints), use {{ui:Export}} de SIG (puntos con los campos P, N, E, Z y D), o {{ui:Copy}} los puntos a una hoja de cálculo |
| Estilos de etiquetas de puntos, símbolos por clave de descripción, curvas (arcos) a partir de códigos de línea, un archivo de claves de descripción para compartir entre proyectos | Las etiquetas muestran el número, la cota y la descripción, o menos ([Configuración de CivilCraft](topic:settings)); las claves se conservan en el archivo del proyecto |
| Conversión de unidades | Convierta el archivo antes de importarlo; **Unidades** solo cambia las etiquetas |

## Superficies

| No disponible todavía | En su lugar, hoy |
|---|---|
| Más de una superficie creada a partir de puntos | Un proyecto por superficie |
| Ocultar límites (interiores) | Use **Borde exterior más largo** o un límite exterior |
| Seleccionar o editar una línea de ruptura dibujada | {{key:Mod+Z}}, o {{ui:Remove drawn breaklines}} y dibujarla de nuevo |
| Editar una superficie leída de LandXML (líneas de ruptura, límite) | {{ui:Rebuild the surface from the points}} |
| Editar una superficie creada desde una malla de cotas | Importe de nuevo la malla con otras opciones |
| Convertir una superficie leída de LandXML cuando cambia el sistema de coordenadas | Primero {{ui:Rebuild the surface from the points}} |
| Cotas puntuales y valores de pendiente con etiqueta | Léalos en la barra de estado, o coloree la superficie por pendiente con **Análisis de pendiente** en el espacio de trabajo Paisajismo ([Movimiento de tierras para paisajismo](topic:landscape-grading#grading-checks)) |

## Trazados y perfiles

| No disponible todavía | En su lugar, hoy |
|---|---|
| Espirales distintas de la clotoide; una espiral entre dos curvas (transiciones compuestas) | Las espirales de clotoide en los extremos de una curva están disponibles; las demás se nombran y se omiten al importar LandXML |
| Insertar un PI entre otros dos | Vuelva a dibujar el trazado, o reescriba las coordenadas del PI |
| Trazados a partir de objetos, desplazamientos, ensanchamientos | Dibuje por PI |
| Escribir K para una curva vertical | Escriba L (se muestra K) |
| Curvas verticales circulares y asimétricas | Solo curvas parabólicas simétricas |
| Más de un perfil de proyecto por trazado | Un trazado por variante |
| Hacer zoom en la vista de perfil, bandas de perfil bajo el perfil | La vista de perfil ajusta todo el trazado; imprímala en [planos de planta y perfil](topic:plan-profile-sheets) |
| Secciones en DWG o LandXML | Hojas de secciones en PDF; {{ui:CSV}} de las áreas y volúmenes |
| Líneas de muestreo oblicuas, o de anchos distintos a lo largo de la vía | Un ancho para cada lado en todo el trazado |

## Corredores

| No disponible todavía | En su lugar, hoy |
|---|---|
| Medianas, barreras y un peralte que gira las plantillas | Dibújelas como plantillas ([Plantillas de corredor](topic:corridor-templates)); las plantillas por estación todavía no admiten peralte |
| Un cambio gradual entre las plantillas de dos zonas (transiciones, ahusamientos) | Cambie la plantilla en una estación, o asigne a un punto un objetivo de ancho en una línea dibujada como ahusamiento |
| Giro alrededor de un borde, peralte en LandXML | El peralte gira alrededor del eje en curvas circulares; amplíe un carril con un objetivo de ancho hacia una línea de elementos |
| Objetivos para los taludes laterales (intersección con una línea o una superficie), superficies propias del corredor | Los objetivos mueven los bordes de calzadas y arcenes ([Corredores](topic:corridor)); el corredor se explana en la superficie proyectada |
| Corredores exportados como viales LandXML; un segundo corredor en un trazado en la exportación IFC | Se exporta la superficie proyectada |
| Plantillas de terreno que cambian la superficie proyectada, en 3D o en las secciones | Dan áreas y volúmenes de cada capa ([Plantillas de terreno](topic:corridor-templates#terrain-templates)) |
| Trayectorias de giro con velocidad, deslizamiento de neumáticos, tiempo de giro, remolques de dirección o gálibo de carrocería; una biblioteca de vehículos de proyecto estándar; una trayectoria dibujada arrastrando el vehículo | Trayectorias de giro a baja velocidad a lo largo de una línea de elementos o de un trazado, con sus propias dimensiones de vehículo ([Trayectorias de giro de vehículos](topic:swept-paths)) |

## Movimiento de tierras y volúmenes

| No disponible todavía | En su lugar, hoy |
|---|---|
| Bermas, líneas de elementos abiertas explanadas en el proyecto, explanación hasta una línea de elementos de otro lugar | Cierre la línea de elementos ([Líneas de elementos](topic:feature-lines)), o úsela como línea de ruptura del terreno existente |
| Insertar o eliminar un vértice de una línea de elementos | Vuelva a dibujar la línea, o haga un desplazamiento escalonado de ella |
| Arcos en líneas de ruptura dibujadas (por puntos topográficos), espirales en líneas de elementos | Dibuje una línea de elementos con arcos y úsela como línea de ruptura del terreno existente |
| Explanación hasta una distancia, una cota u otra superficie | Solo intersección de talud con el terreno existente |
| Añadir o quitar una esquina de plataforma | Elimine la plataforma y vuelva a dibujarla |
| Volúmenes TIN a TIN (prismáticos), elección del tamaño de celda de la malla | Método de malla, con el tamaño de celda elegido por el programa |
| Hinchamiento y merma, capa vegetal, espesores de firme | Aplique usted mismo los factores a los valores informados |
| Costes de transporte libre y de sobreacarreo, transporte entre trazados distintos, préstamos y vertederos situados en el plano | El diagrama de masas con puntos de equilibrio, volúmenes movidos y distancias medias de acarreo |

## Redes de tuberías

| No disponible todavía | En su lugar, hoy |
|---|---|
| Más de una red por proyecto | Proyectos separados para pluvial y sanitario |
| Redes de agua a presión: calidad y edad del agua, controles basados en reglas, otros tipos de válvula (control de caudal, estrangulación, sostenimiento), bombas definidas por potencia, demanda que depende de la presión, opción Darcy–Weisbach, un catálogo de tuberías con espesores de pared y clases de presión. El resto de redes a presión está en laboratorio: [Redes de agua a presión](topic:water-mains) | Compruébelos en un software de distribución de agua; los caudales de diseño de saneamiento están en [Caudales de diseño de saneamiento](topic:sanitary-design) |
| Caudales de alcantarillado en el tiempo (hidrogramas, tránsito dinámico, almacenamiento, bombas, aliviaderos) | [Caudales de diseño de saneamiento](topic:sanitary-design) da el caudal punta constante que usa una hoja de diseño |
| Capacidad de sumideros, extensión de cuneta, tránsito de retención, hidrogramas, pérdidas de energía distintas de un coeficiente en la unión | Compruébelos en otro software; los caudales, las dimensiones y las líneas de gradiente hidráulico están en [Drenaje pluvial](topic:storm-drainage) |
| Cuencas de aportación en el plano PDF, DWG, DXF o LandXML; cuencas de aportación desde la superficie (cuencas vertientes) | Dibuje las cuencas a mano; se guardan en el archivo del proyecto |
| Catálogos de tuberías, tuberías no circulares, estructuras que no son cajas o cilindros verticales (conos, peldaños, banquetas de fondo), una categoría de drenaje en la biblioteca | Tipos de estructura a partir de parámetros ([Red de tuberías](topic:pipe-network)); tuberías con un diámetro |
| Tuberías en la vista de perfil, tuberías curvas | Lea las cotas de batea y el recubrimiento en el panel derecho |

## Parcelas

| No disponible todavía | En su lugar, hoy |
|---|---|
| Trazado de lotes por superficie o frente, parcelas a partir de las líneas que las rodean, derecho de vía | Dibuje cada parcela por sus vértices, o introduzca sus tramos |
| Tablas de curvas y tablas de líneas en el plano; etiquetas movidas a mano | Cada tramo lleva su etiqueta a lo largo de sí mismo |
| Parcelas en LandXML | Las parcelas se guardan en el archivo del proyecto y pasan al PDF, DWG y DXF |

## Poligonales

| No disponible todavía | En su lugar, hoy |
|---|---|
| Ajuste por mínimos cuadrados, regla del tránsito, ponderación de ángulos frente a distancias | La regla de la brújula |
| Ángulos de deflexión, ángulos cenitales y distancias inclinadas, cotas por nivelación trigonométrica | Reduzca bien a distancias horizontales y ángulos, o a rumbos |
| Radiaciones laterales, archivos de datos brutos de colectores de datos | Importe los puntos como archivo de puntos |

## Replanteo

| No disponible todavía | En su lugar, hoy |
|---|---|
| Estacas de desplazamiento (puntos de referencia retranqueados respecto a la estaca), estacas de talud en el punto de encuentro con el terreno | Replantee en los desplazamientos que necesite, incluso más allá del arcén |
| Enviar las estacas directamente al formato propio de un colector de datos | El CSV se abre en el software de oficina de la mayoría de colectores de datos |
| Replanteo de tuberías, plataformas y parcelas | Use puntos topográficos cerca de un trazado, o los tramos de la parcela |

## Archivos y salidas

| No disponible todavía | En su lugar, hoy |
|---|---|
| Texto, tramas y cotas de DWG o DXF; espacio papel; dibujos vinculados (xrefs); DXF binario | Se abre la geometría lineal del espacio modelo ([Abrir un DWG o DXF como geometría lineal](topic:open-dwg-dxf)); abra los dibujos vinculados por separado |
| Mover varios puntos a la vez arrastrando | Córtelos y péguelos, o edítelos uno a uno |
| Hojas en vertical, cajetines propios, ventanas gráficas que usted organiza, hojas de planta y perfil en DWG | Una hoja de planta apaisada por PDF, o hojas de planta y perfil a lo largo de un trazado (PDF) |
| Trazar bandas de cota y perfiles | Las bandas solo se ven en pantalla; haga una captura si las necesita |
| Cambiar nombres de capa, colores o estilos de etiqueta | Cámbielos en un programa CAD después de exportar a DXF |
| Guardado en la nube e historial de versiones | Guarde los archivos `.civilcraft.json` y manténgalos con copia de seguridad; para trabajar juntos en un proyecto, use una sesión en vivo en CadCraft Studio ([Diseñe un emplazamiento juntos, en vivo](topic:work-live)) |
| CadCraft Studio para iPad y iPhone, y desde Google Play | Use CivilCraft en el navegador del dispositivo; en Android, CadCraft Studio se instala desde su APK en getcadcraft.com/download |
| Abrir varios archivos de puntos o de proyecto a la vez | Un archivo por apertura (los archivos SIG que van juntos, como las partes de un shapefile, se abren juntos) |

## Paisajismo

| No disponible todavía | En su lugar, hoy |
|---|---|
| Cabezales y boquillas de fabricantes | Cabezales genéricos, o añada sus propios cabezales desde un archivo; los datos de los fabricantes llegarán a medida que den su permiso |
| Longitudes laterales máximas para líneas de goteo, caudales en el tiempo, bombas, redes de tuberías en malla | Mantenga los ramales de goteo dentro de la longitud publicada por el fabricante; la comprobación necesita una red ramificada |
| El contorno exacto de un objeto de forma libre cóncavo; su volumen bajo el terreno medido con exactitud | Se explana la envolvente convexa, y el volumen bajo el terreno es una estimación (indicado en Propiedades) |
| Plantas en la función Colocar desde biblioteca propia de BimCraft y ModelCraft | Exporte el IFC de paisajismo y ábralo en BimCraft junto al edificio |
| Modelos detallados de plantas (hojas, ramas, estaciones) en la vista 3D; objetos de forma libre y riego en la vista 3D | En 3D, las plantas se muestran como formas simples con el tamaño de la lista de plantas ([Ver el emplazamiento en 3D](topic:site-3d)); la dispersión de ModelCraft crea imágenes de plantación |
| Muros de obra dura que contienen un nivel explanado detrás de ellos en la superficie | Dé a una plataforma o a una base lados verticales: son muros de contención en la superficie ([Explanación](topic:grading)) |
| Transformaciones SVG en sus propios símbolos; texturas y colores de sus propios modelos de plantas GLB; geometría GLB comprimida | Aplane antes las transformaciones en su programa de dibujo; los modelos se dibujan con el color de la planta; exporte el GLB sin compresión ([Gráficos de plantas](topic:plant-graphics)) |
| Su propia lista de plantas guardada en su cuenta de Biblioteca (editada en la aplicación) | Edite la lista propia del proyecto en la tabla de plantas y guárdela como archivo de plantas |
| Las herramientas de paisajismo para asistentes sin ventana (el servidor de archivos y la línea de comandos) | Funcionan con la ventana de CivilCraft abierta ([Deje que un asistente de IA trabaje con su emplazamiento](topic:assistants)) |

## Líneas eléctricas

| No disponible todavía | En su lugar, hoy |
|---|---|
| Una norma de un país integrada (hipótesis de carga, distancias de seguridad, factores) | Introduzca los valores de su norma en {{ui:Load cases and limits…}} y guárdelos, con su biblioteca, como un paquete para reutilizar y compartir ([Paquetes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distancia lateral de un conductor a la copa de un árbol o a un muro junto a la línea | La distancia libre vertical sobre plantas y muros que cruza la línea ([Comprobaciones de líneas eléctricas](topic:power-line-checks#clearances)) |
| Fluencia del conductor y estiramiento de un conductor nuevo | Tenga en cuenta ambos mediante las temperaturas de la tabla de tendido |
| Capacidad térmica de cables enterrados (intensidad admisible según su instalación) | Introduzca la intensidad admisible de su proveedor en el elemento del cable |
| Estudios de cortocircuito, protección y puesta a tierra | Use un programa eléctrico específico; CivilCraft da las longitudes y los cables de la red |
| Torres de celosía diseñadas barra a barra, y anclajes de retenidas en el terreno | Los apoyos se comprueban por su carga nominal; las retenidas, por su carga admisible |
| Un archivo de estudio `.DON` comprobado en el programa que lo lee | Compruébelo allí; envíenos una muestra para probar con un archivo real |
| Líneas eléctricas en la vista 3D y en IFC | El plano, el perfil de la línea, las hojas y las capas SIG |
| Las herramientas de líneas eléctricas para asistentes sin ventana | Funcionan con la ventana de CivilCraft abierta ([Deje que un asistente de IA trabaje con su emplazamiento](topic:assistants)) |

## Volúmenes de edificación

| No disponible todavía | En su lugar, hoy |
|---|---|
| Una biblioteca de códigos de zonificación o de las normas de cualquier ciudad | Introduzca los límites de su propia ordenanza ([Límites de zonificación](topic:zoning-limits)) |
| Luz de cielo en las fachadas (iluminación natural de fachada), viento | [Horas de sol](topic:sun-hours) cuenta solo el sol directo |
| Sombra de árboles, plantas o cualquier cosa que no esté dibujada como volumen | Dibuje los edificios vecinos como volúmenes |
| Formas de cubierta en los volúmenes | Volúmenes con cubierta plana |
| Huecos, cubiertas y tipos de muro cuando un volumen se desarrolla en BimCraft | BimCraft crea muros exteriores simples en cada planta y en un forjado; añada el resto allí |

## SIG y sistemas de coordenadas

| No disponible todavía | En su lugar, hoy |
|---|---|
| Geodatabase de archivo; estilos KML, iconos, superposiciones de suelo y vínculos de red | Convierta primero a GeoPackage, shapefile o GeoJSON; las marcas KML se leen sin sus estilos |
| Editar entidades SIG o sus atributos | Edítelas en un programa SIG e impórtelas de nuevo. El panel Analizar crea capas nuevas (zona de influencia, superposición, unión, selección) y añade campos de área y longitud, pero no edita una entidad en su sitio |
| Análisis de redes y ráster, zonas de influencia con extremos planos o cuadrados, zonas de influencia de un solo lado, añadir o eliminar filas y cambiar el tipo de un campo en la tabla de atributos, colores de clase manuales, leyenda de estilo en los planos | Use Seleccionar para elegir entidades y crear una capa con ellas; los extremos planos no se ofrecen. Colorear por atributo y la tabla de atributos ya están disponibles: vea [Dar estilo a una capa por un atributo](topic:gis-symbology) y [Trabajar con la tabla de atributos de una capa](topic:gis-table) |
| Estilos de etiqueta (tamaño, colocación) y etiquetas que se eviten entre sí | Las etiquetas tienen un solo tamaño y pueden solaparse donde las entidades son densas |
| Datums verticales y modelos de geoide | Las cotas se usan tal como las da el archivo; compruebe usted el datum vertical |
| Desplazamientos de malla distintos del paso de NAD27 a NAD83 sugerido por zona (OSTN15; NTv2 para otros datums funciona al añadir el archivo), varias mallas a la vez, mallas verticales | Añada usted el archivo de malla para su datum; una malla por proyecto |
| Capas de mapa en las exportaciones DXF o 3D | Las capas de mapa van al PDF, y junto al DWG como imagen |
| Servidores de mapas que requieren inicio de sesión, clave o token | Use servicios públicos, o un archivo de imagen georreferenciado |
| Escribir archivos LAS o LAZ desde una superficie, el modelo del terreno o las herramientas de malla de cotas y LiDAR | Exporte las superficies como malla de cotas GeoTIFF. El complemento [Nubes de puntos](topic:point-clouds) escribe una nube depurada como LAS 1.4 o LAZ |
| Intensidad, color y retornos de LiDAR; mallas de cotas con varias bandas; archivos de malla o LiDAR de más de 200 MB | LiDAR se filtra solo por clase; las mallas usan su primera banda; divida antes los archivos grandes en teselas |

## Entrada

| No disponible todavía | En su lugar, hoy |
|---|---|
| Selección por recuadro táctil (necesita {{key:Shift}}) | Mantenga pulsado cada punto topográfico para añadirlo |
| Coordenadas o distancias escritas mientras dibuja | Dibuje a ojo y, después, escriba las coordenadas exactas de los PI en la tabla de PI del trazado |
| Escribir coordenadas de esquinas de plataforma y estructuras | Arrastre sus agarres; haga zoom para mayor precisión y vigile E y N en la barra de estado |
| Ajuste a objetos (salvo puntos topográficos para líneas de ruptura) | Haga zoom y vigile la barra de estado |

## Vista 3D

| No disponible todavía | En su lugar, hoy |
|---|---|
| Dibujar o editar en la vista 3D | Dibuje y edite en el plano; la vista 3D sigue cada cambio |
| Seleccionar líneas de elementos de corredor o entidades SIG haciendo clic en 3D | Haga clic en ellas en el plano |
| Exportar la vista exagerada o en pies | Las exportaciones están a escala real en metros; vea [Exportar el emplazamiento en 3D](topic:export-3d) |
| Etiquetas en exportaciones GLB u OBJ, tamaños y estilos de etiqueta en 3D | Las etiquetas se ven solo en la vista 3D, con un único tamaño; vea [Ver el emplazamiento en 3D](topic:site-3d) |
| Texturas a partir de fotos, grabar un recorrido en vídeo, sombras de fuera del emplazamiento, horas de sol mostradas en la vista 3D | Capas de mapa superpuestas sobre las superficies; recorrido y posición del sol en un momento dado; [horas de sol](topic:sun-hours) para un día o una temporada en el plano |
