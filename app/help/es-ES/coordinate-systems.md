---
title: Definir el sistema de coordenadas del proyecto
summary: Indique en qué sistema de coordenadas está el levantamiento, para que CivilCraft muestre latitud y longitud, sitúe los archivos GIS y las capas de mapa, y escriba archivos .prj. Elija por código, por nombre, por las propias coordenadas o desde un archivo .prj.
keywords: sistema de coordenadas, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, proyección, prj, wkt, datum, latitud, longitud, lat long, geográfico, malla, georreferenciación, georreferenciar, asignar sistema de coordenadas
from: 964250e2
---

Las coordenadas de un proyecto son solo números hasta que indique lo que significan. Definir el sistema de coordenadas **nunca mueve nada**: le dice a CivilCraft que, por ejemplo, E 6,150,000 N 2,080,000 son coordenadas de plano estatal de California, zona 6, en pies de agrimensura de EE. UU. Una vez que lo sabe:

- la barra de estado muestra la latitud y la longitud del puntero,
- los archivos GIS en otros sistemas (shapefiles, GeoJSON, GeoPackage, cuadrículas de elevación, LiDAR) se convierten al proyecto al abrirse,
- las capas de mapa pueden dibujarse bajo el plano ([Mostrar capas de mapa bajo el plano](topic:map-layers)),
- las exportaciones a formatos GIS llevan el sistema (un `.prj` para shapefiles, el código EPSG para GeoPackage y GeoTIFF).

## Elegir el sistema

1. Elija {{ui:Coordenadas}} en el grupo {{ui:SIG}} de la barra de herramientas. Se abre el cuadro de diálogo **Sistema de coordenadas**. En la parte superior indica en qué está ahora el proyecto, o **Ninguno: las coordenadas son solo números**.
2. Busque el sistema de una de estas formas:
   - **Búsqueda**: escriba el código EPSG (`2277`, `EPSG:2277`) o palabras del nombre (`texas central`, `utm 14n`, `lambert-93`). Los códigos se listan a partir de lo que escribió; las palabras listan los sistemas cuyo nombre contiene todas ellas.
   - {{ui:Sistemas a los que se ajustan estas coordenadas}} (cuando el proyecto tiene puntos o una superficie): CivilCraft lee el centro de su proyecto en cada sistema de la familia de unidades del proyecto y lista los que tienen esa zona de uso dentro. Las coordenadas de plano estatal suelen encajar solo en unas pocas zonas: un proyecto en Texas en E 3,115,000 N 10,070,000 pies de agrimensura de EE. UU. encaja en las cuatro variantes de Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Cada entrada muestra dónde caería el centro de su proyecto.
   - **Cerca de (lat, long)** y {{ui:Sugerir}}: escriba dónde está el emplazamiento, por ejemplo `30.27, -97.74` o `30°16′N 97°44′W`, y CivilCraft lista los sistemas proyectados cuya zona lo contiene, primero las cuadrículas nacionales y estatales.
   - {{ui:Leer un archivo .prj…}}: abra el `.prj` que vino con un shapefile o con un dibujo. CivilCraft lo compara con su lista mediante las matemáticas de la proyección (así que un `.prj` que nombre un datum de forma distinta encuentra igualmente el sistema correcto) e indica cuál es; si nada coincide exactamente, se usa la descripción propia del archivo. También puede arrastrar un `.prj` sobre el cuadro de diálogo, o abrirlo o soltarlo sobre el plano por sí solo.
3. Haga clic en un sistema de la lista. Bajo **Elegido** muestra el nombre, el código EPSG, la unidad, lo bien que su datum está ligado a WGS 84, su zona de uso en latitud y longitud, y dónde cae el centro de su proyecto en ella.
4. Deje seleccionado **Cuadrícula** (la mayoría de proyectos; véase [Coordenadas de terreno y locales](topic:ground-and-local-coordinates) para los demás) y elija {{ui:Aplicar}}.

La barra de estado muestra ahora la latitud y la longitud del puntero junto a E y N. Definir el sistema es un paso de deshacer: {{key:Mod+Z}} lo revierte.

:::note
Las unidades deben coincidir: un proyecto en pies admite sistemas en pies de agrimensura de EE. UU. o en pies internacionales; un proyecto en metros admite sistemas en metros. CivilCraft explica un rechazo («El proyecto está en pies, pero este sistema está en metros…»). Un proyecto en pies con un sistema de pie de agrimensura de EE. UU. usa pies de agrimensura: el «ft» del proyecto significa el pie del sistema. Los sistemas geográficos (latitud y longitud, como el propio WGS 84) no pueden ser el sistema de un proyecto: los dibujos necesitan coordenadas este y norte.
:::

## Cambiar o quitar el sistema

Abra {{ui:Coordenadas}} de nuevo, elija otro sistema y pulse {{ui:Aplicar}}. Cuando el proyecto tiene puntos o un diseño, CivilCraft pregunta **¿Ya están las coordenadas en …?**

- {{ui:Sí, nada se mueve}}: los números se quedan como están y solo cambia su significado. Úselo cuando el sistema anterior se eligió por error.
- {{ui:No, convertirlas}}: cada punto topográfico, línea de ruptura, límite, PI de alineación, esquina de plataforma y estructura se convierte del sistema anterior al nuevo, en un solo paso de deshacer. Una superficie leída de LandXML como triángulos no puede convertirse; reconstrúyala primero a partir de los puntos.

{{ui:Quitar el sistema}} elimina el sistema (nada se mueve). Las capas GIS que ya están en el proyecto se quedan donde están.

## Latitud y longitud en la barra de estado

Mientras el proyecto tenga un sistema, la barra de estado muestra la latitud y la longitud del puntero en WGS 84, por ejemplo `30°18′00.00″ N  97°42′00.00″ W`. Para elegir grados decimales, vaya a {{ui:Configuración}}, {{ui:CivilCraft}}, **Latitud y longitud** ([Configuración de CivilCraft](topic:settings)). Con coordenadas de terreno o locales, la lectura pasa antes por ese paso, así que es correcta para el punto bajo el puntero.

## Calidad del desplazamiento de datum

La latitud, la longitud, GeoJSON y las capas de mapa están todos en WGS 84. El vínculo de cada sistema con WGS 84 se muestra en el cuadro de diálogo:

| Lo que indica el cuadro de diálogo | Qué significa |
|---|---|
| WGS 84 en sí | Ningún desplazamiento. |
| NAD83 se toma como WGS 84 | Ambos difieren en uno o dos metros en la mayor parte de Norteamérica, como mucho unos metros. Bueno para capas de mapa y contexto del emplazamiento; no para la red de control topográfico. |
| Conocido a unos *n* m (cifra de EPSG) | Un desplazamiento publicado; las capas de mapa y GeoJSON pueden desviarse unos esos *n* m. |
| No conocido para este datum | No hay desplazamiento publicado sin un archivo de malla: las capas de mapa y GeoJSON pueden desviarse cientos de metros. |
| Del archivo de desplazamiento de malla … | Hay un archivo de desplazamiento de malla en uso (véase abajo): dentro de unos 10 cm de NAD83 dentro de la malla. |

Las coordenadas propias de su proyecto nunca pasan por un desplazamiento de datum: solo lo que se convierte a o desde latitud y longitud. Los datums verticales y los modelos de geoide no se tratan (las cotas nunca se convierten). Cuando el mejor desplazamiento necesita un archivo de malla, la lista trae un desplazamiento publicado más aproximado y el cuadro de diálogo muestra su precisión (los sistemas NAD27, por ejemplo, unos 20 m), hasta que añada la malla.

## Archivos de desplazamiento de malla

Para un sistema NAD27, **Archivo de desplazamiento de malla** en el cuadro de diálogo del sistema de coordenadas sitúa la latitud y la longitud, los archivos GIS y las capas de mapa a unos 10 cm de NAD83 en lugar de a unos 20 m:

- **Descargar** la malla que sugiere para la zona del sistema (NADCON5 para los Estados Unidos contiguos, NADCON para Alaska, NTv2 para Canadá) desde cdn.proj.org, el servidor público de mallas de PROJ. Solo se envía el nombre del archivo de la malla.
- O **Añadir un archivo de malla…** si ya lo tiene: NTv2 (`.gsb`) o una malla PROJ GeoTIFF (`.tif`), de hasta 20 MB.

La malla se guarda en el archivo del proyecto, así que viaja con él. La sección indica si el centro del proyecto está dentro de la malla: fuera de ella no se aplica ningún desplazamiento, así que use una malla que cubra el emplazamiento. **Dejar de usar la malla** vuelve al desplazamiento aproximado. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

Las capas GIS ya presentes en el proyecto se quedan donde están cuando cambia la malla; impórtelas de nuevo para situarlas a través de ella. Las coordenadas propias del proyecto nunca se mueven.

## Qué se ha comprobado

- Cada conversión se comparó con PROJ (pyproj 3.7.1 con PROJ 9.5.1), la biblioteca de coordenadas que usan la mayoría de programas GIS, en más de 330 sistemas: plano estatal en pies de agrimensura de EE. UU. y en pies, UTM norte y sur, Lambert-93, British National Grid, GDA2020 MGA, Transversa de Mercator de Nueva Zelanda y Mercator web, entre otros. Las coordenadas este y norte coinciden en 1 cm con el mismo desplazamiento de datum (la mayoría muy por debajo de 1 mm), y las matemáticas de proyección coinciden con las definiciones propias de PROJ en 1 cm.
- Se leyeron de nuevo archivos `.prj` escritos por PROJ en sus dos formas habituales (ESRI y OGC) para 105 sistemas: 208 de los 210 coincidieron con su código EPSG exacto, y los otros dos con un sistema de las mismas matemáticas sobre el mismo elipsoide. Los archivos `.prj` que escribe CivilCraft los lee PROJ como el mismo sistema. Los archivos `.prj` ESRI de sistemas estereográficos polares (UPS, polar de Alaska) no se pueden leer; elija esos sistemas por código.
- La latitud y la longitud de la barra de estado coincidieron con PROJ a 0.01″ en el navegador.
