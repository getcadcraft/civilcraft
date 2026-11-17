---
title: Ler curvas de nível, cotas e inclinações
summary: Definir o intervalo das curvas de nível e as curvas mestras, mostrar faixas de cota, setas de inclinação e triângulos, e ler as cotas do terreno sob o cursor.
keywords: curvas de nível, intervalo das curvas, curvas mestras, etiquetas, faixas de cota, setas de inclinação, triângulos, cota pontual, análise da superfície, análise de cotas, análise de inclinações
from: 585e500a
---

A superfície é mostrada com curvas de nível assim que existe. Tudo o que está neste tópico é definido em **Visualização**, no painel esquerdo. As definições de visualização alteram apenas o que vê (e o que exporta); não são passos de anulação.

## Definir o intervalo das curvas de nível

1. Em **Visualização**, selecione um valor em **Curvas de nível a cada**.
   - Em pés: 0.25, 0.5, 1, 2, 5, 10 ou 20 ft.
   - Em metros: 0.1, 0.25, 0.5, 1, 2, 5 ou 10 m.
2. Escolha **Curvas mestras a cada**: a 2.ª, 4.ª, 5.ª ou 10.ª curva de nível.
   As curvas mestras são desenhadas com traço mais grosso e têm a respetiva cota como etiqueta. Caem em múltiplos inteiros do espaçamento das mestras (com curvas de 1 ft e uma mestra em cada 5: 245, 250, 255 …).
3. Desligue {{ui:Etiquetas das curvas de nível}} se as etiquetas sobrecarregarem uma planta pequena.

Um projeto novo começa com 1 unidade e com cada 5.ª curva de nível como mestra. As curvas de nível dobram nas linhas de quebra; se atravessarem em linha reta uma linha de escoamento ou uma cumeeira, essa linha ainda não é uma linha de quebra (veja [Construir e refinar a superfície](topic:build-surface)).

:::note
As curvas de nível só são desenhadas quando há no máximo 2,000 níveis entre o ponto mais baixo e o mais alto. Num local com muito relevo e um intervalo muito pequeno, a planta não mostra curva nenhuma: escolha um intervalo maior.
:::

## Suavizar as curvas de nível

As curvas de nível são traçadas em segmentos retos, um em cada triângulo da superfície, por isso fazem uma pequena curva em cada aresta de triângulo. **Suavização das curvas de nível** em **Visualização** arredonda essas curvas:

- **Nenhuma (segmentos retos)**: as linhas traçadas tal como são. É isto que mostra um desenho novo ou antigo.
- **Ligeira**: curvas ligeiramente arredondadas. Uma linha nunca se desloca mais de 10% do caminho em direção à curva de nível seguinte, e nunca se afasta do seu segmento reto mais de um sexto do comprimento desse segmento.
- **Forte**: uma curva fluida. Uma linha nunca se desloca mais de 25% do caminho em direção à curva de nível seguinte, e nunca se afasta do seu segmento reto mais de um terço do comprimento desse segmento.

Com qualquer das opções, uma curva de nível suavizada continua a cruzar cada aresta de triângulo no mesmo ponto que a traçada, mantém-se dentro do triângulo que cada segmento atravessa e, por isso, nunca pode cruzar ou tocar outra curva de nível. Onde uma curva de nível cruza uma linha de quebra ou o limite, mantém a sua curva acentuada. As linhas suavizadas são as que são impressas e exportadas (DXF, DWG, PDF, SIG e 3D), com mais vértices do que as linhas traçadas.

A suavização altera apenas as linhas desenhadas. Cotas, volumes, perfis longitudinais e transversais continuam a ser lidos da própria superfície. Uma curva de nível que passa exatamente por pontos topográficos (um ponto com 250.00 na curva de 250) mantém uma pequena curva acentuada em cada um desses pontos.

## Como é feita a superfície por detrás das curvas de nível

As curvas de nível seguem a superfície, e a superfície segue o **Método de traçado das curvas de nível** em **Superfície**, no painel esquerdo. A predefinição, **Triangulação com interpolação linear**, une os seus pontos em triângulos e mantém exatamente cada ponto e cada linha de quebra. Os outros métodos ajustam primeiro uma grelha regular aos pontos (kriging, curvatura mínima, vizinho natural, distância inversa e outros), o que dá curvas de nível mais arredondadas entre os pontos, mas não passa exatamente por todos os pontos; o relatório da superfície em **Superfície** indica o desvio do resultado nos seus pontos.

**ABOS (aproximação baseada em suavização)** é um dos métodos em grelha. Tem duas definições próprias: **Suavidade** (0.5 para começar; quanto mais baixo, mais suave) e **Precisão** (1 para começar: a superfície é trazida para dentro de 1% da amplitude de alturas do local nos seus pontos; escreva um número menor para um ajuste mais próximo). Se não conseguir atingir a precisão na grelha que tem, o relatório da superfície indica-o: escreva um **Espaçamento da grelha** menor.

## Ler uma cota em qualquer ponto

Mova o cursor sobre a planta. A barra de estado mostra:

- **E** e **N** sob o cursor
- **Terreno** e a cota do terreno natural nesse ponto, interpolada no triângulo sob o cursor
- **Modelado** e a cota proposta, onde uma plataforma ou um corredor alterou o terreno
- "Fora da superfície" fora da superfície

Para ler exatamente um ponto topográfico, selecione {{ui:Selecionar}} e clique no ponto: o painel direito mostra o seu número, a coordenada E, a coordenada N, a cota, a descrição e o grupo.

## Mostrar faixas de cota

1. Marque {{ui:Faixas de cota}}.
   A superfície é preenchida com cor, do mais baixo (azul-verde) ao mais alto (castanho-ocre). Uma legenda sob as caixas de verificação indica o intervalo de cotas de cada faixa.
2. Escolha quantas faixas em **Faixas**: 5, 8, 10 ou 12. As faixas dividem a amplitude, da cota mais baixa à mais alta, em passos iguais.

As faixas servem apenas para visualização. Não são exportadas para DXF nem impressas em PDF.

## Mostrar setas de inclinação

Marque {{ui:Setas de inclinação}}. Uma seta curta em cada triângulo, suficientemente grande para a conter, aponta para baixo. Os triângulos planos não têm seta. As setas servem para verificar rapidamente a direção do escoamento; o valor da inclinação ainda não é indicado com etiqueta.

## Mostrar triângulos, pontos e arestas

- {{ui:Triângulos}} desenha as arestas da TIN. Ative-o para verificar como a superfície liga os pontos, sobretudo ao longo das linhas de quebra e no exterior.
- {{ui:Pontos}} desenha cada ponto topográfico; {{ui:Etiquetas dos pontos}} acrescenta o seu número, cota e descrição (ou menos: veja **Etiquetas dos pontos** em [Definições do CivilCraft](topic:settings)).
- {{ui:Linhas de quebra}} desenha as linhas de quebra (e o limite) a laranja.
- {{ui:Limite da superfície}} desenha o contorno da superfície.

## Existente ou proposta

Quando uma plataforma ou um corredor modela o terreno sem problemas, **Superfície** em **Visualização** oferece {{ui:Proposta (modelada)}}. As curvas de nível, as faixas e as setas mostram então a superfície modelada, para que veja o novo terreno e as linhas de intersecção do talude à sua volta. Volte a {{ui:Terreno natural}} para ver o levantamento.

## O que é exportado

A saída em DXF e PDF segue estas definições: o que desativou não é escrito, e as curvas de nível são as da superfície visível. As faixas de cota nunca são exportadas.
