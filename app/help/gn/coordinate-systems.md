---
title: Oñemoĩ sistema de coordenadas del proyecto
summary: Indicá en qué sistema de coordenadas está el relevamiento, para que CivilCraft muestre latitud y longitud, ubique archivos GIS y capas de mapa, y escriba archivos .prj. Elegí por código, por nombre, por las propias coordenadas o desde un archivo .prj.
keywords: sistema de coordenadas, crs, epsg, srid, plano estatal, spcs, utm, nad83, wgs 84, proyección, prj, wkt, datum, latitud, longitud, lat long, geográfico, cuadrícula, georreferencia, georreferenciación, asignar sistema de coordenadas
from: 964250e2
---

Las coordenadas de un proyecto son simples números hasta que digas qué significan. Fijar el sistema de coordenadas **nunca mueve nada**: solo le dice a CivilCraft que, por ejemplo, E 6,150,000 N 2,080,000 son coordenadas de plano estatal de California zona 6 en US survey feet. Una vez que lo sabe:

- la barra de estado muestra la latitud y longitud del puntero,
- los archivos GIS de otros sistemas (shapefiles, GeoJSON, GeoPackage, grillas de elevación, LiDAR) se convierten al proyecto al abrirse,
- las capas de mapa pueden dibujarse bajo el plano ([Mostrar capas de mapa bajo el plano](topic:map-layers)),
- las exportaciones a formatos GIS llevan el sistema (un `.prj` para shapefiles, el código EPSG para GeoPackage y GeoTIFF).

## Elegir el sistema

1. Elegí {{ui:Coordenadas}} en el grupo {{ui:GIS}} de la barra de herramientas. Se abre el diálogo **Sistema de coordenadas**. Arriba indica en qué está el proyecto ahora, o **Ninguno — las coordenadas son solo números**.
2. Buscá el sistema de una de estas formas:
   - **Búsqueda**: escribí el código EPSG (`2277`, `EPSG:2277`) o palabras del nombre (`texas central`, `utm 14n`, `lambert-93`). Los códigos listan desde el que escribiste; las palabras listan sistemas cuyo nombre tiene todas las palabras.
   - {{ui:Sistemas que se ajustan a estas coordenadas}} (cuando el proyecto tiene puntos o una superficie): CivilCraft lee el centro del proyecto en cada sistema de la familia de unidades del proyecto y lista los que su área de uso contiene. Las coordenadas de plano estatal suelen ajustarse a pocas zonas: un proyecto en Texas en E 3,115,000 N 10,070,000 US survey feet se ajusta a las cuatro variantes Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Cada entrada muestra dónde caería el centro del proyecto.
   - **Cerca de (lat, long)** y {{ui:Sugerir}}: escribí dónde queda el sitio, por ejemplo `30.27, -97.74` o `30°16′N 97°44′W`, y CivilCraft lista los sistemas proyectados cuya área lo contiene, primero las cuadrículas nacionales y estatales.
   - {{ui:Leer un archivo .prj…}}: abrí el `.prj` que vino con un shapefile o un plano. CivilCraft lo compara con su lista por las matemáticas de proyección (así un `.prj` que nombra el datum de otra forma igual encuentra el sistema correcto) y dice cuál es; cuando nada coincide exactamente, se usa la descripción propia del archivo. También podés soltar un `.prj` en el diálogo, o abrir o soltar uno en el plano por sí solo.
3. Hacé clic en un sistema de la lista. Bajo **Elegido** muestra el nombre, código EPSG, unidad, qué tan bien está ligado su datum a WGS 84, su área de uso en latitud y longitud, y dónde cae el centro del proyecto dentro de él.
4. Dejá seleccionado **Cuadrícula** (la mayoría de los proyectos; ver [Terreno y coordenadas locales](topic:ground-and-local-coordinates) para los demás) y elegí {{ui:Aplicar}}.

La barra de estado ahora muestra la latitud y longitud del puntero junto a E y N. Fijar el sistema es un solo paso de deshacer: {{key:Mod+Z}} lo revierte.

:::note
Las unidades deben coincidir: un proyecto en pies toma sistemas en US survey feet o pies internacionales; un proyecto en metros toma sistemas en metros. CivilCraft explica un rechazo ("El proyecto está en pies pero este sistema está en metros…"). Un proyecto en pies con un sistema de US survey foot usa survey feet: el "ft" del proyecto significa el pie del sistema. Los sistemas geográficos (latitud y longitud, como el propio WGS 84) no pueden ser el sistema de un proyecto: los planos necesitan este y norte.
:::

## Cambiar o quitar el sistema

Abrí {{ui:Coordenadas}} de nuevo, elegí otro sistema y elegí {{ui:Aplicar}}. Cuando el proyecto tiene puntos o un diseño, CivilCraft pregunta **¿Las coordenadas ya están en … ?**

- {{ui:Sí: no se mueve nada}}: los números quedan como están y solo cambia su significado. Usalo cuando el sistema anterior se eligió por error.
- {{ui:No: convertirlas}}: cada punto de relevamiento, línea de quiebre, límite, PI de trazado, esquina de plataforma y estructura se convierte del sistema anterior al nuevo, en un solo paso de deshacer. Una superficie leída de LandXML como triángulos no se puede convertir; reconstruila primero desde los puntos.

{{ui:Quitar el sistema}} quita el sistema (no se mueve nada). Las capas GIS que ya están en el proyecto quedan donde están.

## Latitud y longitud en la barra de estado

Mientras el proyecto tenga un sistema, la barra de estado muestra la latitud y longitud del puntero en WGS 84, por ejemplo `30°18′00.00″ N  97°42′00.00″ W`. Para grados decimales, elegí en cambio {{ui:Configuración}}, {{ui:CivilCraft}}, **Latitud y longitud** ([Configuración de CivilCraft](topic:settings)). Con coordenadas de terreno o locales, la lectura pasa primero por ese paso, así que es correcta para el punto bajo el puntero.

## Cuán buena es la corrección de datum

Latitud, longitud, GeoJSON y las capas de mapa están todos en WGS 84. El vínculo de cada sistema con WGS 84 se muestra en el diálogo:

| Lo que dice el diálogo | Qué significa |
|---|---|
| WGS 84 en sí | Ningún desplazamiento. |
| NAD83 se toma como WGS 84 | Ambos difieren en uno o dos metros en la mayor parte de América del Norte, como mucho algunos metros. Sirve para capas de mapa y contexto del sitio; no para control de relevamiento. |
| Conocido a unos *n* m (cifra de EPSG) | Corrección publicada; las capas de mapa y GeoJSON pueden desviarse en ese orden. |
| No conocido para este datum | No hay corrección publicada sin archivo de cuadrícula: las capas de mapa y GeoJSON pueden desviarse cientos de metros. |
| Desde el archivo de desplazamiento de cuadrícula … | Hay un archivo de desplazamiento en uso (abajo): dentro de unos 10 cm de NAD83, dentro de la cuadrícula. |

Las coordenadas propias del proyecto nunca pasan por un desplazamiento de datum: solo lo que se convierte hacia o desde latitud y longitud. Los datums verticales y los modelos de geoide no se tratan (las cotas nunca se convierten). Cuando la mejor corrección necesita un archivo de cuadrícula, la lista trae una corrección publicada más tosca y el diálogo muestra su precisión (sistemas NAD27, por ejemplo, unos 20 m), hasta que agregues la cuadrícula.

## Archivos de desplazamiento de cuadrícula

Para un sistema NAD27, **Archivo de desplazamiento de cuadrícula** en el diálogo de sistema de coordenadas lleva latitud y longitud, archivos GIS y capas de mapa a unos 10 cm de NAD83 en lugar de unos 20 m:

- **Descargá** la cuadrícula que sugiere para el área del sistema (NADCON5 para los Estados Unidos contiguos, NADCON para Alaska, NTv2 para Canadá) desde cdn.proj.org, el servidor público de cuadrículas de PROJ. Solo se envía el nombre del archivo de la cuadrícula.
- **Agregar un archivo de cuadrícula…** que ya tengas: NTv2 (`.gsb`) o cuadrícula GeoTIFF de PROJ (`.tif`), de hasta 20 MB.

La cuadrícula se guarda en el archivo del proyecto, así viaja con el proyecto. La sección indica si el centro del proyecto está dentro de la cuadrícula: fuera de ella no se aplica ningún desplazamiento, así que usá una cuadrícula que cubra el sitio. **Dejar de usar la cuadrícula** vuelve a la corrección tosca. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

Las capas GIS que ya están en el proyecto quedan donde están cuando cambia la cuadrícula; importalas de nuevo para ubicarlas a través de la cuadrícula. Las coordenadas propias del proyecto nunca se mueven.

## Qué se verificó

- Cada conversión se comparó con PROJ (pyproj 3.7.1 con PROJ 9.5.1), la biblioteca de coordenadas que usan la mayoría de los programas GIS, en más de 330 sistemas: plano estatal en US survey feet y en pies, UTM norte y sur, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator y Mercator web, entre otros. Este y norte coinciden a 1 cm con la misma corrección de datum (la mayoría muy por debajo de 1 mm), y las matemáticas de proyección coinciden con las definiciones propias de PROJ a 1 cm.
- Los archivos `.prj` escritos por PROJ en ambas formas comunes (ESRI y OGC) se leyeron de vuelta para 105 sistemas: 208 de los 210 coincidieron con su código EPSG exacto, y los otros dos con un sistema de las mismas matemáticas en el mismo elipsoide. Los `.prj` que escribe CivilCraft los lee PROJ como el mismo sistema. Los `.prj` ESRI de sistemas estereográficos polares (UPS, Alaska polar) no se pueden leer; elegí esos sistemas por código.
- La latitud y longitud de la barra de estado coincidieron con PROJ a 0.01″ en el navegador.
