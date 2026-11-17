---
title: Exportar dados as-built para GIS
summary: Entregue pontos de levantamento, curvas de nível, alinhamentos, plataformas, tubulações e estruturas a um departamento de GIS municipal ou do condado, como shapefiles, GeoPackage, GeoJSON ou KML, nas coordenadas de grade do sistema de coordenadas do projeto.
keywords: gis, exportar, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, tubulações, estruturas, utilidades, município, condado, grade, solo, epsg, prj
from: bba4fea5
---

Muitos municípios e condados pedem dados as-built em formato GIS quando um projeto é encerrado: onde foram as tubulações e as estruturas, as cotas finais, o eixo da via. **GIS › Exportar** grava o que o CivilCraft tem como camadas GIS, uma para cada tipo de objeto.

## Antes de exportar

1. Defina o sistema de coordenadas do projeto em {{ui:Coordenadas}}. Um departamento de GIS precisa saber onde estão os números; sem um sistema, os arquivos carregam os números próprios do projeto e não nomeiam nenhum.
2. Confira a superfície, os alinhamentos, as plataformas e a rede de tubulações do jeito que você quer entregá-los.
3. Pergunte ao departamento qual formato e qual sistema de coordenadas eles querem. Muitos ainda pedem shapefiles na zona de plano estadual local; sistemas mais novos aceitam GeoPackage.

## Exportar

1. Clique em {{ui:Exportar}} no grupo **GIS**.
2. Em **O quê**, marque os tipos a enviar. Cada um mostra quantas feições tem; tipos sem nada ainda ficam desativados.
3. Em **Formato**, escolha o formato.
4. Leia as notas sobre coordenadas e unidades e clique no botão de baixar. A linha de status informa o que foi incluído e quais nomes de campos foram abreviados.

A caixa também tem a exportação da grade de elevação ({{ui:Superfície como grade de elevação GeoTIFF}}); veja [Grades de elevação e LiDAR](topic:elevation-grids-and-lidar).

## O que cada tipo contém

| Tipo | Forma | Campos |
|---|---|---|
| Pontos de levantamento | Pontos com elevação | `P` número do ponto, `N` norte, `E` leste, `Z` elevação, `D` descrição |
| Curvas de nível do terreno natural e da superfície terraplenada | Linhas em sua elevação | `ELEV` |
| Linhas de quebra | Linhas com elevações | `NAME` |
| Contorno da superfície | Polígono (o contorno desenhado, senão a borda da superfície) | `NAME` |
| Alinhamentos | Eixos | `NAME`, `LENGTH`, `STA_START`, `STA_END` (estacas como números simples) |
| Plataformas | Polígonos na elevação da plataforma | `NAME`, `ELEV`, `AREA` |
| Linhas de pé de talude | Linhas com elevações (plataformas e corredores) | `NAME` |
| Linhas de feição do corredor | Linhas com elevações: eixo, bordos da pista, acostamentos | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Tubulações | Linhas da cota de fundo superior à inferior | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (percentual), `LENGTH`, `NETWORK` |
| Estruturas | Pontos na borda | `NAME`, `RIM`, `INVERT` (a menor cota de fundo de tubulação ali), `SUMP`, `DIA`, `DIA_UNIT` |
| Cada camada GIS | Como importada | Seus próprios campos |

Comprimentos, estacas e elevações estão nas unidades do projeto (pés de agrimensura dos EUA ou metros). Os diâmetros de tubulações e estruturas estão em polegadas para projetos em pés e em milímetros para projetos em metros; `DIA_UNIT` indica qual.

## Os formatos

- **Shapefile**: um `.zip` com um shapefile para cada tipo (`.shp`, `.shx`, `.dbf`), um `.cpg` indicando que o texto é UTF-8 e um `.prj` que nomeia o sistema de coordenadas. Formas com elevações são gravadas como tipos Z do shapefile. Nomes de campos com mais de 10 caracteres são abreviados, como o formato exige, e a linha de status os lista.
- **GeoPackage**: um arquivo `.gpkg` com uma tabela para cada tipo, e o sistema de coordenadas guardado com seu código EPSG. Um arquivo em vez de vários, com nomes de campos longos mantidos.
- **KML** ou **KMZ** (KML compactado): um arquivo de latitude e longitude para Google Earth e mapas da web, uma pasta para cada tipo, cada feição uma marca de posição nomeada pelo campo NAME, com todos os campos como dados estendidos; alturas em metros (modo de altitude absoluta). Assim como o GeoJSON, precisa do sistema de coordenadas do projeto.
- **GeoJSON**: um arquivo de latitude e longitude (o padrão GeoJSON não permite outra coisa), com cada feição levando uma propriedade `kind` (`pipes`, `structures`, …) para que quem recebe possa separá-las. As alturas são convertidas para metros, como o padrão exige; elas continuam no datum vertical do seu projeto (o CivilCraft não tem modelo de geoide). Um projeto sem sistema de coordenadas não pode exportar GeoJSON, e a caixa informa o motivo.

## Grade, e não solo

Os departamentos de GIS mantêm seus dados em coordenadas de **grade** de um sistema de coordenadas. Se o seu projeto usa coordenadas de solo ou locais (definidas em {{ui:Coordenadas}}), cada coordenada é convertida de volta para grade na saída: os números nos arquivos diferem dos da planta pelo seu fator de escala (e pela rotação, para um sistema local). Os campos de ponto `N` e `E` também levam os valores de grade. A caixa lembra isso.

:::tip
Envie uma nota curta com os arquivos: o sistema de coordenadas e seu código EPSG, o datum vertical das suas elevações, as unidades e o que cada arquivo é.
:::

## O que foi verificado

- Cada arquivo gravado foi relido pelo GDAL, a biblioteca que a maioria dos programas GIS usa para ler esses arquivos: cada forma, elevação e atributo, as contagens de feições e o sistema de coordenadas como código EPSG (`.prj` e GeoPackage). Nossos próprios leitores também os leram de volta da mesma forma.
- Os arquivos GeoJSON seguem a RFC 7946: longitude antes de latitude, sem membro `crs`, anéis externos em sentido anti-horário e furos em sentido horário; as posições coincidiram com o PROJ a 2 mm.
- Um projeto com coordenadas de solo foi exportado e cada ponto foi conferido contra suas coordenadas de grade.
- Nada disto foi aberto em outros programas GIS ainda. Confirme a primeira entrega com o departamento antes de depender dela.
