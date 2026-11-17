---
title: Terreno a partir de curvas de nível
summary: Crie a superfície do terreno a partir de um mapa de curvas de nível: escolha as camadas de linhas, informe de onde vem a cota de cada linha, verifique cruzamentos e duplicatas, e construa. As curvas viram linhas de quebra, com os triângulos planos em espigões e vales corrigidos. Um mapa traçado a partir de uma imagem ou de um PDF pode ser escalado e posicionado por dois pontos conhecidos.
keywords: curvas de nível, linhas de curva de nível, terreno a partir de curvas, superfície a partir de curvas, mapa topográfico, mapa de levantamento, sem coordenadas, linhas de quebra, triângulos planos, espigão, vale, topo de morro, curvas cruzadas, curvas duplicadas, equidistância, escalar um mapa, dois pontos, posicionar um mapa, DXF, DWG, shapefile
from: e6161653
---

Um topógrafo às vezes envia um mapa de curvas de nível: linhas com cotas, mas sem pontos. O CivilCraft constrói o terreno existente a partir dessas linhas.

## Trazer as curvas

Abra o mapa como linhas: um desenho DXF ou DWG, um shapefile ou GeoJSON (**GIS** › {{ui:Importar}}, ou solte o arquivo na planta). As linhas entram como **camadas de mapa**. Em **Superfície** › {{ui:Mais}}, escolha {{ui:Terreno a partir de curvas de nível}}.

## Informar de onde vem cada cota

Marque as camadas que contêm curvas, depois escolha **Cota de**:

- {{ui:As cotas das próprias linhas}}: uma linha cujos vértices têm todos a mesma cota (uma polilinha 3D, ou uma polilinha com cota). Uma linha em 0 é desenho de planta e não tem cota.
- Um **campo numérico** da camada (por exemplo ELEV), quando o mapa veio com um.
- {{ui:Um início e um intervalo, na ordem em que as linhas estão listadas}}: para linhas sem cota nenhuma. A primeira linha listada recebe a **Cota da primeira linha**, a seguinte essa mais a **Equidistância das curvas**, e assim por diante. Liste as linhas da menor para a maior (ou reordene-as na camada).

## Verificar e depois construir

{{ui:Verificar}} lista o que está errado, em palavras, antes de qualquer alteração:

- uma linha **sem cota** ou com menos de dois pontos;
- uma linha **duplicada** (a mesma forma duas vezes, mesmo desenhada no sentido inverso);
- duas linhas que **se cruzam**, em cotas diferentes ou na mesma (uma linha que cruza a si mesma também), com o local;
- uma cota que **não está na equidistância** (um erro de digitação, como 105.5 em um mapa de 1 m).

Marque {{ui:Deixar de fora linhas que cruzam outra}} para descartar a linha que cruza a maioria das outras (depois a seguinte, até que nenhuma cruze): uma linha perdida que corta todas as curvas é a que sai, não as curvas. **Simplificar linhas dentro de** reduz os vértices que estão mais próximos de um trecho reto do que essa distância.

{{ui:Construir o terreno}} adiciona as linhas ao terreno existente como linhas de quebra (um passo de desfazer), de modo que a superfície passa por cada curva exatamente. Com {{ui:Corrigir triângulos planos em cristas, vales e topos de morro}} marcado e uma equidistância informada, o CivilCraft também adiciona um ponto dentro de cada triângulo plano (um triângulo cujos cantos estão todos sobre uma mesma curva), na altura para a qual a declividade vizinha continua, nunca a mais de meia equidistância da curva. Sem isso, os topos de espigões, os fundos de vales e os topos de morros saem como placas planas. Em um morro de teste, o erro em relação à superfície real caiu um quarto; em um espigão, caiu 40 %.

## Um mapa sem coordenadas

Para um mapa de curvas traçado a partir de uma imagem ou de um PDF, abra **Escalar e posicionar as camadas por dois pontos conhecidos**. Informe dois pontos no mapa e onde eles realmente estão; as camadas marcadas são escaladas, giradas e movidas para se ajustar (um passo de desfazer; as alturas não mudam). Os mesmos dois pontos dão a escala (mostrada na mensagem) e a rotação.

A superfície é tão boa quanto o mapa: entre duas curvas ela é um plano, então o terreno real entre elas não é conhecido. Confira o resultado com cotas pontuais antes de confiar nele.
