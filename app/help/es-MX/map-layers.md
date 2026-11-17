---
title: Mostrar capas de mapa bajo el plano
summary: Coloque una imagen georreferenciada, teselas de mapa, un servidor WMS o WMTS o un servicio de mapas bajo el plano como contexto del sitio, con la configuración de internet, la opacidad, el orden y la atribución.
keywords: capas de mapa, mapa base, mapa de fondo, fondo, foto aérea, ortofoto, imágenes, satélite, ráster, archivo de mundo, pgw, jgw, tfw, wld, geotiff, imagen georreferenciada, xyz, teselas, mapa en teselas, wms, wmts, getcapabilities, servicio de mapas, rest, mapserver, imageserver, usgs, national map, atribución, opacidad
from: 32d7718e
---

Las capas de mapa son imágenes que se dibujan bajo su diseño: una foto aérea con su archivo de mundo, o mapas de servidores en internet. Son contexto del sitio solo en pantalla: **no** están en los trazados PDF, en las exportaciones DXF o DWG, ni en la vista 3D.

Elija {{ui:Mapa}} en el grupo {{ui:SIG}}. El cuadro de diálogo **Capas de mapa** enumera las capas del proyecto y agrega nuevas. Las capas de mapa necesitan el sistema de coordenadas del proyecto ([Defina el sistema de coordenadas del proyecto](topic:coordinate-systems)), excepto una imagen cuyo archivo de mundo usa las coordenadas propias del proyecto.

## La configuración de internet

CivilCraft nunca pide nada a un servidor de mapas hasta que usted lo permita: {{ui:Configuración}}, {{ui:CivilCraft}}, **Capas de mapa desde internet**: **Desactivado** (al inicio) o **Activado**.

:::note
Cuando está activado, CivilCraft pide a los servidores de mapas que agregue imágenes del área en pantalla. Su dibujo se queda en esta computadora; el servidor ve el área y su dirección de internet.
:::

Mientras está desactivado, las capas de internet aparecen listadas en el cuadro de diálogo pero en gris, con el motivo, y no se dibuja ni se pide nada. Abrir un proyecto que nombra servidores de mapas tampoco los contacta. Una imagen desde un archivo funciona de cualquier forma. El botón {{ui:Abrir Configuración}} del cuadro de diálogo le lleva allí.

## Una imagen georreferenciada (funciona sin conexión)

1. En **Agregar una capa**, mantenga **Imagen georreferenciada** y elija los archivos: la imagen (PNG o JPEG) **junto con** su archivo de mundo (`.pgw` para PNG, `.jgw` para JPEG, o `.wld`) y, si existe, su `.prj`. También puede soltarlos juntos sobre el plano.
2. Sin `.prj`, CivilCraft pregunta qué sistema usa el archivo de mundo: {{ui:El sistema del proyecto}} (lo más común), {{ui:Elegir un sistema…}}, o, en un proyecto sin sistema, **Coordenadas del proyecto**.
3. La imagen aparece bajo el plano y {{ui:Ajustar}} la incluye.

Un GeoTIFF RGB (una foto aérea guardada como GeoTIFF) lleva su propia ubicación y sistema: ábralo por sí solo. La imagen se conserva **dentro del archivo del proyecto** (hasta 25 MB); una más grande se rechaza con su tamaño, así que guarde una copia más pequeña (menos píxeles, o JPEG).

## Teselas, WMS, WMTS y servicios de mapas

Active primero **Capas de mapa desde internet**. Luego, en **Agregar una capa**:

| Desde | Qué pegar | Qué hace CivilCraft |
|---|---|---|
| URL de teselas | Una plantilla con `{z}`, `{x}` e `{y}` (o `{-y}`), y `{s}` para una letra de servidor, por ejemplo `https://tile.example.org/{z}/{x}/{y}.png`. Dé un nombre y su atribución. | Teselas en web Mercator para el área y el zoom en pantalla. |
| Servidor WMS | La dirección del servidor, o su enlace GetCapabilities. Elija {{ui:Obtener las capas}} y después la capa. | Una imagen del área en pantalla, pedida con el código EPSG del proyecto cuando el servidor lo ofrece; si no, en web Mercator o WGS 84. |
| Servidor WMTS | La dirección del servidor, o su `WMTSCapabilities.xml`. Elija {{ui:Obtener las capas}}, luego la capa y el conjunto de matrices de teselas. | Teselas del conjunto en el sistema del proyecto cuando hay uno; si no, web Mercator. |
| Servicio de mapas de ArcGIS (REST) | Una URL que termina en `/MapServer` o `/ImageServer`. Elija {{ui:Leer el servicio}}. | Los servicios en web Mercator con caché se dibujan desde sus teselas; los demás piden una imagen del área en pantalla. |

Ningún servidor viene preestablecido. Ejemplos públicos, todos del USGS National Map (dominio público):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Servicio de mapas: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (también `USGSImageryOnly` para fotos aéreas)

Muchos departamentos de SIG de ciudades y condados publican sus propios WMS o servicios de mapas; sus páginas de SIG dan la dirección. Un servidor que pide inicio de sesión o una clave no funciona: CivilCraft no envía nombres de usuario, contraseñas ni claves.

## Cómo se dibujan las capas

- Las imágenes en un sistema distinto al del proyecto se reproyectan a él: la imagen se corta en piezas, cada una colocada para quedar a menos de un cuarto de píxel de pantalla de donde la pone una conversión exacta.
- Las teselas se eligen para el área en pantalla y el zoom: nunca más de 64 por vista, de 6 en 6. Al desplazarse o hacer zoom, se cancelan las peticiones de la vista anterior. Se conservan unas 200 teselas en memoria (nada se guarda en disco).
- Una imagen de WMS o de servicio de mapas se pide cuando la vista deja de moverse; hasta que llega, la anterior se queda en su lugar.
- La atribución de cada capa en pantalla aparece en pequeño, en la esquina inferior derecha del plano.

## Cambiar, ordenar y quitar capas

En el cuadro de diálogo, cada capa tiene una casilla para mostrarla u ocultarla, un control deslizante de **Opacidad**, flechas para dibujarla antes (más abajo) o después (encima), un botón de zoom (para imágenes) y un botón para quitarla. La primera capa de la lista se dibuja abajo. Cada cambio es un paso de deshacer.

## Cuando una capa no muestra nada

El motivo aparece una vez en la barra de estado y se queda debajo del nombre de la capa en el cuadro de diálogo:

| Mensaje | Qué hacer |
|---|---|
| Desactivado: las capas de mapa desde internet están desactivadas en Configuración. | Active **Capas de mapa desde internet**. |
| Necesita el sistema de coordenadas del proyecto | Defínalo en {{ui:Coordenadas}}. |
| El servidor no permitió que esta página usara sus imágenes (CORS), o no se pudo contactar. | El servidor no deja que las páginas web usen sus imágenes, o está caído. Después de cuatro negativas, CivilCraft deja de pedir; oculte y muestre la capa para intentar de nuevo. |
| El servidor respondió 404 … / El servidor envió text/xml, no una imagen: … | La URL, la capa o el estilo son incorrectos, o el mensaje del servidor indica lo que necesita. |
| Esta capa no se ofrece en el sistema del proyecto, en web Mercator ni en WGS 84 | El servidor no puede dibujar donde CivilCraft puede colocarla. |

## Qué se revisó

- Los números de teselas se revisaron contra el mosaico web Mercator estándar. Las respuestas de WMS 1.1.1 y 1.3.0, WMTS y servicio de mapas se leyeron de archivos escritos a mano y de respuestas reales guardadas de los servidores del USGS National Map y de OpenStreetMap de terrestris. Las peticiones WMS 1.3.0 ponen la latitud primero para EPSG:4326, como indica el estándar.
- La reproyección se comparó con una conversión exacta píxel por píxel con los números de PROJ: dentro de 0.13 px para teselas, imágenes WMS y una imagen del tamaño de un condado, a escala de sitio y alejada.
- Una imagen con su archivo de mundo y un GeoTIFF RGB escrito por GDAL (mediante rasterio) se dibujaron donde indica su ubicación, verificado píxel por píxel en el navegador.
- En el navegador, contra un servidor sustituto en la computadora de prueba: las teselas caen en la tesela donde PROJ ubica cada punto, una imagen WMS cae a 2 px, a lo sumo 6 peticiones se ejecutan a la vez, y con la configuración desactivada ninguna petición sale de la página. El servicio de mapas del USGS National Map descrito arriba también se leyó y dibujó en vivo en el navegador una vez (sus teselas llegaron y se dibujaron, con su texto de derechos de autor); los otros servidores públicos se leyeron solo desde respuestas guardadas.
