---
title: Coordenadas de solo e locais
summary: Trabalhe em coordenadas de solo (superfície), escaladas a partir da grade por um fator de escala combinado que você digita ou calcula em um ponto, ou em uma grade de local assumida, ligada ao sistema por dois pontos de controle.
keywords: coordenadas de solo, coordenadas de superfície, grade para solo, fator de escala combinado, csf, fator combinado, fator de grade, fator de elevação, fator do nível do mar, convergência, ângulo de mapeamento, fator de escala, coordenadas assumidas, coordenadas locais, grade do local, 5000 5000, pontos de controle, localização, calibração, dois pontos, erro de fechamento
from: 3d7453de
---

Coordenadas de plano estadual e UTM são coordenadas de **grade**: uma projeção cartográfica estica ou encolhe distâncias um pouco (dezenas de partes por milhão), e quanto mais alto o local, mais uma distância medida no solo difere da distância na grade. Por isso muitos levantamentos entregam coordenadas de **solo**, escaladas para que as distâncias na planta sejam iguais às medidas no terreno, ou uma grade de local **assumida** (5000, 5000 em um ponto de controle). O CivilCraft mantém os seus números como estão e registra como eles se relacionam com a grade, para que latitude e longitude, arquivos GIS e camadas de mapa continuem caindo no lugar certo.

Abra {{ui:Coordenadas}} no grupo {{ui:GIS}}, escolha (ou mantenha) o sistema e depois selecione em **Coordenadas de grade, solo ou local**:

| Opção | Suas coordenadas são | Como se relacionam com a grade |
|---|---|---|
| {{ui:Grade}} | As do próprio sistema (o início) | Os mesmos números |
| {{ui:Solo}} | Escaladas para distâncias no solo | grade = base + fator combinado × (solo − base) |
| {{ui:Local}} | Uma grade de local assumida | Movida, girada e escalada sobre a grade por dois pontos de controle |

O que você escolher fica salvo com o projeto e é um passo de desfazer; nada se move.

## Coordenadas de solo

1. Escolha {{ui:Solo}}.
2. Digite o **Fator de escala combinado** do levantamento (por exemplo `0.99987`), ou calcule-o:
   1. Em **Calcular o fator em um ponto**, o ponto começa no meio do projeto. Escolha {{ui:Escolher um ponto na planta}} e clique no local (um clique perto de um ponto de levantamento pega esse ponto), ou digite E e N.
   2. A elevação vem da superfície ali; digite outra se precisar.
   3. Escolha {{ui:Calcular}}. O CivilCraft mostra:
      - **Fator de escala da grade k**: o quanto a projeção cartográfica estica distâncias ali.
      - **Fator de elevação**: o quanto as distâncias são menores no elipsoide do que naquela altura.
      - **Fator combinado** = k × fator de elevação: distância na grade = distância no solo × este valor.
      - **Convergência**: o ângulo entre o norte da grade e o norte verdadeiro ali (azimute geodésico = azimute da grade + convergência).
   4. Escolha o botão {{ui:Uso}} abaixo dos números para pôr o fator combinado na caixa.
3. Defina o **Ponto base**, onde as coordenadas de solo e de grade são iguais. Ele começa em 0, 0: a maioria das jurisdições que publicam coordenadas de solo escala a partir da origem, então as coordenadas de solo continuam reconhecivelmente próximas das de grade. Alguns levantamentos escalam a partir do ponto de controle do projeto: use o que o levantamento indicar.
4. Escolha {{ui:Aplicar}}.

:::warning
A elevação é tomada como altura acima do elipsoide. O CivilCraft não tem modelo de geoide; assim, onde o geoide estiver 30 m (100 ft) abaixo ou acima do elipsoide, o fator de elevação fica errado em cerca de 5 ppm. Quando o levantamento informar seu fator combinado, digite esse valor.
:::

## Coordenadas locais (assumidas)

1. Escolha {{ui:Local}}.
2. Para o **Ponto de controle 1**, digite o número do ponto do levantamento (ou escolha {{ui:Escolher}} e clique nele na planta). Suas coordenadas locais aparecem ao lado.
3. Digite seu E e N de **grade**, ou sua latitude e longitude na terceira caixa (por exemplo `30.2672, -97.7431`).
4. Faça o mesmo para o **Ponto de controle 2**, o mais distante possível do primeiro.
5. O CivilCraft mostra a **Escala** e a **Rotação** encontradas, e lembra: **Dois pontos sempre ajustam exatamente — verifique um terceiro.**
6. Informe um **Ponto de verificação** do mesmo modo. O CivilCraft mostra a distância em que o ajuste o coloca das coordenadas de grade que você digitou (seu erro de fechamento, nas unidades do projeto e em partes por milhão). Um erro de fechamento grande indica um ponto errado, um erro de digitação ou coordenadas em outra unidade.
7. Escolha {{ui:Aplicar}}.

Uma escala muito distante de 1 (além de 0.5 a 2) é recusada: verifique os pontos e suas unidades.

## O que foi verificado

- O fator de escala e a convergência coincidem com o PROJ (pyproj 3.7.1 com PROJ 9.5.1), a biblioteca de coordenadas que a maioria dos programas GIS usa, com erro de 1 parte em um bilhão em mais de 300 sistemas com projeções conformes (plano estadual, UTM, Mercator transversa, cônica conforme de Lambert), e no navegador, em um ponto escolhido na planta.
- Os passos de solo e local convertem de ida e volta com erro de 1 parte em um bilhão; dois pontos de controle devolvem a escala e a rotação com que foram feitos; um ponto de verificação 0.05 ft fora mostra um erro de fechamento de 0.05 ft.
