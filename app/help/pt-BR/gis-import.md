---
title: Importar dados GIS
summary: Traga shapefiles, GeoJSON e GeoPackages para um projeto como camadas GIS, posicione-os pelo sistema de coordenadas certo, veja seus atributos e use-os para a superfície.
keywords: gis, rótulos, rotular feições, atributos na planta, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importar, camadas, atributos, sistema de coordenadas, epsg, latitude, longitude, curvas de nível, lotes, linhas de quebra, contorno
from: f6b235cc
---

Os departamentos de GIS de municípios e condados fornecem o contexto do local em arquivos GIS: lotes, servidões, curvas de nível, utilidades, pontos de controle do levantamento. O CivilCraft abre três tipos deles como **camadas GIS** que ficam sob o seu projeto na planta.

| Arquivo | O que abrir |
|---|---|
| Shapefile | O `.shp` junto com seus `.shx`, `.dbf`, `.prj` e `.cpg` (selecione todos), ou o `.zip` de onde vieram. Um zip com vários shapefiles gera várias camadas. |
| GeoJSON | O arquivo `.geojson` (um arquivo `.json` cujas primeiras linhas digam `FeatureCollection` ou `Feature` também funciona). |
| GeoPackage | O arquivo `.gpkg`. Cada tabela de feições nele é listada. |
| KML ou KMZ | O arquivo `.kml` (do Google Earth ou de um mapa da web), ou o `.kmz` compactado. Cada pasta vira uma camada (dividida em pontos, linhas e polígonos quando tiver vários tipos); o nome, a descrição e os dados estendidos de uma marca de posição viram seus atributos. Alturas em metros e em latitude e longitude, como no GeoJSON. |

Pontos, multipontos, linhas, polígonos com furos e formas de várias partes são lidos, com suas elevações (z) quando o arquivo as tiver. Valores de medida (M) são deixados de fora. Grades de elevação e LiDAR abrem da mesma forma: veja [Grades de elevação e LiDAR](topic:elevation-grids-and-lidar).

## Abrir os arquivos

1. Clique em {{ui:Importar}} no grupo **GIS** (ou em {{ui:Abrir}}), escolha os arquivos, ou solte-os na planta. Os arquivos são lidos neste computador; nada é enviado.
2. A caixa **Importar dados GIS** lista cada camada encontrada: seu tipo, quantas feições (e quantas não têm geometria), quantos campos de atributo e o sistema de coordenadas que o arquivo indica. Desmarque as camadas que você não quer.
3. Leia a parte **Sistema de coordenadas** (abaixo) e a linha **O que vai acontecer**, depois clique em {{ui:Importar}}.
4. As camadas aparecem na planta e em **Camadas GIS** no painel esquerdo. A importação é um único passo: {{key:Mod+Z}} a desfaz.

Um arquivo grande mostra uma linha de progresso sobre a planta, com um botão {{ui:Cancelar}}.

## O sistema de coordenadas

Os arquivos GIS dizem onde estão por meio de um sistema de coordenadas (o `.prj` de um shapefile, a tabela de referência espacial de um GeoPackage; o GeoJSON é sempre latitude e longitude). O CivilCraft converte cada camada do sistema próprio para o do projeto. Ele nunca adivinha:

- **O projeto tem um sistema de coordenadas** (definido em {{ui:Coordenadas}}): cada camada com sistema próprio é convertida para ele, incluindo um ajuste de solo ou local. Um arquivo sem `.prj` recebe duas opções: **Igual ao projeto** (seus números são carregados como estão) ou **Escolher o sistema do arquivo**.
- **O projeto não tem nenhum, e o arquivo está em um sistema projetado nas unidades do projeto** (uma zona de plano estadual em pés de agrimensura dos EUA, para um projeto em pés, por exemplo): a caixa oferece **Usar esse sistema como sistema de coordenadas do projeto**. Ele é definido no mesmo passo de desfazer da importação. Nada no projeto se move; o sistema apenas diz o que os números significam. Você pode escolher outro sistema para o projeto, e as camadas são convertidas para ele.
- **O projeto não tem nenhum, e o arquivo está em latitude e longitude** (todo GeoJSON) **ou em outras unidades**: {{ui:Importar}} fica cinza até você escolher o sistema de coordenadas do projeto. O seletor começa perto dos dados.
- **Nem o projeto nem os arquivos indicam um sistema**: os números são carregados como estão, e a caixa informa isso.

As elevações também são convertidas: as alturas de GeoJSON são em metros (é o que o padrão GeoJSON define); as alturas dos outros arquivos são tomadas na unidade do sistema deles.

:::warning
Posições em um arquivo GeoJSON fora de ±180° de longitude ou ±90° de latitude não são latitude e longitude. Essas feições são deixadas de fora e a caixa informa quantas. Esse arquivo costuma ser um arquivo projetado salvo sem o sistema; peça-o novamente, ou peça o shapefile com seu `.prj`.
:::

O NAD83 é tratado como igual ao WGS 84 (o sistema que o GeoJSON usa); os dois diferem por alguns metros na América do Norte, então dados GeoJSON podem estar deslocados nessa ordem. Quando o melhor deslocamento precisa de um arquivo de grade (NADCON para NAD27, por exemplo), o CivilCraft usa um deslocamento publicado mais grosseiro, e a caixa do sistema de coordenadas mostra quão grosseiro ele é (para NAD27, cerca de 20 m), até você adicionar a grade: veja [Arquivos de deslocamento de grade](topic:coordinate-systems).

## Camadas GIS

Cada linha em **Camadas GIS** tem:

- uma caixa de seleção para mostrar ou ocultar a camada (camadas ocultas também não são selecionadas);
- sua cor, escolhida na lista;
- um menu (os três pontos) com {{ui:Zoom em}}, {{ui:Usar na superfície…}}, {{ui:Renomear…}} e {{ui:Remover}}.

Mostrar, ocultar, trocar a cor, renomear e remover são passos de desfazer. As camadas GIS são salvas no arquivo do projeto e voltam ao abri-lo. Elas também saem na plotagem em PDF da planta e nas exportações DXF e DWG, cada uma em uma camada chamada `GIS-` e seu número.

## Rotular feições a partir de um atributo

No menu {{ui:Mais}} da camada (os três pontos em **Camadas GIS**), escolha um campo em **Rotular com**: cada feição mostra seu valor na planta, na cor da camada. Pontos são rotulados ao lado do ponto, linhas ao longo do meio de sua parte mais longa (giradas para ler da esquerda para a direita), polígonos em seu centro. Números aparecem com até três casas decimais. Os rótulos têm 1.8 mm de altura no papel em qualquer escala, e vão para a plotagem em PDF, DXF e DWG. Escolha **Sem rótulos** para removê-los; cada mudança é um passo ({{key:Mod+Z}} a desfaz). Uma camada rotula no máximo 5,000 feições.

## Ver uma feição

Com {{ui:Selecionar}} ativo, clique em uma feição. **Propriedades** mostra sua camada, qual feição é, sua forma (partes, furos, vértices), suas elevações, o arquivo de origem e o sistema de coordenadas desse arquivo, depois todos os atributos em uma tabela. Atributos são somente leitura: o CivilCraft mostra os dados GIS como vieram, não os edita.

Pontos têm prioridade sobre linhas quando ambos estão sob o ponteiro; dentro de um polígono, é escolhido o menor polígono.

## Usar na superfície

Abra o menu de uma camada e escolha {{ui:Usar na superfície…}} (ou o botão em **Propriedades**). O que é oferecido depende da camada:

| Camada | Pode virar |
|---|---|
| Linhas com elevações (linhas 3D) | Linhas de quebra em suas próprias elevações |
| Linhas sem elevações, mas com um campo numérico (curvas de nível) | Linhas de quebra na elevação do campo que você escolher |
| Polígonos | O contorno da superfície (o polígono selecionado, senão o maior), ou linhas de quebra ao longo de suas bordas |
| Pontos com elevações, ou com um campo de elevação | Pontos de levantamento, descritos com o nome da camada para formar um grupo de pontos |

Cada uso é um passo de desfazer que copia a geometria para o projeto; a própria camada permanece como está. As elevações são tomadas nas unidades do projeto.

## Arquivos de pontos com latitude e longitude

Um arquivo de pontos cujo cabeçalho nomeia as colunas **latitude** e **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) é lido como graus, não como norte e leste. A caixa de importação informa isso. Em {{ui:Importar}}, os pontos são convertidos para o sistema de coordenadas do projeto; um projeto sem um pede que você o escolha antes. Graus nunca são carregados como pés. Linhas fora de ±90° de latitude ou ±180° de longitude são recusadas, com o motivo. A coluna de elevação é tomada como está, nas unidades do projeto.

## Arquivos LandXML que indicam um sistema de coordenadas

Quando um arquivo LandXML que você abre tem um elemento `CoordinateSystem` (um código EPSG, uma descrição WKT ou um nome de sistema), o CivilCraft o oferece como sistema de coordenadas do projeto. Nada se move se você aceitar; o sistema apenas diz o que os números significam.

## O que foi verificado

- Cada leitor foi comparado com o GDAL, a biblioteca que a maioria dos programas GIS usa para ler esses arquivos, em arquivos que o próprio GDAL gravou: shapefiles de todos os tipos, com e sem elevações, linhas de várias partes, polígonos com furos, geometrias vazias, atributos de texto, número, data e verdadeiro/falso, texto em UTF-8 e Windows-1252 com e sem `.cpg`, um zip de vários shapefiles, GeoJSON com todos os tipos de geometria, e um GeoPackage com quatro tabelas. Cada geometria, elevação e atributo coincidiu.
- Posições convertidas de latitude e longitude, e de UTM, coincidiram com o PROJ (a biblioteca de projeção por trás do GDAL) a 3 mm.
- Arquivos danificados (cortados, com tamanhos falsos, zips ruins, GeoPackages ruins) dão uma mensagem simples; nada trava.
- Nada disto foi aberto em outros programas GIS ainda, e geodatabases de arquivo, KML e KMZ ainda não são lidos (veja [Ainda não implementado](topic:not-built-yet)).
