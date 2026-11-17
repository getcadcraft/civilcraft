---
title: Mostrar capas de mapa debajo del plano
summary: Poné una imagen georreferenciada, teselas de mapa, un servidor WMS o WMTS o un servicio de mapas debajo del plano como contexto del sitio, con la configuración de internet, opacidad, orden y atribución.
keywords: capas de mapa, mapa base, fondo, aérea, ortofoto, imágenes, satélite, ráster, archivo mundial, pgw, jgw, tfw, wld, geotiff, imagen georreferenciada, xyz, teselas, mapa slippy, wms, wmts, getcapabilities, servicio de mapas, rest, mapserver, imageserver, usgs, national map, atribución, opacidad
from: 32d7718e
---

Las capas de mapa son imágenes dibujadas debajo de tu diseño: una foto aérea con su archivo mundial, o mapas de servidores en internet. Son solo contexto del sitio en pantalla: **no** están en las impresiones PDF, las exportaciones DXF o DWG, ni en la vista 3D.

Elegí {{ui:Map}} en el grupo {{ui:GIS}}. El diálogo **Capas de mapa** lista las capas del proyecto y agrega nuevas. Las capas de mapa necesitan el sistema de coordenadas del proyecto ([Fijar el sistema de coordenadas del proyecto](topic:coordinate-systems)), excepto una imagen cuyo archivo mundial usa las propias coordenadas del proyecto.

## La configuración de internet

CivilCraft nunca le pide nada a un servidor de mapas hasta que lo permitas: {{ui:Settings}}, {{ui:CivilCraft}}, **Capas de mapa desde internet**: **Apagado** (el inicio) o **Encendido**.

:::note
Cuando está encendido, CivilCraft les pide a los servidores de mapas que agregaste imágenes del área en pantalla. Tu dibujo se queda en esta computadora; el servidor ve el área y tu dirección de internet.
:::

Mientras está apagado, las capas de internet aparecen listadas en el diálogo pero en gris, con el motivo, y no se dibuja ni se pide nada. Abrir un proyecto que nombra servidores de mapas tampoco los contacta. Una imagen desde un archivo funciona de cualquier forma. El botón {{ui:Open Settings}} del diálogo te lleva allí.

## Una imagen georreferenciada (funciona sin conexión)

1. En **Agregar una capa**, dejá **Imagen georreferenciada** y elegí los archivos: la imagen (PNG o JPEG) **junto con** su archivo mundial (`.pgw` para PNG, `.jgw` para JPEG, o `.wld`) y, si hay uno, su `.prj`. También podés soltarlos juntos sobre el plano.
2. Sin un `.prj`, CivilCraft pregunta qué sistema usa el archivo mundial: {{ui:The project’s system}} (lo más común), {{ui:Pick a system…}}, o, en un proyecto sin sistema, **Coordenadas del proyecto**.
3. La imagen aparece debajo del plano y {{ui:Fit}} la incluye.

Un GeoTIFF RGB (una foto aérea guardada como GeoTIFF) trae su propia ubicación y sistema: abrilo solo. La imagen se guarda **dentro del archivo del proyecto** (hasta 25 MB); una más grande se rechaza con su tamaño, así que guardá una copia más chica (menos píxeles, o JPEG).

## Teselas, WMS, WMTS y servicios de mapas

Encendé primero **Capas de mapa desde internet**. Después, en **Agregar una capa**:

| Desde | Qué pegar | Qué hace CivilCraft |
|---|---|---|
| URL de teselas | Una plantilla con `{z}`, `{x}` e `{y}` (o `{-y}`), y `{s}` para la letra de un servidor, por ejemplo `https://tile.example.org/{z}/{x}/{y}.png`. Ponele un nombre y su atribución. | Teselas en Mercator web para el área y el zoom en pantalla. |
| Servidor WMS | La dirección del servidor, o su enlace GetCapabilities. Elegí {{ui:Get the layers}}, después la capa. | Una imagen del área en pantalla, pedida en el código EPSG del proyecto cuando el servidor lo ofrece; si no, en Mercator web o WGS 84. |
| Servidor WMTS | La dirección del servidor, o su `WMTSCapabilities.xml`. Elegí {{ui:Get the layers}}, después la capa y el conjunto de matriz de teselas. | Teselas del conjunto en el sistema del proyecto cuando hay uno; si no, Mercator web. |
| Servicio de mapas ArcGIS (REST) | Una URL que termina en `/MapServer` o `/ImageServer`. Elegí {{ui:Read the service}}. | Los servicios en Mercator web con caché se dibujan desde sus teselas; los demás piden una imagen del área en pantalla. |

Ningún servidor viene preconfigurado. Ejemplos públicos, todos del USGS National Map (dominio público):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Servicio de mapas: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (también `USGSImageryOnly` para fotos aéreas)

Muchos departamentos de GIS de ciudades y condados publican sus propios WMS o servicios de mapas; sus páginas de GIS dan la dirección. Un servidor que pide inicio de sesión o una clave no funciona: CivilCraft no envía nombres de usuario, contraseñas ni claves.

## Cómo se dibujan las capas

- Las imágenes en otro sistema que el del proyecto se deforman para entrar en él: la imagen se corta en piezas, cada una ubicada para quedar dentro de un cuarto de píxel de pantalla de donde la pondría una conversión exacta.
- Las teselas se eligen para el área en pantalla y el zoom: nunca más de 64 por vista, de a 6 a la vez. Cuando te desplazás o hacés zoom, los pedidos de la vista anterior se cancelan. Unas 200 teselas se guardan en memoria (nada se guarda en disco).
- Una imagen de WMS o de servicio de mapas se pide cuando la vista deja de moverse; hasta que llega, la anterior queda en su lugar.
- La atribución de cada capa en pantalla aparece chica en la esquina inferior derecha del plano.

## Cambiar, ordenar y quitar capas

En el diálogo, cada capa tiene una casilla para mostrarla u ocultarla, un control deslizante de **Opacidad**, flechas para dibujarla antes (más abajo) o después (encima), un botón de zoom (para imágenes) y un botón para quitarla. La primera capa de la lista se dibuja al fondo. Cada cambio es un paso de deshacer.

## Cuando una capa no muestra nada

El motivo aparece una vez en la línea de estado y queda debajo del nombre de la capa en el diálogo:

| Mensaje | Qué hacer |
|---|---|
| Off: map layers from the internet are off in Settings. | Encendé **Capas de mapa desde internet**. |
| Needs the project's coordinate system | Fijalo en {{ui:Coordinates}}. |
| The server did not allow this page to use its images (CORS), or could not be reached. | El servidor no deja que las páginas web usen sus imágenes, o está caído. Después de cuatro rechazos, CivilCraft deja de pedir; ocultá y mostrá la capa para intentar de nuevo. |
| The server answered 404 … / The server sent text/xml, not an image: … | La URL, la capa o el estilo están mal, o el mensaje del servidor dice lo que quiere. |
| This layer is not offered in the project's system, web Mercator or WGS 84 | El servidor no puede dibujar donde CivilCraft puede ubicarla. |

## Lo que se verificó

- Los números de teselas se verificaron contra la división estándar de Mercator web; las respuestas de WMS 1.1.1 y 1.3.0, WMTS y servicios de mapas se leyeron de archivos escritos a mano y de respuestas reales guardadas de los servidores USGS National Map y terrestris OpenStreetMap; los pedidos WMS 1.3.0 ponen la latitud primero para EPSG:4326, como indica el estándar.
- La deformación se comparó con una conversión exacta píxel por píxel usando los números de PROJ: dentro de 0,13 px para teselas, imágenes WMS y una imagen del tamaño de un condado, a escala de sitio y alejada.
- Una imagen con su archivo mundial y un GeoTIFF RGB escrito por GDAL (a través de rasterio) se dibujaron donde indica su ubicación, verificados píxel por píxel en el navegador.
- En el navegador, contra un servidor de prueba en la computadora de pruebas: las teselas caen en la tesela donde PROJ ubica cada punto, una imagen WMS cae a 2 px, como máximo 6 pedidos corren a la vez, y con la configuración apagada ninguna solicitud sale de la página. El servicio de mapas del USGS National Map mencionado arriba también se leyó y dibujó en vivo en el navegador una vez (sus teselas llegaron y se dibujaron, con su texto de copyright); los otros servidores públicos se leyeron solo desde respuestas guardadas.
