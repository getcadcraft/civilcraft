---
title: Exportar dados como construídos para SIG
summary: Entregue pontos de levantamento, curvas de nível, traçados, plataformas, coletores e órgãos a um departamento de SIG municipal ou de condado como shapefiles, GeoPackage, GeoJSON ou KML, em coordenadas de grelha do sistema de coordenadas do projeto.
keywords: sig, exportar, kml, kmz, google earth, como construído, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, coletores, órgãos, redes, município, condado, grelha, solo, epsg, prj
from: bba4fea5
---

Muitos municípios e condados pedem dados como construídos em formato SIG quando um projeto é encerrado: onde foram os coletores e os órgãos, as cotas finais, o eixo da estrada. **SIG › Exportar** escreve o que o CivilCraft tem como camadas SIG, uma por tipo de objeto.

## Antes de exportar

1. Defina o sistema de coordenadas do projeto em {{ui:Coordenadas}}. Um departamento de SIG precisa de saber onde estão os números; sem sistema, os ficheiros levam os números próprios do projeto e não indicam nenhum.
2. Verifique a superfície, os traçados, as plataformas e a rede de coletores da forma como os quer entregar.
3. Pergunte ao departamento que formato e que sistema de coordenadas querem. Muitos ainda pedem shapefiles na zona state plane local; os sistemas mais recentes aceitam GeoPackage.

## Exportar

1. Clique em {{ui:Exportar}} no grupo **SIG**.
2. Em **O quê**, marque os tipos a enviar. Cada um mostra quantos elementos tem; os tipos sem nada ainda ficam a cinzento.
3. Em **Como**, escolha o formato.
4. Leia as notas sobre coordenadas e unidades e clique no botão de transferência. A linha de estado indica o que foi incluído e quaisquer nomes de campos que tenham sido encurtados.

A caixa de diálogo tem também a exportação da grelha de cotas ({{ui:Superfície como grelha de cotas GeoTIFF}}); ver [Grelhas de cotas e LiDAR](topic:elevation-grids-and-lidar).

## O que contém cada tipo

| Tipo | Forma | Campos |
|---|---|---|
| Pontos de levantamento | Pontos com cota | `P` número do ponto, `N` norte, `E` este, `Z` cota, `D` descrição |
| Curvas de nível do terreno existente e da superfície modelada | Linhas à sua cota | `ELEV` |
| Linhas de quebra | Linhas com cotas | `NAME` |
| Limite da superfície | Polígono (o limite desenhado, senão a aresta da superfície) | `NAME` |
| Traçados | Eixos | `NAME`, `LENGTH`, `STA_START`, `STA_END` (PK como números simples) |
| Plataformas | Polígonos à cota da plataforma | `NAME`, `ELEV`, `AREA` |
| Linhas de intersecção | Linhas com cotas (plataformas e corredores) | `NAME` |
| Linhas características do corredor | Linhas com cotas: eixo, bordos da faixa de rodagem, bermas | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Coletores | Linhas da geratriz superior à inferior | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (percentagem), `LENGTH`, `NETWORK` |
| Órgãos | Pontos na cota da tampa | `NAME`, `RIM`, `INVERT` (a geratriz mais baixa do coletor nesse ponto), `SUMP`, `DIA`, `DIA_UNIT` |
| Cada camada SIG | Como importada | Os seus próprios campos |

Os comprimentos, as estacas e as cotas estão nas unidades do projeto (US survey feet ou metros). Os diâmetros de coletores e órgãos estão em polegadas nos projetos em pés e em milímetros nos projetos em metros; `DIA_UNIT` indica qual.

## Os formatos

- **Shapefile**: um `.zip` com um shapefile por tipo (`.shp`, `.shx`, `.dbf`), um `.cpg` que indica que o texto é UTF-8, e um `.prj` com o nome do sistema de coordenadas. As formas com cotas são escritas como tipos Z do shapefile. Os nomes de campos com mais de 10 caracteres são encurtados, como o formato exige, e a linha de estado os lista.
- **GeoPackage**: um ficheiro `.gpkg` com uma tabela por tipo, e o sistema de coordenadas guardado com o seu código EPSG. Um só ficheiro em vez de vários, com os nomes de campos longos mantidos.
- **KML** ou **KMZ** (KML comprimido): um ficheiro de latitude e longitude para o Google Earth e mapas na web, uma pasta por tipo, e cada elemento um marcador com o nome do seu campo NAME e todos os campos como dados estendidos; alturas em metros (modo de altitude absoluto). Tal como o GeoJSON, precisa do sistema de coordenadas do projeto.
- **GeoJSON**: um ficheiro de latitude e longitude (a norma GeoJSON não permite outra coisa), com cada elemento a levar uma propriedade `kind` (`pipes`, `structures`, …) para que o destinatário os possa separar. As alturas são convertidas para metros, como a norma pede; mantêm-se no datum vertical do projeto (o CivilCraft não tem modelo de geoide). Um projeto sem sistema de coordenadas não pode exportar GeoJSON, e a caixa de diálogo indica porquê.

## Grelha, não solo

Os departamentos de SIG guardam os seus dados em coordenadas de **grelha** de um sistema de coordenadas. Se o seu projeto usar coordenadas de solo ou locais (definidas em {{ui:Coordenadas}}), cada coordenada é convertida de volta para grelha à saída: os números nos ficheiros diferem dos da planta pelo seu fator de escala (e pela rotação, num sistema local). Os campos de ponto `N` e `E` também levam os valores de grelha. A caixa de diálogo lembra isto.

:::tip
Envie uma nota curta com os ficheiros: o sistema de coordenadas e o seu código EPSG, o datum vertical das cotas, as unidades, e o que é cada ficheiro.
:::

## O que foi verificado

- Cada ficheiro escrito foi lido de novo pela GDAL, a biblioteca que a maioria dos programas SIG usa para ler estes ficheiros: cada forma, cota e atributo, as contagens de elementos e o sistema de coordenadas como código EPSG (`.prj` e GeoPackage). Os nossos próprios leitores os leem da mesma forma.
- Os ficheiros GeoJSON seguem a RFC 7946: longitude antes de latitude, sem membro `crs`, anéis exteriores no sentido anti-horário e furos no sentido horário; as posições coincidiram com o PROJ a 2 mm.
- Um projeto com coordenadas de solo foi exportado, e cada ponto foi verificado contra as suas coordenadas de grelha.
- Nada disto foi ainda aberto noutros programas SIG. Verifique a primeira entrega com o departamento antes de confiar nela.
