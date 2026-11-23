---
title: Todavía no construido
summary: Lo que esta versión de CivilCraft todavía no hace, y qué hacer en cambio hoy.
keywords: faltante, limitaciones, hoja de ruta, no disponible, espirales, ensanche, dwg, dxf, sumideros, detención, secciones transversales, próximamente, límites
from: b91588d4
---

CivilCraft está en una etapa temprana. Esta página lista lo que la versión actual no hace, para que no lo busques. Nada aquí tiene fecha prometida.

## Puntos

| Todavía no construido | En cambio, hoy |
|---|---|
| Agregar un segundo archivo de puntos al primero | Unir los archivos primero en un editor de texto o una planilla |
| Exportar un archivo de texto de puntos | Exportar LandXML (los puntos salen como CgPoints), usar {{ui:Exportar}} de GIS (puntos con los campos P, N, E, Z y D), o {{ui:Copiar}} los puntos a una planilla |
| Estilos de rótulos de puntos, símbolos por clave de descripción, curvas (arcos) desde códigos de línea, un archivo de claves de descripción para compartir entre proyectos | Los rótulos muestran el número, la cota y la descripción, o menos ([Configuración de CivilCraft](topic:settings)); las claves se guardan en el archivo del proyecto |
| Conversión de unidades | Convertí el archivo antes de importarlo; **Unidades** solo cambia la etiqueta |

## Superficies

| Todavía no construido | En cambio, hoy |
|---|---|
| Más de una superficie construida desde puntos | Un proyecto por superficie |
| Ocultar límites interiores | Usá **Borde exterior más largo** o un límite exterior |
| Seleccionar o editar una línea de quiebre dibujada | {{key:Mod+Z}}, o {{ui:Eliminar líneas de quiebre dibujadas}} y dibujarla de nuevo |
| Editar una superficie leída de LandXML (líneas de quiebre, límite) | {{ui:Ojejapo superficie puntos gui}} |
| Editar una superficie hecha desde una cuadrícula de cotas | Importá la cuadrícula de nuevo con otras opciones |
| Convertir una superficie leída de LandXML cuando cambia el sistema de coordenadas | Primero {{ui:Ojejapo superficie puntos gui}} |
| Cotas puntuales rotuladas y valores de pendiente | Leelos en la barra de estado, o colorea la superficie por pendiente con **Análisis de pendiente** en el espacio de Paisajismo ([Nivelación para paisajismo](topic:landscape-grading#grading-checks)) |

## Trazados y perfiles

| Todavía no construido | En cambio, hoy |
|---|---|
| Espirales distintas de la clotoide; una espiral entre dos curvas (transiciones compuestas) | Las espirales clotoides en los extremos de una curva están disponibles; las demás se nombran y se omiten al importar LandXML |
| Insertar un PI entre otros dos | Volvé a dibujar el trazado, o reescribí las coordenadas de los PI |
| Trazados desde objetos, desplazamientos, ensanches | Dibujá por PI |
| Escribir K para una curva vertical | Escribí L (se muestra K) |
| Curvas verticales circulares y no simétricas | Solo curvas parabólicas simétricas |
| Más de un perfil de diseño por trazado | Un trazado por variante |
| Hacer zoom en la vista de perfil, bandas de perfil debajo del perfil | La vista de perfil ajusta el trazado completo; imprimilo en las [hojas de planta y perfil](topic:plan-profile-sheets) |
| Secciones en DWG o LandXML | Hojas de secciones en PDF; {{ui:CSV}} de las áreas y volúmenes |
| Líneas de muestra en ángulo, o de anchos distintos a lo largo del camino | Un ancho por lado para todo el trazado |

## Corredores

| Todavía no construido | En cambio, hoy |
|---|---|
| Medianas, barreras y un peralte que rote plantillas | Dibujalas como plantillas ([Plantillas del corredor](topic:corridor-templates)); las plantillas por estación todavía no toman el peralte |
| Un cambio gradual entre las plantillas de dos regiones (transiciones, ahusamientos) | Cambiá la plantilla en una estación, o dale a un punto un objetivo de ancho hacia una línea dibujada como el ahusamiento |
| Rotación alrededor de un borde, peralte en LandXML | El peralte rota alrededor del eje en curvas circulares; ensanchá un carril con un objetivo de ancho hacia una línea de rasgo |
| Objetivos para los taludes laterales (línea de corte hacia una línea o una superficie), superficies de corredor propias | Los objetivos mueven los bordes del pavimento y las bermas ([Corredores](topic:corridor)); el corredor se nivela en la superficie propuesta |
| Retornos de cordón, carriles de giro e islas nivelados en una unión; el extremo de un camino lateral cortado al borde del camino principal en un cruce oblicuo; un sendero unido a un camino en el plano, en su longitud y área | Los caminos que se encuentran se unen en cuadrado, con el borde del camino principal abierto y el camino lateral suavizado hasta él ([Dónde los caminos se encuentran](topic:corridor#where-roads-meet-roads-pads-and-paths)); un sendero se detiene en el borde del camino en la superficie propuesta y en 3D |
| Corredores exportados como calzadas LandXML; un segundo corredor en un trazado en la exportación IFC | Se exporta la superficie propuesta |
| Plantillas de terreno que cambian la superficie propuesta, en 3D o en las secciones | Dan áreas y volúmenes de cada capa ([Plantillas de terreno](topic:corridor-templates#terrain-templates)) |
| Trayectorias de giro con velocidad, deslizamiento de neumáticos, tiempo de dirección, remolques de dirección o franqueo de carrocería; una biblioteca de vehículos de diseño estándar; una trayectoria de giro dibujada arrastrando el vehículo | Trayectorias de giro a baja velocidad a lo largo de una línea de rasgo o de un trazado, con tus propias medidas de vehículo ([Trayectorias de giro de vehículos](topic:swept-paths)) |

## Nivelación y volúmenes

| Todavía no construido | En cambio, hoy |
|---|---|
| Bancos, líneas de rasgo abiertas niveladas en el diseño, nivelación hasta una línea de rasgo de otro lugar | Cerrá la línea de rasgo ([Líneas de rasgo](topic:feature-lines)), o usala como línea de quiebre del terreno existente |
| Insertar o quitar un vértice de línea de rasgo | Volvé a dibujar la línea, o hacé un desplazamiento escalonado de ella |
| Arcos en líneas de quiebre dibujadas (a través de puntos de relevamiento), espirales en líneas de rasgo | Dibujá una línea de rasgo con arcos y usala como línea de quiebre del terreno existente |
| Nivelación hasta una distancia, una cota u otra superficie | Corte solo hasta el terreno existente |
| Agregar o quitar una esquina de pad | Eliminá el pad y dibujalo de nuevo |
| Volúmenes TIN a TIN (prisma), elección del tamaño de celda de la cuadrícula | Método de cuadrícula, tamaño de celda elegido por vos |
| Esponjamiento y contracción, capa vegetal, espesores de pavimento | Aplicá los factores a los números informados vos mismo |
| Costos de acarreo libre y sobreacarreo, acarreo entre trazados distintos, pozos de préstamo y escombreras ubicados en el plano | El diagrama de masas con puntos de equilibrio, volúmenes movidos y distancias medias de acarreo |

## Redes de tuberías

| Todavía no construido | En cambio, hoy |
|---|---|
| Más de una red por proyecto | Proyectos separados para pluvial y cloacal |
| Cañerías de agua: calidad y antigüedad del agua, controles basados en reglas, otros tipos de válvula (control de caudal, estrangulación, sostenimiento), bombas dadas por potencia, demanda que depende de la presión, una opción Darcy–Weisbach, un catálogo de caños con espesores de pared y clases de presión. El resto de las redes a presión está en el laboratorio: [Cañerías de agua](topic:water-mains) | Verificá eso en un software de distribución de agua; los caudales de diseño cloacal están en [Caudales de diseño cloacal](topic:sanitary-design) |
| Caudales cloacales en el tiempo (hidrogramas, enrutamiento dinámico, almacenamiento, bombas, desbordes) | [Caudales de diseño cloacal](topic:sanitary-design) da el caudal pico estacionario que usa una hoja de diseño |
| Capacidad de sumideros, dispersión en cuneta, enrutamiento en detención, hidrogramas, pérdidas de energía distintas de un coeficiente de cruce | Verificalos en otro software; los caudales, tamaños y líneas de gradiente están en [Drenaje pluvial](topic:storm-drainage) |
| Cuencas en el trazado PDF, DWG, DXF o LandXML; cuencas desde la superficie (divisorias de agua) | Dibujá las cuencas a mano; se guardan en el archivo del proyecto |
| Catálogos de caños, caños no circulares, estructuras que no son cajas o cilindros verticales (conos, escalones, banquetas), un tipo de drenaje en la biblioteca | Tipos de estructura desde parámetros ([Red de tuberías](topic:pipe-network)); caños con diámetro |
| Caños en la vista de perfil, caños curvos | Leé las cotas de fondo y el recubrimiento en el panel derecho |

## Parcelas

| Todavía no construido | En cambio, hoy |
|---|---|
| Trazar lotes por área o frente, parcelas desde las líneas que las rodean, servidumbre de paso | Dibujá cada parcela por sus esquinas, o ingresá sus rumbos |
| Tablas de curvas y tablas de líneas en el plano; rótulos movidos a mano | Cada tramo se rotula a lo largo de sí mismo |
| Parcelas en LandXML | Las parcelas se guardan en el archivo del proyecto y van al PDF, DWG y DXF |

## Poligonales

| Todavía no construido | En cambio, hoy |
|---|---|
| Compensación por mínimos cuadrados, la regla del tránsito, ponderar ángulos contra distancias | La regla de la brújula |
| Ángulos de deflexión, ángulos cenitales y distancias inclinadas, cotas por nivelación trigonométrica | Reducí a distancias y ángulos horizontales correctamente, o a rumbos |
| Puntos laterales, archivos de datos crudos de colectores de datos | Importá los puntos como archivo de puntos |

## Replanteo

| Todavía no construido | En cambio, hoy |
|---|---|
| Estacas de desplazamiento (puntos de referencia retirados de la estaca), estacas de talud en el punto de encuentro | Replanteá en los desplazamientos que necesites, incluso más allá de la berma |
| Enviar las estacas directo al formato propio de un colector de datos | El CSV se abre en el software de oficina de la mayoría de los colectores de datos |
| Replantear caños, pads y parcelas | Usá puntos de relevamiento cerca de un trazado, o las líneas de la parcela |

## Archivos y salida

| Todavía no construido | En cambio, hoy |
|---|---|
| Texto, sombreados y cotas desde DWG o DXF; espacio papel; dibujos vinculados (xrefs); DXF binario | Se abre la geometría del espacio modelo ([Abrir un DWG o DXF como geometría](topic:open-dwg-dxf)); abrí los dibujos vinculados por separado |
| Mover varios puntos a la vez arrastrando | Cortá y pegá, o editalos de a uno |
| Hojas en vertical, cajetines propios, ventanas gráficas que vos organices, hojas de planta y perfil en DWG | Una hoja de planta horizontal por PDF, o hojas de planta y perfil a lo largo de un trazado (PDF) |
| Trazar bandas de cotas y perfiles | Las bandas son solo de pantalla; sacá una captura si las necesitás |
| Cambiar nombres, colores o estilos de rótulos de capas | Cambialos en un programa CAD después de exportar a DXF |
| Guardado en la nube e historial de versiones | Guardá los archivos `.civilcraft.json` y mantenelos respaldados; para trabajar un proyecto en conjunto, usá una sesión en vivo en CadCraft Studio ([Diseñar un sitio juntos, en vivo](topic:work-live)) |
| CadCraft Studio para iPad y iPhone, y desde Google Play | Usá CivilCraft en el navegador del dispositivo; en Android, CadCraft Studio se instala desde su APK en getcadcraft.com/download |
| Abrir varios archivos de puntos o de proyecto a la vez | Un archivo por vez (los archivos GIS que van juntos, como las partes de un shapefile, se abren juntos) |

## Paisajismo

| Todavía no construido | En cambio, hoy |
|---|---|
| Cabezales y boquillas de fabricantes | Cabezales genéricos, o agregá tus propios cabezales desde un archivo; los datos de los fabricantes llegan a medida que dan permiso |
| Longitudes laterales máximas para líneas de goteo, caudales en el tiempo, bombas, redes de tuberías en bucle | Mantené los tramos de goteo en la longitud publicada por el fabricante; la verificación requiere una red ramificada |
| El contorno exacto de un objeto de forma libre cóncavo; su volumen bajo el terreno medido con exactitud | Se nivela el casco convexo y el volumen bajo el terreno es una estimación (indicado en Propiedades) |
| Plantas en la propia Biblioteca de Place from library de BimCraft y ModelCraft | Exportá el IFC de paisajismo y abrilo en BimCraft junto al edificio |
| Modelos detallados de plantas (hojas, ramas, estaciones) en la vista 3D; objetos de forma libre y riego en la vista 3D | Las plantas se ven en 3D como formas simples dimensionadas desde la lista de plantas ([Ver el sitio en 3D](topic:site-3d)); la dispersión de ModelCraft hace imágenes de plantación |
| Muros de obra dura que retienen un nivel nivelado detrás de ellos en la superficie | Dale a una plataforma o pad lados verticales: son muros de contención en la superficie ([Nivelación](topic:grading)) |
| Transformaciones SVG en tus propios símbolos; texturas y colores de tus propios modelos GLB de plantas; geometría GLB comprimida | Aplaná las transformaciones en tu programa de dibujo primero; los modelos se dibujan en el color de la planta; exportá el GLB sin compresión ([Gráficos de plantas](topic:plant-graphics)) |
| Tu propia lista de plantas guardada en tu cuenta de Biblioteca (editada en la aplicación) | Editá la lista propia del proyecto en la tabla de plantas y guardala como archivo de plantas |
| Las herramientas de paisajismo para asistentes sin la ventana (el servidor de archivos y la línea de comandos) | Funcionan con la ventana de CivilCraft abierta ([Dejá que un asistente de IA trabaje con tu sitio](topic:assistants)) |

## Líneas de transmisión

| Todavía no construido | En cambio, hoy |
|---|---|
| El estándar de un país incorporado (hipótesis de carga, distancias libres, factores) | Fijá los valores de tu estándar en {{ui:Hipótesis de carga y límites…}} y guardalos, con tu biblioteca, como un paquete para reutilizar y compartir ([Paquetes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distancia lateral desde un conductor hasta la copa de un árbol o un muro al costado de la línea | La distancia libre vertical sobre las plantas y muros que cruza la línea ([Verificaciones de líneas](topic:power-line-checks#clearances)) |
| Fluencia del conductor y el estiramiento de un conductor nuevo | Tenelos en cuenta mediante las temperaturas de la tabla de tendido |
| Capacidad térmica de cables enterrados (capacidad de corriente según cómo se tienden) | Ingresá la capacidad de corriente de tu proveedor en el ítem del cable |
| Estudios de cortocircuito, protección y puesta a tierra | Usá un programa eléctrico específico; CivilCraft da las longitudes de la red y los cables |
| Torres de celosía diseñadas miembro por miembro, y anclajes de retenida en el suelo | Los soportes se verifican por su carga nominal; los retenidos por su carga nominal de rotura |
| Un archivo de estudio `.DON` verificado en el programa que lo lee | Verificá el archivo allí; mandanos una muestra para probar con uno real |
| Líneas de transmisión en la vista 3D y en IFC | El plano, el perfil de línea, las hojas y las capas GIS |
| Las herramientas de líneas de transmisión para asistentes sin la ventana | Funcionan con la ventana de CivilCraft abierta ([Dejá que un asistente de IA trabaje con tu sitio](topic:assistants)) |

## Volúmenes de edificación

| Todavía no construido | En cambio, hoy |
|---|---|
| Una biblioteca de códigos de zonificación o las reglas de cualquier ciudad | Escribí los límites de tu propia ordenanza ([Límites de zonificación](topic:zoning-limits)) |
| Luz de cielo en los muros (luz de fachada), viento | [Horas de sol](topic:sun-hours) cuenta solo el sol directo |
| Sombra de árboles, plantas o cualquier cosa que no esté dibujada como volumen | Dibujá los edificios vecinos como volúmenes |
| Formas de techo en volúmenes | Volúmenes con cubierta plana |
| Aberturas, techos y tipos de muro cuando un volumen se desarrolla en BimCraft | BimCraft construye muros exteriores simples en cada nivel y un piso; agregá el resto allí |

## GIS y sistemas de coordenadas

| Todavía no construido | En cambio, hoy |
|---|---|
| Geodatabase de archivo; estilos, íconos, superposiciones de terreno y vínculos de red de KML | Convertí a GeoPackage, shapefile o GeoJSON primero; los marcadores KML se leen sin sus estilos |
| Editar elementos GIS o sus atributos | Editalos en un programa GIS e importá de nuevo. El panel Analizar crea capas nuevas (buffer, superposición, unión, selección) y agrega campos de área y longitud, pero no edita un elemento en su lugar |
| Análisis de redes y de rásters, buffers con extremos planos o cuadrados y buffers de un solo lado, agregar o borrar filas y cambiar el tipo de un campo en la tabla de atributos, colores de clase manuales, una leyenda de estilos en los trazados | Usá Seleccionar para elegir elementos y crear una capa con ellos; los extremos planos no se ofrecen. Colorear por atributo y la tabla de atributos ya están construidos: mirá [Dar estilo a una capa por un atributo](topic:gis-symbology) y [Trabajar con la tabla de atributos de una capa](topic:gis-table) |
| Estilos de rótulos (tamaño, ubicación) y rótulos que se evitan entre sí | Los rótulos son de un tamaño y pueden superponerse donde los elementos son densos |
| Datums verticales y modelos de geoide | Las cotas se usan como las da el archivo; verificá el datum vertical vos mismo |
| Desplazamientos de grilla distintos de NAD83 desde NAD27 sugeridos por área (OSTN15; NTv2 para otros datums funciona al agregar el archivo), varias grillas a la vez, grillas verticales | Agregá el archivo de grilla para tu datum vos mismo; una grilla por proyecto |
| Capas de mapa en el DXF o en las exportaciones 3D | Las capas de mapa van al trazado PDF, y junto al DWG como imagen |
| Servidores de mapas que piden inicio de sesión, clave o token | Usá servicios públicos, o un archivo de imagen georreferenciada |
| Escribir archivos LAS o LAZ desde una superficie, el modelo del terreno o las herramientas de cuadrícula de cotas y LiDAR | Exportá las superficies como cuadrícula de cotas GeoTIFF. El complemento [Nubes de puntos](topic:point-clouds) escribe una nube limpia como LAS 1.4 o LAZ |
| Intensidad, color y retornos LiDAR; cuadrículas de cotas con varias bandas; archivos de cuadrícula o LiDAR de más de 200 MB | El LiDAR se filtra solo por clase, las cuadrículas usan su primera banda; cortá los archivos grandes en teselas primero |

## Entrada

| Todavía no construido | En cambio, hoy |
|---|---|
| Selección por recuadro al tacto (necesita {{key:Shift}}) | Mantené presionado cada punto de relevamiento para agregarlo |
| Coordenadas o distancias escritas mientras dibujás | Dibujá aproximadamente, luego escribí las coordenadas exactas de los PI en la tabla de PI del trazado |
| Escribir coordenadas para esquinas de pads y estructuras | Arrastrá sus agarraderas; acercate para mayor precisión y mirá E y N en la barra de estado |
| Ajustarse a objetos (distintos de los puntos de relevamiento para líneas de quiebre) | Acercate y mirá la barra de estado |

## Vista 3D

| Todavía no construido | En cambio, hoy |
|---|---|
| Dibujar o editar en la vista 3D | Dibujá y editá en el plano; la vista 3D sigue cada edición |
| Seleccionar líneas de rasgo de corredor o elementos GIS haciendo clic en 3D | Hacé clic en ellos en el plano |
| Exportar la vista exagerada o en pies | Las exportaciones son a escala real en metros; mirá [Exportar el sitio en 3D](topic:export-3d) |
| Rótulos en exportaciones GLB u OBJ, tamaños y estilos de rótulos en 3D | Los rótulos se ven en la vista 3D solamente, de un tamaño; mirá [Ver el sitio en 3D](topic:site-3d) |
| Texturas desde fotos, grabar un recorrido como video, sombras de más allá del sitio, horas de sol mostradas en la vista 3D | Capas de mapa superpuestas sobre las superficies; recorré y la posición del sol en un momento; [horas de sol](topic:sun-hours) para un día o una temporada en el plano |
