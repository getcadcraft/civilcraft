---
title: Aún no disponible
summary: Lo que esta versión de CivilCraft todavía no hace, y qué hacer en cambio, hoy.
keywords: faltante, limitaciones, hoja de ruta, no disponible, espirales, ensanche, dwg, dxf, bocas de tormenta, retención, cortes transversales, más adelante, límites
from: a2d970ef
---

CivilCraft está en una etapa temprana. Esta página indica lo que la versión actual no hace, para que no lo busque. Nada de lo aquí listado tiene fecha prometida.

## Puntos

| Aún no disponible | En cambio, hoy |
|---|---|
| Agregar un segundo archivo de puntos al primero | Una los archivos primero en un editor de texto o planilla |
| Exportar un archivo de texto de puntos | Exporte LandXML (los puntos salen como CgPoints), use {{ui:Exportar}} de GIS (puntos con los campos P, N, E, Z y D), o {{ui:Copiar}} los puntos a una planilla |
| Estilos de rótulos de puntos, símbolos por clave de descripción, curvas (arcos) desde códigos de línea, un archivo de claves de descripción para compartir entre proyectos | Los rótulos muestran el número, la cota y la descripción, o menos ([Configuración de CivilCraft](topic:settings)); las claves se guardan en el archivo del proyecto |
| Conversión de unidades | Convierta el archivo antes de importar; **Unidades** solo cambia las etiquetas |

## Superficies

| Aún no disponible | En cambio, hoy |
|---|---|
| Más de una superficie construida desde puntos | Un proyecto por superficie |
| Ocultar límites interiores | Use **Borde exterior más largo** o un límite exterior |
| Seleccionar o editar una línea de quiebre dibujada | {{key:Mod+Z}}, o {{ui:Eliminar líneas de quiebre dibujadas}} y vuelva a dibujar |
| Editar una superficie leída de LandXML (líneas de quiebre, límite) | {{ui:Ojejapo superficie puntos gui}} |
| Editar una superficie hecha desde una grilla de cotas | Importe la grilla de nuevo con otras opciones |
| Convertir una superficie leída de LandXML cuando cambia el sistema de coordenadas | {{ui:Ojejapo superficie puntos gui}} primero |
| Cotas puntuales rotuladas y valores de pendiente | Léalos en la barra de estado, o coloree la superficie por pendiente con **Análisis de pendiente** en el espacio de trabajo Paisajismo ([Nivelación para paisajismo](topic:landscape-grading#grading-checks)) |

## Alineamientos y perfiles

| Aún no disponible | En cambio, hoy |
|---|---|
| Espirales que no sean clotoides; una espiral entre dos curvas (transiciones compuestas) | Las espirales clotoides en los extremos de una curva están disponibles; las demás se nombran y se omiten al importar LandXML |
| Insertar un PI entre otros dos | Redibuje el alineamiento, o vuelva a escribir las coordenadas del PI |
| Alineamientos desde objetos, desplazamientos, ensanches | Dibuje por PI |
| Escribir K para una curva vertical | Escriba L (se muestra K) |
| Curvas verticales circulares y no simétricas | Solo curvas parabólicas simétricas |
| Más de un perfil de diseño por alineamiento | Un alineamiento por variante |
| Hacer zoom en la vista de perfil, bandas de perfil bajo el perfil | La vista de perfil ajusta todo el alineamiento; imprímalo en [hojas de planta y perfil](topic:plan-profile-sheets) |
| Cortes en DWG o LandXML | Hojas de cortes en PDF; {{ui:CSV}} de las áreas y volúmenes |
| Líneas de muestra en ángulo, o de anchos distintos a lo largo de la ruta | Un ancho a cada lado para todo el alineamiento |

## Corredores

| Aún no disponible | En cambio, hoy |
|---|---|
| Medianas, barreras y un peralte que rota las plantillas | Dibújelas como plantillas ([Plantillas de corredor](topic:corridor-templates)); las plantillas por estación todavía no toman peralte |
| Un cambio gradual entre plantillas de dos regiones (transiciones, ahusamientos) | Cambie la plantilla en una estación, o asigne a un punto una meta de ancho a una línea dibujada como el ahusamiento |
| Rotación alrededor de un borde, peralte en LandXML | El peralte rota alrededor del eje en curvas circulares; ensanche un carril con una meta de ancho a una línea característica |
| Metas para los taludes laterales (corte hasta una línea o superficie), superficies propias del corredor | Las metas mueven los bordes de calzada y banquinas ([Corredores](topic:corridor)); el corredor se nivela en la superficie proyectada |
| Corredores exportados como calzadas LandXML; un segundo corredor en un alineamiento en la exportación IFC | Se exporta la superficie proyectada |
| Plantillas de terreno que cambian la superficie proyectada, en 3D o en los cortes | Dan áreas y volúmenes de cada capa ([Plantillas de terreno](topic:corridor-templates#terrain-templates)) |
| Recorridos de giro con velocidad, deslizamiento de neumáticos, tiempo de giro, remolques o despeje de carrocería; una biblioteca de vehículos de diseño estándar; un recorrido de giro dibujado arrastrando el vehículo | Recorridos de giro a baja velocidad a lo largo de una línea característica o de un alineamiento, con sus propios tamaños de vehículo ([Recorridos de vehículos](topic:swept-paths)) |

## Nivelación y volúmenes

| Aún no disponible | En cambio, hoy |
|---|---|
| Banquetas, líneas características abiertas niveladas en el diseño, nivelación hasta una línea característica de otro lugar | Cierre la línea característica ([Líneas características](topic:feature-lines)), o úsela como línea de quiebre del terreno existente |
| Insertar o quitar un vértice de línea característica | Dibuje la línea de nuevo, o haga un desplazamiento escalonado de ella |
| Arcos en líneas de quiebre dibujadas (por puntos de relevamiento), espirales en líneas características | Dibuje una línea característica con arcos y úsela como línea de quiebre del terreno existente |
| Nivelación hasta una distancia, una cota u otra superficie | Aflore solo hasta el terreno existente |
| Agregar o quitar una esquina de plataforma | Borre la plataforma y vuelva a dibujarla |
| Volúmenes TIN a TIN (prismas), elegir el tamaño de celda de la grilla | Método de grilla, con tamaño de celda elegido automáticamente |
| Esponjamiento y contracción, capa vegetal, espesores de pavimento | Aplique factores a los números informados usted mismo |
| Costos de acarreo libre y sobreacarreo, acarreo entre alineamientos distintos, préstamos y depósitos ubicados en el plano | El diagrama de masas con puntos de equilibrio, volúmenes movidos y distancias medias de acarreo |

## Redes de caños

| Aún no disponible | En cambio, hoy |
|---|---|
| Más de una red por proyecto | Proyectos separados para pluvial y cloacal |
| Cañerías de agua: calidad y antigüedad del agua, controles por reglas, otros tipos de válvula (control de caudal, estrangulamiento, sostenimiento), bombas dadas por potencia, demanda que depende de la presión, una opción de Darcy–Weisbach, un catálogo de caños con espesores de pared y clases de presión. El resto de las redes a presión está en desarrollo: [Cañerías de agua](topic:water-mains) | Verifique esos puntos en un software de distribución de agua; los caudales de diseño cloacales están en [Caudales de diseño cloacales](topic:sanitary-design) |
| Flujos cloacales en el tiempo (hidrogramas, enrutamiento dinámico, almacenamiento, bombas, desbordes) | [Caudales de diseño cloacales](topic:sanitary-design) da el caudal pico estacionario que usa una hoja de diseño |
| Capacidad de boca de tormenta, propagación en cuneta, enrutamiento por retención, hidrogramas, pérdidas de energía distintas de un coeficiente de empalme | Verifíquelos en otro software; caudales, tamaños y líneas de gradiente están en [Drenaje pluvial](topic:storm-drainage) |
| Cuencas en la impresión PDF, DWG, DXF o LandXML; cuencas desde la superficie (cuencas hidrográficas) | Dibuje las cuencas a mano; se guardan en el archivo del proyecto |
| Catálogos de caños, caños no circulares, estructuras que no son cajas o cilindros verticales (conos, escalones, banquetas), una categoría de drenaje en la biblioteca | Tipos de estructura desde parámetros ([Red de caños](topic:pipe-network)); caños con un diámetro |
| Caños en la vista de perfil, caños curvos | Lea cotas de fondo y recubrimiento en el panel derecho |

## Parcelas

| Aún no disponible | En cambio, hoy |
|---|---|
| Trazar lotes por área o frente, parcelas desde las líneas que las rodean, derecho de vía | Dibuje cada parcela por sus esquinas, o ingrese sus rumbos |
| Tablas de curvas y tablas de líneas en el plano; rótulos movidos a mano | Cada tramo se rotula a lo largo de sí mismo |
| Parcelas en LandXML | Las parcelas se guardan en el archivo del proyecto y van al PDF, DWG y DXF |

## Poligonales

| Aún no disponible | En cambio, hoy |
|---|---|
| Ajuste por mínimos cuadrados, la regla del transit, ponderar ángulos contra distancias | La regla de la brújula |
| Ángulos de deflexión, ángulos cenitales y distancias inclinadas, cotas por nivelación trigonométrica | Reduzca a distancias horizontales y ángulos correctos, o a rumbos |
| Tiros laterales, archivos de datos crudos de colectores de datos | Importe los puntos como archivo de puntos |

## Replanteo

| Aún no disponible | En cambio, hoy |
|---|---|
| Estacas de desplazamiento (puntos de referencia retirados de la estaca), estacas de talud en el punto de corte | Coloque estacas en los desplazamientos que necesite, incluso más allá de la banquina |
| Enviar las estacas directamente al formato propio de un colector de datos | El CSV se abre en el software de oficina de la mayoría de los colectores de datos |
| Estacar caños, plataformas y parcelas | Use puntos de relevamiento cerca de un alineamiento, o los rumbos de la parcela |

## Archivos y salida

| Aún no disponible | En cambio, hoy |
|---|---|
| Texto, sombreados y cotas de DWG o DXF; espacio papel; dibujos vinculados (xref); DXF binario | Se abren las líneas del espacio modelo ([Abrir un DWG o DXF como líneas](topic:open-dwg-dxf)); abra los dibujos vinculados por separado |
| Mover varios puntos a la vez arrastrando | Corte y pegue, o edítelos de a uno |
| Hojas en vertical, cajetines propios, viewports que usted organiza, hojas de planta y perfil en DWG | Una hoja de planta horizontal por PDF, o hojas de planta y perfil a lo largo de un alineamiento (PDF) |
| Trazar bandas de cotas y perfiles | Las bandas son solo de pantalla; tome una captura si las necesita |
| Cambiar nombres de capas, colores o estilos de rótulos | Cámbielos en un programa CAD después de exportar DXF |
| Guardado en la nube e historial de versiones | Guarde archivos `.civilcraft.json` y manténgalos respaldados; para trabajar en un proyecto en conjunto, use una sesión en vivo en CadCraft Studio ([Diseñar un sitio juntos, en vivo](topic:work-live)) |
| CadCraft Studio para iPad y iPhone, y desde Google Play | Use CivilCraft en el navegador del dispositivo; en Android, CadCraft Studio se instala desde su APK en getcadcraft.com/download |
| Abrir varios archivos de puntos o de proyecto a la vez | Un archivo por vez (los archivos GIS que van juntos, como las partes de un shapefile, se abren juntos) |

## Paisajismo

| Aún no disponible | En cambio, hoy |
|---|---|
| Cabezales y boquillas de fabricantes | Cabezales genéricos, o agregue sus propios cabezales desde un archivo; los datos de los fabricantes se incorporan cuando dan permiso |
| Longitudes laterales máximas para líneas de goteo, caudales en el tiempo, bombas, redes de caños en malla | Mantenga los tramos de goteo en la longitud publicada por el fabricante; la verificación necesita una red ramificada |
| El contorno exacto de un objeto de forma libre cóncavo; su volumen bajo tierra medido con exactitud | Se nivela el casco convexo, y el volumen bajo tierra es una estimación (indicado en Propiedades) |
| Plantas en Colocar desde biblioteca de BimCraft y ModelCraft | Exporte el IFC de paisajismo y ábralo en BimCraft junto al edificio |
| Modelos de plantas detallados (hojas, ramas, estaciones) en la vista 3D; objetos de forma libre y riego en la vista 3D | Las plantas se muestran en 3D como formas simples con tamaño según la lista de plantas ([Ver el sitio en 3D](topic:site-3d)); el scatter de ModelCraft hace imágenes de plantación |
| Muros de contención que retienen un nivel nivelado detrás de ellos en la superficie | Dé a una plataforma o a una base laterales verticales: son muros de contención en la superficie ([Nivelación](topic:grading)) |
| Transformaciones SVG en sus propios símbolos; texturas y colores de sus propios modelos de plantas GLB; geometría GLB comprimida | Aplane las transformaciones en su programa de dibujo primero; los modelos se dibujan en el color de la planta; exporte el GLB sin compresión ([Gráficos de plantas](topic:plant-graphics)) |
| Su propia lista de plantas guardada en su cuenta de Biblioteca (editada en la app) | Edite la lista propia del proyecto en la tabla de Plantas y guárdela como archivo de plantas |
| Las herramientas de paisajismo para asistentes sin la ventana (el servidor de archivos y la línea de comandos) | Funcionan con la ventana de CivilCraft abierta ([Deje que un asistente de IA trabaje con su sitio](topic:assistants)) |

## Líneas eléctricas

| Aún no disponible | En cambio, hoy |
|---|---|
| Una norma de país incorporada (hipótesis de carga, distancias, factores) | Fije los valores de su norma en {{ui:Hipótesis de carga y límites…}} y guárdelos, con su biblioteca, como un paquete para reutilizar y compartir ([Paquetes](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distancia lateral desde un conductor a la copa de un árbol o a un muro al costado de la línea | La distancia vertical libre sobre plantas y muros que cruza la línea ([Controles de líneas eléctricas](topic:power-line-checks#clearances)) |
| Fluencia del conductor y estiramiento de un conductor nuevo | Téngalos en cuenta mediante las temperaturas de la tabla de tendido |
| Capacidad térmica de cables enterrados (corriente admisible según cómo se tienden) | Ingrese en el ítem del cable la corriente admisible de su proveedor |
| Estudios de cortocircuito, protección y puesta a tierra | Use un programa eléctrico específico; CivilCraft da las longitudes y los cables de la red |
| Torres de celosía diseñadas miembro por miembro, y anclajes de retenida en el suelo | Los soportes se verifican por su carga nominal; las retenidas, por su carga admisible |
| Un archivo de estudio `.DON` verificado en el programa que lo lee | Verifíquelo allí; envíenos una muestra para probar con una real |
| Líneas eléctricas en la vista 3D y en IFC | El plano, el perfil de la línea, las hojas y las capas GIS |
| Las herramientas de líneas eléctricas para asistentes sin la ventana | Funcionan con la ventana de CivilCraft abierta ([Deje que un asistente de IA trabaje con su sitio](topic:assistants)) |

## Masas de edificios

| Aún no disponible | En cambio, hoy |
|---|---|
| Una biblioteca de códigos de zonificación o reglas de cualquier ciudad | Escriba los límites de su propia ordenanza ([Límites de zonificación](topic:zoning-limits)) |
| Luz de cielo en los muros (luz de fachada), viento | [Horas de sol](topic:sun-hours) cuenta solo el sol directo |
| Sombra de árboles, plantas o cualquier cosa que no esté dibujada como masa | Dibuje los edificios vecinos como masas |
| Formas de techo en masas | Masas con tope plano |
| Vanos, techos y tipos de muro cuando una masa se desarrolla en BimCraft | BimCraft construye muros exteriores simples en cada nivel y un piso; agregue el resto allí |

## GIS y sistemas de coordenadas

| Aún no disponible | En cambio, hoy |
|---|---|
| Geodatabase de archivo; estilos de KML, íconos, superposiciones de terreno y vínculos de red | Convierta a GeoPackage, shapefile o GeoJSON primero; las marcas KML se leen sin sus estilos |
| Editar entidades GIS o sus atributos | Edítelas en un programa GIS e importe de nuevo. El panel Analizar crea capas nuevas (buffer, superposición, unión, selección) y agrega campos de área y longitud, pero no edita una entidad en su lugar |
| Análisis de redes y de ráster, buffers con extremos planos o cuadrados y buffers de un solo lado, agregar o borrar filas y cambiar el tipo de un campo en la tabla de atributos, colores de clase manuales, una leyenda de estilos en impresiones | Use Seleccionar para elegir entidades y crear una capa con ellas; los extremos planos no se ofrecen. Colorear por atributo y la tabla de atributos ya están construidos: vea [Dar estilo a una capa por un atributo](topic:gis-symbology) y [Trabajar con la tabla de atributos de una capa](topic:gis-table) |
| Estilos de rótulos (tamaño, ubicación) y rótulos que no se superponen | Los rótulos tienen un tamaño y pueden superponerse donde los elementos son densos |
| Datums verticales y modelos de geoide | Las cotas se usan como las da el archivo; verifique el datum vertical usted mismo |
| Cambios de grilla distintos de NAD83 desde NAD27 sugeridos por área (OSTN15, NTv2 para otros datums funcionan al agregar el archivo), varias grillas a la vez, grillas verticales | Agregue el archivo de grilla para su datum usted mismo; una grilla por proyecto |
| Capas de mapa en DXF o en exportaciones 3D | Las capas de mapa van a la impresión PDF, y junto al DWG como imagen |
| Servidores de mapas que piden inicio de sesión, clave o token | Use servicios públicos, o un archivo de imagen georreferenciada |
| Escribir archivos LAS o LAZ desde una superficie, el modelo de terreno o las herramientas de grilla de cotas o LiDAR | Exporte superficies como grilla de cotas GeoTIFF. El complemento [Nubes de puntos](topic:point-clouds) escribe una nube depurada como LAS 1.4 o LAZ |
| Intensidad, color y retornos LiDAR; grillas de cotas con varias bandas; archivos de grilla o LiDAR de más de 200 MB | LiDAR se filtra solo por clase, y las grillas usan su primera banda; corte los archivos grandes en mosaicos primero |

## Entrada

| Aún no disponible | En cambio, hoy |
|---|---|
| Selección por recuadro al tacto (necesita {{key:Shift}}) | Mantenga presionado cada punto de relevamiento para agregarlo |
| Coordenadas o distancias escritas mientras dibuja | Dibuje aproximadamente, y luego escriba las coordenadas exactas de los PI en la tabla de PI del alineamiento |
| Escribir coordenadas para esquinas de plataforma y estructuras | Arrastre sus puntos de control; haga zoom para precisión y observe E y N en la barra de estado |
| Ajustar a objetos (distintos de los puntos de relevamiento para líneas de quiebre) | Haga zoom y observe la barra de estado |

## Vista 3D

| Aún no disponible | En cambio, hoy |
|---|---|
| Dibujar o editar en la vista 3D | Dibuje y edite en el plano; la vista 3D sigue cada cambio |
| Seleccionar líneas características de corredor o entidades GIS haciendo clic en 3D | Haga clic en ellas en el plano |
| Exportar la vista exagerada o en pies | Las exportaciones están a escala real en metros; vea [Exportar el sitio en 3D](topic:export-3d) |
| Rótulos en exportaciones GLB u OBJ, tamaños y estilos de rótulos en 3D | Los rótulos aparecen solo en la vista 3D, en un tamaño; vea [Ver el sitio en 3D](topic:site-3d) |
| Texturas de fotos, grabar un recorrido como video, sombras de fuera del sitio, horas de sol en la vista 3D | Capas de mapa superpuestas en las superficies; recorrido y posición del sol en un momento; [horas de sol](topic:sun-hours) para un día o una temporada en el plano |
