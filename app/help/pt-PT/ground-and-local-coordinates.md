---
title: Coordenadas de solo e locais
summary: Trabalhe em coordenadas de solo (superfície), escaladas a partir da grelha por um fator de escala combinado que escreve ou calcula num ponto, ou numa grelha de local assumida, ligada ao sistema por dois pontos de controlo.
keywords: coordenadas de solo, coordenadas de superfície, grelha para solo, fator de escala combinado, csf, fator combinado, fator de grelha, fator de cota, fator do nível do mar, convergência, ângulo de mapeamento, fator de escala, coordenadas assumidas, coordenadas locais, grelha do local, 5000 5000, pontos de controlo, localização, calibração, dois pontos, erro de fecho
from: 3d7453de
---

As coordenadas state plane e UTM são coordenadas de **grelha**: uma projeção cartográfica estica ou encolhe as distâncias um pouco (dezenas de partes por milhão), e quanto mais alto está o local, mais uma distância medida no terreno difere da distância na grelha. Muitos levantamentos entregam, por isso, coordenadas de **solo**, escaladas para que as distâncias na planta sejam iguais às medidas no terreno, ou uma grelha de local **assumida** (5000, 5000 num ponto de controlo). O CivilCraft mantém os seus números tal como estão e regista como se relacionam com a grelha, para que a latitude e longitude, os ficheiros SIG e as camadas de mapa continuem a cair no sítio certo.

Abra {{ui:Coordenadas}} no grupo {{ui:SIG}}, escolha (ou mantenha) o sistema e, depois, em **Grelha, solo ou coordenadas locais**, escolha:

| Opção | As suas coordenadas são | Como se relacionam com a grelha |
|---|---|---|
| {{ui:Cartográficas}} | As do próprio sistema (o início) | Os mesmos números |
| {{ui:Solo}} | Escaladas para distâncias no terreno | grelha = base + fator combinado × (solo − base) |
| {{ui:Locais}} | Uma grelha de local assumida | Movida, rodada e escalada para a grelha por dois pontos de controlo |

O que escolher fica guardado com o projeto e é um passo de anulação; nada se move.

## Coordenadas de solo

1. Escolha {{ui:Solo}}.
2. Escreva o **Fator de escala combinado** do levantamento (por exemplo `0.99987`), ou calcule-o:
   1. Em **Calcular o fator num ponto**, o ponto começa no meio do projeto. Escolha {{ui:Escolher um ponto na planta}} e clique no local (um clique perto de um ponto de levantamento toma esse ponto), ou escreva E e N.
   2. A cota vem da superfície nesse local; escreva outra se precisar.
   3. Escolha {{ui:Calcular}}. O CivilCraft mostra:
      - **Fator de escala da grelha k**: quanto a projeção cartográfica estica as distâncias nesse local.
      - **Fator de cota**: quanto mais curtas são as distâncias no elipsoide do que a essa altura.
      - **Fator combinado** = k × fator de cota: distância na grelha = distância no terreno × este valor.
      - **Convergência**: o ângulo entre o norte da grelha e o norte verdadeiro nesse local (azimute geodésico = azimute da grelha + convergência).
   4. Escolha o botão {{ui:Utilização}} sob os números para colocar o fator combinado na caixa.
3. Defina o **Ponto base**, onde as coordenadas de solo e da grelha são iguais. Começa em 0, 0: a maioria das jurisdições que publica coordenadas de solo escala a partir da origem, pelo que estas continuam reconhecivelmente próximas das da grelha. Alguns levantamentos escalam a partir do ponto de controlo do projeto: use o que o levantamento indicar.
4. Escolha {{ui:Aplicar}}.

:::warning
A cota é tomada como altura acima do elipsoide. O CivilCraft não tem modelo de geoide, pelo que, onde o geoide está 30 m (100 ft) abaixo ou acima do elipsoide, o fator de cota fica errado em cerca de 5 ppm. Quando o levantamento indica o seu fator combinado, escreva esse.
:::

## Coordenadas locais (assumidas)

1. Escolha {{ui:Locais}}.
2. Em **Ponto de controlo 1**, escreva o número do ponto de levantamento (ou escolha {{ui:Escolher}} e clique nele na planta). As suas coordenadas locais aparecem ao lado.
3. Escreva as suas E e N da **grelha**, ou a sua latitude e longitude na terceira caixa (por exemplo `30.2672, -97.7431`).
4. Faça o mesmo para o **Ponto de controlo 2**, o mais longe possível do primeiro.
5. O CivilCraft mostra a **Escala** e a **Rotação** encontradas, e lembra: **Dois pontos encaixam sempre exatamente — verifique um terceiro.**
6. Indique um **Ponto de verificação** da mesma forma. O CivilCraft mostra a que distância o ajuste o coloca das coordenadas de grelha que escreveu (o seu erro de fecho, nas unidades do projeto e em partes por milhão). Um erro de fecho grande significa um ponto errado, um erro de escrita, ou coordenadas noutra unidade.
7. Escolha {{ui:Aplicar}}.

Uma escala muito longe de 1 (além de 0.5 a 2) é recusada: verifique os pontos e as suas unidades.

## O que foi verificado

- O fator de escala e a convergência coincidem com o PROJ (pyproj 3.7.1 com PROJ 9.5.1), a biblioteca de coordenadas que a maioria dos programas SIG usa, até 1 parte em mil milhões, em mais de 300 sistemas com projeções conformes (state plane, UTM, Mercator transversa, cónica conforme de Lambert), e no navegador, num ponto escolhido na planta.
- Os passos de solo e locais convertem-se de um lado para o outro até 1 parte em mil milhões; dois pontos de controlo devolvem a escala e a rotação com que foram feitos; um ponto de verificação a 0.05 ft de distância mostra um erro de fecho de 0.05 ft.
