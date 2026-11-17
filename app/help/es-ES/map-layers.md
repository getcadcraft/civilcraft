---
title: Mostrar capas de mapa bajo la planta
summary: Coloque una imagen georreferenciada, teselas de mapa, un servidor WMS o WMTS o un servicio de mapas bajo la planta como contexto del emplazamiento, con el ajuste de internet, la opacidad, el orden y la atribución.
keywords: capas de mapa, mapa base, fondo, aérea, ortofoto, imágenes, satélite, ráster, archivo de georreferenciación, pgw, jgw, tfw, wld, geotiff, imagen georreferenciada, xyz, teselas, mapa en mosaico, wms, wmts, getcapabilities, servicio de mapas, rest, mapserver, imageserver, usgs, national map, atribución, opacidad
from: 32d7718e
---

Las capas de mapa son imágenes que se dibujan bajo su diseño: una foto aérea con su archivo de georreferenciación, o mapas de servidores de internet. Son solo contexto del emplazamiento en pantalla: **no** aparecen en las impresiones PDF, en las exportaciones DXF o DWG, ni en la vista 3D.

Elija {{ui:Map}} en el grupo {{ui:GIS}}. El cuadro de diálogo **Capas de mapa** enumera las capas del proyecto y añade nuevas. Las capas de mapa necesitan el sistema de coordenadas del proyecto ([Establecer el sistema de coordenadas del proyecto](topic:coordinate-systems)), salvo una imagen cuyo archivo de georreferenciación use las coordenadas propias del proyecto.

## El ajuste de internet

CivilCraft nunca pide nada a un servidor de mapas hasta que usted lo permite: {{ui:Settings}}, {{ui:CivilCraft}}, **Capas de mapa desde internet**: **Desactivado** (al inicio) o **Activado**.

:::note
Cuando está activado, CivilCraft pide a los servidores de mapas que añada imágenes de la zona en pantalla. Su dibujo se queda en este equipo; el servidor ve la zona y su dirección de internet.
:::

Mientras está desactivado, las capas de internet aparecen en el cuadro de diálogo pero en gris, con el motivo, y no se dibuja ni se pide nada. Abrir un proyecto que nombra servidores de mapas tampoco los contacta. Una imagen de un archivo funciona en ambos casos. El botón {{ui:Open Settings}} del cuadro de diálogo le lleva allí.

## Una imagen georreferenciada (funciona sin conexión)

1. En **Añadir una capa**, mantenga **Imagen georreferenciada** y elija los archivos: la imagen (PNG o JPEG) **junto con** su archivo de georreferenciación (`.pgw` para PNG, `.jgw` para JPEG, o `.wld`) y, si lo hay, su `.prj`. También puede soltarlos sobre la planta a la vez.
2. Sin `.prj`, CivilCraft pregunta qué sistema usa el archivo de georreferenciación: {{ui:The project’s system}} (lo más habitual), {{ui:Pick a system…}} o, en un proyecto sin sistema, **Coordenadas del proyecto**.
3. La imagen aparece bajo la planta y {{ui:Fit}} la incluye.

Un GeoTIFF RGB (una foto aérea guardada como GeoTIFF) lleva su propia colocación y sistema: ábralo por separado. La imagen se guarda **dentro del archivo de proyecto** (hasta 25 MB); una más grande se rechaza indicando su tamaño, así que guarde una copia más pequeña (menos píxeles, o JPEG).

## Teselas, WMS, WMTS y servicios de mapas

Active primero **Capas de mapa desde internet**. Después, en **Añadir una capa**:

| Desde | Qué pegar | Qué hace CivilCraft |
|---|---|---|
| URL de teselas | Una plantilla con `{z}`, `{x}` e `{y}` (o `{-y}`), y `{s}` para una letra de servidor, por ejemplo `https://tile.example.org/{z}/{x}/{y}.png`. Dele un nombre y su atribución. | Teselas en web Mercator para la zona y el zoom en pantalla. |
| Servidor WMS | La dirección del servidor, o su enlace GetCapabilities. Elija {{ui:Get the layers}} y, después, la capa. | Una imagen de la zona en pantalla, pedida en el código EPSG del proyecto cuando el servidor lo ofrece; si no, en web Mercator o WGS 84. |
| Servidor WMTS | La dirección del servidor, o su `WMTSCapabilities.xml`. Elija {{ui:Get the layers}} y, después, la capa y el conjunto de matrices de teselas. | Teselas del conjunto en el sistema del proyecto cuando lo hay; si no, web Mercator. |
| Servicio de mapas ArcGIS (REST) | Una URL que termina en `/MapServer` o `/ImageServer`. Elija {{ui:Read the service}}. | Los servicios en web Mercator con caché se dibujan desde sus teselas; los demás piden una imagen de la zona en pantalla. |

Ningún servidor viene preconfigurado. Ejemplos públicos, todos del USGS National Map (dominio público):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Servicio de mapas: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (también `USGSImageryOnly` para fotos aéreas)

Muchos departamentos de SIG de ciudades y condados publican sus propios servicios WMS o de mapas; sus páginas de SIG indican la dirección. Un servidor que pide inicio de sesión o una clave no funciona: CivilCraft no envía nombres de usuario, contraseñas ni claves.

## Cómo se dibujan las capas

- Las imágenes en un sistema distinto al del proyecto se transforman al suyo: la imagen se corta en trozos, y cada uno se coloca a menos de un cuarto de píxel de pantalla de donde lo sitúa una conversión exacta.
- Las teselas se eligen para la zona en pantalla y el zoom: nunca más de 64 por vista, 6 a la vez. Al desplazar o ampliar, las peticiones de la vista anterior se cancelan. Unas 200 teselas se mantienen en memoria (no se guarda nada en disco).
- Una imagen de WMS o de servicio de mapas se pide cuando la vista deja de moverse; hasta que llega, la anterior permanece en su sitio.
- La atribución de cada capa aparece en pantalla, en pequeño, abajo a la derecha de la planta.

## Cambiar, ordenar y quitar capas

En el cuadro de diálogo, cada capa tiene una casilla para mostrarla u ocultarla, un control deslizante **Opacidad**, flechas para dibujarla antes (más abajo) o después (encima), un botón de zoom (imágenes) y un botón de quitar. La primera capa de la lista se dibuja abajo. Cada cambio es un paso de deshacer.

## Cuando una capa no muestra nada

El motivo aparece una vez en la barra de estado y permanece bajo el nombre de la capa en el cuadro de diálogo:

| Mensaje | Qué hacer |
|---|---|
| Desactivado: las capas de mapa desde internet están desactivadas en Configuración. | Active **Capas de mapa desde internet**. |
| Necesita el sistema de coordenadas del proyecto | Defínalo en {{ui:Coordinates}}. |
| El servidor no permitió a esta página usar sus imágenes (CORS), o no se pudo conectar. | El servidor no deja que las páginas web usen sus imágenes, o está caído. Tras cuatro rechazos, CivilCraft deja de pedirlas; oculte y muestre la capa para volver a intentarlo. |
| El servidor respondió 404 … / El servidor envió text/xml, no una imagen: … | La URL, la capa o el estilo son incorrectos, o el mensaje del servidor indica lo que quiere. |
| Esta capa no se ofrece en el sistema del proyecto, en web Mercator ni en WGS 84 | El servidor no puede dibujar donde CivilCraft puede colocarla. |

## Lo que se ha comprobado

- Los números de teselas se comprobaron con el mosaico estándar de web Mercator. Las respuestas WMS 1.1.1 y 1.3.0, WMTS y de servicios de mapas se leyeron de archivos escritos a mano y de respuestas reales guardadas de los servidores del USGS National Map y de OpenStreetMap de terrestris. Las peticiones WMS 1.3.0 ponen la latitud primero para EPSG:4326, como indica el estándar.
- La transformación se comparó con una conversión exacta píxel a píxel con las cifras de PROJ: dentro de 0.13 px para teselas, imágenes WMS y una imagen del tamaño de un condado, a escala de emplazamiento y alejada.
- Una imagen con su archivo de georreferenciación y un GeoTIFF RGB escrito por GDAL (a través de rasterio) se dibujaron donde indica su colocación, comprobado píxel a píxel en el navegador.
- En el navegador, contra un servidor de prueba en el equipo de pruebas: las teselas caen en la tesela donde PROJ coloca cada punto, una imagen WMS cae a 2 px, como máximo 6 peticiones se ejecutan a la vez, y con el ajuste desactivado ninguna petición sale de la página. El servicio de mapas del USGS National Map descrito arriba también se leyó y se dibujó en vivo en el navegador una vez (sus teselas llegaron y se dibujaron, con su texto de derechos de autor); los demás servidores públicos se leyeron solo de respuestas guardadas.
