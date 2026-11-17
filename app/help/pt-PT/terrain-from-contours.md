---
title: Terreno a partir de curvas de nível
summary: Construir a superfície do terreno a partir de um mapa de curvas de nível: escolher as camadas de linhas, indicar de onde vem a cota de cada linha, verificar cruzamentos e duplicados, e construir. As curvas tornam-se linhas de quebra, com os triângulos planos em cumeadas e vales corrigidos. Um mapa desenhado a partir de uma imagem ou de um PDF pode ser escalado e posicionado por dois pontos conhecidos.
keywords: curvas de nível, linhas de curvas de nível, terreno a partir de curvas de nível, superfície a partir de curvas de nível, mapa topográfico, mapa de levantamento, sem coordenadas, linhas de quebra, triângulos planos, cumeada, vale, cabeço, curvas que se cruzam, curvas duplicadas, equidistância, escalar um mapa, dois pontos, posicionar um mapa, DXF, DWG, shapefile
from: e6161653
---

Por vezes, um topógrafo envia um mapa de curvas de nível: linhas com cotas, mas sem pontos. O CivilCraft constrói o terreno existente a partir dessas linhas.

## Trazer as curvas

Abra o mapa como linhas: um desenho DXF ou DWG, um shapefile ou GeoJSON (**SIG** › {{ui:Importar}}, ou largue o ficheiro no plano). As linhas entram como **camadas de mapa**. Em **Superfície** › {{ui:Mais}}, escolha {{ui:Terreno a partir de curvas de nível}}.

## Indicar de onde vem cada cota

Assinale as camadas que contêm curvas e depois escolha **Cota a partir de**:

- {{ui:As cotas das próprias linhas}}: uma linha cujos vértices têm todos a mesma cota (uma polilinha 3D, ou uma polilinha com cota). Uma linha à cota 0 é uma linha de planta e não tem cota.
- Um **campo numérico** da camada (por exemplo ELEV), quando o mapa veio com um.
- {{ui:Um início e um intervalo, pela ordem em que as linhas estão listadas}}: para linhas sem qualquer cota. A primeira linha listada recebe a **Cota da primeira linha**, a seguinte essa cota mais a **Equidistância das curvas**, e assim por diante. Liste as linhas da mais baixa para a mais alta (ou reordene-as na camada).

## Verificar e construir

{{ui:Verificar}} lista o que está errado, em palavras, antes de qualquer alteração:

- uma linha **sem cota** ou com menos de dois pontos;
- uma linha **duplicada** (a mesma forma duas vezes, mesmo desenhada ao contrário);
- duas linhas que se **cruzam**, a cotas diferentes ou à mesma cota (uma linha que se cruza a si própria também), com o local;
- uma cota que **não está na equidistância** (um erro de escrita, como 105.5 num mapa de 1 m).

Assinale {{ui:Deixar de fora as linhas que cruzam outra}} para retirar a linha que cruza mais outras (depois a seguinte, até nenhuma cruzar): uma linha perdida que corta todas as curvas é a que sai, não as curvas. **Simplificar as linhas com uma tolerância de** desbasta os vértices que estão mais perto de um troço reto do que essa distância.

{{ui:Construir o terreno}} acrescenta as linhas ao terreno existente como linhas de quebra (um só passo de anular), para que a superfície passe por cada curva exatamente. Com {{ui:Corrigir triângulos planos em cumeadas, vales e cabeços}} assinalado e uma equidistância indicada, o CivilCraft também acrescenta um ponto dentro de cada triângulo plano (um triângulo cujos cantos estão todos na mesma curva), à altura a que continua o declive ao lado, nunca a mais de meia equidistância da curva. Sem isso, os topos das cumeadas, os fundos dos vales e os cabeços saem como placas planas. Num monte de teste, o erro face à superfície real desceu um quarto; numa cumeada, 40 %.

## Um mapa sem coordenadas

Para um mapa de curvas desenhado a partir de uma imagem ou de um PDF, abra **Escalar e posicionar as camadas por dois pontos conhecidos**. Indique dois pontos no mapa e onde estão realmente; as camadas assinaladas são escaladas, rodadas e deslocadas para encaixar (um só passo de anular; as alturas não são alteradas). Os mesmos dois pontos dão a escala (indicada na mensagem) e a rotação.

A superfície é tão boa quanto o mapa: entre duas curvas é um plano, por isso o terreno real entre elas não é conhecido. Verifique o resultado contra cotas pontuais antes de confiar nele.
