---
title: Cuadrículas de elevación e LiDAR
summary: Construír o terreo existente a partir dun DEM (GeoTIFF ou cuadrícula ASCII) ou de puntos LiDAR (LAS, LAZ): escolla a área, reduza os datos, escolla as clases e comprobe as unidades de cota, e devolva unha superficie como cuadrícula de elevación GeoTIFF.
keywords: dem, dtm, cuadrícula de elevación, geotiff, tif, cuadrícula ascii, asc, lidar, las, laz, nube de puntos, clases, terreo, reducción, nodata, raster, exportar geotiff, gis
from: c8b2d18a
---

Os datos públicos de elevación chegan de dúas formas: **cuadrículas de elevación** (un DEM: unha cota por cela cadrada, normalmente un `.tif` GeoTIFF ou unha cuadrícula ASCII `.asc`) e **puntos LiDAR** (millóns de retornos láser nun ficheiro `.las`, ou `.laz` cando está comprimido). CivilCraft converte calquera dos dous en puntos de levantamento ou nunha superficie, dentro do navegador: non se envía nada.

## Abrir o ficheiro

1. Prema {{ui:Abrir}} (ou {{ui:Importar}} no grupo GIS) e escolla o ficheiro, ou arrástreo ao plano. Para unha cuadrícula ASCII, escolla tamén o seu ficheiro `.prj`, para que CivilCraft coñeza o seu sistema de coordenadas.
2. O diálogo de importación mostra o que o ficheiro di sobre si mesmo: o seu tamaño, celas ou puntos, o seu sistema de coordenadas, onde está en latitude e lonxitude, e o seu rango de cotas. Para LiDAR lé primeiro cada punto unha vez para contar as **clases** (unha barra de progreso indica o avance; {{ui:Cancelar}} detén o proceso).

Un GeoTIFF con tres ou catro bandas (vermello, verde, azul) é unha imaxe, non cotas: vai ás capas de mapa.

## Escoller o que se trae

- **Área**: {{ui:A extensión do proxecto e unha marxe}} (escriba a marxe), {{ui:O que mostra agora o plano}}, ou {{ui:Todo o ficheiro}}. Só se lé esa parte do ficheiro.
- **Reducir a**: a separación entre os puntos que obtén, nas unidades do proxecto. A liña baixo os axustes mostra cantos puntos dan ao escribir. Para unha cuadrícula, CivilCraft conserva cada segunda, terceira… cela, así que as cotas quedan exactamente as do ficheiro; nunca promedia celas. Para LiDAR, a área córtase en cadrados desse tamaño e consérvase un punto por cadrado: {{ui:O punto máis próximo ao centro de cada cela}} (o predeterminado), {{ui:O punto máis baixo de cada cela}} (útil cando o ficheiro non ten clase de terreo: o terreo está baixo as árbores) ou {{ui:A media dos puntos de cada cela}}.
- **Clases** (LiDAR): o terreo (clase 2) márcase cando o ficheiro o ten; edificios, árbores e ruído déixanse fóra. Cando non hai clase de terreo, márcanse todas as clases, e o diálogo dío.
- **Terreo** (LiDAR, 0.8): unha nube de drone non ten clase de terreo. Cando o ficheiro non a ten, o diálogo comeza en {{ui:Atopar o terreo eu mesmo (nubes de drone, sen clase de terreo)}}: lense todas as clases excepto o ruído, consérvase o punto máis baixo de cada cela e logo CivilCraft quita edificios, árbores e puntos baixos espurios cun filtro morfolóxico progresivo (Zhang e outros, 2003) que pode axustar: **Maior obxecto a quitar** (a largura do edificio máis grande; as xanelas crecen ata cubrilo; 0 significa 20 celas) e **Pendente máxima do terreo**. O traballo fanse sobre a cuadrícula de puntos máis baixos, así que unha nube de decenas de millóns de puntos non custa máis que o seu número de celas (a reducción é unha pasada en fluxo). O espazamento é a cela: unha máis grande é máis rápida e perde menos obxectos pequenos do que se cre; unha máis fina conserva máis detalle do terreo. O informe indica cantos puntos se conservaron como terreo, cantas celas se quitaron como obxectos e cantos puntos baixos espurios se descartaron. Nun levantamento de drone simulado de 300 m con cinco edificios, 70 árbores e 200 valores atípicos baixos, os puntos conservados estaban a menos de 3 cm do terreo real e non se conservou ningunha cuberta nin copa.
- **Cotas no ficheiro**: metros, pés ou pés topográficos dos EUA. Cando o ficheiro o indica, a súa unidade xa está escollida. Cando non, debe escoller: o diálogo mostra o rango de cotas en ambos sentidos para que vexa cal ten sentido para o lugar.
- **Importar como** (só cuadrículas): {{ui:Puntos de levantamento (DEM de descrición)}}, ou {{ui:A propia superficie (unha rede de triángulos)}}.

Unha importación toma como máximo 500.000 puntos. Cando unha opción daría máis, o diálogo di en cantos se pasa e que espazamento encaixaría, e {{ui:Importar}} queda desactivado.

Prema {{ui:Importar}}. Unha barra de progreso mostra a lectura; {{ui:Cancelar}} detén o proceso e non cambia nada.

:::warning
As unidades verticais son unha trampa frecuente. Moitos DEM en state plane teñen estes e norte en pés pero cotas en metros. Compare o rango que mostra o diálogo co que coñece do lugar.
:::

## Que obtén

- **Puntos de levantamento**: numerados a partir do seu número de punto máis alto, coa descrición `DEM` (cuadrículas) ou `LIDAR`, así forman un grupo de puntos baixo **Puntos** e constrúen a superficie como calquera outro punto. Importalos é un paso: {{key:Mod+Z}} vólveos quitar.
- **A propia superficie**: unha TIN de cuadrícula, dous triángulos por cela, dividida pola diagonal suroeste–nordeste. Un triángulo cun vértice sen datos déixase fóra, así os ocos nos datos seguen sendo ocos. A superficie iguala a cuadrícula en cada punto da cuadrícula e é un plano liso dentro de cada triángulo entre eles. Substitúe a superficie do proxecto (o diálogo pregunta antes); {{key:Mod+Z}} devolve a superficie anterior. O título do panel esquerdo di **Superficie (desde unha cuadrícula de elevación)**.

## Sistemas de coordenadas

- Se o proxecto ten sistema de coordenadas e o ficheiro indica outro, cada punto convértese ao sistema do proxecto (e ás súas coordenadas de terreo ou locais cando as ten).
- Se o proxecto non ten ningún e o sistema do ficheiro está nas unidades do proxecto (pés ou metros), o diálogo ofrece facelo sistema de coordenadas do proxecto, no mesmo paso de desfacer que os puntos.
- Se o ficheiro está en latitude e lonxitude, ou en metros para un proxecto en pés, o diálogo pide que escolla primeiro o sistema de coordenadas do proxecto.
- Se o ficheiro non o indica, os seus números tómanse como coordenadas do proxecto. Pode escoller o sistema do ficheiro.

## Exportar unha superficie como GeoTIFF

1. Prema {{ui:Exportar}} no grupo GIS.
2. Na parte GeoTIFF escolla a superficie (terreo existente ou a superficie niveleada) e o tamaño da cela. O predeterminado vén do borde triangular medio da superficie. O diálogo mostra o tamaño da cuadrícula que escribirá.
3. Prema {{ui:Descargar GeoTIFF}}.

O ficheiro é unha banda de cotas de coma flotante de 32 bits nas unidades do proxecto, sobre a extensión da superficie; as celas fóra da superficie son "sen datos" (−3.4028235e38). O valor de cada cela é a cota da superficie no centro da cela. As coordenadas son **de cuadrícula**: un proxecto en coordenadas de terreo ou locais convértese de novo á cuadrícula. O ficheiro indica o sistema de coordenadas do proxecto polo seu código EPSG; un sistema sen código EPSG non se escribe, e o diálogo avisa para que diga ao departamento GIS qué sistema é.

## Comprobación

- Os lectores de GeoTIFF e cuadrícula ASCII comprobáronse contra GDAL (a través de rasterio), a biblioteca que usan a maioría dos programas GIS para ler estes ficheiros: cuadrículas de coma flotante de 32 bits e enteiros de 16 bits, en mosaico e en franxas, DEFLATE e LZW, nodata, escala e desprazamento, píxel-é-punto, unha cuadrícula UTM, unha cuadrícula state plane en pés topográficos dos EUA e unha cuadrícula de latitude/lonxitude — todos os valores iguais.
- Os lectores LAS e LAZ comprobáronse contra laspy: LAS 1.2 e 1.4, formatos de punto 0, 1, 3, 6, 7 e 8, con e sen sistema de coordenadas, e LAZ escrito polo seu backend compatible con LASzip — todos os puntos iguais.
- As coordenadas convertidas comprobáronse contra PROJ ata 1 mm.
- Os GeoTIFF exportados foron lidos de novo por GDAL: sistema de coordenadas, posicións das celas, nodata, unidades e valores iguais á superficie ata 0,0001.
- Nada disto se abriu noutros programas GIS ou CAD.

## Non construído aínda

- Cambios de datum vertical (modelos de xeoide): as cotas úsanse tal como as ten o ficheiro.
- Datos de forma de onda, retornos LiDAR que non sexan por clase, cores e intensidades.
- Varias bandas, vistas xerais ou ficheiros de máis de 200 MB.
- Escribir LAS ou LAZ desde unha superficie ou desde esta ferramenta (o complemento [Nubes de puntos](topic:point-clouds) escribe unha nube limpa como LAS 1.4 ou LAZ).
