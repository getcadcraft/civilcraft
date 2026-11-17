---
title: Importar dados SIG
summary: Traga shapefiles, GeoJSON e GeoPackages para um projeto como camadas SIG, posicione-os pelo sistema de coordenadas certo, consulte os seus atributos e use-os para a superfície.
keywords: sig, rótulos, rotular elementos, atributos na planta, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importar, camadas, atributos, sistema de coordenadas, epsg, latitude, longitude, curvas de nível, lotes, linhas de quebra, limite
from: f6b235cc
---

Os departamentos municipais e de condado de SIG distribuem contexto do local como ficheiros SIG: lotes, servidões, curvas de nível, redes de serviços, pontos de apoio geodésico. O CivilCraft abre três tipos destes como **camadas SIG** que ficam por baixo do seu projeto na planta.

| Ficheiro | O que abrir |
|---|---|
| Shapefile | O `.shp` juntamente com o seu `.shx`, `.dbf`, `.prj` e `.cpg` (selecione-os todos), ou o `.zip` em que vieram. Um zip com vários shapefiles dá várias camadas. |
| GeoJSON | O ficheiro `.geojson` (um ficheiro `.json` cujas primeiras linhas indiquem `FeatureCollection` ou `Feature` também funciona). |
| GeoPackage | O ficheiro `.gpkg`. Cada tabela de elementos nele é listada. |
| KML ou KMZ | O ficheiro `.kml` (do Google Earth ou de um mapa na web), ou o `.kmz` comprimido. Cada pasta torna-se uma camada (dividida em pontos, linhas e polígonos quando tem vários tipos); o nome, a descrição e os dados estendidos de um marcador tornam-se os seus atributos. As alturas estão em metros e em latitude e longitude, como no GeoJSON. |

Pontos, multipontos, linhas, polígonos com furos e formas de várias partes são lidos, com as suas cotas (z) quando o ficheiro as tem. Os valores de medida (M) são deixados de fora. As grelhas de cotas e o LiDAR abrem da mesma forma: ver [Grelhas de cotas e LiDAR](topic:elevation-grids-and-lidar).

## Abrir os ficheiros

1. Clique em {{ui:Importar}} no grupo **SIG** (ou em {{ui:Abrir}}), escolha os ficheiros, ou arraste-os para a planta. Os ficheiros são lidos neste computador; nada é enviado.
2. A caixa de diálogo **Importar dados SIG** lista cada camada encontrada: o seu tipo, quantos elementos (e quantos não têm geometria), quantos campos de atributos, e o sistema de coordenadas que o ficheiro indica. Desmarque as camadas que não quer.
3. Leia a parte **Sistema de coordenadas** (abaixo) e a linha **O que vai acontecer**, e clique em {{ui:Importar}}.
4. As camadas aparecem na planta e em **Camadas SIG** no painel da esquerda. A importação é um único passo: {{key:Mod+Z}} desfaz.

Um ficheiro grande mostra uma linha de progresso sobre a planta, com um botão {{ui:Cancelar}}.

## Sistema de coordenadas

Os ficheiros SIG indicam onde estão através de um sistema de coordenadas (o `.prj` de um shapefile, a tabela de referência espacial de um GeoPackage; o GeoJSON é sempre latitude e longitude). O CivilCraft converte cada camada do seu próprio sistema para o do projeto. Nunca adivinha:

- **O projeto tem um sistema de coordenadas** (definido em {{ui:Coordenadas}}): cada camada com um sistema próprio é convertida para ele, incluindo um ajuste de solo ou local. Um ficheiro sem `.prj` tem duas opções: **Igual ao do projeto** (os seus números são carregados tal como estão) ou **Escolher o sistema do ficheiro**.
- **O projeto não tem nenhum, e o ficheiro está num sistema projetado nas unidades do projeto** (uma zona state plane em US survey feet, para um projeto em pés, por exemplo): a caixa de diálogo oferece **Usar esse sistema como sistema de coordenadas do projeto**. Fica definido no mesmo passo de anulação da importação. Nada no projeto se move; o sistema apenas indica o que os números significam. Pode escolher outro sistema para o projeto, e as camadas são então convertidas para ele.
- **O projeto não tem nenhum, e o ficheiro está em latitude e longitude** (todos os GeoJSON) **ou noutras unidades**: {{ui:Importar}} fica a cinzento até escolher o sistema de coordenadas do projeto. O seletor começa perto dos dados.
- **Nem o projeto nem os ficheiros indicam um sistema**: os números são carregados tal como estão, e a caixa de diálogo diz isso.

As cotas também são convertidas: as alturas de GeoJSON são em metros (a norma GeoJSON assim o diz); as dos outros ficheiros são tomadas na unidade do seu próprio sistema.

:::warning
As posições de um ficheiro GeoJSON fora de ±180° de longitude ou ±90° de latitude não são latitude e longitude. Esses elementos ficam de fora e a caixa de diálogo indica quantos. Normalmente, este ficheiro é um ficheiro projetado guardado sem o seu sistema; peça-o de novo, ou peça o shapefile com o seu `.prj`.
:::

O NAD83 é tratado como igual ao WGS 84 (o sistema que o GeoJSON usa); os dois diferem de alguns metros na América do Norte, pelo que os dados GeoJSON podem estar desviados nessa ordem. Quando o melhor deslocamento precisa de um ficheiro de grelha (NADCON para NAD27, por exemplo), o CivilCraft usa um deslocamento publicado mais grosseiro, e a caixa de diálogo do sistema de coordenadas mostra quão grosseiro (para NAD27, cerca de 20 m), até acrescentar a grelha: ver [Ficheiros de deslocamento de grelha](topic:coordinate-systems).

## Camadas SIG

Cada linha em **Camadas SIG** tem:

- uma caixa de verificação para mostrar ou ocultar a camada (as camadas ocultas também não são selecionadas);
- a sua cor, escolhida da lista;
- um menu (os três pontos) com {{ui:Zoom para}}, {{ui:Usar na superfície…}}, {{ui:Mudar o nome…}} e {{ui:Remover}}.

Mostrar, ocultar, mudar a cor, mudar o nome e remover são passos de anulação. As camadas SIG são guardadas no ficheiro do projeto e voltam quando o abre. Seguem também para a impressão PDF da planta e para as suas exportações DXF e DWG, cada uma numa camada chamada `GIS-` e o seu número.

## Rotular elementos a partir de um atributo

No menu {{ui:Mais}} da camada (os três pontos em **Camadas SIG**), escolha um campo em **Rotular com**: cada elemento mostra o seu valor na planta, na cor da camada. Os pontos são rotulados ao lado do ponto, as linhas ao longo do meio da sua parte mais comprida (viradas para ler da esquerda para a direita), e os polígonos no seu centro. Os números mostram até três casas decimais. Os rótulos têm 1.8 mm de altura no papel, em qualquer escala, e vão para a impressão PDF, DXF e DWG. Escolha **Sem rótulos** para os retirar; cada alteração é um passo ({{key:Mod+Z}} anula-a). Uma camada rotula no máximo 5,000 elementos.

## Ver um elemento

Com {{ui:Selecionar}} ativo, clique num elemento. **Propriedades** mostra a sua camada, qual é o elemento, a sua forma (partes, furos, vértices), as suas cotas, o ficheiro de onde veio e o sistema de coordenadas desse ficheiro, e depois todos os atributos numa tabela. Os atributos são só de leitura: o CivilCraft mostra os dados SIG tal como vieram, não os edita.

Os pontos têm prioridade sobre as linhas quando ambos estão sob o cursor; dentro de um polígono, é escolhido o polígono mais pequeno.

## Usar na superfície

Abra o menu de uma camada e escolha {{ui:Usar na superfície…}} (ou o botão em **Propriedades**). O que é oferecido depende da camada:

| Camada | Pode tornar-se |
|---|---|
| Linhas com cotas (linhas 3D) | Linhas de quebra às suas próprias cotas |
| Linhas sem cotas, mas com um campo numérico (curvas de nível) | Linhas de quebra à cota do campo que escolher |
| Polígonos | O limite da superfície (o polígono selecionado, senão o maior), ou linhas de quebra ao longo das suas arestas |
| Pontos com cotas, ou com um campo de cota | Pontos de levantamento, descritos com o nome da camada para formarem um grupo de pontos |

Cada utilização é um passo de anulação que copia a geometria para o projeto; a camada em si mantém-se como está. As cotas são tomadas nas unidades do projeto.

## Ficheiros de pontos com latitude e longitude

Um ficheiro de pontos cujo cabeçalho indica colunas de **latitude** e **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) é lido como graus, e não como norte e este. A caixa de diálogo de importação indica-o. Em {{ui:Importar}}, os pontos são convertidos para o sistema de coordenadas do projeto; um projeto sem sistema pede que o escolha primeiro. Os graus nunca são carregados como pés. As linhas fora de ±90° de latitude ou ±180° de longitude são recusadas, com o motivo. A coluna de cota é tomada tal como está, nas unidades do projeto.

## Ficheiros LandXML que indicam um sistema de coordenadas

Quando um ficheiro LandXML que abre tem um elemento `CoordinateSystem` (um código EPSG, uma descrição WKT ou um nome de sistema), o CivilCraft oferece-o como sistema de coordenadas do projeto. Nada se move se aceitar; o sistema apenas indica o que os números significam.

## O que foi verificado

- Cada leitor foi comparado com a GDAL, a biblioteca que a maioria dos programas SIG usa para ler estes ficheiros, em ficheiros que a GDAL escreveu: shapefiles de todos os tipos, com e sem cotas, linhas de várias partes, polígonos com furos, geometrias vazias, atributos de texto, número, data e verdadeiro/falso, texto UTF-8 e Windows-1252 com e sem `.cpg`, um zip de vários shapefiles, GeoJSON com todos os tipos de geometria, e um GeoPackage com quatro tabelas. Cada geometria, cota e atributo coincidiu.
- As posições convertidas a partir de latitude e longitude, e de UTM, coincidiram com o PROJ (a biblioteca de projeção por trás da GDAL) a 3 mm.
- Os ficheiros danificados (cortados, com tamanhos falsos, zips ou GeoPackages defeituosos) dão uma única mensagem simples; nada fica bloqueado.
- Nada disto foi ainda aberto noutros programas SIG, e as geodatabases de ficheiro, o KML e o KMZ ainda não são lidos (ver [Ainda não implementado](topic:not-built-yet)).
