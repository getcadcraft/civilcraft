---
title: Exportar datos as-built para GIS
summary: Entregar puntos de levantamento, curvas de nivel, trazados, plataformas, tubaxes e estruturas a un departamento de GIS municipal ou comarcal en shapefile, GeoPackage, GeoJSON ou KML, en coordenadas de cuadrícula do sistema de coordenadas do proxecto.
keywords: gis, exportar, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, tubaxes, estruturas, servizos, concello, comarca, cuadrícula, terreo, epsg, prj
from: bba4fea5
---

Moitos concellos e comarcas piden datos as-built en formato GIS cando se pecha un proxecto: onde foron as tubaxes e as estruturas, as cotas finais, a liña central da estrada. **GIS › Exportar** escribe o que CivilCraft garda como capas GIS, unha por cada tipo de obxecto.

## Antes de exportar

1. Estableza o sistema de coordenadas do proxecto en {{ui:Coordenadas}}. Un departamento de GIS necesita saber onde están os números; sen sistema, os ficheiros levan os números propios do proxecto e non nomean ningún.
2. Revise a superficie, os trazados, as plataformas e a rede de tubaxes tal e como quere que se entreguen.
3. Pregunte ao departamento en que formato e en que sistema de coordenadas o queren. Moitos aínda piden shapefiles na zona de plano estatal local; os sistemas máis novos admiten GeoPackage.

## Exportar

1. Prema {{ui:Exportar}} no grupo **GIS**.
2. En **Que**, marque os tipos a enviar. Cada un amosa cantos elementos ten; os tipos sen nada aínda aparecen en gris.
3. En **Como**, escolla o formato.
4. Lea as notas sobre coordenadas e unidades, e despois prema o botón de descarga. A liña de estado indica o que se incluíu e calquera nome de campo que se acurtou.

O diálogo tamén inclúe a exportación da cuadrícula de altitudes ({{ui:Superficie como rede de altitudes GeoTIFF}}); vexa [Cuadrículas de altitudes e LiDAR](topic:elevation-grids-and-lidar).

## Que contén cada tipo

| Tipo | Forma | Campos |
|---|---|---|
| Puntos de levantamento | Puntos con cota | `P` número de punto, `N` norte, `E` este, `Z` cota, `D` descrición |
| Curvas de nivel do terreo existente e da superficie nivelada | Liñas á súa cota | `ELEV` |
| Liñas de quebra | Liñas con cotas | `NAME` |
| Límite da superficie | Polígono (o límite debuxado, se non, o bordo da superficie) | `NAME` |
| Trazados | Liñas centrais | `NAME`, `LENGTH`, `STA_START`, `STA_END` (estacións como números simples) |
| Plataformas | Polígonos á cota da plataforma | `NAME`, `ELEV`, `AREA` |
| Liñas de encontro co terreo | Liñas con cotas (plataformas e corredores) | `NAME` |
| Liñas características do corredor: eixe, bordos da calzada, arcenes | Liñas con cotas: eixe, bordos da calzada, arcenes | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Tubaxes | Liñas desde a soleira superior ata a inferior | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (porcentaxe), `LENGTH`, `NETWORK` |
| Estruturas | Puntos no bordo | `NAME`, `RIM`, `INVERT` (a soleira máis baixa de tubaxe alí), `SUMP`, `DIA`, `DIA_UNIT` |
| Cada capa GIS | Como se importou | Os seus propios campos |

As lonxitudes, as estacións e as cotas están nas unidades do proxecto (pés de topografía dos EUA ou metros). Os diámetros das tubaxes e das estruturas están en polgadas nos proxectos en pés e en milímetros nos proxectos en metros; `DIA_UNIT` indica cal.

## Os formatos

- **Shapefile**: un `.zip` cun shapefile por tipo (`.shp`, `.shx`, `.dbf`), un `.cpg` que indica que o texto é UTF-8 e un `.prj` que nomea o sistema de coordenadas. As formas con cotas escríbense como os tipos Z do shapefile. Os nomes de campo de máis de 10 caracteres acúrtanse, como esixe o formato, e a liña de estado os lista.
- **GeoPackage**: un ficheiro `.gpkg` cunha táboa por tipo, e o sistema de coordenadas gardado co seu código EPSG. Un só ficheiro en lugar de moitos, e os nomes de campo longos conservados.
- **KML** ou **KMZ** (KML comprimido): un ficheiro de latitude e lonxitude para Google Earth e mapas web, unha carpeta por tipo, cada elemento un marcador co nome tomado do campo NAME e cada campo como datos estendidos; alturas en metros (modo de altitude absoluto). Como GeoJSON, necesita o sistema de coordenadas do proxecto.
- **GeoJSON**: un ficheiro de latitude e lonxitude (o estándar GeoJSON non admite outra cousa) no que cada elemento leva unha propiedade `kind` (`pipes`, `structures`, …) para que quen recibe poida separalos. As alturas convértense a metros, como pide o estándar; seguen no seu datum vertical do proxecto (CivilCraft non ten modelo de xeoide). Un proxecto sen sistema de coordenadas non pode exportar GeoJSON, e o diálogo indica o motivo.

## Cuadrícula, non terreo

Os departamentos de GIS gardan os seus datos en coordenadas de **cuadrícula** dun sistema de coordenadas. Se o proxecto usa coordenadas de terreo ou locais (fixadas en {{ui:Coordenadas}}), cada coordenada se converte de novo a cuadrícula á saída: os números dos ficheiros difiren dos da planta polo factor de escala (e polo xiro, no caso dun sistema local). Os campos de punto `N` e `E` tamén conteñen os valores de cuadrícula. O diálogo lembrao.

:::tip
Envíe unha nota breve cos ficheiros: o sistema de coordenadas e o seu código EPSG, o datum vertical das cotas, as unidades e o que contén cada ficheiro.
:::

## Que se comprobou

- Cada ficheiro escrito foi lido de novo por GDAL, a biblioteca que usan a maioría dos programas de GIS para ler estes ficheiros: cada forma, cota e atributo, o número de elementos, e o sistema de coordenadas como código EPSG (`.prj` e GeoPackage). Os nosos propios lectores os len igual.
- Os ficheiros GeoJSON seguen a RFC 7946: primeiro a lonxitude e despois a latitude, sen membro `crs`, aneis exteriores en sentido antihorario e furados en sentido horario; as posicións coincidiron con PROJ ata 2 mm.
- Exportouse un proxecto con coordenadas de terreo e comprobouse cada punto contra as súas coordenadas de cuadrícula.
- Aínda non se abriu nada disto noutros programas de GIS. Comprobe a primeira entrega co departamento antes de fiarse dela.
