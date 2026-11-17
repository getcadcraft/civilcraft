---
title: Establezca el sistema de coordenadas del proyecto
summary: Indique en qué sistema de coordenadas está el levantamiento, para que CivilCraft muestre latitud y longitud, ubique archivos SIG y capas de mapa, y escriba archivos .prj. Elija por código, por nombre, por las propias coordenadas o desde un archivo .prj.
keywords: sistema de coordenadas, crs, epsg, srid, plano estatal, spcs, utm, nad83, wgs 84, proyección, prj, wkt, datum, latitud, longitud, lat long, geográfico, rejilla, georreferencia, georreferenciación, asignar sistema de coordenadas
from: 964250e2
---

Las coordenadas de un proyecto son números simples hasta que indique qué significan. Establecer el sistema de coordenadas **nunca mueve nada**: solo indica a CivilCraft que, por ejemplo, E 6,150,000 N 2,080,000 son coordenadas de plano estatal de California, zona 6, en pies de agrimensor de EE. UU. Una vez que lo sabe:

- la barra de estado muestra la latitud y longitud del cursor,
- los archivos SIG en otros sistemas (shapefiles, GeoJSON, GeoPackage, mallas de elevación, LiDAR) se convierten al proyecto al abrirse,
- las capas de mapa pueden dibujarse bajo el plano ([Muestre capas de mapa bajo el plano](topic:map-layers)),
- las exportaciones a formatos SIG llevan el sistema (un `.prj` para shapefiles, el código EPSG para GeoPackage y GeoTIFF).

## Elija el sistema

1. Elija {{ui:Coordenadas}} en el grupo {{ui:SIG}} de la barra de herramientas. Se abre el cuadro de diálogo **Sistema de coordenadas**. Arriba indica en qué está el proyecto ahora, o **Ninguno — las coordenadas son solo números**.
2. Encuentre el sistema de una de estas maneras:
   - **Buscar**: escriba el código EPSG (`2277`, `EPSG:2277`) o palabras del nombre (`texas central`, `utm 14n`, `lambert-93`). Los códigos se listan a partir de lo que escribió; las palabras listan los sistemas cuyo nombre contiene todas esas palabras.
   - {{ui:Sistemas a los que se ajustan estas coordenadas}} (cuando el proyecto tiene puntos o una superficie): CivilCraft lee el centro del proyecto en cada sistema de la familia de unidades del proyecto y lista aquellos cuya área de uso lo contiene. Las coordenadas de plano estatal suelen ajustarse solo a unas pocas zonas: un proyecto en Texas en E 3,115,000 N 10,070,000 pies de agrimensor de EE. UU. se ajusta a las cuatro variantes de Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Cada entrada muestra dónde caería el centro de su proyecto.
   - **Cerca de (lat, long)** y {{ui:Sugerir}}: escriba dónde está el sitio, por ejemplo `30.27, -97.74` o `30°16′N 97°44′W`, y CivilCraft lista los sistemas proyectados cuya área lo contiene, primero las rejillas nacionales y estatales.
   - {{ui:Leer un archivo .prj…}}: abra el `.prj` que vino con un shapefile o un dibujo. CivilCraft lo compara con su lista mediante las matemáticas de proyección (así, un `.prj` que nombra un datum de otra manera también encuentra el sistema correcto) e indica cuál es; cuando nada coincide exactamente, se usa la descripción propia del archivo. También puede arrastrar un `.prj` al cuadro de diálogo, o abrirlo o soltarlo en el plano por sí solo.
3. Haga clic en un sistema de la lista. Bajo **Elegido** muestra el nombre, el código EPSG, la unidad, qué tan bien está ligado su datum a WGS 84, su área de uso en latitud y longitud, y dónde cae el centro del proyecto en él.
4. Deje seleccionada **Rejilla** (la mayoría de los proyectos; vea [Coordenadas de terreno y locales](topic:ground-and-local-coordinates) para las demás) y elija {{ui:Aplicar}}.

La barra de estado ahora muestra la latitud y longitud del cursor junto a E y N. Establecer el sistema es un solo paso de deshacer: {{key:Mod+Z}} lo revierte.

:::note
Las unidades deben coincidir: un proyecto en pies acepta sistemas en pies de agrimensor de EE. UU. o en pies internacionales; un proyecto en metros acepta sistemas en metros. CivilCraft explica un rechazo ("El proyecto está en pies, pero este sistema está en metros…"). Un proyecto en pies con un sistema de pie de agrimensor de EE. UU. usa pies de agrimensor: el "ft" del proyecto significa el pie del sistema. Los sistemas geográficos (latitud y longitud, como el propio WGS 84) no pueden ser el sistema de un proyecto: los dibujos necesitan este y norte.
:::

## Cambie o quite el sistema

Abra {{ui:Coordenadas}} de nuevo, elija otro sistema y elija {{ui:Aplicar}}. Cuando el proyecto tiene puntos o un diseño, CivilCraft pregunta **¿Las coordenadas ya están en …?**

- {{ui:Sí, nada se mueve}}: los números se quedan como están y solo cambia su significado. Úselo cuando el sistema anterior se eligió por error.
- {{ui:No, convertirlas}}: cada punto topográfico, línea de ruptura, límite, PI de alineación, esquina de plataforma y estructura se convierte del sistema anterior al nuevo, en un solo paso de deshacer. Una superficie leída de LandXML como triángulos no se puede convertir; reconstrúyala primero desde los puntos.

{{ui:Quitar el sistema}} quita el sistema (nada se mueve). Las capas SIG que ya están en el proyecto se quedan donde están.

## Latitud y longitud en la barra de estado

Mientras el proyecto tenga un sistema, la barra de estado muestra la latitud y longitud del cursor en WGS 84, por ejemplo `30°18′00.00″ N  97°42′00.00″ W`. Para ver grados decimales, elija **Latitud y longitud** en {{ui:Configuración}}, {{ui:CivilCraft}} ([Configuración de CivilCraft](topic:settings)). Con coordenadas de terreno o locales, la lectura pasa primero por ese paso, así que es correcta para el punto bajo el cursor.

## Qué tan buena es la corrección del datum

Latitud, longitud, GeoJSON y las capas de mapa están todas en WGS 84. El enlace de cada sistema con WGS 84 se muestra en el cuadro de diálogo:

| Lo que dice el cuadro de diálogo | Qué significa |
|---|---|
| WGS 84 en sí | Ninguna corrección. |
| NAD83 se toma como WGS 84 | Los dos difieren en uno o dos metros en la mayor parte de América del Norte, a lo sumo unos metros. Sirve para capas de mapa y contexto del sitio; no para control topográfico. |
| Conocido a unos *n* m (cifra de EPSG) | Una corrección publicada; las capas de mapa y GeoJSON pueden estar desfasados unos *n* m. |
| No conocido para este datum | No hay corrección publicada sin un archivo de rejilla: las capas de mapa y GeoJSON pueden estar desfasados cientos de metros. |
| Del archivo de desplazamiento de rejilla … | Hay un archivo de desplazamiento de rejilla en uso (abajo): dentro de unos 10 cm de NAD83, dentro de la rejilla. |

Las coordenadas propias del proyecto nunca pasan por una corrección de datum: solo lo que se convierte hacia o desde latitud y longitud. Los datums verticales y los modelos de geoide no se manejan (las elevaciones nunca se convierten). Cuando la mejor corrección necesita un archivo de rejilla, la lista trae una corrección publicada más burda y el cuadro de diálogo muestra su precisión (por ejemplo, unos 20 m en sistemas NAD27), hasta que agregue la rejilla.

## Archivos de desplazamiento de rejilla

Para un sistema NAD27, **Archivo de desplazamiento de rejilla** en el cuadro de diálogo del sistema de coordenadas pone la latitud y longitud, los archivos SIG y las capas de mapa a unos 10 cm de NAD83, en lugar de unos 20 m:

- **Descargue** la rejilla que sugiere para el área del sistema (NADCON5 para Estados Unidos continental, NADCON para Alaska, NTv2 para Canadá) desde cdn.proj.org, el servidor público de rejillas de PROJ. Solo se envía el nombre del archivo de la rejilla.
- O bien, **Agregue un archivo de rejilla…** si ya lo tiene: NTv2 (`.gsb`) o una rejilla GeoTIFF de PROJ (`.tif`), de hasta 20 MB.

La rejilla se guarda en el archivo del proyecto, así que viaja con él. La sección indica si el centro del proyecto está dentro de la rejilla: fuera de ella no se aplica ninguna corrección, así que use una rejilla que cubra el sitio. **Dejar de usar la rejilla** regresa a la corrección burda. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

Las capas SIG que ya están en el proyecto se quedan donde están cuando cambia la rejilla; impórtelas de nuevo para colocarlas a través de la rejilla. Las coordenadas propias del proyecto nunca se mueven.

## Lo que se verificó

- Cada conversión se comparó con PROJ (pyproj 3.7.1 con PROJ 9.5.1), la biblioteca de coordenadas que usan la mayoría de los programas SIG, en más de 330 sistemas: plano estatal en pies de agrimensor de EE. UU. y en pies, UTM norte y sur, Lambert-93, British National Grid, GDA2020 MGA, Mercator transversa de Nueva Zelanda y Mercator web, entre ellos. Los este y norte coinciden a 1 cm con la misma corrección de datum (la mayoría muy por debajo de 1 mm), y las matemáticas de proyección coinciden con las definiciones propias de PROJ a 1 cm.
- Los archivos `.prj` escritos por PROJ en sus dos formas comunes (ESRI y OGC) se leyeron de vuelta para 105 sistemas: 208 de los 210 coincidieron con su código EPSG exacto, y los otros dos con un sistema de las mismas matemáticas sobre el mismo elipsoide. Los archivos `.prj` que escribe CivilCraft los lee PROJ como el mismo sistema. Los archivos `.prj` ESRI de sistemas estereográficos polares (UPS, polar de Alaska) no se pueden leer; elija esos sistemas por código.
- La latitud y longitud en la barra de estado coincidieron con PROJ a 0.01″ en el navegador.
