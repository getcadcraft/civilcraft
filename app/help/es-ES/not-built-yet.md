---
title: Aún no disponible
summary: Lo que esta versión de CivilCraft todavía no hace, y qué hacer en su lugar hoy.
keywords: falta, limitaciones, hoja de ruta, no disponible, espirales, ensanche, dwg, dxf, sumideros, retención, secciones transversales, próximamente, límites
from: b91588d4
---

CivilCraft está en una fase temprana. Esta página indica lo que la versión actual no hace, para que no lo busque. No se promete ninguna de estas funciones para una fecha concreta.

## Puntos

| Aún no disponible | En su lugar, hoy |
|---|---|
| Añadir un segundo archivo de puntos al primero | Una los archivos en un editor de texto o en una hoja de cálculo antes |
| Exportar un archivo de texto de puntos | Exporte LandXML (los puntos salen como CgPoints), use GIS {{ui:Exportar}} (puntos con los campos P, N, E, Z y D), o {{ui:Copiar}} los puntos a una hoja de cálculo |
| Estilos de rotulación de puntos, símbolos por clave de descripción, curvas (arcos) a partir de códigos de línea, un archivo de claves de descripción para compartir entre proyectos | Las etiquetas muestran el número, la cota y la descripción, o menos ([Configuración de CivilCraft](topic:settings)); las claves se guardan en el archivo del proyecto |
| Conversión de unidades | Convierta el archivo antes de importarlo; **Unidades** solo cambia la etiqueta |

## Superficies

| Aún no disponible | En su lugar, hoy |
|---|---|
| Más de una superficie construida a partir de puntos | Un proyecto por superficie |
| Ocultar contornos (interiores) | Use **Borde exterior más largo** o un contorno exterior |
| Seleccionar o editar una línea de rotura dibujada | {{key:Mod+Z}}, o {{ui:Quitar líneas de ruptura dibujadas}} y vuelva a dibujarla |
| Editar una superficie leída de LandXML (líneas de rotura, contorno) | {{ui:Reconstruir la superficie a partir de los puntos}} |
| Editar una superficie hecha a partir de una malla de cotas | Importe de nuevo la malla con otras opciones |
| Convertir una superficie leída de LandXML cuando cambia el sistema de coordenadas | {{ui:Reconstruir la superficie a partir de los puntos}} primero |
| Cotas puntuales y valores de pendiente rotulados | Léalos en la barra de estado, o coloree la superficie por pendiente con **Análisis de pendiente** en el espacio de trabajo de Paisajismo ([Nivelación para paisajismo](topic:landscape-grading#grading-checks)) |

## Trazados y perfiles

| Aún no disponible | En su lugar, hoy |
|---|---|
| Espirales distintas de la clotoide; una espiral entre dos curvas (transiciones compuestas) | Las clotoides en los extremos de una curva están disponibles; las demás se nombran y se omiten al importar LandXML |
| Insertar un PI entre otros dos | Vuelva a dibujar el trazado, o reescriba las coordenadas de los PI |
| Trazados a partir de objetos, desplazamientos, ensanches | Dibuje por PI |
| Escribir K para una curva vertical | Escriba L (se muestra K) |
| Curvas verticales circulares y asimétricas | Solo curvas parabólicas simétricas |
| Más de un perfil de proyecto por trazado | Un trazado por variante |
| Ampliar la vista de perfil, bandas de perfil bajo el perfil | La vista de perfil ajusta todo el trazado; imprímalo en [hojas de planta y perfil](topic:plan-profile-sheets) |
| Secciones en DWG o LandXML | Hojas de secciones en PDF; {{ui:CSV}} de las superficies y volúmenes |
| Líneas de muestreo oblicuas, o de distintas anchuras a lo largo de la carretera | Una anchura por lado para todo el trazado |

## Corredores

| Aún no disponible | En su lugar, hoy |
|---|---|
| Medianas, barreras y un peralte que gira plantillas | Dibújelos como plantillas ([Plantillas de corredor](topic:corridor-templates)); las plantillas por P.K. aún no admiten peralte |
| Un cambio gradual entre las plantillas de dos regiones (transiciones, ahusamientos) | Cambie la plantilla en un P.K., o dé a un punto un objetivo de anchura hacia una línea dibujada como ahusamiento |
| Giro alrededor de un borde, peralte en LandXML | El peralte gira alrededor del eje en las curvas circulares; ensanche un carril con un objetivo de anchura hacia una línea característica |
| Objetivos para los taludes laterales (encuentro con el terreno hasta una línea o una superficie), superficies propias de corredor | Los objetivos mueven los bordes de calzada y de arcén ([Corredores](topic:corridor)); el corredor se ajusta a la superficie de proyecto |
| Radios de bordillo, carriles de giro e isletas ajustados en una intersección; el final de una vía secundaria cortado al borde de la carretera principal en oblicuo; una senda enlazada a una carretera en la planta, en su longitud y superficie | Las carreteras que se encuentran se enlazan en ángulo recto, con el borde de la carretera principal abierto y la vía secundaria suavizada hasta él ([Donde las carreteras se encuentran](topic:corridor#where-roads-meet-roads-pads-and-paths)); una senda se detiene en el borde de la carretera en la superficie de proyecto y en 3D |
| Corredores exportados como carreteras LandXML; un segundo corredor en un trazado en la exportación IFC | Se exporta la superficie de proyecto |
| Plantillas de terreno que cambian la superficie de proyecto, en 3D o en las secciones | Dan superficies y volúmenes de cada capa ([Plantillas de terreno](topic:corridor-templates#terrain-templates)) |
| Trayectorias de giro con velocidad, deslizamiento de neumáticos, tiempo de giro, remolques de dirección o gálibo de carrocería; una biblioteca de vehículos de proyecto estándar; una trayectoria de giro dibujada arrastrando el vehículo | Trayectorias de giro a baja velocidad a lo largo de una línea característica o de un trazado, con sus propias medidas de vehículo ([Trayectorias de giro de vehículos](topic:swept-paths)) |

## Nivelación y volúmenes

| Aún no disponible | En su lugar, hoy |
|---|---|
| Banquetas, líneas características abiertas ajustadas al proyecto, nivelación hasta una línea característica de otro lugar | Cierre la línea característica ([Líneas características](topic:feature-lines)), o úsela como línea de rotura del terreno existente |
| Insertar o quitar un vértice de una línea característica | Vuelva a dibujar la línea, o haga un desplazamiento escalonado de ella |
| Arcos en líneas de rotura dibujadas (por puntos topográficos), espirales en líneas características | Dibuje una línea característica con arcos y úsela como línea de rotura del terreno existente |
| Nivelación a una distancia, una cota u otra superficie | Solo encuentro con el terreno existente |
| Añadir o quitar una esquina de plataforma | Borre la plataforma y vuelva a dibujarla |
| Volúmenes TIN a TIN (prismáticos), elegir el tamaño de celda de la malla | Método de malla, con el tamaño de celda elegido automáticamente |
| Esponjamiento y contracción, tierra vegetal, espesores de firme | Aplique usted los factores a las cifras indicadas |
| Costes de acarreo libre y sobreacarreo, acarreo entre trazados distintos, préstamos y vertederos situados en la planta | El diagrama de masas con puntos de equilibrio, volúmenes movidos y distancias medias de acarreo |

## Redes de tuberías

| Aún no disponible | En su lugar, hoy |
|---|---|
| Más de una red por proyecto | Proyectos separados para pluviales y saneamiento |
| Conducciones de agua: calidad y edad del agua, controles por reglas, otros tipos de válvula (control de caudal, estrangulación, sostenimiento), bombas definidas por potencia, demanda que depende de la presión, opción de Darcy–Weisbach, un catálogo de tuberías con espesores de pared y clases de presión. El resto de redes a presión está en fase de laboratorio: [Conducciones de agua](topic:water-mains) | Compruébelos en un programa de distribución de agua; los caudales de diseño de saneamiento están en [Caudales de diseño de saneamiento](topic:sanitary-design) |
| Caudales de alcantarillado a lo largo del tiempo (hidrogramas, tránsito dinámico, almacenamiento, bombas, aliviaderos) | [Caudales de diseño de saneamiento](topic:sanitary-design) da el caudal punta constante que usa una hoja de diseño |
| Capacidad de sumideros, dispersión en cuneta, tránsito en retención, hidrogramas, pérdidas de energía distintas de un coeficiente de unión | Compruébelos en otro programa; los caudales, tamaños y líneas de gradiente están en [Drenaje pluvial](topic:storm-drainage) |
| Cuencas en la impresión PDF, DWG, DXF o LandXML; cuencas a partir de la superficie (divisorias de aguas) | Dibuje las cuencas a mano; se guardan en el archivo del proyecto |
| Catálogos de tuberías, tuberías no circulares, estructuras que no son cajas o cilindros verticales (conos, escalones, banqueteado), una categoría de drenaje en la biblioteca | Tipos de estructura a partir de parámetros ([Red de tuberías](topic:pipe-network)); tuberías con diámetro |
| Tuberías en la vista de perfil, tuberías curvas | Lea las cotas de fondo y el recubrimiento en el panel derecho |

## Parcelas

| Aún no disponible | En su lugar, hoy |
|---|---|
| Distribución de lotes por superficie o frente, parcelas a partir de las líneas que las rodean, derecho de vía | Dibuje cada parcela por sus esquinas, o introduzca sus rumbos |
| Tablas de curvas y tablas de líneas en la planta; etiquetas movidas a mano | Cada tramo se rotula a lo largo de sí mismo |
| Parcelas en LandXML | Las parcelas se guardan en el archivo del proyecto y pasan a PDF, DWG y DXF |

## Poligonales

| Aún no disponible | En su lugar, hoy |
|---|---|
| Compensación por mínimos cuadrados, la regla del tránsito, ponderación de ángulos frente a distancias | La regla de la brújula |
| Ángulos de deflexión, ángulos cenitales y distancias inclinadas, cotas por nivelación trigonométrica | Reduzca bien a distancias y ángulos horizontales, o a rumbos |
| Radiaciones laterales, archivos de datos brutos de colectores | Importe los puntos como archivo de puntos |

## Replanteo

| Aún no disponible | En su lugar, hoy |
|---|---|
| Estacas de desplazamiento (puntos de referencia retranqueados de la estaca), estacas de talud en el punto de encuentro con el terreno | Replantee en los desplazamientos que necesite, incluso más allá del arcén |
| Enviar las estacas directamente en el formato propio de un colector de datos | El CSV se abre en el software de oficina de la mayoría de colectores de datos |
| Replanteo de tuberías, plataformas y parcelas | Use puntos topográficos cerca de un trazado, o las líneas de la parcela |

## Archivos y salida

| Aún no disponible | En su lugar, hoy |
|---|---|
| Texto, tramas y cotas de DWG o DXF; espacio papel; dibujos vinculados (xrefs); DXF binario | Se abre la geometría del espacio modelo ([Abrir un DWG o DXF como geometría](topic:open-dwg-dxf)); abra los dibujos vinculados por separado |
| Mover varios puntos a la vez arrastrándolos | Córtelos y péguelos, o edítelos uno a uno |
| Hojas en vertical, cajetines propios, ventanas gráficas que usted organice, hojas de planta y perfil en DWG | Una hoja de planta apaisada por PDF, o hojas de planta y perfil a lo largo de un trazado (PDF) |
| Trazado de bandas de cotas y perfiles | Las bandas solo se ven en pantalla; haga una captura si las necesita |
| Cambiar nombres de capa, colores o estilos de rotulación | Cámbielos en un programa CAD tras la exportación DXF |
| Guardado en la nube e historial de versiones | Guarde los archivos `.civilcraft.json` y manténgalos respaldados; para trabajar en un proyecto en conjunto, use una sesión en directo en CadCraft Studio ([Diseñar un emplazamiento juntos, en directo](topic:work-live)) |
| CadCraft Studio para iPad y iPhone, y desde Google Play | Use CivilCraft en el navegador del dispositivo; en Android, CadCraft Studio se instala desde su APK en getcadcraft.com/download |
| Abrir varios archivos de puntos o de proyecto a la vez | Un archivo por cada apertura (los archivos GIS que van juntos, como las partes de un shapefile, se abren juntos) |

## Paisajismo

| Aún no disponible | En su lugar, hoy |
|---|---|
| Cabezales y boquillas de fabricantes | Cabezales genéricos, o añada sus propios cabezales desde un archivo; los datos de los fabricantes llegan a medida que dan su permiso |
| Longitudes laterales máximas para líneas de goteo, caudales a lo largo del tiempo, bombas, redes de tuberías en malla | Mantenga los tramos de goteo en la longitud publicada por el fabricante; la comprobación necesita una red ramificada |
| El contorno exacto de un objeto de forma libre cóncavo; su volumen bajo el terreno medido con exactitud | Se nivela la envolvente convexa, y el volumen bajo el terreno es una estimación (así se indica en Propiedades) |
| Plantas en el propio Colocar desde biblioteca de BimCraft y ModelCraft | Exporte la IFC de paisajismo y ábrala en BimCraft junto al edificio |
| Modelos detallados de plantas (hojas, ramas, estaciones) en la vista 3D; objetos de forma libre y riego en la vista 3D | Las plantas se muestran en 3D como formas sencillas con el tamaño de la lista de plantas ([Ver el emplazamiento en 3D](topic:site-3d)); la dispersión de ModelCraft crea imágenes de plantación |
| Muros de obra dura que retienen un nivel nivelado tras ellos en la superficie | Dé a una plataforma lados verticales: son muros de contención en la superficie ([Nivelación](topic:grading)) |
| Transformaciones SVG en sus propios símbolos; texturas y colores de sus propios modelos GLB de plantas; geometría GLB comprimida | Aplane antes las transformaciones en su programa de dibujo; los modelos se dibujan con el color de la planta; exporte el GLB sin compresión ([Gráficos de plantas](topic:plant-graphics)) |
| Su propia lista de plantas guardada en su cuenta de Biblioteca (editada en la aplicación) | Edite la lista propia del proyecto en la tabla de plantas y guárdela como archivo de plantas |
| Las herramientas de paisajismo para asistentes sin ventana (el servidor de archivos y la línea de comandos) | Funcionan con la ventana de CivilCraft abierta ([Deje que un asistente de IA trabaje con su emplazamiento](topic:assistants)) |

## Líneas eléctricas

| Aún no disponible | En su lugar, hoy |
|---|---|
| Una norma nacional integrada (hipótesis de carga, distancias de seguridad, coeficientes) | Fije los valores de su norma en {{ui:Hipótesis de carga y límites…}} y guárdelos, junto con su biblioteca, como paquete para reutilizarlo y compartirlo ([Paquetes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distancia horizontal desde un conductor hasta la copa de un árbol o un muro junto a la línea | La distancia libre en vertical sobre plantas y muros que cruza la línea ([Comprobaciones de líneas eléctricas](topic:power-line-checks#clearances)) |
| Fluencia del conductor y estiramiento de un conductor nuevo | Tenga en cuenta ambos a través de las temperaturas de la tabla de tendido |
| Capacidad térmica de cables enterrados (intensidad admisible según cómo se tienden) | Introduzca la intensidad admisible de su proveedor en el elemento del cable |
| Estudios de cortocircuito, protección y puesta a tierra | Use un programa eléctrico específico; CivilCraft da las longitudes y los cables de la red |
| Torres de celosía diseñadas barra a barra, y anclajes de tirante en el terreno | Los apoyos se comprueban por su carga nominal; los tirantes por su carga de trabajo |
| Un archivo de estudio `.DON` comprobado en el programa que lo lee | Compruébelo allí; envíenos una muestra para probar con un archivo real |
| Líneas eléctricas en la vista 3D y en IFC | La planta, el perfil de la línea, las hojas y las capas GIS |
| Las herramientas de líneas eléctricas para asistentes sin ventana | Funcionan con la ventana de CivilCraft abierta ([Deje que un asistente de IA trabaje con su emplazamiento](topic:assistants)) |

## Volúmenes de edificación

| Aún no disponible | En su lugar, hoy |
|---|---|
| Una biblioteca de códigos urbanísticos o de las normas de cualquier ciudad | Escriba los límites de su propia ordenanza ([Límites de zonificación](topic:zoning-limits)) |
| Luz de cielo en los muros (luz natural de fachada), viento | [Horas de sol](topic:sun-hours) cuenta solo el sol directo |
| Sombra de árboles, plantas o cualquier cosa que no esté dibujada como volumen | Dibuje los edificios vecinos como volúmenes |
| Formas de cubierta en los volúmenes | Volúmenes con cubierta plana |
| Huecos, cubiertas y tipos de muro cuando un volumen se desarrolla en BimCraft | BimCraft construye muros exteriores sencillos en cada planta y un forjado; añada el resto allí |

## GIS y sistemas de coordenadas

| Aún no disponible | En su lugar, hoy |
|---|---|
| Geodatabase de archivos; estilos KML, iconos, superposiciones de terreno y enlaces de red | Convierta antes a GeoPackage, shapefile o GeoJSON; las marcas KML se leen sin sus estilos |
| Editar elementos GIS o sus atributos | Edítelos en un programa GIS e importe de nuevo. El panel Analizar crea capas nuevas (zona de influencia, superposición, unión, selección) y añade campos de superficie y longitud, pero no edita un elemento en su lugar |
| Análisis de redes y de ráster, zonas de influencia con extremos planos o cuadrados y unilaterales, añadir o borrar filas y cambiar el tipo de un campo en la tabla de atributos, colores de clase manuales, una leyenda de estilo en las impresiones | Use Seleccionar para elegir elementos y cree una capa con ellos; los extremos planos no se ofrecen. El coloreado por atributo y la tabla de atributos están disponibles: vea [Estilo de una capa por un atributo](topic:gis-symbology) y [Trabajar con la tabla de atributos de una capa](topic:gis-table) |
| Estilos de rótulos (tamaño, colocación) y rótulos que se evitan entre sí | Los rótulos tienen un solo tamaño y pueden solaparse donde los elementos son densos |
| Datums verticales y modelos de geoide | Las cotas se usan tal como las da el archivo; compruebe usted el datum vertical |
| Desplazamientos de malla distintos de NAD27 a NAD83 sugeridos por zona (OSTN15; NTv2 para otros datums funciona al añadir el archivo), varias mallas a la vez, mallas verticales | Añada usted el archivo de malla para su datum; una malla por proyecto |
| Capas de mapa en la exportación DXF o 3D | Las capas de mapa van a la impresión PDF, y junto al DWG como imagen |
| Servidores de mapas que requieren inicio de sesión, clave o token | Use servicios públicos, o un archivo de imagen georreferenciada |
| Escribir archivos LAS o LAZ desde una superficie, el modelo del terreno o las herramientas de malla de cotas y LiDAR | Exporte las superficies como malla de cotas GeoTIFF. El complemento [Nubes de puntos](topic:point-clouds) escribe una nube depurada como LAS 1.4 o LAZ |
| Intensidad, color y retornos LiDAR; mallas de cotas con varias bandas; archivos de malla o LiDAR de más de 200 MB | El LiDAR se filtra solo por clase, y las mallas usan su primera banda; corte antes los archivos grandes en teselas |

## Entrada

| Aún no disponible | En su lugar, hoy |
|---|---|
| Selección por recuadro al tacto (necesita {{key:Shift}}) | Mantenga pulsado cada punto topográfico para añadirlo |
| Coordenadas o distancias escritas mientras dibuja | Dibuje a grandes rasgos y después escriba las coordenadas exactas de los PI en la tabla de PI del trazado |
| Escribir coordenadas de esquinas de plataforma y estructuras | Arrastre sus agarres; amplíe para mayor precisión y vigile E y N en la barra de estado |
| Ajuste a objetos (salvo puntos topográficos para líneas de rotura) | Amplíe y vigile la barra de estado |

## Vista 3D

| Aún no disponible | En su lugar, hoy |
|---|---|
| Dibujar o editar en la vista 3D | Dibuje y edite en la planta; la vista 3D sigue cada edición |
| Seleccionar líneas características de corredor o elementos GIS haciendo clic en 3D | Haga clic en ellos en la planta |
| Exportar la vista exagerada o en pies | Las exportaciones están a escala real en metros; vea [Exportar el emplazamiento en 3D](topic:export-3d) |
| Rótulos en exportaciones GLB u OBJ, tamaños y estilos de rótulo en 3D | Los rótulos se muestran solo en la vista 3D, con un tamaño; vea [Ver el emplazamiento en 3D](topic:site-3d) |
| Texturas de fotos, grabación de un recorrido como vídeo, sombras de fuera del emplazamiento, horas de sol mostradas en la vista 3D | Capas de mapa superpuestas a las superficies; recorrido y posición del sol en un momento dado; [horas de sol](topic:sun-hours) para un día o una temporada en la planta |
