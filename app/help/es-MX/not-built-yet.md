---
title: Aún no disponible
summary: Lo que esta versión de CivilCraft todavía no hace, y qué hacer hoy en su lugar.
keywords: faltante, limitaciones, hoja de ruta, no disponible, espirales, ensanche, dwg, dxf, sumideros, retención, secciones transversales, próximamente, límites
from: b91588d4
---

CivilCraft está en una etapa temprana. Esta página enumera lo que la versión actual no hace, para que no lo busque. Nada de lo que aquí aparece tiene fecha prometida.

## Puntos

| Aún no disponible | En su lugar, hoy |
|---|---|
| Agregar un segundo archivo de puntos al primero | Una los archivos en un editor de texto o en una hoja de cálculo primero |
| Exportar un archivo de texto de puntos | Exporte LandXML (los puntos salen como CgPoints), use SIG {{ui:Exportar}} (puntos con los campos P, N, E, Z y D), o {{ui:Copiar}} los puntos a una hoja de cálculo |
| Estilos de etiqueta de punto, símbolos por clave de descripción, curvas (arcos) a partir de códigos de línea, un archivo de claves de descripción para compartir entre proyectos | Las etiquetas muestran el número, la elevación y la descripción, o menos ([Configuración de CivilCraft](topic:settings)); las claves se guardan en el archivo del proyecto |
| Conversión de unidades | Convierta el archivo antes de importarlo; **Unidades** solo cambia la etiqueta |

## Superficies

| Aún no disponible | En su lugar, hoy |
|---|---|
| Más de una superficie construida a partir de puntos | Un proyecto por superficie |
| Ocultar límites (interiores) | Use **Borde exterior más largo** o un límite exterior |
| Seleccionar o editar una línea de ruptura dibujada | {{key:Mod+Z}}, o {{ui:Quitar líneas de ruptura dibujadas}} y vuelva a dibujar |
| Editar una superficie leída desde LandXML (líneas de ruptura, límite) | {{ui:Reconstruir la superficie a partir de los puntos}} |
| Editar una superficie hecha de una malla de elevaciones | Importe la malla de nuevo con otras opciones |
| Convertir una superficie leída desde LandXML cuando cambia el sistema de coordenadas | Primero {{ui:Reconstruir la superficie a partir de los puntos}} |
| Elevaciones puntuales y valores de pendiente con etiqueta | Léalos en la barra de estado, o coloree la superficie por pendiente con **Análisis de pendiente** en el espacio de trabajo de paisajismo ([Nivelación para paisajismo](topic:landscape-grading#grading-checks)) |

## Alineaciones y perfiles

| Aún no disponible | En su lugar, hoy |
|---|---|
| Espirales distintas de la clotoide; una espiral entre dos curvas (transiciones compuestas) | Las espirales clotoides en los extremos de una curva están disponibles; las demás se nombran y se omiten al importar LandXML |
| Insertar un PI entre otros dos | Vuelva a dibujar la alineación, o vuelva a escribir las coordenadas de los PI |
| Alineaciones a partir de objetos, desfases, ensanches | Dibuje por PI |
| Escribir K para una curva vertical | Escriba L (se muestra K) |
| Curvas verticales circulares y asimétricas | Solo curvas parabólicas simétricas |
| Más de un perfil de diseño por alineación | Una alineación por variante |
| Acercar la vista de perfil, bandas de perfil bajo el perfil | La vista de perfil ajusta toda la alineación; trácela en [hojas de planta y perfil](topic:plan-profile-sheets) |
| Secciones en DWG o LandXML | Hojas de secciones en PDF; {{ui:CSV}} de las áreas y volúmenes |
| Líneas de muestreo en ángulo, o de anchos distintos a lo largo de la vía | Un ancho por cada lado para toda la alineación |

## Obras lineales

| Aún no disponible | En su lugar, hoy |
|---|---|
| Camellones, barreras y un peralte que gire plantillas | Dibújelos como plantillas ([Plantillas de obra lineal](topic:corridor-templates)); las plantillas por estación todavía no admiten peralte |
| Un cambio gradual entre plantillas de dos regiones (transiciones, ahusamientos) | Cambie la plantilla en una estación, o dé a un punto un objetivo de ancho hacia una línea dibujada como ahusamiento |
| Giro alrededor de un borde, peralte en LandXML | El peralte gira alrededor del eje en curvas circulares; ensanche un carril con un objetivo de ancho hacia una línea característica |
| Objetivos para los taludes laterales (liga hasta una línea o una superficie), superficies propias de las obras lineales | Los objetivos mueven los bordes de pavimento y de acotamientos ([Obras lineales](topic:corridor)); la obra lineal se ajusta a la superficie proyectada |
| Retornos de guarnición, carriles de giro e islas nivelados en una intersección; el extremo de una vía secundaria cortado al borde de la vía principal en sesgo; un sendero unido a una vía en planta, en su longitud y área | Las vías que se encuentran se unen a escuadra, con el borde de la vía principal abierto y la vía secundaria suavizada hasta él ([Donde las vías se encuentran](topic:corridor#where-roads-meet-roads-pads-and-paths)); un sendero se detiene en el borde de la vía en la superficie proyectada y en 3D |
| Obras lineales exportadas como vías de LandXML; una segunda obra lineal en una alineación en la exportación IFC | Se exporta la superficie proyectada |
| Plantillas de terreno que cambian la superficie proyectada, en 3D o en las secciones | Dan áreas y volúmenes de cada capa ([Plantillas de terreno](topic:corridor-templates#terrain-templates)) |
| Trayectorias de giro con velocidad, deslizamiento de llantas, tiempo de dirección, remolques de dirección o holgura de carrocería; una biblioteca de vehículos de diseño estándar; una trayectoria arrastrando el vehículo | Trayectorias de giro a baja velocidad a lo largo de una línea característica o una alineación, con las dimensiones de sus propios vehículos ([Trayectorias de giro de vehículos](topic:swept-paths)) |

## Nivelación y volúmenes

| Aún no disponible | En su lugar, hoy |
|---|---|
| Bermas, líneas características abiertas niveladas en el diseño, nivelación hacia una línea característica de otro lugar | Cierre la línea característica ([Líneas características](topic:feature-lines)), o úsela como línea de ruptura del terreno existente |
| Insertar o quitar un vértice de línea característica | Vuelva a dibujar la línea, o haga un desfase escalonado de ella |
| Arcos en líneas de ruptura dibujadas (a través de puntos topográficos), espirales en líneas características | Dibuje una línea característica con arcos y úsela como línea de ruptura del terreno existente |
| Nivelar a una distancia, una elevación u otra superficie | Solo liga hasta el terreno existente |
| Agregar o quitar una esquina de plataforma | Borre la plataforma y vuelva a dibujarla |
| Volúmenes TIN a TIN (prisma), elegir el tamaño de celda de la malla | Método de malla, con el tamaño de celda elegido automáticamente |
| Expansión y contracción, capa vegetal, espesores de pavimento | Aplique usted mismo factores a las cifras reportadas |
| Costos de acarreo libre y sobreacarreo, acarreo entre alineaciones distintas, bancos de préstamo y sitios de desperdicio colocados en la planta | El diagrama de acarreo de masas con puntos de equilibrio, volúmenes movidos y distancias medias de acarreo |

## Redes de tuberías

| Aún no disponible | En su lugar, hoy |
|---|---|
| Más de una red por proyecto | Proyectos separados para pluvial y sanitario |
| Redes de agua: calidad y antigüedad del agua, controles por reglas, otros tipos de válvula (control de caudal, estrangulación, sostenimiento), bombas dadas por potencia, demanda que depende de la presión, una opción Darcy–Weisbach, un catálogo de tuberías con espesores de pared y clases de presión. El resto de las redes a presión está en desarrollo: [Redes de distribución de agua](topic:water-mains) | Revise eso en un programa de distribución de agua; los gastos de diseño sanitario están en [Gastos de diseño sanitario](topic:sanitary-design) |
| Flujos de alcantarillado en el tiempo (hidrogramas, tránsito dinámico, almacenamiento, bombas, desbordes) | [Gastos de diseño sanitario](topic:sanitary-design) da el gasto pico constante que usa una hoja de diseño |
| Capacidad de entrada, dispersión en el arroyo, tránsito en retención, hidrogramas, pérdidas de energía distintas de un coeficiente de unión | Revíselos en otro programa; los gastos, tamaños y líneas de pendiente están en [Drenaje pluvial](topic:storm-drainage) |
| Cuencas en el trazado PDF, DWG, DXF o LandXML; cuencas a partir de la superficie (parteaguas) | Dibuje las cuencas a mano; se guardan en el archivo del proyecto |
| Catálogos de tuberías, tuberías no circulares, estructuras que no son cajas o cilindros verticales (conos, escalones, banqueteo), una categoría de drenaje en la biblioteca | Tipos de estructura a partir de parámetros ([Red de tuberías](topic:pipe-network)); tuberías con un diámetro |
| Tuberías en la vista de perfil, tuberías curvas | Lea las plantillas y las profundidades de cubierta en el panel derecho |

## Parcelas

| Aún no disponible | En su lugar, hoy |
|---|---|
| Trazar lotes por área o frente, parcelas a partir de las líneas que las rodean, derecho de vía | Dibuje cada parcela por sus esquinas, o introduzca sus rumbos |
| Tablas de curvas y tablas de líneas en la planta; etiquetas movidas a mano | Cada rumbo se etiqueta a lo largo de sí mismo |
| Parcelas en LandXML | Las parcelas se guardan en el archivo del proyecto y pasan al PDF, DWG y DXF |

## Poligonales

| Aún no disponible | En su lugar, hoy |
|---|---|
| Ajuste por mínimos cuadrados, la regla del tránsito, ponderación de ángulos frente a distancias | La regla de la brújula |
| Ángulos de deflexión, ángulos cenitales y distancias inclinadas, elevaciones por nivelación trigonométrica | Reduzca a distancias y ángulos horizontales correctos, o use rumbos |
| Visuales laterales, archivos de datos crudos de colectores de datos | Importe los puntos como archivo de puntos |

## Estaquillado

| Aún no disponible | En su lugar, hoy |
|---|---|
| Estacas de desfase (puntos de referencia retirados de la estaca), estacas de talud en el punto de liga | Estaquille en los desfases que necesite, incluso más allá del acotamiento |
| Enviar estacas directamente al formato propio de un colector de datos | El CSV se abre en el programa de oficina de la mayoría de los colectores de datos |
| Estaquillar tuberías, plataformas y parcelas | Use puntos topográficos cerca de una alineación, o los rumbos de la parcela |

## Archivos y salida

| Aún no disponible | En su lugar, hoy |
|---|---|
| Texto, sombreados y cotas de DWG o DXF; espacio papel; dibujos vinculados (xref); DXF binario | Se abre el trazo del espacio modelo ([Abra un DWG o DXF como trazos](topic:open-dwg-dxf)); abra los dibujos vinculados por separado |
| Mover varios puntos a la vez arrastrando | Córtelos y péguelos, o edítelos uno por uno |
| Hojas en vertical, cajetines propios, ventanas gráficas que usted acomode, hojas de planta y perfil en DWG | Una hoja de planta apaisada por PDF, o hojas de planta y perfil a lo largo de una alineación (PDF) |
| Trazar bandas de elevación y perfiles | Las bandas solo se ven en pantalla; tome una captura si las necesita |
| Cambiar nombres de capa, colores o estilos de etiqueta | Cámbielos en un programa CAD después de exportar DXF |
| Guardado en la nube e historial de versiones | Guarde los archivos `.civilcraft.json` y manténgalos respaldados; para trabajar en un proyecto en conjunto, use una sesión en vivo en CadCraft Studio ([Diseñe un sitio en conjunto, en vivo](topic:work-live)) |
| CadCraft Studio para iPad y iPhone, y desde Google Play | Use CivilCraft en el navegador del dispositivo; en Android, CadCraft Studio se instala desde su APK en getcadcraft.com/download |
| Abrir varios archivos de puntos o de proyecto a la vez | Un archivo por apertura (los archivos SIG que van juntos, como las partes de un shapefile, se abren juntos) |

## Paisajismo

| Aún no disponible | En su lugar, hoy |
|---|---|
| Cabezales y boquillas de fabricantes | Cabezales genéricos, o agregue sus propios cabezales desde un archivo; los datos de los fabricantes entran conforme den su permiso |
| Longitudes laterales máximas para líneas de goteo, gastos en el tiempo, bombas, redes de tuberías en malla | Mantenga los tramos de goteo en la longitud publicada por el fabricante; la revisión necesita una red ramificada |
| El contorno exacto de un objeto de forma libre cóncavo; su volumen bajo el terreno medido con exactitud | Se nivela la envolvente convexa y el volumen bajo el terreno es una estimación (indicado en Propiedades) |
| Plantas en el propio Colocar desde biblioteca de BimCraft y ModelCraft | Exporte el IFC de paisajismo y ábralo en BimCraft junto al edificio |
| Modelos detallados de plantas (hojas, ramas, temporadas) en la vista 3D; objetos de forma libre y riego en la vista 3D | Las plantas se ven en 3D como formas simples con tamaño según la lista de plantas ([Vista del sitio en 3D](topic:site-3d)); la dispersión de ModelCraft crea imágenes de plantación |
| Muros de elementos duros que contienen un nivel nivelado detrás de ellos en la superficie | Dé a una plataforma o a un patio lados verticales: son muros de contención en la superficie ([Nivelación](topic:grading)) |
| Transformaciones SVG en sus propios símbolos; texturas y colores de sus propios modelos GLB de plantas; geometría GLB comprimida | Aplane las transformaciones en su programa de dibujo primero; los modelos se dibujan en el color de la planta; exporte el GLB sin compresión ([Gráficos de plantas](topic:plant-graphics)) |
| Su propia lista de plantas guardada en su cuenta de Biblioteca (editada en la app) | Edite la lista propia del proyecto en la tabla de plantas y guárdela como archivo de plantas |
| Las herramientas de paisajismo para asistentes sin la ventana (el servidor de archivos y la línea de comandos) | Funcionan con la ventana de CivilCraft abierta ([Deje que un asistente de IA trabaje con su sitio](topic:assistants)) |

## Líneas eléctricas

| Aún no disponible | En su lugar, hoy |
|---|---|
| Una norma de un país integrada (casos de carga, distancias libres, factores) | Defina los valores de su norma en {{ui:Casos de carga y límites…}} y guárdelos, con su biblioteca, como un paquete para reutilizar y compartir ([Paquetes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distancia lateral de un conductor a la copa de un árbol o a un muro junto a la línea | La distancia libre en vertical sobre las plantas y muros que cruza la línea ([Revisiones de líneas eléctricas](topic:power-line-checks#clearances)) |
| Fluencia del conductor y el estiramiento de un conductor nuevo | Considérelos mediante las temperaturas de la tabla de tendido |
| Capacidad térmica de cables enterrados (capacidad de corriente según cómo se tienden) | Escriba la capacidad de corriente de su proveedor en el elemento de cable |
| Estudios de cortocircuito, protección y puesta a tierra | Use un programa eléctrico especializado; CivilCraft entrega las longitudes y los cables de la red |
| Torres de celosía diseñadas miembro por miembro, y anclajes de tirantes en el suelo | Los soportes se revisan por su carga nominal; los tirantes por su carga de diseño |
| Un archivo de estudio `.DON` revisado en el programa que lo lee | Revise el archivo allí; envíenos una muestra para probar con uno real |
| Líneas eléctricas en la vista 3D y en IFC | La planta, el perfil de la línea, las hojas y las capas SIG |
| Las herramientas de líneas eléctricas para asistentes sin la ventana | Funcionan con la ventana de CivilCraft abierta ([Deje que un asistente de IA trabaje con su sitio](topic:assistants)) |

## Volúmenes de edificación

| Aún no disponible | En su lugar, hoy |
|---|---|
| Una biblioteca de códigos de zonificación o de las reglas de cualquier ciudad | Escriba los límites de su propio reglamento ([Límites de zonificación](topic:zoning-limits)) |
| Luz de cielo en los muros (iluminación natural de fachada), viento | [Horas de sol](topic:sun-hours) cuenta solo el sol directo |
| Sombra de árboles, plantas o de cualquier cosa no dibujada como volumen | Dibuje los edificios vecinos como volúmenes |
| Formas de techo en los volúmenes | Volúmenes de techo plano |
| Vanos, techos y tipos de muro cuando un volumen se desarrolla en BimCraft | BimCraft construye muros exteriores sencillos en cada nivel y un piso; agregue el resto allí |

## SIG y sistemas de coordenadas

| Aún no disponible | En su lugar, hoy |
|---|---|
| File Geodatabase; estilos KML, iconos, superposiciones de suelo y vínculos de red | Convierta primero a GeoPackage, shapefile o GeoJSON; las marcas KML se leen sin sus estilos |
| Editar elementos SIG o sus atributos | Edítelos en un programa SIG e impórtelos de nuevo. El panel Analizar crea capas nuevas (área de influencia, superposición, unión, selección) y agrega campos de área y longitud, pero no edita un elemento en su lugar |
| Análisis de redes y ráster, áreas de influencia con extremos planos o cuadrados y de un solo lado, agregar o borrar filas y cambiar el tipo de un campo en la tabla de atributos, colores de clase manuales, una leyenda de estilo en los trazados | Use Seleccionar para elegir elementos y cree una capa con ellos; los extremos planos no se ofrecen. Colorear por atributo y la tabla de atributos ya están construidos: vea [Dar estilo a una capa por un atributo](topic:gis-symbology) y [Trabajar con la tabla de atributos de una capa](topic:gis-table) |
| Estilos de etiqueta (tamaño, ubicación) y etiquetas que se evitan entre sí | Las etiquetas son de un solo tamaño y pueden superponerse donde los elementos son densos |
| Datums verticales y modelos de geoide | Las elevaciones se usan tal como las da el archivo; revise usted mismo el datum vertical |
| Desplazamientos de malla distintos del de NAD27 a NAD83 sugerido por área (OSTN15; NTv2 para otros datums funciona al agregar el archivo), varias mallas a la vez, mallas verticales | Agregue usted mismo el archivo de malla de su datum; una malla por proyecto |
| Capas de mapa en DXF o en exportaciones 3D | Las capas de mapa van al trazado PDF y, junto al DWG, como imagen |
| Servidores de mapas que requieren inicio de sesión, clave o token | Use servicios públicos, o un archivo de imagen georreferenciada |
| Escribir archivos LAS o LAZ desde una superficie, el modelo de terreno o las herramientas de malla de elevaciones y LiDAR | Exporte las superficies como malla de elevaciones GeoTIFF. El complemento [Nubes de puntos](topic:point-clouds) escribe una nube limpia como LAS 1.4 o LAZ |
| Intensidad, color y retornos de LiDAR; mallas de elevación con varias bandas; archivos de malla o LiDAR de más de 200 MB | El LiDAR se filtra solo por clase, y las mallas usan su primera banda; corte primero los archivos grandes en teselas |

## Entrada

| Aún no disponible | En su lugar, hoy |
|---|---|
| Selección por recuadro al tacto (necesita {{key:Shift}}) | Mantenga presionado cada punto topográfico para agregarlo |
| Coordenadas o distancias escritas mientras dibuja | Dibuje aproximadamente y luego escriba las coordenadas exactas de los PI en la tabla de PI de la alineación |
| Escribir coordenadas para esquinas de plataformas y estructuras | Arrastre sus pinzamientos; acerque para mayor precisión y observe E y N en la barra de estado |
| Referencia a objetos (distinta de puntos topográficos para líneas de ruptura) | Acerque y observe la barra de estado |

## Vista 3D

| Aún no disponible | En su lugar, hoy |
|---|---|
| Dibujar o editar en la vista 3D | Dibuje y edite en la planta; la vista 3D sigue cada edición |
| Seleccionar líneas características de obras lineales o elementos SIG haciendo clic en 3D | Haga clic en ellos en la planta |
| Exportar la vista exagerada o en pies | Las exportaciones están a escala real en metros; vea [Exportar el sitio en 3D](topic:export-3d) |
| Etiquetas en exportaciones GLB u OBJ, tamaños y estilos de etiqueta en 3D | Las etiquetas se ven solo en la vista 3D, de un solo tamaño; vea [Vista del sitio en 3D](topic:site-3d) |
| Texturas de fotos, grabar un recorrido como video, sombras de fuera del sitio, horas de sol mostradas en la vista 3D | Capas de mapa colocadas sobre las superficies; recorrer el sitio y ver la posición del sol en un momento; [horas de sol](topic:sun-hours) de un día o de una temporada en la planta |
