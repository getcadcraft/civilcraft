---
title: Grades de elevação e LiDAR
summary: Monte o terreno existente a partir de um DEM (GeoTIFF ou grade ASCII) ou de pontos LiDAR (LAS, LAZ): escolha a área, reduza a densidade dos dados, escolha as classes e confira as unidades de elevação, e devolva uma superfície como uma grade de elevação GeoTIFF.
keywords: dem, dtm, grade de elevação, geotiff, tif, grade ascii, asc, lidar, las, laz, nuvem de pontos, classes, terreno, redução de densidade, nodata, raster, exportar geotiff, gis
from: c8b2d18a
---

Os dados públicos de elevação chegam de duas formas: **grades de elevação** (um DEM: uma elevação por célula quadrada, geralmente um GeoTIFF `.tif` ou uma grade ASCII `.asc`) e **pontos LiDAR** (milhões de retornos de laser em um arquivo `.las`, ou `.laz` quando compactado). O CivilCraft transforma qualquer um dos dois em pontos de levantamento ou em uma superfície, dentro do navegador: nada é enviado.

## Abrir o arquivo

1. Clique em {{ui:Abrir}} (ou em {{ui:Importar}} no grupo GIS) e escolha o arquivo, ou arraste-o para a planta. Para uma grade ASCII, escolha também o arquivo `.prj`, para que o CivilCraft conheça o sistema de coordenadas dela.
2. A caixa de diálogo de importação mostra o que o arquivo informa sobre si mesmo: o tamanho, as células ou pontos, o sistema de coordenadas, onde ele está em latitude e longitude e a faixa de elevação. No caso do LiDAR, ele primeiro lê cada ponto uma vez para contar as **classes** (uma barra de progresso mostra o andamento; {{ui:Cancelar}} o interrompe).

Um GeoTIFF com três ou quatro bandas (vermelho, verde, azul) é uma imagem, não elevações: ele vai para as camadas de mapa.

## Escolha o que importar

- **Área**: {{ui:A extensão do projeto e uma margem}} (digite a margem), {{ui:O que a planta mostra agora}} ou {{ui:O arquivo inteiro}}. Somente essa parte do arquivo é lida.
- **Reduzir para**: o espaçamento entre os pontos que você obtém, nas unidades do projeto. A linha abaixo das configurações mostra quantos pontos isso resulta conforme você digita. Para uma grade, o CivilCraft mantém a cada segunda, terceira … célula, de modo que as elevações continuam exatamente as do arquivo; ele nunca calcula médias entre células. Para LiDAR, a área é dividida em quadrados desse tamanho e é mantido um ponto por quadrado: {{ui:O ponto mais próximo do centro de cada célula}} (o padrão), {{ui:O ponto mais baixo de cada célula}} (bom quando o arquivo não tem classe de terreno: o terreno fica sob as árvores) ou {{ui:A média dos pontos de cada célula}}.
- **Classes** (LiDAR): o terreno (classe 2) fica marcado quando o arquivo o tem; edificações, árvores e ruído ficam de fora. Quando não há classe de terreno, todas as classes ficam marcadas, e a caixa de diálogo informa isso.
- **Terreno** (LiDAR, 0.8): uma nuvem de drone não tem classe de terreno. Quando o arquivo não tem nenhuma, a caixa de diálogo começa em {{ui:Encontrar o terreno eu mesmo (nuvens de drone, sem classe de terreno)}}: são lidas todas as classes, exceto ruído, mantém-se o ponto mais baixo de cada célula, e depois o CivilCraft remove edificações, árvores e pontos baixos isolados com um filtro morfológico progressivo (Zhang e outros, 2003) que você pode ajustar: **Maior objeto a remover** (a largura da maior edificação; as janelas crescem até cobri-la; 0 significa 20 células) e **Maior declividade do terreno**. O trabalho é feito sobre a grade de pontos mais baixos, então uma nuvem de dezenas de milhões de pontos custa não mais do que o número de células dela (a redução de densidade é uma única passagem em fluxo contínuo). O espaçamento é a célula: um mais grosso é mais rápido e perde pequenos objetos menos do que se poderia esperar, um mais fino mantém mais detalhes do terreno. O relatório informa quantos pontos foram mantidos como terreno, quantas células foram removidas como objetos e quantos pontos baixos isolados foram descartados. Em um levantamento de drone simulado de 300 m, com cinco edificações, 70 árvores e 200 valores atípicos baixos, os pontos mantidos ficaram a 3 cm do terreno real, e nenhum telhado ou copa foi mantido.
- **Elevações no arquivo**: metros, pés ou pés de levantamento dos EUA. Quando o arquivo informa, a unidade já está escolhida. Quando não informa, você deve escolher: a caixa de diálogo mostra a faixa de elevação nas duas opções para que você possa ver qual faz sentido para o local.
- **Importar como** (somente grades): {{ui:Pontos de levantamento (descrição DEM)}}, ou {{ui:A própria superfície (uma grade de triângulos)}}.

Uma importação aceita no máximo 500,000 pontos. Quando uma escolha resultaria em mais, a caixa de diálogo informa em quanto e qual espaçamento caberia, e {{ui:Importar}} permanece desativado.

Clique em {{ui:Importar}}. Uma barra de progresso mostra a leitura; {{ui:Cancelar}} a interrompe e nada muda.

:::warning
As unidades verticais são uma armadilha comum. Muitos DEMs em State Plane têm leste e norte em pés, mas elevações em metros. Confira a faixa que a caixa de diálogo mostra com o que você sabe sobre o local.
:::

## O que você obtém

- **Pontos de levantamento**: numerados a partir do seu maior número de ponto, com a descrição `DEM` (grades) ou `LIDAR`, de modo que formam um único grupo de pontos em **Pontos** e criam a superfície como qualquer outro ponto. Importá-los é uma única etapa: {{key:Mod+Z}} os remove novamente.
- **A própria superfície**: uma TIN em grade, dois triângulos por célula, divididos na diagonal sudoeste-nordeste. Um triângulo com um canto sem dados é deixado de fora, de modo que os vazios nos dados continuam vazios. A superfície é igual à grade em cada ponto da grade e é um plano liso dentro de cada triângulo entre eles. Ela substitui a superfície do projeto (a caixa de diálogo pergunta antes); {{key:Mod+Z}} restaura a superfície anterior. O cabeçalho do painel esquerdo diz **Superfície (a partir de uma grade de elevação)**.

## Sistemas de coordenadas

- Se o projeto tem um sistema de coordenadas e o arquivo indica outro, cada ponto é convertido para o sistema do projeto (e para suas coordenadas de terreno ou locais, quando as tiver).
- Se o projeto não tem nenhum e o sistema do arquivo está nas unidades do projeto (pés ou metros), a caixa de diálogo oferece torná-lo o sistema de coordenadas do projeto, na mesma etapa de desfazer dos pontos.
- Se o arquivo estiver em latitude e longitude, ou em metros para um projeto em pés, a caixa de diálogo pede que você escolha antes o sistema de coordenadas do projeto.
- Se o arquivo não informar, seus números são tomados como as coordenadas do projeto. Você pode escolher o sistema do arquivo.

## Exportar uma superfície como GeoTIFF

1. Clique em {{ui:Exportar}} no grupo GIS.
2. Na parte GeoTIFF, escolha a superfície (terreno existente ou a superfície terraplenada) e o tamanho da célula. O padrão vem da média das arestas dos triângulos da superfície. A caixa de diálogo mostra o tamanho da grade que será gravada.
3. Clique em {{ui:Baixar GeoTIFF}}.

O arquivo é uma banda de elevações em ponto flutuante de 32 bits nas unidades do projeto, sobre a extensão da superfície; células fora da superfície são "sem dados" (−3.4028235e38). O valor de cada célula é a elevação da superfície no centro dela. As coordenadas são **de grade**: um projeto em coordenadas de terreno ou locais é convertido de volta para a grade. O arquivo indica o sistema de coordenadas do projeto pelo código EPSG; um sistema sem código EPSG não é gravado, e a caixa de diálogo avisa para informar ao departamento de GIS qual sistema é esse.

## O que foi verificado

- Os leitores de GeoTIFF e de grade ASCII foram verificados com o GDAL (por meio do rasterio), a biblioteca que a maioria dos programas GIS usa para ler esses arquivos: grades de ponto flutuante de 32 bits e de inteiros de 16 bits, em blocos (tiled) e em faixas (stripped), DEFLATE e LZW, nodata, escala e deslocamento, pixel-is-point, uma grade UTM, uma grade State Plane em pés de levantamento dos EUA e uma grade de latitude/longitude — todos os valores iguais.
- Os leitores de LAS e LAZ foram verificados com o laspy: LAS 1.2 e 1.4, formatos de ponto 0, 1, 3, 6, 7 e 8, com e sem sistema de coordenadas, e LAZ gravado pelo backend compatível com LASzip — todos os pontos iguais.
- As coordenadas convertidas foram verificadas com o PROJ até 1 mm.
- Os GeoTIFFs exportados foram relidos pelo GDAL: sistema de coordenadas, posições das células, nodata, unidades e valores iguais à superfície até 0.0001.
- Nada disto foi aberto em outros programas GIS ou CAD.

## Ainda não implementado

- Mudanças de datum vertical (modelos de geoide): as elevações são usadas como o arquivo as tem.
- Dados de forma de onda, retornos LiDAR além de classe, cores e intensidades.
- Várias bandas, visões gerais (overviews) ou arquivos acima de 200 MB.
- Gravar LAS ou LAZ a partir de uma superfície ou desta ferramenta (o complemento [Nuvens de pontos](topic:point-clouds) grava uma nuvem limpa como LAS 1.4 ou LAZ).
