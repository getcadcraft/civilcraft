---
title: Aún no disponible
summary: Lo que esta versión de CivilCraft aún no hace, y qué hacer en su lugar hoy.
keywords: faltante, limitaciones, hoja de ruta, no disponible, espirales, ensanchamiento, dwg, dxf, coladeras, retención, secciones transversales, más adelante, límites
from: a2d970ef
---

CivilCraft está en una etapa temprana. Esta página enumera lo que la versión actual no hace, para que no lo busque. Nada de lo que aparece aquí tiene una fecha prometida.

## Puntos

| Aún no disponible | En su lugar, hoy |
|---|---|
| Agregar un segundo archivo de puntos al primero | Una los archivos en un editor de texto u hoja de cálculo antes |
| Exportar un archivo de texto de puntos | Exporte LandXML (los puntos salen como CgPoints), use GIS {{ui:Exportar}} (puntos con los campos P, N, E, Z y D), o {{ui:Copiar}} los puntos a una hoja de cálculo |
| Estilos de etiqueta de puntos, símbolos por clave de descripción, curvas (arcos) a partir de códigos de línea, un archivo de claves de descripción para compartir entre proyectos | Las etiquetas muestran el número, la elevación y la descripción, o menos ([Configuración de CivilCraft](topic:settings)); las claves se guardan en el archivo del proyecto |
| Conversión de unidades | Convierta el archivo antes de importar; **Unidades** solo cambia la etiqueta |

## Superficies

| Aún no disponible | En su lugar, hoy |
|---|---|
| Más de una superficie construida a partir de puntos | Un proyecto por superficie |
| Ocultar límites (interiores) | Use **Arista exterior más larga** o un límite exterior |
| Seleccionar o editar una línea de ruptura dibujada | {{key:Mod+Z}}, o {{ui:Quitar líneas de ruptura dibujadas}} y vuelva a dibujar |
| Editar una superficie leída desde LandXML (líneas de ruptura, límite) | {{ui:Reconstruir la superficie a partir de los puntos}} |
| Editar una superficie hecha de una cuadrícula de elevaciones | Importe la cuadrícula de nuevo con otras opciones |
| Convertir una superficie leída de LandXML cuando cambia el sistema de coordenadas | Primero, {{ui:Reconstruir la superficie a partir de los puntos}} |
| Cotas de elevación etiquetadas y valores de pendiente | Léalos en la barra de estado, o coloree la superficie por pendiente con **Análisis de pendiente** en el espacio de trabajo Paisaje ([Nivelación para paisajismo](topic:landscape-grading#grading-checks)) |

## Alineaciones y perfiles

| Aún no disponible | En su lugar, hoy |
|---|---|
| Espirales distintas de la clotoide; una espiral entre dos curvas (transiciones compuestas) | Las espirales clotoides en los extremos de una curva están disponibles; las demás se nombran y se omiten al importar LandXML |
| Insertar un PI entre otros dos | Vuelva a dibujar la alineación, o reescriba las coordenadas del PI |
| Alineaciones a partir de objetos, desfases, ensanchamientos | Dibuje por PI |
| Escribir K para una curva vertical | Escriba L (se muestra K) |
| Curvas verticales circulares y asimétricas | Solo curvas parabólicas simétricas |
| Más de un perfil de diseño por alineación | Una alineación por variante |
| Hacer zoom en la vista de perfil, bandas de perfil bajo el perfil | La vista de perfil ajusta toda la alineación; trácela en [hojas de planta y perfil](topic:plan-profile-sheets) |
| Secciones en DWG o LandXML | Hojas de sección en PDF; {{ui:CSV}} de las áreas y volúmenes |
| Líneas de muestra en ángulo, o de anchos distintos a lo largo de la vía | Un ancho por cada lado para toda la alineación |

## Obras lineales

| Aún no disponible | En su lugar, hoy |
|---|---|
| Medianas, barreras y una sobreelevación que gira las plantillas | Dibújelas como plantillas ([Plantillas de obra lineal](topic:corridor-templates)); las plantillas por estación aún no toman la sobreelevación |
| Un cambio gradual entre las plantillas de dos regiones (transiciones, ahusamientos) | Cambie la plantilla en una estación, o dé a un punto una meta de ancho en una línea dibujada como el ahusamiento |
| Giro alrededor de una arista, sobreelevación en LandXML | La sobreelevación gira alrededor del eje en curvas circulares; ensanche un carril con una meta de ancho en una línea de elemento |
| Metas para los taludes laterales (afloramiento hasta una línea o una superficie), superficies propias de la obra lineal | Las metas mueven los bordes de pavimento y acotamientos ([Obras lineales](topic:corridor)); la obra lineal se nivela en la superficie proyectada |
| Obras lineales exportadas como vías LandXML; una segunda obra lineal en una alineación en la exportación IFC | Se exporta la superficie proyectada |
| Plantillas de terreno que cambian la superficie proyectada, en 3D o en las secciones | Dan áreas y volúmenes de cada capa ([Plantillas de terreno](topic:corridor-templates#terrain-templates)) |
| Trayectorias de giro con velocidad, deslizamiento de llantas, tiempo de giro, remolques articulados o holgura de la carrocería; una biblioteca de vehículos de diseño estándar; una trayectoria de giro dibujada arrastrando el vehículo | Trayectorias de giro a baja velocidad a lo largo de una línea de elemento o de una alineación, con las dimensiones de sus propios vehículos ([Trayectorias de giro de vehículos](topic:swept-paths)) |

## Nivelación y volúmenes

| Aún no disponible | En su lugar, hoy |
|---|---|
| Bermas, líneas de elemento abiertas niveladas en el diseño, nivelación hasta una línea de elemento de otro lugar | Cierre la línea de elemento ([Líneas de elemento](topic:feature-lines)), o úsela como línea de ruptura del terreno existente |
| Insertar o quitar un vértice de línea de elemento | Dibuje la línea de nuevo, o hágale un desfase escalonado |
| Arcos en líneas de ruptura dibujadas (a través de puntos topográficos), espirales en líneas de elemento | Dibuje una línea de elemento con arcos y úsela como línea de ruptura del terreno existente |
| Nivelar hasta una distancia, una elevación u otra superficie | Afloramiento solo hasta el terreno existente |
| Agregar o quitar una esquina de plataforma | Borre la plataforma y vuelva a dibujarla |
| Volúmenes TIN a TIN (prismas), elegir el tamaño de celda de la cuadrícula | Método de cuadrícula, con el tamaño de celda elegido por la aplicación |
| Expansión y contracción, capa vegetal, espesores de pavimento | Aplique usted mismo los factores a las cifras reportadas |
| Costos de acarreo libre y de sobreacarreo, acarreo entre alineaciones distintas, bancos de préstamo y sitios de desperdicio colocados en el plano | El diagrama de acarreo de masas con puntos de equilibrio, volúmenes movidos y distancias medias de acarreo |

## Redes de tuberías

| Aún no disponible | En su lugar, hoy |
|---|---|
| Más de una red por proyecto | Proyectos separados para pluvial y sanitario |
| Tuberías principales de agua: calidad y antigüedad del agua, controles basados en reglas, otros tipos de válvula (control de flujo, estrangulamiento, sostenimiento), bombas definidas por potencia, demanda que depende de la presión, una opción Darcy–Weisbach, un catálogo de tubos con espesores de pared y clases de presión. El resto de las redes a presión está en el laboratorio: [Tuberías principales de agua](topic:water-mains) | Revíselo en un software de distribución de agua; los gastos de diseño sanitario están en [Gastos de diseño sanitario](topic:sanitary-design) |
| Flujos de alcantarillado en el tiempo (hidrogramas, enrutamiento dinámico, almacenamiento, bombas, desbordes) | [Gastos de diseño sanitario](topic:sanitary-design) da el gasto pico estacionario que usa una hoja de diseño |
| Capacidad de coladeras, dispersión en cuneta, enrutamiento de detención, hidrogramas, pérdidas de energía distintas de un coeficiente de unión | Revíselo en otro software; los gastos, tamaños y líneas de gradiente hidráulico están en [Drenaje pluvial](topic:storm-drainage) |
| Cuencas en el trazo PDF, DWG, DXF o LandXML; cuencas a partir de la superficie (divisorias) | Dibuje las cuencas a mano; se guardan en el archivo del proyecto |
| Catálogos de tuberías, tuberías no circulares, estructuras que no son cajas o cilindros verticales (conos, escalones, banquetas), una categoría de drenaje en la biblioteca | Tipos de estructura a partir de parámetros ([Red de tuberías](topic:pipe-network)); tuberías con un diámetro |
| Tuberías en la vista de perfil, tuberías curvas | Lea las cotas de batea y el recubrimiento en el panel derecho |

## Parcelas

| Aún no disponible | En su lugar, hoy |
|---|---|
| Trazar lotes por área o frente, parcelas a partir de las líneas que las rodean, derecho de vía | Dibuje cada parcela por sus esquinas, o introduzca sus rumbos y distancias |
| Tablas de curvas y tablas de líneas en el plano; etiquetas movidas a mano | Cada tramo se etiqueta siguiendo su propia trayectoria |
| Parcelas en LandXML | Las parcelas se guardan en el archivo del proyecto y pasan al PDF, DWG y DXF |

## Poligonales

| Aún no disponible | En su lugar, hoy |
|---|---|
| Ajuste por mínimos cuadrados, la regla de tránsito, ponderar ángulos contra distancias | La regla de la brújula |
| Ángulos de deflexión, ángulos cenitales y distancias inclinadas, elevaciones por nivelación trigonométrica | Reduzca a distancias y ángulos horizontales correctamente, o a rumbos |
| Tiros laterales, archivos de datos brutos de colectores de datos | Importe los puntos como archivo de puntos |

## Estacado

| Aún no disponible | En su lugar, hoy |
|---|---|
| Estacas de desfase (puntos de referencia retirados de la estaca), estacas de talud en el punto de corte | Estaque en los desfases que necesite, incluso más allá del acotamiento |
| Enviar estacas directamente al formato propio de un colector de datos | El CSV se abre en el software de oficina de la mayoría de los colectores de datos |
| Estaquear tuberías, plataformas y parcelas | Use puntos topográficos cerca de una alineación, o los tramos de la parcela |

## Archivos y salida

| Aún no disponible | En su lugar, hoy |
|---|---|
| Texto, sombreados y cotas de DWG o DXF; espacio papel; dibujos vinculados (xref); DXF binario | Se abre la geometría lineal del espacio modelo ([Abrir un DWG o DXF como geometría lineal](topic:open-dwg-dxf)); abra los dibujos vinculados por separado |
| Mover varios puntos a la vez arrastrando | Corte y pegue, o edítelos uno a la vez |
| Hojas en vertical, cajetines propios, ventanas gráficas que usted acomoda, hojas de planta y perfil en DWG | Una hoja de planta horizontal por PDF, u hojas de planta y perfil a lo largo de una alineación (PDF) |
| Trazar bandas de elevación y perfiles | Las bandas son solo de pantalla; tome una captura si las necesita |
| Cambiar nombres de capas, colores o estilos de etiqueta | Cámbielos en un programa CAD después de exportar DXF |
| Guardado en la nube e historial de versiones | Guarde archivos `.civilcraft.json` y respáldelos; para trabajar juntos en un proyecto, use una sesión en vivo en CadCraft Studio ([Diseñe un sitio juntos, en vivo](topic:work-live)) |
| CadCraft Studio para iPad e iPhone, y desde Google Play | Use CivilCraft en el navegador del dispositivo; en Android, CadCraft Studio se instala desde su APK en getcadcraft.com/download |
| Abrir varios archivos de puntos o de proyecto a la vez | Un archivo por apertura (los archivos GIS que van juntos, como las partes de un shapefile, se abren juntos) |

## Paisaje

| Aún no disponible | En su lugar, hoy |
|---|---|
| Cabezales y boquillas de fabricantes | Cabezales genéricos, o agregue los suyos desde un archivo; los datos de los fabricantes llegan a medida que dan permiso |
| Longitudes laterales máximas para líneas de goteo, flujos en el tiempo, bombas, redes de tuberías en malla | Mantenga los tramos de goteo en la longitud publicada por el fabricante; la verificación requiere una red ramificada |
| El contorno exacto de un objeto de forma libre cóncavo; su volumen bajo el nivel del suelo medido con exactitud | Se nivela la envolvente convexa, y el volumen bajo tierra es una estimación (se indica en Propiedades) |
| Plantas en Colocar desde biblioteca de BimCraft y ModelCraft | Exporte el IFC de paisaje y ábralo en BimCraft junto al edificio |
| Modelos detallados de plantas (hojas, ramas, estaciones) en la vista 3D; objetos de forma libre y riego en la vista 3D | Las plantas se muestran en 3D como formas simples con tamaños de la lista de plantas ([Ver el sitio en 3D](topic:site-3d)); la dispersión de ModelCraft crea imágenes de plantación |
| Muros de obra dura que retienen un nivel nivelado detrás de ellos en la superficie | Dé a una plataforma lados verticales: son muros de contención en la superficie ([Nivelación](topic:grading)) |
| Transformaciones SVG en sus propios símbolos; texturas y colores de sus propios modelos de plantas GLB; geometría GLB comprimida | Aplane primero las transformaciones en su programa de dibujo; los modelos se dibujan en el color de la planta; exporte el GLB sin compresión ([Gráficos de plantas](topic:plant-graphics)) |
| Su propia lista de plantas guardada en su cuenta de Biblioteca (editada en la app) | Edite la lista propia del proyecto en la tabla de plantas y guárdela como archivo de plantas |
| Las herramientas de paisaje para asistentes sin la ventana (el servidor de archivos y la línea de comandos) | Funcionan con la ventana de CivilCraft abierta ([Deje que un asistente de IA trabaje con su sitio](topic:assistants)) |

## Líneas de energía

| Aún no disponible | En su lugar, hoy |
|---|---|
| Una norma de un país integrada (casos de carga, libramientos, factores) | Defina los valores de su norma en {{ui:Casos de carga y límites…}} y guárdelos, con su biblioteca, como paquete para reutilizar y compartir ([Paquetes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distancia horizontal de un conductor a la copa de un árbol o a un muro al lado de la línea | El libramiento vertical sobre plantas y muros que cruza la línea ([Verificaciones de líneas de energía](topic:power-line-checks#clearances)) |
| Fluencia del conductor y estiramiento de un conductor nuevo | Considérelos mediante las temperaturas de la tabla de tendido |
| Capacidad térmica de cables enterrados (capacidad de corriente según cómo se tienden) | Introduzca la capacidad de corriente de su proveedor en el elemento del cable |
| Estudios de cortocircuito, protección y puesta a tierra | Use un programa eléctrico especializado; CivilCraft da las longitudes y los cables de la red |
| Torres de celosía diseñadas miembro por miembro, y anclajes de retenidas en el suelo | Los soportes se verifican por su carga nominal; las retenidas, por su carga nominal |
| Un archivo de estudio `.DON` verificado en el programa que lo lee | Verifíquelo allí; envíenos una muestra para probar con un archivo real |
| Líneas de energía en la vista 3D y en IFC | El plano, el perfil de la línea, las hojas y las capas GIS |
| Las herramientas de líneas de energía para asistentes sin la ventana | Funcionan con la ventana de CivilCraft abierta ([Deje que un asistente de IA trabaje con su sitio](topic:assistants)) |

## Volúmenes de edificación

| Aún no disponible | En su lugar, hoy |
|---|---|
| Una biblioteca de códigos de zonificación o las reglas de cualquier ciudad | Escriba los límites de su propia ordenanza ([Límites de zonificación](topic:zoning-limits)) |
| Luz de cielo en los muros (luz diurna de fachada), viento | [Horas de sol](topic:sun-hours) cuenta solo el sol directo |
| Sombra de árboles, plantas o cualquier cosa que no esté dibujada como volumen | Dibuje los edificios vecinos como volúmenes |
| Formas de techo en volúmenes | Volúmenes con cubierta plana |
| Vanos, techos y tipos de muro cuando un volumen se desarrolla en BimCraft | BimCraft construye muros exteriores simples en cada nivel y una losa; agregue el resto allí |

## GIS y sistemas de coordenadas

| Aún no disponible | En su lugar, hoy |
|---|---|
| File Geodatabase; estilos, íconos, superposiciones de terreno y enlaces de red de KML | Convierta primero a GeoPackage, shapefile o GeoJSON; las marcas de KML se leen sin sus estilos |
| Editar entidades GIS o sus atributos | Edítelas en un programa GIS e importe de nuevo. El panel Analizar crea capas nuevas (búfer, superposición, unión, selección) y agrega campos de área y longitud, pero no edita una entidad en su lugar |
| Análisis de red y de ráster, búferes con extremos planos o cuadrados y búferes de un solo lado, agregar o borrar filas y cambiar el tipo de un campo en la tabla de atributos, colores manuales de clase, una leyenda de estilo en las impresiones | Use {{ui:Seleccionar}} para elegir entidades y crear una capa con ellas; los extremos planos no se ofrecen. Colorear por atributo y la tabla de atributos sí están disponibles: vea [Dar estilo a una capa por un atributo](topic:gis-symbology) y [Trabajar con la tabla de atributos de una capa](topic:gis-table) |
| Estilos de etiqueta (tamaño, ubicación) y etiquetas que se eviten entre sí | Las etiquetas son de un solo tamaño y pueden encimarse donde las entidades son densas |
| Datos verticales y modelos de geoide | Las elevaciones se usan como las da el archivo; verifique usted el dato vertical |
| Desplazamientos de malla distintos de NAD83 desde NAD27 sugeridos por área (OSTN15; NTv2 para otros datos funcionan al agregar el archivo), varias mallas a la vez, mallas verticales | Agregue usted el archivo de malla para su dato; una malla por proyecto |
| Capas de mapa en DXF o en exportaciones 3D | Las capas de mapa van al trazo PDF, y junto al DWG como imagen |
| Servidores de mapas que requieren inicio de sesión, clave o token | Use servicios públicos, o un archivo de imagen georreferenciada |
| Escribir archivos LAS o LAZ desde una superficie, el modelo del terreno o las herramientas de cuadrícula de elevaciones y LiDAR | Exporte superficies como cuadrícula de elevaciones GeoTIFF. El complemento [Nubes de puntos](topic:point-clouds) escribe una nube limpia como LAS 1.4 o LAZ |
| Intensidad, color y retornos de LiDAR; cuadrículas de elevación con varias bandas; archivos de cuadrícula o LiDAR de más de 200 MB | El LiDAR se filtra solo por clase, y las cuadrículas usan su primera banda; corte primero los archivos grandes en mosaicos |

## Entrada

| Aún no disponible | En su lugar, hoy |
|---|---|
| Selección por caja con táctil (necesita {{key:Shift}}) | Mantenga presionado cada punto topográfico para agregarlo |
| Coordenadas o distancias escritas mientras dibuja | Dibuje aproximadamente, y luego escriba las coordenadas exactas del PI en la tabla de PI de la alineación |
| Escribir coordenadas para esquinas de plataforma y estructuras | Arrastre sus pinzamientos; haga zoom para mayor precisión y observe E y N en la barra de estado |
| Ajustarse a objetos (distinto de los puntos topográficos para líneas de ruptura) | Haga zoom y observe la barra de estado |

## Vista 3D

| Aún no disponible | En su lugar, hoy |
|---|---|
| Dibujar o editar en la vista 3D | Dibuje y edite en el plano; la vista 3D sigue cada edición |
| Seleccionar líneas de elemento de obra lineal o entidades GIS haciendo clic en 3D | Haga clic en ellas en el plano |
| Exportar la vista exagerada o en pies | Las exportaciones están a escala real en metros; vea [Exportar el sitio en 3D](topic:export-3d) |
| Etiquetas en exportaciones GLB u OBJ, tamaños y estilos de etiqueta en 3D | Las etiquetas se muestran solo en la vista 3D, de un solo tamaño; vea [Ver el sitio en 3D](topic:site-3d) |
| Texturas de fotos, grabar un recorrido como video, sombras de más allá del sitio, horas de sol en la vista 3D | Capas de mapa superpuestas en las superficies; conduzca y vea la posición del sol en un momento dado; [horas de sol](topic:sun-hours) para un día o una temporada en el plano |
