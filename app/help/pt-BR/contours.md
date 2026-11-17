---
title: Ler curvas de nível, cotas e declividades
summary: Definir a equidistância das curvas de nível e as curvas mestras, mostrar faixas de cota, setas de declividade e triângulos, e ler as cotas do terreno sob o ponteiro.
keywords: curvas de nível, equidistância, curvas mestras, rótulos, faixas de cota, setas de declividade, triângulos, cota de nível, análise de superfície, análise de cota, análise de declividade
from: 585e500a
---

A superfície é mostrada com curvas de nível assim que existe. Tudo neste tópico é definido em **Exibir**, no painel da esquerda. As configurações de exibição alteram apenas o que você vê (e o que você exporta); elas não são etapas de desfazer.

## Definir a equidistância das curvas de nível

1. Em **Exibir**, escolha um valor em **Curvas a cada**.
   - Em pés: 0.25, 0.5, 1, 2, 5, 10 ou 20 ft.
   - Em metros: 0.1, 0.25, 0.5, 1, 2, 5 ou 10 m.
2. Escolha **Mestras a cada**: a 2ª, a 4ª, a 5ª ou a 10ª curva.
   As curvas mestras são desenhadas mais grossas e rotuladas com a cota. Elas caem em múltiplos inteiros do espaçamento das mestras (com curvas de 1 ft e uma mestra a cada 5: 245, 250, 255 …).
3. Desligue {{ui:Rótulos das curvas de nível}} se os rótulos ficarem apertados em uma planta pequena.

Um projeto novo começa com 1 unidade e uma curva mestra a cada 5. As curvas dobram nas linhas de quebra; se elas cortarem em linha reta uma linha de drenagem ou uma crista, essa linha ainda não é uma linha de quebra (veja [Construir e refinar a superfície](topic:build-surface)).

:::note
As curvas só são desenhadas quando há no máximo 2,000 níveis entre o ponto mais baixo e o mais alto. Em um terreno com muito relevo e um intervalo muito pequeno, a planta não mostra curva nenhuma: escolha uma equidistância maior.
:::

## Suavizar as curvas de nível

As curvas são traçadas como trechos retos, um em cada triângulo da superfície, por isso fazem uma pequena quina em cada aresta de triângulo. A **suavização das curvas**, em **Exibir**, arredonda essas quinas:

- **Nenhuma (trechos retos)**: as linhas traçadas, do jeito que estão. É o que mostra um desenho novo ou mais antigo.
- **Leve**: quinas arredondadas um pouco. Uma linha nunca se desloca mais de 10% do caminho até a próxima curva, e nunca fica mais longe do seu trecho reto do que um sexto do comprimento desse trecho.
- **Forte**: uma curva fluida. Uma linha nunca se desloca mais de 25% do caminho até a próxima curva, e nunca fica mais longe do seu trecho reto do que um terço do comprimento desse trecho.

Com qualquer uma das opções, uma curva suavizada ainda cruza cada aresta de triângulo no mesmo ponto que a curva traçada, permanece dentro do triângulo que cada trecho atravessa e, por isso, nunca pode cruzar nem tocar outra curva. Onde uma curva cruza uma linha de quebra ou o contorno, ela mantém a quina viva. As linhas suavizadas são as que são plotadas e exportadas (DXF, DWG, PDF, GIS e 3D), com mais vértices do que as linhas traçadas.

A suavização altera apenas as linhas desenhadas. As cotas, os volumes, os perfis e as seções continuam sendo lidos da própria superfície. Uma curva que passa exatamente por pontos de levantamento (um ponto em 250.00 na curva 250) mantém uma pequena quina em cada um desses pontos.

## Como a superfície por trás das curvas é criada

As curvas seguem a superfície, e a superfície segue o **Método de curvas**, em **Superfície**, no painel da esquerda. O padrão, **Triangulação com interpolação linear**, une seus pontos em triângulos e mantém exatamente cada ponto e cada linha de quebra. Os outros métodos primeiro ajustam uma malha regular aos pontos (krigagem, curvatura mínima, vizinho natural, distância inversa e outros), o que dá curvas mais arredondadas entre os pontos, mas não passa exatamente por todos os pontos; o relatório da superfície, em **Superfície**, informa o quanto o resultado se afasta nos seus pontos.

**ABOS (aproximação baseada em suavização)** é um dos métodos em malha. Ele tem duas configurações próprias: **Suavidade** (0.5 no início; quanto menor, mais suave) e **Precisão** (1 no início: a superfície é trazida para dentro de 1% da amplitude de altura do terreno nos seus pontos; digite um número menor para um ajuste mais próximo). Se ele não conseguir atingir a precisão na malha que tem, o relatório da superfície informa isso: digite um **Espaçamento da malha** menor.

## Ler uma cota em qualquer lugar

Mova o ponteiro sobre a planta. A barra de status mostra:

- **E** e **N** sob o ponteiro
- **Terreno** e a cota do terreno natural ali, interpolada no triângulo sob o ponteiro
- **Terraplenado** e a cota projetada, onde uma plataforma ou um corredor alterou o terreno
- "Fora da superfície", quando o ponto está fora da superfície

Para ler um ponto de levantamento com exatidão, escolha {{ui:Selecionar}} e clique no ponto: o painel da direita mostra o número, a coordenada E, a coordenada N, a cota, a descrição e o grupo.

## Mostrar faixas de cota

1. Marque {{ui:Faixas de elevação}}.
   A superfície é preenchida com cor, do mais baixo (verde-azulado) ao mais alto (marrom-ocre). Uma legenda abaixo das caixas de seleção lista a faixa de cota de cada faixa.
2. Escolha quantas faixas em **Faixas**: 5, 8, 10 ou 12. As faixas dividem a amplitude de cotas, da mais baixa à mais alta, em intervalos iguais.

As faixas servem apenas para visualização. Elas não são exportadas para DXF nem plotadas em PDF.

## Mostrar setas de declividade

Marque {{ui:Setas de declividade}}. Uma seta curta em cada triângulo grande o bastante para comportá-la aponta no sentido da descida. Triângulos planos não recebem seta. As setas são uma verificação rápida da direção de drenagem; o valor da declividade em si ainda não é rotulado.

## Mostrar triângulos, pontos e arestas

- {{ui:Triângulos}} desenha as arestas do TIN. Ligue para verificar como a superfície conecta os pontos, especialmente ao longo das linhas de quebra e na borda externa.
- {{ui:Pontos}} desenha cada ponto de levantamento; {{ui:Rótulos dos pontos}} acrescenta o número, a cota e a descrição dele (ou menos: veja **Rótulos dos pontos** em [Configurações do CivilCraft](topic:settings)).
- {{ui:Linhas de quebra}} desenha as linhas de quebra (e o contorno) em laranja.
- {{ui:Borda da superfície}} desenha o contorno da superfície.

## Existente ou projetado

Quando uma plataforma ou um corredor terraplena sem problemas, **Superfície**, em **Exibir**, oferece {{ui:Projetado (terraplenado)}}. As curvas, as faixas e as setas passam então a mostrar a superfície terraplenada, para que você veja o terreno novo e o pé de talude ao redor dele. Volte para {{ui:Terreno natural}} para ver o levantamento.

## O que é exportado

A saída em DXF e PDF segue essas configurações: o que você desligou não é gravado, e as curvas são as da superfície exibida. As faixas de cota nunca são exportadas.
