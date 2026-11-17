---
title: Mostrar capas de mapa baixo o plano
summary: Poña unha imaxe xeorreferenciada, teselas de mapa, un servidor WMS ou WMTS ou un servizo de mapas baixo o plano como contexto do lugar, coa opción de internet, a opacidade, a orde e a atribución.
keywords: capas de mapa, mapa base, fondo, aérea, ortofoto, imaxe, satélite, ráster, ficheiro world, pgw, jgw, tfw, wld, geotiff, imaxe xeorreferenciada, xyz, teselas, slippy map, wms, wmts, getcapabilities, servizo de mapas, rest, mapserver, imageserver, usgs, national map, atribución, opacidade
from: 32d7718e
---

As capas de mapa son imaxes debuxadas baixo o seu deseño: unha foto aérea co seu ficheiro world, ou mapas de servidores en internet. Son só contexto do lugar na pantalla: **non** entran nos trazados PDF, nas exportacións DXF ou DWG, nin na vista 3D.

Escolla {{ui:Map}} no grupo {{ui:GIS}}. O diálogo **Capas de mapa** lista as capas do proxecto e engade novas. As capas de mapa precisan o sistema de coordenadas do proxecto ([Estableza o sistema de coordenadas do proxecto](topic:coordinate-systems)), salvo unha imaxe cuxo ficheiro world usa as coordenadas propias do proxecto.

## A opción de internet

CivilCraft nunca pide nada a un servidor de mapas ata que o permita: {{ui:Settings}}, {{ui:CivilCraft}}, **Capas de mapa desde internet**: **Desactivado** (o inicio) ou **Activado**.

:::note
Cando está activado, CivilCraft pide aos servidores de mapas que engada que hai na pantalla imaxes da zona. O seu debuxo permanece neste computador; o servidor ve a zona e o seu enderezo de internet.
:::

Mentres está desactivado, as capas de internet aparecen no diálogo pero en gris, co motivo, e non se debuxa nada nin se pide nada. Abrir un proxecto que nomea servidores de mapas tampouco os contacta. Unha imaxe dun ficheiro funciona de todos os xeitos. O botón {{ui:Open Settings}} do diálogo leva ata alí.

## Unha imaxe xeorreferenciada (funciona sen conexión)

1. En **Engadir unha capa**, manteña **Imaxe xeorreferenciada** e escolla os ficheiros: a imaxe (PNG ou JPEG) **xunto con** o seu ficheiro world (`.pgw` para PNG, `.jgw` para JPEG, ou `.wld`) e, se o hai, o seu `.prj`. Tamén pode solteos sobre o plano xuntos.
2. Sen `.prj`, CivilCraft pregunta que sistema usa o ficheiro world: {{ui:The project’s system}} (o máis común), {{ui:Pick a system…}}, ou, nun proxecto sen sistema, **Coordenadas do proxecto**.
3. A imaxe aparece baixo o plano e {{ui:Fit}} a inclúe.

Un GeoTIFF RGB (unha foto aérea gardada como GeoTIFF) leva a súa propia colocación e o seu sistema: ábraao por si só. A imaxe consérvase **dentro do ficheiro do proxecto** (ata 25 MB); unha máis grande recházase co seu tamaño, así que garde unha copia máis pequena (con menos píxeles, ou en JPEG).

## Teselas, WMS, WMTS e servizos de mapas

Active primeiro **Capas de mapa desde internet**. Despois, en **Engadir unha capa**:

| Desde | Que pegar | Que fai CivilCraft |
|---|---|---|
| Enderezo de teselas | Un modelo con `{z}`, `{x}` e `{y}` (ou `{-y}`), e `{s}` para unha letra de servidor, por exemplo `https://tile.example.org/{z}/{x}/{y}.png`. Dálle un nome e a súa atribución. | Teselas en Web Mercator para a zona e o zoom da pantalla. |
| Servidor WMS | O enderezo do servidor, ou a súa ligazón GetCapabilities. Escolla {{ui:Get the layers}}, despois a capa. | Unha imaxe da zona da pantalla, pedida co código EPSG do proxecto cando o servidor o ofrece; se non, en Web Mercator ou WGS 84. |
| Servidor WMTS | O enderezo do servidor, ou o seu `WMTSCapabilities.xml`. Escolla {{ui:Get the layers}}, despois a capa e o conxunto de matrices de teselas. | Teselas do conxunto no sistema do proxecto cando o hai; se non, Web Mercator. |
| Servizo de mapas ArcGIS (REST) | Un URL que remate en `/MapServer` ou `/ImageServer`. Escolla {{ui:Read the service}}. | Os servizos en Web Mercator con caché debúxanse desde as súas teselas; os demais piden unha imaxe da zona da pantalla. |

Non vén preconfigurado ningún servidor. Exemplos públicos, todos do USGS National Map (dominio público):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Servizo de mapas: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (tamén `USGSImageryOnly` para fotos aéreas)

Moitos departamentos de SIG de cidades e concellos publican os seus propios servizos WMS ou de mapas; as súas páxinas de SIG dan o enderezo. Un servidor que pide un inicio de sesión ou unha clave non funciona: CivilCraft non envía nomes de usuario, contrasinais nin claves.

## Como se debuxan as capas

- As imaxes noutro sistema distinto ao do proxecto deformanse ata el: a imaxe córtase en anacos, cada un colocado de xeito que quede a menos dun cuarto de píxel de pantalla de onde o pon unha conversión exacta.
- As teselas escóllense para a zona da pantalla e o zoom: nunca máis de 64 por vista, 6 á vez. Ao desprazar ou facer zoom, cancélanse as peticións da vista anterior. Mantéñense en memoria uns 200 teselas (non se garda nada en disco).
- Unha imaxe WMS ou de servizo de mapas pídese cando a vista deixa de moverse; ata que chega, a anterior queda no seu sitio.
- A atribución de cada capa na pantalla aparece pequena na parte inferior dereita do plano.

## Cambiar, ordenar e eliminar capas

No diálogo cada capa ten unha caixa para mostrala ou ocultala, un control de **Opacidade**, frechas para debuxala antes (máis abaixo) ou despois (máis arriba), un botón de zoom (para as imaxes) e un botón de eliminar. A primeira capa da lista debúxase na parte inferior. Cada cambio é un paso de desfacer.

## Cando unha capa non mostra nada

O motivo aparece unha vez na liña de estado e queda baixo o nome da capa no diálogo:

| Mensaxe | Que facer |
|---|---|
| Desactivado: as capas de mapa desde internet están desactivadas en Configuración. | Active **Capas de mapa desde internet**. |
| Precisa o sistema de coordenadas do proxecto | Estableza o sistema en {{ui:Coordinates}}. |
| O servidor non permitiu que esta páxina usase as súas imaxes (CORS), ou non se puido conectar. | O servidor non deixa que as páxinas web usen as súas imaxes, ou está caído. Despois de catro rexeitamentos CivilCraft deixa de pedir; oculte e mostre a capa para probar de novo. |
| O servidor respondeu 404 … / O servidor enviou text/xml, non unha imaxe: … | O URL, a capa ou o estilo están mal, ou a mensaxe do servidor indica o que quere. |
| Esta capa non se ofrece no sistema do proxecto, en Web Mercator nin en WGS 84 | O servidor non pode debuxar onde CivilCraft a pode colocar. |

## O que se comprobou

- Os números das teselas comprobáronse contra a teselación estándar de Web Mercator; as respostas WMS 1.1.1 e 1.3.0, WMTS e servizos de mapas leronse desde ficheiros escritos a man e desde respostas reais gardadas dos servidores do USGS National Map e de terrestris OpenStreetMap; as peticións WMS 1.3.0 poñen a latitude primeiro para EPSG:4326, como indica o estándar.
- A deformación comparouse cunha conversión exacta píxel a píxel cos números de PROJ: a menos de 0,13 px para as teselas, as imaxes WMS e unha imaxe do tamaño dun condado, á escala do lugar e alonxado.
- Unha imaxe co seu ficheiro world e un GeoTIFF RGB escrito por GDAL (a través de rasterio) debuxáronse onde indica a súa colocación, comprobado píxel a píxel no navegador.
- No navegador, contra un servidor de substitución no computador de proba: as teselas caen na tesela onde PROJ pon cada punto, unha imaxe WMS cae a menos de 2 px, como máximo 6 peticións corren á vez, e con a opción desactivada ningunha petición sae da páxina. O servizo de mapas do USGS National Map indicado enriba tamén se leu e debuxou en vivo no navegador unha vez (as súas teselas chegaron e debuxáronse, co seu texto de copyright); os outros servidores públicos leronse só desde respostas gardadas.
