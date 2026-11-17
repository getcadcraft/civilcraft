---
title: Grelhas de cotas e LiDAR
summary: Construir o terreno existente a partir de um DEM (GeoTIFF ou grelha ASCII) ou de pontos LiDAR (LAS, LAZ) — escolher a área, rarefazer os dados, escolher as classes e verificar as unidades das cotas — e devolver uma superfície como grelha de cotas GeoTIFF.
keywords: dem, dtm, grelha de cotas, geotiff, tif, grelha ascii, asc, lidar, las, laz, nuvem de pontos, classes, terreno, rarefação, nodata, raster, exportar geotiff, gis
from: c8b2d18a
---

Os dados de elevação públicos chegam de duas formas: **grelhas de cotas** (um DEM: uma cota por célula quadrada, normalmente um GeoTIFF `.tif` ou uma grelha ASCII `.asc`) e **pontos LiDAR** (milhões de retornos de laser num ficheiro `.las`, ou `.laz` quando comprimido). O CivilCraft converte qualquer um dos dois em pontos do levantamento ou numa superfície, dentro do navegador: nada é enviado.

## Abrir o ficheiro

1. Clique em {{ui:Abrir}} (ou em {{ui:Importar}} no grupo GIS) e escolha o ficheiro, ou arraste-o para a planta. Numa grelha ASCII, escolha também o respetivo ficheiro `.prj`, para que o CivilCraft conheça o sistema de coordenadas.
2. A caixa de diálogo de importação mostra o que o próprio ficheiro indica: o tamanho, as células ou os pontos, o sistema de coordenadas, a posição em latitude e longitude e o intervalo de cotas. Para LiDAR, lê primeiro todos os pontos uma vez para contar as **classes** (uma barra de progresso mostra o avanço; {{ui:Cancelar}} interrompe).

Um GeoTIFF com três ou quatro bandas (vermelho, verde, azul) é uma imagem, não cotas: vai para as camadas de mapa.

## Escolher o que importar

- **Área**: {{ui:A extensão do projeto e uma margem}} (escreva a margem), {{ui:O que a planta mostra agora}}, ou {{ui:O ficheiro inteiro}}. Só essa parte do ficheiro é lida.
- **Rarefazer para**: o espaçamento entre os pontos obtidos, nas unidades do projeto. A linha abaixo das definições mostra quantos pontos isso dá, à medida que escreve. Numa grelha, o CivilCraft mantém uma célula em cada duas, uma em cada três … de modo que as cotas se mantêm exatamente iguais às do ficheiro; nunca faz médias entre células. Para LiDAR, a área é dividida em células desse tamanho e é mantido um ponto por célula: {{ui:O ponto mais próximo do centro de cada célula}} (o predefinido), {{ui:O ponto mais baixo de cada célula}} (bom quando o ficheiro não tem classe de terreno: o terreno fica debaixo das árvores) ou {{ui:A média dos pontos de cada célula}}.
- **Classes** (LiDAR): o terreno (classe 2) fica marcado quando o ficheiro o tem; edifícios, árvores e ruído ficam de fora. Quando não há classe de terreno, todas as classes ficam marcadas, e a caixa de diálogo indica-o.
- **Terreno** (LiDAR, 0.8): uma nuvem de drone não tem classe de terreno. Quando o ficheiro não tem nenhuma, a caixa de diálogo começa em {{ui:Encontrar eu o terreno (nuvens de drone, sem classe de terreno)}}: são lidas todas as classes exceto o ruído, mantém-se o ponto mais baixo de cada célula e depois o CivilCraft retira edifícios, árvores e pontos baixos isolados com um filtro morfológico progressivo (Zhang e outros, 2003) que pode ajustar: **Maior objeto a retirar** (a largura do maior edifício; as janelas crescem até o cobrirem; 0 significa 20 células) e **Declive máximo do terreno**. O trabalho é feito sobre a grelha de pontos mais baixos, por isso uma nuvem de dezenas de milhões de pontos não custa mais do que o número de células. O espaçamento é o tamanho da célula: uma mais grossa é mais rápida e falha menos objetos pequenos do que se poderia pensar; uma mais fina mantém mais detalhe do terreno. O relatório indica quantos pontos foram mantidos como terreno, quantas células foram retiradas como objetos e quantos pontos baixos isolados foram eliminados. Num levantamento de drone fictício de 300 m com cinco edifícios, 70 árvores e 200 pontos baixos atípicos, os pontos mantidos ficaram a 3 cm do terreno real e nenhum telhado ou copa foi mantido.
- **Cotas no ficheiro**: metros, pés ou pés de agrimensura dos EUA. Quando o ficheiro o indica, a unidade já vem escolhida. Quando não indica, é preciso escolher: a caixa de diálogo mostra o intervalo de cotas nos dois sentidos, para perceber qual faz sentido no local.
- **Importar como** (só grelhas): {{ui:Pontos do levantamento (descrição DEM)}}, ou {{ui:A própria superfície (uma grelha de triângulos)}}.

Uma importação tem no máximo 500,000 pontos. Quando uma escolha daria mais, a caixa de diálogo indica em quanto e qual o espaçamento que caberia, e {{ui:Importar}} fica desativado.

Clique em {{ui:Importar}}. Uma barra de progresso mostra a leitura; {{ui:Cancelar}} interrompe-a e nada muda.

:::warning
As unidades verticais são uma armadilha comum. Muitos DEM em state plane têm as coordenadas este e norte em pés, mas as cotas em metros. Compare o intervalo que a caixa de diálogo mostra com o que conhece do local.
:::

## O que obtém

- **Pontos do levantamento**: numerados a seguir ao maior número de ponto existente, com a descrição `DEM` (grelhas) ou `LIDAR`, por isso formam um só grupo em **Pontos** e constroem a superfície como quaisquer outros pontos. Importá-los é um só passo: {{key:Mod+Z}} remove-os de novo.
- **A própria superfície**: uma TIN de grelha, dois triângulos por célula, divididos na diagonal de sudoeste para nordeste. Um triângulo com um canto sem dados fica de fora, por isso os buracos nos dados continuam a ser buracos. A superfície é igual à grelha em cada ponto da grelha e é um plano liso no interior de cada triângulo entre eles. Substitui a superfície do projeto (a caixa de diálogo pergunta primeiro); {{key:Mod+Z}} repõe a superfície anterior. O título do painel da esquerda indica **Superfície (a partir de uma grelha de cotas)**.

## Sistemas de coordenadas

- Se o projeto tiver um sistema de coordenadas e o ficheiro indicar outro, cada ponto é convertido para o sistema do projeto (e para as coordenadas do terreno ou locais, quando existirem).
- Se o projeto não tiver nenhum e o sistema do ficheiro estiver nas unidades do projeto (pés ou metros), a caixa de diálogo oferece torná-lo o sistema de coordenadas do projeto, no mesmo passo de anulação que os pontos.
- Se o ficheiro estiver em latitude e longitude, ou em metros para um projeto em pés, a caixa de diálogo pede que se escolha primeiro o sistema de coordenadas do projeto.
- Se o ficheiro não o indicar, os números são tomados como coordenadas do projeto. Em alternativa, pode escolher o sistema do ficheiro.

## Exportar uma superfície como GeoTIFF

1. Clique em {{ui:Exportar}} no grupo GIS.
2. Na parte GeoTIFF, escolha a superfície (terreno existente ou a superfície modelada) e o tamanho da célula. O predefinido vem da aresta média dos triângulos da superfície. A caixa de diálogo mostra o tamanho da grelha que será escrita.
3. Clique em {{ui:Transferir GeoTIFF}}.

O ficheiro é uma banda de cotas em vírgula flutuante de 32 bits, nas unidades do projeto, sobre a extensão da superfície; as células fora da superfície são "sem dados" (−3.4028235e38). O valor de cada célula é a cota da superfície no centro da célula. As coordenadas são coordenadas de **grelha**: um projeto em coordenadas de terreno ou locais é convertido de volta para a grelha. O ficheiro indica o sistema de coordenadas do projeto pelo seu código EPSG; um sistema sem código EPSG não é escrito, e a caixa de diálogo avisa para indicar ao departamento GIS qual é esse sistema.

## O que foi verificado

- Os leitores de GeoTIFF e de grelhas ASCII foram verificados contra o GDAL (através do rasterio), a biblioteca que a maioria dos programas GIS usa para ler estes ficheiros: grelhas de 32 bits em vírgula flutuante e de 16 bits inteiras, em mosaico e em faixas, DEFLATE e LZW, nodata, escala e deslocamento, pixel-is-point, uma grelha UTM, uma grelha state plane em pés de agrimensura dos EUA e uma grelha de latitude/longitude — todos os valores iguais.
- Os leitores LAS e LAZ foram verificados contra o laspy: LAS 1.2 e 1.4, formatos de ponto 0, 1, 3, 6, 7 e 8, com e sem sistema de coordenadas, e LAZ escrito pelo seu motor compatível com o LASzip — todos os pontos iguais.
- As coordenadas convertidas foram verificadas contra o PROJ com precisão de 1 mm.
- Os GeoTIFF exportados foram lidos de novo pelo GDAL: sistema de coordenadas, posições das células, nodata, unidades e valores iguais à superfície até 0.0001.
- Nada disto foi aberto noutros programas GIS ou CAD.

## Ainda não implementado

- Mudanças de datum vertical (modelos de geoide): as cotas são usadas como o ficheiro as tem.
- Dados de forma de onda, retornos LiDAR para além da classe, cores e intensidades.
- Várias bandas, pirâmides de resolução ou ficheiros com mais de 200 MB.
- Escrever LAS ou LAZ a partir de uma superfície ou desta ferramenta (o complemento [Nuvens de pontos](topic:point-clouds) escreve uma nuvem limpa como LAS 1.4 ou LAZ).
